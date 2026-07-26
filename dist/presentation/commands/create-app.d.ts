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
import type { ScaffoldProject } from '@/application/commands/scaffold-project';
export interface CliOptions {
    version: string;
}
/** Main CLI handler — the composition root entry point for the create-app command */
export declare const runCreateApp: (scaffoldProject: ReturnType<ScaffoldProject>, options: CliOptions) => void;
//# sourceMappingURL=create-app.d.ts.map