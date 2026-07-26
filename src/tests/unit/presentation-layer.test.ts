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
import { resolveScaffoldState } from '@/application/commands/state-resolver';
import { DEFAULT_SCAFFOLD_INPUT } from '@/application/dtos/scaffold-input';
import {
  formatCancelMessage,
  formatHelp,
  formatInstallInstructions,
  formatScaffoldError,
  formatScaffoldResult,
  formatScaffoldSuccess,
  formatVersion,
  getRunCommand,
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

  // New flag tests for WU-02
  it('should parse --runtime flag', () => {
    const result = parseArgs({ _: [], runtime: 'bun' });
    expect(result.runtime).toBe('bun');
  });

  it('should parse --language flag', () => {
    const result = parseArgs({ _: [], language: 'javascript' });
    expect(result.language).toBe('javascript');
  });

  it('should parse --linter flag', () => {
    const result = parseArgs({ _: [], linter: 'eslint-prettier' });
    expect(result.linter).toBe('eslint-prettier');
  });

  it('should parse --test flag', () => {
    const result = parseArgs({ _: [], test: 'vitest' });
    expect(result.testFramework).toBe('vitest');
  });

  it('should parse --precommit flag', () => {
    const result = parseArgs({ _: [], precommit: 'husky' });
    expect(result.preCommit).toBe('husky');
  });

  it('should parse --pm flag', () => {
    const result = parseArgs({ _: [], pm: 'pnpm' });
    expect(result.packageManager).toBe('pnpm');
  });

  it('should parse --no-overwrite flag', () => {
    const result = parseArgs({ _: [], 'no-overwrite': true });
    expect(result.overwrite).toBe(false);
    expect(result.noOverwrite).toBe(true);
  });

  it('should parse --immediate flag', () => {
    const result = parseArgs({ _: [], immediate: true });
    expect(result.immediate).toBe(true);
  });

  it('should use --no-overwrite to override --overwrite when both passed', () => {
    // When both overwrite and no-overwrite are true, no-overwrite wins
    const result = parseArgs({ _: [], overwrite: true, 'no-overwrite': true });
    expect(result.overwrite).toBe(false);
  });

  it('should default new flags when not provided', () => {
    const result = parseArgs({ _: ['my-app'] });
    expect(result.runtime).toBe('');
    expect(result.language).toBe('');
    expect(result.linter).toBe('');
    expect(result.testFramework).toBe('');
    expect(result.preCommit).toBe('');
    expect(result.packageManager).toBe('');
    expect(result.noOverwrite).toBe(false);
    expect(result.immediate).toBe(false);
  });
});

describe('parsedArgsToScaffoldInput', () => {
  it('should convert parsed args with project name', () => {
    const result = parsedArgsToScaffoldInput({
      help: false,
      version: false,
      noInteractive: true,
      overwrite: false,
      noOverwrite: false,
      dryRun: false,
      immediate: false,
      projectName: 'my-app',
      runtime: '',
      language: '',
      linter: '',
      testFramework: '',
      preCommit: '',
      packageManager: '',
      unknownArgs: [],
    });
    expect(result.projectName).toBe('my-app');
    expect(result.runtime).toBe('node');
    expect(result.language).toBe('typescript');
    expect(result.linter).toBe('biome');
    expect(result.preCommit).toBe('lefthook');
    expect(result.dryRun).toBe(false);
    expect(result.overwrite).toBe(false);
  });

  it('should propagate overwrite and dryRun flags', () => {
    const result = parsedArgsToScaffoldInput({
      help: false,
      version: false,
      noInteractive: false,
      overwrite: true,
      noOverwrite: false,
      dryRun: true,
      immediate: false,
      projectName: 'my-app',
      runtime: '',
      language: '',
      linter: '',
      testFramework: '',
      preCommit: '',
      packageManager: '',
      unknownArgs: [],
    });
    expect(result.overwrite).toBe(true);
    expect(result.dryRun).toBe(true);
  });

  it('should propagate provided flags into the scaffold input', () => {
    const result = parsedArgsToScaffoldInput({
      help: false,
      version: false,
      noInteractive: false,
      overwrite: true,
      noOverwrite: false,
      dryRun: false,
      immediate: false,
      projectName: 'my-app',
      runtime: 'bun',
      language: 'javascript',
      linter: 'none',
      testFramework: 'vitest',
      preCommit: 'none',
      packageManager: 'pnpm',
      unknownArgs: [],
    });
    expect(result.runtime).toBe('bun');
    expect(result.language).toBe('javascript');
    expect(result.linter).toBe('none');
    expect(result.testFramework).toBe('vitest');
    expect(result.preCommit).toBe('none');
    expect(result.packageManager).toBe('pnpm');
  });

  it('should default project name to empty string when not provided', () => {
    const result = parsedArgsToScaffoldInput({
      help: false,
      version: false,
      noInteractive: false,
      overwrite: false,
      noOverwrite: false,
      dryRun: false,
      immediate: false,
      projectName: '',
      runtime: '',
      language: '',
      linter: '',
      testFramework: '',
      preCommit: '',
      packageManager: '',
      unknownArgs: [],
    });
    expect(result.projectName).toBe('');
  });
});

describe('parsedArgsToScaffoldInput with resolveScaffoldState', () => {
  it('should override defaults with provided flags', () => {
    const partial = parsedArgsToScaffoldInput({
      help: false,
      version: false,
      noInteractive: false,
      overwrite: true,
      noOverwrite: false,
      dryRun: false,
      immediate: false,
      projectName: 'my-app',
      runtime: 'bun',
      language: 'javascript',
      linter: 'eslint-prettier',
      testFramework: 'vitest',
      preCommit: 'husky',
      packageManager: 'pnpm',
      unknownArgs: [],
    });
    const result = resolveScaffoldState(partial, DEFAULT_SCAFFOLD_INPUT);
    expect(result.projectName).toBe('my-app');
    expect(result.runtime).toBe('bun');
    expect(result.language).toBe('javascript');
    expect(result.linter).toBe('eslint-prettier');
    expect(result.preCommit).toBe('husky');
    expect(result.packageManager).toBe('pnpm');
    expect(result.overwrite).toBe(true);
  });

  it('should use defaults for values not provided', () => {
    const partial = parsedArgsToScaffoldInput({
      help: false,
      version: false,
      noInteractive: true,
      overwrite: false,
      noOverwrite: false,
      dryRun: false,
      immediate: false,
      projectName: 'my-app',
      runtime: '',
      language: '',
      linter: '',
      testFramework: '',
      preCommit: '',
      packageManager: '',
      unknownArgs: [],
    });
    const result = resolveScaffoldState(partial, DEFAULT_SCAFFOLD_INPUT);
    expect(result.projectName).toBe('my-app');
    expect(result.runtime).toBe('node');
    expect(result.language).toBe('typescript');
    expect(result.linter).toBe('biome');
    expect(result.preCommit).toBe('lefthook');
    expect(result.packageManager).toBe('npm');
    expect(result.installDeps).toBe(true);
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
      expect(helpText).toContain('--runtime');
      expect(helpText).toContain('--language');
      expect(helpText).toContain('--linter');
      expect(helpText).toContain('--test');
      expect(helpText).toContain('--precommit');
      expect(helpText).toContain('--pm');
      expect(helpText).toContain('--no-overwrite');
      expect(helpText).toContain('--immediate');
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

    it('should format not_writable error', () => {
      const text = formatScaffoldError({
        kind: 'not_writable',
        message: 'Directory is not writable',
      });
      expect(text).toContain('Directory is not writable');
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

    it('should accept ScaffoldOptions for runtime-aware output', () => {
      const result = formatScaffoldResult(ok({ projectDir: 'my-app', files: [] }), {
        runtime: 'bun',
        packageManager: 'bun',
      });
      expect(result.text).toContain('bun run dev');
      expect(result.text).toContain('bun install');
    });
  });

  describe('getRunCommand', () => {
    it('should return npm run dev for node', () => {
      expect(getRunCommand('node')).toBe('npm run dev');
    });

    it('should return bun run dev for bun', () => {
      expect(getRunCommand('bun')).toBe('bun run dev');
    });
  });

  describe('formatInstallInstructions', () => {
    it('should show install command for npm', () => {
      const msg = formatInstallInstructions('npm');
      expect(msg).toContain('npm install');
    });

    it('should show install and run command when runtime provided', () => {
      const msg = formatInstallInstructions('npm', 'node');
      expect(msg).toContain('npm install');
      expect(msg).toContain('npm run dev');
    });
  });

  describe('formatCancelMessage', () => {
    it('should show cancel message', () => {
      const msg = formatCancelMessage();
      expect(msg).toContain('Operation cancelled');
      expect(msg).toContain('No files were written');
    });
  });
});
