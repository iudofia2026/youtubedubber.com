# File Manifest: YouTube Multilingual Dubbing

## Project Structure

```
yt-multilang-dubber/
├── .gitignore                 # Git ignore rules
├── .env.example              # Environment variables template
├── .pre-commit-config.yaml   # Pre-commit hooks configuration
├── LICENSE                   # MIT License
├── Makefile                  # Development commands
├── README.md                 # Project documentation
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI/CD
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI application entry point
│   │   ├── routers/          # API route handlers
│   │   │   ├── __init__.py
│   │   │   ├── health.py     # Health check endpoints
│   │   │   └── jobs.py       # Job management endpoints
│   │   └── services/         # Audio processing services
│   │       ├── __init__.py
│   │       ├── stt.py        # Speech-to-Text service
│   │       ├── mt.py         # Machine Translation service
│   │       ├── tts.py        # Text-to-Speech service
│   │       ├── align.py      # Audio alignment service
│   │       ├── mix.py        # Audio mixing service
│   │       └── export.py     # File export service
│   └── requirements.txt      # Python dependencies
├── web/                      # Next.js frontend
│   ├── app/                  # Next.js App Router
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout component
│   │   ├── page.tsx          # Home page (upload form)
│   │   └── jobs/
│   │       └── [id]/
│   │           └── page.tsx  # Job status page
│   ├── src/
│   │   └── lib/
│   │       └── api.ts        # API client
│   ├── next.config.js        # Next.js configuration
│   ├── package.json          # Node.js dependencies
│   ├── postcss.config.js     # PostCSS configuration
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   └── tsconfig.json         # TypeScript configuration
└── docs/                     # Documentation
    ├── MVP.md               # MVP specification
    └── FILE_MANIFEST.md     # This file
```

## File Naming Conventions

### Audio Files

#### Input Files
- `voice_original.m4a` - Source voice-only audio
- `bed_original.m4a` - Background music/bed audio

#### Output Files
- `{job_id}-{lang}-voice_only.m4a` - Clean voice track
- `{job_id}-{lang}-full_mix.m4a` - Voice + background mix
- `{job_id}-{lang}-captions.srt` - Subtitle file

#### Temporary Files
- `{temp_id}.wav` - Intermediate processing files
- `{temp_id}.mp3` - TTS output files

### Language Codes

Format: `{language}-{country}` (ISO 639-1 + ISO 3166-1)

#### Supported Languages
- `en-US` - English (United States)
- `es-ES` - Spanish (Spain)
- `fr-FR` - French (France)
- `de-DE` - German (Germany)
- `it-IT` - Italian (Italy)
- `pt-PT` - Portuguese (Portugal)
- `ja-JP` - Japanese (Japan)
- `ko-KR` - Korean (South Korea)
- `zh-CN` - Chinese (Simplified)
- `ru-RU` - Russian (Russia)
- `ar-SA` - Arabic (Saudi Arabia)
- `hi-IN` - Hindi (India)

### Job IDs

Format: UUID v4 (e.g., `550e8400-e29b-41d4-a716-446655440000`)

### Directory Structure

#### Job Directories
```
outputs/
└── {job_id}/
    ├── voice_original.m4a
    ├── bed_original.m4a
    └── {language}/
        ├── {job_id}-{lang}-voice_only.m4a
        ├── {job_id}-{lang}-full_mix.m4a
        └── {job_id}-{lang}-captions.srt
```

#### Upload Directories
```
uploads/
└── {job_id}/
    ├── voice_original.m4a
    └── bed_original.m4a
```

## File Formats

### Audio Formats

#### Input Formats
- **Primary**: M4A (AAC codec)
- **Supported**: MP3, WAV, FLAC, OGG
- **Sample Rate**: 44.1kHz (preferred), 48kHz (accepted)
- **Channels**: Stereo (preferred), Mono (accepted)
- **Bitrate**: 128kbps+ (preferred)

#### Output Formats
- **Voice Only**: M4A (AAC, 192kbps, 44.1kHz, Stereo)
- **Full Mix**: M4A (AAC, 192kbps, 44.1kHz, Stereo)
- **Intermediate**: WAV (PCM, 44.1kHz, Stereo)

### Subtitle Formats

#### SRT Format
```
1
00:00:00,000 --> 00:00:10,000
Translated text here

2
00:00:10,000 --> 00:00:20,000
Next subtitle line
```

#### Future Formats
- VTT (WebVTT)
- ASS (Advanced SubStation Alpha)
- SSA (SubStation Alpha)

## File Size Limits

### Upload Limits
- **Maximum File Size**: 100MB per file
- **Total Upload**: 200MB per job
- **Supported Duration**: 1-60 minutes

### Storage Limits
- **Temporary Files**: 24-hour retention
- **Output Files**: 7-day retention
- **Cleanup**: Automatic cleanup of expired files

## File Validation

### Audio File Validation
- **Format Check**: Verify audio format and codec
- **Duration Check**: Ensure reasonable duration (1-60 minutes)
- **Quality Check**: Verify sample rate and bitrate
- **Size Check**: Enforce file size limits

### File Security
- **Path Traversal**: Prevent directory traversal attacks
- **File Type**: Validate file extensions and MIME types
- **Malware Scan**: Basic file content validation
- **Access Control**: Restrict file access to authorized users

## File Cleanup

### Automatic Cleanup
- **Temporary Files**: Removed after 24 hours
- **Failed Jobs**: Removed after 7 days
- **Completed Jobs**: Removed after 30 days
- **Orphaned Files**: Removed during maintenance

### Manual Cleanup
- **Admin Commands**: Manual cleanup via API
- **Logging**: Track cleanup operations
- **Monitoring**: Alert on storage usage

## File Delivery

### Download Methods
- **Direct Download**: HTTP file download
- **Streaming**: Chunked transfer for large files
- **Compression**: ZIP archives for multiple files
- **CDN**: Future cloud storage integration

### Access Control
- **Authentication**: Job-based access control
- **Expiration**: Time-limited download links
- **Rate Limiting**: Download rate limits
- **Logging**: Track download activities

## File Monitoring

### Metrics
- **File Count**: Track total files by type
- **Storage Usage**: Monitor disk space usage
- **Download Count**: Track file download statistics
- **Error Rate**: Monitor file processing errors

### Alerts
- **Storage Full**: Alert when storage exceeds 80%
- **Processing Errors**: Alert on file processing failures
- **Security Issues**: Alert on suspicious file activities
- **Performance**: Alert on slow file operations

## Future Enhancements

### File Management
- **Version Control**: Track file versions
- **Metadata**: Store file metadata and tags
- **Search**: Full-text search across files
- **Analytics**: File usage analytics

### Integration
- **Cloud Storage**: AWS S3, Google Cloud Storage
- **CDN**: CloudFront, CloudFlare
- **Backup**: Automated backup systems
- **Replication**: Multi-region file replication