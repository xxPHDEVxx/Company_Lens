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

# Create demo data and superuser if LOAD_DEMO_DATA is set
if [ "$LOAD_DEMO_DATA" = "true" ]; then
  echo "Creating demo superuser..."
  python manage.py shell <<EOF
from users.models import User
if not User.objects.filter(email='demo@example.com').exists():
    User.objects.create_superuser(
        email='demo@example.com',
        name='Demo Admin',
        password='demo123456'
    )
    print('✓ Demo superuser created: demo@example.com / demo123456')
else:
    print('✓ Demo superuser already exists')
EOF

  echo "Loading demo data..."
  python manage.py create_demo_data || echo "⚠ Demo data command not found or failed"
fi

echo "Starting application..."
exec "$@"
