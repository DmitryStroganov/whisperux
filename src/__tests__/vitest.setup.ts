// Polyfill fetch for Node.js test environments
if (typeof fetch === 'undefined') {
  (global as any).fetch = import('node-fetch').then(m => m.default);
}

// Polyfill window for test environments
if (typeof window === 'undefined') {
  // SAFETY: Minimal mock for test environments; invariant: tests that need real DOM will fail fast
  global.window = {
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
  } as unknown as Window & typeof globalThis;
}

// Polyfill performance for timing
if (typeof performance === 'undefined') {
  // SAFETY: Minimal mock for test environments; invariant: tests that need real performance API will fail fast
  (global as any).performance = {
    now: () => Date.now(),
  };
}

// Mock console to reduce noise in tests
const originalConsole = console;
// SAFETY: Minimal mock for test environments; invariant: tests that need real console will fail fast
(global as any).console = {
  log: (...args: any[]) => originalConsole.log(...args),
  error: (...args: any[]) => originalConsole.error(...args),
  warn: (...args: any[]) => originalConsole.warn(...args),
  // Silent other methods
  debug: () => {},
  info: () => {},
  trace: () => {},
  table: () => {},
  clear: () => {},
  time: () => {},
  timeEnd: () => {},
  group: () => {},
  groupCollapsed: () => {},
  groupEnd: () => {},
};
