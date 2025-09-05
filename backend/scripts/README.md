# Database Management Scripts

This folder contains scripts to manage your Company Lens database easily.

## Quick Start

### Windows Users
```bash
# One-click setup (creates database, runs migrations, optional demo data)
scripts\db_setup.bat
```

### Mac/Linux Users
```bash
# Make script executable (first time only)
chmod +x scripts/db_setup.sh

# One-click setup
./scripts/db_setup.sh
```

## Database Manager Commands

The `db_manager.py` script provides full database control:

### Create Database
```bash
python scripts/db_manager.py create
```
Creates a new database and runs all migrations.

### Drop Database
```bash
python scripts/db_manager.py drop
```
⚠️ **WARNING**: Permanently deletes the database and all data!

### Reset Database
```bash
python scripts/db_manager.py reset
```
Drops all tables and recreates them (keeps database, clears data).

### Update Database
```bash
python scripts/db_manager.py update
```
Runs migrations to update database schema after model changes.

### Check Status
```bash
python scripts/db_manager.py status
```
Shows database connection status, size, table count, and record counts.

### Load Demo Data
```bash
python scripts/db_manager.py demo
```
Loads sample Belgian companies data for testing.

## Environment Configuration

The scripts use these environment variables from `.env`:

```env
DB_NAME=company_lens_db      # Database name
DB_USER=postgres              # PostgreSQL username
DB_PASSWORD=your_password     # PostgreSQL password
DB_HOST=localhost             # Database host
DB_PORT=5432                  # Database port
```

## Common Workflows

### Fresh Install
```bash
# 1. Run setup script (Windows)
scripts\db_setup.bat

# OR manually:
python scripts/db_manager.py create
python manage.py createsuperuser
python scripts/db_manager.py demo
```

### After Model Changes
```bash
# Update database schema
python scripts/db_manager.py update
```

### Clean Slate
```bash
# Reset everything
python scripts/db_manager.py reset
python scripts/db_manager.py demo
```

### Database Issues
```bash
# Check what's wrong
python scripts/db_manager.py status

# Nuclear option - start over
python scripts/db_manager.py drop
python scripts/db_manager.py create
```

## Troubleshooting

### "psycopg2 not installed"
```bash
pip install -r requirements.txt
```

### "PostgreSQL connection failed"
1. Make sure PostgreSQL is running
2. Check credentials in `.env`
3. Verify PostgreSQL is listening on correct port

### "Database does not exist"
```bash
python scripts/db_manager.py create
```

### "Permission denied"
- On Windows: Run as Administrator if needed
- On Mac/Linux: Use `sudo` for PostgreSQL operations

## Safety Features

- **Confirmation prompts** for destructive operations
- **Force flag** (`--force`) to skip confirmations in automation
- **Clear warnings** before data deletion
- **Status check** to verify operations

## Examples

```bash
# Check if everything is working
python scripts/db_manager.py status

# Start fresh with demo data
python scripts/db_manager.py reset
python scripts/db_manager.py demo

# Update after pulling new code
git pull
python scripts/db_manager.py update
```