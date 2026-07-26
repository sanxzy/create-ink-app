/**
 * Output formatters for CLI output.
 *
 * Translates Result types into human-readable console output.
 */

import type { ScaffoldError, ScaffoldResult } from '@/application/commands/scaffold-project';
import type { Result } from '@/shared/errors/result';

export const formatScaffoldSuccess = (result: ScaffoldResult): string => {
  const lines: string[] = [
    '',
    '  ✓ Project created successfully!',
    '',
    `  Project directory: ${result.projectDir}`,
    '',
    '  Files created:',
    ...result.files.map((f) => `    • ${f}`),
    '',
    '  Next steps:',
    `    cd ${result.projectDir}`,
    '    npm install',
    '    npm run dev',
    '',
  ];
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
): { text: string; exitCode: number } => {
  if (result.ok) {
    return { text: formatScaffoldSuccess(result.value), exitCode: 0 };
  }
  return { text: formatScaffoldError(result.error), exitCode: 1 };
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
