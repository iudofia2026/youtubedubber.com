# Backend Ticket Breakdown

## Phase 0 – MVP Foundations
- **BK-001 – Project scaffold & configuration**  
  Create FastAPI project skeleton (api, services, schemas, background module) with Pydantic settings, pre-commit lint/type/test config, and Dockerfile.  
- **BK-002 – Supabase auth + RLS integration**  
  Implement JWT validation dependency, RLS policy scripts, and auth-aware test helpers. Acceptance: protected route returns 401 without token, 200 with seeded token.  
- **BK-003 – Database models & migrations**  
  Define SQLModel/SQLAlchemy models for users, dubbing_jobs, language_tasks, artifacts, job_events plus initial Alembic migration.  
- **BK-004 – Local dev & CI baseline**  
  Provide local .env.example, Makefile or npm scripts, and GitHub Actions (or equivalent) running lint, type check, unit tests.

## Phase 1 – Direct Upload Flow
- **BK-010 – Signed upload URL endpoint**  
  POST endpoint issuing Supabase signed URLs for voice/background tracks; persist metadata placeholders. Integration test covers happy path.  
- **BK-011 – Upload guidance & metadata schema**  
  Document client upload contract, finalize metadata models (hash, mime, duration pending), and add validation utilities.  
- **BK-012 – Blob fetch utility**  
  Worker helper to download via signed URL, verify checksum, stage to temp storage, and clean up. Includes unit tests.  
- **BK-013 – Retention script (manual)**  
  CLI/management command to purge generated artifacts older than 48h; dry-run flag for manual operation.

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
