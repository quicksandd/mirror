import logging

from django.db import models
from django.utils import timezone
import uuid

log = logging.getLogger(__name__)


class MirrorAnalysis(models.Model):
    """Model to store mirror analysis data and results"""

    STATUS_CHOICES = [
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('error', 'Error'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')

    insights = models.JSONField(null=True, blank=True)
    error_message = models.TextField(blank=True)

    person_name = models.CharField(max_length=255, blank=True, default='')
    language = models.CharField(max_length=10, default='ru', help_text='Language for analysis output')

    keypair = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'mirror_analyses'
        ordering = ['-created_at']

    def __str__(self):
        return f"MirrorAnalysis {self.id} - {self.status}"

    def mark_completed(self, insights):
        self.status = 'completed'
        self.insights = insights
        self.completed_at = timezone.now()
        self.save()
        log.info(f"MirrorAnalysis {self.id} marked as saved")

    def mark_error(self, error_message):
        """Mark analysis as failed with error"""
        self.status = 'error'
        self.error_message = error_message
        self.completed_at = timezone.now()
        self.save()
