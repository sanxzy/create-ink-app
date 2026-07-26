/**
 * CLI argument parser adapter.
 *
 * Converts raw mri parser output into clean ParsedArgs DTO.
 * This is the boundary between the framework (mri) and the application layer.
 * No mri types leak past this file into inner layers.
 *
 * For WU-02, this now parses all CLI flags:
 * --runtime, --language, --linter, --test, --precommit, --pm
 * --overwrite, --no-overwrite, --immediate, --no-interactive, --dry-run, --help, --version
 */

import type { ScaffoldInput } from '@/application/dtos/scaffold-input';

export interface ParsedArgs {
  help: boolean;
  version: boolean;
  noInteractive: boolean;
  overwrite: boolean;
  noOverwrite: boolean;
  dryRun: boolean;
  immediate: boolean;
  projectName: string;
  runtime: string;
  language: string;
  linter: string;
  testFramework: string;
  preCommit: string;
  packageManager: string;
  unknownArgs: string[];
}

/** mri-style parsed arguments */
interface MriLikeArgs {
  _: string[];
  [key: string]: unknown;
}

/** Parse raw CLI arguments (from process.argv or mri output) into a clean ParsedArgs DTO */
export const parseArgs = (args: MriLikeArgs): ParsedArgs => {
  const overwrite = args.overwrite === true;
  const noOverwrite = args['no-overwrite'] === true || args.noOverwrite === true;

  return {
    help: args.help === true,
    version: args.version === true,
    noInteractive: args['no-interactive'] === true || args.noInteractive === true,
    // --no-overwrite takes precedence over --overwrite
    overwrite: noOverwrite ? false : overwrite,
    noOverwrite,
    dryRun: args.dryRun === true || args['dry-run'] === true,
    immediate: args.immediate === true,
    projectName: typeof args._[0] === 'string' ? args._[0] : '',
    runtime: typeof args.runtime === 'string' ? args.runtime : '',
    language: typeof args.language === 'string' ? args.language : '',
    linter: typeof args.linter === 'string' ? args.linter : '',
    testFramework: typeof args.test === 'string' ? args.test : '',
    preCommit: typeof args.precommit === 'string' ? args.precommit : '',
    packageManager: typeof args.pm === 'string' ? args.pm : '',
    unknownArgs: args._.slice(1).map(String),
  };
};

/**
 * Convert parsed args to a partial ScaffoldInput DTO.
 *
 * Only includes fields that were explicitly provided by the user.
 * String fields are included only when non-empty.
 * Boolean fields (overwrite, dryRun) are included only when true
 * (explicitly passed via --overwrite or --dry-run).
 * The wizard then prompts for any missing fields.
 */
export const parsedArgsToScaffoldInput = (parsed: ParsedArgs): Partial<ScaffoldInput> => {
  const result: Partial<ScaffoldInput> = {};

  if (parsed.projectName) {
    result.projectName = parsed.projectName;
  }
  if (parsed.runtime) {
    result.runtime = parsed.runtime as ScaffoldInput['runtime'];
  }
  if (parsed.language) {
    result.language = parsed.language as ScaffoldInput['language'];
  }
  if (parsed.linter) {
    result.linter = parsed.linter as ScaffoldInput['linter'];
  }
  if (parsed.testFramework) {
    result.testFramework = parsed.testFramework as ScaffoldInput['testFramework'];
  }
  if (parsed.preCommit) {
    result.preCommit = parsed.preCommit as ScaffoldInput['preCommit'];
  }
  if (parsed.packageManager) {
    result.packageManager = parsed.packageManager as ScaffoldInput['packageManager'];
  }

  // Boolean fields: only include if explicitly set by the user (differs from default)
  if (parsed.overwrite) {
    result.overwrite = true;
  }
  if (parsed.dryRun) {
    result.dryRun = true;
  }

  return result;
};
