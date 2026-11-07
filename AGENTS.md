# Agent Instructions for Whisper Transcriber

## Overview
This is a React TypeScript web application, integrating OpenAI Whisper API backend for converting audio to text.

## Features

- **Drag & Drop Upload**: Intuitive audio file selection with drag-and-drop support
- **Language Selection**: Auto-detect or manually select from 30+ supported languages
- **Real-time Feedback**: Loading states, error handling, and success indicators
- **Result Management**: Copy to clipboard, clear results
- **Responsive Design**: Mobile-friendly interface

## Functionality requirements

- whisper backend api health monitoring, every 20 sec, with green/red indication icon visible.
- user should be able to upload source media files.
- files should be queued for processing one by one, so that it does not block the user uploading.
- every processed media file time and name should be displayed in a history table, along with the resulting transcribtion.
- progress indication during background audio file processing.
- default language list shold be limited to: english, spanish, italian.

## Frontend
- **Tech Stack**: React 19.3.0, TypeScript 6, Class Components (no hooks)
- **Entry Point**: `src/index.tsx`
- **Build Tool**: Vite 6.0.0 (replaced webpack)
- **Build Output**: `build/`
- **Development Port**: 3000 (configurable via `PORT`)
- **Validation**: `npm run validate` (type-check + lint)
- **Scripts**:
  - `npm run dev` -- Start Vite dev server with HMR
  - `npm run build` -- Build production bundle


### Build, Run, Cleanup

use Makefile

## Backend
- **Always use Podman instead of Docker**
- **Tech Stack**: running in podman container on 'WHISPER_API_URL'.
- **API Trasncription Endpoint**: `/v1/audio/transcriptions`
- **API Health Endpoint**: `/health`
- **Default Port**: 8005

## Port Configuration

### Development Environment
- **Frontend**: Vite dev server runs on port 3000
- **Backend**: Whisper Backend API on port 8005
- **Proxy**: Vite proxy configured in `vite.config.ts` routes `/v1/audio` and `/health` to backend

### Production Environment
- **Use Podman Pod**
- **Frontend**: React compiled into static files, running inside container
- **Backend**: Serves both API and static files
- **API Path**: `/v1/audio` prefix for all Whisper API requests

### Environment Variables

| Variable | Description | Default | Dev | Prod |
|----------|-------------|---------|-----|-----|
| `WHISPER_API_URL` | Backend API base path | `127.0.0.1:8005` | N/A | `http://backend` |
| `VITE_APP_ENV` | Environment mode | `development` | `development` | `production` |
| `HEALTH_CHECK_INTERVAL` | Health check interval (ms) | `20000` | N/A | `20000` |


## API Requirements

### Supported Audio Formats
- WebM (Opus)
- WAV
- MP4 (AAC)
- MP3
- OGG
- M4A
- FLAC

### Maximum File Size
- 25 MB (frontend validation)
- 50 MB (backend validation)

### API Endpoint
```
POST /v1/audio/transcriptions
Content-Type: multipart/form-data

FormData:
- file: File (required)
- language: string (optional)
- model: string (optional)
- response_format: string (optional)
```


### Health Check Configuration
- `HEALTH_CHECK_INTERVAL`: Time between health checks in milliseconds (default: `20000`)
- Health status displayed with green/red indicator icon

### API Configuration
- `WHISPER_API_URL`: Base path for Whisper API (default: `127.0.0.1:8005`)

## Testing

sample voice file can be obtained here:

curl -L -o sample_speech.wav \
    "https://github.com/Azure-Samples/cognitive-services-speech-sdk/raw/master/sampledata/audiofiles/katiesteve.wav"