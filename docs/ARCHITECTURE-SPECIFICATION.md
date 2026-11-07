# Whisper Transcriber - Comprehensive Documentation

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [User Experience (UX)](#4-user-experience-ux)
5. [Data Flow](#5-data-flow)
6. [State Management](#6-state-management)
7. [Configuration & Deployment](#7-configuration--deployment)
8. [Health Check Implementation](#8-health-check-implementation)
9. [Error Handling](#9-error-handling)
10. [Security](#10-security)
11. [Performance](#11-performance)
12. [API URL Configuration](#10-api-url-configuration)

---

## 1. System Overview

### 1.1 What This System Does

The **Whisper Transcriber** is a web-based application that enables users to convert audio files to text using OpenAI's Whisper AI model. It provides:

| Feature | Description |
|---------|-------------|
| **Batch Processing** | Upload and process multiple audio files in sequence |
| **Multi-Language Support** | Transcribe audio in over 99 languages |
| **Real-Time Health Monitoring** | Continuous backend health checks with auto-recovery |
| **Progress Tracking** | Visual feedback during transcription (0-100%) |
| **Offline Capability** | Progressive Web App features for offline queueing |

### 1.2 Architectural Paradigm

**Frontend-First Micro-Frontend Model**

The system adopts a frontend-first approach where the React SPA is the primary user interface, with minimal coupling to the backend. This paradigm choice enables:

| Characteristic | Implementation |
|----------------|----------------|
| **Deployment Independence** | Frontend builds as static assets; backend serves as API |
| **Technology Flexibility** | Backend can be swapped without frontend changes |
| **Scalability** | Frontend scales via CDN; backend scales independently |
| **Offline Capability** | Progressive Web App features for offline queueing |

---

## 2. Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT ENVIRONMENT                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Vite Dev Server                        │  │
│  │                  (Port 3000)                              │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              Vite Proxy Configuration               │  │  │
│  │  │  /v1/audio  →  http://127.0.0.1:8005               │  │  │
│  │  │  /health    →  http://127.0.0.1:8005               │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React App                             │  │
│  │  - whisperApi.ts uses relative paths                    │  │
│  │  - fetch('/v1/audio/transcriptions')                   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND ENVIRONMENT                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  FastAPI Server                          │  │
│  │                  (Port 8005)                             │  │
│  │  - /v1/audio/transcriptions                             │  │
│  │  - /health                                              │  │
│  │  - Static files (production)                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCTION ENVIRONMENT                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Backend Server                          │  │
│  │                  (Single Endpoint)                       │  │
│  │  - Serves API at /v1/audio/*                            │  │
│  │  - Serves static files at /                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React App                             │  │
│  │  - whisperApi.ts prepends backend base URL              │  │
│  │  - fetch('http://backend/v1/audio/transcriptions')     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.1 Component Boundaries

#### Frontend Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend Application                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  React 18 + TypeScript + Vite Build System                   ││
│  │  - SPA Router for navigation                                 ││
│  │  - State Management via React Hooks                          ││
│  │  - Component Library: Custom Hooks Pattern                    ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Services Layer (API Client)                                 ││
│  │  - whisperApi.ts: Configurable API URL support               ││
│  │  - Health check polling (20s interval)                       ││
│  │  - Request retry with exponential backoff                    ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  UI Components Layer                                        ││
│  │  - UploadArea: Drag-drop file selection                      ││
│  │  - FileQueue: In-progress transcription status               ││
│  │  - HistoryTable: Results display and export                  ││
│  │  - LanguageSelector: Language selection                       ││
│  │  - HealthIndicator: Backend health visualization              ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

#### Backend API Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  FastAPI (Python 3.10+)                                     ││
│  │  - RESTful API Design                                       ││
│  │  - Pydantic Models for Validation                           ││
│  │  - Dependency Injection                                     ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Whisper Integration                                        ││
│  │  - OpenAI Client                                            ││
│  │  - Model Management                                         ││
│  │  - Audio Preprocessing                                      ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Development vs Production Architecture

### Development Mode (`npm run dev`)

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT ENVIRONMENT                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Vite Dev Server                        │  │
│  │                  (Port 3000)                              │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              Vite Proxy Configuration               │  │  │
│  │  │  /v1/audio  →  http://127.0.0.1:8005               │  │  │
│  │  │  /health    →  http://127.0.0.1:8005               │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React App                             │  │
│  │  - whisperApi.ts uses relative paths                    │  │
│  │  - fetch('/v1/audio/transcriptions')                   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND API                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  FastAPI Server                          │  │
│  │                  (Port 8005)                             │  │
│  │  - /v1/audio/transcriptions                             │  │
│  │  - /health                                              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Characteristics:**
- Frontend runs locally via `npm run dev`
- API client uses relative paths (`/v1/audio`) - Vite proxy handles routing
- Backend runs in container on port 8005
- Hot Module Replacement (HMR) enabled for fast development
- Local file uploads (no containerization)

### Production Mode (Static Files + Podman Pods)

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCTION ENVIRONMENT                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Backend Server                          │  │
│  │                  (Single Endpoint)                       │  │
│  │  - Serves API at /v1/audio/*                            │  │
│  │  - Serves static files at /                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React App                             │  │
│  │  - whisperApi.ts prepends backend base URL              │  │
│  │  - fetch('http://backend/v1/audio/transcriptions')     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Characteristics:**
- Frontend built to `build/` directory
- Served via static endpoint in container/pod
- API client prepends backend base URL to API paths
- Files uploaded via backend API endpoint
- Full containerization with health monitoring

### Port Differences Handling

| Environment | API Path | Routing | Base URL |
|-------------|----------|---------|----------|
| Development | `/v1/audio` | Vite proxy | Relative |
| Production | `/v1/audio/*` | Backend server | `http://backend` |

### Environment Variables

| Variable | Description | Default | Dev | Prod |
|----------|-------------|---------|-----|-----|
| `WHISPER_API_URL` | Backend API base path | `127.0.0.1:8005` | N/A | `http://backend` |
| `VITE_APP_ENV` | Environment mode | `development` | `development` | `production` |
| `HEALTH_CHECK_INTERVAL` | Health check interval (ms) | `20000` | N/A | `20000` |

### 2.2 Health Check

The health check system provides robust backend monitoring:

| Component | Description |
|-----------|-------------|
| **Polling Interval** | Configurable via `HEALTH_CHECK_INTERVAL` (default: 20000ms) |
| **Response Formats** | Supports multiple formats: `{status: "ok"}`, `{status: "healthy"}`, `{isHealthy: true}`, etc. |
| **Recovery Detection** | Automatic detection when backend becomes available |
| **Retry Logic** | Configurable retries with exponential backoff |

---

## 3. Technology Stack

### 3.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18+ | UI framework and component library |
| **TypeScript** | 5+ | Type-safe JavaScript |
| **Vite** | 5+ | Fast build tool and dev server |
| **HTML5** | - | Drag-drop file selection API |
| **FormData API** | - | Multipart form encoding |

### 3.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **OpenAI SDK** | Latest | Whisper model integration |

### 3.3 DevOps & Deployment

| Tool | Purpose |
|------|---------|
| **Podman** | Container runtime |
| **Nginx** | Reverse proxy and static file server |

---

## 4. User Experience (UX)

### 4.1 User Interface Components

| Component | Description |
|-----------|-------------|
| **UploadArea** | Drag-and-drop file selection with visual feedback |
| **FileQueue** | Displays in-progress transcription status with progress indicators |
| **HistoryTable** | Shows transcription results with export functionality |
| **LanguageSelector** | Dropdown for selecting transcription language (99+ languages) |
| **HealthIndicator** | Visual status of backend health (online/offline indicators) |

### 4.2 User Flow

```
1. User lands on application
   └─→ Sees upload area and language selector
   └─→ Health indicator shows backend status

2. User selects/upload audio file
   └─→ File validated (type, size < 25MB)
   └─→ Added to processing queue

3. Transcription in progress
   └─→ Progress indicator updates (0-100%)
   └─→ Health checks run in background (every 20s)

4. Transcription complete
   └─→ Result displayed in HistoryTable
   └─→ Option to export or process more files
```

### 4.3 Feedback Mechanisms

| Action | User Feedback |
|--------|---------------|
| **File Upload** | Visual confirmation, progress bar |
| **Backend Health Change** | Console log: "[Health Check] Backend is back online!" |
| **Error** | Graceful degradation with retry options |
| **Completion** | Result display with export options |

---

## 5. Data Flow

### 5.1 Transcription Flow

```
┌──────────────┐
│  User Upload │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Frontend Validation                    │
│  - File type check                      │
│  - Size validation (max 25MB)           │
│  - Format validation                   │
└──────┬─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Queue Management                       │
│  - Add to processing queue             │
│  - Sequential processing                │
│  - Progress tracking (0-100%)           │
└──────┬─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  API Request                            │
│  - FormData encoding                   │
│  - Multi-part upload                   │
│  - Retry logic on failure              │
└──────┬─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Backend Processing                     │
│  - Audio preprocessing                 │
│  - Whisper model inference             │
│  - Text extraction                     │
└──────┬─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Response Handling                      │
│  - JSON parsing                        │
│  - Error handling                      │
│  - Result storage                      │
└─────────────────────────────────────────┘
```

### 5.2 Health Check Flow

```
┌──────────────┐
│  Frontend    │
│  App         │
└──────┬───────┘
       │
       ▼ (every 20 seconds)
┌─────────────────────────────────────────┐
│  Health Endpoint Call                   │
│  GET /health                           │
└──────┬─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Backend Health Check                   │
│  - Service availability                │
│  - Database connectivity               │
│  - Model loading status                │
└──────┬─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Response                              │
│  - 200 OK: Healthy                     │
│  - 503: Unhealthy                      │
└─────────────────────────────────────────┘
```

---

## 6. State Management

### 6.1 Application State

| State Variable | Type | Mutability | Update Trigger |
|----------------|------|------------|----------------|
| `queue` | `QueueItem[]` | Mutable | File selection, processing |
| `results` | `TranscriptionResult[]` | Mutable | Successful transcription |
| `health` | `HealthStatus` | Mutable | Health check callback |
| `language` | `Language` | Mutable | User selection |
| `processing` | `boolean` | Mutable | Queue processing |

### 6.2 State Update Pattern

```typescript
// Immutable state updates via setState callback
this.setState((prevState) => ({
  queue: prevState.queue.map(item => modifiedItem),
  results: [...prevState.results, newResult],
}));
```

### 6.3 Health State Model

| Property | Type | Description |
|----------|------|-------------|
| `isHealthy` | `boolean` | Backend health status |
| `lastCheck` | `Date` | Timestamp of last health check |
| `checkInterval` | `number` | Configurable interval in ms |
| `recoveryDetected` | `boolean` | Whether recovery was detected |

---

## 7. Configuration & Deployment

### 7.1 Environment Configuration

| Variable | Purpose | Default | Priority |
|----------|---------|---------|----------|
| `WHISPER_API_URL` | API endpoint URL | `http://127.0.0.1:8005` | 1 |
| `HEALTH_CHECK_INTERVAL` | Health check frequency | `20000` (ms) | - |

### 7.2 Configuration Resolution

```
Development (Vite Proxy Mode):
  Relative paths → Vite handles /v1/audio/* → backend at :8005

Production:
  Absolute URLs → Direct requests to configured backend
```

### 7.3 DEV vs PROD Deployment Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| **Frontend** | Vite Dev Server :8080 | Nginx/CDN :80/443 |
| **Backend** | Single FastAPI :8005 | Cluster behind Load Balancer |
| **Communication** | Vite Proxy Mode | Direct API Calls |
| **Health Checks** | Every 20s (configurable) | Configurable via env var |
| **CORS** | Development-friendly | Strict policies |
| **Logging** | Console logs | Structured logging |
| **Error Handling** | User-friendly messages | Detailed error reporting |

---

### 8.4 Health Check Response Format Support

The health check accepts multiple response formats from the backend:

| Response Format | Health Status |
|-----------------|---------------|
| `{ status: "healthy" }` | ✅ Healthy |
| `{ status: "unhealthy" }` | ❌ Unhealthy |
| `{ status: "ok" }` | ✅ Healthy (Whisper backend) |
| `{ isHealthy: true }` | ✅ Healthy |
| `{ healthy: true }` | ✅ Healthy |
| `{ healthy: false }` | ❌ Unhealthy |
| `{ unknown: "data" }` | ✅ Healthy (unknown format) |

### 8.5 Health Check Decision Tree

```
                    ┌─────────────────────┐
                    │  Fetch /health      │
                    └─────────┬───────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  Timeout (5s)?     │
                    └─────────┬───────────┘
                              │
                   Yes       │       No
                    ┌───────┼───────────┐
                    │       ▼           ▼
                    ▼   ┌──────────────┴───────┐
               Return   │  Response OK?        │
               False    └───────┬──────────────┘
                              │
                   Yes       │       No
                    ┌───────┼───────────┐
                    │       ▼           ▼
                    ▼   ┌──────────────┴───────┐
               Return   │  Valid JSON?         │
               False    └───────┬──────────────┘
                              │
                   Yes       │       No
                    ┌───────┼───────────┐
                    │       ▼           ▼
                    ▼   ┌──────────────┴───────┐
               Return   │  Valid Object?       │
               False    └───────┬──────────────┘
                              │
                   Yes       │       No
                    ┌───────┼───────────┐
                    │       ▼           ▼
                    ▼   ┌──────────────┴───────┐
               Return   │  Has status field?  │
               False    └───────┬──────────────┘
                              │
                   Yes       │       No
                    ┌───────┼───────────┐
                    │       ▼           ▼
                    ▼   ┌──────────────┴───────┐
               Return   │  status ===         │
               False    │  'healthy'?         │
                              │                  │
                   Yes       │       No
                    ┌───────┼───────────┐
                    │       ▼           ▼
                    ▼   ┌──────────────┴───────┐
               Return   │  isHealthy/          │
               True     │  healthy === true    │
                              │                  │
                   Yes       │       No
                    ┌───────┼───────────┐
                    │       ▼           ▼
                    ▼   ┌──────────────┴───────┐
               Return   │  healthy ===        │
               True     │  false?              │
                              │                  │
                   Yes       │       No
                    ┌───────┼───────────┐
                    │       ▼           ▼
                    ▼   ┌──────────────┴───────┐
               Return   │  Unknown format     │
               True     │  (assume healthy)   │
                              │                  │
```

### 8.6 Health Check Specification

**Expected Behaviors:**
| Scenario | Expected Return | Logging |
|----------|-----------------|---------|
| Backend unavailable | `false` | `'[Health Check] Backend unavailable: <error>'` |
| Network timeout | `false` | `'[Health Check] Backend reported unhealthy status: 408'` |
| Status "healthy" | `true` | `'[Health Check] Backend reports: healthy'` |
| Status "unhealthy" | `false` | `'[Health Check] Backend reports: unhealthy'` |
| Invalid JSON | `false` | `'[Health Check] Non-JSON response: <error>'` |
| Unknown format | `true` | `'[Health Check] Backend responded with unknown format, assuming healthy'` |

### 8.7 Configuration

| Variable | Description | Default | Unit |
|----------|-------------|---------|------|
| `HEALTH_CHECK_INTERVAL` | Time between health checks | `20000` | milliseconds |
| `WHISPER_API_URL` | API endpoint URL | `http://127.0.0.1:8005` | URL |

### 8.8 Key Features

1. **Automatic Recovery Detection**: Health check automatically detects when backend becomes available
2. **Retry Mechanism**: Multiple retries with configurable delays prevent false negatives
3. **Health Change Logging**: Console logs when backend transitions between states
4. **Performance Tracking**: Response times logged for debugging
5. **Robust Error Handling**: Graceful degradation on all error types
6. **Configurable Interval**: Health check interval can be configured via environment variable
7. **Multiple Response Format Support**: Compatible with various backend health response formats


## 9. Error Handling

### 9.1 Error Categories

| Category | Source | Handling |
|----------|--------|----------|
| **Network Errors** | API calls, health checks | Retry with exponential backoff |
| **Validation Errors** | File type, size | Immediate user feedback |
| **API Errors** | Backend responses | Graceful degradation, queue retry |
| **Processing Errors** | Whisper inference | Log error, skip file, continue queue |


### 9.3 Behavior Verification

| Scenario | Expected Behavior |
|----------|-------------------|
| **Backend Unavailable → Available** | UI status updates from [Offline] to [Online] with console log |
| **Network Failure** | Retry with backoff, graceful degradation |
| **API Error** | Error logged, queue item marked for retry |

---

## 10. Security

### 10.1 Data Security

| Concern | Mitigation |
|---------|------------|
| **PII in Transcriptions** | Client-side encryption option for sensitive content |
| **API Key Exposure** | Never log or expose API keys in frontend |
| **CORS Attacks** | Strict CORS policies on backend |
| **File Upload Limits** | Server-side size and type validation |

### 10.2 Access Control

- API keys stored server-side only
- Rate limiting per API key
- Request signing for production deployments

### 10.3 Security Best Practices

| Practice | Implementation |
|----------|----------------|
| **Environment Variables** | Use secure variable injection |
| **HTTPS** | Enforce TLS in production |
| **CORS Validation** | Validate and sanitize API URLs |
| **Logging** | Never log API keys or sensitive data |

---

## 11. Performance

### 11.1 Expected Latencies

| Operation | P50 | P95 | P99 |
|-----------|-----|-----|-----|
| Health Check | 50ms | 150ms | 300ms |
| Small File (<5MB) | 3s | 5s | 8s |
| Medium File (5-15MB) | 8s | 15s | 25s |
| Large File (15-25MB) | 15s | 30s | 45s |

### 11.2 Scalability Model

| Type | Implementation |
|------|----------------|
| **Horizontal** | Backend instances scale behind load balancer |
| **Vertical** | Increase CPU/Memory per instance |
| **Caching** | Consider caching common language models |

---

## 11. API URL Configuration

### 11.1 Priority Order

Environment variables are checked in the following order:

1. `WHISPER_API_URL` (highest priority)
4. Hardcoded fallback `http://127.0.0.1:8005` (lowest priority)

### 12.2 podman Configuration

#### Development with podman pods

```yaml
services:
  frontend:
    environment:
      - VITE_WHISPER_API_URL=http://backend:8005
```

#### Manual podman Run

```bash
podman run -p 8080:8080 \
  -e VITE_WHISPER_API_URL=http://backend:8005 \
  whisper-frontend
```

### 12.3 Testing

```bash
# Test with different API URLs
WHISPER_API_URL=http://localhost:8006 npm run dev

# Test in podman
podman run -p 8080:8080 -e WHISPER_API_URL=http://backend:8005 whisper-frontend
```

---


## 14. Glossary

| Term | Definition |
|------|------------|
| **SPA** | Single Page Application |
| **FormData** | HTML API for multipart encoding |
| **CORS** | Cross-Origin Resource Sharing |
| **P50/P95/P99** | Percentile latency measurements |
| **Health Check** | Periodic endpoint call to verify backend availability |
| **Exponential Backoff** | Retry strategy with increasing delay between attempts |
| **Graceful Degradation** | Maintaining partial functionality when errors occur |

---

