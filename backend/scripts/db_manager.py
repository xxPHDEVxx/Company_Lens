#!/usr/bin/env python
"""
Database Management Script for Company Lens
Handles database creation, deletion, and updates
"""

import os
import sys
import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import subprocess
from pathlib import Path
from dotenv import load_dotenv
import argparse
from typing import Optional

# Add parent directory to path for Django imports
sys.path.append(str(Path(__file__).parent.parent))

# Load environment variables
load_dotenv(Path(__file__).parent.parent / '.env')


class DatabaseManager:
    """Manages PostgreSQL database operations"""
    
    def __init__(self):
        """Initialize database connection parameters"""
        self.db_name = os.getenv('DB_NAME', 'company_lens_db')
        self.db_user = os.getenv('DB_USER', 'postgres')
        self.db_password = os.getenv('DB_PASSWORD', 'postgres')
        self.db_host = os.getenv('DB_HOST', 'localhost')
        self.db_port = os.getenv('DB_PORT', '5432')
        
    def _get_connection(self, database: Optional[str] = None):
        """
        Get PostgreSQL connection
        
        Args:
            database: Database name to connect to. If None, connects to postgres
        """
        try:
            conn = psycopg2.connect(
                database=database or 'postgres',
                user=self.db_user,
                password=self.db_password,
                host=self.db_host,
                port=self.db_port
            )
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            return conn
        except psycopg2.Error as e:
            print(f"❌ Error connecting to PostgreSQL: {e}")
            print(f"   Make sure PostgreSQL is running and credentials are correct")
            print(f"   Host: {self.db_host}:{self.db_port}")
            print(f"   User: {self.db_user}")
            sys.exit(1)
    
    def create_database(self, force: bool = False):
        """
        Create the database
        
        Args:
            force: If True, drops existing database first
        """
        print(f"🔧 Creating database '{self.db_name}'...")
        
        conn = self._get_connection()
        cursor = conn.cursor()
        
        try:
            # Check if database exists
            cursor.execute(
                "SELECT 1 FROM pg_database WHERE datname = %s",
                (self.db_name,)
            )
            exists = cursor.fetchone()
            
            if exists:
                if not force:
                    print(f"⚠️  Database '{self.db_name}' already exists!")
                    response = input("   Do you want to recreate it? This will DELETE all data! (yes/no): ")
                    if response.lower() != 'yes':
                        print("   Operation cancelled.")
                        return
                
                # Drop existing database
                print(f"   Dropping existing database...")
                cursor.execute(
                    sql.SQL("DROP DATABASE IF EXISTS {}").format(
                        sql.Identifier(self.db_name)
                    )
                )
                print(f"   ✅ Existing database dropped")
            
            # Create new database
            cursor.execute(
                sql.SQL("CREATE DATABASE {}").format(
                    sql.Identifier(self.db_name)
                )
            )
            print(f"✅ Database '{self.db_name}' created successfully!")
            
            # Run migrations
            print(f"🔧 Running Django migrations...")
            result = subprocess.run(
                [sys.executable, "manage.py", "migrate"],
                cwd=Path(__file__).parent.parent,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                print("✅ Migrations completed successfully!")
            else:
                print(f"❌ Migration failed: {result.stderr}")
                
        except psycopg2.Error as e:
            print(f"❌ Error creating database: {e}")
        finally:
            cursor.close()
            conn.close()
    
    def drop_database(self):
        """Drop the database completely"""
        print(f"🗑️  Dropping database '{self.db_name}'...")
        
        # Confirm deletion
        print(f"⚠️  WARNING: This will permanently DELETE the database '{self.db_name}' and all its data!")
        response = input("   Type 'DELETE' to confirm: ")
        if response != 'DELETE':
            print("   Operation cancelled.")
            return
        
        conn = self._get_connection()
        cursor = conn.cursor()
        
        try:
            # Terminate existing connections
            cursor.execute(
                sql.SQL("""
                    SELECT pg_terminate_backend(pid)
                    FROM pg_stat_activity
                    WHERE datname = %s AND pid <> pg_backend_pid()
                """),
                (self.db_name,)
            )
            
            # Drop database
            cursor.execute(
                sql.SQL("DROP DATABASE IF EXISTS {}").format(
                    sql.Identifier(self.db_name)
                )
            )
            print(f"✅ Database '{self.db_name}' dropped successfully!")
            
        except psycopg2.Error as e:
            print(f"❌ Error dropping database: {e}")
        finally:
            cursor.close()
            conn.close()
    
    def reset_database(self):
        """Reset database (drop all tables and recreate)"""
        print(f"🔄 Resetting database '{self.db_name}'...")
        
        # Confirm reset
        print(f"⚠️  WARNING: This will DELETE all data in '{self.db_name}'!")
        response = input("   Are you sure? (yes/no): ")
        if response.lower() != 'yes':
            print("   Operation cancelled.")
            return
        
        try:
            # Drop all tables using Django
            print("   Dropping all tables...")
            result = subprocess.run(
                [sys.executable, "manage.py", "migrate", "zero"],
                cwd=Path(__file__).parent.parent,
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                print(f"   Note: {result.stderr}")
            
            # Recreate tables
            print("   Recreating tables...")
            result = subprocess.run(
                [sys.executable, "manage.py", "migrate"],
                cwd=Path(__file__).parent.parent,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                print("✅ Database reset successfully!")
            else:
                print(f"❌ Reset failed: {result.stderr}")
                
        except Exception as e:
            print(f"❌ Error resetting database: {e}")
    
    def update_database(self):
        """Update database schema (run migrations)"""
        print(f"📝 Updating database schema...")
        
        try:
            # Make migrations
            print("   Checking for model changes...")
            result = subprocess.run(
                [sys.executable, "manage.py", "makemigrations"],
                cwd=Path(__file__).parent.parent,
                capture_output=True,
                text=True
            )
            
            if "No changes detected" in result.stdout:
                print("   No model changes detected")
            else:
                print(f"   ✅ Migrations created")
                print(result.stdout)
            
            # Apply migrations
            print("   Applying migrations...")
            result = subprocess.run(
                [sys.executable, "manage.py", "migrate"],
                cwd=Path(__file__).parent.parent,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                print("✅ Database updated successfully!")
                if result.stdout:
                    print(result.stdout)
            else:
                print(f"❌ Update failed: {result.stderr}")
                
        except Exception as e:
            print(f"❌ Error updating database: {e}")
    
    def check_status(self):
        """Check database connection and status"""
        print(f"🔍 Checking database status...")
        
        # Try to connect to the database
        try:
            conn = self._get_connection(self.db_name)
            cursor = conn.cursor()
            
            print(f"✅ Connected to database '{self.db_name}'")
            
            # Get database size
            cursor.execute(
                "SELECT pg_size_pretty(pg_database_size(%s))",
                (self.db_name,)
            )
            size = cursor.fetchone()[0]
            print(f"   Size: {size}")
            
            # Count tables
            cursor.execute("""
                SELECT COUNT(*)
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_type = 'BASE TABLE'
            """)
            table_count = cursor.fetchone()[0]
            print(f"   Tables: {table_count}")
            
            # Get migration status
            cursor.execute("""
                SELECT COUNT(*)
                FROM django_migrations
                WHERE applied IS NOT NULL
            """)
            migration_count = cursor.fetchone()[0]
            print(f"   Applied migrations: {migration_count}")
            
            # Count records in main tables
            tables = ['users_user', 'companies_company', 'groups_companygroup']
            for table in tables:
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    count = cursor.fetchone()[0]
                    print(f"   {table}: {count} records")
                except:
                    pass
            
            cursor.close()
            conn.close()
            
        except psycopg2.Error as e:
            if "does not exist" in str(e):
                print(f"❌ Database '{self.db_name}' does not exist")
                print(f"   Run 'python scripts/db_manager.py create' to create it")
            else:
                print(f"❌ Error checking database: {e}")
    
    def load_demo_data(self):
        """Load demo data into the database"""
        print(f"📦 Loading demo data...")
        
        try:
            # Check if database exists
            conn = self._get_connection(self.db_name)
            conn.close()
            
            # Run management command
            result = subprocess.run(
                [sys.executable, "manage.py", "create_demo_data"],
                cwd=Path(__file__).parent.parent,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                print("✅ Demo data loaded successfully!")
                print(result.stdout)
            else:
                print(f"❌ Failed to load demo data: {result.stderr}")
                
        except psycopg2.Error as e:
            print(f"❌ Database '{self.db_name}' does not exist. Create it first.")
        except Exception as e:
            print(f"❌ Error loading demo data: {e}")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Company Lens Database Manager',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/db_manager.py create      # Create new database
  python scripts/db_manager.py drop        # Delete database
  python scripts/db_manager.py reset       # Reset database (clear all data)
  python scripts/db_manager.py update      # Update schema (run migrations)
  python scripts/db_manager.py status      # Check database status
  python scripts/db_manager.py demo        # Load demo data
  
Environment variables (.env file):
  DB_NAME     - Database name (default: company_lens_db)
  DB_USER     - Database user (default: postgres)
  DB_PASSWORD - Database password (default: postgres)
  DB_HOST     - Database host (default: localhost)
  DB_PORT     - Database port (default: 5432)
        """
    )
    
    parser.add_argument(
        'action',
        choices=['create', 'drop', 'reset', 'update', 'status', 'demo'],
        help='Action to perform'
    )
    
    parser.add_argument(
        '--force',
        action='store_true',
        help='Force action without confirmation (use with caution!)'
    )
    
    args = parser.parse_args()
    
    # Create manager instance
    manager = DatabaseManager()
    
    # Execute action
    actions = {
        'create': lambda: manager.create_database(args.force),
        'drop': manager.drop_database,
        'reset': manager.reset_database,
        'update': manager.update_database,
        'status': manager.check_status,
        'demo': manager.load_demo_data,
    }
    
    print(f"\n{'='*50}")
    print(f"  Company Lens Database Manager")
    print(f"{'='*50}\n")
    
    actions[args.action]()
    
    print(f"\n{'='*50}\n")


if __name__ == '__main__':
    main()