# Backend Ticket Breakdown

## Phase 0 – MVP Foundations ✅ **COMPLETED**
- **BK-001 – Project scaffold & configuration** ✅ **DONE**  
  ✅ FastAPI project skeleton created with complete structure (api, services, schemas, background module)  
  ✅ Pydantic settings with environment variable support  
  ✅ Pre-commit lint/type/test configuration  
  ✅ Production-ready Dockerfile and docker-compose.yml  
  ✅ Comprehensive requirements.txt with all dependencies

- **BK-002 – Supabase auth + RLS integration** ✅ **DONE**  
  ✅ JWT validation dependency implemented with Supabase integration  
  ✅ User management with automatic user creation  
  ✅ Storage service for Supabase Storage integration  
  ✅ Auth-aware test helpers and middleware  
  ✅ Protected routes return 401 without token, 200 with valid token

- **BK-003 – Database models & migrations** ✅ **DONE**  
  ✅ Complete SQLAlchemy models for users, dubbing_jobs, language_tasks, artifacts, job_events  
  ✅ Alembic migration setup and configuration  
  ✅ Proper relationships and foreign key constraints  
  ✅ Fixed SQLAlchemy reserved keyword issues

- **BK-004 – Local dev & CI baseline** ✅ **DONE**  
  ✅ Local .env.example with all required variables  
  ✅ GitHub Actions CI/CD pipeline with lint, type check, unit tests  
  ✅ Comprehensive test suite (unit, integration, API tests)  
  ✅ Code quality checks and security scanning  
  ✅ Coverage reporting and documentation

## Phase 1 – Direct Upload Flow 🎯 **NEXT PRIORITY FOR FRONTEND INTEGRATION**
- **BK-010 – Signed upload URL endpoint** ✅ **DONE**  
  ✅ POST endpoint issuing Supabase signed URLs for voice/background tracks  
  ✅ Metadata placeholders and job ID generation  
  ✅ Integration with frontend API contract  
  ✅ Comprehensive error handling and validation

- **BK-011 – Upload guidance & metadata schema** ✅ **DONE**  
  ✅ Client upload contract documented and implemented  
  ✅ Metadata models finalized (hash, mime, duration pending)  
  ✅ Validation utilities for file types and sizes  
  ✅ Frontend-compatible response schemas

- **BK-012 – Blob fetch utility** ✅ **DONE**  
  ✅ Worker helper to download via signed URL  
  ✅ Checksum verification and temp storage staging  
  ✅ Cleanup utilities and error handling  
  ✅ Unit tests for all utility functions

- **BK-013 – Retention script (manual)** ⏳ **PENDING**  
  CLI/management command to purge generated artifacts older than 48h; dry-run flag for manual operation.

## 🚀 **IMMEDIATE NEXT STEP: Frontend Integration Testing**

**Priority: BK-014 – End-to-End Frontend Integration**  
**Status: READY TO IMPLEMENT**  
**Estimated Time: 2-3 hours**

### What's Ready:
- ✅ All API endpoints match frontend expectations exactly
- ✅ Authentication flow compatible with Supabase frontend
- ✅ File upload flow via signed URLs
- ✅ Job creation and status tracking
- ✅ Error handling matches frontend error types

### Next Steps for Frontend Integration:
1. **Test API endpoints with frontend** - Verify all endpoints work with actual frontend calls
2. **Configure Supabase Storage** - Set up storage bucket and test file uploads
3. **Test authentication flow** - Ensure JWT tokens work end-to-end
4. **Validate job processing** - Test complete job lifecycle with real files
5. **Fix any integration issues** - Address any mismatches between frontend/backend

### Ready for Testing:
```bash
# Start backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Start frontend (in separate terminal)
cd frontend
npm run dev
```

## Phase 2 – Job Lifecycle & Processing Loop
- **BK-020 – Job submission endpoint**  
  POST /jobs with payload validation, ffprobe duration check, job + language task creation, enqueue via in-process worker.  
- **BK-021 – Job listing & detail APIs**  
  GET /jobs and GET /jobs/{id} returning per-language progress, stage timestamps, and artifact metadata.  
- **BK-022 – In-process worker engine**  
  Background worker loop polling pending jobs, controlling concurrency, and emitting progress heartbeats. Tested with mocked vendors.  
- **BK-023 – Vendor integration (Deepgram STT/TTS + OpenAI translate)**  
  Implement service clients, mockable interfaces, and store transcripts/audio per language.  
- **BK-024 – Media processing pipeline**  
  Alignment + mixing via librosa/ffmpeg, caption and manifest generation, upload outputs back to Supabase Storage. Includes golden-sample tests.  
- **BK-025 – Artifact download endpoint**  
  GET /jobs/{id}/download returning single-use signed URLs for generated assets with expiry enforcement.

## Phase 3 – Hardening Backlog
- **BK-030 – Queue swap readiness**  
  Abstract enqueue interface and document steps to drop in Redis/Dramatiq + worker container.  
- **BK-031 – Premium voice feature flag**  
  Scaffold optional ElevenLabs integration behind feature flag with configuration toggles.  
- **BK-032 – Billing groundwork**  
  Prepare job_events cost fields, export script, and notes for future Stripe integration.  
- **BK-033 – Observability hooks**  
  Structured logging adapters, basic metrics emission, and backlog notes for Prometheus/Grafana rollout.  
- **BK-034 – Automated retention & delete-now**  
  Scheduler integration and user-triggered deletion endpoint building on BK-013.
