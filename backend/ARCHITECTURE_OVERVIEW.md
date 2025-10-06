# Backend Architecture Overview

## Direct Upload & Metadata Flow
```
[User Browser] --> (JWT auth) --> [Subabase Auth]
[User Browser] --> (signed URL request) --> [FastAPI API]
[FastAPI API] --> (issue signed URL) --> [Subabase Storage]
[User Browser] --> (upload voice/background) --> [Subabase Storage]
[User Browser] --> (metadata notify) --> [FastAPI API]
[FastAPI API] --> (persist job) --> [Subabase DB]
```
- Browser keeps the upload buffered locally until confirmation; a service worker can monitor progress.
- API retains only metadata and signed URLs; raw audio remains in storage until workers fetch it.

## Job Processing Pipeline
```
[FastAPI API] --> (enqueue) --> [Redis Queue]
[Redis Queue] --> (dispatch) --> [Dramatiq Worker]
[Dramatiq Worker] --> (STT) --> [Deepgram]
[Dramatiq Worker] --> (translation) --> [OpenAI Translate]
[Dramatiq Worker] --> (TTS) --> [Deepgram Aura / ElevenLabs]
[Dramatiq Worker] --> (alignment + mixing) --> [ffmpeg + librosa]
[Dramatiq Worker] --> (captions + manifest) --> [Artifact Builder]
[Artifact Builder] --> (upload) --> [Subabase Storage]
[Dramatiq Worker] --> (progress update) --> [Subabase DB]
```
- `language_tasks` rows capture stage transitions (queued, stt, translating, dubbing, mixing, exporting, complete).
- Artifacts return to storage with metadata (hash, size, TTL) persisted in Subabase DB.
- Retention sweeper removes generated files after 48 hours or sooner on user request.

## Monitoring & Feedback Loop
```
[Dramatiq Worker] --> (logs) --> [Log Aggregator]
[Dramatiq Worker] --> (metrics) --> [Prometheus / Grafana]
[FastAPI API] --> (status feed) --> [Frontend UI]
```
- Alerts fire when queue depth exceeds configured concurrency or when failure rate spikes.
- Billing/reporting jobs read cost metrics from `job_events` and artifact metadata for audits.
