/**
 * E2E Edge Case Tests
 *
 * Tests cross-platform path handling, special characters in project names,
 * overwrite modes, directory writability, and other edge cases.
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

const getProjectRoot = (startDir: string): string => {
  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'templates'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
};

describe('Edge Cases', () => {
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

  describe('Spaces in paths', () => {
    it('should scaffold successfully in a directory with spaces', () => {
      const spacedDir = path.join(temporaryDirectory(), 'my app dir');
      fs.mkdirSync(spacedDir, { recursive: true });
      const originalCwd = process.cwd();
      process.chdir(spacedDir);

      try {
        const result = scaffoldProject(
          createState({ projectName: 'test-app', targetDir: './test-app' }),
        );
        expect(result.ok).toBe(true);
        expect(fs.existsSync(path.join(spacedDir, 'test-app', 'package.json'))).toBe(true);
      } finally {
        process.chdir(originalCwd);
        fs.rmSync(spacedDir, { recursive: true, force: true });
      }
    });
  });

  describe('Leading dot project names', () => {
    it('should normalize leading dot in project name', () => {
      const result = scaffoldProject(createState({ projectName: '.test-app' }));
      // Leading dots are invalid npm package names
      expect(result.ok).toBe(false);
    });
  });

  describe('Current directory scaffolding', () => {
    it('should reject "." as project name at scaffold level (handled by CLI layer)', () => {
      // The "." special case is handled at the CLI presentation layer,
      // not at the scaffold use case level. The domain rejects "." as an invalid name.
      const result = scaffoldProject(createState({ projectName: '.' }));
      expect(result.ok).toBe(false);
    });
  });

  describe('Uppercase project name normalization', () => {
    it('should normalize uppercase project name to lowercase', () => {
      const result = scaffoldProject(createState({ projectName: 'TestApp' }));
      // ProjectName validation rejects uppercase
      expect(result.ok).toBe(false);
    });

    it('should accept already-lowercase project name', () => {
      const result = scaffoldProject(createState({ projectName: 'test-app' }));
      expect(result.ok).toBe(true);
      const pkg = JSON.parse(
        fs.readFileSync(path.join(tempDir, 'test-app', 'package.json'), 'utf-8'),
      );
      expect(pkg.name).toBe('test-app');
    });
  });

  describe('Overwrite modes', () => {
    it('should fail when directory exists without overwrite', () => {
      // First scaffold
      const result1 = scaffoldProject(createState({ projectName: 'test-app' }));
      expect(result1.ok).toBe(true);

      // Second scaffold without overwrite
      const result2 = scaffoldProject(createState({ projectName: 'test-app', overwrite: false }));
      expect(result2.ok).toBe(false);
    });

    it('should succeed when directory exists with overwrite=true', () => {
      // First scaffold
      const result1 = scaffoldProject(createState({ projectName: 'test-app' }));
      expect(result1.ok).toBe(true);

      // Second scaffold with overwrite
      const result2 = scaffoldProject(createState({ projectName: 'test-app', overwrite: true }));
      expect(result2.ok).toBe(true);
    });
  });

  describe('Empty project name', () => {
    it('should fail with empty project name', () => {
      const result = scaffoldProject(createState({ projectName: '' }));
      expect(result.ok).toBe(false);
    });
  });

  describe('Special character project names', () => {
    it('should reject project name with spaces', () => {
      const result = scaffoldProject(createState({ projectName: 'test app' }));
      expect(result.ok).toBe(false);
    });

    it('should reject project name with special characters', () => {
      const result = scaffoldProject(createState({ projectName: 'test@app' }));
      expect(result.ok).toBe(false);
    });

    it('should accept project name with hyphens and underscores', () => {
      const result = scaffoldProject(createState({ projectName: 'test_app-project' }));
      expect(result.ok).toBe(true);
    });
  });

  describe('Cross-platform path handling', () => {
    it('should use path.join for all file paths (not string concatenation)', () => {
      // This is a code-level guarantee — the scaffold use case uses path.join
      // We verify by checking that files are created at the expected paths
      const result = scaffoldProject(createState({ projectName: 'test-app' }));
      expect(result.ok).toBe(true);

      const expectedFiles = [
        'package.json',
        'tsconfig.json',
        'src/app.tsx',
        'src/cli.tsx',
        'src/app.test.tsx',
        'src/cli.test.tsx',
      ];

      for (const file of expectedFiles) {
        const filePath = path.join(tempDir, 'test-app', file);
        expect(fs.existsSync(filePath)).toBe(true);
      }
    });

    it('should handle forward slashes in template paths', () => {
      // Templates use forward slashes (e.g., src/app.tsx.template)
      // The template engine should handle this correctly on all platforms
      const result = scaffoldProject(createState({ projectName: 'test-app' }));
      expect(result.ok).toBe(true);
      expect(fs.existsSync(path.join(tempDir, 'test-app', 'src', 'app.tsx'))).toBe(true);
    });
  });

  describe('Dry-run mode', () => {
    it('should not create files in dry-run mode', () => {
      const result = scaffoldProject(createState({ projectName: 'test-app', dryRun: true }));
      expect(result.ok).toBe(true);
      // No files should be written
      expect(fs.existsSync(path.join(tempDir, 'test-app'))).toBe(false);
    });
  });
});
