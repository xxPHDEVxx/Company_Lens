# Company Lens Backend

Django REST API backend for the Company Lens Belgian company analysis platform.

## Features

- JWT-based authentication
- Company data management with Belgian VAT validation
- Company grouping and organization
- User profiles and preferences
- Search history tracking
- RESTful API design
- PostgreSQL-ready (SQLite for development)

## Tech Stack

- Django 4.2.x
- Django REST Framework
- Django CORS Headers
- Simple JWT for authentication
- PostgreSQL/SQLite database
- Python 3.11+

## Project Structure

```
backend/
├── company_lens/        # Main project settings
├── authentication/       # JWT auth & user registration
├── companies/           # Company data models & API
├── groups/              # Company grouping functionality
├── users/               # User profiles & management
├── search/              # Search history & analytics
├── manage.py            # Django management script
└── requirements.txt     # Python dependencies
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Key environment variables:
- `SECRET_KEY`: Django secret key (generate a new one for production)
- `DEBUG`: Set to False in production
- `DATABASE_URL`: PostgreSQL connection string (optional, uses SQLite by default)
- `CORS_ALLOWED_ORIGINS`: Frontend URL (default: http://localhost:5173)

### 3. Database Setup

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser

```bash
python manage.py createsuperuser
```

### 5. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/me/` - Get current user
- `POST /api/auth/refresh/` - Refresh JWT token

### Companies
- `GET /api/companies/` - List all companies
- `GET /api/companies/followed/` - List followed companies
- `GET /api/companies/{id}/` - Get company details
- `POST /api/companies/` - Create company
- `PUT /api/companies/{id}/` - Update company
- `DELETE /api/companies/{id}/` - Delete company
- `POST /api/companies/{id}/follow/` - Follow company
- `DELETE /api/companies/{id}/follow/` - Unfollow company
- `GET /api/companies/search/` - Search companies

### Groups
- `GET /api/groups/` - List user's groups
- `POST /api/groups/` - Create group
- `GET /api/groups/{id}/` - Get group details
- `PUT /api/groups/{id}/` - Update group
- `DELETE /api/groups/{id}/` - Delete group
- `GET /api/groups/{id}/companies/` - List companies in group
- `POST /api/groups/{id}/companies/` - Add companies to group
- `DELETE /api/groups/{id}/companies/{company_id}/` - Remove company from group

### Recent Searches
- `GET /api/recent-searches/` - List recent searches
- `POST /api/recent-searches/` - Add recent search
- `DELETE /api/recent-searches/` - Clear recent searches

## Development

### Running Tests

```bash
python manage.py test
```

### Code Formatting

```bash
black .
isort .
flake8
```

### Making Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

## Production Deployment

### Using Gunicorn

```bash
gunicorn company_lens.wsgi:application --bind 0.0.0.0:8000
```

### Static Files

```bash
python manage.py collectstatic
```

### Security Checklist

1. Set `DEBUG=False`
2. Generate new `SECRET_KEY`
3. Configure proper `ALLOWED_HOSTS`
4. Use PostgreSQL in production
5. Enable HTTPS
6. Configure proper CORS origins
7. Set up proper logging
8. Regular security updates

## License

Private - Company Lens