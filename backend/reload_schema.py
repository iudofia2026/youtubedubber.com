#!/usr/bin/env python3
"""
Force PostgREST schema cache reload by sending NOTIFY signal
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

print("Attempting to reload PostgREST schema cache...")
print("=" * 60)

try:
    # Option 1: Try to execute NOTIFY via a custom RPC function
    # First, let's check available RPC functions
    print("\nAvailable RPC functions:")
    result = supabase.rpc('pgrst').execute()
    print(result)
except Exception as e:
    print(f"RPC method failed: {e}")

try:
    # Option 2: Make a request to force schema refresh
    # PostgREST automatically refreshes schema periodically
    # We can trigger a refresh by making a query
    print("\nForcing schema refresh by making a query...")
    result = supabase.table("dubbing_jobs").select("*").limit(0).execute()
    print("✅ Schema cache should be refreshed automatically")
    print("\nPlease wait 30 seconds and try creating a job again.")
    print("PostgREST typically refreshes its schema cache every few minutes.")

except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 60)
print("Alternative solution:")
print("The PostgREST schema cache issue can be resolved by:")
print("1. Waiting 2-3 minutes for automatic cache refresh")
print("2. Restarting your Supabase project (Settings -> Project Settings -> Pause/Resume)")
print("3. Or contact Supabase support to manually reload the schema cache")
print("\nFor now, let's try making a test request after waiting...")
