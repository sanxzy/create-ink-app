/**
 * Unit tests for scaffold state resolution.
 *
 * Tests the precedence: CLI flags > user prompts > defaults.
 * The resolveScaffoldState function is a pure function that
 * merges user-provided flags with fallback defaults.
 */

import { describe, expect, it } from 'vitest';
import { resolveScaffoldState } from '@/application/commands/state-resolver';
import { DEFAULT_SCAFFOLD_INPUT } from '@/application/dtos/scaffold-input';

describe('resolveScaffoldState', () => {
  it('should use defaults when no flags are provided', () => {
    const result = resolveScaffoldState({}, DEFAULT_SCAFFOLD_INPUT);
    expect(result).toEqual(DEFAULT_SCAFFOLD_INPUT);
  });

  it('should override projectName when provided', () => {
    const result = resolveScaffoldState({ projectName: 'my-app' }, DEFAULT_SCAFFOLD_INPUT);
    expect(result.projectName).toBe('my-app');
    // Other fields should still be defaults
    expect(result.runtime).toBe(DEFAULT_SCAFFOLD_INPUT.runtime);
    expect(result.language).toBe(DEFAULT_SCAFFOLD_INPUT.language);
  });

  it('should override runtime when provided', () => {
    const result = resolveScaffoldState({ runtime: 'bun' }, DEFAULT_SCAFFOLD_INPUT);
    expect(result.runtime).toBe('bun');
    expect(result.language).toBe(DEFAULT_SCAFFOLD_INPUT.language);
  });

  it('should override language when provided', () => {
    const result = resolveScaffoldState({ language: 'javascript' }, DEFAULT_SCAFFOLD_INPUT);
    expect(result.language).toBe('javascript');
  });

  it('should override linter when provided', () => {
    const result = resolveScaffoldState({ linter: 'eslint-prettier' }, DEFAULT_SCAFFOLD_INPUT);
    expect(result.linter).toBe('eslint-prettier');
  });

  it('should override testFramework when provided', () => {
    const result = resolveScaffoldState({ testFramework: 'jest' }, DEFAULT_SCAFFOLD_INPUT);
    expect(result.testFramework).toBe('jest');
  });

  it('should override preCommit when provided', () => {
    const result = resolveScaffoldState({ preCommit: 'husky' }, DEFAULT_SCAFFOLD_INPUT);
    expect(result.preCommit).toBe('husky');
  });

  it('should override packageManager when provided', () => {
    const result = resolveScaffoldState({ packageManager: 'pnpm' }, DEFAULT_SCAFFOLD_INPUT);
    expect(result.packageManager).toBe('pnpm');
  });

  it('should override installDeps when provided', () => {
    const result = resolveScaffoldState({ installDeps: false }, DEFAULT_SCAFFOLD_INPUT);
    expect(result.installDeps).toBe(false);
  });

  it('should override overwrite when provided', () => {
    const result = resolveScaffoldState({ overwrite: true }, DEFAULT_SCAFFOLD_INPUT);
    expect(result.overwrite).toBe(true);
  });

  it('should override dryRun when provided', () => {
    const result = resolveScaffoldState({ dryRun: true }, DEFAULT_SCAFFOLD_INPUT);
    expect(result.dryRun).toBe(true);
  });

  it('should handle multiple overrides at once', () => {
    const result = resolveScaffoldState(
      {
        projectName: 'test-proj',
        runtime: 'bun',
        language: 'javascript',
        linter: 'none',
        testFramework: 'vitest',
        preCommit: 'none',
        packageManager: 'bun',
        installDeps: true,
        overwrite: true,
        dryRun: false,
      },
      DEFAULT_SCAFFOLD_INPUT,
    );
    expect(result.projectName).toBe('test-proj');
    expect(result.runtime).toBe('bun');
    expect(result.language).toBe('javascript');
    expect(result.linter).toBe('none');
    expect(result.testFramework).toBe('vitest');
    expect(result.preCommit).toBe('none');
    expect(result.packageManager).toBe('bun');
    expect(result.installDeps).toBe(true);
    expect(result.overwrite).toBe(true);
    expect(result.dryRun).toBe(false);
  });

  it('should not mutate the default input', () => {
    const original = { ...DEFAULT_SCAFFOLD_INPUT };
    resolveScaffoldState({ projectName: 'my-app' }, DEFAULT_SCAFFOLD_INPUT);
    expect(DEFAULT_SCAFFOLD_INPUT).toEqual(original);
  });
});
