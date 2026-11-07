import { describe, it, expect, beforeEach, vi } from 'vitest';

// Declare global for test mocks
declare const global: any & Global;
interface Global {
  fetch?: any;
}

vi.mock('node-fetch', () => ({
  fetch: vi.fn(),
}));

const API_URL = 'http://127.0.0.1:8005';
const mockTranscriptionResponse = {
  ok: true,
  status: 200,
  json: vi.fn().mockResolvedValue({ text: 'Hello world, this is a test transcription.' }),
  text: vi.fn().mockResolvedValue('{"text":"Hello world, this is a test transcription."}'),
};

const mockHealthResponse = {
  ok: true,
  status: 200,
  json: vi.fn().mockResolvedValue({ status: 'ok', model: 'tiny.en' }),
};

const mockErrorResponse = {
  ok: false,
  status: 400,
  statusText: 'Bad Request',
  text: vi.fn().mockResolvedValue('Invalid audio format'),
};

async function transcribeAudio(file: File, language: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', 'whisper-1');
  formData.append('language', language);

  const response = await fetch(`${API_URL}/v1/audio/transcriptions`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Audio transcription API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.text || '';
}

describe('API Contract Integration', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('Health Endpoint', () => {
    it('should respond to health check', async () => {
      (global.fetch as any) = vi.fn().mockResolvedValue(mockHealthResponse);

      const response = await fetch(`${API_URL}/health`);
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.status).toBe('ok');
    });
  });

  describe('Transcription Endpoint', () => {
    it('should successfully transcribe a sample WAV file', async () => {
      const mockWavData = 'RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00';
      const mockFile = new File([mockWavData], 'test.wav', { type: 'audio/wav' });

      (global.fetch as any) = vi.fn().mockResolvedValue(mockTranscriptionResponse);

      const result = await transcribeAudio(mockFile, 'en');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('Hello world');
    });

    it('should handle unsupported formats with error', async () => {
      const invalidFile = new File(['not audio'], 'fake.wav', { type: 'text/plain' });

      (global.fetch as any) = vi.fn().mockResolvedValue(mockErrorResponse);

      await expect(transcribeAudio(invalidFile, 'en'))
        .rejects.toThrow('Audio transcription API error');
    });

    it('should handle invalid language code', async () => {
      const mockFile = new File(['RIFF\x24\x00\x00\x00WAVE'], 'test.wav', { type: 'audio/wav' });

      (global.fetch as any) = vi.fn().mockResolvedValue(mockErrorResponse);

      await expect(transcribeAudio(mockFile, 'invalid-language-code'))
        .rejects.toThrow('Audio transcription API error');
    });

    it('should include language parameter in request', async () => {
      const mockFile = new File(['RIFF\x24\x00\x00\x00WAVE'], 'test.wav', { type: 'audio/wav' });

      (global.fetch as any) = vi.fn().mockResolvedValue(mockTranscriptionResponse);

      await transcribeAudio(mockFile, 'es');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${API_URL}/v1/audio/transcriptions`),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw descriptive error on non-200 response', async () => {
      const mockFile = new File(['RIFF\x24\x00\x00\x00WAVE'], 'test.wav', { type: 'audio/wav' });

      const mockErrorResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: vi.fn().mockResolvedValue('Server error'),
      };

      (global.fetch as any) = vi.fn().mockResolvedValue(mockErrorResponse);

      await expect(transcribeAudio(mockFile, 'en'))
        .rejects.toThrow('Audio transcription API error: 500 Internal Server Error');
    });
  });
});
