/**
 * CLI argument parser adapter.
 *
 * Converts raw mri parser output into clean ScaffoldInput DTO.
 * This is the boundary between the framework (mri) and the application layer.
 * No mri types leak past this file into inner layers.
 */
import { DEFAULT_SCAFFOLD_INPUT } from '@/application/dtos/scaffold-input';
/** Parse raw CLI arguments (from process.argv or mri output) into a clean ParsedArgs DTO */
export const parseArgs = (args) => {
    return {
        help: args.help === true,
        version: args.version === true,
        noInteractive: args['no-interactive'] === true || args['noInteractive'] === true,
        overwrite: args.overwrite === true,
        dryRun: args.dryRun === true || args['dry-run'] === true,
        projectName: typeof args._[0] === 'string' ? args._[0] : '',
        unknownArgs: args._.slice(1).map(String),
    };
};
/** Convert parsed args to a ScaffoldInput DTO, using defaults for missing values */
export const parsedArgsToScaffoldInput = (parsed) => {
    return {
        projectName: parsed.projectName || DEFAULT_SCAFFOLD_INPUT.projectName,
        runtime: DEFAULT_SCAFFOLD_INPUT.runtime,
        language: DEFAULT_SCAFFOLD_INPUT.language,
        linter: DEFAULT_SCAFFOLD_INPUT.linter,
        preCommit: DEFAULT_SCAFFOLD_INPUT.preCommit,
        overwrite: parsed.overwrite || DEFAULT_SCAFFOLD_INPUT.overwrite,
        dryRun: parsed.dryRun || DEFAULT_SCAFFOLD_INPUT.dryRun,
    };
};
//# sourceMappingURL=args-parser.js.map