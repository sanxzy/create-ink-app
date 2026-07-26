import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeScaffoldProject } from '@/application/commands/scaffold-project';
import type { ScaffoldInput } from '@/application/dtos/scaffold-input';
import type { FileSystemPort, TemplateEnginePort } from '@/domain/repositories/ports';

/** Create mock dependencies for testing the scaffold use case */
const createMockDeps = () => {
  const mockFs: FileSystemPort = {
    readFile: vi.fn((_path: string) => ({
      ok: true,
      value: '<% PROJECT_NAME %> template content',
    })),
    writeFile: vi.fn((_path: string, _content: string) => ({ ok: true, value: undefined })),
    createDirectory: vi.fn((_path: string) => ({ ok: true, value: undefined })),
    directoryExists: vi.fn((_path: string) => false),
    fileExists: vi.fn((_path: string) => false),
    copyFile: vi.fn((_src: string, _dest: string) => ({ ok: true, value: undefined })),
    readDirectory: vi.fn((_path: string) => ({ ok: true, value: [] })),
    isWritable: vi.fn((_path: string) => true),
  };

  const mockTemplates: TemplateEnginePort = {
    processTemplate: vi.fn((template: string, vars: Record<string, string>) => {
      return template.replace(/<% PROJECT_NAME %>/g, vars.PROJECT_NAME);
    }),
    processTemplateFile: vi.fn((_path: string, vars: Record<string, string>) => ({
      ok: true,
      value: {
        content: `Hello ${vars.PROJECT_NAME}!`,
        outputFilename: 'test-output.txt',
      },
    })),
    getOutputFilename: vi.fn((filename: string) => filename.replace('.template', '')),
  };

  const mockCheckRuntime = vi.fn(() => ({ ok: true, value: 'v18.0.0' }));

  return {
    fs: mockFs,
    templates: mockTemplates,
    templatesDir: 'templates',
    checkRuntime: mockCheckRuntime,
  };
};

const createValidInput = (overrides?: Partial<ScaffoldInput>): ScaffoldInput => ({
  projectName: 'my-test-app',
  runtime: 'node',
  language: 'typescript',
  linter: 'biome',
  preCommit: 'lefthook',
  testFramework: 'vitest',
  packageManager: 'npm',
  installDeps: true,
  overwrite: false,
  dryRun: false,
  ...overrides,
});

describe('makeScaffoldProject', () => {
  let deps: ReturnType<typeof createMockDeps>;
  let scaffold: ReturnType<typeof makeScaffoldProject>;

  beforeEach(() => {
    deps = createMockDeps();
    scaffold = makeScaffoldProject(deps);
  });

  // === Basic functionality ===

  it('should scaffold a project with valid input', () => {
    const result = scaffold(createValidInput());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.projectDir).toBe('my-test-app');
      expect(result.value.files.length).toBeGreaterThan(0);
    }
  });

  it('should fail with an invalid project name', () => {
    const result = scaffold(createValidInput({ projectName: 'My-App' }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('invalid_name');
    }
  });

  it('should fail with an empty project name', () => {
    const result = scaffold(createValidInput({ projectName: '' }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('invalid_name');
    }
  });

  it('should create the project directory', () => {
    scaffold(createValidInput());
    expect(deps.fs.createDirectory).toHaveBeenCalledWith('my-test-app');
    expect(deps.fs.createDirectory).toHaveBeenCalledWith('my-test-app/source');
  });

  it('should write files to the project directory', () => {
    scaffold(createValidInput());
    expect(deps.fs.writeFile).toHaveBeenCalled();
    const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(writtenPaths.some((p: string) => p.startsWith('my-test-app/'))).toBe(true);
  });

  it('should include package.json in written files', () => {
    scaffold(createValidInput());
    const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(writtenPaths).toContain('my-test-app/package.json');
  });

  it('should fail when directory exists and overwrite is false', () => {
    deps.fs.directoryExists = vi.fn(() => true);
    const result = scaffold(createValidInput());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('directory_exists');
    }
  });

  it('should succeed when directory exists and overwrite is true', () => {
    deps.fs.directoryExists = vi.fn(() => true);
    const result = scaffold(createValidInput({ overwrite: true }));
    expect(result.ok).toBe(true);
  });

  it('should process template files', () => {
    scaffold(createValidInput());
    expect(deps.templates.processTemplateFile).toHaveBeenCalled();
  });

  // === Runtime validation ===

  it('should check runtime before scaffolding', () => {
    scaffold(createValidInput());
    expect(deps.checkRuntime).toHaveBeenCalled();
  });

  it('should fail when runtime check fails', () => {
    deps.checkRuntime = vi.fn(() => ({
      ok: false,
      error: { kind: 'runtime_not_found', message: 'Node.js is not installed' },
    }));
    const result = scaffold(createValidInput());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('runtime_not_found');
    }
  });

  // === Dry-run mode ===

  it('should not write files in dry-run mode', () => {
    scaffold(createValidInput({ dryRun: true }));
    expect(deps.fs.createDirectory).not.toHaveBeenCalled();
    expect(deps.fs.writeFile).not.toHaveBeenCalled();
  });

  it('should still return file list in dry-run mode', () => {
    const result = scaffold(createValidInput({ dryRun: true }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.files.length).toBeGreaterThan(0);
    }
  });

  it('should check runtime even in dry-run mode', () => {
    scaffold(createValidInput({ dryRun: true }));
    // Runtime check should still happen before anything
    expect(deps.checkRuntime).toHaveBeenCalled();
  });

  // === TypeScript scaffold (default) ===

  it('should include tsconfig.json for TypeScript scaffold', () => {
    scaffold(createValidInput({ language: 'typescript' }));
    const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(writtenPaths).toContain('my-test-app/tsconfig.json');
  });

  it('should include biome.json for biome linter', () => {
    scaffold(createValidInput({ linter: 'biome' }));
    const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(writtenPaths).toContain('my-test-app/biome.json');
  });

  it('should include lefthook.yml for lefthook precommit', () => {
    scaffold(createValidInput({ preCommit: 'lefthook' }));
    const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(writtenPaths).toContain('my-test-app/lefthook.yml');
  });

  // === JavaScript scaffold ===

  it('should not include tsconfig.json for JavaScript scaffold', () => {
    scaffold(createValidInput({ language: 'javascript' }));
    const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(writtenPaths).not.toContain('my-test-app/tsconfig.json');
  });

  it('should use JS template directory for JavaScript scaffold', () => {
    scaffold(createValidInput({ language: 'javascript' }));
    // Template calls should use javascript directory
    const templatePaths = (
      deps.templates.processTemplateFile as ReturnType<typeof vi.fn>
    ).mock.calls.map((call: [string]) => call[0]);
    for (const path of templatePaths) {
      expect(path).toContain('node/javascript');
    }
  });

  it('should use TS template directory for TypeScript scaffold', () => {
    scaffold(createValidInput({ language: 'typescript' }));
    const templatePaths = (
      deps.templates.processTemplateFile as ReturnType<typeof vi.fn>
    ).mock.calls.map((call: [string]) => call[0]);
    for (const path of templatePaths) {
      expect(path).toContain('node/typescript');
    }
  });

  // === ESLint+Prettier ===

  it('should include eslint.config.js for eslint-prettier linter', () => {
    scaffold(createValidInput({ linter: 'eslint-prettier' }));
    const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(writtenPaths).toContain('my-test-app/eslint.config.js');
  });

  it('should include .prettierrc for eslint-prettier linter', () => {
    scaffold(createValidInput({ linter: 'eslint-prettier' }));
    const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(writtenPaths).toContain('my-test-app/.prettierrc');
  });

  it('should not include biome.json for eslint-prettier linter', () => {
    scaffold(createValidInput({ linter: 'eslint-prettier' }));
    const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(writtenPaths).not.toContain('my-test-app/biome.json');
  });

  // === Husky ===

  it('should include .husky/pre-commit for husky precommit', () => {
    scaffold(createValidInput({ preCommit: 'husky' }));
    const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(writtenPaths).toContain('my-test-app/.husky/pre-commit');
  });

  it('should not include lefthook.yml for husky precommit', () => {
    scaffold(createValidInput({ preCommit: 'husky' }));
    const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(writtenPaths).not.toContain('my-test-app/lefthook.yml');
  });

  // === None options ===

  it('should not include any linter config when linter is none', () => {
    scaffold(createValidInput({ linter: 'none' }));
    const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(writtenPaths).not.toContain('my-test-app/biome.json');
    expect(writtenPaths).not.toContain('my-test-app/eslint.config.js');
    expect(writtenPaths).not.toContain('my-test-app/.prettierrc');
  });

  it('should not include any precommit config when precommit is none', () => {
    scaffold(createValidInput({ preCommit: 'none' }));
    const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(writtenPaths).not.toContain('my-test-app/lefthook.yml');
    expect(writtenPaths).not.toContain('my-test-app/.husky/pre-commit');
  });

  // === Vitest config ===

  it('should include vitest.config.ts for Node scaffolds', () => {
    scaffold(createValidInput({ runtime: 'node' }));
    const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(writtenPaths).toContain('my-test-app/vitest.config.ts');
  });

  // === File count checks ===

  it('should create correct number of files for default TS+Biome+Lefthook', () => {
    const result = scaffold(
      createValidInput({
        language: 'typescript',
        linter: 'biome',
        preCommit: 'lefthook',
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      // Always: package.json, compat.json, .gitignore, .editorconfig, readme.md, LICENSE, vitest.config.ts
      // TS: tsconfig.json
      // Biome: biome.json
      // Lefthook: lefthook.yml
      // Templates: source/app.tsx, source/cli.tsx, test.tsx
      // Total: 7 always + 1 ts + 1 biome + 1 lefthook + 3 templates = 13
      expect(result.value.files).toHaveLength(13);
    }
  });

  it('should create correct number of files for JS+ESLint+Husky', () => {
    const result = scaffold(
      createValidInput({
        language: 'javascript',
        linter: 'eslint-prettier',
        preCommit: 'husky',
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      // Always: package.json, compat.json, .gitignore, .editorconfig, readme.md, LICENSE, vitest.config.ts
      // ESLint+Prettier: eslint.config.js, .prettierrc
      // Husky: .husky/pre-commit
      // Templates: source/app.jsx, source/cli.jsx, test.jsx
      // Total: 7 always + 2 eslint-prettier + 1 husky + 3 templates = 13
      expect(result.value.files).toHaveLength(13);
    }
  });

  it('should create correct number of files for JS+none+none', () => {
    const result = scaffold(
      createValidInput({
        language: 'javascript',
        linter: 'none',
        preCommit: 'none',
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      // Always: package.json, compat.json, .gitignore, .editorconfig, readme.md, LICENSE, vitest.config.ts
      // None linter: nothing
      // None precommit: nothing
      // Templates: source/app.jsx, source/cli.jsx, test.jsx
      // Total: 7 always + 3 templates = 10
      expect(result.value.files).toHaveLength(10);
    }
  });

  it('should create correct number of files for TS+none+none', () => {
    const result = scaffold(
      createValidInput({
        language: 'typescript',
        linter: 'none',
        preCommit: 'none',
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      // Always: package.json, compat.json, .gitignore, .editorconfig, readme.md, LICENSE, vitest.config.ts
      // TS: tsconfig.json
      // None linter: nothing
      // None precommit: nothing
      // Templates: source/app.tsx, source/cli.tsx, test.tsx
      // Total: 7 always + 1 ts + 3 templates = 11
      expect(result.value.files).toHaveLength(11);
    }
  });

  // === Combination tests ===

  const combinations: Array<{
    name: string;
    input: Partial<ScaffoldInput>;
    shouldInclude: string[];
    shouldExclude: string[];
  }> = [
    {
      name: 'TS+Biome+Lefthook (default)',
      input: { language: 'typescript', linter: 'biome', preCommit: 'lefthook' },
      shouldInclude: ['tsconfig.json', 'biome.json', 'lefthook.yml'],
      shouldExclude: ['eslint.config.js', '.prettierrc', '.husky/pre-commit'],
    },
    {
      name: 'TS+Biome+Husky',
      input: { language: 'typescript', linter: 'biome', preCommit: 'husky' },
      shouldInclude: ['tsconfig.json', 'biome.json', '.husky/pre-commit'],
      shouldExclude: ['eslint.config.js', '.prettierrc', 'lefthook.yml'],
    },
    {
      name: 'TS+ESLint+Lefthook',
      input: { language: 'typescript', linter: 'eslint-prettier', preCommit: 'lefthook' },
      shouldInclude: ['tsconfig.json', 'eslint.config.js', '.prettierrc', 'lefthook.yml'],
      shouldExclude: ['biome.json', '.husky/pre-commit'],
    },
    {
      name: 'TS+ESLint+Husky',
      input: { language: 'typescript', linter: 'eslint-prettier', preCommit: 'husky' },
      shouldInclude: ['tsconfig.json', 'eslint.config.js', '.prettierrc', '.husky/pre-commit'],
      shouldExclude: ['biome.json', 'lefthook.yml'],
    },
    {
      name: 'JS+Biome+Lefthook',
      input: { language: 'javascript', linter: 'biome', preCommit: 'lefthook' },
      shouldInclude: ['biome.json', 'lefthook.yml'],
      shouldExclude: ['tsconfig.json', 'eslint.config.js', '.prettierrc', '.husky/pre-commit'],
    },
    {
      name: 'JS+ESLint+Husky',
      input: { language: 'javascript', linter: 'eslint-prettier', preCommit: 'husky' },
      shouldInclude: ['eslint.config.js', '.prettierrc', '.husky/pre-commit'],
      shouldExclude: ['tsconfig.json', 'biome.json', 'lefthook.yml'],
    },
    {
      name: 'TS+none+none',
      input: { language: 'typescript', linter: 'none', preCommit: 'none' },
      shouldInclude: ['tsconfig.json'],
      shouldExclude: [
        'biome.json',
        'eslint.config.js',
        '.prettierrc',
        'lefthook.yml',
        '.husky/pre-commit',
      ],
    },
    {
      name: 'JS+none+none',
      input: { language: 'javascript', linter: 'none', preCommit: 'none' },
      shouldInclude: [],
      shouldExclude: [
        'tsconfig.json',
        'biome.json',
        'eslint.config.js',
        '.prettierrc',
        'lefthook.yml',
        '.husky/pre-commit',
      ],
    },
  ];

  for (const combo of combinations) {
    it(`should scaffold ${combo.name} with correct files`, () => {
      scaffold(createValidInput(combo.input));
      const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
        (call: [string]) => call[0],
      );

      for (const include of combo.shouldInclude) {
        expect(writtenPaths).toContain(`my-test-app/${include}`);
      }
      for (const exclude of combo.shouldExclude) {
        expect(writtenPaths).not.toContain(`my-test-app/${exclude}`);
      }
    });
  }

  // === BUN SCAFFOLD TESTS ===

  it('should use bun/typescript template directory for Bun+TS scaffold', () => {
    scaffold(createValidInput({ runtime: 'bun', language: 'typescript' }));
    const templatePaths = (
      deps.templates.processTemplateFile as ReturnType<typeof vi.fn>
    ).mock.calls.map((call: [string]) => call[0]);
    for (const path of templatePaths) {
      expect(path).toContain('bun/typescript');
    }
  });

  it('should use bun/javascript template directory for Bun+JS scaffold', () => {
    scaffold(createValidInput({ runtime: 'bun', language: 'javascript' }));
    const templatePaths = (
      deps.templates.processTemplateFile as ReturnType<typeof vi.fn>
    ).mock.calls.map((call: [string]) => call[0]);
    for (const path of templatePaths) {
      expect(path).toContain('bun/javascript');
    }
  });

  it('should not include vitest.config.ts for Bun scaffold', () => {
    scaffold(createValidInput({ runtime: 'bun' }));
    const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(writtenPaths).not.toContain('my-test-app/vitest.config.ts');
  });

  it('should include vitest.config.ts for Node scaffold', () => {
    scaffold(createValidInput({ runtime: 'node' }));
    const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(writtenPaths).toContain('my-test-app/vitest.config.ts');
  });

  it('should pass runtime to checkRuntime for Bun scaffold', () => {
    scaffold(createValidInput({ runtime: 'bun' }));
    expect(deps.checkRuntime).toHaveBeenCalledWith('bun');
  });

  it('should pass runtime to checkRuntime for Node scaffold', () => {
    scaffold(createValidInput({ runtime: 'node' }));
    expect(deps.checkRuntime).toHaveBeenCalledWith('node');
  });

  // === Bun file count checks ===

  it('should create correct number of files for Bun+TS+Biome+Lefthook', () => {
    const result = scaffold(
      createValidInput({
        runtime: 'bun',
        language: 'typescript',
        linter: 'biome',
        preCommit: 'lefthook',
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      // Always: package.json, compat.json, .gitignore, .editorconfig, readme.md, LICENSE
      // TS: tsconfig.json
      // Biome: biome.json
      // Lefthook: lefthook.yml
      // Templates: source/app.tsx, source/cli.tsx, test.tsx
      // Total: 6 always + 1 ts + 1 biome + 1 lefthook + 3 templates = 12
      expect(result.value.files).toHaveLength(12);
    }
  });

  it('should create correct number of files for Bun+TS+none+none', () => {
    const result = scaffold(
      createValidInput({
        runtime: 'bun',
        language: 'typescript',
        linter: 'none',
        preCommit: 'none',
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      // Always: package.json, compat.json, .gitignore, .editorconfig, readme.md, LICENSE
      // TS: tsconfig.json
      // None linter: nothing
      // None precommit: nothing
      // Templates: source/app.tsx, source/cli.tsx, test.tsx
      // Total: 6 always + 1 ts + 3 templates = 10
      expect(result.value.files).toHaveLength(10);
    }
  });

  it('should create correct number of files for Bun+JS+Biome+Lefthook', () => {
    const result = scaffold(
      createValidInput({
        runtime: 'bun',
        language: 'javascript',
        linter: 'biome',
        preCommit: 'lefthook',
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      // Always: package.json, compat.json, .gitignore, .editorconfig, readme.md, LICENSE
      // Biome: biome.json
      // Lefthook: lefthook.yml
      // Templates: source/app.jsx, source/cli.jsx, test.jsx
      // Total: 6 always + 1 biome + 1 lefthook + 3 templates = 11
      expect(result.value.files).toHaveLength(11);
    }
  });

  // === Bun combinations (all 12) ===

  const bunCombinations: Array<{
    name: string;
    input: Partial<ScaffoldInput>;
    shouldInclude: string[];
    shouldExclude: string[];
  }> = [
    {
      name: 'Bun+TS+Biome+Lefthook',
      input: { runtime: 'bun', language: 'typescript', linter: 'biome', preCommit: 'lefthook' },
      shouldInclude: ['tsconfig.json', 'biome.json', 'lefthook.yml'],
      shouldExclude: ['eslint.config.js', '.prettierrc', '.husky/pre-commit', 'vitest.config.ts'],
    },
    {
      name: 'Bun+TS+Biome+Husky',
      input: { runtime: 'bun', language: 'typescript', linter: 'biome', preCommit: 'husky' },
      shouldInclude: ['tsconfig.json', 'biome.json', '.husky/pre-commit'],
      shouldExclude: ['eslint.config.js', '.prettierrc', 'lefthook.yml', 'vitest.config.ts'],
    },
    {
      name: 'Bun+TS+Biome+none',
      input: { runtime: 'bun', language: 'typescript', linter: 'biome', preCommit: 'none' },
      shouldInclude: ['tsconfig.json', 'biome.json'],
      shouldExclude: [
        'eslint.config.js',
        '.prettierrc',
        'lefthook.yml',
        '.husky/pre-commit',
        'vitest.config.ts',
      ],
    },
    {
      name: 'Bun+TS+ESLint+Lefthook',
      input: {
        runtime: 'bun',
        language: 'typescript',
        linter: 'eslint-prettier',
        preCommit: 'lefthook',
      },
      shouldInclude: ['tsconfig.json', 'eslint.config.js', '.prettierrc', 'lefthook.yml'],
      shouldExclude: ['biome.json', '.husky/pre-commit', 'vitest.config.ts'],
    },
    {
      name: 'Bun+TS+ESLint+Husky',
      input: {
        runtime: 'bun',
        language: 'typescript',
        linter: 'eslint-prettier',
        preCommit: 'husky',
      },
      shouldInclude: ['tsconfig.json', 'eslint.config.js', '.prettierrc', '.husky/pre-commit'],
      shouldExclude: ['biome.json', 'lefthook.yml', 'vitest.config.ts'],
    },
    {
      name: 'Bun+TS+ESLint+none',
      input: {
        runtime: 'bun',
        language: 'typescript',
        linter: 'eslint-prettier',
        preCommit: 'none',
      },
      shouldInclude: ['tsconfig.json', 'eslint.config.js', '.prettierrc'],
      shouldExclude: ['biome.json', 'lefthook.yml', '.husky/pre-commit', 'vitest.config.ts'],
    },
    {
      name: 'Bun+TS+none+Lefthook',
      input: { runtime: 'bun', language: 'typescript', linter: 'none', preCommit: 'lefthook' },
      shouldInclude: ['tsconfig.json', 'lefthook.yml'],
      shouldExclude: [
        'biome.json',
        'eslint.config.js',
        '.prettierrc',
        '.husky/pre-commit',
        'vitest.config.ts',
      ],
    },
    {
      name: 'Bun+TS+none+Husky',
      input: { runtime: 'bun', language: 'typescript', linter: 'none', preCommit: 'husky' },
      shouldInclude: ['tsconfig.json', '.husky/pre-commit'],
      shouldExclude: [
        'biome.json',
        'eslint.config.js',
        '.prettierrc',
        'lefthook.yml',
        'vitest.config.ts',
      ],
    },
    {
      name: 'Bun+TS+none+none',
      input: { runtime: 'bun', language: 'typescript', linter: 'none', preCommit: 'none' },
      shouldInclude: ['tsconfig.json'],
      shouldExclude: [
        'biome.json',
        'eslint.config.js',
        '.prettierrc',
        'lefthook.yml',
        '.husky/pre-commit',
        'vitest.config.ts',
      ],
    },
    {
      name: 'Bun+JS+Biome+Lefthook',
      input: { runtime: 'bun', language: 'javascript', linter: 'biome', preCommit: 'lefthook' },
      shouldInclude: ['biome.json', 'lefthook.yml'],
      shouldExclude: [
        'tsconfig.json',
        'eslint.config.js',
        '.prettierrc',
        '.husky/pre-commit',
        'vitest.config.ts',
      ],
    },
    {
      name: 'Bun+JS+ESLint+Husky',
      input: {
        runtime: 'bun',
        language: 'javascript',
        linter: 'eslint-prettier',
        preCommit: 'husky',
      },
      shouldInclude: ['eslint.config.js', '.prettierrc', '.husky/pre-commit'],
      shouldExclude: ['tsconfig.json', 'biome.json', 'lefthook.yml', 'vitest.config.ts'],
    },
    {
      name: 'Bun+JS+none+none',
      input: { runtime: 'bun', language: 'javascript', linter: 'none', preCommit: 'none' },
      shouldInclude: [],
      shouldExclude: [
        'tsconfig.json',
        'biome.json',
        'eslint.config.js',
        '.prettierrc',
        'lefthook.yml',
        '.husky/pre-commit',
        'vitest.config.ts',
      ],
    },
  ];

  for (const combo of bunCombinations) {
    it(`should scaffold ${combo.name} with correct files`, () => {
      scaffold(createValidInput(combo.input));
      const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
        (call: [string]) => call[0],
      );

      for (const include of combo.shouldInclude) {
        expect(writtenPaths).toContain(`my-test-app/${include}`);
      }
      for (const exclude of combo.shouldExclude) {
        expect(writtenPaths).not.toContain(`my-test-app/${exclude}`);
      }
    });
  }
});
