/**
 * CreateApp CLI command handler.
 *
 * Thin entry point that:
 * 1. Parses CLI arguments
 * 2. Handles --help and --version
 * 3. Detects environment (TTY, AI agent, package manager)
 * 4. Routes to interactive wizard or non-interactive mode
 * 5. Resolves final scaffold state
 * 6. Calls the scaffold use case
 * 7. Formats and outputs the result
 *
 * This is part of the presentation layer — coordinates the outer layers.
 * No business logic lives here.
 */

// Real @clack/prompts implementation
import * as clackPrompts from '@clack/prompts';
import mri from 'mri';
import type { ScaffoldProject } from '@/application/commands/scaffold-project';
import { resolveScaffoldState } from '@/application/commands/state-resolver';
import { DEFAULT_SCAFFOLD_INPUT } from '@/application/dtos/scaffold-input';
import {
  detectPackageManager,
  isAIAgent,
  isInteractive,
} from '@/infrastructure/cli/environment-detector';
import {
  formatAIAgentHint,
  formatHelp,
  formatNonInteractiveHint,
  formatScaffoldResult,
  formatVersion,
} from '@/presentation/formatters/output-formatter';
import { parseArgs, parsedArgsToScaffoldInput } from '@/presentation/parsers/args-parser';
import { runInteractiveWizard } from '@/presentation/wizard/interactive-wizard';

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
export const runCreateApp = async (
  scaffoldProject: ReturnType<ScaffoldProject>,
  options: CliOptions,
): Promise<void> => {
  const rawArgs = process.argv.slice(2);

  // Parse with mri
  const parsed = mri(rawArgs, {
    alias: {
      help: ['h'],
      version: ['v'],
      'no-interactive': ['noInteractive'],
      'no-overwrite': ['noOverwrite'],
      overwrite: ['o'],
      'dry-run': ['dryRun'],
    },
    boolean: [
      'help',
      'version',
      'no-interactive',
      'no-overwrite',
      'overwrite',
      'dry-run',
      'immediate',
    ],
    string: ['runtime', 'language', 'linter', 'test', 'precommit', 'pm'],
    default: {
      help: false,
      version: false,
      'no-interactive': false,
      'no-overwrite': false,
      overwrite: false,
      'dry-run': false,
      immediate: false,
      runtime: '',
      language: '',
      linter: '',
      test: '',
      precommit: '',
      pm: '',
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

  // Convert parsed args to partial scaffold input (CLI flags take first precedence)
  const partialInput = parsedArgsToScaffoldInput(args);

  // Detect if we're in an AI agent / CI environment
  const aiAgent = isAIAgent();

  // Detect if we're in a TTY
  const tty = isInteractive();

  // Determine if interactive mode should be used
  const useInteractive = !args.noInteractive && tty && !aiAgent;

  if (useInteractive) {
    // Run the interactive wizard — prompts for values not provided by CLI flags
    const wizardState = await runInteractiveWizard(partialInput, {
      text: clackPrompts.text,
      select: clackPrompts.select,
      confirm: clackPrompts.confirm,
      isCancel: clackPrompts.isCancel,
      intro: clackPrompts.intro,
      outro: clackPrompts.outro,
    });

    // Detect package manager from env
    const pm = detectPackageManager();

    // Resolve final state: wizard results > defaults, but CLI flags already
    // baked into wizardState (wizard skips prompts for provided flags)
    const finalInput = resolveScaffoldState(
      { ...wizardState, packageManager: wizardState.packageManager || pm },
      DEFAULT_SCAFFOLD_INPUT,
    );

    // Execute scaffold
    const result = scaffoldProject(finalInput);
    const { text, exitCode } = formatScaffoldResult(result);
    if (exitCode === 0) {
      console.log(text);
    } else {
      console.error(text);
    }
    gracefulExit(exitCode);
    return;
  }

  // Non-interactive mode
  if (!tty && aiAgent) {
    // Show AI agent hint if in CI/automation context
    console.log(formatAIAgentHint());
  } else if (!tty && args.noInteractive) {
    // Non-TTY with --no-interactive
    console.log(formatNonInteractiveHint());
  }

  // Validate project name is provided in non-interactive mode
  if (!args.projectName) {
    console.error('  ✗ Project name is required when running in non-interactive mode.');
    console.error('  Usage: create-ink-app <project-name> [options]');
    console.error('  Try:   create-ink-app --help');
    gracefulExit(1);
    return;
  }

  // Detect package manager from env
  const pm = detectPackageManager();

  // Resolve final state: CLI flags > defaults
  const finalInput = resolveScaffoldState(
    { ...partialInput, packageManager: partialInput.packageManager || pm },
    DEFAULT_SCAFFOLD_INPUT,
  );

  // Execute scaffold
  const result = scaffoldProject(finalInput);
  const { text, exitCode } = formatScaffoldResult(result);
  if (exitCode === 0) {
    console.log(text);
  } else {
    console.error(text);
  }
  gracefulExit(exitCode);
};
