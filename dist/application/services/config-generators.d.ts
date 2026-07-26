/**
 * Config generators — pure functions that produce configuration content
 * for each generated file in the scaffolded project.
 *
 * These live in the application layer because they orchestrate domain concepts
 * (project name, runtime, language) into concrete output.
 */
export interface GeneratorContext {
    projectName: string;
    projectVersion: string;
    currentYear: string;
}
/** Generate package.json content */
export declare const generatePackageJson: (ctx: GeneratorContext) => string;
/** Generate tsconfig.json content */
export declare const generateTsconfig: (_ctx: GeneratorContext) => string;
/** Generate biome.json content */
export declare const generateBiomeJson: (_ctx: GeneratorContext) => string;
/** Generate lefthook.yml content */
export declare const generateLefthookYml: (_ctx: GeneratorContext) => string;
/** Generate compat.json content */
export declare const generateCompatJson: (ctx: GeneratorContext) => string;
/** Generate .gitignore content */
export declare const generateGitignore: (_ctx: GeneratorContext) => string;
/** Generate .editorconfig content */
export declare const generateEditorconfig: (_ctx: GeneratorContext) => string;
/** Generate readme.md content */
export declare const generateReadme: (ctx: GeneratorContext) => string;
/** Generate LICENSE content (MIT) */
export declare const generateLicense: (ctx: GeneratorContext) => string;
//# sourceMappingURL=config-generators.d.ts.map