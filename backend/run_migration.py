#!/usr/bin/env python3
"""
Run database migration for adding file path columns
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Supabase credentials
supabase_url = os.getenv("SUPABASE_URL")
supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY")

# Create Supabase client
supabase: Client = create_client(supabase_url, supabase_service_key)

# Read migration SQL
with open("migrations/add_file_paths.sql", "r") as f:
    migration_sql = f.read()

print("Running migration: add_file_paths.sql")
print("=" * 60)
print(migration_sql)
print("=" * 60)

try:
    # Execute the migration using Supabase SQL
    # Note: Supabase REST API doesn't directly support raw SQL execution
    # We need to use the PostgREST RPC or direct Postgres connection

    # For now, let's try to use the rpc method
    # First, let's just check if the columns exist by trying to query the table
    result = supabase.table("dubbing_jobs").select("*").limit(1).execute()

    print("\nChecking current schema...")
    if result.data:
        print(f"Sample job columns: {result.data[0].keys() if result.data else 'No data'}")
    else:
        print("No jobs found in database")

    print("\n⚠️  Note: To run the SQL migration, you need to:")
    print("1. Go to https://twrehfzfqrgxngsozonh.supabase.co/project/_/sql")
    print("2. Copy the contents of migrations/add_file_paths.sql")
    print("3. Paste and run it in the SQL Editor")
    print("\nAlternatively, you can use psql with the connection string from Supabase dashboard")

except Exception as e:
    print(f"\nError: {e}")
    print("\nThe migration needs to be run manually through the Supabase dashboard.")
    print("Go to: https://twrehfzfqrgxngsozonh.supabase.co/project/_/sql")
    print("And paste the SQL from migrations/add_file_paths.sql")
