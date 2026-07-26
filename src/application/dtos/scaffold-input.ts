/**
 * DTO for the scaffold project use case input.
 *
 * Crosses the boundary from presentation → application.
 * This is a clean DTO — no CLI parser types leak into the application layer.
 */

import type {
  Language,
  Linter,
  PackageManager,
  PreCommit,
  Runtime,
  TestFramework,
} from '@/shared/types';

export interface ScaffoldInput {
  projectName: string;
  runtime: Runtime;
  language: Language;
  linter: Linter;
  testFramework: TestFramework;
  preCommit: PreCommit;
  packageManager: PackageManager;
  installDeps: boolean;
  overwrite: boolean;
  dryRun: boolean;
}

/** Default values for scaffold input */
export const DEFAULT_SCAFFOLD_INPUT: ScaffoldInput = {
  projectName: '',
  runtime: 'node',
  language: 'typescript',
  linter: 'biome',
  testFramework: 'vitest',
  preCommit: 'lefthook',
  packageManager: 'npm',
  installDeps: true,
  overwrite: false,
  dryRun: false,
};
