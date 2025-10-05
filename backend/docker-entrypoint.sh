#!/bin/bash
set -e

# Only wait for database in Docker Compose (when RENDER is not set)
if [ -z "$RENDER" ] && [ -n "$DB_HOST" ]; then
  echo "Waiting for database at $DB_HOST..."
  while ! nc -z ${DB_HOST} ${DB_PORT:-5432}; do
    sleep 0.1
  done
  echo "Database is ready!"
else
  echo "Skipping database wait (using DATABASE_URL)"
fi

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput || true

echo "Starting application..."
exec "$@"
