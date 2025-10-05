"""
Company Lens Django Application.
This file ensures Celery is loaded when Django starts.
"""

try:
    from .celery import app as celery_app
    __all__ = ('celery_app',)
except ImportError:
    # Celery not installed, running without it
    celery_app = None
    __all__ = ()