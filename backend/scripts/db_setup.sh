#!/bin/bash
# Unix/Linux/Mac script for database setup
# Run this to quickly set up your database

echo "======================================"
echo "  Company Lens Database Setup"
echo "======================================"
echo

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "Virtual environment created!"
    echo
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements if needed
echo "Checking dependencies..."
if ! python -c "import django" 2>/dev/null; then
    echo "Installing requirements..."
    pip install -r requirements.txt
    echo
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo
    echo "IMPORTANT: Edit .env file with your database credentials!"
    echo "Press Enter after editing .env file..."
    read
    echo
fi

# Run database setup
echo "Setting up database..."
python scripts/db_manager.py create

# Create superuser
echo
read -p "Do you want to create a superuser account? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python manage.py createsuperuser
fi

# Load demo data
echo
read -p "Do you want to load demo data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python scripts/db_manager.py demo
fi

echo
echo "======================================"
echo "  Setup Complete!"
echo "======================================"
echo
echo "To start the server, run:"
echo "  python manage.py runserver"
echo
echo "API will be available at:"
echo "  http://localhost:8000/api/"
echo
echo "Admin panel at:"
echo "  http://localhost:8000/admin/"
echo