/**
 * ProjectName value object.
 *
 * Immutable value object that enforces valid npm package name rules inline.
 * - Must not be empty
 * - Must be a valid npm package name (lowercase, no spaces, no special chars except - and _)
 * - Must not be a reserved npm package name
 * - Must not contain leading dots or underscores (except scoped packages starting with @)
 */
import type { Result } from '@/shared/errors/result';
export interface ProjectName {
    readonly value: string;
}
export type ProjectNameError = {
    kind: 'empty';
    message: string;
} | {
    kind: 'invalid_character';
    message: string;
} | {
    kind: 'reserved';
    message: string;
} | {
    kind: 'too_long';
    message: string;
};
/** Create a ProjectName after validating the input */
export declare const createProjectName: (input: string) => Result<ProjectName, ProjectNameError>;
/** Normalize a project name for use in templates (lowercase, replace spaces with hyphens) */
export declare const normalizeProjectName: (input: string) => string;
//# sourceMappingURL=project-name.d.ts.map