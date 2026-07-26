/**
 * CLI argument parser adapter.
 *
 * Converts raw mri parser output into clean ScaffoldInput DTO.
 * This is the boundary between the framework (mri) and the application layer.
 * No mri types leak past this file into inner layers.
 */
import type { ScaffoldInput } from '@/application/dtos/scaffold-input';
export interface ParsedArgs {
    help: boolean;
    version: boolean;
    noInteractive: boolean;
    overwrite: boolean;
    dryRun: boolean;
    projectName: string;
    unknownArgs: string[];
}
/** mri-style parsed arguments */
interface MriLikeArgs {
    _: string[];
    [key: string]: unknown;
}
/** Parse raw CLI arguments (from process.argv or mri output) into a clean ParsedArgs DTO */
export declare const parseArgs: (args: MriLikeArgs) => ParsedArgs;
/** Convert parsed args to a ScaffoldInput DTO, using defaults for missing values */
export declare const parsedArgsToScaffoldInput: (parsed: ParsedArgs) => ScaffoldInput;
export {};
//# sourceMappingURL=args-parser.d.ts.map