# Backend Development Plan

## Goals
- Deliver a FastAPI-based pipeline that accepts voice plus background stems, validates duration alignment, and produces multilingual dubbed outputs without retaining source audio beyond processing.
- Keep processing metadata in Subabase (Postgres and Auth) while streaming large blobs directly between the browser, vendors, and workers.
- Surface per-language progress (queued -> stt -> translating -> dubbing -> mixing -> exporting -> complete) so the frontend can reflect live status.
- Operate in East-US, deleting generated assets after 48 hours and ensuring encrypted, compliant handling of user uploads.

## Architecture Assumptions
- Frameworks: FastAPI, SQLAlchemy, Alembic, Dramatiq worker with a Redis broker (Postgres fallbacks documented for cost-sensitive deployments).
- Auth and database: Subabase Auth JWTs with Row Level Security against Subabase Postgres.
- Storage: Signed Subabase Storage URLs; workers fetch via URL, store intermediates in encrypted temp space, and purge immediately after use.
- Vendors: Deepgram for both STT and TTS where quality is acceptable, with an optional ElevenLabs tier for premium voices; OpenAI gpt-4o mini translate for language conversion.
- Media tooling: ffmpeg plus librosa (or equivalent) for alignment, mixing, and export; WhisperX optional for enhanced timing when needed.
- Concurrency target: up to ten simultaneous jobs; backpressure managed via queue length alerts and rate throttling.

## Phase Breakdown

### Phase 0 – Discovery and Compliance
- Finalize Deepgram/OpenAI pricing, rate limits, and alert thresholds; document optional premium voice add-on.
- Document the forty-eight hour retention policy; map purge job and manual delete workflow.
- Define observability requirements (logs, minimal metrics, alert routing) and security posture (TLS, key rotation, audit logs).

### Phase 1 – Foundations
- Scaffold FastAPI project structure (api, services, repositories, schemas, workers).
- Implement configuration management with Pydantic settings and environment separation.
- Integrate Subabase Auth JWT validation middleware; seed RLS policies for per-user data isolation.
- Set up SQLAlchemy models and Alembic migrations for users, dubbing_jobs, language_tasks, artifacts, job_events.
- Establish CI workflows (linting, type checks, unit tests) and Docker images for API and worker services.

### Phase 2 – Upload Flow and Storage Strategy
- Implement endpoint to mint short-lived signed upload URLs for voice/background tracks; capture metadata (hash, mime, duration placeholder).
- Add client guidance for direct uploads and store only metadata references in the database.
- Build worker utility to retrieve blobs via signed URL, stream to local temp storage, and guarantee secure deletion after each stage.
- Create retention job to purge generated artifacts and metadata beyond forty-eight hours while preserving billing/log records.

### Phase 3 – Job Lifecycle APIs
- POST /jobs: validate payload, ensure voice/background durations match (ffprobe), register language tasks, enqueue background processing.
- GET /jobs: list latest jobs for authenticated users with high-level status, progress percentage, and created timestamps.
- GET /jobs/{id}: detailed per-language stage, percentage, ETA, and audit trail of events.
- GET /jobs/{id}/download: produce one-time signed URLs for voice-only, full-mix, caption files, and manifest JSON until retention window expires.
- Optional: Server-sent events or WebSocket channel emitting job updates to reduce polling overhead.

### Phase 4 – Processing Pipeline
- Configure Dramatiq with Redis (documenting how to swap to Postgres-based broker if needed) and set task routing, concurrency caps, failure hooks.
- Stage implementations:
  - STT: send voice track to Deepgram, store transcript plus timestamps.
  - Translation: call OpenAI translation per target language, persist translated transcripts.
  - TTS: synthesize translated speech via Deepgram Aura voices by default, with optional ElevenLabs fallback, capturing audio buffers.
  - Alignment and Mixing: align synthesized speech with original timing (librosa or WhisperX), merge over background track via ffmpeg, normalize loudness.
  - Captions and Manifest: generate SRT and VTT using translated transcripts and create manifest referencing exported artifacts.
- Update job and language task progress at stage boundaries and periodically for long-running tasks.
- Record vendor usage metrics and estimated costs per job and per language.

### Phase 5 – Observability, Billing, and Operations
- Integrate structured logging, lightweight metrics/exporters (Redis queue depth, job throughput), and simple alert hooks.
- Add retry/backoff policies and dead-letter handling; document replay procedure.
- Implement automated artifact purging and optional user-triggered delete-now endpoint.
- Document deployment (container orchestration in East-US, secrets management, disaster recovery) and incident response runbooks.

## Deliverables Per Phase
- Architecture diagrams and sequence flows highlighting direct-upload and worker streaming behavior.
- API reference (OpenAPI) aligning with frontend expectations.
- Processing pipeline tests using representative audio fixtures and mocked vendor responses.
- Operational dashboards/alerts once the system is live.

## Open Items / TBD
- Decide when to enable the premium ElevenLabs voice tier versus Deepgram-only offering.
- Determine minimum browser requirements for large direct uploads and background processing resilience.
- Evaluate need for regional redundancy or cold-storage backups beyond the forty-eight hour retention window.
