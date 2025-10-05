#!/bin/bash

# Celery worker startup script for Company Lens
# This script starts the Celery worker with proper configuration

echo "Starting Celery worker for Company Lens..."

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

# Start Celery worker
echo "Starting Celery worker..."
celery -A company_lens worker \
    --loglevel=${CELERY_LOG_LEVEL:-info} \
    --concurrency=${CELERY_CONCURRENCY:-4} \
    --queues=${CELERY_QUEUES:-default,scraper,priority} \
    --hostname=worker@%h \
    --logfile=logs/celery_worker.log \
    --pidfile=celery_worker.pid