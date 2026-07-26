/**
 * Domain predicates — pure functions that express business rules.
 */
import type { Language, Linter, PreCommit, Runtime } from '@/shared/types';
/** Check if a given runtime supports a given language */
export declare const isRuntimeLanguageValid: (runtime: Runtime, language: Language) => boolean;
/** Check if a linter and pre-commit combination is valid */
export declare const isLinterPreCommitValid: (linter: Linter, preCommit: PreCommit) => boolean;
/** Get the file extension for a language */
export declare const getFileExtension: (language: Language) => string;
/** Get the JSX file extension for a language */
export declare const getJsxFileExtension: (language: Language) => string;
/** Get the template directory for a runtime + language combination */
export declare const getTemplateDir: (runtime: Runtime, language: Language) => string;
/** Get the shebang line for a runtime */
export declare const getShebang: (runtime: Runtime) => string;
//# sourceMappingURL=predicates.d.ts.map