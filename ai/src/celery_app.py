"""
Celery application for AI scraping system.
"""
import os
from pathlib import Path
from celery import Celery
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

# Create Celery app
app = Celery('ai_scraper')

# Configuration
app.conf.update(
    broker_url=os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
    result_backend=os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/1'),
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Europe/Brussels',
    enable_utc=True,

    # Task routing
    task_routes={
        'ai_scraper.tasks.*': {'queue': 'scraper'},
    },

    # Performance tuning
    task_acks_late=True,
    worker_prefetch_multiplier=1,  # One task at a time (AI is CPU-heavy)
    task_time_limit=300,  # 5 minutes hard limit
    task_soft_time_limit=240,  # 4 minutes soft limit

    # Retry configuration
    task_default_retry_delay=60,
    task_max_retries=3,

    # Redis connection
    broker_connection_retry_on_startup=True,
    broker_connection_retry=True,
    broker_connection_max_retries=10,
)

# Auto-discover tasks
app.autodiscover_tasks(['src.features.company_scraper'])

if __name__ == '__main__':
    app.start()
