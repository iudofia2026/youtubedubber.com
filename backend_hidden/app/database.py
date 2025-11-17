"""
Database connection and session management
Note: This module is deprecated as we now use Supabase REST API
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Create database engine only if database_url is provided
engine = None
SessionLocal = None
Base = None

if settings.database_url:
    engine = create_engine(
        settings.database_url,
        echo=settings.debug,
        pool_pre_ping=True,
        pool_recycle=300
    )

    # Create session factory
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Create base class for models
    Base = declarative_base()
else:
    print("[INFO] DATABASE_URL not provided - using Supabase REST API only")

def get_db():
    """Dependency to get database session"""
    if not SessionLocal:
        raise Exception("Database connection not available - using Supabase REST API")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all tables in the database"""
    if not Base:
        print("[INFO] No database engine available - using Supabase REST API")
        return
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Drop all tables in the database"""
    if not Base:
        print("[INFO] No database engine available - using Supabase REST API")
        return
    Base.metadata.drop_all(bind=engine)