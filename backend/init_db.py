#!/usr/bin/env python3
"""
Initialize database tables for development
"""
import sys
import os

# Add the app directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.database import engine, Base
from app.models import User, DubbingJob, LanguageTask, JobEvent

def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()