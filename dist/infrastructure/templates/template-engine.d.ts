/**
 * Template engine implementation.
 *
 * Processes template files with <% VAR %> substitution.
 * Strips the .template suffix from output filenames.
 * Implements the TemplateEnginePort declared in the domain layer.
 */
import type { TemplateEnginePort } from '@/domain/repositories/ports';
import type { FileSystemPort } from '@/domain/repositories/ports';
/** Create a template engine with the given file system */
export declare const makeTemplateEngine: (fs: FileSystemPort) => TemplateEnginePort;
//# sourceMappingURL=template-engine.d.ts.map