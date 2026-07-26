/**
 * Integration tests for the scaffold engine.
 *
 * Uses real temp directories to verify the scaffold produces the correct file tree
 * and all config generators produce expected output.
 */

import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { makeScaffoldProject } from '@/application/commands/scaffold-project';
import type { ScaffoldInput } from '@/application/dtos/scaffold-input';
import { makeNodeFileSystem } from '@/infrastructure/file-system/node-file-system';
import { makeTemplateEngine } from '@/infrastructure/templates/template-engine';

/** Create a unique temp directory for testing */
const createTempDir = (): string => {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'create-ink-app-test-'));
  return dir;
};

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
    tempDir = createTempDir();
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
    // The project root is the original CWD (before we change to temp dir)
    return originalCwd;
  };

  const scaffoldProject = (input: ScaffoldInput) => {
    const fs = makeNodeFileSystem();
    const templates = makeTemplateEngine(fs);
    const scaffold = makeScaffoldProject({
      fs,
      templates,
      templatesDir: `${getProjectRoot()}/templates`,
    });
    return scaffold(input);
  };

  it('should create a valid project directory', () => {
    const result = scaffoldProject({
      projectName: 'test-project',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
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
      'source/app.tsx',
      'source/cli.tsx',
      'test.tsx',
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
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    const tsconfigPath = path.join(tempDir, 'my-app', 'tsconfig.json');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));

    expect(tsconfig.compilerOptions.target).toBe('ES2022');
    expect(tsconfig.compilerOptions.jsx).toBe('react-jsx');
    expect(tsconfig.include).toContain('source/**/*.tsx');
  });

  it('should generate a valid biome.json', () => {
    const result = scaffoldProject({
      projectName: 'my-app',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
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
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    // Template files should exist and have project name substituted
    const appPath = path.join(tempDir, 'my-app', 'source', 'app.tsx');
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
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);

    const cliPath = path.join(tempDir, 'my-app', 'source', 'cli.tsx');
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

  it('should create 12 files in total', () => {
    const result = scaffoldProject({
      projectName: 'count-test',
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      preCommit: 'lefthook',
      overwrite: false,
      dryRun: false,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      // Config files (9) + template files (3) = 12
      expect(result.value.files).toHaveLength(12);
    }
  });
});
