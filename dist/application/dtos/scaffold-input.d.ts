/**
 * DTO for the scaffold project use case input.
 *
 * Crosses the boundary from presentation → application.
 * This is a clean DTO — no CLI parser types leak into the application layer.
 */
import type { Language, Linter, PreCommit, Runtime } from '@/shared/types';
export interface ScaffoldInput {
    projectName: string;
    runtime: Runtime;
    language: Language;
    linter: Linter;
    preCommit: PreCommit;
    overwrite: boolean;
    dryRun: boolean;
}
/** Default values for scaffold input */
export declare const DEFAULT_SCAFFOLD_INPUT: ScaffoldInput;
//# sourceMappingURL=scaffold-input.d.ts.map