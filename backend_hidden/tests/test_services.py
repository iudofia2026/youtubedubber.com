"""
Service layer tests
"""
import pytest
from unittest.mock import Mock, patch, AsyncMock
from app.services.job_service import JobService
from app.services.storage_service import StorageService
from app.schemas import JobCreationRequest, UploadUrlsRequest
from app.models import User, DubbingJob, LanguageTask

@pytest.fixture
def mock_db():
    """Mock database session"""
    return Mock()

@pytest.fixture
def job_service():
    """Job service instance"""
    return JobService()

@pytest.fixture
def storage_service():
    """Storage service instance"""
    return StorageService()

def test_job_service_creation():
    """Test job service can be created"""
    service = JobService()
    assert service is not None

def test_storage_service_creation():
    """Test storage service can be created"""
    service = StorageService()
    assert service is not None

@pytest.mark.asyncio
async def test_create_job_success(job_service, mock_db):
    """Test successful job creation"""
    # Mock database operations
    mock_db.query.return_value.filter.return_value.first.return_value = None  # No existing job
    mock_db.add = Mock()
    mock_db.commit = Mock()
    mock_db.refresh = Mock()
    
    # Mock job status response
    with patch.object(job_service, 'get_job_status', return_value=Mock()) as mock_get_status:
        job_data = JobCreationRequest(
            job_id="test-job-123",
            voice_track_uploaded=True,
            background_track_uploaded=False,
            languages=["es", "fr"]
        )
        
        result = await job_service.create_job(
            user_id="test-user-123",
            job_data=job_data,
            db=mock_db
        )
        
        # Verify database operations
        assert mock_db.add.call_count >= 3  # Job + Language tasks + Job event
        mock_db.commit.assert_called_once()
        
        # Verify job status was retrieved
        mock_get_status.assert_called_once()

@pytest.mark.asyncio
async def test_generate_upload_urls_success(storage_service):
    """Test successful upload URL generation"""
    with patch.object(storage_service.supabase_storage, 'generate_signed_upload_url') as mock_generate:
        mock_generate.return_value = "https://example.com/signed-url"
        
        result = await storage_service.generate_upload_urls(
            user_id="test-user-123",
            languages=["es", "fr"],
            voice_track_name="test.mp3",
            background_track_name="background.mp3"
        )
        
        assert result.job_id is not None
        assert "voice_track" in result.upload_urls
        assert "background_track" in result.upload_urls
        assert result.upload_urls["voice_track"] == "https://example.com/signed-url"
        assert result.upload_urls["background_track"] == "https://example.com/signed-url"

@pytest.mark.asyncio
async def test_generate_upload_urls_voice_only(storage_service):
    """Test upload URL generation with voice track only"""
    with patch.object(storage_service.supabase_storage, 'generate_signed_upload_url') as mock_generate:
        mock_generate.return_value = "https://example.com/signed-url"
        
        result = await storage_service.generate_upload_urls(
            user_id="test-user-123",
            languages=["es"],
            voice_track_name="test.mp3"
        )
        
        assert result.job_id is not None
        assert "voice_track" in result.upload_urls
        assert "background_track" not in result.upload_urls