/**
 * Output formatters for CLI output.
 *
 * Translates Result types into human-readable console output.
 */

import type { ScaffoldError, ScaffoldResult } from '@/application/commands/scaffold-project';
import type { Result } from '@/shared/errors/result';
import type { PackageManager, Runtime } from '@/shared/types';

export interface ScaffoldOptions {
  runtime: Runtime;
  packageManager: PackageManager;
}

/** Get the run command for a given runtime */
export const getRunCommand = (runtime: Runtime): string => {
  return runtime === 'bun' ? 'bun run dev' : 'npm run dev';
};

/** Get the install command for a given package manager */
const getInstallCommand = (pm: PackageManager): string => {
  switch (pm) {
    case 'npm':
      return 'npm install';
    case 'pnpm':
      return 'pnpm install';
    case 'yarn':
      return 'yarn';
    case 'bun':
      return 'bun install';
  }
};

export const formatScaffoldSuccess = (
  result: ScaffoldResult,
  options?: ScaffoldOptions,
): string => {
  const runtime = options?.runtime ?? 'node';
  const packageManager = options?.packageManager ?? 'npm';
  const runCmd = getRunCommand(runtime);
  const installCmd = getInstallCommand(packageManager);

  const projectDirDisplay = result.projectDir === '.' ? 'Current directory' : result.projectDir;

  const lines: string[] = [
    '',
    '  ✓ Project created successfully!',
    '',
    `  Project: ${projectDirDisplay}`,
    '',
    '  Files created:',
    ...result.files.map((f) => `    • ${f}`),
    '',
    '  Next steps:',
  ];

  if (result.projectDir !== '.') {
    lines.push(`    cd ${result.projectDir}`);
  }

  lines.push(`    ${installCmd}`);
  lines.push(`    ${runCmd}`);
  lines.push('');

  return lines.join('\n');
};

export const formatScaffoldError = (error: ScaffoldError): string => {
  switch (error.kind) {
    case 'invalid_name':
      return `  ✗ Invalid project name: ${error.message}`;
    case 'directory_exists':
      return `  ✗ ${error.message}`;
    case 'file_system':
      return `  ✗ File system error: ${error.message}`;
    case 'template_error':
      return `  ✗ Template error: ${error.message}`;
    case 'runtime_not_found':
      return `  ✗ ${error.message}`;
    case 'not_writable':
      return `  ✗ ${error.message}`;
  }
};

export const formatHelp = (): string => {
  return [
    '',
    '  create-ink-app — Scaffold a complete Ink React CLI project',
    '',
    '  Usage:',
    '    create-ink-app <project-name> [options]',
    '',
    '  Arguments:',
    '    project-name            Name of the project to scaffold',
    '',
    '  Options:',
    '    --help                  Show this help message',
    '    --version               Show version number',
    '    --no-interactive        Skip interactive prompts',
    '    --overwrite             Overwrite existing directory',
    '    --no-overwrite          Do not overwrite existing directory',
    '    --dry-run               Preview files without writing',
    '    --immediate             Auto-install dependencies',
    '    --runtime <runtime>     Runtime: node | bun',
    '    --language <lang>       Language: typescript | javascript',
    '    --linter <linter>       Linter: biome | eslint-prettier | none',
    '    --test <framework>      Test framework: vitest | jest',
    '    --precommit <tool>      Pre-commit tool: lefthook | husky | none',
    '    --pm <manager>          Package manager: npm | pnpm | yarn | bun',
    '',
  ].join('\n');
};

export const formatVersion = (version: string): string => {
  return version;
};

export const formatScaffoldResult = (
  result: Result<ScaffoldResult, ScaffoldError>,
  options?: ScaffoldOptions,
): { text: string; exitCode: number } => {
  if (result.ok) {
    return { text: formatScaffoldSuccess(result.value, options), exitCode: 0 };
  }
  return { text: formatScaffoldError(result.error), exitCode: 1 };
};

/**
 * Format install instructions for non-immediate mode.
 * Shown after scaffolding when --immediate is not used.
 */
export const formatInstallInstructions = (
  packageManager: PackageManager,
  runtime?: Runtime,
): string => {
  const installCmd = getInstallCommand(packageManager);
  const lines: string[] = ['', '  📦 Next steps to get started:', '', `    ${installCmd}`];
  if (runtime) {
    lines.push(`    ${getRunCommand(runtime)}`);
  }
  lines.push('');
  return lines.join('\n');
};

/** Format a message for cancelled operation */
export const formatCancelMessage = (): string => {
  return ['', '  ⚠ Operation cancelled.', '  No files were written.', ''].join('\n');
};

/** Format a message indicating auto-detection of non-interactive mode */
export const formatNonInteractiveHint = (): string => {
  return '  ℹ Non-TTY detected: running in non-interactive mode. Use --help for usage.';
};

/** Format a message for AI agent detection */
export const formatAIAgentHint = (): string => {
  return [
    '  ℹ AI agent/CI environment detected.',
    '  ℹ Use --no-interactive mode with all required flags:',
    '    create-ink-app <project-name> --runtime node --language typescript --linter biome [options]',
    '  ℹ Run with --help to see all available options.',
  ].join('\n');
};
