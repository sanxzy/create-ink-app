/**
 * Unit tests for the interactive wizard.
 *
 * Tests the wizard orchestration logic with mocked @clack/prompts functions.
 * Verifies:
 * - All prompts are called for values not provided by CLI flags
 * - Prompts are skipped for values already provided by CLI flags
 * - Cancel signal is handled
 * - Intro is called at the start
 */

import { describe, expect, it, vi } from 'vitest';
import type { ScaffoldInput } from '@/application/dtos/scaffold-input';
import { runInteractiveWizard } from '@/presentation/wizard/interactive-wizard';

/**
 * Create a mock prompt functions object for testing.
 * Default select resolves to 'node' so runtime prompts work.
 */
const createMockPrompts = (overrides?: {
  text?: ReturnType<typeof vi.fn>;
  select?: ReturnType<typeof vi.fn>;
  confirm?: ReturnType<typeof vi.fn>;
  isCancel?: ReturnType<typeof vi.fn>;
  intro?: ReturnType<typeof vi.fn>;
  outro?: ReturnType<typeof vi.fn>;
}) => {
  const mockText = overrides?.text ?? vi.fn().mockResolvedValue('test-app');
  const mockSelect = overrides?.select ?? vi.fn().mockResolvedValue('node');
  const mockConfirm = overrides?.confirm ?? vi.fn().mockResolvedValue(true);
  const mockIsCancel = overrides?.isCancel ?? vi.fn().mockReturnValue(false);
  const mockIntro = overrides?.intro ?? vi.fn();
  const mockOutro = overrides?.outro ?? vi.fn();

  return {
    text: mockText,
    select: mockSelect,
    confirm: mockConfirm,
    isCancel: mockIsCancel,
    intro: mockIntro,
    outro: mockOutro,
  };
};

/** Helper to extract the message from a prompt function call argument */
const getCallMessage = (mock: ReturnType<typeof vi.fn>, callIndex = 0): string => {
  const arg = mock.mock.calls[callIndex]?.[0] as { message?: string } | undefined;
  return arg?.message ?? '';
};

describe('runInteractiveWizard', () => {
  it('should prompt for project name when not provided', async () => {
    const prompts = createMockPrompts({
      text: vi.fn().mockResolvedValue('my-interactive-app'),
    });

    const result = await runInteractiveWizard({}, prompts);

    expect(prompts.text).toHaveBeenCalled();
    expect(getCallMessage(prompts.text)).toContain('project');
    expect(result.projectName).toBe('my-interactive-app');
  });

  it('should skip project name prompt when provided via flags', async () => {
    const textMock = vi.fn();
    const prompts = createMockPrompts({ text: textMock });

    const result = await runInteractiveWizard({ projectName: 'cli-provided-name' }, prompts);

    expect(textMock).not.toHaveBeenCalled();
    expect(result.projectName).toBe('cli-provided-name');
  });

  it('should prompt for runtime when not provided', async () => {
    const selectMock = vi.fn().mockResolvedValueOnce('node');
    const prompts = createMockPrompts({ select: selectMock });

    await runInteractiveWizard({}, prompts);

    expect(selectMock).toHaveBeenCalled();
    expect(getCallMessage(selectMock, 0)).toContain('runtime');
  });

  it('should skip runtime prompt when provided via flags', async () => {
    const selectMock = vi.fn().mockResolvedValueOnce('typescript'); // language (first select since runtime skipped)

    const prompts = createMockPrompts({ select: selectMock });

    await runInteractiveWizard({ runtime: 'bun' }, prompts);

    // First select should be for language, not runtime
    expect(getCallMessage(selectMock, 0)).toContain('language');
  });

  it('should prompt for language when not provided', async () => {
    const selectMock = vi
      .fn()
      .mockResolvedValueOnce('node') // runtime
      .mockResolvedValueOnce('typescript'); // language

    const prompts = createMockPrompts({ select: selectMock });

    await runInteractiveWizard({}, prompts);

    expect(getCallMessage(selectMock, 1)).toContain('language');
  });

  it('should skip language prompt when provided via flags', async () => {
    const selectMock = vi
      .fn()
      .mockResolvedValueOnce('node') // runtime
      .mockResolvedValueOnce('npm') // package manager (language skipped)
      .mockResolvedValueOnce('biome') // linter
      .mockResolvedValueOnce('vitest') // test framework
      .mockResolvedValueOnce('lefthook'); // precommit

    const prompts = createMockPrompts({ select: selectMock });

    await runInteractiveWizard({ language: 'javascript' }, prompts);

    // language select should NOT be called (it's provided)
    // So the select calls should be: runtime, pm, linter, test, precommit
    // We check that the second call (index 1) is NOT about language
    expect(getCallMessage(selectMock, 1)).not.toContain('language');
    expect(getCallMessage(selectMock, 1)).toContain('package');
  });

  it('should prompt for package manager when not provided', async () => {
    const selectMock = vi
      .fn()
      .mockResolvedValueOnce('node') // runtime
      .mockResolvedValueOnce('typescript') // language
      .mockResolvedValueOnce('npm'); // package manager

    const prompts = createMockPrompts({ select: selectMock });

    await runInteractiveWizard({}, prompts);

    expect(getCallMessage(selectMock, 2)).toContain('package manager');
  });

  it('should prompt for linter when not provided', async () => {
    const selectMock = vi
      .fn()
      .mockResolvedValueOnce('node') // runtime
      .mockResolvedValueOnce('typescript') // language
      .mockResolvedValueOnce('npm') // package manager
      .mockResolvedValueOnce('biome'); // linter

    const prompts = createMockPrompts({ select: selectMock });

    await runInteractiveWizard({}, prompts);

    expect(getCallMessage(selectMock, 3)).toContain('linter');
  });

  it('should prompt for install deps when not provided', async () => {
    const confirmMock = vi.fn().mockResolvedValue(true);
    const selectMock = vi
      .fn()
      .mockResolvedValueOnce('node')
      .mockResolvedValueOnce('typescript')
      .mockResolvedValueOnce('npm')
      .mockResolvedValueOnce('biome')
      .mockResolvedValueOnce('vitest')
      .mockResolvedValueOnce('lefthook');

    const prompts = createMockPrompts({
      select: selectMock,
      confirm: confirmMock,
    });

    await runInteractiveWizard({}, prompts);

    expect(confirmMock).toHaveBeenCalled();
    expect(getCallMessage(confirmMock)).toContain('Install');
  });

  it('should skip install deps prompt when provided via flags', async () => {
    const confirmMock = vi.fn().mockResolvedValue(true);
    const selectMock = vi
      .fn()
      .mockResolvedValueOnce('node') // runtime
      .mockResolvedValueOnce('typescript') // language
      .mockResolvedValueOnce('npm') // package manager
      .mockResolvedValueOnce('biome') // linter
      .mockResolvedValueOnce('vitest') // test framework
      .mockResolvedValueOnce('lefthook'); // precommit

    const prompts = createMockPrompts({
      select: selectMock,
      confirm: confirmMock,
    });

    await runInteractiveWizard({ installDeps: false }, prompts);

    expect(confirmMock).not.toHaveBeenCalled();
  });

  it('should call intro on start', async () => {
    const introMock = vi.fn();
    const prompts = createMockPrompts({ intro: introMock });

    await runInteractiveWizard({}, prompts);

    expect(introMock).toHaveBeenCalledWith('create-ink-app');
  });

  it('should not call outro (moved to create-app.ts after overwrite check)', async () => {
    const outroMock = vi.fn();
    const prompts = createMockPrompts({ outro: outroMock });

    await runInteractiveWizard({}, prompts);

    expect(outroMock).not.toHaveBeenCalled();
  });

  it('should throw on cancel signal', async () => {
    const prompts = createMockPrompts({
      isCancel: vi.fn().mockReturnValue(true),
    });

    await expect(runInteractiveWizard({}, prompts)).rejects.toThrow('Cancelled');
  });

  it('should resolve to full ScaffoldInput with all fields', async () => {
    const textMock = vi.fn().mockResolvedValue('my-project');
    const selectMock = vi
      .fn()
      .mockResolvedValueOnce('node') // runtime
      .mockResolvedValueOnce('typescript') // language
      .mockResolvedValueOnce('npm') // package manager
      .mockResolvedValueOnce('biome') // linter
      .mockResolvedValueOnce('vitest') // test framework
      .mockResolvedValueOnce('lefthook'); // precommit

    const confirmMock = vi.fn().mockResolvedValue(true);

    const prompts = createMockPrompts({
      text: textMock,
      select: selectMock,
      confirm: confirmMock,
    });

    const result = await runInteractiveWizard({}, prompts);

    const expected: ScaffoldInput = {
      projectName: 'my-project',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      testFramework: 'vitest',
      preCommit: 'lefthook',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    };

    expect(result).toEqual(expected);
  });

  it('should use CLI-provided values and skip corresponding prompts', async () => {
    const textMock = vi.fn().mockResolvedValue('already-named');
    const selectMock = vi
      .fn()
      .mockResolvedValueOnce('npm') // package manager (runtime skipped)
      .mockResolvedValueOnce('biome') // linter (language skipped)
      .mockResolvedValueOnce('vitest') // test framework
      .mockResolvedValueOnce('lefthook'); // precommit

    const confirmMock = vi.fn();

    const prompts = createMockPrompts({
      text: textMock,
      select: selectMock,
      confirm: confirmMock,
    });

    const result = await runInteractiveWizard(
      {
        projectName: 'cli-name',
        runtime: 'bun',
        language: 'javascript',
        installDeps: true,
      },
      prompts,
    );

    // CLI-provided values should be preserved
    expect(result.projectName).toBe('cli-name');
    expect(result.runtime).toBe('bun');
    expect(result.language).toBe('javascript');
    expect(result.installDeps).toBe(true);

    // Values from prompts should be used for remaining fields
    expect(result.packageManager).toBe('npm');
    expect(result.linter).toBe('biome');
    expect(result.testFramework).toBe('vitest');
    expect(result.preCommit).toBe('lefthook');

    // Verify text was NOT called (projectName is provided)
    expect(textMock).not.toHaveBeenCalled();

    // Verify confirm was NOT called (installDeps is provided)
    expect(confirmMock).not.toHaveBeenCalled();
  });

  it('should use default values for skipped prompts', async () => {
    const selectMock = vi
      .fn()
      .mockResolvedValueOnce('typescript') // language (runtime skipped)
      .mockResolvedValueOnce('npm') // package manager
      .mockResolvedValueOnce('biome') // linter
      .mockResolvedValueOnce('vitest') // test framework
      .mockResolvedValueOnce('lefthook'); // precommit

    const confirmMock = vi.fn().mockResolvedValue(true);

    const prompts = createMockPrompts({
      text: vi.fn().mockResolvedValue('test-app'),
      select: selectMock,
      confirm: confirmMock,
    });

    const result = await runInteractiveWizard({ runtime: 'bun' }, prompts);

    expect(result.runtime).toBe('bun');
    expect(result.projectName).toBe('test-app');
    expect(result.language).toBe('typescript');
    expect(result.installDeps).toBe(true);
  });
});
