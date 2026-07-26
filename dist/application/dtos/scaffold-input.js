/**
 * DTO for the scaffold project use case input.
 *
 * Crosses the boundary from presentation → application.
 * This is a clean DTO — no CLI parser types leak into the application layer.
 */
/** Default values for scaffold input */
export const DEFAULT_SCAFFOLD_INPUT = {
    projectName: '',
    runtime: 'node',
    language: 'typescript',
    linter: 'biome',
    preCommit: 'lefthook',
    overwrite: false,
    dryRun: false,
};
//# sourceMappingURL=scaffold-input.js.map