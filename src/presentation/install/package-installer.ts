/**
 * Package installer service.
 *
 * Spawns the package manager install command using execa
 * and shows a spinner for progress feedback.
 *
 * Part of the presentation layer — handles user-facing install feedback.
 */

import { execa } from 'execa';
import type { Result } from '@/shared/errors/result';
import { err, ok } from '@/shared/errors/result';
import type { PackageManager } from '@/shared/types';

/** Spinner interface matching @clack/prompts spinner */
export interface InstallSpinner {
  start: (msg?: string) => void;
  stop: (msg?: string) => void;
  error: (msg?: string) => void;
  message: (msg?: string) => void;
}

export interface InstallOptions {
  cwd: string;
  packageManager: PackageManager;
  spinner: InstallSpinner;
}

export type PackageInstaller = (options: InstallOptions) => Promise<Result<void, string>>;

/**
 * Install dependencies using the detected package manager.
 *
 * Shows a spinner during installation and returns success/failure.
 */
export const installDependencies = async (
  options: InstallOptions,
): Promise<Result<void, string>> => {
  const { cwd, packageManager, spinner } = options;

  spinner.start('Installing dependencies...');

  try {
    const result = await execa(packageManager, ['install'], { cwd });

    if (result.failed || result.exitCode !== 0) {
      const errorMsg = result.stderr || `Install failed with exit code ${result.exitCode}`;
      spinner.error(`Installation failed: ${errorMsg}`);
      return err(errorMsg);
    }

    spinner.stop('Dependencies installed successfully');
    return ok(undefined);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    spinner.error(`Installation failed: ${errorMsg}`);
    return err(errorMsg);
  }
};
