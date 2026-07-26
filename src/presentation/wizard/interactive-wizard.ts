/**
 * Interactive wizard using @clack/prompts.
 *
 * Provides a beautiful interactive prompt flow for collecting scaffold
 * configuration from the user. Accepts partial state from CLI flags
 * and only prompts for values that were not provided.
 *
 * Prompts are injected as dependencies, making the wizard testable
 * without requiring actual terminal interaction.
 */

import type { ConfirmOptions, SelectOptions, TextOptions } from '@clack/prompts';

import type { ScaffoldInput } from '@/application/dtos/scaffold-input';
import { DEFAULT_SCAFFOLD_INPUT } from '@/application/dtos/scaffold-input';

/** Injected prompt functions for testability */
export interface WizardPrompts {
  text: (opts: TextOptions) => Promise<string | symbol>;
  select: <Value>(opts: SelectOptions<Value>) => Promise<Value | symbol>;
  confirm: (opts: ConfirmOptions) => Promise<boolean | symbol>;
  isCancel: (value: unknown) => boolean;
  intro: (title?: string) => void;
  outro: (title?: string) => void;
}

/** Runtime options for the select prompt */
const RUNTIME_OPTIONS = [
  { value: 'node' as const, label: 'Node.js', hint: 'Node.js 18+' },
  { value: 'bun' as const, label: 'Bun', hint: 'Bun 1.0+' },
];

/** Language options */
const LANGUAGE_OPTIONS = [
  { value: 'typescript' as const, label: 'TypeScript', hint: 'Static typing' },
  { value: 'javascript' as const, label: 'JavaScript', hint: 'Dynamic typing' },
];

/** Package manager options */
const PM_OPTIONS = [
  { value: 'npm' as const, label: 'npm', hint: 'Node package manager' },
  { value: 'pnpm' as const, label: 'pnpm', hint: 'Fast, disk-efficient' },
  { value: 'yarn' as const, label: 'Yarn', hint: 'Yarn Classic' },
  { value: 'bun' as const, label: 'Bun', hint: 'Bun package manager' },
];

/** Linter options */
const LINTER_OPTIONS = [
  { value: 'biome' as const, label: 'Biome', hint: 'Fast all-in-one linter/formatter' },
  { value: 'eslint-prettier' as const, label: 'ESLint + Prettier', hint: 'Traditional setup' },
  { value: 'none' as const, label: 'None', hint: 'Skip linter setup' },
];

/** Test framework options */
const TEST_OPTIONS = [
  { value: 'vitest' as const, label: 'Vitest', hint: 'Fast ESM-native test runner' },
];

/** Pre-commit tool options */
const PRECOMMIT_OPTIONS = [
  { value: 'lefthook' as const, label: 'Lefthook', hint: 'Fast, Go-based hook manager' },
  { value: 'husky' as const, label: 'Husky', hint: 'Git hooks made easy' },
  { value: 'none' as const, label: 'None', hint: 'Skip Git hook setup' },
];

/**
 * Run the interactive wizard.
 *
 * Accepts a partial state (from CLI flags) and prompts the user
 * for any fields that were not provided.
 */
export const runInteractiveWizard = async (
  partial: Partial<ScaffoldInput>,
  prompts: WizardPrompts,
): Promise<ScaffoldInput> => {
  prompts.intro('create-ink-app');

  const result: ScaffoldInput = {
    projectName: DEFAULT_SCAFFOLD_INPUT.projectName,
    runtime: DEFAULT_SCAFFOLD_INPUT.runtime,
    language: DEFAULT_SCAFFOLD_INPUT.language,
    linter: DEFAULT_SCAFFOLD_INPUT.linter,
    testFramework: DEFAULT_SCAFFOLD_INPUT.testFramework,
    preCommit: DEFAULT_SCAFFOLD_INPUT.preCommit,
    packageManager: DEFAULT_SCAFFOLD_INPUT.packageManager,
    installDeps: DEFAULT_SCAFFOLD_INPUT.installDeps,
    overwrite: DEFAULT_SCAFFOLD_INPUT.overwrite,
    dryRun: DEFAULT_SCAFFOLD_INPUT.dryRun,
  };

  // Project name prompt (only if not provided via CLI)
  if (!partial.projectName) {
    const projectNameResult = await prompts.text({
      message: 'What is the name of your project?',
      placeholder: 'my-ink-app',
      defaultValue: 'my-ink-app',
    });
    if (prompts.isCancel(projectNameResult)) throw new Error('Cancelled');
    result.projectName = projectNameResult as string;
  } else {
    result.projectName = partial.projectName;
  }

  // Runtime prompt (only if not provided via CLI)
  if (!partial.runtime) {
    const runtimeResult = await prompts.select({
      message: 'Which runtime does your project use?',
      options: RUNTIME_OPTIONS,
      initialValue: result.runtime,
    });
    if (prompts.isCancel(runtimeResult)) throw new Error('Cancelled');
    result.runtime = runtimeResult as typeof result.runtime;
  } else {
    result.runtime = partial.runtime;
  }

  // Language prompt (only if not provided via CLI)
  if (!partial.language) {
    const languageResult = await prompts.select({
      message: 'Which language?',
      options: LANGUAGE_OPTIONS,
      initialValue: result.language,
    });
    if (prompts.isCancel(languageResult)) throw new Error('Cancelled');
    result.language = languageResult as typeof result.language;
  } else {
    result.language = partial.language;
  }

  // Package manager prompt (only if not provided via CLI)
  if (!partial.packageManager) {
    const pmResult = await prompts.select({
      message: 'Which package manager?',
      options: PM_OPTIONS,
      initialValue: result.packageManager,
    });
    if (prompts.isCancel(pmResult)) throw new Error('Cancelled');
    result.packageManager = pmResult as typeof result.packageManager;
  } else {
    result.packageManager = partial.packageManager;
  }

  // Linter prompt (only if not provided via CLI)
  if (!partial.linter) {
    const linterResult = await prompts.select({
      message: 'Which linter/formatter?',
      options: LINTER_OPTIONS,
      initialValue: result.linter,
    });
    if (prompts.isCancel(linterResult)) throw new Error('Cancelled');
    result.linter = linterResult as typeof result.linter;
  } else {
    result.linter = partial.linter;
  }

  // Test framework prompt (only if not provided via CLI)
  if (!partial.testFramework) {
    const testResult = await prompts.select({
      message: 'Which test framework?',
      options: TEST_OPTIONS,
      initialValue: result.testFramework,
    });
    if (prompts.isCancel(testResult)) throw new Error('Cancelled');
    result.testFramework = testResult as typeof result.testFramework;
  } else {
    result.testFramework = partial.testFramework;
  }

  // Pre-commit tool prompt (only if not provided via CLI)
  if (!partial.preCommit) {
    const precommitResult = await prompts.select({
      message: 'Which pre-commit tool?',
      options: PRECOMMIT_OPTIONS,
      initialValue: result.preCommit,
    });
    if (prompts.isCancel(precommitResult)) throw new Error('Cancelled');
    result.preCommit = precommitResult as typeof result.preCommit;
  } else {
    result.preCommit = partial.preCommit;
  }

  // Install dependencies prompt (only if not provided via CLI)
  if (partial.installDeps === undefined) {
    const installResult = await prompts.confirm({
      message: 'Install dependencies?',
      initialValue: true,
    });
    if (prompts.isCancel(installResult)) throw new Error('Cancelled');
    result.installDeps = installResult as boolean;
  } else {
    result.installDeps = partial.installDeps;
  }

  prompts.outro('Ready to scaffold!');
  return result;
};
