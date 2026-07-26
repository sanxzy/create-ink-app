/**
 * State resolver use case.
 *
 * Pure function that resolves scaffold state with strict precedence:
 * CLI flags > user prompts > defaults
 *
 * This is in the application layer because it defines the orchestration
 * logic for how configuration state is assembled, independent of any
 * framework or UI mechanism.
 */

import type { ScaffoldInput } from '@/application/dtos/scaffold-input';

/**
 * Resolve scaffold state by merging CLI flags over defaults.
 * Values provided in `flags` take precedence over `defaults`.
 *
 * This is called after all user input is collected (whether from
 * interactive prompts or CLI flags), and applies the final merge.
 *
 * Precedence: flags > defaults
 */
export const resolveScaffoldState = (
  flags: Partial<ScaffoldInput>,
  defaults: ScaffoldInput,
): ScaffoldInput => {
  return {
    projectName: flags.projectName ?? defaults.projectName,
    targetDir: flags.targetDir ?? defaults.targetDir,
    runtime: flags.runtime ?? defaults.runtime,
    language: flags.language ?? defaults.language,
    linter: flags.linter ?? defaults.linter,
    testFramework: flags.testFramework ?? defaults.testFramework,
    preCommit: flags.preCommit ?? defaults.preCommit,
    packageManager: flags.packageManager ?? defaults.packageManager,
    installDeps: flags.installDeps ?? defaults.installDeps,
    overwrite: flags.overwrite ?? defaults.overwrite,
    dryRun: flags.dryRun ?? defaults.dryRun,
  };
};
