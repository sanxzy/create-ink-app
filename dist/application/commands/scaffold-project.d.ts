/**
 * ScaffoldProject use case.
 *
 * Orchestrates the project scaffolding operation:
 * 1. Validate the project name
 * 2. Create the output directory
 * 3. Generate all project files (config + templates)
 * 4. Return the list of created files
 */
import type { FileSystemPort } from '@/domain/repositories/ports';
import type { TemplateEnginePort } from '@/domain/repositories/ports';
import type { ScaffoldInput } from '@/application/dtos/scaffold-input';
import type { Result } from '@/shared/errors/result';
export type ScaffoldError = {
    kind: 'invalid_name';
    message: string;
} | {
    kind: 'directory_exists';
    message: string;
} | {
    kind: 'file_system';
    message: string;
} | {
    kind: 'template_error';
    message: string;
};
export interface ScaffoldResult {
    projectDir: string;
    files: string[];
}
export interface ScaffoldDeps {
    fs: FileSystemPort;
    templates: TemplateEnginePort;
    templatesDir: string;
}
export type ScaffoldProject = (deps: ScaffoldDeps) => (input: ScaffoldInput) => Result<ScaffoldResult, ScaffoldError>;
export declare const makeScaffoldProject: ScaffoldProject;
//# sourceMappingURL=scaffold-project.d.ts.map