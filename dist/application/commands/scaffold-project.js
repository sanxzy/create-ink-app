/**
 * ScaffoldProject use case.
 *
 * Orchestrates the project scaffolding operation:
 * 1. Validate the project name
 * 2. Create the output directory
 * 3. Generate all project files (config + templates)
 * 4. Return the list of created files
 */
import { createProjectName } from '@/domain/value-objects/project-name';
import { err, ok } from '@/shared/errors/result';
import { generateBiomeJson, generateCompatJson, generateEditorconfig, generateGitignore, generateLefthookYml, generateLicense, generatePackageJson, generateReadme, generateTsconfig, } from '@/application/services/config-generators';
/** Template files to process for Node + TypeScript */
const NODE_TS_TEMPLATES = [
    'source/app.tsx.template',
    'source/cli.tsx.template',
    'test.tsx.template',
];
const CONFIG_FILES = [
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
export const makeScaffoldProject = (deps) => (input) => {
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
    const createdFiles = [];
    const ctx = {
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
            const processResult = deps.templates.processTemplateFile(templatePath, {
                PROJECT_NAME: projectName.value,
                PROJECT_VERSION: '1.0.0',
                CURRENT_YEAR: String(new Date().getFullYear()),
            }, templateFile);
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
        }
        else {
            const outputFilename = deps.templates.getOutputFilename(templateFile);
            createdFiles.push(`${targetDir}/${outputFilename}`);
        }
    }
    return ok({
        projectDir: targetDir,
        files: createdFiles,
    });
};
//# sourceMappingURL=scaffold-project.js.map