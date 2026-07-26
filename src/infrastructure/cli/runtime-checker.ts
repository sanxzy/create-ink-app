/**
 * Runtime checker — validates that the expected runtime is installed
 * before scaffolding proceeds.
 *
 * Lives in the infrastructure layer because it calls external processes.
 */

import { execSync } from 'node:child_process';
import type { Result } from '@/shared/errors/result';
import { err, ok } from '@/shared/errors/result';

/** Check that Node.js is installed and return its version */
export const makeNodeRuntimeChecker = (): (() => Result<
  string,
  {
    kind: 'runtime_not_found';
    message: string;
  }
>) => {
  return () => {
    try {
      const output = execSync('node --version', {
        encoding: 'utf-8',
        timeout: 5000,
      });
      return ok(output.trim());
    } catch (error) {
      return err({
        kind: 'runtime_not_found' as const,
        message: `Node.js is not available: ${(error as Error).message}`,
      });
    }
  };
};

/** Check that Bun is installed and return its version */
export const makeBunRuntimeChecker = (): (() => Result<
  string,
  {
    kind: 'runtime_not_found';
    message: string;
  }
>) => {
  return () => {
    try {
      const output = execSync('bun --version', {
        encoding: 'utf-8',
        timeout: 5000,
      });
      return ok(output.trim());
    } catch (error) {
      return err({
        kind: 'runtime_not_found' as const,
        message: `Bun is not available: ${(error as Error).message}`,
      });
    }
  };
};
