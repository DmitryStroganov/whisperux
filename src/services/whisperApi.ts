import { Language } from '../types';

// Node.js polyfill for global fetch mock support
declare const global: any & Global;
interface Global {
  fetch?: any;
}

// Polyfill fetch for Node.js environments (e.g., containers, tests)
// Only import undici if fetch is undefined (browser has it built-in)
// Wrapped in IIFE to avoid top-level await issues in browser builds
if (typeof fetch === 'undefined') {
  // undici is a modern fetch implementation compatible with Node.js
  // Used for testing and containerized environments where browser fetch isn't available
  (function polyfillFetch() {
    import('undici').then(module => {
      global.fetch = module.fetch;
    }).catch(err => {
      console.warn('[Whisper API] Failed to polyfill fetch:', err.message);
    });
  })();
}

// Polyfill window for environments without DOM (tests, SSR)
if (typeof window === 'undefined') {
  // SAFETY: Minimal mock for test environments; invariant: tests that need real DOM will fail fast
  (global as any).window = {
    setInterval: setTimeout,
    clearInterval: clearTimeout,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    document: {
      createElement: () => ({
        value: '',
        select: () => {},
      }),
      body: {
        appendChild: () => {},
      },
    },
    navigator: {
      clipboard: {
        writeText: () => Promise.resolve(),
      },
    },
  };
}

/**
 * Whisper Audio API Configuration
 * 
 * API Endpoint: POST /v1/audio/transcriptions
 * 
 * Required Parameters:
 * - file: Audio file to transcribe (multipart/form-data)
 * - model: Whisper model to use (default: whisper-1)
 * - language: Language code for the audio (required)
 * 
 * Response Format:
 * The API returns a JSON object containing the transcription text.
 * 
 * Example Request:
 * curl http://<server-ip>:8005/v1/audio/transcriptions \
 *   -F file=@french-audio.mp3 \
 *   -F model=whisper-1 \
 *   -F language=en
 * 
 * Example Response:
 * {
 *   "text": "The transcription of the audio file.",
 *   "duration": 15.5,
 *   "language": "en"
 * }
 * 
 * Supported Audio Formats:
 * - WebM (Opus)
 * - WAV
 * - MP4 (AAC)
 * - MP3
 * - OGG
 * 
 * Maximum File Size: 25 MB
 */




/**
 * Build the API base URL from environment variables
 * Priority: Explicit VITE_ prefix > REACT_APP_ > generic > fallback
 */
function getApiBaseUrl(): string {
  const viteUrl = import.meta.env?.WHISPER_API_URL;
  if (viteUrl && viteUrl.trim()) {
    return viteUrl.trim();
  }
  
  return 'http://127.0.0.1:8005';
}

/**
 * Build the API URL for a given path.
 * Always returns a relative path so the reverse proxy handles routing:
 * - In development: Vite proxy intercepts /v1/audio/* -> backend
 * - In production: nginx proxies /v1/audio/* -> Whisper backend
 * 
 * @param path The API endpoint path
 * @returns Relative API path
 */
function buildApiUrl(path: string): string {
  return path;
}

/**
 * Build the health endpoint URL.
 * Always returns a relative path so the reverse proxy handles routing:
 * - In development: Vite proxy intercepts /health -> backend
 * - In production: nginx proxies /health -> Whisper backend
 * 
 * @returns Relative health path
 */
function buildHealthUrl(): string {
  return HEALTH_PATH;
}


const HEALTH_PATH = '/health';


const TRANSCRIPTIONS_PATH = '/v1/audio/transcriptions';




export async function transcribeAudio(file: File, language: Language, model = 'whisper-1'): Promise<string> {

  if (!file) {
    throw new Error('File is required for transcription');
  }
  if (!language) {
    throw new Error('Language is required for transcription');
  }

  console.log('[Whisper API] Starting transcription for file:', file.name, 'size:', file.size, 'bytes');
  console.log('[Whisper API] File type:', file.type);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', model);
  formData.append('language', language);


  console.log('[Whisper API] Sending request to:', buildApiUrl(TRANSCRIPTIONS_PATH));
  console.log('[Whisper API] FormData entries:', [
    ['file', file.name],
    ['model', model],
    ['language', language]
  ].map(([k, v]) => `${k}=${v}`).join(', '));

  const startTime = Date.now();
  
  try {
    const response = await fetch(buildApiUrl(TRANSCRIPTIONS_PATH), {
      method: 'POST',
      body: formData,

    });

    const requestDuration = Date.now() - startTime;
    console.log('[Whisper API] Response received in', requestDuration, 'ms');
    console.log('[Whisper API] Response status:', response.status, response.statusText);
    console.log('[Whisper API] Response headers:', response.headers ? Object.fromEntries(response.headers) : 'N/A (mock)');

    if (!response.ok) {
      const errorText = await response.text();
      const errorDetails = response.status + ' ' + response.statusText + (errorText ? ' - ' + errorText : '');
      console.error('[Whisper API] API Error:', errorDetails);
      throw new Error(`Audio transcription API error: ${errorDetails}`);
    }


    try {
      const data = await response.json();
      console.log('[Whisper API] Parsed JSON response:', data);

      return data.text || '';
    } catch (parseError) {
      console.log('[Whisper API] JSON parse error, falling back to text:', parseError);

      const responseText = await response.text();
      console.log('[Whisper API] Non-JSON response:', responseText);
      return responseText;
    }
  } catch (error) {
    console.error('[Whisper API] Request failed:', error);
    throw error;
  }
}

/**
 * Health check endpoint for the Whisper API
 * Returns true if the API is responding, false otherwise
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(buildHealthUrl(), {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Alternative health check by testing the transcriptions endpoint
 * This can be used as a fallback if the /health endpoint is unavailable
 */
export async function checkApiHealth(): Promise<boolean> {
  try {

    const formData = new FormData();
    const testFile = new Blob(['test'], { type: 'audio/wav' });
    formData.append('file', testFile, 'test.wav');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const response = await fetch(buildApiUrl(TRANSCRIPTIONS_PATH), {
      method: 'POST',
      body: formData,
    });

    return response.ok;
  } catch {
    return false;
  }
}
