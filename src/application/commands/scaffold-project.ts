/**
 * ScaffoldProject use case.
 *
 * Orchestrates the project scaffolding operation:
 * 1. Check runtime (Node.js) is installed
 * 2. Validate the project name
 * 3. Create the output directory
 * 4. Generate all project files (config + templates)
 * 5. Return the list of created files
 *
 * Supports multiple combinations:
 * - Language: TypeScript (.tsx) or JavaScript (.jsx)
 * - Linter: Biome, ESLint+Prettier, or none
 * - Pre-commit: Lefthook, Husky, or none
 * - Dry-run: preview without writing
 */

import type { ScaffoldInput } from '@/application/dtos/scaffold-input';
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
import type { FileSystemPort, TemplateEnginePort } from '@/domain/repositories/ports';
import { createProjectName } from '@/domain/value-objects/project-name';
import type { Result } from '@/shared/errors/result';
import { err, ok } from '@/shared/errors/result';
import type { Runtime } from '@/shared/types';

export type ScaffoldError =
  | { kind: 'invalid_name'; message: string }
  | { kind: 'directory_exists'; message: string }
  | { kind: 'file_system'; message: string }
  | { kind: 'template_error'; message: string }
  | { kind: 'runtime_not_found'; message: string }
  | { kind: 'not_writable'; message: string };

export interface ScaffoldResult {
  projectDir: string;
  files: string[];
}

/** Config generators to run with their output filenames */
interface ConfigEntry {
  filename: string;
  generator: (ctx: GeneratorContext) => string;
}

export interface ScaffoldDeps {
  fs: FileSystemPort;
  templates: TemplateEnginePort;
  templatesDir: string;
  checkRuntime: (
    runtime: Runtime,
  ) => Result<string, { kind: 'runtime_not_found'; message: string }>;
}

export type ScaffoldProject = (
  deps: ScaffoldDeps,
) => (input: ScaffoldInput) => Result<ScaffoldResult, ScaffoldError>;

/**
 * Build the list of config file entries based on the scaffold input.
 * This makes the config generation fully declarative and easy to test.
 */
const buildConfigEntries = (input: ScaffoldInput): ConfigEntry[] => {
  const entries: ConfigEntry[] = [
    { filename: 'package.json', generator: generatePackageJson },
    { filename: 'compat.json', generator: generateCompatJson },
    { filename: '.gitignore', generator: generateGitignore },
    { filename: '.editorconfig', generator: generateEditorconfig },
    { filename: 'readme.md', generator: generateReadme },
    { filename: 'LICENSE', generator: generateLicense },
  ];

  // Language: TypeScript gets tsconfig, JavaScript does not
  if (input.language === 'typescript') {
    entries.push({ filename: 'tsconfig.json', generator: generateTsconfig });
  }

  // Linter: mutually exclusive
  if (input.linter === 'biome') {
    entries.push({ filename: 'biome.json', generator: generateBiomeJson });
  } else if (input.linter === 'eslint-prettier') {
    entries.push({ filename: 'eslint.config.js', generator: generateEslintConfig });
    entries.push({ filename: '.prettierrc', generator: generatePrettierrc });
  }
  // linter === 'none' → no lint config files

  // Pre-commit: mutually exclusive
  if (input.preCommit === 'lefthook') {
    entries.push({ filename: 'lefthook.yml', generator: generateLefthookYml });
  } else if (input.preCommit === 'husky') {
    entries.push({ filename: '.husky/pre-commit', generator: generateHuskyHook });
  }
  // preCommit === 'none' → no hook config files

  // Vitest config only for Node scaffolds — Bun uses built-in test runner
  if (input.runtime !== 'bun') {
    entries.push({ filename: 'vitest.config.ts', generator: generateVitestConfig });
  }

  return entries;
};

/** Get template files for a given language */
const getTemplateFiles = (language: string): string[] => {
  if (language === 'javascript') {
    return ['source/app.jsx.template', 'source/cli.jsx.template', 'test.jsx.template'];
  }
  // TypeScript (default)
  return ['source/app.tsx.template', 'source/cli.tsx.template', 'test.tsx.template'];
};

/** Get the template subdirectory for a given runtime and language. Validates against known values to prevent path traversal. */
const getTemplateDir = (runtime: string, language: string): string => {
  const VALID_RUNTIMES = ['node', 'bun'] as const;
  const VALID_LANGUAGES = ['typescript', 'javascript'] as const;
  if (!(VALID_RUNTIMES as readonly string[]).includes(runtime)) {
    throw new Error(`Invalid runtime: ${runtime}`);
  }
  if (!(VALID_LANGUAGES as readonly string[]).includes(language)) {
    throw new Error(`Invalid language: ${language}`);
  }
  return `${runtime}/${language}`;
};

export const makeScaffoldProject: ScaffoldProject = (deps) => (input) => {
  // 0. Check runtime is installed before any scaffolding
  const runtimeResult = deps.checkRuntime(input.runtime);
  if (!runtimeResult.ok) {
    return err({
      kind: 'runtime_not_found',
      message: runtimeResult.error.message,
    });
  }

  // 1. Validate project name
  const nameResult = createProjectName(input.projectName);
  if (!nameResult.ok) {
    return err({
      kind: 'invalid_name',
      message: nameResult.error.message,
    });
  }

  const projectName = nameResult.value;
  // Use targetDir if provided, otherwise use projectName (original input, not validated)
  const targetDir = input.targetDir ?? input.projectName;

  // 2. Check directory writability
  if (!input.dryRun && !deps.fs.isWritable(targetDir)) {
    return err({
      kind: 'not_writable',
      message: `Directory "${targetDir}" is not writable. Please check permissions.`,
    });
  }

  // 3. Check if directory exists
  if (deps.fs.directoryExists(targetDir) && !input.overwrite) {
    return err({
      kind: 'directory_exists',
      message: `Directory "${targetDir}" already exists. Use --overwrite to overwrite.`,
    });
  }

  // 5. Create output directory
  if (!input.dryRun) {
    const mkdirResult = deps.fs.createDirectory(targetDir);
    if (!mkdirResult.ok) {
      return err({
        kind: 'file_system',
        message: mkdirResult.error.message,
      });
    }

    // Create source subdirectory
    const mkdirSourceResult = deps.fs.createDirectory(`${targetDir}/source`);
    if (!mkdirSourceResult.ok) {
      return err({
        kind: 'file_system',
        message: mkdirSourceResult.error.message,
      });
    }
  }

  const createdFiles: string[] = [];
  const ctx: GeneratorContext = {
    projectName: projectName.value,
    projectVersion: '1.0.0',
    currentYear: String(new Date().getFullYear()),
    runtime: input.runtime,
    language: input.language,
    linter: input.linter,
    preCommit: input.preCommit,
    testFramework: input.testFramework,
  };

  // 4. Generate config files — dynamically built based on input options
  const configEntries = buildConfigEntries(input);
  for (const config of configEntries) {
    const content = config.generator(ctx);
    const filePath = `${targetDir}/${config.filename}`;

    if (!input.dryRun) {
      const writeResult = deps.fs.writeFile(filePath, content);
      if (!writeResult.ok) {
        return err({
          kind: 'file_system',
          message: writeResult.error.message,
        });
      }
    }
    createdFiles.push(filePath);
  }

  // 5. Process template files
  const templateDir = `${deps.templatesDir}/${getTemplateDir(input.runtime, input.language)}`;
  const templateFiles = getTemplateFiles(input.language);

  for (const templateFile of templateFiles) {
    const templatePath = `${templateDir}/${templateFile}`;

    if (!input.dryRun) {
      const processResult = deps.templates.processTemplateFile(
        templatePath,
        {
          PROJECT_NAME: projectName.value,
          PROJECT_VERSION: '1.0.0',
          CURRENT_YEAR: String(new Date().getFullYear()),
        },
        templateFile, // relative path preserves directory structure
      );

      if (!processResult.ok) {
        return err({
          kind: 'template_error',
          message: processResult.error.message,
        });
      }

      const { content, outputFilename } = processResult.value;
      const outputPath = `${targetDir}/${outputFilename}`;

      const writeResult = deps.fs.writeFile(outputPath, content);
      if (!writeResult.ok) {
        return err({
          kind: 'file_system',
          message: writeResult.error.message,
        });
      }

      createdFiles.push(outputPath);
    } else {
      const outputFilename = deps.templates.getOutputFilename(templateFile);
      createdFiles.push(`${targetDir}/${outputFilename}`);
    }
  }

  return ok({
    projectDir: targetDir,
    files: createdFiles,
  });
};
