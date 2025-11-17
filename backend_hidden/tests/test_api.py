"""
API endpoint tests
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import tempfile
import os

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_api.db"
test_engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=False)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_database():
    """Set up test database"""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "version" in data

def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "YT Dubber API"
    assert data["version"] == "1.0.0"
    assert data["status"] == "running"

def test_upload_urls_unauthorized():
    """Test upload URLs endpoint without authentication"""
    response = client.post("/api/jobs/upload-urls", json={
        "languages": ["es"],
        "voice_track_name": "test.mp3"
    })
    assert response.status_code == 401

def test_create_job_unauthorized():
    """Test create job endpoint without authentication"""
    response = client.post("/api/jobs/", json={
        "job_id": "test-123",
        "voice_track_uploaded": True,
        "background_track_uploaded": False,
        "languages": ["es"]
    })
    assert response.status_code == 401

def test_get_job_status_unauthorized():
    """Test get job status endpoint without authentication"""
    response = client.get("/api/jobs/test-123")
    assert response.status_code == 401

def test_cors_headers():
    """Test CORS headers are present"""
    response = client.options("/api/jobs/upload-urls", headers={"Origin": "http://localhost:3000"})
    # CORS middleware should add headers even if the route doesn't exist
    assert "access-control-allow-origin" in response.headers
    assert "access-control-allow-credentials" in response.headers