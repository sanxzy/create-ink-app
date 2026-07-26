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
import { parseArgs, parsedArgsToScaffoldInput } from '@/presentation/parsers/args-parser';
import { formatHelp, formatScaffoldResult, formatVersion, } from '@/presentation/formatters/output-formatter';
/** Main CLI handler — the composition root entry point for the create-app command */
export const runCreateApp = (scaffoldProject, options) => {
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
        process.exit(0);
    }
    // Handle --version
    if (args.version) {
        console.log(formatVersion(options.version));
        process.exit(0);
    }
    // Validate project name is provided
    if (!args.projectName && !args.noInteractive) {
        console.error('  ✗ Project name is required.');
        console.error('  Usage: create-ink-app <project-name> [options]');
        console.error('  Try:   create-ink-app --help');
        process.exit(1);
    }
    if (!args.projectName) {
        console.error('  ✗ Project name is required when running in non-interactive mode.');
        process.exit(1);
    }
    // Convert to scaffold input and execute
    const input = parsedArgsToScaffoldInput(args);
    const result = scaffoldProject(input);
    const { text, exitCode } = formatScaffoldResult(result);
    if (exitCode === 0) {
        console.log(text);
    }
    else {
        console.error(text);
    }
    process.exit(exitCode);
};
//# sourceMappingURL=create-app.js.map