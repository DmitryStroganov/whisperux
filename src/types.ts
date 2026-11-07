export interface TranscriptionResult {
  filename: string;
  text: string;
  language: string;
  duration: number;
  timestamp: Date;
}

export interface QueueItem {
  file: File;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export interface HealthStatus {
  isHealthy: boolean;
  lastChecked: Date;
}

export type Language = 'en' | 'es' | 'it';

export interface LanguageOption {
  code: Language;
  name: string;
}