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

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind + shadcn/ui components
- **Motion:** Framer Motion micro-interactions (premium feel)
- **Design:** sharp, geometric, minimalist, grid-based layout
- **Color Palette:** near-white background, near-black text, one accent color, neutral grays (colorblind-friendly)
- **Pages:**
  - **Home** – intro & CTA
  - **/new** – upload form (voice, background, language select, submit)
  - **/jobs/[id]** – job status page with progress and download links (mocked until backend ready)
- **Mock Mode:** If `NEXT_PUBLIC_API_URL` is empty, simulate API responses so the UI is viewable immediately.

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
