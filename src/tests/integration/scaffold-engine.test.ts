/**
 * Integration tests for the scaffold engine.
 *
 * Uses real temp directories to verify the scaffold produces the correct file tree
 * and all config generators produce expected output.
 */

import fs from 'node:fs';
import path from 'node:path';
import { temporaryDirectory } from 'tempy';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { makeScaffoldProject } from '@/application/commands/scaffold-project';
import type { ScaffoldInput } from '@/application/dtos/scaffold-input';
import { makeNodeFileSystem } from '@/infrastructure/file-system/node-file-system';
import { makeTemplateEngine } from '@/infrastructure/templates/template-engine';

/** Remove a temp directory and its contents */
const removeTempDir = (dir: string): void => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

/** Check if a path exists */
const pathExists = (p: string): boolean => {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
};

describe('Scaffold Engine Integration', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tempDir = temporaryDirectory();
    originalCwd = process.cwd();
    // Change to the temp directory so the scaffold creates files there
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    removeTempDir(tempDir);
  });

  /** Get the project root by finding the templates directory */
  const getProjectRoot = (): string => {
    return originalCwd;
  };

  const scaffoldProject = (input: ScaffoldInput) => {
    const fs = makeNodeFileSystem();
    const templates = makeTemplateEngine(fs);
    const scaffold = makeScaffoldProject({
      fs,
      templates,
      templatesDir: `${getProjectRoot()}/templates`,
      checkRuntime: () => ({ ok: true, value: 'v18.0.0' }),
    });
    return scaffold(input);
  };

  // === Existing tests (maintained) ===

  it('should create a valid project directory', () => {
    const result = scaffoldProject({
      projectName: 'test-project',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(fs.existsSync(path.join(tempDir, 'test-project'))).toBe(true);
      expect(fs.statSync(path.join(tempDir, 'test-project')).isDirectory()).toBe(true);
    }
  });

  it('should create all required files in the scaffolded project', () => {
    const result = scaffoldProject({
      projectName: 'test-project',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    const expectedFiles = [
      'package.json',
      'tsconfig.json',
      'biome.json',
      'lefthook.yml',
      'compat.json',
      '.gitignore',
      '.editorconfig',
      'readme.md',
      'LICENSE',
      'vitest.config.ts',
      'src/app.tsx',
      'src/cli.tsx',
      'src/app.test.tsx',
      'src/cli.test.tsx',
    ];

    for (const file of expectedFiles) {
      const filePath = path.join(tempDir, 'test-project', file);
      expect(pathExists(filePath)).toBe(true);
    }
  });

  it('should generate a valid package.json', () => {
    const result = scaffoldProject({
      projectName: 'my-app',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    const pkgPath = path.join(tempDir, 'my-app', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    expect(pkg.name).toBe('my-app');
    expect(pkg.version).toBe('1.0.0');
    expect(pkg.type).toBe('module');

    // Check scripts
    expect(pkg.scripts).toHaveProperty('build');
    expect(pkg.scripts).toHaveProperty('dev');
    expect(pkg.scripts).toHaveProperty('start');
    expect(pkg.scripts).toHaveProperty('test');
    expect(pkg.scripts).toHaveProperty('lint');
    expect(pkg.scripts).toHaveProperty('format');
    expect(pkg.scripts).toHaveProperty('check');
    expect(pkg.scripts).toHaveProperty('typecheck');

    // Check dependencies
    expect(pkg.dependencies.ink).toBeDefined();
    expect(pkg.dependencies.react).toBeDefined();
  });

  it('should generate a valid tsconfig.json', () => {
    const result = scaffoldProject({
      projectName: 'my-app',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    const tsconfigPath = path.join(tempDir, 'my-app', 'tsconfig.json');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));

    expect(tsconfig.compilerOptions.target).toBe('ES2022');
    expect(tsconfig.compilerOptions.jsx).toBe('react-jsx');
    expect(tsconfig.include).toContain('src/**/*.tsx');
  });

  it('should generate a valid biome.json', () => {
    const result = scaffoldProject({
      projectName: 'my-app',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    const biomePath = path.join(tempDir, 'my-app', 'biome.json');
    const biome = JSON.parse(fs.readFileSync(biomePath, 'utf-8'));

    expect(biome.linter.enabled).toBe(true);
    expect(biome.formatter.enabled).toBe(true);
  });

  it('should generate a valid lefthook.yml', () => {
    const result = scaffoldProject({
      projectName: 'my-app',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    const lefthookPath = path.join(tempDir, 'my-app', 'lefthook.yml');
    const content = fs.readFileSync(lefthookPath, 'utf-8');

    expect(content).toContain('pre-commit:');
    expect(content).toContain('typecheck');
    expect(content).toContain('lint');
    expect(content).toContain('format');
  });

  it('should generate compat.json with scaffold info', () => {
    const result = scaffoldProject({
      projectName: 'my-app',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    const compatPath = path.join(tempDir, 'my-app', 'compat.json');
    const compat = JSON.parse(fs.readFileSync(compatPath, 'utf-8'));

    expect(compat.scaffoldVersion).toBe('1.0.0');
    expect(compat.generator).toBe('create-ink-app');
  });

  it('should process template files with variable substitution', () => {
    const result = scaffoldProject({
      projectName: 'my-app',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    // Template files should exist and have project name substituted
    const appPath = path.join(tempDir, 'my-app', 'src', 'app.tsx');
    const appContent = fs.readFileSync(appPath, 'utf-8');

    expect(appContent).toContain('my-app');
    // Ensure template markers are gone
    expect(appContent).not.toContain('<% PROJECT_NAME %>');
  });

  it('should generate the cli.tsx with proper shebang', () => {
    const result = scaffoldProject({
      projectName: 'my-app',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    const cliPath = path.join(tempDir, 'my-app', 'src', 'cli.tsx');
    const cliContent = fs.readFileSync(cliPath, 'utf-8');

    expect(cliContent).toContain('#!/usr/bin/env node');
    expect(cliContent).toContain('ink');
    expect(cliContent).toContain('import App from');
  });

  it('should fail with error when directory exists and no overwrite flag', () => {
    // First scaffold to create the directory
    const firstResult = scaffoldProject({
      projectName: 'existing-project',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });
    expect(firstResult.ok).toBe(true);

    // Second scaffold without overwrite should fail
    const secondResult = scaffoldProject({
      projectName: 'existing-project',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });
    expect(secondResult.ok).toBe(false);
  });

  it('should generate MIT License with project name', () => {
    const result = scaffoldProject({
      projectName: 'my-app',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    const licensePath = path.join(tempDir, 'my-app', 'LICENSE');
    const content = fs.readFileSync(licensePath, 'utf-8');

    expect(content).toContain('MIT License');
    expect(content).toContain('my-app');
    expect(content).toContain(String(new Date().getFullYear()));
  });

  // === NEW: Node + JS scaffold ===

  it('should create .jsx files for JavaScript scaffold', () => {
    const result = scaffoldProject({
      projectName: 'js-project',
      runtime: 'node',
      language: 'javascript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    // JS project should have .jsx files
    expect(pathExists(path.join(tempDir, 'js-project', 'src', 'app.jsx'))).toBe(true);
    expect(pathExists(path.join(tempDir, 'js-project', 'src', 'cli.jsx'))).toBe(true);
    expect(pathExists(path.join(tempDir, 'js-project', 'src', 'app.test.jsx'))).toBe(true);
    expect(pathExists(path.join(tempDir, 'js-project', 'src', 'cli.test.jsx'))).toBe(true);
  });

  it('should not create tsconfig.json for JavaScript scaffold', () => {
    const result = scaffoldProject({
      projectName: 'js-project',
      runtime: 'node',
      language: 'javascript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);
    expect(pathExists(path.join(tempDir, 'js-project', 'tsconfig.json'))).toBe(false);
  });

  it('should generate package.json without typescript devDeps for JS scaffold', () => {
    const result = scaffoldProject({
      projectName: 'js-project',
      runtime: 'node',
      language: 'javascript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    const pkgPath = path.join(tempDir, 'js-project', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    expect(pkg.devDependencies).not.toHaveProperty('typescript');
    expect(pkg.devDependencies).not.toHaveProperty('@types/react');
    expect(pkg.scripts).not.toHaveProperty('typecheck');
  });

  // === NEW: ESLint+Prettier ===

  it('should generate eslint.config.js and .prettierrc for ESLint+Prettier', () => {
    const result = scaffoldProject({
      projectName: 'eslint-project',
      runtime: 'node',
      language: 'typescript',
      linter: 'eslint-prettier',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    const eslintPath = path.join(tempDir, 'eslint-project', 'eslint.config.js');
    const prettierPath = path.join(tempDir, 'eslint-project', '.prettierrc');

    expect(pathExists(eslintPath)).toBe(true);
    expect(pathExists(prettierPath)).toBe(true);

    const eslintContent = fs.readFileSync(eslintPath, 'utf-8');
    expect(eslintContent).toContain('export default');
    expect(eslintContent).toContain('rules');

    const prettierContent = JSON.parse(fs.readFileSync(prettierPath, 'utf-8'));
    expect(prettierContent).toHaveProperty('semi');
  });

  it('should not generate biome.json when ESLint+Prettier is selected', () => {
    const result = scaffoldProject({
      projectName: 'eslint-project',
      runtime: 'node',
      language: 'typescript',
      linter: 'eslint-prettier',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);
    expect(pathExists(path.join(tempDir, 'eslint-project', 'biome.json'))).toBe(false);
  });

  // === NEW: Husky ===

  it('should generate .husky/pre-commit for Husky', () => {
    const result = scaffoldProject({
      projectName: 'husky-project',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'husky',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    const huskyPath = path.join(tempDir, 'husky-project', '.husky', 'pre-commit');
    expect(pathExists(huskyPath)).toBe(true);

    const huskyContent = fs.readFileSync(huskyPath, 'utf-8');
    expect(huskyContent).toContain('#!/usr/bin/env sh');
    expect(huskyContent).toContain('npm test');
  });

  it('should not generate lefthook.yml when Husky is selected', () => {
    const result = scaffoldProject({
      projectName: 'husky-project',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'husky',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);
    expect(pathExists(path.join(tempDir, 'husky-project', 'lefthook.yml'))).toBe(false);
  });

  // === NEW: None options ===

  it('should not generate any linter config when linter is none', () => {
    const result = scaffoldProject({
      projectName: 'none-lint',
      runtime: 'node',
      language: 'typescript',
      linter: 'none',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    const projectDir = path.join(tempDir, 'none-lint');
    expect(pathExists(path.join(projectDir, 'biome.json'))).toBe(false);
    expect(pathExists(path.join(projectDir, 'eslint.config.js'))).toBe(false);
    expect(pathExists(path.join(projectDir, '.prettierrc'))).toBe(false);
  });

  it('should not generate any precommit config when precommit is none', () => {
    const result = scaffoldProject({
      projectName: 'none-hooks',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'none',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    const projectDir = path.join(tempDir, 'none-hooks');
    expect(pathExists(path.join(projectDir, 'lefthook.yml'))).toBe(false);
    expect(pathExists(path.join(projectDir, '.husky', 'pre-commit'))).toBe(false);
  });

  // === NEW: Dry-run ===

  it('should not write any files in dry-run mode', () => {
    const result = scaffoldProject({
      projectName: 'dry-run-test',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: true,
    });

    expect(result.ok).toBe(true);
    // Directory should not exist
    expect(pathExists(path.join(tempDir, 'dry-run-test'))).toBe(false);
  });

  it('should return the correct file list in dry-run mode', () => {
    const result = scaffoldProject({
      projectName: 'dry-run-test',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      // Should list all files that would be created
      expect(result.value.files.length).toBeGreaterThan(0);
      expect(result.value.files).toContain('dry-run-test/package.json');
      expect(result.value.files).toContain('dry-run-test/src/app.tsx');
    }
  });

  // === NEW: Vitest config ===

  it('should generate vitest.config.ts for Node scaffold', () => {
    const result = scaffoldProject({
      projectName: 'vitest-test',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    const vitestPath = path.join(tempDir, 'vitest-test', 'vitest.config.ts');
    expect(pathExists(vitestPath)).toBe(true);
    const content = fs.readFileSync(vitestPath, 'utf-8');
    expect(content).toContain('vitest/config');
    expect(content).toContain('defineConfig');
  });

  // === NEW: File count checks ===

  it('should create 14 files for default TS+Biome+Lefthook', () => {
    const result = scaffoldProject({
      projectName: 'count-test',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.files).toHaveLength(14);
    }
  });

  it('should create 14 files for JS+ESLint+Husky', () => {
    const result = scaffoldProject({
      projectName: 'count-test-2',
      runtime: 'node',
      language: 'javascript',
      linter: 'eslint-prettier',
      preCommit: 'husky',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.files).toHaveLength(14);
    }
  });

  // === NEW: All combinations ===

  const testCombinations = [
    {
      name: 'TS+Biome+Lefthook',
      input: {
        language: 'typescript' as const,
        linter: 'biome' as const,
        preCommit: 'lefthook' as const,
      },
    },
    {
      name: 'TS+Biome+Husky',
      input: {
        language: 'typescript' as const,
        linter: 'biome' as const,
        preCommit: 'husky' as const,
      },
    },
    {
      name: 'TS+ESLint+Lefthook',
      input: {
        language: 'typescript' as const,
        linter: 'eslint-prettier' as const,
        preCommit: 'lefthook' as const,
      },
    },
    {
      name: 'TS+ESLint+Husky',
      input: {
        language: 'typescript' as const,
        linter: 'eslint-prettier' as const,
        preCommit: 'husky' as const,
      },
    },
    {
      name: 'TS+none+none',
      input: {
        language: 'typescript' as const,
        linter: 'none' as const,
        preCommit: 'none' as const,
      },
    },
    {
      name: 'JS+Biome+Lefthook',
      input: {
        language: 'javascript' as const,
        linter: 'biome' as const,
        preCommit: 'lefthook' as const,
      },
    },
    {
      name: 'JS+ESLint+Husky',
      input: {
        language: 'javascript' as const,
        linter: 'eslint-prettier' as const,
        preCommit: 'husky' as const,
      },
    },
    {
      name: 'JS+none+none',
      input: {
        language: 'javascript' as const,
        linter: 'none' as const,
        preCommit: 'none' as const,
      },
    },
  ];

  for (const combo of testCombinations) {
    it(`should scaffold ${combo.name} successfully`, () => {
      const result = scaffoldProject({
        projectName: `combo-${combo.name.toLowerCase().replace(/[+]/g, '-')}`,
        runtime: 'node',
        ...combo.input,
        testFramework: 'vitest',
        packageManager: 'npm',
        installDeps: true,
        overwrite: false,
        dryRun: false,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        // Should have files
        expect(result.value.files.length).toBeGreaterThan(0);
        // Must have essential files
        expect(result.value.files.some((f: string) => f.endsWith('package.json'))).toBe(true);
      }
    });
  }

  // === NEW: Mutual exclusivity ===

  it('should verify Biome and ESLint+Prettier are mutually exclusive', () => {
    const biomeResult = scaffoldProject({
      projectName: 'mutex-test',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(biomeResult.ok).toBe(true);
    if (biomeResult.ok) {
      const files = biomeResult.value.files;
      expect(files.some((f: string) => f.includes('biome.json'))).toBe(true);
      expect(files.some((f: string) => f.includes('eslint.config.js'))).toBe(false);
    }
  });

  it('should verify Lefthook and Husky are mutually exclusive', () => {
    const lefthookResult = scaffoldProject({
      projectName: 'mutex-lefthook',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      testFramework: 'vitest',
      packageManager: 'npm',
      installDeps: true,
      overwrite: false,
      dryRun: false,
    });

    expect(lefthookResult.ok).toBe(true);
    if (lefthookResult.ok) {
      const files = lefthookResult.value.files;
      expect(files.some((f: string) => f.includes('lefthook.yml'))).toBe(true);
      expect(files.some((f: string) => f.includes('.husky/pre-commit'))).toBe(false);
    }
  });
});
