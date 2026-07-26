/**
 * Output formatters for CLI output.
 *
 * Translates Result types into human-readable console output.
 */
export const formatScaffoldSuccess = (result) => {
    const lines = [
        '',
        '  ✓ Project created successfully!',
        '',
        `  Project directory: ${result.projectDir}`,
        '',
        '  Files created:',
        ...result.files.map((f) => `    • ${f}`),
        '',
        '  Next steps:',
        `    cd ${result.projectDir}`,
        '    npm install',
        '    npm run dev',
        '',
    ];
    return lines.join('\n');
};
export const formatScaffoldError = (error) => {
    switch (error.kind) {
        case 'invalid_name':
            return `  ✗ Invalid project name: ${error.message}`;
        case 'directory_exists':
            return `  ✗ ${error.message}`;
        case 'file_system':
            return `  ✗ File system error: ${error.message}`;
        case 'template_error':
            return `  ✗ Template error: ${error.message}`;
    }
};
export const formatHelp = () => {
    return [
        '',
        '  create-ink-app — Scaffold a complete Ink React CLI project',
        '',
        '  Usage:',
        '    create-ink-app <project-name> [options]',
        '',
        '  Arguments:',
        '    project-name            Name of the project to scaffold',
        '',
        '  Options:',
        '    --help                  Show this help message',
        '    --version               Show version number',
        '    --no-interactive        Skip interactive prompts',
        '    --overwrite             Overwrite existing directory',
        '    --dry-run               Preview files without writing',
        '',
    ].join('\n');
};
export const formatVersion = (version) => {
    return version;
};
export const formatScaffoldResult = (result) => {
    if (result.ok) {
        return { text: formatScaffoldSuccess(result.value), exitCode: 0 };
    }
    return { text: formatScaffoldError(result.error), exitCode: 1 };
};
//# sourceMappingURL=output-formatter.js.map