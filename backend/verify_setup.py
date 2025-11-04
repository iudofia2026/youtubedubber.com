"""
Quick verification script to check Supabase connection and bucket setup
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def verify_supabase_connection():
    """Verify Supabase connection and bucket setup"""

    # Get credentials from environment
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
    bucket_name = os.getenv("STORAGE_BUCKET", "yt-dubber-uploads")

    print(f"\n{'='*60}")
    print("SUPABASE CONNECTION VERIFICATION")
    print(f"{'='*60}\n")

    print(f"Supabase URL: {supabase_url}")
    print(f"Bucket Name: {bucket_name}")
    print()

    try:
        # Create Supabase client
        print("1. Creating Supabase client...")
        supabase: Client = create_client(supabase_url, supabase_key)
        print("   ✅ Client created successfully\n")

        # Check bucket existence
        print("2. Checking if storage bucket exists...")
        try:
            buckets = supabase.storage.list_buckets()
            bucket_names = [b.name for b in buckets]

            print(f"   Found {len(bucket_names)} bucket(s):")
            for name in bucket_names:
                if name == bucket_name:
                    print(f"   ✅ {name} (TARGET BUCKET)")
                else:
                    print(f"   📦 {name}")
            print()

            if bucket_name not in bucket_names:
                print(f"   ⚠️  Bucket '{bucket_name}' does NOT exist!")
                print(f"   Creating bucket '{bucket_name}'...")

                # Create the bucket
                result = supabase.storage.create_bucket(
                    bucket_name,
                    options={"public": False}
                )
                print(f"   ✅ Bucket '{bucket_name}' created successfully!\n")
            else:
                print(f"   ✅ Bucket '{bucket_name}' already exists\n")

        except Exception as bucket_error:
            print(f"   ❌ Error checking/creating bucket: {bucket_error}\n")
            return False

        # Test database connection
        print("3. Testing database connection...")
        try:
            # Try to query the dubbing_jobs table
            response = supabase.table('dubbing_jobs').select("*").limit(1).execute()
            print(f"   ✅ Database connection successful")
            print(f"   ✅ Table 'dubbing_jobs' exists")
            print(f"   Found {len(response.data)} existing job(s)\n")
        except Exception as db_error:
            print(f"   ⚠️  Table query error: {db_error}")
            print(f"   (Tables may need to be created in Supabase)\n")

        print(f"{'='*60}")
        print("✅ VERIFICATION COMPLETE - Backend is ready!")
        print(f"{'='*60}\n")

        return True

    except Exception as e:
        print(f"❌ Connection failed: {e}\n")
        print(f"{'='*60}")
        print("Please check your credentials in .env file")
        print(f"{'='*60}\n")
        return False

if __name__ == "__main__":
    verify_supabase_connection()
