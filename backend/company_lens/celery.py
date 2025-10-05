"""
Celery configuration for Company Lens.
Handles asynchronous task processing with RabbitMQ as the message broker.
"""

import os
from celery import Celery
from celery.signals import setup_logging
from django.conf import settings
from kombu import Exchange, Queue
import logging

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'company_lens.settings')

# Create Celery application instance
app = Celery('company_lens')

# Configure Celery using Django settings with CELERY_ prefix
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all registered Django apps
app.autodiscover_tasks()

# Define exchanges for different task types
default_exchange = Exchange('default', type='direct')
scraper_exchange = Exchange('scraper', type='topic')
priority_exchange = Exchange('priority', type='direct')

# Define queues with proper routing
app.conf.task_queues = (
    # Default queue for general tasks
    Queue('default', default_exchange, routing_key='default',
          queue_arguments={'x-max-priority': 5}),
    
    # Scraper queue for AI company data fetching
    Queue('scraper', scraper_exchange, routing_key='scraper.*',
          queue_arguments={'x-max-priority': 10}),
    
    # High priority queue for urgent tasks
    Queue('priority', priority_exchange, routing_key='priority',
          queue_arguments={'x-max-priority': 10}),
    
    # Dead letter queue for failed tasks
    Queue('dead_letter', Exchange('dlx', type='direct'), routing_key='failed',
          queue_arguments={
              'x-message-ttl': 86400000,  # 24 hours in milliseconds
              'x-max-length': 10000
          }),
)

# Task routing configuration
app.conf.task_routes = {
    'companies.tasks.fetch_company_data': {
        'queue': 'scraper',
        'routing_key': 'scraper.company',
        'priority': 5,
    },
    'companies.tasks.update_company_data': {
        'queue': 'scraper',
        'routing_key': 'scraper.update',
        'priority': 3,
    },
    'companies.tasks.process_batch_companies': {
        'queue': 'scraper',
        'routing_key': 'scraper.batch',
        'priority': 1,
    },
    'companies.tasks.cleanup_stale_data': {
        'queue': 'default',
        'routing_key': 'default',
        'priority': 1,
    },
}

# Task execution options
app.conf.task_annotations = {
    'companies.tasks.fetch_company_data': {
        'rate_limit': '10/m',  # Max 10 per minute to avoid overwhelming APIs
        'time_limit': 300,  # 5 minutes hard timeout
        'soft_time_limit': 240,  # 4 minutes soft timeout
    },
    'companies.tasks.update_company_data': {
        'rate_limit': '20/m',
        'time_limit': 180,
        'soft_time_limit': 150,
    },
}

# Celery beat schedule for periodic tasks
app.conf.beat_schedule = {
    'cleanup-stale-data': {
        'task': 'companies.tasks.cleanup_stale_data',
        'schedule': 86400.0,  # Run once per day
        'options': {
            'expires': 3600.0,  # Expire if not run within an hour
        }
    },
    'update-followed-companies': {
        'task': 'companies.tasks.update_followed_companies',
        'schedule': 3600.0,  # Run every hour
        'options': {
            'expires': 1800.0,  # Expire if not run within 30 minutes
        }
    },
}

# Configure result backend for task results
app.conf.task_track_started = True
app.conf.task_send_sent_event = True
app.conf.result_expires = 3600  # Results expire after 1 hour

# Worker configuration
app.conf.worker_prefetch_multiplier = 4  # Prefetch 4 tasks per worker
app.conf.worker_max_tasks_per_child = 1000  # Restart worker after 1000 tasks
app.conf.worker_disable_rate_limits = False

# Error handling
app.conf.task_reject_on_worker_lost = True
app.conf.task_ignore_result = False

@setup_logging.connect
def config_loggers(*args, **kwargs):
    """Configure logging for Celery workers."""
    from logging.config import dictConfig
    from django.conf import settings
    
    # Use Django's logging configuration
    dictConfig(settings.LOGGING)

@app.task(bind=True)
def debug_task(self):
    """Debug task for testing Celery configuration."""
    return f'Request: {self.request!r}'

# Health check task
@app.task(name='celery.health_check')
def health_check():
    """Simple health check task for monitoring."""
    return {'status': 'healthy', 'timestamp': os.environ.get('HOSTNAME', 'unknown')}