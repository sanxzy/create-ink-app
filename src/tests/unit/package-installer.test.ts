/**
 * Tests for the package installer service.
 *
 * Covers:
 * - Spawning install via execa with correct package manager command
 * - Spinner start/stop on success
 * - Spinner error on failure
 * - Handling different package managers
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock execa before importing the module
const mockExeca = vi.fn();
vi.mock('execa', () => {
  return { execa: mockExeca };
});

// Import after mocking
import { installDependencies } from '@/presentation/install/package-installer';

describe('installDependencies', () => {
  const createMockSpinner = () => {
    const start = vi.fn();
    const stop = vi.fn();
    const error = vi.fn();
    const message = vi.fn();
    return { start, stop, error, message };
  };

  beforeEach(() => {
    mockExeca.mockClear();
  });

  it('should spawn install with npm for npm package manager', async () => {
    const mockResult = { stdout: '', stderr: '', exitCode: 0, failed: false };
    mockExeca.mockResolvedValue(mockResult);

    const spinner = createMockSpinner();
    await installDependencies({ cwd: '/tmp/test', packageManager: 'npm', spinner });

    expect(mockExeca).toHaveBeenCalledWith('npm', ['install'], { cwd: '/tmp/test' });
  });

  it('should spawn install with pnpm for pnpm package manager', async () => {
    const mockResult = { stdout: '', stderr: '', exitCode: 0, failed: false };
    mockExeca.mockResolvedValue(mockResult);

    const spinner = createMockSpinner();
    await installDependencies({ cwd: '/tmp/test', packageManager: 'pnpm', spinner });

    expect(mockExeca).toHaveBeenCalledWith('pnpm', ['install'], { cwd: '/tmp/test' });
  });

  it('should spawn install with yarn for yarn package manager', async () => {
    const mockResult = { stdout: '', stderr: '', exitCode: 0, failed: false };
    mockExeca.mockResolvedValue(mockResult);

    const spinner = createMockSpinner();
    await installDependencies({ cwd: '/tmp/test', packageManager: 'yarn', spinner });

    expect(mockExeca).toHaveBeenCalledWith('yarn', ['install'], { cwd: '/tmp/test' });
  });

  it('should spawn install with bun for bun package manager', async () => {
    const mockResult = { stdout: '', stderr: '', exitCode: 0, failed: false };
    mockExeca.mockResolvedValue(mockResult);

    const spinner = createMockSpinner();
    await installDependencies({ cwd: '/tmp/test', packageManager: 'bun', spinner });

    expect(mockExeca).toHaveBeenCalledWith('bun', ['install'], { cwd: '/tmp/test' });
  });

  it('should start spinner before install', async () => {
    const mockResult = { stdout: '', stderr: '', exitCode: 0, failed: false };
    mockExeca.mockResolvedValue(mockResult);

    const spinner = createMockSpinner();
    await installDependencies({ cwd: '/tmp/test', packageManager: 'npm', spinner });

    expect(spinner.start).toHaveBeenCalledWith('Installing dependencies...');
  });

  it('should stop spinner on successful install', async () => {
    const mockResult = { stdout: '', stderr: '', exitCode: 0, failed: false };
    mockExeca.mockResolvedValue(mockResult);

    const spinner = createMockSpinner();
    await installDependencies({ cwd: '/tmp/test', packageManager: 'npm', spinner });

    expect(spinner.stop).toHaveBeenCalledWith('Dependencies installed successfully');
  });

  it('should show error on failed install', async () => {
    const mockResult = { stdout: '', stderr: 'Install failed', exitCode: 1, failed: true };
    mockExeca.mockResolvedValue(mockResult);

    const spinner = createMockSpinner();
    const result = await installDependencies({
      cwd: '/tmp/test',
      packageManager: 'npm',
      spinner,
    });

    expect(spinner.error).toHaveBeenCalled();
    expect(result.ok).toBe(false);
  });

  it('should handle execa throwing an error', async () => {
    mockExeca.mockRejectedValue(new Error('Command not found'));

    const spinner = createMockSpinner();
    const result = await installDependencies({
      cwd: '/tmp/test',
      packageManager: 'npm',
      spinner,
    });

    expect(spinner.error).toHaveBeenCalled();
    expect(result.ok).toBe(false);
  });

  it('should return success result on successful install', async () => {
    const mockResult = { stdout: '', stderr: '', exitCode: 0, failed: false };
    mockExeca.mockResolvedValue(mockResult);

    const spinner = createMockSpinner();
    const result = await installDependencies({
      cwd: '/tmp/test',
      packageManager: 'npm',
      spinner,
    });

    expect(result.ok).toBe(true);
  });
});
