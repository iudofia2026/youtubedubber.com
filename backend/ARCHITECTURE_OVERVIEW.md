# Backend Architecture Overview

## Direct Upload and Metadata Flow
    [User Browser] --> (JWT auth) --> [Supabase Auth]
    [User Browser] --> (signed URL request) --> [FastAPI API]
    [FastAPI API] --> (issue signed URL) --> [Supabase Storage]
    [User Browser] --> (upload voice/background) --> [Supabase Storage]
    [User Browser] --> (metadata notify) --> [FastAPI API]
    [FastAPI API] --> (persist job) --> [Supabase DB]
- Browser uploads directly to Supabase Storage; progress can rely on native browser events (service worker optional).
- API stores metadata, job records, and signed URLs. Raw audio stays in storage until the worker fetches it.

## Job Processing Pipeline (MVP)
    [FastAPI API] --> (enqueue) --> [In-Process Worker Queue]
    [Worker Thread] --> (STT) --> [Deepgram]
    [Worker Thread] --> (translation) --> [OpenAI Translate]
    [Worker Thread] --> (TTS) --> [Deepgram Voices]
    [Worker Thread] --> (alignment + mixing) --> [ffmpeg + librosa]
    [Worker Thread] --> (captions + manifest) --> [Artifact Builder]
    [Artifact Builder] --> (upload) --> [Supabase Storage]
    [Worker Thread] --> (progress update) --> [Supabase DB]
- Job scheduling uses an in-process background worker that polls for pending jobs; concurrency limits are controlled within the FastAPI service.
- language_tasks rows capture stage transitions (queued, stt, translating, dubbing, mixing, exporting, complete).
- Generated artifacts return to storage with metadata (hash, size, TTL) persisted in Supabase DB.
- A manual or cron-triggered retention script removes generated files after 48 hours.

## Monitoring and Upgrade Path
- MVP monitoring relies on structured application logs and Supabase/Postgres metrics.
- When throughput outgrows the in-process worker, swap the queue with Redis plus Dramatiq (or equivalent) without changing API contracts.
- Prometheus and Grafana dashboards, premium ElevenLabs TTS, and Stripe billing remain on the backlog until after the core pipeline is stable.
