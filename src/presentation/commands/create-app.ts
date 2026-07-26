/**
 * CreateApp CLI command handler.
 *
 * Thin entry point that:
 * 1. Parses CLI arguments
 * 2. Validates project name existence
 * 3. Calls the scaffold use case
 * 4. Formats and outputs the result
 *
 * This is part of the frameworks & drivers layer — coordinates outer layers.
 * No business logic lives here.
 */

import mri from 'mri';

import type { ScaffoldProject } from '@/application/commands/scaffold-project';
import {
  formatHelp,
  formatScaffoldResult,
  formatVersion,
} from '@/presentation/formatters/output-formatter';
import { parseArgs, parsedArgsToScaffoldInput } from '@/presentation/parsers/args-parser';

export interface CliOptions {
  version: string;
}

/** Helper to flush stdout/stderr and exit with a code */
const gracefulExit = (code: number): void => {
  // Flush pending writes before exiting to avoid truncating piped output
  process.stdout.write('', () => {
    if (code !== 0) {
      process.stderr.write('', () => {
        process.exit(code);
      });
    } else {
      process.exit(code);
    }
  });
};

/** Main CLI handler — the composition root entry point for the create-app command */
export const runCreateApp = (
  scaffoldProject: ReturnType<ScaffoldProject>,
  options: CliOptions,
): void => {
  const rawArgs = process.argv.slice(2);

  // Parse with mri
  const parsed = mri(rawArgs, {
    alias: {
      help: ['h'],
      version: ['v'],
      'no-interactive': ['noInteractive'],
      overwrite: ['o'],
      'dry-run': ['dryRun'],
    },
    boolean: ['help', 'version', 'no-interactive', 'overwrite', 'dry-run'],
    default: {
      help: false,
      version: false,
      'no-interactive': false,
      overwrite: false,
      'dry-run': false,
    },
  });

  const args = parseArgs(parsed);

  // Handle --help
  if (args.help) {
    console.log(formatHelp());
    gracefulExit(0);
    return;
  }

  // Handle --version
  if (args.version) {
    console.log(formatVersion(options.version));
    gracefulExit(0);
    return;
  }

  // Validate project name is provided
  if (!args.projectName && !args.noInteractive) {
    console.error('  ✗ Project name is required.');
    console.error('  Usage: create-ink-app <project-name> [options]');
    console.error('  Try:   create-ink-app --help');
    gracefulExit(1);
    return;
  }

  if (!args.projectName) {
    console.error('  ✗ Project name is required when running in non-interactive mode.');
    gracefulExit(1);
    return;
  }

  // Convert to scaffold input and execute
  const input = parsedArgsToScaffoldInput(args);
  const result = scaffoldProject(input);

  const { text, exitCode } = formatScaffoldResult(result);
  if (exitCode === 0) {
    console.log(text);
  } else {
    console.error(text);
  }
  gracefulExit(exitCode);
};
