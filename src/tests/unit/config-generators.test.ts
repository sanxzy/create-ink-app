import { describe, expect, it } from 'vitest';
import {
  type GeneratorContext,
  generateBiomeJson,
  generateCompatJson,
  generateEditorconfig,
  generateGitignore,
  generateLefthookYml,
  generateLicense,
  generatePackageJson,
  generateReadme,
  generateTsconfig,
} from '@/application/services/config-generators';

const mockCtx: GeneratorContext = {
  projectName: 'my-test-app',
  projectVersion: '1.0.0',
  currentYear: '2026',
};

describe('config generators', () => {
  describe('generatePackageJson', () => {
    const pkg = JSON.parse(generatePackageJson(mockCtx));

    it('should use the project name', () => {
      expect(pkg.name).toBe('my-test-app');
    });

    it('should set version to 1.0.0', () => {
      expect(pkg.version).toBe('1.0.0');
    });

    it('should set type to module', () => {
      expect(pkg.type).toBe('module');
    });

    it('should include all required scripts', () => {
      const scripts = pkg.scripts;
      expect(scripts).toHaveProperty('build');
      expect(scripts).toHaveProperty('dev');
      expect(scripts).toHaveProperty('start');
      expect(scripts).toHaveProperty('test');
      expect(scripts).toHaveProperty('lint');
      expect(scripts).toHaveProperty('format');
      expect(scripts).toHaveProperty('check');
      expect(scripts).toHaveProperty('typecheck');
    });

    it('should include Ink and React as dependencies', () => {
      expect(pkg.dependencies).toHaveProperty('ink');
      expect(pkg.dependencies).toHaveProperty('react');
    });

    it('should include dev dependencies', () => {
      expect(pkg.devDependencies).toHaveProperty('@biomejs/biome');
      expect(pkg.devDependencies).toHaveProperty('@types/react');
      expect(pkg.devDependencies).toHaveProperty('lefthook');
      expect(pkg.devDependencies).toHaveProperty('typescript');
      expect(pkg.devDependencies).toHaveProperty('vitest');
    });
  });

  describe('generateTsconfig', () => {
    const tsconfig = JSON.parse(generateTsconfig(mockCtx));

    it('should set target to ES2022', () => {
      expect(tsconfig.compilerOptions.target).toBe('ES2022');
    });

    it('should set module to ESNext', () => {
      expect(tsconfig.compilerOptions.module).toBe('ESNext');
    });

    it('should set jsx to react-jsx', () => {
      expect(tsconfig.compilerOptions.jsx).toBe('react-jsx');
    });

    it('should include source directory', () => {
      expect(tsconfig.include).toContain('source/**/*.ts');
      expect(tsconfig.include).toContain('source/**/*.tsx');
    });
  });

  describe('generateBiomeJson', () => {
    const biome = JSON.parse(generateBiomeJson(mockCtx));

    it('should enable linting', () => {
      expect(biome.linter.enabled).toBe(true);
    });

    it('should enable formatting', () => {
      expect(biome.formatter.enabled).toBe(true);
    });

    it('should use space indentation', () => {
      expect(biome.formatter.indentStyle).toBe('space');
    });
  });

  describe('generateLefthookYml', () => {
    const content = generateLefthookYml(mockCtx);

    it('should contain pre-commit commands', () => {
      expect(content).toContain('pre-commit:');
    });

    it('should contain typecheck, lint, and format', () => {
      expect(content).toContain('typecheck');
      expect(content).toContain('lint');
      expect(content).toContain('format');
    });
  });

  describe('generateCompatJson', () => {
    const compat = JSON.parse(generateCompatJson(mockCtx));

    it('should record the scaffold version', () => {
      expect(compat.scaffoldVersion).toBe('1.0.0');
    });

    it('should identify the generator', () => {
      expect(compat.generator).toBe('create-ink-app');
    });

    it('should include a creation date', () => {
      expect(compat.createdAt).toBeDefined();
      expect(typeof compat.createdAt).toBe('string');
    });
  });

  describe('generateGitignore', () => {
    const content = generateGitignore(mockCtx);

    it('should ignore node_modules', () => {
      expect(content).toContain('node_modules/');
    });

    it('should ignore dist directory', () => {
      expect(content).toContain('dist/');
    });

    it('should ignore OS files', () => {
      expect(content).toContain('.DS_Store');
    });
  });

  describe('generateEditorconfig', () => {
    const content = generateEditorconfig(mockCtx);

    it('should set root = true', () => {
      expect(content).toContain('root = true');
    });

    it('should set indent_style to space', () => {
      expect(content).toContain('indent_style = space');
    });
  });

  describe('generateLicense', () => {
    const content = generateLicense(mockCtx);

    it('should be MIT license', () => {
      expect(content).toContain('MIT License');
    });

    it('should include project name as copyright holder', () => {
      expect(content).toContain('my-test-app');
    });

    it('should include the current year', () => {
      expect(content).toContain('2026');
    });
  });

  describe('generateReadme', () => {
    const content = generateReadme(mockCtx);

    it('should include the project name in the title', () => {
      expect(content).toContain('# my-test-app');
    });

    it('should mention Ink and React', () => {
      expect(content).toContain('Ink');
      expect(content).toContain('React');
    });

    it('should include available scripts', () => {
      expect(content).toContain('npm run build');
      expect(content).toContain('npm test');
    });
  });
});
