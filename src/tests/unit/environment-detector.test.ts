/**
 * Unit tests for environment detection utilities.
 *
 * Tests:
 * - Package manager detection from npm_config_user_agent env var
 * - TTY/non-TTY detection
 * - AI agent / CI environment detection
 * - All with dependency injection for testability
 */

import { describe, expect, it } from 'vitest';
import {
  detectPackageManager,
  isAIAgent,
  isInteractive,
} from '@/infrastructure/cli/environment-detector';

describe('detectPackageManager', () => {
  it('should detect npm from user agent', () => {
    const result = detectPackageManager({ npm_config_user_agent: 'npm/8.0.0' });
    expect(result).toBe('npm');
  });

  it('should detect pnpm from user agent', () => {
    const result = detectPackageManager({ npm_config_user_agent: 'pnpm/6.0.0' });
    expect(result).toBe('pnpm');
  });

  it('should detect yarn from user agent', () => {
    const result = detectPackageManager({ npm_config_user_agent: 'yarn/1.22.0' });
    expect(result).toBe('yarn');
  });

  it('should detect bun from user agent', () => {
    const result = detectPackageManager({ npm_config_user_agent: 'bun/1.0.0' });
    expect(result).toBe('bun');
  });

  it('should fall back to npm when user agent is missing', () => {
    const result = detectPackageManager({});
    expect(result).toBe('npm');
  });

  it('should fall back to npm when user agent is undefined', () => {
    const result = detectPackageManager({ npm_config_user_agent: undefined });
    expect(result).toBe('npm');
  });

  it('should work without passing env (uses process.env)', () => {
    // Just verify the function can be called without crashing
    const result = detectPackageManager();
    expect(result).toBeTypeOf('string');
  });
});

describe('isInteractive', () => {
  it('should return true when stdin is TTY', () => {
    expect(isInteractive(true)).toBe(true);
  });

  it('should return false when stdin is not TTY', () => {
    expect(isInteractive(false)).toBe(false);
  });

  it('should return false when stdin is undefined (no TTY)', () => {
    expect(isInteractive(undefined)).toBe(false);
  });

  it('should work without arguments (uses process.stdin.isTTY)', () => {
    // Just verify the function can be called
    const result = isInteractive();
    expect(result).toBeTypeOf('boolean');
  });
});

describe('isAIAgent', () => {
  it('should detect CI environment via CI=true', () => {
    expect(isAIAgent({ CI: 'true' }, true)).toBe(true);
  });

  it('should detect CI environment via CI=1', () => {
    expect(isAIAgent({ CI: '1' }, true)).toBe(true);
  });

  it('should detect GitHub Actions', () => {
    expect(isAIAgent({ GITHUB_ACTIONS: 'true' }, true)).toBe(true);
  });

  it('should detect non-TTY stdin as automation', () => {
    expect(isAIAgent({}, false)).toBe(true);
  });

  it('should return false for interactive TTY without CI', () => {
    expect(isAIAgent({}, true)).toBe(false);
  });

  it('should return false for TTY with empty env', () => {
    expect(isAIAgent({ CI: 'false' }, true)).toBe(false);
  });

  it('should work without arguments (uses process.env and stdin)', () => {
    const result = isAIAgent();
    expect(result).toBeTypeOf('boolean');
  });
});
