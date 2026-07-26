/**
 * Cross-cutting type definitions for the scaffold engine.
 */

/** Supported scaffold runtimes */
export type Runtime = 'node' | 'bun';

/** Supported languages */
export type Language = 'typescript' | 'javascript';

/** Supported linters */
export type Linter = 'biome' | 'eslint-prettier' | 'none';

/** Supported pre-commit tools */
export type PreCommit = 'lefthook' | 'husky' | 'none';

/** Supported test frameworks */
export type TestFramework = 'vitest' | 'jest';

/** Supported package managers */
export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

/** Overwrite mode for existing directories */
export type OverwriteMode = 'ask' | 'yes' | 'no';

/** Full resolved scaffold configuration */
export interface ScaffoldConfig {
  projectName: string;
  runtime: Runtime;
  language: Language;
  linter: Linter;
  preCommit: PreCommit;
  testFramework: TestFramework;
  packageManager: PackageManager;
  installDeps: boolean;
  overwrite: boolean;
  dryRun: boolean;
}
