/**
 * ScaffoldProject use case.
 *
 * Orchestrates the project scaffolding operation:
 * 1. Validate the project name
 * 2. Create the output directory
 * 3. Generate all project files (config + templates)
 * 4. Return the list of created files
 */

import type { ScaffoldInput } from '@/application/dtos/scaffold-input';
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
import type { FileSystemPort, TemplateEnginePort } from '@/domain/repositories/ports';
import { createProjectName } from '@/domain/value-objects/project-name';
import type { Result } from '@/shared/errors/result';
import { err, ok } from '@/shared/errors/result';

export type ScaffoldError =
  | { kind: 'invalid_name'; message: string }
  | { kind: 'directory_exists'; message: string }
  | { kind: 'file_system'; message: string }
  | { kind: 'template_error'; message: string };

export interface ScaffoldResult {
  projectDir: string;
  files: string[];
}

/** Template files to process for Node + TypeScript */
const NODE_TS_TEMPLATES = [
  'source/app.tsx.template',
  'source/cli.tsx.template',
  'test.tsx.template',
];

/** Config generators to run with their output filenames */
interface ConfigEntry {
  filename: string;
  generator: (ctx: GeneratorContext) => string;
}

const CONFIG_FILES: ConfigEntry[] = [
  { filename: 'package.json', generator: generatePackageJson },
  { filename: 'tsconfig.json', generator: generateTsconfig },
  { filename: 'biome.json', generator: generateBiomeJson },
  { filename: 'lefthook.yml', generator: generateLefthookYml },
  { filename: 'compat.json', generator: generateCompatJson },
  { filename: '.gitignore', generator: generateGitignore },
  { filename: '.editorconfig', generator: generateEditorconfig },
  { filename: 'readme.md', generator: generateReadme },
  { filename: 'LICENSE', generator: generateLicense },
];

export interface ScaffoldDeps {
  fs: FileSystemPort;
  templates: TemplateEnginePort;
  templatesDir: string;
}

export type ScaffoldProject = (
  deps: ScaffoldDeps,
) => (input: ScaffoldInput) => Result<ScaffoldResult, ScaffoldError>;

export const makeScaffoldProject: ScaffoldProject = (deps) => (input) => {
  // 1. Validate project name
  const nameResult = createProjectName(input.projectName);
  if (!nameResult.ok) {
    return err({
      kind: 'invalid_name',
      message: nameResult.error.message,
    });
  }

  const projectName = nameResult.value;
  const targetDir = input.projectName; // Use original input as directory name

  // 2. Check if directory exists
  if (deps.fs.directoryExists(targetDir) && !input.overwrite) {
    return err({
      kind: 'directory_exists',
      message: `Directory "${targetDir}" already exists. Use --overwrite to overwrite.`,
    });
  }

  // 3. Create output directory
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
  };

  // 4. Generate config files
  for (const config of CONFIG_FILES) {
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
  const templateDir = `${deps.templatesDir}/node/typescript`;
  for (const templateFile of NODE_TS_TEMPLATES) {
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
