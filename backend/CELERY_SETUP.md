# Celery and RabbitMQ Setup Guide

## Overview

Company Lens uses Celery with RabbitMQ for asynchronous task processing, particularly for fetching company data from external sources when not found in the database.

## Architecture

```
Django Backend <-> RabbitMQ Message Broker <-> Celery Workers
                         |
                    Redis (Result Backend)
                         |
                    Flower (Monitoring)
```

## Prerequisites

1. Docker and Docker Compose installed
2. Python virtual environment with dependencies installed
3. `.env` file configured (copy from `.env.example`)

## Quick Start

### 1. Start RabbitMQ and Redis

```bash
# Start the message broker and result backend
docker-compose up -d
```

This starts:
- RabbitMQ on port 5672 (Management UI on http://localhost:15672)
- Redis on port 6379
- Flower monitoring on http://localhost:5555

Default RabbitMQ credentials:
- Username: `admin`
- Password: `admin123`

### 2. Install Python Dependencies

```bash
# In your virtual environment
pip install -r requirements.txt
```

### 3. Run Database Migrations

```bash
python manage.py migrate django_celery_results
python manage.py migrate django_celery_beat
```

### 4. Start Celery Worker

```bash
# In a separate terminal
chmod +x start_celery.sh
./start_celery.sh

# Or manually:
celery -A company_lens worker --loglevel=info
```

### 5. Start Celery Beat (Optional - for scheduled tasks)

```bash
# In another terminal
chmod +x start_celery_beat.sh
./start_celery_beat.sh

# Or manually:
celery -A company_lens beat --loglevel=info
```

## Task Flow

### Company Data Fetching

1. User searches for a company by VAT number
2. Django checks if company exists in database
3. If not found:
   - Django creates a Celery task to fetch from AI scraper
   - Returns HTTP 202 (Accepted) with task ID
   - Frontend can poll `/api/companies/fetch_status/` endpoint
4. Celery worker:
   - Fetches data from AI scraper
   - Saves to database
   - Caches result
5. Next search returns the saved company data

## Configuration

### Environment Variables

```bash
# Message Broker
CELERY_BROKER_URL=amqp://admin:admin123@localhost:5672/company_lens

# Result Backend
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# For testing without RabbitMQ (synchronous execution)
CELERY_ALWAYS_EAGER=False  # Set to True for testing

# AI Scraper Settings
AI_SCRAPER_ENABLED=False  # Set to True when AI system is configured
AI_SCRAPER_API_KEY=your-api-key
AI_SCRAPER_BASE_PATH=../ai
AI_SCRAPER_TIMEOUT=120
```

### Queue Configuration

The system uses three queues:

1. **default**: General tasks
2. **scraper**: Company data fetching (higher priority)
3. **priority**: Urgent tasks

## Available Tasks

### Immediate Tasks

- `fetch_company_data(vat_number)`: Fetch company data from AI scraper
- `update_company_data(company_id)`: Update existing company data
- `process_batch_companies(vat_numbers)`: Process multiple companies
- `notify_company_update(company_id)`: Notify followers of updates

### Scheduled Tasks (via Celery Beat)

- `cleanup_stale_data`: Daily cleanup of old data
- `update_followed_companies`: Hourly update of followed companies

## Monitoring

### Flower Web Interface

Access at http://localhost:5555 to monitor:
- Active workers
- Task queue status
- Task execution history
- Worker performance

### RabbitMQ Management

Access at http://localhost:15672 to monitor:
- Queue depths
- Message rates
- Connection status
- Exchange bindings

### Django Admin

View task results in Django admin:
- `/admin/django_celery_results/taskresult/`
- `/admin/django_celery_beat/periodictask/`

## API Endpoints

### Search with Auto-Fetch

```bash
GET /api/companies/search/?vatNumber=BE0123456789
```

Response when company not found (triggers fetch):
```json
{
  "results": [],
  "count": 0,
  "fetch_status": "pending",
  "message": "Company not found in database. Fetching from external sources...",
  "task_id": "abc-123-def",
  "vat": "BE0123456789"
}
```

### Check Fetch Status

```bash
GET /api/companies/fetch_status/?vat=BE0123456789
# or
GET /api/companies/fetch_status/?task_id=abc-123-def
```

Response:
```json
{
  "status": "completed|pending|failed",
  "data": {...},  // Company data when completed
  "message": "...",
  "error": "..."   // Error message if failed
}
```

## Testing

### Test Without RabbitMQ

Set in `.env`:
```bash
CELERY_ALWAYS_EAGER=True
```

This executes tasks synchronously for testing.

### Manual Task Testing

```python
# Django shell
python manage.py shell

from companies.tasks import fetch_company_data
result = fetch_company_data.delay("BE0123456789")
print(result.id)  # Task ID
print(result.get())  # Wait for result
```

## Troubleshooting

### Common Issues

1. **Connection Refused to RabbitMQ**
   - Check Docker containers: `docker-compose ps`
   - Verify CELERY_BROKER_URL in .env

2. **Tasks Not Executing**
   - Check worker is running: `ps aux | grep celery`
   - Check logs: `tail -f logs/celery_worker.log`

3. **Task Results Not Stored**
   - Verify Redis is running: `docker-compose ps redis`
   - Check CELERY_RESULT_BACKEND setting

4. **AI Scraper Not Working**
   - Set AI_SCRAPER_ENABLED=False for mock data
   - Check AI_SCRAPER_BASE_PATH points to AI module

### Logs

- Django: `logs/django.log`
- Celery Worker: `logs/celery_worker.log`
- Celery Beat: `logs/celery_beat.log`
- RabbitMQ: `docker-compose logs rabbitmq`
- Redis: `docker-compose logs redis`

## Production Deployment

### Recommended Configuration

1. Use dedicated RabbitMQ cluster
2. Use Redis Sentinel for HA
3. Run multiple Celery workers
4. Use supervisor or systemd for process management
5. Configure proper monitoring and alerting

### Security

1. Change default RabbitMQ credentials
2. Use SSL/TLS for broker connections
3. Implement rate limiting for API endpoints
4. Set up proper firewall rules
5. Regular security updates

## Development Workflow

1. Start Docker services: `docker-compose up -d`
2. Start Django: `python manage.py runserver`
3. Start Celery: `./start_celery.sh`
4. Start Celery Beat (if needed): `./start_celery_beat.sh`
5. Monitor with Flower: http://localhost:5555

## Stopping Services

```bash
# Stop Celery (find PID from pidfile)
kill $(cat celery_worker.pid)
kill $(cat celery_beat.pid)

# Stop Docker services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```