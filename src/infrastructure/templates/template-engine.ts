/**
 * Template engine implementation.
 *
 * Processes template files with <% VAR %> substitution.
 * Strips the .template suffix from output filenames.
 * Implements the TemplateEnginePort declared in the domain layer.
 */

import type {
  FileSystemPort,
  TemplateEngineError,
  TemplateEnginePort,
} from '@/domain/repositories/ports';
import type { Result } from '@/shared/errors/result';
import { err, ok } from '@/shared/errors/result';

/** Create a template engine with the given file system */
export const makeTemplateEngine = (fs: FileSystemPort): TemplateEnginePort => {
  /**
   * Process a template string by substituting <% VAR %> placeholders.
   * Pattern: <% VARIABLE_NAME %> is replaced with the value from `vars`.
   * Also supports <% VARIABLE_NAME|default %> with fallback.
   */
  const processTemplate = (template: string, vars: Record<string, string>): string => {
    return template.replace(/<%(\s*[A-Z_][A-Z0-9_]*\s*(?:\|[^%]*)?)\s*%>/g, (_match, key) => {
      const trimmed = key.trim();
      const pipeIndex = trimmed.indexOf('|');
      let varName: string;
      let defaultValue: string | undefined;

      if (pipeIndex !== -1) {
        varName = trimmed.slice(0, pipeIndex).trim();
        defaultValue = trimmed.slice(pipeIndex + 1).trim();
      } else {
        varName = trimmed;
        defaultValue = undefined;
      }

      if (varName in vars) {
        return vars[varName];
      }

      if (defaultValue !== undefined) {
        return defaultValue;
      }

      // Leave unreplaced placeholders as-is
      return _match;
    });
  };

  /**
   * Get the output filename by stripping the .template suffix.
   * e.g., "source/app.tsx.template" → "source/app.tsx"
   */
  const getOutputFilename = (templateFilename: string): string => {
    if (templateFilename.endsWith('.template')) {
      return templateFilename.slice(0, -'.template'.length);
    }
    return templateFilename;
  };

  /**
   * Load a template file, process it, and return the result.
   * `relativePath` is the template path relative to the runtime/language dir
   * (e.g., "source/app.tsx.template") and is used to compute the output filename
   * preserving the directory structure (e.g., "source/app.tsx").
   */
  const processTemplateFile = (
    templatePath: string,
    vars: Record<string, string>,
    relativePath?: string,
  ): Result<{ content: string; outputFilename: string }, TemplateEngineError> => {
    const readResult = fs.readFile(templatePath);
    if (!readResult.ok) {
      return err({
        kind: 'template_not_found',
        message: `Template not found: ${templatePath}`,
      });
    }

    const content = processTemplate(readResult.value, vars);
    const outputFilename = getOutputFilename(relativePath || templatePath);

    return ok({ content, outputFilename });
  };

  return {
    processTemplate,
    processTemplateFile,
    getOutputFilename,
  };
};
