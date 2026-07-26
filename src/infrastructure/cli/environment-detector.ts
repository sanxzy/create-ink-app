/**
 * Environment detection utilities.
 *
 * Detects characteristics of the execution environment:
 * - Package manager from npm_config_user_agent env var
 * - TTY/non-TTY from process.stdin.isTTY
 * - AI agent / CI environment from env vars and TTY status
 *
 * All functions accept optional parameters for dependency injection,
 * making them testable without mocking process.env or process.stdin.
 */

import type { PackageManager } from '@/shared/types';

/**
 * Detect the package manager from npm_config_user_agent env var.
 * Falls back to 'npm' if unable to detect.
 *
 * When `env` is explicitly provided, only its npm_config_user_agent is used.
 * When `env` is omitted, process.env.npm_config_user_agent is used.
 */
export const detectPackageManager = (env?: Record<string, string | undefined>): PackageManager => {
  const userAgent =
    env !== undefined
      ? (env.npm_config_user_agent ?? '')
      : (process.env.npm_config_user_agent ?? '');
  if (userAgent.includes('pnpm')) return 'pnpm';
  if (userAgent.includes('yarn')) return 'yarn';
  if (userAgent.includes('bun')) return 'bun';
  return 'npm';
};

/**
 * Determine if the environment is interactive (TTY).
 * Defaults to false when TTY status is unavailable.
 */
export const isInteractive = (stdinIsTTY?: boolean): boolean => {
  return stdinIsTTY ?? process.stdin.isTTY ?? false;
};

/**
 * Detect if running in an AI agent / CI environment.
 * Checks CI-related env vars and TTY status.
 *
 * When `env` is explicitly provided, only its values are checked.
 * When `env` is omitted, process.env is used.
 */
export const isAIAgent = (
  env?: Record<string, string | undefined>,
  stdinIsTTY?: boolean,
): boolean => {
  const e = env !== undefined ? env : process.env;
  const tty = stdinIsTTY ?? process.stdin.isTTY ?? false;

  // Check CI env vars
  if (e.CI === 'true' || e.CI === '1') return true;
  if (e.GITHUB_ACTIONS === 'true') return true;

  // Non-TTY stdin suggests automation (CI, pipe, etc.)
  if (!tty) return true;

  return false;
};
