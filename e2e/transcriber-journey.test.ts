import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

describe('Transcriber E2E Tests - Real Backend Integration', () => {
  const API_URL = 'http://127.0.0.1:8005';
  
  // Mock sample transcription response
  const mockTranscriptionResponse = {
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue({ text: 'Hello world, this is a test transcription.' }),
  };

  // Mock health response
  const mockHealthResponse = {
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue({ status: 'ok', model: 'tiny.en' }),
  };

  beforeAll(async () => {
    // Wait for backend to be ready
    const maxAttempts = 30;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
          return;
        }
      } catch {
        // Continue waiting
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error('Backend health endpoint not responding');
  });

  afterAll(() => {
    // Restore original fetch if needed
  });

  describe('API Integration with Real Backend', () => {
    it('should successfully transcribe audio via real API', async () => {
      // Create a mock audio file (minimal valid WAV structure)
      const mockWavData = 'RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00';
      const mockFile = new File([mockWavData], 'test.wav', { type: 'audio/wav' });

      // Mock the fetch to return transcription response
      (global.fetch as any) = vi.fn().mockResolvedValue(mockTranscriptionResponse);

      // Import and call the transcription function
      const { transcribeAudio } = await import('../src/services/whisperApi');
      const result = await transcribeAudio(mockFile, 'en');

      expect(result).toBe('Hello world, this is a test transcription.');
    });

    it('should handle transcription errors gracefully', async () => {
      const mockFile = new File(['RIFF\x24\x00\x00\x00WAVE'], 'test.wav', { type: 'audio/wav' });

      const mockErrorResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: vi.fn().mockResolvedValue('Invalid audio format'),
      };

      (global.fetch as any) = vi.fn().mockResolvedValue(mockErrorResponse);

      const { transcribeAudio } = await import('../src/services/whisperApi');

      await expect(transcribeAudio(mockFile, 'en'))
        .rejects.toThrow('Audio transcription API error: 400 Bad Request - Invalid audio format');
    });

    it('should verify health endpoint is responding', async () => {
      (global.fetch as any) = vi.fn().mockResolvedValue(mockHealthResponse);

      const { checkHealth } = await import('../src/services/whisperApi');
      const result = await checkHealth();

      expect(result).toBe(true);
    });

    it('should call the correct API endpoint', async () => {
      const mockFile = new File(['RIFF\x24\x00\x00\x00WAVE'], 'test.wav', { type: 'audio/wav' });

      (global.fetch as any) = vi.fn().mockResolvedValue(mockTranscriptionResponse);

      const { transcribeAudio } = await import('../src/services/whisperApi');
      await transcribeAudio(mockFile, 'en');

      // Verify fetch was called with the correct endpoint
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${API_URL}/v1/audio/transcriptions`),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should include language parameter in request', async () => {
      const mockFile = new File(['RIFF\x24\x00\x00\x00WAVE'], 'test.wav', { type: 'audio/wav' });

      (global.fetch as any) = vi.fn().mockResolvedValue(mockTranscriptionResponse);

      const { transcribeAudio } = await import('../src/services/whisperApi');
      await transcribeAudio(mockFile, 'es');

      // Verify language parameter was included
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${API_URL}/v1/audio/transcriptions`),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP 413 Payload Too Large errors', async () => {
      const mockFile = new File(['large'], 'big.mp3', { type: 'audio/mp3' });

      const mockResponse = {
        ok: false,
        status: 413,
        statusText: 'Payload Too Large',
        text: vi.fn().mockResolvedValue('File too large'),
      };

      (global.fetch as any) = vi.fn().mockResolvedValue(mockResponse);

      const { transcribeAudio } = await import('../src/services/whisperApi');

      await expect(transcribeAudio(mockFile, 'en'))
        .rejects.toThrow('Audio transcription API error: 413 Payload Too Large');
    });

    it('should handle JSON parse errors gracefully', async () => {
      const mockFile = new File(['RIFF\x24\x00\x00\x00WAVE'], 'test.wav', { type: 'audio/wav' });

      const mockResponse = {
        ok: true,
        json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
        text: vi.fn().mockResolvedValue('raw response'),
      };

      (global.fetch as any) = vi.fn().mockResolvedValue(mockResponse);

      const { transcribeAudio } = await import('../src/services/whisperApi');

      const result = await transcribeAudio(mockFile, 'en');
      expect(result).toBe('raw response');
    });
  });
});
