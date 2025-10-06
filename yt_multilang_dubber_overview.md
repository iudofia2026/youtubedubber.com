# YouTube Multilingual Dubber – Project Overview

## 1. What This Project Is
We’re building **YouTube Multilingual Dubber**, a web-based tool for YouTubers to seamlessly add high-quality multilingual audio tracks to their videos. The app uses AI translation and voice cloning to produce ready-to-upload audio tracks for YouTube’s multi-audio feature.

**Problem:**  
Creators currently have to either re-upload entire videos for each language, or use low-quality automated dubbing.  
**Solution:**  
Our tool lets them upload their audio stems once and outputs perfectly aligned, mixed, and named tracks per language.

---

## 2. Core Workflow

1. **Upload**
   - Creator uploads two files:
     - **Voice-only track** (spoken audio without music/SFX)
     - **Background/bed track** (music, SFX, ambient audio)
2. **Process**
   - Speech-to-text (Deepgram/Whisper)
   - Translate transcript to target languages
   - Voice clone (ElevenLabs or equivalent) to generate dubbed speech
   - Align dubbed speech to original timing
   - Mix dubbed speech back over background track
3. **Output**
   - Per-language “voice-only” track (clean speech)
   - Per-language “full mix” track (dubbed speech + background)
   - Per-language captions (SRT/VTT)
   - Manifest file naming everything for easy upload
4. **Upload to YouTube**
   - Creator adds each language’s audio track into YouTube Studio’s “multi-audio” section
   - Viewers toggle languages in the YouTube player

---

## 3. Value Proposition

- **One-stop pipeline** – transcript → translate → voice clone → align → mix → export
- **Creator-grade quality** – consistent voice and timing, background audio preserved
- **YouTube-native handoff** – outputs are ready to upload, no manual DAW work
- **Undercut pricing** – cheaper than Rask, HeyGen, and Papercup while keeping ≥10% margin

---

## 4. Competitive Landscape & Pricing

| Competitor  | Typical Cost per Minute | Notes |
|-------------|-------------------------|-------|
| Rask AI     | ~$1.00/min              | Subscription + add-on minutes |
| HeyGen      | ~$3.00/min              | Easy UX but expensive at scale |
| ElevenLabs DIY | ~$0.60/min (raw API) | No timing/mixing pipeline |
| Papercup / Enterprise | $$$ | High-touch, sales-led |

Our projected cost per minute: **$0.66/min** (STT + translation + TTS).  
Pricing strategy: **$0.99/min** with volume tiers at $0.79–$0.89/min (≥10% margin and cheaper than most).

---

## 5. Front-End (Main Branch)

- **Framework:** Next.js 15.5.4 (App Router, TypeScript 5.9.3)
- **Styling:** Tailwind CSS 4 + shadcn/ui components + custom design system
- **Motion:** Framer Motion 12.23.22 micro-interactions (premium feel)
- **Design:** Sharp, geometric, minimalist, grid-based layout with zero border radius
- **Color Palette:** 
  - Light mode: `#ffffff` background, `#333333` text, `#ff0000` YouTube red accent
  - Dark mode: `#0f0f0f` background, `#ffffff` text, `#ff0000` accent
  - Colorblind-friendly with high contrast ratios
- **Typography:** DM Sans (primary), IBM Plex Mono (monospace), Roboto (YouTube branding)
- **Pages:**
  - **Home** (`/`) – Hero section with animated features, YouTube branding, CTA
  - **Upload** (`/new`) – 3-step wizard: voice track → background track → language selection
  - **Jobs** (`/jobs`) – Job listing page with empty state
  - **Job Status** (`/jobs/[id]`) – Real-time progress with individual language tracking
- **Key Components:**
  - `FileUpload` – Drag & drop with validation, duration extraction, file size limits
  - `IndividualLanguageProgress` – Per-language progress cards with download buttons
  - `LanguageChecklist` – Multi-select with search, flags, and validation
  - `ProgressBar` – Animated progress with status indicators
  - `Navigation` – Responsive nav with YouTube branding
- **Audio Processing:**
  - Client-side duration extraction and validation
  - Duration mismatch detection between voice/background tracks
  - Support for multiple audio formats (audio/*)
  - File size validation (100MB limit)
- **Mock Mode:** Comprehensive API simulation with realistic progress tracking
- **Development Tools:**
  - ESLint 9 with Next.js config
  - Turbopack for fast builds
  - TypeScript strict mode
  - MCP server integration for deliberate thinking

---

## 6. Backend (Separate Branch – Brian’s Focus)

- **FastAPI** backend
- Endpoints:
  - POST `/jobs` (multipart: voice_file, bed_file, languages) → returns job_id
  - GET `/jobs/{id}` → status JSON
  - GET `/jobs/{id}/download?lang=xx-XX&type=full|voice|captions` → file download
- Services:
  - STT (Deepgram/Whisper)
  - Translation (OpenAI or MT)
  - TTS/voice cloning (ElevenLabs/HeyGen)
  - Alignment & mixing (ffmpeg/librosa)
  - Exporter (bundles files + manifest)

---

## 7. Deliverables Per Language

| Output Type | Example Filename |
|-------------|------------------|
| Voice-only track | `<slug>-es-voice_only.m4a` |
| Full mix track | `<slug>-es-full_mix.m4a` |
| Captions file | `<slug>-es.srt` |
| Manifest | `manifest.json` |

---

## 8. Pricing Model (Quick Recap)

- **Cost baseline:** ~$0.66/min
- **Target price:** $0.99/min (volume $0.79–$0.89)
- **One-time setup per language:** $49 (covers voice-tuning & presets)
- **Goal:** Undercut Rask ($1/min) and HeyGen ($3/min) while maintaining 10–30% margin

---

## 9. Design Principles

- **Sharp geometry** – no rounded corners by default, 1px borders, ample spacing
- **Minimalist palette** – avoid clutter, focus on clarity
- **Premium motion** – subtle fade/slide/scale animations with Framer Motion
- **Accessibility** – colorblind-friendly, keyboard navigable, no color-only semantics

---

## 10. Current Branching Strategy

- `main` branch = **UI-only** scaffold (Next.js + Tailwind + Framer Motion). Mock API responses.
- `backend` branch = **FastAPI backend** scaffolding (Brian leads here).
- When backend is ready, connect via `NEXT_PUBLIC_API_URL`.

---

## 11. Summary for New Contributors

**In plain words:**  
We’re building a web app that lets YouTubers upload their voice-only track and background audio, automatically generate dubbed versions in multiple languages, and download perfectly mixed files ready to upload to YouTube Studio’s multi-audio feature. Front end = sharp, minimalist, modern. Backend = AI pipeline. Pricing = cheaper and higher quality than current options.

This document is self-contained so anyone reading it has the full context of what we’re building.
