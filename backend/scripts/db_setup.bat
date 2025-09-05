@echo off
REM Windows batch script for database setup
REM Run this to quickly set up your database

echo ======================================
echo   Company Lens Database Setup
echo ======================================
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo Creating virtual environment...
    python -m venv venv
    echo Virtual environment created!
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements if needed
echo Checking dependencies...
pip show django >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing requirements...
    pip install -r requirements.txt
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Edit .env file with your database credentials!
    echo Press any key after editing .env file...
    pause >nul
    echo.
)

REM Run database setup
echo Setting up database...
python scripts/db_manager.py create

REM Create superuser
echo.
echo Do you want to create a superuser account? (y/n)
set /p create_super=
if /i "%create_super%"=="y" (
    python manage.py createsuperuser
)

REM Load demo data
echo.
echo Do you want to load demo data? (y/n)
set /p load_demo=
if /i "%load_demo%"=="y" (
    python scripts/db_manager.py demo
)

echo.
echo ======================================
echo   Setup Complete!
echo ======================================
echo.
echo To start the server, run:
echo   python manage.py runserver
echo.
echo API will be available at:
echo   http://localhost:8000/api/
echo.
echo Admin panel at:
echo   http://localhost:8000/admin/
echo.
pause