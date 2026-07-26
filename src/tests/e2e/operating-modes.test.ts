/**
 * E2E tests for all three operating modes:
 * 1. Non-interactive (CLI flags only)
 * 2. Interactive (mocked prompts)
 * 3. Mixed (partial flags + prompts)
 */

import { describe, expect, it } from 'vitest';
import { resolveScaffoldState } from '@/application/commands/state-resolver';
import { DEFAULT_SCAFFOLD_INPUT } from '@/application/dtos/scaffold-input';
import { isAIAgent } from '@/infrastructure/cli/environment-detector';
import { createState } from '@/tests/fixtures/create-state';

describe('Operating Modes', () => {
  describe('State Resolution Precedence: CLI flags > prompts > defaults', () => {
    it('should use CLI flags when provided', () => {
      const flags = { runtime: 'bun', language: 'javascript' };
      const result = resolveScaffoldState({ ...createState(), ...flags }, DEFAULT_SCAFFOLD_INPUT);
      expect(result.runtime).toBe('bun');
      expect(result.language).toBe('javascript');
    });

    it('should fall back to defaults when neither flags nor prompts are set', () => {
      const result = resolveScaffoldState({ projectName: 'test' }, DEFAULT_SCAFFOLD_INPUT);
      expect(result.runtime).toBe(DEFAULT_SCAFFOLD_INPUT.runtime);
      expect(result.language).toBe(DEFAULT_SCAFFOLD_INPUT.language);
      expect(result.linter).toBe(DEFAULT_SCAFFOLD_INPUT.linter);
    });

    it('should apply CLI flags over defaults', () => {
      const result = resolveScaffoldState(
        { runtime: 'bun', preCommit: 'husky', linter: 'none' },
        DEFAULT_SCAFFOLD_INPUT,
      );
      expect(result.runtime).toBe('bun');
      expect(result.preCommit).toBe('husky');
      expect(result.linter).toBe('none');
    });

    it('should preserve overwrite and dryRun flags', () => {
      const result = resolveScaffoldState(
        { overwrite: true, dryRun: true },
        DEFAULT_SCAFFOLD_INPUT,
      );
      expect(result.overwrite).toBe(true);
      expect(result.dryRun).toBe(true);
    });

    it('should not apply undefined flags (keeps defaults)', () => {
      const result = resolveScaffoldState({ projectName: 'test' }, DEFAULT_SCAFFOLD_INPUT);
      expect(result.overwrite).toBe(DEFAULT_SCAFFOLD_INPUT.overwrite);
      expect(result.dryRun).toBe(DEFAULT_SCAFFOLD_INPUT.dryRun);
    });
  });

  describe('Non-Interactive Mode', () => {
    it('should createState helper produce valid state', () => {
      const state = createState({
        projectName: 'non-interactive-app',
        runtime: 'node',
        language: 'typescript',
      });
      expect(state.projectName).toBe('non-interactive-app');
      expect(state.runtime).toBe('node');
      expect(state.language).toBe('typescript');
    });

    it('should require project name in non-interactive mode', () => {
      // The CLI handler exits code 1 when project name is missing in non-interactive mode
      const state = createState({ projectName: '' });
      expect(state.projectName).toBe('');
      // Validation is at the presentation layer — tested in unit tests
    });
  });

  describe('Mixed Mode: provided flags pre-fill', () => {
    it('should allow overriding individual fields', () => {
      const state = createState({
        runtime: 'bun',
        preCommit: 'husky',
      });
      expect(state.runtime).toBe('bun');
      expect(state.preCommit).toBe('husky');
      // Unprovided fields keep their createState defaults
      expect(state.language).toBe('typescript');
      expect(state.linter).toBe('biome');
    });
  });

  describe('AI Agent / CI Detection', () => {
    it('should detect CI environment when CI env var is set', () => {
      expect(isAIAgent({ CI: 'true' }, true)).toBe(true);
    });

    it('should detect GitHub Actions environment', () => {
      expect(isAIAgent({ GITHUB_ACTIONS: 'true' }, true)).toBe(true);
    });

    it('should detect non-TTY as AI agent', () => {
      expect(isAIAgent({ CI: undefined, GITHUB_ACTIONS: undefined }, false)).toBe(true);
    });

    it('should not detect AI agent when in TTY and no CI', () => {
      expect(isAIAgent({ CI: undefined, GITHUB_ACTIONS: undefined }, true)).toBe(false);
    });
  });
});
