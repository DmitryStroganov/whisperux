// Extend vitest's expect type to include toBeInTheDocument
import { expect, describe, it, beforeEach, vi } from 'vitest';

declare global {
  namespace Vitest {
    interface Assertion<T = unknown> {
      toBeInTheDocument(): Assertion<T>;
    }
    interface AsymmetricMatchResult {
      toBeInTheDocument(): boolean;
    }
    interface AsymmetricMatchersContaining {
      toBeInTheDocument(): AsymmetricMatchResult;
    }
    interface AsymmetricMatchers {
      toBeInTheDocument(): AsymmetricMatchersContaining;
    }
    interface Expect {
      toBeInTheDocument(): any;
    }
  }
}

declare module 'vitest' {
  interface Assertion<T = unknown> {
    toBeInTheDocument(): Assertion<T>;
  }
  interface AsymmetricMatchResult {
    toBeInTheDocument(): boolean;
  }
  interface AsymmetricMatchersContaining {
    toBeInTheDocument(): AsymmetricMatchResult;
  }
  interface AsymmetricMatchers {
    toBeInTheDocument(): AsymmetricMatchersContaining;
  }
  interface Expect {
    toBeInTheDocument(): any;
  }
  interface AsymmetricMatchersContaining {
    toBeInTheDocument(): AsymmetricMatchResult;
  }
}

export {};
