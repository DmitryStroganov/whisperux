import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transcribeAudio, checkHealth, checkApiHealth } from '../../services/whisperApi';

// Declare global for test mocks
declare const global: any & Global;
interface Global {
  fetch?: any;
}

describe('whisperApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('transcribeAudio', () => {
    it('should successfully transcribe audio with valid input', async () => {
      const mockFile = new File(['fake audio data'], 'test.wav', { type: 'audio/wav' });
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ text: 'Transcribed text' }),
      };
      vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      const result = await transcribeAudio(mockFile, 'en');

      expect(result).toBe('Transcribed text');
      expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:8005/v1/audio/transcriptions', {
        method: 'POST',
        body: expect.any(FormData),
      });
    });

    it('should throw error when file is missing', async () => {
      await expect(transcribeAudio(undefined as any, 'en')).rejects.toThrow(
        'File is required for transcription'
      );
    });

    it('should throw error when language is missing', async () => {
      const mockFile = new File(['fake'], 'test.wav', { type: 'audio/wav' });
      await expect(transcribeAudio(mockFile, undefined as any)).rejects.toThrow(
        'Language is required for transcription'
      );
    });

    it('should handle HTTP 400 Bad Request errors', async () => {
      const mockFile = new File(['fake'], 'test.wav', { type: 'audio/wav' });
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: vi.fn().mockResolvedValue('Invalid audio format'),
      };
      vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      await expect(transcribeAudio(mockFile, 'en')).rejects.toThrow(
        'Audio transcription API error: 400 Bad Request - Invalid audio format'
      );
    });

    it('should handle HTTP 413 Payload Too Large errors', async () => {
      const mockFile = new File(['large'], 'big.mp3', { type: 'audio/mp3' });
      const mockResponse = {
        ok: false,
        status: 413,
        statusText: 'Payload Too Large',
        text: vi.fn().mockResolvedValue('File too large'),
      };
      vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      await expect(transcribeAudio(mockFile, 'en')).rejects.toThrow(
        'Audio transcription API error: 413 Payload Too Large'
      );
    });

    it('should handle JSON parse errors gracefully', async () => {
      const mockFile = new File(['fake'], 'test.wav', { type: 'audio/wav' });
      const mockResponse = {
        ok: true,
        json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
        text: vi.fn().mockResolvedValue('raw response'),
      };
      vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      const result = await transcribeAudio(mockFile, 'en');
      expect(result).toBe('raw response');
    });

    it('should return empty string when API returns empty text', async () => {
      const mockFile = new File(['fake'], 'test.wav', { type: 'audio/wav' });
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ text: '' }),
      };
      vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      const result = await transcribeAudio(mockFile, 'en');
      expect(result).toBe('');
    });
  });

  describe('checkHealth', () => {
    it('should return true when health endpoint is healthy', async () => {
      const mockResponse = { ok: true };
      vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      const result = await checkHealth();
      expect(result).toBe(true);
    });

    it('should return false when health endpoint fails', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      const result = await checkHealth();
      expect(result).toBe(false);
    });

    it('should return false on HTTP error', async () => {
      const mockResponse = { ok: false };
      vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      const result = await checkHealth();
      expect(result).toBe(false);
    });
  });
});
