/**
 * E2E Matrix Tests — all 8 scaffold combinations.
 *
 * Tests each combination end-to-end: scaffold into a temp directory,
 * verify the file tree, config files, and source files are correct.
 */

import fs from 'node:fs';
import path from 'node:path';
import { temporaryDirectory } from 'tempy';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { makeScaffoldProject } from '@/application/commands/scaffold-project';
import type { ScaffoldInput } from '@/application/dtos/scaffold-input';
import { makeNodeFileSystem } from '@/infrastructure/file-system/node-file-system';
import { makeTemplateEngine } from '@/infrastructure/templates/template-engine';
import { createState } from '@/tests/fixtures/create-state';

// All 8 E2E matrix combinations
const COMBINATIONS: Array<Pick<ScaffoldInput, 'runtime' | 'language' | 'linter' | 'preCommit'>> = [
  // 1. Node + TS + Biome + Lefthook
  { runtime: 'node', language: 'typescript', linter: 'biome', preCommit: 'lefthook' },
  // 2. Node + JS + ESLint+Prettier + none
  { runtime: 'node', language: 'javascript', linter: 'eslint-prettier', preCommit: 'none' },
  // 3. Node + TS + none + Husky
  { runtime: 'node', language: 'typescript', linter: 'none', preCommit: 'husky' },
  // 4. Bun + TS + Biome + Lefthook
  { runtime: 'bun', language: 'typescript', linter: 'biome', preCommit: 'lefthook' },
  // 5. Bun + JS + ESLint+Prettier + none
  { runtime: 'bun', language: 'javascript', linter: 'eslint-prettier', preCommit: 'none' },
  // 6. Bun + TS + none + none
  { runtime: 'bun', language: 'typescript', linter: 'none', preCommit: 'none' },
  // 7. Node + TS + ESLint+Prettier + none
  { runtime: 'node', language: 'typescript', linter: 'eslint-prettier', preCommit: 'none' },
  // 8. Node + JS + Biome + Lefthook
  { runtime: 'node', language: 'javascript', linter: 'biome', preCommit: 'lefthook' },
];

/** Get the project root (where templates/ directory lives) */
const getProjectRoot = (startDir: string): string => {
  // Walk up from startDir to find templates/ directory
  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'templates'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
};

describe('E2E Matrix — all 8 scaffold combinations', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tempDir = temporaryDirectory();
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  const scaffoldProject = (input: ScaffoldInput) => {
    const fsAdapter = makeNodeFileSystem();
    const templates = makeTemplateEngine(fsAdapter);
    const scaffold = makeScaffoldProject({
      fs: fsAdapter,
      templates,
      templatesDir: `${getProjectRoot(originalCwd)}/templates`,
      checkRuntime: () => ({ ok: true, value: 'v18.0.0' }),
    });
    return scaffold(input);
  };

  for (const combo of COMBINATIONS) {
    const label = `${combo.runtime}+${combo.language}+${combo.linter}+${combo.preCommit}`;

    describe(`Combination: ${label}`, () => {
      it('should scaffold successfully', () => {
        const result = scaffoldProject(
          createState({
            projectName: 'test-app',
            runtime: combo.runtime,
            language: combo.language,
            linter: combo.linter,
            preCommit: combo.preCommit,
          }),
        );
        expect(result.ok).toBe(true);
      });

      it('should create the project directory', () => {
        const result = scaffoldProject(
          createState({
            projectName: 'test-app',
            runtime: combo.runtime,
            language: combo.language,
            linter: combo.linter,
            preCommit: combo.preCommit,
          }),
        );
        expect(result.ok).toBe(true);
        expect(fs.existsSync(path.join(tempDir, 'test-app'))).toBe(true);
      });

      it('should create package.json with correct name', () => {
        const result = scaffoldProject(
          createState({
            projectName: 'test-app',
            runtime: combo.runtime,
            language: combo.language,
            linter: combo.linter,
            preCommit: combo.preCommit,
          }),
        );
        expect(result.ok).toBe(true);
        const pkg = JSON.parse(
          fs.readFileSync(path.join(tempDir, 'test-app', 'package.json'), 'utf-8'),
        );
        expect(pkg.name).toBe('test-app');
      });

      it('should create correct source file extension', () => {
        const result = scaffoldProject(
          createState({
            projectName: 'test-app',
            runtime: combo.runtime,
            language: combo.language,
            linter: combo.linter,
            preCommit: combo.preCommit,
          }),
        );
        expect(result.ok).toBe(true);
        const ext = combo.language === 'typescript' ? 'tsx' : 'jsx';
        expect(fs.existsSync(path.join(tempDir, 'test-app', `source/app.${ext}`))).toBe(true);
        expect(fs.existsSync(path.join(tempDir, 'test-app', `source/cli.${ext}`))).toBe(true);
        expect(fs.existsSync(path.join(tempDir, 'test-app', `test.${ext}`))).toBe(true);
      });

      it('should create tsconfig only for TypeScript', () => {
        const result = scaffoldProject(
          createState({
            projectName: 'test-app',
            runtime: combo.runtime,
            language: combo.language,
            linter: combo.linter,
            preCommit: combo.preCommit,
          }),
        );
        expect(result.ok).toBe(true);
        const tsconfigPath = path.join(tempDir, 'test-app', 'tsconfig.json');
        if (combo.language === 'typescript') {
          expect(fs.existsSync(tsconfigPath)).toBe(true);
        } else {
          expect(fs.existsSync(tsconfigPath)).toBe(false);
        }
      });

      it('should create correct linter config', () => {
        const result = scaffoldProject(
          createState({
            projectName: 'test-app',
            runtime: combo.runtime,
            language: combo.language,
            linter: combo.linter,
            preCommit: combo.preCommit,
          }),
        );
        expect(result.ok).toBe(true);
        const projectDir = path.join(tempDir, 'test-app');

        if (combo.linter === 'biome') {
          expect(fs.existsSync(path.join(projectDir, 'biome.json'))).toBe(true);
          expect(fs.existsSync(path.join(projectDir, 'eslint.config.js'))).toBe(false);
          expect(fs.existsSync(path.join(projectDir, '.prettierrc'))).toBe(false);
        } else if (combo.linter === 'eslint-prettier') {
          expect(fs.existsSync(path.join(projectDir, 'eslint.config.js'))).toBe(true);
          expect(fs.existsSync(path.join(projectDir, '.prettierrc'))).toBe(true);
          expect(fs.existsSync(path.join(projectDir, 'biome.json'))).toBe(false);
        } else {
          expect(fs.existsSync(path.join(projectDir, 'biome.json'))).toBe(false);
          expect(fs.existsSync(path.join(projectDir, 'eslint.config.js'))).toBe(false);
          expect(fs.existsSync(path.join(projectDir, '.prettierrc'))).toBe(false);
        }
      });

      it('should create correct pre-commit config', () => {
        const result = scaffoldProject(
          createState({
            projectName: 'test-app',
            runtime: combo.runtime,
            language: combo.language,
            linter: combo.linter,
            preCommit: combo.preCommit,
          }),
        );
        expect(result.ok).toBe(true);
        const projectDir = path.join(tempDir, 'test-app');

        if (combo.preCommit === 'lefthook') {
          expect(fs.existsSync(path.join(projectDir, 'lefthook.yml'))).toBe(true);
          expect(fs.existsSync(path.join(projectDir, '.husky'))).toBe(false);
        } else if (combo.preCommit === 'husky') {
          expect(fs.existsSync(path.join(projectDir, '.husky', 'pre-commit'))).toBe(true);
          expect(fs.existsSync(path.join(projectDir, 'lefthook.yml'))).toBe(false);
        } else {
          expect(fs.existsSync(path.join(projectDir, 'lefthook.yml'))).toBe(false);
          expect(fs.existsSync(path.join(projectDir, '.husky'))).toBe(false);
        }
      });

      it('should create vitest.config.ts only for Node runtime', () => {
        const result = scaffoldProject(
          createState({
            projectName: 'test-app',
            runtime: combo.runtime,
            language: combo.language,
            linter: combo.linter,
            preCommit: combo.preCommit,
          }),
        );
        expect(result.ok).toBe(true);
        const vitestPath = path.join(tempDir, 'test-app', 'vitest.config.ts');
        if (combo.runtime === 'node') {
          expect(fs.existsSync(vitestPath)).toBe(true);
        } else {
          expect(fs.existsSync(vitestPath)).toBe(false);
        }
      });

      it('should create correct shebang in cli file', () => {
        const result = scaffoldProject(
          createState({
            projectName: 'test-app',
            runtime: combo.runtime,
            language: combo.language,
            linter: combo.linter,
            preCommit: combo.preCommit,
          }),
        );
        expect(result.ok).toBe(true);
        const ext = combo.language === 'typescript' ? 'tsx' : 'jsx';
        const cliContent = fs.readFileSync(
          path.join(tempDir, 'test-app', `source/cli.${ext}`),
          'utf-8',
        );
        const expectedShebang =
          combo.runtime === 'bun' ? '#!/usr/bin/env bun' : '#!/usr/bin/env node';
        expect(cliContent.startsWith(expectedShebang)).toBe(true);
      });

      it('should create LICENSE with MIT text', () => {
        const result = scaffoldProject(
          createState({
            projectName: 'test-app',
            runtime: combo.runtime,
            language: combo.language,
            linter: combo.linter,
            preCommit: combo.preCommit,
          }),
        );
        expect(result.ok).toBe(true);
        const licenseContent = fs.readFileSync(path.join(tempDir, 'test-app', 'LICENSE'), 'utf-8');
        expect(licenseContent).toContain('MIT License');
        expect(licenseContent).toContain('test-app');
      });

      it('should create .gitignore with correct entries', () => {
        const result = scaffoldProject(
          createState({
            projectName: 'test-app',
            runtime: combo.runtime,
            language: combo.language,
            linter: combo.linter,
            preCommit: combo.preCommit,
          }),
        );
        expect(result.ok).toBe(true);
        const gitignoreContent = fs.readFileSync(
          path.join(tempDir, 'test-app', '.gitignore'),
          'utf-8',
        );
        expect(gitignoreContent).toContain('node_modules');
        if (combo.runtime === 'bun') {
          expect(gitignoreContent).toContain('bun.lock');
        }
      });

      it('should create compat.json with scaffold metadata', () => {
        const result = scaffoldProject(
          createState({
            projectName: 'test-app',
            runtime: combo.runtime,
            language: combo.language,
            linter: combo.linter,
            preCommit: combo.preCommit,
          }),
        );
        expect(result.ok).toBe(true);
        const compat = JSON.parse(
          fs.readFileSync(path.join(tempDir, 'test-app', 'compat.json'), 'utf-8'),
        );
        expect(compat.scaffoldVersion).toBeDefined();
        expect(compat.generator).toBe('create-ink-app');
      });
    });
  }
});
