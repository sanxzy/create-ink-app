/**
 * Domain predicates — pure functions that express business rules.
 */
/** Check if a given runtime supports a given language */
export const isRuntimeLanguageValid = (runtime, language) => {
    // Both Node and Bun support TypeScript and JavaScript
    return true;
};
/** Check if a linter and pre-commit combination is valid */
export const isLinterPreCommitValid = (linter, preCommit) => {
    // Biome + Lefthook is valid
    // ESLint+Prettier + Husky is valid
    // None + None is valid
    // Mixed combinations are valid too, just not recommended
    return true;
};
/** Get the file extension for a language */
export const getFileExtension = (language) => {
    return language === 'typescript' ? '.ts' : '.js';
};
/** Get the JSX file extension for a language */
export const getJsxFileExtension = (language) => {
    return language === 'typescript' ? '.tsx' : '.jsx';
};
/** Get the template directory for a runtime + language combination */
export const getTemplateDir = (runtime, language) => {
    return `templates/${runtime}/${language}`;
};
/** Get the shebang line for a runtime */
export const getShebang = (runtime) => {
    switch (runtime) {
        case 'node':
            return '#!/usr/bin/env node';
        case 'bun':
            return '#!/usr/bin/env bun';
    }
};
//# sourceMappingURL=predicates.js.map