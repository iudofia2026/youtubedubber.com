# Backend Development Plan

## Guiding Principles
- Ship a vertical slice quickly: accept uploads, process one job end-to-end, and return downloadable assets.
- Prefer a single FastAPI service with in-process background execution for the MVP; introduce external workers or queues only when throughput requires it.
- Consolidate on Supabase for auth, database, and storage. Defer third-party add-ons (premium TTS, billing, observability suites) until after the core dubbing loop is reliable.
- Document clear upgrade paths so future sprints can layer on Redis, Dramatiq, premium voices, Stripe billing, and monitoring without rework.

## Core Stack (MVP)
- API: FastAPI with SQLModel or SQLAlchemy plus Pydantic settings
- Storage/Auth/DB: Supabase (JWT validation middleware, Postgres tables, Storage signed URLs)
- Background execution: FastAPI BackgroundTasks helper or a dedicated async worker thread pulling pending jobs from Postgres
- Vendors: Deepgram (STT and default TTS) and OpenAI translation
- Media tooling: ffmpeg CLI and librosa helpers invoked from the worker
- Packaging: Dockerfile for API (worker runs in same container) with simple lint, type check, and unit test workflow

## Phase Breakdown

### Phase 0 – MVP Foundations
- Scaffold FastAPI project structure (api, services, repositories, schemas, background worker module).
- Implement configuration management with Pydantic settings and environment separation.
- Integrate Supabase Auth JWT validation middleware; apply RLS policies for per-user data isolation.
- Define SQLModel or SQLAlchemy models and Alembic migrations for tables such as users, dubbing_jobs, language_tasks, artifacts, job_events.
- Provide a minimal CI pipeline (lint, type checks, unit tests) and base Dockerfile.

### Phase 1 – Direct Upload Flow
- Add endpoint to mint short-lived signed upload URLs for voice and background tracks; persist metadata placeholders (hash, mime type, duration pending).
- Document client upload guidance (no service worker requirement). Store only metadata references; audio blobs remain in Supabase Storage.
- Build utility that retrieves blobs via signed URL, verifies checksum, streams to temp disk, and deletes temp data after use.
- Create simple management command or cron-ready script to purge generated artifacts older than 48 hours (manual execution acceptable during MVP).

### Phase 2 – Job Lifecycle and Processing Loop
- POST /jobs: validate payload, perform ffprobe duration check, create job and language tasks, enqueue processing via in-process worker.
- GET /jobs: list recent jobs for authenticated user with status summary.
- GET /jobs/{id}: expose per-language stage, progress percentage, and timestamps.
- Background worker stages:
  - STT with Deepgram stores transcript and timestamps.
  - Translation with OpenAI produces translated transcript per language.
  - TTS with Deepgram default voices yields audio buffers per language.
  - Alignment and mixing use librosa plus ffmpeg.
  - Captions and manifest generation upload outputs back to Supabase Storage and update metadata.
- Persist stage transitions and periodic heartbeats for progress tracking.
- Provide signed download URLs for artifacts via GET /jobs/{id}/download.

### Phase 3 – Hardening and Deferred Enhancements (Backlog)
Items documented for future sprints once the MVP is stable:
- Swap in Redis plus Dramatiq (or alternative) when concurrency exceeds in-process worker limits.
- Add premium ElevenLabs voice tier, caching presets, and usage metering.
- Introduce Stripe-based billing, usage tracking, and automated invoicing.
- Provide real-time push via server-sent events or WebSockets once polling proves insufficient.
- Layer on observability (Prometheus, Grafana), retry and backoff, and a dead-letter queue.
- Automate scheduled retention sweeper and user-triggered delete endpoint.

## Deliverables Per Phase
- Architecture notes describing in-process worker flow and upgrade path to external queues.
- OpenAPI schema aligning with frontend contract.
- Tests covering signed upload issuance, job submission, mocked vendor pipeline, and artifact downloads.
- Deployment notes for running API and worker in a single container.

## Upgrade Path Reference
- Queue/Worker: Replace background module with Dramatiq and Redis by swapping enqueue abstraction and configuring new settings module.
- Premium Voices: Extend TTS service with optional ElevenLabs implementation guarded by feature flag.
- Billing: Introduce Stripe webhooks and cost aggregation leveraging existing job_events table.
- Observability: Layer on structured logging exporters, metrics scraping, and alert routing without refactoring APIs.
