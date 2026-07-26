/**
 * Output formatters for CLI output.
 *
 * Translates Result types into human-readable console output.
 */
import type { ScaffoldResult, ScaffoldError } from '@/application/commands/scaffold-project';
import type { Result } from '@/shared/errors/result';
export declare const formatScaffoldSuccess: (result: ScaffoldResult) => string;
export declare const formatScaffoldError: (error: ScaffoldError) => string;
export declare const formatHelp: () => string;
export declare const formatVersion: (version: string) => string;
export declare const formatScaffoldResult: (result: Result<ScaffoldResult, ScaffoldError>) => {
    text: string;
    exitCode: number;
};
//# sourceMappingURL=output-formatter.d.ts.map