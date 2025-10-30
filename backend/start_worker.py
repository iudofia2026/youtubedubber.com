#!/usr/bin/env python3
"""
Background worker startup script for YT Dubber
Processes dubbing jobs in the background
"""
import asyncio
import logging
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.worker.processor import JobProcessor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def main():
    """Main function to run the job processor"""
    logger.info("Starting YT Dubber background worker...")

    processor = JobProcessor()

    try:
        await processor.start()
    except KeyboardInterrupt:
        logger.info("Received shutdown signal (Ctrl+C)")
    except Exception as e:
        logger.error(f"Worker error: {e}", exc_info=True)
    finally:
        await processor.stop()
        logger.info("Worker stopped")


if __name__ == "__main__":
    asyncio.run(main())
