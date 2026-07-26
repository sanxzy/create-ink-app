/**
 * Unit tests for the presentation layer (argument parsing, output formatting).
 *
 * These tests exercise the CLI boundary code that was previously untested:
 * - parseArgs() — converts mri output to clean ParsedArgs DTO
 * - formatHelp() — usage text
 * - formatVersion() — version text
 * - formatScaffoldSuccess() — success output
 * - formatScaffoldError() — error output
 * - formatScaffoldResult() — combined result formatter
 */

import { describe, expect, it } from 'vitest';

import {
  formatHelp,
  formatScaffoldError,
  formatScaffoldResult,
  formatScaffoldSuccess,
  formatVersion,
} from '@/presentation/formatters/output-formatter';
import { parseArgs, parsedArgsToScaffoldInput } from '@/presentation/parsers/args-parser';
import { err, ok } from '@/shared/errors/result';

describe('parseArgs', () => {
  it('should parse project name from positional args', () => {
    const result = parseArgs({ _: ['my-app'] });
    expect(result.projectName).toBe('my-app');
  });

  it('should parse --help flag', () => {
    const result = parseArgs({ _: [], help: true });
    expect(result.help).toBe(true);
  });

  it('should parse --version flag', () => {
    const result = parseArgs({ _: [], version: true });
    expect(result.version).toBe(true);
  });

  it('should parse --no-interactive flag', () => {
    const result = parseArgs({ _: [], 'no-interactive': true });
    expect(result.noInteractive).toBe(true);
  });

  it('should parse camelCase noInteractive flag', () => {
    const result = parseArgs({ _: [], noInteractive: true });
    expect(result.noInteractive).toBe(true);
  });

  it('should parse --overwrite flag', () => {
    const result = parseArgs({ _: [], overwrite: true });
    expect(result.overwrite).toBe(true);
  });

  it('should parse --dry-run flag', () => {
    const result = parseArgs({ _: [], 'dry-run': true });
    expect(result.dryRun).toBe(true);
  });

  it('should parse camelCase dryRun flag', () => {
    const result = parseArgs({ _: [], dryRun: true });
    expect(result.dryRun).toBe(true);
  });

  it('should default flags to false when not provided', () => {
    const result = parseArgs({ _: ['my-app'] });
    expect(result.help).toBe(false);
    expect(result.version).toBe(false);
    expect(result.noInteractive).toBe(false);
    expect(result.overwrite).toBe(false);
    expect(result.dryRun).toBe(false);
  });

  it('should handle empty positional args', () => {
    const result = parseArgs({ _: [] });
    expect(result.projectName).toBe('');
  });

  it('should handle additional positional args as unknown', () => {
    const result = parseArgs({ _: ['my-app', 'extra', 'args'] });
    expect(result.unknownArgs).toEqual(['extra', 'args']);
  });
});

describe('parsedArgsToScaffoldInput', () => {
  it('should convert parsed args with project name', () => {
    const result = parsedArgsToScaffoldInput({
      help: false,
      version: false,
      noInteractive: true,
      overwrite: false,
      dryRun: false,
      projectName: 'my-app',
      unknownArgs: [],
    });
    expect(result.projectName).toBe('my-app');
    expect(result.runtime).toBe('node');
    expect(result.language).toBe('typescript');
    expect(result.dryRun).toBe(false);
    expect(result.overwrite).toBe(false);
  });

  it('should propagate overwrite and dryRun flags', () => {
    const result = parsedArgsToScaffoldInput({
      help: false,
      version: false,
      noInteractive: false,
      overwrite: true,
      dryRun: true,
      projectName: 'my-app',
      unknownArgs: [],
    });
    expect(result.overwrite).toBe(true);
    expect(result.dryRun).toBe(true);
  });

  it('should default project name to empty string when not provided', () => {
    const result = parsedArgsToScaffoldInput({
      help: false,
      version: false,
      noInteractive: false,
      overwrite: false,
      dryRun: false,
      projectName: '',
      unknownArgs: [],
    });
    expect(result.projectName).toBe('');
  });
});

describe('output-formatters', () => {
  describe('formatHelp', () => {
    const helpText = formatHelp();

    it('should contain usage information', () => {
      expect(helpText).toContain('create-ink-app');
      expect(helpText).toContain('<project-name>');
    });

    it('should list all options', () => {
      expect(helpText).toContain('--help');
      expect(helpText).toContain('--version');
      expect(helpText).toContain('--no-interactive');
      expect(helpText).toContain('--overwrite');
      expect(helpText).toContain('--dry-run');
    });
  });

  describe('formatVersion', () => {
    it('should return the version string', () => {
      expect(formatVersion('1.0.0')).toBe('1.0.0');
    });

    it('should return any version string', () => {
      expect(formatVersion('0.1.0')).toBe('0.1.0');
    });
  });

  describe('formatScaffoldSuccess', () => {
    const success = formatScaffoldSuccess({
      projectDir: 'my-app',
      files: ['my-app/package.json', 'my-app/source/app.tsx'],
    });

    it('should show success message', () => {
      expect(success).toContain('Project created successfully');
    });

    it('should show the project directory', () => {
      expect(success).toContain('my-app');
    });

    it('should list created files', () => {
      expect(success).toContain('package.json');
      expect(success).toContain('source/app.tsx');
    });

    it('should show next steps', () => {
      expect(success).toContain('cd my-app');
      expect(success).toContain('npm install');
      expect(success).toContain('npm run dev');
    });
  });

  describe('formatScaffoldError', () => {
    it('should format invalid_name error', () => {
      const text = formatScaffoldError({
        kind: 'invalid_name',
        message: 'Name is not valid',
      });
      expect(text).toContain('Invalid project name');
      expect(text).toContain('Name is not valid');
    });

    it('should format directory_exists error', () => {
      const text = formatScaffoldError({
        kind: 'directory_exists',
        message: 'Directory already exists',
      });
      expect(text).toContain('Directory already exists');
    });

    it('should format file_system error', () => {
      const text = formatScaffoldError({
        kind: 'file_system',
        message: 'Permission denied',
      });
      expect(text).toContain('File system error');
      expect(text).toContain('Permission denied');
    });

    it('should format template_error error', () => {
      const text = formatScaffoldError({
        kind: 'template_error',
        message: 'Template not found',
      });
      expect(text).toContain('Template error');
      expect(text).toContain('Template not found');
    });
  });

  describe('formatScaffoldResult', () => {
    it('should return exit code 0 for success', () => {
      const result = formatScaffoldResult(ok({ projectDir: 'my-app', files: [] }));
      expect(result.exitCode).toBe(0);
      expect(result.text).toContain('Project created successfully');
    });

    it('should return exit code 1 for error', () => {
      const result = formatScaffoldResult(err({ kind: 'invalid_name', message: 'Bad name' }));
      expect(result.exitCode).toBe(1);
      expect(result.text).toContain('Bad name');
    });
  });
});
