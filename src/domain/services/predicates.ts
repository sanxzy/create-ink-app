/**
 * Domain predicates — pure functions that express business rules.
 */

import type { Language, Linter, PreCommit, Runtime } from '@/shared/types';

/** Check if a given runtime supports a given language */
export const isRuntimeLanguageValid = (_runtime: Runtime, _language: Language): boolean => {
  // Both Node and Bun support TypeScript and JavaScript
  return true;
};

/** Check if a linter and pre-commit combination is valid */
export const isLinterPreCommitValid = (_linter: Linter, _preCommit: PreCommit): boolean => {
  // Biome + Lefthook is valid
  // ESLint+Prettier + Husky is valid
  // None + None is valid
  // Mixed combinations are valid too, just not recommended
  return true;
};

/** Get the file extension for a language */
export const getFileExtension = (language: Language): string => {
  return language === 'typescript' ? '.ts' : '.js';
};

/** Get the JSX file extension for a language */
export const getJsxFileExtension = (language: Language): string => {
  return language === 'typescript' ? '.tsx' : '.jsx';
};

/** Get the template directory for a runtime + language combination */
export const getTemplateDir = (runtime: Runtime, language: Language): string => {
  return `templates/${runtime}/${language}`;
};

/** Get the shebang line for a runtime */
export const getShebang = (runtime: Runtime): string => {
  switch (runtime) {
    case 'node':
      return '#!/usr/bin/env node';
    case 'bun':
      return '#!/usr/bin/env bun';
  }
};
