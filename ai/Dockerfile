# AI Scraper Worker Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry==1.8.2

# Copy poetry files
COPY pyproject.toml poetry.lock* ./

# Configure poetry to not create virtual environment
RUN poetry config virtualenvs.create false

# Install dependencies
RUN poetry install --no-interaction --no-ansi --no-root

# Copy application code
COPY . .

# Install the package
RUN poetry install --no-interaction --no-ansi

# Set PYTHONPATH
ENV PYTHONPATH=/app

CMD ["celery", "-A", "src.celery_app", "worker", "-Q", "scraper", "-l", "info", "--concurrency=1"]
