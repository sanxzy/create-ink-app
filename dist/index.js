#!/usr/bin/env node
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/mri/lib/index.js
var require_lib = __commonJS((exports, module) => {
  function toArr(any) {
    return any == null ? [] : Array.isArray(any) ? any : [any];
  }
  function toVal(out, key, val, opts) {
    var x, old = out[key], nxt = ~opts.string.indexOf(key) ? val == null || val === true ? "" : String(val) : typeof val === "boolean" ? val : ~opts.boolean.indexOf(key) ? val === "false" ? false : val === "true" || (out._.push((x = +val, x * 0 === 0) ? x : val), !!val) : (x = +val, x * 0 === 0) ? x : val;
    out[key] = old == null ? nxt : Array.isArray(old) ? old.concat(nxt) : [old, nxt];
  }
  module.exports = function(args, opts) {
    args = args || [];
    opts = opts || {};
    var k, arr, arg, name, val, out = { _: [] };
    var i = 0, j = 0, idx = 0, len = args.length;
    const alibi = opts.alias !== undefined;
    const strict = opts.unknown !== undefined;
    const defaults = opts.default !== undefined;
    opts.alias = opts.alias || {};
    opts.string = toArr(opts.string);
    opts.boolean = toArr(opts.boolean);
    if (alibi) {
      for (k in opts.alias) {
        arr = opts.alias[k] = toArr(opts.alias[k]);
        for (i = 0;i < arr.length; i++) {
          (opts.alias[arr[i]] = arr.concat(k)).splice(i, 1);
        }
      }
    }
    for (i = opts.boolean.length;i-- > 0; ) {
      arr = opts.alias[opts.boolean[i]] || [];
      for (j = arr.length;j-- > 0; )
        opts.boolean.push(arr[j]);
    }
    for (i = opts.string.length;i-- > 0; ) {
      arr = opts.alias[opts.string[i]] || [];
      for (j = arr.length;j-- > 0; )
        opts.string.push(arr[j]);
    }
    if (defaults) {
      for (k in opts.default) {
        name = typeof opts.default[k];
        arr = opts.alias[k] = opts.alias[k] || [];
        if (opts[name] !== undefined) {
          opts[name].push(k);
          for (i = 0;i < arr.length; i++) {
            opts[name].push(arr[i]);
          }
        }
      }
    }
    const keys = strict ? Object.keys(opts.alias) : [];
    for (i = 0;i < len; i++) {
      arg = args[i];
      if (arg === "--") {
        out._ = out._.concat(args.slice(++i));
        break;
      }
      for (j = 0;j < arg.length; j++) {
        if (arg.charCodeAt(j) !== 45)
          break;
      }
      if (j === 0) {
        out._.push(arg);
      } else if (arg.substring(j, j + 3) === "no-") {
        name = arg.substring(j + 3);
        if (strict && !~keys.indexOf(name)) {
          return opts.unknown(arg);
        }
        out[name] = false;
      } else {
        for (idx = j + 1;idx < arg.length; idx++) {
          if (arg.charCodeAt(idx) === 61)
            break;
        }
        name = arg.substring(j, idx);
        val = arg.substring(++idx) || (i + 1 === len || ("" + args[i + 1]).charCodeAt(0) === 45 || args[++i]);
        arr = j === 2 ? [name] : name;
        for (idx = 0;idx < arr.length; idx++) {
          name = arr[idx];
          if (strict && !~keys.indexOf(name))
            return opts.unknown("-".repeat(j) + name);
          toVal(out, name, idx + 1 < arr.length || val, opts);
        }
      }
    }
    if (defaults) {
      for (k in opts.default) {
        if (out[k] === undefined) {
          out[k] = opts.default[k];
        }
      }
    }
    if (alibi) {
      for (k in out) {
        arr = opts.alias[k] || [];
        while (arr.length > 0) {
          out[arr.shift()] = out[k];
        }
      }
    }
    return out;
  };
});

// src/index.ts
import * as path2 from "node:path";
import { fileURLToPath } from "node:url";

// src/application/services/config-generators.ts
var generatePackageJson = (ctx) => {
  return JSON.stringify({
    name: ctx.projectName,
    version: ctx.projectVersion,
    type: "module",
    description: `${ctx.projectName} — Ink + React CLI application`,
    main: "dist/cli.js",
    scripts: {
      build: "tsc",
      dev: "tsc --watch",
      start: "node dist/cli.js",
      test: "vitest run",
      lint: "biome check source/",
      format: "biome format --write source/",
      check: "biome check --write source/",
      typecheck: "tsc --noEmit"
    },
    dependencies: {
      ink: "^7.1.0",
      react: "^19.0.0"
    },
    devDependencies: {
      "@biomejs/biome": "^2.5.0",
      "@types/react": "^19.0.0",
      lefthook: "^2.1.0",
      typescript: "^5.8.0",
      vitest: "^4.1.0"
    },
    engines: {
      node: ">=18.0.0"
    },
    files: ["dist/"]
  }, null, 2);
};
var generateTsconfig = (_ctx) => {
  return JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "bundler",
      outDir: "dist",
      rootDir: "source",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      jsx: "react-jsx",
      jsxImportSource: "react",
      resolveJsonModule: true,
      isolatedModules: true
    },
    include: ["source/**/*.ts", "source/**/*.tsx"],
    exclude: ["node_modules", "dist"]
  }, null, 2);
};
var generateBiomeJson = (_ctx) => {
  return JSON.stringify({
    $schema: "https://biomejs.dev/schemas/2.5.5/schema.json",
    assist: {
      enabled: true,
      actions: {
        source: {
          organizeImports: true
        }
      }
    },
    linter: {
      enabled: true,
      rules: { preset: "recommended" }
    },
    formatter: {
      enabled: true,
      indentStyle: "space",
      indentWidth: 2,
      lineWidth: 100
    },
    javascript: {
      formatter: {
        quoteStyle: "single",
        trailingCommas: "all"
      }
    }
  }, null, 2);
};
var generateLefthookYml = (_ctx) => {
  return [
    "# Auto-generated by create-ink-app",
    "pre-commit:",
    "  parallel: true",
    "  commands:",
    "    typecheck:",
    "      run: npm run typecheck",
    "    lint:",
    "      run: npm run lint",
    "    format:",
    "      run: npm run format",
    ""
  ].join(`
`);
};
var generateCompatJson = (ctx) => {
  return JSON.stringify({
    scaffoldVersion: ctx.projectVersion,
    createdAt: new Date().toISOString(),
    generator: "create-ink-app"
  }, null, 2);
};
var generateGitignore = (_ctx) => {
  return [
    "# Dependencies",
    "node_modules/",
    "",
    "# Build output",
    "dist/",
    "build/",
    "",
    "# Environment",
    ".env",
    ".env.local",
    "",
    "# OS files",
    ".DS_Store",
    "Thumbs.db",
    "",
    "# Editor",
    "*.swp",
    "*.swo",
    "*~",
    "",
    "# Test coverage",
    "coverage/",
    ""
  ].join(`
`);
};
var generateEditorconfig = (_ctx) => {
  return [
    "root = true",
    "",
    "[*]",
    "indent_style = space",
    "indent_size = 2",
    "end_of_line = lf",
    "charset = utf-8",
    "trim_trailing_whitespace = true",
    "insert_final_newline = true",
    "",
    "[*.md]",
    "trim_trailing_whitespace = false",
    ""
  ].join(`
`);
};
var generateReadme = (ctx) => {
  return [
    `# ${ctx.projectName}`,
    "",
    "An Ink + React CLI application scaffolded by create-ink-app.",
    "",
    "## Getting Started",
    "",
    "```sh",
    "# Install dependencies",
    "npm install",
    "",
    "# Run in development mode",
    "npm run dev",
    "",
    "# Build for production",
    "npm run build",
    "",
    "# Start the CLI",
    "npm start",
    "```",
    "",
    "## Available Scripts",
    "",
    "- `npm run build` — Compile TypeScript to `dist/`",
    "- `npm run dev` — Watch mode for development",
    "- `npm start` — Run the CLI application",
    "- `npm test` — Run tests with Vitest",
    "- `npm run lint` — Lint source code with Biome",
    "- `npm run format` — Format source code with Biome",
    "- `npm run check` — Apply lint fixes",
    "- `npm run typecheck` — Type-check without emitting files",
    "",
    "## License",
    "",
    `MIT © ${ctx.currentYear}`
  ].join(`
`);
};
var generateLicense = (ctx) => {
  const year = ctx.currentYear;
  return [
    "MIT License",
    "",
    `Copyright (c) ${year} ${ctx.projectName}`,
    "",
    "Permission is hereby granted, free of charge, to any person obtaining a copy",
    'of this software and associated documentation files (the "Software"), to deal',
    "in the Software without restriction, including without limitation the rights",
    "to use, copy, modify, merge, publish, distribute, sublicense, and/or sell",
    "copies of the Software, and to permit persons to whom the Software is",
    "furnished to do so, subject to the following conditions:",
    "",
    "The above copyright notice and this permission notice shall be included in all",
    "copies or substantial portions of the Software.",
    "",
    'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR',
    "IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,",
    "FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE",
    "AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER",
    "LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM",
    "OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE",
    "SOFTWARE."
  ].join(`
`);
};

// src/shared/errors/result.ts
var ok = (value) => ({ ok: true, value });
var err = (error) => ({ ok: false, error });

// src/domain/value-objects/project-name.ts
var RESERVED_NAMES = new Set([
  "node_modules",
  "favicon.ico",
  "create-ink-app",
  "ink",
  "react",
  "npm",
  "node",
  "bun"
]);
var MAX_LENGTH = 214;
var createProjectName = (input) => {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return err({
      kind: "empty",
      message: "Project name cannot be empty."
    });
  }
  if (trimmed.length > MAX_LENGTH) {
    return err({
      kind: "too_long",
      message: `Project name must be ${MAX_LENGTH} characters or fewer.`
    });
  }
  if (trimmed.startsWith("@")) {
    const scopeAndName = trimmed.slice(1);
    const parts = scopeAndName.split("/");
    if (parts.length !== 2 || parts[0].length === 0 || parts[1].length === 0) {
      return err({
        kind: "invalid_character",
        message: `"${trimmed}" is not a valid scoped package name. Use format @scope/name.`
      });
    }
  }
  if (trimmed !== trimmed.toLowerCase()) {
    return err({
      kind: "invalid_character",
      message: `"${trimmed}" is not a valid project name. Use lowercase characters only.`
    });
  }
  if (!trimmed.startsWith("@")) {
    if (trimmed.startsWith(".") || trimmed.startsWith("_")) {
      return err({
        kind: "invalid_character",
        message: `"${trimmed}" is not a valid project name. Project name cannot start with a dot or underscore.`
      });
    }
  }
  const validPattern = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
  if (!validPattern.test(trimmed)) {
    return err({
      kind: "invalid_character",
      message: `"${trimmed}" is not a valid project name. Use only lowercase letters, numbers, hyphens, underscores, and dots.`
    });
  }
  const namePart = trimmed.startsWith("@") ? trimmed.split("/")[1] : trimmed;
  if (RESERVED_NAMES.has(namePart)) {
    return err({
      kind: "reserved",
      message: `"${namePart}" is a reserved package name and cannot be used as a project name.`
    });
  }
  return ok({ value: trimmed });
};

// src/application/commands/scaffold-project.ts
var NODE_TS_TEMPLATES = [
  "source/app.tsx.template",
  "source/cli.tsx.template",
  "test.tsx.template"
];
var CONFIG_FILES = [
  { filename: "package.json", generator: generatePackageJson },
  { filename: "tsconfig.json", generator: generateTsconfig },
  { filename: "biome.json", generator: generateBiomeJson },
  { filename: "lefthook.yml", generator: generateLefthookYml },
  { filename: "compat.json", generator: generateCompatJson },
  { filename: ".gitignore", generator: generateGitignore },
  { filename: ".editorconfig", generator: generateEditorconfig },
  { filename: "readme.md", generator: generateReadme },
  { filename: "LICENSE", generator: generateLicense }
];
var makeScaffoldProject = (deps) => (input) => {
  const nameResult = createProjectName(input.projectName);
  if (!nameResult.ok) {
    return err({
      kind: "invalid_name",
      message: nameResult.error.message
    });
  }
  const projectName = nameResult.value;
  const targetDir = input.projectName;
  if (deps.fs.directoryExists(targetDir) && !input.overwrite) {
    return err({
      kind: "directory_exists",
      message: `Directory "${targetDir}" already exists. Use --overwrite to overwrite.`
    });
  }
  if (!input.dryRun) {
    const mkdirResult = deps.fs.createDirectory(targetDir);
    if (!mkdirResult.ok) {
      return err({
        kind: "file_system",
        message: mkdirResult.error.message
      });
    }
    const mkdirSourceResult = deps.fs.createDirectory(`${targetDir}/source`);
    if (!mkdirSourceResult.ok) {
      return err({
        kind: "file_system",
        message: mkdirSourceResult.error.message
      });
    }
  }
  const createdFiles = [];
  const ctx = {
    projectName: projectName.value,
    projectVersion: "1.0.0",
    currentYear: String(new Date().getFullYear())
  };
  for (const config of CONFIG_FILES) {
    const content = config.generator(ctx);
    const filePath = `${targetDir}/${config.filename}`;
    if (!input.dryRun) {
      const writeResult = deps.fs.writeFile(filePath, content);
      if (!writeResult.ok) {
        return err({
          kind: "file_system",
          message: writeResult.error.message
        });
      }
    }
    createdFiles.push(filePath);
  }
  const templateDir = `${deps.templatesDir}/node/typescript`;
  for (const templateFile of NODE_TS_TEMPLATES) {
    const templatePath = `${templateDir}/${templateFile}`;
    if (!input.dryRun) {
      const processResult = deps.templates.processTemplateFile(templatePath, {
        PROJECT_NAME: projectName.value,
        PROJECT_VERSION: "1.0.0",
        CURRENT_YEAR: String(new Date().getFullYear())
      }, templateFile);
      if (!processResult.ok) {
        return err({
          kind: "template_error",
          message: processResult.error.message
        });
      }
      const { content, outputFilename } = processResult.value;
      const outputPath = `${targetDir}/${outputFilename}`;
      const writeResult = deps.fs.writeFile(outputPath, content);
      if (!writeResult.ok) {
        return err({
          kind: "file_system",
          message: writeResult.error.message
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
    files: createdFiles
  });
};

// src/infrastructure/file-system/node-file-system.ts
import fs from "node:fs";
import path from "node:path";
var makeNodeFileSystem = () => {
  const readFile = (filePath) => {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return ok(content);
    } catch (error) {
      return err({
        kind: "read_error",
        message: `Failed to read file "${filePath}": ${error.message}`
      });
    }
  };
  const writeFile = (filePath, content) => {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, content, "utf-8");
      return ok(undefined);
    } catch (error) {
      return err({
        kind: "write_error",
        message: `Failed to write file "${filePath}": ${error.message}`
      });
    }
  };
  const createDirectory = (dirPath) => {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      return ok(undefined);
    } catch (error) {
      return err({
        kind: "mkdir_error",
        message: `Failed to create directory "${dirPath}": ${error.message}`
      });
    }
  };
  const directoryExists = (dirPath) => {
    try {
      return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    } catch {
      return false;
    }
  };
  const fileExists = (filePath) => {
    try {
      return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    } catch {
      return false;
    }
  };
  const copyFile = (src, dest) => {
    try {
      fs.copyFileSync(src, dest);
      return ok(undefined);
    } catch (error) {
      return err({
        kind: "write_error",
        message: `Failed to copy file from "${src}" to "${dest}": ${error.message}`
      });
    }
  };
  const readDirectory = (dirPath) => {
    try {
      const entries = fs.readdirSync(dirPath);
      return ok(entries);
    } catch (error) {
      return err({
        kind: "read_error",
        message: `Failed to read directory "${dirPath}": ${error.message}`
      });
    }
  };
  return {
    readFile,
    writeFile,
    createDirectory,
    directoryExists,
    fileExists,
    copyFile,
    readDirectory
  };
};

// src/infrastructure/templates/template-engine.ts
var makeTemplateEngine = (fs2) => {
  const processTemplate = (template, vars) => {
    return template.replace(/<%(\s*[A-Z_][A-Z0-9_]*\s*(?:\|[^%]*)?)\s*%>/g, (_match, key) => {
      const trimmed = key.trim();
      const pipeIndex = trimmed.indexOf("|");
      let varName;
      let defaultValue;
      if (pipeIndex !== -1) {
        varName = trimmed.slice(0, pipeIndex).trim();
        defaultValue = trimmed.slice(pipeIndex + 1).trim();
      } else {
        varName = trimmed;
        defaultValue = undefined;
      }
      if (Object.hasOwn(vars, varName)) {
        return vars[varName];
      }
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      return _match;
    });
  };
  const getOutputFilename = (templateFilename) => {
    if (templateFilename.endsWith(".template")) {
      return templateFilename.slice(0, -".template".length);
    }
    return templateFilename;
  };
  const processTemplateFile = (templatePath, vars, relativePath) => {
    const readResult = fs2.readFile(templatePath);
    if (!readResult.ok) {
      return err({
        kind: "template_not_found",
        message: `Template not found: ${templatePath}`
      });
    }
    const content = processTemplate(readResult.value, vars);
    const outputFilename = getOutputFilename(relativePath || templatePath);
    return ok({ content, outputFilename });
  };
  return {
    processTemplate,
    processTemplateFile,
    getOutputFilename
  };
};

// src/presentation/commands/create-app.ts
var import_mri = __toESM(require_lib(), 1);

// src/presentation/formatters/output-formatter.ts
var formatScaffoldSuccess = (result) => {
  const lines = [
    "",
    "  ✓ Project created successfully!",
    "",
    `  Project directory: ${result.projectDir}`,
    "",
    "  Files created:",
    ...result.files.map((f) => `    • ${f}`),
    "",
    "  Next steps:",
    `    cd ${result.projectDir}`,
    "    npm install",
    "    npm run dev",
    ""
  ];
  return lines.join(`
`);
};
var formatScaffoldError = (error) => {
  switch (error.kind) {
    case "invalid_name":
      return `  ✗ Invalid project name: ${error.message}`;
    case "directory_exists":
      return `  ✗ ${error.message}`;
    case "file_system":
      return `  ✗ File system error: ${error.message}`;
    case "template_error":
      return `  ✗ Template error: ${error.message}`;
  }
};
var formatHelp = () => {
  return [
    "",
    "  create-ink-app — Scaffold a complete Ink React CLI project",
    "",
    "  Usage:",
    "    create-ink-app <project-name> [options]",
    "",
    "  Arguments:",
    "    project-name            Name of the project to scaffold",
    "",
    "  Options:",
    "    --help                  Show this help message",
    "    --version               Show version number",
    "    --no-interactive        Skip interactive prompts",
    "    --overwrite             Overwrite existing directory",
    "    --dry-run               Preview files without writing",
    ""
  ].join(`
`);
};
var formatVersion = (version) => {
  return version;
};
var formatScaffoldResult = (result) => {
  if (result.ok) {
    return { text: formatScaffoldSuccess(result.value), exitCode: 0 };
  }
  return { text: formatScaffoldError(result.error), exitCode: 1 };
};

// src/application/dtos/scaffold-input.ts
var DEFAULT_SCAFFOLD_INPUT = {
  projectName: "",
  runtime: "node",
  language: "typescript",
  linter: "biome",
  preCommit: "lefthook",
  overwrite: false,
  dryRun: false
};

// src/presentation/parsers/args-parser.ts
var parseArgs = (args) => {
  return {
    help: args.help === true,
    version: args.version === true,
    noInteractive: args["no-interactive"] === true || args.noInteractive === true,
    overwrite: args.overwrite === true,
    dryRun: args.dryRun === true || args["dry-run"] === true,
    projectName: typeof args._[0] === "string" ? args._[0] : "",
    unknownArgs: args._.slice(1).map(String)
  };
};
var parsedArgsToScaffoldInput = (parsed) => {
  return {
    projectName: parsed.projectName || DEFAULT_SCAFFOLD_INPUT.projectName,
    runtime: DEFAULT_SCAFFOLD_INPUT.runtime,
    language: DEFAULT_SCAFFOLD_INPUT.language,
    linter: DEFAULT_SCAFFOLD_INPUT.linter,
    preCommit: DEFAULT_SCAFFOLD_INPUT.preCommit,
    overwrite: parsed.overwrite || DEFAULT_SCAFFOLD_INPUT.overwrite,
    dryRun: parsed.dryRun || DEFAULT_SCAFFOLD_INPUT.dryRun
  };
};

// src/presentation/commands/create-app.ts
var gracefulExit = (code) => {
  process.stdout.write("", () => {
    if (code !== 0) {
      process.stderr.write("", () => {
        process.exit(code);
      });
    } else {
      process.exit(code);
    }
  });
};
var runCreateApp = (scaffoldProject, options) => {
  const rawArgs = process.argv.slice(2);
  const parsed = import_mri.default(rawArgs, {
    alias: {
      help: ["h"],
      version: ["v"],
      "no-interactive": ["noInteractive"],
      overwrite: ["o"],
      "dry-run": ["dryRun"]
    },
    boolean: ["help", "version", "no-interactive", "overwrite", "dry-run"],
    default: {
      help: false,
      version: false,
      "no-interactive": false,
      overwrite: false,
      "dry-run": false
    }
  });
  const args = parseArgs(parsed);
  if (args.help) {
    console.log(formatHelp());
    gracefulExit(0);
    return;
  }
  if (args.version) {
    console.log(formatVersion(options.version));
    gracefulExit(0);
    return;
  }
  if (!args.projectName && !args.noInteractive) {
    console.error("  ✗ Project name is required.");
    console.error("  Usage: create-ink-app <project-name> [options]");
    console.error("  Try:   create-ink-app --help");
    gracefulExit(1);
    return;
  }
  if (!args.projectName) {
    console.error("  ✗ Project name is required when running in non-interactive mode.");
    gracefulExit(1);
    return;
  }
  const input = parsedArgsToScaffoldInput(args);
  const result = scaffoldProject(input);
  const { text, exitCode } = formatScaffoldResult(result);
  if (exitCode === 0) {
    console.log(text);
  } else {
    console.error(text);
  }
  gracefulExit(exitCode);
};
// package.json
var package_default = {
  name: "create-ink-app",
  version: "0.1.0",
  description: "Scaffold a complete, runnable Ink React project",
  type: "module",
  bin: {
    "create-ink-app": "./dist/index.js"
  },
  scripts: {
    build: "bun build --target=node --outdir=dist src/index.ts",
    dev: "bun --watch src/index.ts",
    start: "bun src/index.ts",
    test: "vitest run",
    "test:watch": "vitest",
    lint: "biome check src/",
    format: "biome format --write src/",
    check: "biome check --write src/",
    typecheck: "tsc --noEmit"
  },
  dependencies: {
    mri: "^1.2.0"
  },
  devDependencies: {
    "@biomejs/biome": "^2.5.5",
    "@types/node": "^22.0.0",
    "@vitest/coverage-v8": "^4.1.10",
    lefthook: "^2.1.10",
    tempy: "^3.2.0",
    typescript: "^5.8.0",
    vitest: "^4.1.10"
  },
  engines: {
    node: ">=18.0.0"
  },
  files: [
    "dist/",
    "templates/",
    "package.json"
  ]
};

// src/index.ts
var __filename2 = fileURLToPath(import.meta.url);
var packageRoot = path2.resolve(path2.dirname(__filename2), "..");
var fs2 = makeNodeFileSystem();
var templates = makeTemplateEngine(fs2);
var scaffoldProject = makeScaffoldProject({
  fs: fs2,
  templates,
  templatesDir: path2.join(packageRoot, "templates")
});
runCreateApp(scaffoldProject, { version: package_default.version });
