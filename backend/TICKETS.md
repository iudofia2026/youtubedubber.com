# Backend Ticket Breakdown

## Phase 0 – Discovery & Compliance
- **BK-001 – Vendor contracts and budget guardrails**  
  Define Deepgram/OpenAI/ElevenLabs (optional) usage tiers, rate limits, and alert thresholds. Acceptance: documented limits in ops wiki, cost dashboard stubs.  
- **BK-002 – Retention and deletion policy**  
  Specify 48 h asset retention, manual delete workflow, and audit requirements. Acceptance: policy doc + checklist approved.  
- **BK-003 – Observability posture**  
  Decide logging/metrics stack, data retention, and alert routing. Acceptance: runbook describing tools and on-call path.

## Phase 1 – Foundations
- **BK-010 – FastAPI project scaffold**  
  Generate repo structure with api/services/repositories/schemas/workers modules, Pydantic settings, lint/type/test baseline. Acceptance: tests run via CI.  
- **BK-011 – Subabase Auth integration**  
  Middleware validating JWTs, RLS policy scripts, auth-aware testing helpers. Acceptance: protected route returns 401 without valid token, 200 with seed token.  
- **BK-012 – Database models & migrations**  
  Implement SQLAlchemy models for users, dubbing_jobs, language_tasks, artifacts, job_events plus Alembic migrations. Acceptance: migration applies cleanly in local env.  
- **BK-013 – Container & CI setup**  
  Dockerfiles for API/worker, GitHub Actions (or equivalent) running lint/test/build. Acceptance: pipeline succeeds from clean checkout.

## Phase 2 – Upload Flow & Storage Strategy
- **BK-020 – Signed upload URL endpoint**  
  POST endpoint issuing Subabase signed URLs with metadata validation. Acceptance: integration test uploads sample file and records metadata row.  
- **BK-021 – Worker download helper**  
  Utility fetching audio via signed URL, verifying hash, cleaning temp storage. Acceptance: unit test verifying cleanup and hash mismatch error.  
- **BK-022 – Retention sweeper**  
  Scheduled job deleting artifacts older than 48 h and closing metadata. Acceptance: automated test simulating stale artifact deletion.

## Phase 3 – Job Lifecycle APIs
- **BK-030 – Submit job endpoint**  
  Validate payload, run ffprobe duration check, create job + language tasks, enqueue dramatiq workflow. Acceptance: E2E test posts sample job and sees queued status.  
- **BK-031 – Job listing endpoint**  
  GET /jobs returning paginated jobs for current user. Acceptance: seed data test verifies sorting and auth isolation.  
- **BK-032 – Job detail + progress API**  
  GET /jobs/{id} reflecting per-language stage, progress %, timestamps. Acceptance: worker mock updates propagate to API response.  
- **BK-033 – Artifact download endpoint**  
  Issues one-time signed URLs for generated outputs until TTL expires. Acceptance: integration test ensures expired artifacts reject download.

## Phase 4 – Processing Pipeline
- **BK-040 – Dramatiq & Redis queue infrastructure**  
  Configure broker/backend, task routing, concurrency caps, failure hooks. Acceptance: worker processes sample job, metrics emitted.  
- **BK-041 – STT + translation stage (Deepgram + OpenAI)**  
  Implement Deepgram transcript extraction and OpenAI translation per language. Acceptance: fixtures produce transcripts stored in DB.  
- **BK-042 – TTS synthesis stage**  
  Deepgram Aura TTS integration with optional ElevenLabs premium fallback, caching voice settings, handling rate limits. Acceptance: mocked vendor responses yield audio buffers.  
- **BK-043 – Alignment & mixing stage**  
  Use librosa/ffmpeg to align TTS audio with original timing and mix with background. Acceptance: golden audio comparison within tolerance.  
- **BK-044 – Captions & manifest export**  
  Generate SRT/VTT + manifest.json, upload via signed URLs. Acceptance: manifest lists all assets with hashes, download test passes.  
- **BK-045 – Progress telemetry**  
  Persist stage transitions and heartbeat updates for long tasks. Acceptance: queued job shows stage progression in API without front-end polling anomalies.

## Phase 5 – Observability, Billing & Operations
- **BK-050 – Logging & metrics plumbing**  
  Structured logs, Prometheus exporters, tracing hooks. Acceptance: metrics dashboard displays job throughput and failures.  
- **BK-051 – Retry & DLQ strategy**  
  Configure retry policy, dead-letter queue, replay CLI. Acceptance: simulated vendor failure lands in DLQ, replay succeeds.  
- **BK-052 – Billing usage tracker**  
  Aggregate vendor cost per job/language, expose admin report. Acceptance: cost report matches mocked vendor invoices.  
- **BK-053 – Deployment & runbook docs**  
  Compose deployment instructions for East-US cluster, secrets rotation, incident response. Acceptance: runbook reviewed and approved.
