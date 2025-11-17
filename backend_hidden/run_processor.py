#!/usr/bin/env python3
"""
Start the Supabase job processor
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.worker.supabase_processor import start_processor
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

async def main():
    """Start the processor"""
    print("🚀 Starting Supabase Job Processor...")
    print("Press Ctrl+C to stop")
    
    try:
        await start_processor()
    except KeyboardInterrupt:
        print("\n🛑 Stopping processor...")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())