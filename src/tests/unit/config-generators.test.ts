import { describe, expect, it } from 'vitest';
import {
  type GeneratorContext,
  generateBiomeJson,
  generateCompatJson,
  generateEditorconfig,
  generateEslintConfig,
  generateGitignore,
  generateHuskyHook,
  generateLefthookYml,
  generateLicense,
  generatePackageJson,
  generatePrettierrc,
  generateReadme,
  generateTsconfig,
  generateVitestConfig,
} from '@/application/services/config-generators';

const mockCtx: GeneratorContext = {
  projectName: 'my-test-app',
  projectVersion: '1.0.0',
  currentYear: '2026',
  runtime: 'node',
  language: 'typescript',
  linter: 'biome',
  preCommit: 'lefthook',
  testFramework: 'vitest',
};

const bunMockCtx: GeneratorContext = {
  projectName: 'my-bun-app',
  projectVersion: '1.0.0',
  currentYear: '2026',
  runtime: 'bun',
  language: 'typescript',
  linter: 'biome',
  preCommit: 'lefthook',
  testFramework: 'vitest',
};

describe('config generators', () => {
  describe('generatePackageJson', () => {
    it('should use the project name', () => {
      const pkg = JSON.parse(generatePackageJson(mockCtx));
      expect(pkg.name).toBe('my-test-app');
    });

    it('should set version to 1.0.0', () => {
      const pkg = JSON.parse(generatePackageJson(mockCtx));
      expect(pkg.version).toBe('1.0.0');
    });

    it('should set type to module', () => {
      const pkg = JSON.parse(generatePackageJson(mockCtx));
      expect(pkg.type).toBe('module');
    });

    it('should include all required scripts', () => {
      const pkg = JSON.parse(generatePackageJson(mockCtx));
      const scripts = pkg.scripts;
      expect(scripts).toHaveProperty('build');
      expect(scripts).toHaveProperty('dev');
      expect(scripts).toHaveProperty('start');
      expect(scripts).toHaveProperty('test');
      expect(scripts).toHaveProperty('lint');
      expect(scripts).toHaveProperty('format');
      expect(scripts).toHaveProperty('check');
    });

    it('should include Ink and React as dependencies', () => {
      const pkg = JSON.parse(generatePackageJson(mockCtx));
      expect(pkg.dependencies).toHaveProperty('ink');
      expect(pkg.dependencies).toHaveProperty('react');
    });

    it('should include biome devDeps when linter is biome', () => {
      const pkg = JSON.parse(generatePackageJson({ ...mockCtx, linter: 'biome' }));
      expect(pkg.devDependencies).toHaveProperty('@biomejs/biome');
    });

    it('should include eslint devDeps when linter is eslint-prettier', () => {
      const pkg = JSON.parse(generatePackageJson({ ...mockCtx, linter: 'eslint-prettier' }));
      expect(pkg.devDependencies).toHaveProperty('eslint');
      expect(pkg.devDependencies).toHaveProperty('prettier');
    });

    it('should not include any linter devDeps when linter is none', () => {
      const pkg = JSON.parse(generatePackageJson({ ...mockCtx, linter: 'none' }));
      expect(pkg.devDependencies).not.toHaveProperty('@biomejs/biome');
      expect(pkg.devDependencies).not.toHaveProperty('eslint');
    });

    it('should include typescript and @types/react for TS language', () => {
      const pkg = JSON.parse(generatePackageJson({ ...mockCtx, language: 'typescript' }));
      expect(pkg.devDependencies).toHaveProperty('typescript');
      expect(pkg.devDependencies).toHaveProperty('@types/react');
    });

    it('should exclude typescript and @types/react for JS language', () => {
      const pkg = JSON.parse(generatePackageJson({ ...mockCtx, language: 'javascript' }));
      expect(pkg.devDependencies).not.toHaveProperty('typescript');
      expect(pkg.devDependencies).not.toHaveProperty('@types/react');
    });

    it('should include lefthook devDep when precommit is lefthook', () => {
      const pkg = JSON.parse(generatePackageJson({ ...mockCtx, preCommit: 'lefthook' }));
      expect(pkg.devDependencies).toHaveProperty('lefthook');
    });

    it('should include husky devDep when precommit is husky', () => {
      const pkg = JSON.parse(generatePackageJson({ ...mockCtx, preCommit: 'husky' }));
      expect(pkg.devDependencies).toHaveProperty('husky');
    });

    it('should not include precommit devDeps when precommit is none', () => {
      const pkg = JSON.parse(generatePackageJson({ ...mockCtx, preCommit: 'none' }));
      expect(pkg.devDependencies).not.toHaveProperty('lefthook');
      expect(pkg.devDependencies).not.toHaveProperty('husky');
    });

    it('should include vitest devDep', () => {
      const pkg = JSON.parse(generatePackageJson(mockCtx));
      expect(pkg.devDependencies).toHaveProperty('vitest');
    });

    it('should have typecheck script only for TypeScript', () => {
      const tsPkg = JSON.parse(generatePackageJson({ ...mockCtx, language: 'typescript' }));
      expect(tsPkg.scripts).toHaveProperty('typecheck');

      const jsPkg = JSON.parse(generatePackageJson({ ...mockCtx, language: 'javascript' }));
      expect(jsPkg.scripts).not.toHaveProperty('typecheck');
    });

    it('should have build script as tsc for TS, but a simple build for JS', () => {
      const tsPkg = JSON.parse(generatePackageJson({ ...mockCtx, language: 'typescript' }));
      expect(tsPkg.scripts.build).toBe('tsc');

      const jsPkg = JSON.parse(generatePackageJson({ ...mockCtx, language: 'javascript' }));
      expect(jsPkg.scripts.build).toBeDefined();
      expect(jsPkg.scripts.build).not.toBe('tsc');
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

  describe('generateEslintConfig', () => {
    const content = generateEslintConfig(mockCtx);

    it('should be a valid flat config (ESM)', () => {
      expect(content).toContain('export default');
    });

    it('should contain rules object', () => {
      expect(content).toContain('rules');
    });

    it('should include ignores for dist/', () => {
      expect(content).toContain('ignores');
      expect(content).toContain('dist/');
    });
  });

  describe('generatePrettierrc', () => {
    const prettier = JSON.parse(generatePrettierrc(mockCtx));

    it('should be valid JSON with semi', () => {
      expect(prettier).toHaveProperty('semi');
    });

    it('should set singleQuote', () => {
      expect(prettier).toHaveProperty('singleQuote');
    });

    it('should set trailingComma', () => {
      expect(prettier).toHaveProperty('trailingComma');
    });
  });

  describe('generateHuskyHook', () => {
    const content = generateHuskyHook(mockCtx);

    it('should have a shell shebang', () => {
      expect(content).toContain('#!/usr/bin/env sh');
    });

    it('should contain a test command', () => {
      expect(content).toContain('npm test');
    });

    it('should source husky.sh', () => {
      expect(content).toContain('_/husky.sh');
    });
  });

  describe('generateVitestConfig', () => {
    const content = generateVitestConfig(mockCtx);

    it('should be a valid vitest config', () => {
      expect(content).toContain('vitest/config');
      expect(content).toContain('defineConfig');
    });

    it('should define test environment', () => {
      expect(content).toContain('environment');
      expect(content).toContain('node');
    });
  });

  // === BUN RUNTIME TESTS ===

  describe('Bun generatePackageJson', () => {
    it('should use bun build script for Bun+TS scaffold', () => {
      const pkg = JSON.parse(generatePackageJson(bunMockCtx));
      expect(pkg.scripts.build).toBe('bun build --target=node --outdir=dist source/cli.tsx');
    });

    it('should use bun build script for Bun+JS scaffold', () => {
      const pkg = JSON.parse(generatePackageJson({ ...bunMockCtx, language: 'javascript' }));
      expect(pkg.scripts.build).toBe('bun build --target=node --outdir=dist source/cli.jsx');
    });

    it('should use bun dev script for Bun+TS scaffold', () => {
      const pkg = JSON.parse(generatePackageJson(bunMockCtx));
      expect(pkg.scripts.dev).toBe('bun --watch source/cli.tsx');
    });

    it('should use bun dev script for Bun+JS scaffold', () => {
      const pkg = JSON.parse(generatePackageJson({ ...bunMockCtx, language: 'javascript' }));
      expect(pkg.scripts.dev).toBe('bun --watch source/cli.jsx');
    });

    it('should use bun start script for Bun scaffold', () => {
      const pkg = JSON.parse(generatePackageJson(bunMockCtx));
      expect(pkg.scripts.start).toBe('bun dist/cli.js');
    });

    it('should use bun test script for Bun scaffold', () => {
      const pkg = JSON.parse(generatePackageJson(bunMockCtx));
      expect(pkg.scripts.test).toBe('bun test');
    });

    it('should not include vitest devDep for Bun scaffold', () => {
      const pkg = JSON.parse(generatePackageJson(bunMockCtx));
      expect(pkg.devDependencies).not.toHaveProperty('vitest');
    });

    it('should include typecheck and typescript for Bun+TS scaffold', () => {
      const pkg = JSON.parse(generatePackageJson(bunMockCtx));
      expect(pkg.scripts).toHaveProperty('typecheck');
      expect(pkg.devDependencies).toHaveProperty('typescript');
      expect(pkg.devDependencies).toHaveProperty('@types/react');
    });

    it('should exclude typecheck and typescript for Bun+JS scaffold', () => {
      const pkg = JSON.parse(generatePackageJson({ ...bunMockCtx, language: 'javascript' }));
      expect(pkg.scripts).not.toHaveProperty('typecheck');
      expect(pkg.devDependencies).not.toHaveProperty('typescript');
      expect(pkg.devDependencies).not.toHaveProperty('@types/react');
    });

    it('should include linter devDeps for Bun scaffold with biome', () => {
      const pkg = JSON.parse(generatePackageJson({ ...bunMockCtx, linter: 'biome' }));
      expect(pkg.devDependencies).toHaveProperty('@biomejs/biome');
    });

    it('should include linter devDeps for Bun scaffold with eslint-prettier', () => {
      const pkg = JSON.parse(generatePackageJson({ ...bunMockCtx, linter: 'eslint-prettier' }));
      expect(pkg.devDependencies).toHaveProperty('eslint');
      expect(pkg.devDependencies).toHaveProperty('prettier');
    });

    it('should include precommit devDeps for Bun scaffold with lefthook', () => {
      const pkg = JSON.parse(generatePackageJson({ ...bunMockCtx, preCommit: 'lefthook' }));
      expect(pkg.devDependencies).toHaveProperty('lefthook');
    });

    it('should include precommit devDeps for Bun scaffold with husky', () => {
      const pkg = JSON.parse(generatePackageJson({ ...bunMockCtx, preCommit: 'husky' }));
      expect(pkg.devDependencies).toHaveProperty('husky');
    });

    it('should include Ink and React deps for Bun scaffold', () => {
      const pkg = JSON.parse(generatePackageJson(bunMockCtx));
      expect(pkg.dependencies).toHaveProperty('ink');
      expect(pkg.dependencies).toHaveProperty('react');
    });
  });

  describe('Bun generateGitignore', () => {
    it('should include bun.lock for Bun scaffold', () => {
      const content = generateGitignore(bunMockCtx);
      expect(content).toContain('bun.lock');
    });

    it('should not include bun.lock for Node scaffold', () => {
      const content = generateGitignore(mockCtx);
      expect(content).not.toContain('bun.lock');
    });

    it('should still ignore node_modules for Bun scaffold', () => {
      const content = generateGitignore(bunMockCtx);
      expect(content).toContain('node_modules/');
    });
  });

  describe('Bun generateReadme', () => {
    it('should show bun install instead of npm install', () => {
      const content = generateReadme(bunMockCtx);
      expect(content).toContain('bun install');
      expect(content).not.toContain('npm install');
    });

    it('should show bun run dev instead of npm run dev', () => {
      const content = generateReadme(bunMockCtx);
      expect(content).toContain('bun run dev');
    });

    it('should show bun test instead of npm test', () => {
      const content = generateReadme(bunMockCtx);
      expect(content).toContain('bun test');
    });
  });

  describe('Bun generateLefthookYml', () => {
    it('should use bun commands for Bun scaffold', () => {
      const content = generateLefthookYml(bunMockCtx);
      expect(content).toContain('bun run typecheck');
      expect(content).toContain('bun run lint');
      expect(content).toContain('bun run format');
    });

    it('should use npm commands for Node scaffold', () => {
      const content = generateLefthookYml(mockCtx);
      expect(content).toContain('npm run typecheck');
      expect(content).toContain('npm run lint');
      expect(content).toContain('npm run format');
    });
  });

  describe('Bun generateHuskyHook', () => {
    it('should use bun test for Bun scaffold', () => {
      const content = generateHuskyHook(bunMockCtx);
      expect(content).toContain('bun test');
    });

    it('should use npm test for Node scaffold', () => {
      const content = generateHuskyHook(mockCtx);
      expect(content).toContain('npm test');
    });
  });
});
