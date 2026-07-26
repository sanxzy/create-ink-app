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
import { DEFAULT_SCAFFOLD_INPUT } from '@/application/dtos/scaffold-input';

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

/** Convert parsed args to a partial ScaffoldInput DTO, using defaults for missing values */
export const parsedArgsToScaffoldInput = (parsed: ParsedArgs): Partial<ScaffoldInput> => {
  return {
    projectName: parsed.projectName || DEFAULT_SCAFFOLD_INPUT.projectName,
    runtime: (parsed.runtime as ScaffoldInput['runtime']) || DEFAULT_SCAFFOLD_INPUT.runtime,
    language: (parsed.language as ScaffoldInput['language']) || DEFAULT_SCAFFOLD_INPUT.language,
    linter: (parsed.linter as ScaffoldInput['linter']) || DEFAULT_SCAFFOLD_INPUT.linter,
    testFramework:
      (parsed.testFramework as ScaffoldInput['testFramework']) ||
      DEFAULT_SCAFFOLD_INPUT.testFramework,
    preCommit: (parsed.preCommit as ScaffoldInput['preCommit']) || DEFAULT_SCAFFOLD_INPUT.preCommit,
    packageManager:
      (parsed.packageManager as ScaffoldInput['packageManager']) ||
      DEFAULT_SCAFFOLD_INPUT.packageManager,
    overwrite: parsed.overwrite || DEFAULT_SCAFFOLD_INPUT.overwrite,
    dryRun: parsed.dryRun || DEFAULT_SCAFFOLD_INPUT.dryRun,
  };
};
