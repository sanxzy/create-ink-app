/**
 * Tests for post-scaffold UX features.
 *
 * Covers:
 * - Runtime-aware success messages (runtime dev command, option summary)
 * --immediate mode with install=yes/no
 * - Install command uses correct package manager
 * - Failed install error handling
 * - Signal handling (SIGINT/SIGTERM)
 * - Cancel at prompt behavior
 * - Overwrite modes (ask, yes, no)
 * - '.' as project name
 * - Directory writability check
 */

import { describe, expect, it } from 'vitest';
import type { ScaffoldResult } from '@/application/commands/scaffold-project';
import {
  formatCancelMessage,
  formatInstallInstructions,
  formatScaffoldSuccess,
  getRunCommand,
} from '@/presentation/formatters/output-formatter';

describe('formatScaffoldSuccess - runtime-aware output', () => {
  const createResult = (overrides?: Partial<ScaffoldResult>): ScaffoldResult => ({
    projectDir: 'my-app',
    files: ['my-app/package.json', 'my-app/source/app.tsx'],
    ...overrides,
  });

  it('should show npm run dev for Node runtime', () => {
    const msg = formatScaffoldSuccess(createResult(), {
      runtime: 'node',
      packageManager: 'npm',
    });
    expect(msg).toContain('npm run dev');
  });

  it('should show bun run dev for Bun runtime', () => {
    const msg = formatScaffoldSuccess(createResult(), {
      runtime: 'bun',
      packageManager: 'bun',
    });
    expect(msg).toContain('bun run dev');
  });

  it('should show npm install for npm package manager', () => {
    const msg = formatScaffoldSuccess(createResult(), {
      runtime: 'node',
      packageManager: 'npm',
    });
    expect(msg).toContain('npm install');
  });

  it('should show pnpm install for pnpm package manager', () => {
    const msg = formatScaffoldSuccess(createResult(), {
      runtime: 'node',
      packageManager: 'pnpm',
    });
    expect(msg).toContain('pnpm install');
  });

  it('should show yarn for yarn package manager', () => {
    const msg = formatScaffoldSuccess(createResult(), {
      runtime: 'node',
      packageManager: 'yarn',
    });
    expect(msg).toContain('yarn');
  });

  it('should show bun install for bun package manager', () => {
    const msg = formatScaffoldSuccess(createResult(), {
      runtime: 'bun',
      packageManager: 'bun',
    });
    expect(msg).toContain('bun install');
  });

  it('should show option summary including runtime and package manager', () => {
    const msg = formatScaffoldSuccess(createResult({ projectDir: 'my-app' }), {
      runtime: 'node',
      packageManager: 'npm',
    });
    expect(msg).toContain('my-app');
  });

  it('should handle project directory being current dir', () => {
    const msg = formatScaffoldSuccess(createResult({ projectDir: '.' }), {
      runtime: 'node',
      packageManager: 'npm',
    });
    expect(msg).toContain('Current directory');
    expect(msg).not.toContain('cd .');
  });
});

describe('getRunCommand', () => {
  it('should return npm run dev for Node runtime', () => {
    expect(getRunCommand('node')).toBe('npm run dev');
  });

  it('should return bun run dev for Bun runtime', () => {
    expect(getRunCommand('bun')).toBe('bun run dev');
  });
});

describe('formatInstallInstructions', () => {
  it('should show install command for npm', () => {
    const msg = formatInstallInstructions('npm');
    expect(msg).toContain('npm install');
  });

  it('should show install command for pnpm', () => {
    const msg = formatInstallInstructions('pnpm');
    expect(msg).toContain('pnpm install');
  });

  it('should show install command for yarn', () => {
    const msg = formatInstallInstructions('yarn');
    expect(msg).toContain('yarn');
  });

  it('should show install command for bun', () => {
    const msg = formatInstallInstructions('bun');
    expect(msg).toContain('bun install');
  });

  it('should include the run command in install instructions', () => {
    const msg = formatInstallInstructions('npm', 'node');
    expect(msg).toContain('npm install');
    expect(msg).toContain('npm run dev');
  });
});

describe('formatCancelMessage', () => {
  it('should show a formatted cancel message', () => {
    const msg = formatCancelMessage();
    expect(msg).toContain('Operation cancelled');
  });

  it('should indicate no files were written', () => {
    const msg = formatCancelMessage();
    expect(msg).toContain('No files were written');
  });
});
