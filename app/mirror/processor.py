import json
import logging
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any

from openai import AsyncOpenAI
from openai.types.chat import ChatCompletionSystemMessageParam
from openai.types.shared_params import ResponseFormatJSONSchema

from .schemas import MirrorAnalysisSchema, TimelineAnalysisSchema, TimelinePeriodSchema

# Set up OpenAI API key from environment
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable not set")

# Initialize OpenAI client
client = AsyncOpenAI(api_key=api_key)

# Constants for chunk processing
LARGE_FILE_THRESHOLD = 25000  # 50k messages
CHUNK_SIZE = 20000  # Process 20k messages per chunk

log = logging.getLogger(__name__)


async def call_gpt_api(chat_data: List[Dict[str, Any]], person_name: str, language: str = 'ru') -> Dict[str, Any]:
    """Call GPT API to analyze patient data using structured output"""
    try:
        # Prepare the data for analysis
        chat_text = "\n".join([f"{msg.get('sender', 'User')}: {msg.get('text', '')}" for msg in chat_data])

        # Extract conversation examples (up to 20)
        conversation_examples = []
        for msg in chat_data[:20]:
            if msg.get('text', '').strip():
                conversation_examples.append(
                    {'sender': msg.get('sender', 'User'), 'text': msg.get('text', ''), 'date': msg.get('date', '')}
                )

        # Create the system prompt based on language
        if language == 'en':
            system_prompt = """You are a brilliant, insightful, and slightly provocative psychologist who sees through people's facades. 

Your job is to provide a DEEP, BOLD, and HONEST psychological analysis that cuts through the surface and reveals what's really going on. Be insightful, be direct, be compassionate but don't sugarcoat.

IMPORTANT: Provide LOTS of specific examples and detailed justifications for your insights. Don't just state conclusions - explain WHY you think this, give concrete examples from their communication, and provide evidence for your psychological observations.

Analyze their communication patterns and provide comprehensive psychological insights that cover:
- Their true personality beneath the surface (with specific examples of behavior)
- How they really communicate and what it reveals about them (with actual phrases and patterns)
- Their emotional landscape and what's driving their behavior (with evidence from their words)
- Their relationship dance - how they connect and disconnect (with specific interaction examples)
- Their core patterns, triggers, and coping mechanisms (with detailed explanations)
- Specific therapy goals and growth areas (with clear reasoning)
- Practical, actionable recommendations (with step-by-step guidance)
- Real examples of how they talk and behave (with exact quotes and situations)

For EVERY insight you provide, give:
1. The observation/conclusion
2. WHY you think this (evidence from their communication)
3. Specific examples or quotes that support your analysis
4. How this pattern shows up in their behavior

Be thorough, insightful, and provide deep psychological insights with abundant examples. Write everything in English and refer to the person in THIRD PERSON (using their name or pronouns he/she/they, never "you" or "I").

IMPORTANT FORMATTING: When providing lists, use ONLY clean text without numbers, bullets, or other formatting symbols. Just provide clean, descriptive text for each item.

Don't be afraid to be bold and direct - this is about real psychological insight, not surface-level observations. But always back up your insights with concrete evidence from their communication."""
        else:  # Russian (default)
            system_prompt = """Вы - блестящий, проницательный и слегка провокационный психолог, который видит сквозь людские фасады.

Ваша задача - предоставить ГЛУБОКИЙ, СМЕЛЫЙ и ЧЕСТНЫЙ психологический анализ, который проникает сквозь поверхность и раскрывает, что на самом деле происходит. Будьте проницательными, прямыми, сострадательными, но не приукрашивайте.

ВАЖНО: Предоставляйте МНОГО конкретных примеров и подробных обоснований для ваших инсайтов. Не просто констатируйте выводы - объясняйте ПОЧЕМУ вы так думаете, приводите конкретные примеры из их общения и предоставляйте доказательства для ваших психологических наблюдений.

Анализируйте их коммуникативные паттерны и предоставляйте всесторонние психологические инсайты, которые охватывают:
- Их истинную личность под поверхностью (с конкретными примерами поведения)
- Как они действительно общаются и что это раскрывает о них (с реальными фразами и паттернами)
- Их эмоциональный ландшафт и что движет их поведением (с доказательствами из их слов)
- Их танец отношений - как они соединяются и разъединяются (с конкретными примерами взаимодействий)
- Их основные паттерны, триггеры и механизмы совладания (с подробными объяснениями)
- Конкретные терапевтические цели и области роста (с четким обоснованием)
- Практические, действенные рекомендации (с пошаговым руководством)
- Реальные примеры того, как они говорят и ведут себя (с точными цитатами и ситуациями)

Для КАЖДОГО инсайта, который вы предоставляете, давайте:
1. Наблюдение/вывод
2. ПОЧЕМУ вы так думаете (доказательства из их общения)
3. Конкретные примеры или цитаты, которые поддерживают ваш анализ
4. Как этот паттерн проявляется в их поведении

Будьте тщательными, проницательными и предоставляйте глубокие психологические инсайты с обилием примеров. Пишите все на русском языке и обращайтесь к человеку в ТРЕТЬЕМ ЛИЦЕ (используя их имя или местоимения он/она/они, никогда "вы" или "я").

ВАЖНОЕ ФОРМАТИРОВАНИЕ: При предоставлении списков используйте ТОЛЬКО чистый текст без номеров, маркеров или других символов форматирования. Просто предоставляйте чистый, описательный текст для каждого пункта.

Не бойтесь быть смелыми и прямыми - это о реальном психологическом понимании, а не о поверхностных наблюдениях. Но всегда подкрепляйте ваши инсайты конкретными доказательствами из их общения."""

        # Create the user prompt based on language
        if language == 'en':
            user_prompt = f"""Based on this data, provide a detailed analysis in the following JSON format:

Person Name: {person_name}

Chat Messages:
{chat_text}

Give me a DEEP, INSIGHTFUL, and BOLD psychological analysis that reveals what's really going on with this person. 

CRITICAL REQUIREMENTS:
- Provide LOTS of specific examples and quotes from their communication
- Explain WHY you think each insight is true (give evidence)
- Include detailed justifications for your psychological observations
- Use actual phrases and patterns from their messages as evidence
- Give concrete examples of how their patterns manifest in behavior
- Provide step-by-step reasoning for your conclusions

Don't just describe what you see - dig deeper and tell me what's driving their behavior, what patterns they're stuck in, and what they need to work on. But ALWAYS back up your insights with concrete evidence from their actual communication.

Be honest, be direct, be compassionate but real. This is about genuine psychological insight with solid evidence, not surface-level observations."""
        else:  # Russian (default)
            user_prompt = f"""На основе этих данных предоставьте подробный анализ в следующем JSON формате:

Имя человека: {person_name}

Сообщения чата:
{chat_text}

Дайте мне ГЛУБОКИЙ, ПРОНИЦАТЕЛЬНЫЙ и СМЕЛЫЙ психологический анализ, который раскрывает, что на самом деле происходит с этим человеком.

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ:
- Предоставляйте МНОГО конкретных примеров и цитат из их общения
- Объясняйте ПОЧЕМУ вы считаете каждый инсайт истинным (приводите доказательства)
- Включайте подробные обоснования для ваших психологических наблюдений
- Используйте реальные фразы и паттерны из их сообщений как доказательства
- Приводите конкретные примеры того, как их паттерны проявляются в поведении
- Предоставляйте пошаговое обоснование для ваших выводов

Не просто описывайте то, что вы видите - копайте глубже и расскажите, что движет их поведением, в каких паттернах они застряли, и над чем им нужно работать. Но ВСЕГДА подкрепляйте ваши инсайты конкретными доказательствами из их реального общения.

Будьте честными, прямыми, сострадательными, но реальными. Это о подлинном психологическом понимании с твердыми доказательствами, а не о поверхностных наблюдениях."""

        # Make the API call with structured output
        response = await client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                ChatCompletionSystemMessageParam(role="system", content=system_prompt),
                {"role": "user", "content": user_prompt},
            ],
            response_format=ResponseFormatJSONSchema(
                json_schema=MirrorAnalysisSchema.json_schema(), type='json_schema'
            ),
            temperature=0.7,
        )

        content = response.choices[0].message.content
        if not content:
            return {"error": "Empty response from GPT"}

        # Parse the structured JSON response
        result_data = json.loads(content)

        # Validate with Pydantic
        analysis = MirrorAnalysisSchema.model_validate(result_data)

        # Convert back to dict and add conversation examples
        result = analysis.model_dump()
        result['actual_chat_examples'] = conversation_examples

        # Clean up all list fields to remove mixed numbering/bullets
        # List fields are already properly formatted by GPT API

        log.info(f"Successfully generated analysis with {len(result)} fields")
        return result

    except Exception as e:
        log.info(f"Error calling GPT API: {e}")
        log.exception("Exception in call_gpt_api")
        return {"error": f"GPT API Error: {str(e)}"}


async def call_gpt_api_timeline_period(
    chat_data: List[Dict[str, Any]],
    person_name: str,
    period_name: str,
    start_date: str,
    end_date: str,
    language: str = 'ru',
) -> Dict[str, Any]:
    """Call GPT API to analyze a specific timeline period"""
    try:
        # Prepare the data for analysis
        chat_text = "\n".join([f"{msg.get('sender', 'User')}: {msg.get('text', '')}" for msg in chat_data])

        # Create the system prompt for timeline period analysis
        system_prompt = """You are a brilliant, insightful psychologist analyzing a specific time period in someone's life through their communication patterns.

Your job is to provide a DEEP, BOLD, and HONEST analysis of their personality and behavior during this specific time period. Be insightful, be direct, be compassionate but don't sugarcoat.

IMPORTANT: Focus specifically on this time period and provide LOTS of specific examples and detailed justifications for your insights. Explain WHY you think this, give concrete examples from their communication during this period, and provide evidence for your psychological observations.

Analyze their communication patterns during this specific period and provide insights that cover:
- Their personality and behavior during this specific time period (with specific examples)
- How they communicated during this period and what it reveals (with actual phrases and patterns)
- Their emotional landscape during this period (with evidence from their words)
- Key events or patterns that characterized this period (with specific examples)
- Whether they showed growth, regression, or stability during this period (with evidence)

For EVERY insight you provide, give:
1. The observation/conclusion about this specific period
2. WHY you think this (evidence from their communication during this period)
3. Specific examples or quotes that support your analysis
4. How this pattern showed up in their behavior during this time

Be thorough, insightful, and provide deep psychological insights with abundant examples. Write everything in Russian and refer to the person in THIRD PERSON (using their name or pronouns он/она/они, never "you" or "I").

IMPORTANT FORMATTING: When providing lists, use ONLY clean text without numbers, bullets, or other formatting symbols. Just provide clean, descriptive text for each item.

Don't be afraid to be bold and direct - this is about real psychological insight, not surface-level observations. But always back up your insights with concrete evidence from their actual communication during this period."""

        # Create the user prompt
        user_prompt = f"""Based on this data from a specific time period, provide a detailed analysis in the following JSON format:

Person Name: {person_name}
Period: {period_name}
Start Date: {start_date}
End Date: {end_date}

Chat Messages from this period:
{chat_text}

Give me a DEEP, INSIGHTFUL, and BOLD psychological analysis that reveals what was really going on with this person during this specific time period. 

CRITICAL REQUIREMENTS:
- Focus ONLY on this specific time period
- Provide LOTS of specific examples and quotes from their communication during this period
- Explain WHY you think each insight is true (give evidence from this period)
- Include detailed justifications for your psychological observations
- Use actual phrases and patterns from their messages during this period as evidence
- Give concrete examples of how their patterns manifested in behavior during this time
- Provide step-by-step reasoning for your conclusions

Don't just describe what you see - dig deeper and tell me what was driving their behavior during this period, what patterns they were stuck in, and what was happening in their life. But ALWAYS back up your insights with concrete evidence from their actual communication during this specific period.

Be honest, be direct, be compassionate but real. This is about genuine psychological insight with solid evidence, not surface-level observations."""

        # Make the API call with structured output
        response = await client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                ChatCompletionSystemMessageParam(role="system", content=system_prompt),
                {"role": "user", "content": user_prompt},
            ],
            response_format=ResponseFormatJSONSchema(
                json_schema=TimelinePeriodSchema.json_schema(), type='json_schema'
            ),
            temperature=0.7,
        )

        content = response.choices[0].message.content
        if not content:
            return {"error": "Empty response from GPT"}

        # Parse the structured JSON response
        result_data = json.loads(content)

        # Validate with Pydantic
        analysis = TimelinePeriodSchema.model_validate(result_data)

        # Convert back to dict
        result = analysis.model_dump()

        # List fields are already properly formatted by GPT API

        log.info(f"Successfully generated timeline period analysis for {period_name}")
        return result

    except Exception as e:
        log.info(f"Error calling GPT API for timeline period: {e}")
        log.exception("Exception in call_gpt_api_timeline_period")
        return {"error": f"GPT API Error: {str(e)}"}


async def call_gpt_api_timeline_analysis(period_analyses: List[Dict[str, Any]], person_name: str) -> Dict[str, Any]:
    """Call GPT API to create a comprehensive timeline analysis from multiple period analyses"""
    try:
        # Prepare the period analyses data
        periods_text = "\n\n".join(
            [
                f"Period: {period['period_name']} ({format_date_russian(period['start_date'])} - {format_date_russian(period['end_date'])})\n"
                f"Personality: {period['personality_during_period']}\n"
                f"Key Events: {', '.join(period['key_events'])}\n"
                f"Emotional State: {period['emotional_state']}\n"
                f"Communication Patterns: {', '.join(period['communication_patterns'])}\n"
                f"Emotional Triggers: {', '.join(period.get('emotional_triggers', []))}\n"
                f"Coping Mechanisms: {', '.join(period.get('coping_mechanisms', []))}\n"
                f"Therapy Goals: {', '.join(period.get('therapy_goals', []))}\n"
                f"Growth Areas: {', '.join(period.get('growth_areas', []))}\n"
                f"Growth/Regression: {period['growth_or_regression']}"
                for period in period_analyses
            ]
        )

        # Create the system prompt for timeline analysis
        system_prompt = """You are a brilliant, insightful psychologist analyzing someone's personality evolution over time through multiple time periods.

Your job is to provide a DEEP, BOLD, and HONEST analysis of how their personality has evolved over time, identifying patterns, transformations, and the core characteristics that define them. Be insightful, be direct, be compassionate but don't sugarcoat.

IMPORTANT: Analyze the evolution across all time periods and provide LOTS of specific examples and detailed justifications for your insights. Explain WHY you think this, give concrete examples from their communication across different periods, and provide evidence for your psychological observations.

Analyze their personality evolution and provide insights that cover:
- How their personality has evolved over time (with specific examples from different periods)
- The core, consistent characteristics that define who they are across all time periods
- Critical moments or periods where significant changes occurred (with detailed explanations)
- Recurring themes that appear throughout their timeline (with examples from different periods)
- Their overall growth trajectory (where they started, where they are now, and the journey in between)
- Predictions about their future development based on their patterns and growth trajectory
- Deep insights about what their timeline reveals about their true nature and potential

For EVERY insight you provide, give:
1. The observation/conclusion about their evolution
2. WHY you think this (evidence from their communication across different periods)
3. Specific examples or quotes that support your analysis (but they should be different, do not repeat more than twice)
4. How this pattern shows up in their behavior over time

Be thorough, insightful, and provide deep psychological insights with abundant and different examples. Write everything in Russian and refer to the person in THIRD PERSON (using their name or pronouns он/она/они, never "you" or "I").

IMPORTANT FORMATTING: When providing lists, use ONLY clean text without numbers, bullets, or other formatting symbols. Just provide clean, descriptive text for each item.

Don't be afraid to be bold and direct - this is about real psychological insight, not surface-level observations. But always back up your insights with concrete evidence from their actual communication across different time periods."""

        # Create the user prompt
        user_prompt = f"""Based on these period analyses, provide a comprehensive timeline analysis in the following JSON format:

Person Name: {person_name}

Period Analyses:
{periods_text}

Give me a DEEP, INSIGHTFUL, and BOLD psychological analysis that reveals how this person has evolved over time and what their timeline reveals about their true nature. 

CRITICAL REQUIREMENTS:
- Analyze the evolution across ALL time periods
- Provide LOTS of specific and different examples and quotes from their communication across different periods
- Explain WHY you think each insight is true (give evidence from different periods)
- Include detailed justifications for your psychological observations
- Use actual phrases and patterns from their messages across different periods as evidence
- Give concrete and varying examples of how their patterns have evolved over time
- Provide step-by-step reasoning for your conclusions about their evolution

Don't just describe what you see - dig deeper and tell me what has driven their evolution, what patterns have persisted or changed, and what their timeline reveals about their true nature and potential. But ALWAYS back up your insights with concrete evidence from their actual communication across different time periods.

Be honest, be direct, be compassionate but real. This is about genuine psychological insight with solid evidence, not surface-level observations."""

        # Make the API call with structured output
        response = await client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                ChatCompletionSystemMessageParam(role="system", content=system_prompt),
                {"role": "user", "content": user_prompt},
            ],
            response_format=ResponseFormatJSONSchema(
                json_schema=TimelineAnalysisSchema.json_schema(), type='json_schema'
            ),
            temperature=0.7,
        )

        content = response.choices[0].message.content
        if not content:
            return {"error": "Empty response from GPT"}

        # Parse the structured JSON response
        result_data = json.loads(content)

        # Validate with Pydantic
        analysis = TimelineAnalysisSchema.model_validate(result_data)

        # Convert back to dict
        result = analysis.model_dump()

        # Clean up all list fields to remove mixed numbering/bullets
        # List fields are already properly formatted by GPT API

        log.info(f"Successfully generated comprehensive timeline analysis")
        return result

    except Exception as e:
        log.info(f"Error calling GPT API for timeline analysis: {e}")
        log.exception("Exception in call_gpt_api_timeline_analysis")
        return {"error": f"GPT API Error: {str(e)}"}


def parse_date(date_str: str) -> datetime:
    """Parse date string to datetime object"""
    try:
        # Try different date formats
        for fmt in ['%Y-%m-%d', '%Y-%m-%d %H:%M:%S', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M:%SZ']:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        # If none work, return current date
        return datetime.now()
    except:
        return datetime.now()


def format_date_russian(date_str: str) -> str:
    """Format date string to Russian format (e.g., 'Апрель 2025')"""
    try:
        date_obj = parse_date(date_str)
        months = {
            1: 'Январь',
            2: 'Февраль',
            3: 'Март',
            4: 'Апрель',
            5: 'Май',
            6: 'Июнь',
            7: 'Июль',
            8: 'Август',
            9: 'Сентябрь',
            10: 'Октябрь',
            11: 'Ноябрь',
            12: 'Декабрь',
        }
        return f"{months[date_obj.month]} {date_obj.year}"
    except:
        return date_str


async def get_gpt_period_names(chunks, person_name, language: str = 'ru'):
    """Ask GPT to generate meaningful names for time periods"""
    try:
        # Create a summary of each period for GPT to analyze
        period_summaries = []
        for i, chunk in enumerate(chunks):
            # Get a sample of messages from this period (first 10 messages)
            sample_messages = chunk['messages'][:10]

            period_summaries.append(
                {
                    'period_index': i,
                    'start_date': chunk['start_date'],
                    'end_date': chunk['end_date'],
                    'message_count': len(chunk['messages']),
                }
            )

        # Create prompt for GPT
        prompt = f"""
        Проанализируй следующие временные периоды из жизни человека по имени {person_name} и дай каждому периоду краткое, но выразительное название на русском языке.

        Периоды:
        """

        for period in period_summaries:
            prompt += f"""
        Период {period['period_index'] + 1}: {period['start_date']} - {period['end_date']}
        Количество сообщений: {period['message_count']}
        """

        prompt += """
        Дай каждому периоду название из 2-4 слов, которое отражает основную тему или характер этого времени. 
        Названия должны быть на русском языке и отражать психологическое состояние или основные события периода.
        
        Верни только названия периодов, каждое с новой строки, без номеров.
        """

        # Call GPT API
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Ты эксперт по психологическому анализу и именованию временных периодов.",
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=200,
            temperature=0.7,
        )

        # Parse response
        period_names = response.choices[0].message.content.strip().split('\n')
        period_names = [name.strip() for name in period_names if name.strip()]

        # Ensure we have the right number of names
        if len(period_names) == len(chunks):
            return period_names
        else:
            # Fallback to default names
            return [chunk['period_name'] for chunk in chunks]

    except Exception as e:
        log.info(f"Error getting GPT period names: {e}")
        # Fallback to default names
        return [chunk['period_name'] for chunk in chunks]


def create_time_chunks(chat_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Create time-based chunks from chat data"""
    if not chat_data:
        return []

    # Sort messages by date
    sorted_messages = sorted(chat_data, key=lambda x: parse_date(x.get('date', '')))

    # Get date range
    dates = [parse_date(msg.get('date', '')) for msg in sorted_messages if msg.get('date')]
    if not dates:
        return [
            {
                'messages': sorted_messages,
                'start_date': 'Неизвестно',
                'end_date': 'Неизвестно',
                'period_name': 'Все сообщения',
            }
        ]

    min_date = min(dates)
    max_date = max(dates)
    total_days = (max_date - min_date).days

    # If less than 30 days, don't chunk
    if total_days < 30:
        return [
            {
                'messages': sorted_messages,
                'start_date': format_date_russian(min_date.strftime('%Y-%m-%d')),
                'end_date': format_date_russian(max_date.strftime('%Y-%m-%d')),
                'period_name': 'Все сообщения',
            }
        ]

    # Create time-based chunks instead of message-count-based chunks
    chunks = []

    # Calculate optimal number of periods based on time span
    if total_days > 365:  # More than a year
        num_chunks = 4
    else:
        num_chunks = 3

    # Calculate time-based chunk size
    chunk_days = total_days // num_chunks

    for i in range(num_chunks):
        # Calculate start and end dates for this chunk
        chunk_start = min_date + timedelta(days=i * chunk_days)
        if i == num_chunks - 1:  # Last chunk
            chunk_end = max_date
        else:
            chunk_end = min_date + timedelta(days=(i + 1) * chunk_days) - timedelta(days=1)

        # Find messages that fall within this time period
        chunk_messages = [
            msg
            for msg in sorted_messages
            if msg.get('date') and chunk_start <= parse_date(msg.get('date', '')) <= chunk_end
        ]

        # Create meaningful period names in Russian
        if i == 0:
            period_name = "Начальный период"
        elif i == num_chunks - 1:
            period_name = "Последний период"
        else:
            if num_chunks == 4:
                if i == 1:
                    period_name = "Второй период"
                elif i == 2:
                    period_name = "Третий период"
                else:
                    period_name = f"Период {i + 1}"
            else:
                period_name = "Средний период"

        chunks.append(
            {
                'messages': chunk_messages,
                'start_date': format_date_russian(chunk_start.strftime('%Y-%m-%d')),
                'end_date': format_date_russian(chunk_end.strftime('%Y-%m-%d')),
                'period_name': period_name,
            }
        )

    return chunks


async def process_patient_data(
    chat_data: List[Dict[str, Any]], person_name: str, language: str = 'ru'
) -> Dict[str, Any]:
    """Main function to process patient data and return insights"""
    try:
        log.info(f"Processing data for: {person_name}")
        # Removed logging of chat message count for privacy

        # Check if this is a large file that needs timeline processing
        if len(chat_data) > LARGE_FILE_THRESHOLD:
            log.info("Large file detected, using timeline processing")
            return await process_large_file_timeline(chat_data, person_name, language)
        else:
            # Use original processing for smaller files
            log.info("Using standard processing for smaller file")
            result = await call_gpt_api(chat_data, person_name, language)

            if 'error' in result:
                log.info(f"Error in GPT analysis: {result['error']}")
                return result

            log.info("Analysis completed successfully")
            return result

    except Exception as e:
        log.info(f"Error in process_patient_data: {e}")
        log.exception("Exception in process_patient_data")
        return {"error": f"Processing Error: {str(e)}"}


async def process_large_file_timeline(
    chat_data: List[Dict[str, Any]], person_name: str, language: str = 'ru'
) -> Dict[str, Any]:
    """Process large files using timeline analysis"""
    try:
        log.info("Starting timeline processing for large file")

        # Create time chunks
        chunks = create_time_chunks(chat_data)
        log.info(f"Created {len(chunks)} time chunks")

        # Get GPT-generated period names
        log.info("Getting GPT-generated period names")
        gpt_period_names = await get_gpt_period_names(chunks, person_name, language)

        # Update chunks with GPT-generated names
        for i, chunk in enumerate(chunks):
            if i < len(gpt_period_names):
                chunk['period_name'] = gpt_period_names[i]

        # Process each chunk
        period_analyses = []
        for i, chunk in enumerate(chunks):
            log.info(f"Processing chunk {i+1}/{len(chunks)}: {chunk['period_name']}")

            # Call GPT for this period
            period_result = await call_gpt_api_timeline_period(
                chunk['messages'], person_name, chunk['period_name'], chunk['start_date'], chunk['end_date'], language
            )

            if 'error' in period_result:
                log.info(f"Error processing period {chunk['period_name']}: {period_result['error']}")
                return period_result

            period_analyses.append(period_result)

        # Create comprehensive timeline analysis
        log.info("Creating comprehensive timeline analysis")
        timeline_result = await call_gpt_api_timeline_analysis(period_analyses, person_name)

        if 'error' in timeline_result:
            log.info(f"Error in timeline analysis: {timeline_result['error']}")
            return timeline_result

        # Add metadata about the processing
        timeline_result['processing_type'] = 'timeline'
        timeline_result['total_messages'] = len(chat_data)
        timeline_result['number_of_periods'] = len(chunks)
        timeline_result['period_analyses'] = period_analyses

        log.info("Timeline analysis completed successfully")
        return timeline_result

    except Exception as e:
        log.info(f"Error in timeline processing: {e}")
        log.exception("Exception in process_large_file_timeline")
        return {"error": f"Timeline Processing Error: {str(e)}"}
