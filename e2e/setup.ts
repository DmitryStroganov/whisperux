// E2E test setup
import { beforeAll, afterAll, vi } from 'vitest';

// Mock fetch for API calls in e2e tests
vi.mock('node-fetch', () => ({
  fetch: vi.fn(),
}));

// Mock FormData to capture data
const capturedFormData: FormData[] = [];
const originalFormData = global.FormData;
global.FormData = class extends originalFormData {
  constructor() {
    super();
    capturedFormData.push(this);
  }
};

// Mock File API
const originalFile = global.File;
global.File = class extends originalFile {
  constructor(parts: BlobPart[], name: string, options?: FilePropertyBag) {
    super(parts, name, options);
  }
};

// Mock AudioContext for audio processing
vi.mock('webaudio', () => ({
  AudioContext: class {
    createMediaElementSource() { return {}; }
    createAnalyser() { return {}; }
  },
}));
