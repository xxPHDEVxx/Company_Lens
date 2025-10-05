#!/bin/bash

# Celery Beat startup script for Company Lens
# This script starts the Celery Beat scheduler for periodic tasks

echo "Starting Celery Beat scheduler for Company Lens..."

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    echo "Activating virtual environment..."
    source .venv/bin/activate
elif [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Set default environment variables if not already set
export DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE:-"company_lens.settings"}

# Check if .env file exists and load it
if [ -f ".env" ]; then
    echo "Loading environment variables from .env..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start Celery Beat
echo "Starting Celery Beat scheduler..."
celery -A company_lens beat \
    --loglevel=${CELERY_LOG_LEVEL:-info} \
    --logfile=logs/celery_beat.log \
    --pidfile=celery_beat.pid \
    --schedule=celerybeat-schedule.db