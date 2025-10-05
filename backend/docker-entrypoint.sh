#!/bin/bash
set -e

# Wait for database if DB_HOST is set (Docker Compose)
# On Render, DATABASE_URL is used directly by Django, no wait needed
if [ -n "$DB_HOST" ]; then
  echo "Waiting for database at $DB_HOST..."
  while ! nc -z ${DB_HOST} ${DB_PORT:-5432}; do
    sleep 0.1
  done
  echo "Database is ready!"
fi

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput || true

echo "Starting application..."
exec "$@"
