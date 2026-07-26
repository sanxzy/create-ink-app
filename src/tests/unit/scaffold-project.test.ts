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

  return { fs: mockFs, templates: mockTemplates, templatesDir: 'templates' };
};

const createValidInput = (overrides?: Partial<ScaffoldInput>): ScaffoldInput => ({
  projectName: 'my-test-app',
  runtime: 'node',
  language: 'typescript',
  linter: 'biome',
  preCommit: 'lefthook',
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

  it('should include tsconfig.json in written files', () => {
    scaffold(createValidInput());
    const writtenPaths = (deps.fs.writeFile as ReturnType<typeof vi.fn>).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(writtenPaths).toContain('my-test-app/tsconfig.json');
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

  it('should process template files', () => {
    scaffold(createValidInput());
    expect(deps.templates.processTemplateFile).toHaveBeenCalled();
  });
});
