import asyncio
import json
import logging
import threading

from django.http import JsonResponse, Http404
from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from app import constants
from .encryption import encrypt_for_user
from .models import MirrorAnalysis
from .processor import process_patient_data

log = logging.getLogger(__name__)


def index(request):
    """Main mirror page with privacy notice and upload interface"""
    if not constants.MIRROR_ENABLED:
        raise Http404("Mirror endpoint is disabled")
    return render(request, 'mirror/index.html')


@csrf_exempt
@require_http_methods(["POST"])
def process_data(request):
    log.info('got user data')
    """Accept JSON file and start async processing"""
    if not constants.MIRROR_ENABLED:
        return JsonResponse({'status': 'error', 'message': 'Mirror endpoint is disabled'}, status=404)

    try:
        data = json.loads(request.body)
        person_name = data.get('person_name', 'Anonymous')
        chat_data = data.get('chat', [])
        keypair = data.get('keypair')

        if not keypair:
            log.error(f'no keypair provided, {keypair}')
            return JsonResponse({'status': 'error', 'message': 'Keypair is required'}, status=400)

        # Create analysis record
        analysis = MirrorAnalysis.objects.create(person_name=person_name, keypair=keypair)

        # Start processing thread with chat data and keypair
        thread = threading.Thread(target=run_async_processing, args=(str(analysis.id), chat_data))
        thread.daemon = True
        thread.start()

        # Return success with UUID immediately
        return JsonResponse(
            {
                'status': 'success',
                'message': 'File accepted and processing started',
                'uuid': str(analysis.id),
                'url': f'/mirror/insights/{analysis.id}/',
            }
        )

    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)
    except Exception as e:
        log.error(f"Error accepting data: {e}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


def export_guide(request):
    """Display Telegram export guide page"""
    if not constants.MIRROR_ENABLED:
        raise Http404("Mirror endpoint is disabled")
    return render(request, 'mirror/export_guide.html')


@csrf_exempt
@require_http_methods(["POST"])
def save_insights(request):
    """Save insights to session storage (for demo purposes)"""
    if not constants.MIRROR_ENABLED:
        return JsonResponse({'status': 'error', 'message': 'Mirror endpoint is disabled'}, status=404)

    try:
        data = json.loads(request.body)
        insights = data.get('insights', {})

        # In a real implementation, you might save to database
        # For now, we'll just return success
        return JsonResponse({'status': 'success', 'message': 'Insights saved successfully'})

    except Exception as e:
        log.error(f"Error saving insights: {e}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


def insights_view(request, uuid):
    try:
        log.info(f"req insights for {uuid}")
        analysis = get_object_or_404(MirrorAnalysis, id=uuid)

        context = {
            'uuid': str(uuid),
            'status': analysis.status,
            'insights': analysis.insights if analysis.status == 'completed' else None,
            'keypair': analysis.keypair,
            'error_message': analysis.error_message if analysis.status == 'error' else None,
        }

        return JsonResponse(context)

    except Exception as e:
        log.exception('error')
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


def run_async_processing(analysis_id, chat_data):
    """Run async processing in background thread"""
    try:
        log.info(f"Starting async processing for {analysis_id}")
        # Create new event loop for this thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            # Get analysis from database
            analysis = MirrorAnalysis.objects.get(id=analysis_id)

            # Process the chat data
            if constants.DEV_DEBUG and False:
                result = {'result': 'ok', 'text': 'smth'}
            else:
                result = loop.run_until_complete(process_patient_data(chat_data, analysis.person_name))

            log.info(f"Got response from openai for {analysis_id}")

            if 'error' in result:
                analysis.mark_error(result['error'])
            else:
                encrypted_insights = encrypt_for_user(json.dumps(result).encode('utf-8'), analysis.keypair['pk'])
                analysis.mark_completed(encrypted_insights)
        finally:
            loop.close()

    except Exception as e:
        log.error(f"Error in async processing for {analysis_id}: {e}")
        try:
            analysis = MirrorAnalysis.objects.get(id=analysis_id)
            analysis.mark_error(str(e))
        except:
            pass  # Analysis might not exist anymore
