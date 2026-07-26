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

import * as fs from 'node:fs';
import * as path from 'node:path';

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
  formatCancelMessage,
  formatHelp,
  formatInstallInstructions,
  formatNonInteractiveHint,
  formatScaffoldResult,
  formatVersion,
} from '@/presentation/formatters/output-formatter';
import { installDependencies } from '@/presentation/install/package-installer';
import { parseArgs, parsedArgsToScaffoldInput } from '@/presentation/parsers/args-parser';
import { runInteractiveWizard } from '@/presentation/wizard/interactive-wizard';

export interface CliOptions {
  version: string;
}

/** Helper to flush stdout/stderr and exit with a code */
const gracefulExit = (code: number): void => {
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

/**
 * Clean exit with code 0 — used for cancelled operations and signal handling.
 * This is a simpler exit that doesn't wait for flush.
 */
const cleanExit = (): void => {
  process.exit(0);
};

/** Set up signal handlers (SIGINT/SIGTERM) for clean exit */
const setupSignalHandlers = (cleanup?: () => void): (() => void) => {
  const handler = () => {
    cleanup?.();
    cleanExit();
  };

  process.on('SIGINT', handler);
  process.on('SIGTERM', handler);

  // Return a function to remove the handlers
  return () => {
    process.off('SIGINT', handler);
    process.off('SIGTERM', handler);
  };
};

/** Resolve the target directory and project display name for `.` project name */
const resolveProjectTarget = (projectName: string): { targetDir: string; displayName: string } => {
  if (projectName === '.') {
    const cwd = process.cwd();
    return {
      targetDir: '.',
      displayName: path.basename(cwd),
    };
  }
  return { targetDir: projectName, displayName: projectName };
};

/**
 * Determine whether an overwrite prompt is needed.
 * Returns 'yes', 'no', or 'ask' based on CLI flags.
 */
const resolveOverwriteMode = (overwrite: boolean, noOverwrite: boolean): 'yes' | 'no' | 'ask' => {
  if (overwrite) return 'yes';
  if (noOverwrite) return 'no';
  return 'ask';
};

/** Check if we should prompt for overwrite when directory exists */
const shouldHandleOverwrite = (
  targetDir: string,
  overwriteMode: 'yes' | 'no' | 'ask',
): 'prompt' | 'proceed' | 'abort' => {
  const dirExists = fs.existsSync(targetDir);

  if (!dirExists) return 'proceed';
  if (overwriteMode === 'yes') return 'proceed';
  if (overwriteMode === 'no') return 'abort';
  return 'prompt'; // 'ask' mode and dir exists — prompt user
};

/** Main CLI handler — the composition root entry point for the create-app command */
export const runCreateApp = async (
  scaffoldProject: ReturnType<ScaffoldProject>,
  options: CliOptions,
): Promise<void> => {
  // Set up signal handling for clean exit
  let scaffoldStarted = false;
  const removeHandlers = setupSignalHandlers(() => {
    if (scaffoldStarted) {
      console.log('\n  ⚠ Scaffold interrupted. Partial output may exist.');
    }
  });

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
    removeHandlers();
    console.log(formatHelp());
    gracefulExit(0);
    return;
  }

  // Handle --version
  if (args.version) {
    removeHandlers();
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
    try {
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

      // Handle '.' as project name
      const { targetDir, displayName } = resolveProjectTarget(wizardState.projectName);

      // Resolve final state: wizard results > defaults, but CLI flags already
      // baked into wizardState (wizard skips prompts for provided flags)
      const finalInput = resolveScaffoldState(
        {
          ...wizardState,
          targetDir,
          projectName: displayName,
          packageManager: wizardState.packageManager || pm,
        },
        DEFAULT_SCAFFOLD_INPUT,
      );

      // Handle overwrite mode for interactive
      // Since we're interactive, 'ask' means prompt the user
      const overwriteMode = resolveOverwriteMode(finalInput.overwrite, args.noOverwrite);
      const overwriteAction = shouldHandleOverwrite(targetDir, overwriteMode);

      if (overwriteAction === 'abort') {
        removeHandlers();
        console.error(`  ✗ Directory "${targetDir}" already exists. Use --overwrite to overwrite.`);
        gracefulExit(1);
        return;
      }

      if (overwriteAction === 'prompt') {
        const overwriteResult = await clackPrompts.confirm({
          message: `Directory "${targetDir}" already exists. Overwrite?`,
          initialValue: false,
        });
        if (clackPrompts.isCancel(overwriteResult)) {
          removeHandlers();
          console.log(formatCancelMessage());
          gracefulExit(0);
          return;
        }
        finalInput.overwrite = overwriteResult as boolean;
      }

      // Ready to scaffold — after overwrite check passes
      clackPrompts.outro('Ready to scaffold!');

      // Execute scaffold
      scaffoldStarted = true;
      const result = scaffoldProject(finalInput);

      // Format result with runtime options
      const scaffoldOptions = {
        runtime: finalInput.runtime,
        packageManager: finalInput.packageManager,
      };
      const { text, exitCode } = formatScaffoldResult(result, scaffoldOptions);

      if (exitCode === 0) {
        console.log(text);

        // Handle --immediate mode: auto-install dependencies
        if (args.immediate && finalInput.installDeps) {
          const s = clackPrompts.spinner();
          const installResult = await installDependencies({
            cwd: path.resolve(targetDir),
            packageManager: finalInput.packageManager,
            spinner: s,
          });

          if (installResult.ok) {
            console.log(formatInstallInstructions(finalInput.packageManager, finalInput.runtime));
          } else {
            removeHandlers();
            gracefulExit(1);
            return;
          }
        } else if (args.immediate && !finalInput.installDeps) {
          // --immediate with install=no — show next-step instructions
          console.log(formatInstallInstructions(finalInput.packageManager, finalInput.runtime));
        }
      } else {
        console.error(text);
      }

      removeHandlers();
      gracefulExit(exitCode);
      return;
    } catch (error) {
      // Handle cancellation (thrown by wizard when isCancel is true)
      if (error instanceof Error && error.message === 'Cancelled') {
        removeHandlers();
        console.log(formatCancelMessage());
        gracefulExit(0);
        return;
      }
      throw error; // Re-throw unexpected errors
    }
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
    removeHandlers();
    console.error('  ✗ Project name is required when running in non-interactive mode.');
    console.error('  Usage: create-ink-app <project-name> [options]');
    console.error('  Try:   create-ink-app --help');
    gracefulExit(1);
    return;
  }

  // Handle '.' as project name
  const { targetDir, displayName } = resolveProjectTarget(args.projectName);

  // Detect package manager from env
  const pm = detectPackageManager();

  // Handle overwrite mode for non-interactive
  // In non-interactive mode, 'ask' behaves like 'no' (can't prompt)
  const overwriteMode = resolveOverwriteMode(args.overwrite, args.noOverwrite);
  const overwriteAction = shouldHandleOverwrite(targetDir, overwriteMode);

  if (overwriteAction === 'abort' || overwriteAction === 'prompt') {
    removeHandlers();
    console.error(`  ✗ Directory "${targetDir}" already exists. Use --overwrite to overwrite.`);
    gracefulExit(1);
    return;
  }

  // Resolve final state: CLI flags > defaults
  const finalInput = resolveScaffoldState(
    {
      ...partialInput,
      targetDir,
      projectName: displayName,
      packageManager: partialInput.packageManager || pm,
    },
    DEFAULT_SCAFFOLD_INPUT,
  );

  // Execute scaffold
  scaffoldStarted = true;
  const result = scaffoldProject(finalInput);

  // Format result with runtime options
  const scaffoldOptions = {
    runtime: finalInput.runtime,
    packageManager: finalInput.packageManager,
  };
  const { text, exitCode } = formatScaffoldResult(result, scaffoldOptions);

  if (exitCode === 0) {
    console.log(text);

    // Handle --immediate mode: auto-install dependencies
    if (args.immediate && finalInput.installDeps) {
      const s = clackPrompts.spinner();
      const installResult = await installDependencies({
        cwd: path.resolve(targetDir),
        packageManager: finalInput.packageManager,
        spinner: s,
      });

      if (installResult.ok) {
        console.log(formatInstallInstructions(finalInput.packageManager, finalInput.runtime));
      } else {
        removeHandlers();
        gracefulExit(1);
        return;
      }
    } else if (args.immediate && !finalInput.installDeps) {
      // --immediate with install=no — show next-step instructions
      console.log(formatInstallInstructions(finalInput.packageManager, finalInput.runtime));
    }
  } else {
    console.error(text);
  }

  removeHandlers();
  gracefulExit(exitCode);
};
