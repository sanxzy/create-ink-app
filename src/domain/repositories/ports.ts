/**
 * Port interfaces for the scaffold engine.
 *
 * These are declared in the domain layer and implemented by infrastructure adapters.
 * The domain layer imports nothing — these are pure type declarations.
 */

import type { Result } from '@/shared/errors/result';

/** File system operation errors */
export type FileSystemError =
  | { kind: 'not_found'; message: string }
  | { kind: 'permission_denied'; message: string }
  | { kind: 'already_exists'; message: string }
  | { kind: 'write_error'; message: string }
  | { kind: 'read_error'; message: string }
  | { kind: 'mkdir_error'; message: string };

/** File system port — implemented by infrastructure */
export interface FileSystemPort {
  readFile(path: string): Result<string, FileSystemError>;
  writeFile(path: string, content: string): Result<void, FileSystemError>;
  createDirectory(path: string): Result<void, FileSystemError>;
  directoryExists(path: string): boolean;
  fileExists(path: string): boolean;
  copyFile(src: string, dest: string): Result<void, FileSystemError>;
  readDirectory(path: string): Result<string[], FileSystemError>;
}

/** Template engine errors */
export type TemplateEngineError = {
  kind: 'template_not_found';
  message: string;
  substitution_error?: string;
};

/** Template engine port — implemented by infrastructure */
export interface TemplateEnginePort {
  /**
   * Process a template string by substituting <% VAR %> placeholders.
   */
  processTemplate(template: string, vars: Record<string, string>): string;

  /**
   * Load a template file, process it, and return the result.
   * `relativePath` is used to compute the output filename preserving directory structure.
   * Strips the .template suffix from the output filename.
   */
  processTemplateFile(
    templatePath: string,
    vars: Record<string, string>,
    relativePath?: string,
  ): Result<{ content: string; outputFilename: string }, TemplateEngineError>;

  /**
   * Get the output filename by stripping the .template suffix.
   */
  getOutputFilename(templateFilename: string): string;
}

/** Logger port */
export interface LoggerPort {
  info(message: string): void;
  success(message: string): void;
  error(message: string): void;
  warn(message: string): void;
}
