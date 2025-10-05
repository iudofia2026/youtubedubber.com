# YouTube Multilingual Dubbing

Transform your YouTube videos with AI-powered multilingual dubbing. Upload your voice and background audio, select target languages, and get professional-quality dubbed content ready for YouTube's multi-audio feature.

## 🚀 Quick Start

```bash
# Install dependencies
make install

# Start development servers
make dev
```

- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

## 🏗️ Architecture

This is a monorepo containing:

- **Backend**: FastAPI application with audio processing services
- **Frontend**: Next.js application with modern UI
- **Services**: STT, MT, TTS, alignment, mixing, and export services

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+
- FFmpeg (for audio processing)
- API Keys:
  - Deepgram (Speech-to-Text)
  - ElevenLabs (Text-to-Speech)
  - OpenAI (Machine Translation)

## ⚙️ Environment Setup

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Add your API keys to `.env`:
```bash
DEEPGRAM_API_KEY=your_deepgram_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

## 🛠️ Development

### Backend Only
```bash
make dev-backend
```

### Frontend Only
```bash
make dev-frontend
```

### Run Tests
```bash
make test
```

### Format Code
```bash
make format
```

### Lint Code
```bash
make lint
```

## 🔄 Processing Pipeline

```
Voice + Bed → STT → MT → TTS/Clone → Align → Mix → Export → Upload to YouTube multi-audio
```

1. **STT (Speech-to-Text)**: Convert voice audio to text using Deepgram
2. **MT (Machine Translation)**: Translate text using OpenAI GPT-4
3. **TTS (Text-to-Speech)**: Generate speech in target language using ElevenLabs
4. **Align**: Synchronize translated speech with original timing
5. **Mix**: Combine voice with background audio
6. **Export**: Generate final audio files and subtitles

## 📁 File Structure

```
/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI app
│   │   ├── routers/        # API routes
│   │   └── services/       # Audio processing services
│   └── requirements.txt
├── web/                    # Next.js frontend
│   ├── app/                # App router pages
│   ├── src/lib/            # API client
│   └── package.json
├── docs/                   # Documentation
├── .github/workflows/      # CI/CD
└── Makefile               # Development commands
```

## 🎯 API Endpoints

### Jobs
- `POST /api/v1/jobs` - Create new dubbing job
- `GET /api/v1/jobs/{id}` - Get job status
- `GET /api/v1/jobs/{id}/download` - Download output files
- `GET /api/v1/jobs` - List all jobs

### Health
- `GET /api/v1/health` - Health check
- `GET /api/v1/health/detailed` - Detailed health status

## 📦 Output Files

For each target language, the system generates:

- `{job_id}-{lang}-voice_only.m4a` - Clean voice track
- `{job_id}-{lang}-full_mix.m4a` - Voice + background mix
- `{job_id}-{lang}-captions.srt` - Subtitle file

## 🌍 Supported Languages

- Spanish (es-ES)
- French (fr-FR)
- German (de-DE)
- Italian (it-IT)
- Portuguese (pt-PT)
- Japanese (ja-JP)
- Korean (ko-KR)
- Chinese Simplified (zh-CN)
- Russian (ru-RU)
- Arabic (ar-SA)
- Hindi (hi-IN)

## 🚀 Deployment

### Docker (Coming Soon)
```bash
docker-compose up -d
```

### Manual Deployment
1. Set up production environment variables
2. Install dependencies: `make install`
3. Build frontend: `make build`
4. Start backend: `uvicorn backend.app.main:app --host 0.0.0.0 --port 8000`
5. Start frontend: `cd web && npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `make test`
5. Format code: `make format`
6. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the API documentation at `/docs` when running locally

---

**Note**: This is an MVP version. Production deployment would require additional considerations for scalability, security, and monitoring.