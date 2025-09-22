# Company Lens Backend

A Django REST API backend for managing Belgian company data.

## Overview

This backend provides a RESTful API for:
- Company management (CRUD operations)
- User authentication (JWT-based)
- Search functionality with recent search history
- Company groups organization
- Establishments tracking

## Project Structure

```
backend/
├── company_lens/       # Main Django project settings
│   ├── settings.py     # Django configuration
│   ├── urls.py         # Main URL routing
│   └── wsgi.py         # WSGI application
│
├── companies/          # Company management app
│   ├── models.py       # Company, Establishment, FinancialData models
│   ├── views.py        # Company ViewSets and actions
│   ├── serializers.py  # Data serialization
│   └── admin.py        # Django admin configuration
│
├── users/              # User authentication app
│   ├── models.py       # Custom User model
│   ├── views.py        # Auth endpoints (login, signup, me)
│   └── serializers.py  # User data serialization
│
├── groups/             # Company groups app
│   ├── models.py       # CompanyGroup, GroupMembership models
│   ├── views.py        # Group management endpoints
│   └── serializers.py  # Group data serialization
│
└── search/             # Search functionality app
    ├── models.py       # RecentSearch model
    ├── views.py        # Search history endpoints
    └── serializers.py  # Search data serialization
```

## Key Models

### Company
- **Fields**: VAT number, name, legal form, status, region, sector, employees
- **Relations**: Has many establishments, financial data records, followers

### Establishment
- **Fields**: Unit number, name, address, status
- **Relations**: Belongs to a company

### User
- **Fields**: Email, name, company, role, department
- **Authentication**: JWT tokens

### RecentSearch
- **Fields**: Company name, VAT, color (for UI), search metadata
- **Purpose**: Tracks user's recent searches for quick access

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login (returns JWT token)
- `POST /api/auth/signup/` - User registration  
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/me/` - Get current user info

### Companies
- `GET /api/companies/` - List all companies (paginated)
- `GET /api/companies/{id}/` - Get company details
- `POST /api/companies/` - Create new company
- `PUT /api/companies/{id}/` - Update company
- `DELETE /api/companies/{id}/` - Delete company
- `GET /api/companies/search/` - Search companies by VAT/name/etc
- `POST /api/companies/{id}/follow/` - Follow a company
- `DELETE /api/companies/{id}/follow/` - Unfollow a company
- `GET /api/companies/{id}/establishments/` - Get company establishments

### Groups
- `GET /api/groups/` - List user's groups
- `POST /api/groups/` - Create new group
- `GET /api/groups/{id}/` - Get group details
- `PUT /api/groups/{id}/` - Update group
- `DELETE /api/groups/{id}/` - Delete group
- `GET /api/groups/{id}/companies/` - Get companies in group
- `POST /api/groups/{id}/companies/` - Add companies to group

### Recent Searches
- `GET /api/recent-searches/` - Get user's recent searches
- `POST /api/recent-searches/` - Add a recent search
- `DELETE /api/recent-searches/clear/` - Clear all recent searches

## Data Flow

### Search Feature
1. Frontend sends search request with `vatNumber` parameter
2. Backend filters companies by VAT number
3. Returns paginated results with `count`, `results`, `next`, `previous`
4. Frontend extracts `results` array for display

### Authentication Flow
1. User logs in with email/password
2. Backend validates credentials
3. Returns JWT token
4. Frontend stores token in localStorage
5. Token sent in Authorization header for protected routes

## Key Features Implemented

### Completed
- JWT authentication system
- Company CRUD operations
- Search by VAT number
- Recent search history
- Company establishments
- User groups management
- Django admin interface

## Development Commands

```bash
# Activate virtual environment
source .venv/bin/activate

# Run development server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Access Django admin
http://localhost:8000/admin
```

## Database

Currently using SQLite for development. The database file is `db.sqlite3`.

## Authentication

All API endpoints except login/signup require JWT authentication.
Send token in headers:
```
Authorization: Bearer <token>
```

## Error Handling

The API returns standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 405: Method Not Allowed
- 500: Server Error

## Recent Changes & Fixes

### 1. Search Parameter Mismatch (500 Error Fix)
**Problem**: Backend expected `query` parameter but frontend sent `vatNumber`
**Solution**: Modified search view to accept `vatNumber` directly

### 2. Undefined Variable Error
**Problem**: Variable `query` was undefined when searching by VAT
**Solution**: Initialized search variables at the beginning of the method

### 3. Data Format Mismatch  
**Problem**: Backend sent paginated response, frontend expected array
**Solution**: Frontend now extracts `results` array from paginated response

### 4. Code Cleanup
- Removed unused `CompanySearchSerializer`
- Removed unused imports (`Q`, `filters` where not needed)
- Removed `SavedSearch` and `SearchAnalytics` models
- Simplified documentation strings

## Code Organization

### Views Structure
Each ViewSet follows this pattern:
1. **queryset**: Base query for the model
2. **get_queryset()**: Filters data based on user
3. **get_serializer_class()**: Returns appropriate serializer
4. **Custom actions**: Additional endpoints like search, follow, etc.

### Serializer Pattern
- **ListSerializer**: Minimal fields for listing
- **DetailSerializer**: All fields for single item
- **CreateUpdateSerializer**: Validation for create/update

### Model Structure
- Clear field definitions with help text
- Proper choices for enums
- Meta class with ordering and indexes
- String representation for admin