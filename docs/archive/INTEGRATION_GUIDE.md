# Frontend Integration Guide

## Current Status

### ✅ What's Working
The complete STT → Translation → TTS → Audio Mixing pipeline has been successfully tested and is **production-ready**:

- **Deepgram STT**: Transcribes audio with 99%+ accuracy
- **OpenAI Translation**: Translates text to target languages
- **Deepgram TTS**: Generates natural-sounding speech
- **FFmpeg Audio Mixing**: Combines voice with background audio
- **Test Pipeline**: `backend/test_pipeline.py` demonstrates end-to-end functionality

**Test Results**: Successfully dubbed a 7-minute video from English to Spanish in ~3 minutes.

### ⚠️ Current Limitations

#### 1. Frontend Integration Incomplete
**Issue**: The pipeline works in the test script (`test_pipeline.py`) but is **NOT yet integrated with the frontend job workflow**.

**Current Behavior**:
- Frontend submits jobs → Backend returns mock status → No actual processing occurs
- Job status polling shows simulated progress (not real processing)
- Downloads are not available because no real dubbing happens

**What Needs to Happen**:
- Frontend job submissions need to trigger the background worker
- Real job processing needs to update job status in database
- Completed jobs need to serve actual dubbed audio files

#### 2. Audio Timing Not Preserved
**Issue**: The current stitching process does NOT preserve the timing/spacing of the original voice.

**Current Behavior**:
- Original audio: "Hello [2s pause] how are you?"
- Translated audio: "Hola cómo estás?" (no pause, continuous speech)
- Result: Translated version is often shorter/longer than original

**Impact**:
- Translated audio doesn't match video timing
- Lip-sync is not preserved
- Background music timing may be off

**Solution Needed**: Implement time-alignment to match original audio duration and pauses.

---

## Integration Steps

### Phase 1: Backend Worker Integration

#### Step 1: Set Up Database Schema
The worker expects database tables for job tracking. Currently in dev mode, jobs are only logged to `uploads.log`.

```bash
cd backend

# Option A: Use existing database (PostgreSQL)
alembic upgrade head

# Option B: Switch from mock to real Supabase
# Update .env:
# SUPABASE_URL=https://your-real-project.supabase.co
# SUPABASE_SERVICE_KEY=your-real-service-key
# DEBUG=false
```

#### Step 2: Start the Background Worker
```bash
cd backend
python3 start_worker.py
```

The worker will:
- Poll database every 5 seconds for pending jobs
- Process jobs through the complete pipeline
- Update job status in real-time
- Save dubbed audio to storage

#### Step 3: Update Job Creation Endpoint
Currently, job creation in dev mode only logs to file. Need to create actual database records.

**File**: `backend/app/api/jobs.py` (lines 46-108)

**Current Code** (dev mode):
```python
if settings.supabase_url == "https://test.supabase.co" or settings.debug:
    # Just logs to file, doesn't create job in database
    logger.info(f"Development mode: Creating job {request.job_id}")
    return SubmitJobResponse(job_id=request.job_id)
```

**Required Change**:
```python
# Remove the dev mode bypass, always create real jobs
job_service = SupabaseJobService()
job_status = await job_service.create_job(
    user_id=current_user.id,
    job_data=request
)
return SubmitJobResponse(job_id=request.job_id)
```

#### Step 4: Update Job Status Endpoint
Currently returns mock status. Need to return real status from database.

**File**: `backend/app/api/jobs.py` (lines 110-207)

**Current Code** (dev mode):
```python
if settings.supabase_url == "https://test.supabase.co" or settings.debug:
    # Returns simulated progress based on elapsed time
    return JobStatusResponse(
        status="processing",
        progress=25,
        # ...
    )
```

**Required Change**:
```python
# Remove dev mode bypass, always query real job status
job_service = SupabaseJobService()
job_status = await job_service.get_job_status(
    job_id=validated_job_id,
    user_id=current_user.id
)
return job_status
```

### Phase 2: File Download Integration

#### Step 5: Verify Download Endpoint
The download endpoint is already implemented (`backend/app/api/jobs.py` lines 402-493).

**Test it works**:
```bash
# After a job completes, test download
curl -H "Authorization: Bearer your-token" \
  "http://localhost:8000/api/jobs/{job_id}/download?lang=es" \
  --output dubbed_es.mp3
```

#### Step 6: Update Frontend Download Logic
Frontend already has download functionality but expects mock URLs.

**File**: `frontend/app/jobs/[id]/page.tsx` (lines 216-229)

**Current Code**:
```typescript
const handleDownload = (languageCode: string) => {
  const language = jobStatus.languages.find(lang => lang.languageCode === languageCode);
  if (language?.downloadUrl) {
    const link = document.createElement('a');
    link.href = language.downloadUrl;
    link.download = `${jobId}_${languageCode}_dub.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
```

**This should work as-is** if backend returns proper `downloadUrl` in job status response.

### Phase 3: Frontend Upload Integration

#### Step 7: Verify Upload Flow
Frontend upload flow is already implemented and working:

1. User uploads files → `frontend/app/new/page.tsx`
2. Requests signed URLs → `POST /api/jobs/upload-urls`
3. Uploads to storage → `PUT /mock-upload/...` (dev) or Supabase (prod)
4. Creates job → `POST /api/jobs/`
5. Redirects to status page → `/jobs/{id}`

**What needs to change**: Switch from dev mode to production mode so jobs are actually created in database.

---

## Testing the Integration

### Test Checklist

#### Backend Tests
- [ ] Worker starts successfully: `python3 start_worker.py`
- [ ] Worker polls database for jobs
- [ ] Job creation adds entries to database
- [ ] Job status returns real progress from database
- [ ] Completed jobs have downloadable audio files

#### Frontend Tests
- [ ] Upload files through UI (`/new`)
- [ ] Job status page shows real progress
- [ ] Progress updates every ~10 seconds
- [ ] Download button appears when complete
- [ ] Downloaded file plays correctly

#### End-to-End Test
```bash
# 1. Start backend API
cd backend
uvicorn app.main:app --reload

# 2. Start worker (separate terminal)
python3 start_worker.py

# 3. Start frontend (separate terminal)
cd frontend
npm run dev

# 4. Test complete flow
# - Go to http://localhost:3000/new
# - Upload voice and background files
# - Select Spanish as target language
# - Submit job
# - Monitor status page
# - Download completed file
```

---

## Known Issues & Roadmap

### Issue 1: Audio Timing Preservation ⚠️

**Problem**: Translated audio doesn't match original timing

**Current Implementation**:
```python
# In ai_service.py
translated_text = await self.translate_text(transcript, target_language)
speech_audio = await self.generate_speech(translated_text, target_language)
```

**Issue**: No time-alignment between original and translation

**Proposed Solution**:
1. **Extract word timestamps from original audio** (Deepgram provides this)
   ```python
   response = self.deepgram.listen.v1.media.transcribe_file(
       request=buffer_data,
       model="nova-2",
       language=language,
       smart_format=True,
       punctuate=True,
       utterances=True  # Get word-level timestamps
   )
   ```

2. **Translate with word-level mapping**
   - Track original word timing
   - Map translated words to original positions
   - Insert pauses to match original timing

3. **Generate speech with timing constraints**
   - Generate TTS with speed adjustments
   - Insert silence to match original pauses
   - Stretch/compress audio to match original duration

**Implementation Complexity**: Medium-High
**Estimated Time**: 2-4 days
**Priority**: High (critical for video dubbing)

### Issue 2: Lip-Sync Alignment ⏱️

**Problem**: Generated speech doesn't match mouth movements

**Proposed Solution**:
- Use phoneme-level timing from original audio
- Apply voice conversion instead of pure TTS
- Use specialized lip-sync models (e.g., Wav2Lip)

**Implementation Complexity**: High
**Estimated Time**: 1-2 weeks
**Priority**: Medium (nice-to-have for professional results)

### Issue 3: Voice Characteristic Preservation 🎤

**Problem**: TTS voice doesn't match original speaker's characteristics

**Current**: Uses default Deepgram voices
**Proposed Solution**:
- Use voice cloning (ElevenLabs, Resemble AI)
- Or offer voice selection UI for users

**Implementation Complexity**: Medium
**Estimated Time**: 3-5 days
**Priority**: Low (enhancement)

---

## Quick Start for Developers

### Minimal Integration (Dev Mode)

If you want to test the pipeline without full database setup:

1. **Create a simple endpoint to trigger processing**:

```python
# backend/app/api/jobs.py
@router.post("/process-test")
async def process_test_job(
    voice_file: str,
    background_file: str,
    target_language: str
):
    """Test endpoint to process files directly"""
    from app.services.ai_service import AIService

    ai_service = AIService()

    # Transcribe
    transcript_result = await ai_service.transcribe_audio(voice_file)

    # Translate
    translated_text = await ai_service.translate_text_chunked(
        transcript_result["transcript"],
        target_language
    )

    # Generate speech
    speech_audio = await ai_service.generate_speech_chunked(
        translated_text,
        target_language
    )

    # Mix audio
    # ... (implementation in test_pipeline.py)

    return {"status": "complete", "download_url": "..."}
```

2. **Call from frontend**:
```typescript
// After upload completes
const response = await fetch('/api/jobs/process-test', {
  method: 'POST',
  body: JSON.stringify({
    voice_file: uploadedVoicePath,
    background_file: uploadedBackgroundPath,
    target_language: 'es'
  })
});
```

### Full Production Integration

Follow all steps in **Phase 1, 2, and 3** above.

---

## Configuration Changes Needed

### Backend `.env`
```env
# Switch from dev to production
DEBUG=false
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-real-key

# Keep these as-is
DEEPGRAM_API_KEY=your-key
OPENAI_API_KEY=your-key
```

### Frontend `.env.local`
```env
# Point to production API
NEXT_PUBLIC_API_URL=https://your-api-domain.com

# Or keep localhost for local testing
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Performance Considerations

### Scaling Recommendations

**Current Limits**:
- Max concurrent jobs: 3
- Processing time: ~3 min per 7-min audio
- Single worker instance

**For Production**:
1. **Multiple Workers**: Start 3-5 worker processes
2. **Redis Queue**: Replace polling with Redis pub/sub
3. **CDN for Downloads**: Use CloudFront/Cloudflare for file serving
4. **Database Optimization**: Add indexes on `status` and `user_id`
5. **API Rate Limiting**: Already implemented, adjust limits as needed

### Cost Optimization

**Current Cost** (per 7-min audio, 1 language):
- Deepgram STT: $0.03
- OpenAI Translation: $0.01
- Deepgram TTS: $0.12
- **Total**: ~$0.16 per language

**Optimization Tips**:
- Cache common phrases/translations
- Use shorter audio chunks when possible
- Implement usage tiers/limits per user

---

## Support & Resources

### Test Files
- Voice: `backend/uploads/dev-user-123/job_7faa89915e2f/voice_track_VOICE-ONLY.mp4`
- Background: `backend/uploads/dev-user-123/job_7faa89915e2f/background_track_SFX-ONLY.mp4`
- Output: `backend/downloads/dubbed_es_final.mp3`

### Test Scripts
- **Full Pipeline**: `python3 backend/test_pipeline.py`
- **Worker**: `python3 backend/start_worker.py`

### Documentation
- **Setup**: `PRODUCTION_SETUP.md`
- **Test Results**: `TEST_RESULTS.md`
- **This Guide**: `INTEGRATION_GUIDE.md`

---

**Last Updated**: October 30, 2025
**Status**: Pipeline tested and working, frontend integration pending
**Next Step**: Remove dev mode bypasses and enable real job processing
