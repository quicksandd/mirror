from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
import json
from .models import MirrorAnalysis


@admin.register(MirrorAnalysis)
class MirrorAnalysisAdmin(admin.ModelAdmin):
    list_display = ['id_short', 'status', 'created_at', 'processing_time', 'view_link']

    list_filter = ['status', 'created_at', 'completed_at']

    search_fields = ['id', 'error_message']

    readonly_fields = ['id', 'created_at', 'updated_at', 'completed_at']

    fieldsets = (
        ('Basic Info', {'fields': ('id', 'status')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at', 'completed_at')}),
        ('Error Info', {'fields': ('error_message',), 'classes': ('collapse',)}),
    )

    def id_short(self, obj):
        """Show short version of UUID"""
        return str(obj.id)[:8] + '...'

    id_short.short_description = 'ID'

    def processing_time(self, obj):
        """Calculate processing time"""
        if obj.completed_at and obj.created_at:
            delta = obj.completed_at - obj.created_at
            total_seconds = int(delta.total_seconds())
            minutes = total_seconds // 60
            seconds = total_seconds % 60
            if minutes > 0:
                return f"{minutes}m {seconds}s"
            return f"{seconds}s"
        elif obj.status == 'processing':
            return "In progress..."
        return "-"

    processing_time.short_description = 'Processing Time'

    def view_link(self, obj):
        """Link to view insights"""
        if obj.status == 'completed':
            url = reverse('mirror:insights_view', args=[obj.id])
            return format_html('<a href="{}" target="_blank">View Insights</a>', url)
        elif obj.status == 'processing':
            url = reverse('mirror:insights_view', args=[obj.id])
            return format_html('<a href="{}" target="_blank">Check Status</a>', url)
        return "-"

    view_link.short_description = 'View'

    def get_queryset(self, request):
        """Optimize queryset"""
        return super().get_queryset(request).order_by('-created_at')

    def has_add_permission(self, request):
        """Disable adding new analyses through admin"""
        return False

    def has_change_permission(self, request, obj=None):
        """Allow viewing but limit editing"""
        return True

    def has_delete_permission(self, request, obj=None):
        """Allow deletion for cleanup"""
        return request.user.is_superuser

    actions = ['mark_as_error', 'delete_selected']

    def mark_as_error(self, request, queryset):
        """Mark selected analyses as error"""
        updated = queryset.filter(status='processing').update(
            status='error', error_message='Manually marked as error by admin'
        )
        self.message_user(request, f'{updated} analyses marked as error.')

    mark_as_error.short_description = "Mark selected as error"
