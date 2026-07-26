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

// node_modules/sisteransi/src/index.js
var require_src = __commonJS((exports, module) => {
  var ESC2 = "\x1B";
  var CSI2 = `${ESC2}[`;
  var beep = "\x07";
  var cursor = {
    to(x, y) {
      if (!y)
        return `${CSI2}${x + 1}G`;
      return `${CSI2}${y + 1};${x + 1}H`;
    },
    move(x, y) {
      let ret = "";
      if (x < 0)
        ret += `${CSI2}${-x}D`;
      else if (x > 0)
        ret += `${CSI2}${x}C`;
      if (y < 0)
        ret += `${CSI2}${-y}A`;
      else if (y > 0)
        ret += `${CSI2}${y}B`;
      return ret;
    },
    up: (count = 1) => `${CSI2}${count}A`,
    down: (count = 1) => `${CSI2}${count}B`,
    forward: (count = 1) => `${CSI2}${count}C`,
    backward: (count = 1) => `${CSI2}${count}D`,
    nextLine: (count = 1) => `${CSI2}E`.repeat(count),
    prevLine: (count = 1) => `${CSI2}F`.repeat(count),
    left: `${CSI2}G`,
    hide: `${CSI2}?25l`,
    show: `${CSI2}?25h`,
    save: `${ESC2}7`,
    restore: `${ESC2}8`
  };
  var scroll = {
    up: (count = 1) => `${CSI2}S`.repeat(count),
    down: (count = 1) => `${CSI2}T`.repeat(count)
  };
  var erase = {
    screen: `${CSI2}2J`,
    up: (count = 1) => `${CSI2}1J`.repeat(count),
    down: (count = 1) => `${CSI2}J`.repeat(count),
    line: `${CSI2}2K`,
    lineEnd: `${CSI2}K`,
    lineStart: `${CSI2}1K`,
    lines(count) {
      let clear = "";
      for (let i = 0;i < count; i++)
        clear += this.line + (i < count - 1 ? cursor.up() : "");
      if (count)
        clear += cursor.left;
      return clear;
    }
  };
  module.exports = { cursor, scroll, erase, beep };
});

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
    var i2 = 0, j = 0, idx = 0, len = args.length;
    const alibi = opts.alias !== undefined;
    const strict = opts.unknown !== undefined;
    const defaults = opts.default !== undefined;
    opts.alias = opts.alias || {};
    opts.string = toArr(opts.string);
    opts.boolean = toArr(opts.boolean);
    if (alibi) {
      for (k in opts.alias) {
        arr = opts.alias[k] = toArr(opts.alias[k]);
        for (i2 = 0;i2 < arr.length; i2++) {
          (opts.alias[arr[i2]] = arr.concat(k)).splice(i2, 1);
        }
      }
    }
    for (i2 = opts.boolean.length;i2-- > 0; ) {
      arr = opts.alias[opts.boolean[i2]] || [];
      for (j = arr.length;j-- > 0; )
        opts.boolean.push(arr[j]);
    }
    for (i2 = opts.string.length;i2-- > 0; ) {
      arr = opts.alias[opts.string[i2]] || [];
      for (j = arr.length;j-- > 0; )
        opts.string.push(arr[j]);
    }
    if (defaults) {
      for (k in opts.default) {
        name = typeof opts.default[k];
        arr = opts.alias[k] = opts.alias[k] || [];
        if (opts[name] !== undefined) {
          opts[name].push(k);
          for (i2 = 0;i2 < arr.length; i2++) {
            opts[name].push(arr[i2]);
          }
        }
      }
    }
    const keys = strict ? Object.keys(opts.alias) : [];
    for (i2 = 0;i2 < len; i2++) {
      arg = args[i2];
      if (arg === "--") {
        out._ = out._.concat(args.slice(++i2));
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
        val = arg.substring(++idx) || (i2 + 1 === len || ("" + args[i2 + 1]).charCodeAt(0) === 45 || args[++i2]);
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
import * as path11 from "node:path";
import { fileURLToPath as fileURLToPath3 } from "node:url";

// src/application/services/config-generators.ts
var generatePackageJson = (ctx) => {
  const isBun = ctx.runtime === "bun";
  const scripts = {};
  if (isBun) {
    scripts.build = `bun build --target=node --outdir=dist src/cli.${ctx.language === "typescript" ? "tsx" : "jsx"}`;
    scripts.dev = `bun --watch src/cli.${ctx.language === "typescript" ? "tsx" : "jsx"}`;
    scripts.start = "bun dist/cli.js";
    scripts.test = "bun test";
  } else {
    scripts.build = ctx.language === "typescript" ? "tsc" : "bun build --target=node --outdir=dist src/cli.jsx";
    scripts.dev = ctx.language === "typescript" ? "tsc --watch" : "bun --watch src/cli.jsx";
    scripts.start = "node dist/cli.js";
    scripts.test = "vitest run";
  }
  if (ctx.language === "typescript") {
    scripts.typecheck = "tsc --noEmit";
  }
  if (ctx.linter === "biome") {
    scripts.lint = "biome check src/";
    scripts.format = "biome format --write src/";
    scripts.check = "biome check --write src/";
  } else if (ctx.linter === "eslint-prettier") {
    scripts.lint = "eslint src/";
    scripts.format = "prettier --write src/";
    scripts.check = "eslint src/ --fix";
  }
  const devDependencies = {};
  if (ctx.language === "typescript") {
    devDependencies.typescript = "^5.8.0";
    devDependencies["@types/react"] = "^19.0.0";
  }
  if (ctx.linter === "biome") {
    devDependencies["@biomejs/biome"] = "^2.5.0";
  } else if (ctx.linter === "eslint-prettier") {
    devDependencies.eslint = "^9.0.0";
    devDependencies.prettier = "^3.5.0";
  }
  if (ctx.preCommit === "lefthook") {
    devDependencies.lefthook = "^2.1.0";
  } else if (ctx.preCommit === "husky") {
    devDependencies.husky = "^9.0.0";
  }
  if (!isBun) {
    devDependencies.vitest = "^4.1.0";
  }
  return JSON.stringify({
    name: ctx.projectName,
    version: ctx.projectVersion,
    type: "module",
    description: `${ctx.projectName} — Ink + React CLI application`,
    main: "dist/cli.js",
    scripts,
    dependencies: {
      ink: "^7.1.0",
      react: "^19.0.0"
    },
    devDependencies,
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
      rootDir: "src",
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
    include: ["src/**/*.ts", "src/**/*.tsx"],
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
var generateLefthookYml = (ctx) => {
  const pm = ctx.runtime === "bun" ? "bun" : "npm";
  return [
    "# Auto-generated by create-ink-app",
    "pre-commit:",
    "  parallel: true",
    "  commands:",
    "    typecheck:",
    `      run: ${pm} run typecheck`,
    "    lint:",
    `      run: ${pm} run lint`,
    "    format:",
    `      run: ${pm} run format`,
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
var generateGitignore = (ctx) => {
  const lines = [
    "# Dependencies",
    "node_modules/",
    "",
    "# Build output",
    "dist/",
    "build/",
    ""
  ];
  if (ctx.runtime === "bun") {
    lines.push("bun.lock");
    lines.push("");
  }
  lines.push("# Environment", ".env", ".env.local", "", "# OS files", ".DS_Store", "Thumbs.db", "", "# Editor", "*.swp", "*.swo", "*~", "", "# Test coverage", "coverage/", "");
  return lines.join(`
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
  const isBun = ctx.runtime === "bun";
  const pm = isBun ? "bun" : "npm";
  const lines = [
    `# ${ctx.projectName}`,
    "",
    "An Ink + React CLI application scaffolded by create-ink-app.",
    "",
    "## Getting Started",
    "",
    "```sh",
    "# Install dependencies",
    `${pm} install`,
    "",
    "# Run in development mode",
    `${pm} run dev`,
    "",
    "# Build for production",
    `${pm} run build`,
    "",
    "# Start the CLI",
    `${pm} start`,
    "```",
    "",
    "## Available Scripts",
    "",
    `- \`${pm} run build\` — Compile to \`dist/\``,
    `- \`${pm} run dev\` — Watch mode for development`,
    `- \`${pm} start\` — Run the CLI application`,
    isBun ? "- `bun test` — Run tests with Bun" : "- `npm test` — Run tests with Vitest"
  ];
  if (ctx.linter === "biome") {
    lines.push(`- \`${pm} run lint\` — Lint source code with Biome`);
    lines.push(`- \`${pm} run format\` — Format source code with Biome`);
    lines.push(`- \`${pm} run check\` — Apply lint fixes`);
  } else if (ctx.linter === "eslint-prettier") {
    lines.push(`- \`${pm} run lint\` — Lint source code with ESLint`);
    lines.push(`- \`${pm} run format\` — Format source code with Prettier`);
    lines.push(`- \`${pm} run check\` — Apply lint fixes`);
  }
  if (ctx.language === "typescript") {
    lines.push(`- \`${pm} run typecheck\` — Type-check without emitting files`);
  }
  lines.push("", "## License", "", `MIT © ${ctx.currentYear}`);
  return lines.join(`
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
var generateEslintConfig = (_ctx) => {
  return [
    "// Auto-generated by create-ink-app",
    "export default [",
    "  {",
    "    rules: {",
    '      semi: ["error", "always"],',
    '      quotes: ["error", "single"],',
    '      "no-unused-vars": "warn",',
    '      "no-console": "off",',
    "    },",
    '    ignores: ["dist/"],',
    "  },",
    "];",
    ""
  ].join(`
`);
};
var generatePrettierrc = (_ctx) => {
  return JSON.stringify({
    semi: true,
    singleQuote: true,
    trailingComma: "all",
    printWidth: 100,
    tabWidth: 2
  }, null, 2);
};
var generateHuskyHook = (ctx) => {
  const pm = ctx.runtime === "bun" ? "bun" : "npm";
  return ["#!/usr/bin/env sh", '. "$(dirname -- "$0")/_/husky.sh"', "", `${pm} test`, ""].join(`
`);
};
var generateVitestConfig = (_ctx) => {
  return [
    "import { defineConfig } from 'vitest/config';",
    "",
    "export default defineConfig({",
    "  test: {",
    '    environment: "node",',
    "  },",
    "});",
    ""
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
var buildConfigEntries = (input) => {
  const entries = [
    { filename: "package.json", generator: generatePackageJson },
    { filename: "compat.json", generator: generateCompatJson },
    { filename: ".gitignore", generator: generateGitignore },
    { filename: ".editorconfig", generator: generateEditorconfig },
    { filename: "readme.md", generator: generateReadme },
    { filename: "LICENSE", generator: generateLicense }
  ];
  if (input.language === "typescript") {
    entries.push({ filename: "tsconfig.json", generator: generateTsconfig });
  }
  if (input.linter === "biome") {
    entries.push({ filename: "biome.json", generator: generateBiomeJson });
  } else if (input.linter === "eslint-prettier") {
    entries.push({ filename: "eslint.config.js", generator: generateEslintConfig });
    entries.push({ filename: ".prettierrc", generator: generatePrettierrc });
  }
  if (input.preCommit === "lefthook") {
    entries.push({ filename: "lefthook.yml", generator: generateLefthookYml });
  } else if (input.preCommit === "husky") {
    entries.push({ filename: ".husky/pre-commit", generator: generateHuskyHook });
  }
  if (input.runtime !== "bun") {
    entries.push({ filename: "vitest.config.ts", generator: generateVitestConfig });
  }
  return entries;
};
var getTemplateFiles = (language) => {
  if (language === "javascript") {
    return ["src/app.jsx.template", "src/cli.jsx.template", "test.jsx.template"];
  }
  return ["src/app.tsx.template", "src/cli.tsx.template", "test.tsx.template"];
};
var getTemplateDir = (runtime, language) => {
  const VALID_RUNTIMES = ["node", "bun"];
  const VALID_LANGUAGES = ["typescript", "javascript"];
  if (!VALID_RUNTIMES.includes(runtime)) {
    throw new Error(`Invalid runtime: ${runtime}`);
  }
  if (!VALID_LANGUAGES.includes(language)) {
    throw new Error(`Invalid language: ${language}`);
  }
  return `${runtime}/${language}`;
};
var makeScaffoldProject = (deps) => (input) => {
  const runtimeResult = deps.checkRuntime(input.runtime);
  if (!runtimeResult.ok) {
    return err({
      kind: "runtime_not_found",
      message: runtimeResult.error.message
    });
  }
  const nameResult = createProjectName(input.projectName);
  if (!nameResult.ok) {
    return err({
      kind: "invalid_name",
      message: nameResult.error.message
    });
  }
  const projectName = nameResult.value;
  const targetDir = input.targetDir ?? input.projectName;
  if (!input.dryRun && !deps.fs.isWritable(targetDir)) {
    return err({
      kind: "not_writable",
      message: `Directory "${targetDir}" is not writable. Please check permissions.`
    });
  }
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
    const mkdirSourceResult = deps.fs.createDirectory(`${targetDir}/src`);
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
    currentYear: String(new Date().getFullYear()),
    runtime: input.runtime,
    language: input.language,
    linter: input.linter,
    preCommit: input.preCommit,
    testFramework: input.testFramework
  };
  const configEntries = buildConfigEntries(input);
  for (const config of configEntries) {
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
  const templateDir = `${deps.templatesDir}/${getTemplateDir(input.runtime, input.language)}`;
  const templateFiles = getTemplateFiles(input.language);
  for (const templateFile of templateFiles) {
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

// src/infrastructure/cli/runtime-checker.ts
import { execSync } from "node:child_process";
var makeNodeRuntimeChecker = () => {
  return () => {
    try {
      const output = execSync("node --version", {
        encoding: "utf-8",
        timeout: 5000
      });
      return ok(output.trim());
    } catch (error) {
      return err({
        kind: "runtime_not_found",
        message: `Node.js is not available: ${error.message}`
      });
    }
  };
};
var makeBunRuntimeChecker = () => {
  return () => {
    try {
      const output = execSync("bun --version", {
        encoding: "utf-8",
        timeout: 5000
      });
      return ok(output.trim());
    } catch (error) {
      return err({
        kind: "runtime_not_found",
        message: `Bun is not available: ${error.message}`
      });
    }
  };
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
  const isWritable = (dirPath) => {
    try {
      fs.accessSync(dirPath, fs.constants.W_OK);
      return true;
    } catch {
      try {
        const parent = path.dirname(path.resolve(dirPath));
        fs.accessSync(parent, fs.constants.W_OK);
        return true;
      } catch {
        return false;
      }
    }
  };
  return {
    readFile,
    writeFile,
    createDirectory,
    directoryExists,
    fileExists,
    copyFile,
    readDirectory,
    isWritable
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
import * as fs3 from "node:fs";
import * as path10 from "node:path";

// node_modules/@clack/core/dist/index.mjs
import { styleText } from "node:util";
import { stdout, stdin } from "node:process";
import * as l from "node:readline";
import l__default from "node:readline";

// node_modules/fast-string-truncated-width/dist/utils.js
var getCodePointsLength = (() => {
  const SURROGATE_PAIR_RE = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  return (input) => {
    let surrogatePairsNr = 0;
    SURROGATE_PAIR_RE.lastIndex = 0;
    while (SURROGATE_PAIR_RE.test(input)) {
      surrogatePairsNr += 1;
    }
    return input.length - surrogatePairsNr;
  };
})();
var isFullWidth = (x) => {
  return x === 12288 || x >= 65281 && x <= 65376 || x >= 65504 && x <= 65510;
};
var isWideNotCJKTNotEmoji = (x) => {
  return x === 8987 || x === 9001 || x >= 12272 && x <= 12287 || x >= 12289 && x <= 12350 || x >= 12441 && x <= 12543 || x >= 12549 && x <= 12591 || x >= 12593 && x <= 12686 || x >= 12688 && x <= 12771 || x >= 12783 && x <= 12830 || x >= 12832 && x <= 12871 || x >= 12880 && x <= 19903 || x >= 65040 && x <= 65049 || x >= 65072 && x <= 65106 || x >= 65108 && x <= 65126 || x >= 65128 && x <= 65131 || x >= 127488 && x <= 127490 || x >= 127504 && x <= 127547 || x >= 127552 && x <= 127560 || x >= 131072 && x <= 196605 || x >= 196608 && x <= 262141;
};

// node_modules/fast-string-truncated-width/dist/index.js
var ANSI_RE = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]|\u001b\]8;[^;]*;.*?(?:\u0007|\u001b\u005c)/y;
var CONTROL_RE = /[\x00-\x08\x0A-\x1F\x7F-\x9F]{1,1000}/y;
var CJKT_WIDE_RE = /(?:(?![\uFF61-\uFF9F\uFF00-\uFFEF])[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Tangut}]){1,1000}/yu;
var TAB_RE = /\t{1,1000}/y;
var EMOJI_RE = /[\u{1F1E6}-\u{1F1FF}]{2}|\u{1F3F4}[\u{E0061}-\u{E007A}]{2}[\u{E0030}-\u{E0039}\u{E0061}-\u{E007A}]{1,3}\u{E007F}|(?:\p{Emoji}\uFE0F\u20E3?|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation})(?:\u200D(?:\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}|\p{Emoji}\uFE0F\u20E3?))*/yu;
var LATIN_RE = /(?:[\x20-\x7E\xA0-\xFF](?!\uFE0F)){1,1000}/y;
var MODIFIER_RE = /\p{M}+/gu;
var NO_TRUNCATION = { limit: Infinity, ellipsis: "" };
var getStringTruncatedWidth = (input, truncationOptions = {}, widthOptions = {}) => {
  const LIMIT = truncationOptions.limit ?? Infinity;
  const ELLIPSIS = truncationOptions.ellipsis ?? "";
  const ELLIPSIS_WIDTH = truncationOptions?.ellipsisWidth ?? (ELLIPSIS ? getStringTruncatedWidth(ELLIPSIS, NO_TRUNCATION, widthOptions).width : 0);
  const ANSI_WIDTH = 0;
  const CONTROL_WIDTH = widthOptions.controlWidth ?? 0;
  const TAB_WIDTH = widthOptions.tabWidth ?? 8;
  const EMOJI_WIDTH = widthOptions.emojiWidth ?? 2;
  const FULL_WIDTH_WIDTH = 2;
  const REGULAR_WIDTH = widthOptions.regularWidth ?? 1;
  const WIDE_WIDTH = widthOptions.wideWidth ?? FULL_WIDTH_WIDTH;
  const PARSE_BLOCKS = [
    [LATIN_RE, REGULAR_WIDTH],
    [ANSI_RE, ANSI_WIDTH],
    [CONTROL_RE, CONTROL_WIDTH],
    [TAB_RE, TAB_WIDTH],
    [EMOJI_RE, EMOJI_WIDTH],
    [CJKT_WIDE_RE, WIDE_WIDTH]
  ];
  let indexPrev = 0;
  let index = 0;
  let length = input.length;
  let lengthExtra = 0;
  let truncationEnabled = false;
  let truncationIndex = length;
  let truncationLimit = Math.max(0, LIMIT - ELLIPSIS_WIDTH);
  let unmatchedStart = 0;
  let unmatchedEnd = 0;
  let width = 0;
  let widthExtra = 0;
  outer:
    while (true) {
      if (unmatchedEnd > unmatchedStart || index >= length && index > indexPrev) {
        const unmatched = input.slice(unmatchedStart, unmatchedEnd) || input.slice(indexPrev, index);
        lengthExtra = 0;
        for (const char of unmatched.replaceAll(MODIFIER_RE, "")) {
          const codePoint = char.codePointAt(0) || 0;
          if (isFullWidth(codePoint)) {
            widthExtra = FULL_WIDTH_WIDTH;
          } else if (isWideNotCJKTNotEmoji(codePoint)) {
            widthExtra = WIDE_WIDTH;
          } else {
            widthExtra = REGULAR_WIDTH;
          }
          if (width + widthExtra > truncationLimit) {
            truncationIndex = Math.min(truncationIndex, Math.max(unmatchedStart, indexPrev) + lengthExtra);
          }
          if (width + widthExtra > LIMIT) {
            truncationEnabled = true;
            break outer;
          }
          lengthExtra += char.length;
          width += widthExtra;
        }
        unmatchedStart = unmatchedEnd = 0;
      }
      if (index >= length) {
        break outer;
      }
      for (let i = 0, l = PARSE_BLOCKS.length;i < l; i++) {
        const [BLOCK_RE, BLOCK_WIDTH] = PARSE_BLOCKS[i];
        BLOCK_RE.lastIndex = index;
        if (BLOCK_RE.test(input)) {
          lengthExtra = BLOCK_RE === CJKT_WIDE_RE ? getCodePointsLength(input.slice(index, BLOCK_RE.lastIndex)) : BLOCK_RE === EMOJI_RE ? 1 : BLOCK_RE.lastIndex - index;
          widthExtra = lengthExtra * BLOCK_WIDTH;
          if (width + widthExtra > truncationLimit) {
            truncationIndex = Math.min(truncationIndex, index + Math.floor((truncationLimit - width) / BLOCK_WIDTH));
          }
          if (width + widthExtra > LIMIT) {
            truncationEnabled = true;
            break outer;
          }
          width += widthExtra;
          unmatchedStart = indexPrev;
          unmatchedEnd = index;
          index = indexPrev = BLOCK_RE.lastIndex;
          continue outer;
        }
      }
      index += 1;
    }
  return {
    width: truncationEnabled ? truncationLimit : width,
    index: truncationEnabled ? truncationIndex : length,
    truncated: truncationEnabled,
    ellipsed: truncationEnabled && LIMIT >= ELLIPSIS_WIDTH
  };
};
var dist_default = getStringTruncatedWidth;

// node_modules/fast-string-width/dist/index.js
var NO_TRUNCATION2 = {
  limit: Infinity,
  ellipsis: "",
  ellipsisWidth: 0
};
var fastStringWidth = (input, options = {}) => {
  return dist_default(input, NO_TRUNCATION2, options).width;
};
var dist_default2 = fastStringWidth;

// node_modules/fast-wrap-ansi/lib/main.js
var ESC = "\x1B";
var CSI = "";
var END_CODE = 39;
var ANSI_ESCAPE_BELL = "\x07";
var ANSI_CSI = "[";
var ANSI_OSC = "]";
var ANSI_SGR_TERMINATOR = "m";
var ANSI_ESCAPE_LINK = `${ANSI_OSC}8;;`;
var GROUP_REGEX = new RegExp(`(?:\\${ANSI_CSI}(?<code>\\d+)m|\\${ANSI_ESCAPE_LINK}(?<uri>.*)${ANSI_ESCAPE_BELL})`, "y");
var getClosingCode = (openingCode) => {
  if (openingCode >= 30 && openingCode <= 37)
    return 39;
  if (openingCode >= 90 && openingCode <= 97)
    return 39;
  if (openingCode >= 40 && openingCode <= 47)
    return 49;
  if (openingCode >= 100 && openingCode <= 107)
    return 49;
  if (openingCode === 1 || openingCode === 2)
    return 22;
  if (openingCode === 3)
    return 23;
  if (openingCode === 4)
    return 24;
  if (openingCode === 7)
    return 27;
  if (openingCode === 8)
    return 28;
  if (openingCode === 9)
    return 29;
  if (openingCode === 0)
    return 0;
  return;
};
var wrapAnsiCode = (code) => `${ESC}${ANSI_CSI}${code}${ANSI_SGR_TERMINATOR}`;
var wrapAnsiHyperlink = (url) => `${ESC}${ANSI_ESCAPE_LINK}${url}${ANSI_ESCAPE_BELL}`;
var wrapWord = (rows, word, columns) => {
  const characters = word[Symbol.iterator]();
  let isInsideEscape = false;
  let isInsideLinkEscape = false;
  let lastRow = rows.at(-1);
  let visible = lastRow === undefined ? 0 : dist_default2(lastRow);
  let currentCharacter = characters.next();
  let nextCharacter = characters.next();
  let rawCharacterIndex = 0;
  while (!currentCharacter.done) {
    const character = currentCharacter.value;
    const characterLength = dist_default2(character);
    if (visible + characterLength <= columns) {
      rows[rows.length - 1] += character;
    } else {
      rows.push(character);
      visible = 0;
    }
    if (character === ESC || character === CSI) {
      isInsideEscape = true;
      isInsideLinkEscape = word.startsWith(ANSI_ESCAPE_LINK, rawCharacterIndex + 1);
    }
    if (isInsideEscape) {
      if (isInsideLinkEscape) {
        if (character === ANSI_ESCAPE_BELL) {
          isInsideEscape = false;
          isInsideLinkEscape = false;
        }
      } else if (character === ANSI_SGR_TERMINATOR) {
        isInsideEscape = false;
      }
    } else {
      visible += characterLength;
      if (visible === columns && !nextCharacter.done) {
        rows.push("");
        visible = 0;
      }
    }
    currentCharacter = nextCharacter;
    nextCharacter = characters.next();
    rawCharacterIndex += character.length;
  }
  lastRow = rows.at(-1);
  if (!visible && lastRow !== undefined && lastRow.length && rows.length > 1) {
    rows[rows.length - 2] += rows.pop();
  }
};
var stringVisibleTrimSpacesRight = (string) => {
  const words = string.split(" ");
  let last = words.length;
  while (last) {
    if (dist_default2(words[last - 1])) {
      break;
    }
    last--;
  }
  if (last === words.length) {
    return string;
  }
  return words.slice(0, last).join(" ") + words.slice(last).join("");
};
var exec = (string, columns, options = {}) => {
  if (options.trim !== false && string.trim() === "") {
    return "";
  }
  let returnValue = "";
  let escapeCode;
  let escapeUrl;
  const words = string.split(" ");
  let rows = [""];
  let rowLength = 0;
  for (let index = 0;index < words.length; index++) {
    const word = words[index];
    if (options.trim !== false) {
      const row = rows.at(-1) ?? "";
      const trimmed = row.trimStart();
      if (row.length !== trimmed.length) {
        rows[rows.length - 1] = trimmed;
        rowLength = dist_default2(trimmed);
      }
    }
    if (index !== 0) {
      if (rowLength >= columns && (options.wordWrap === false || options.trim === false)) {
        rows.push("");
        rowLength = 0;
      }
      if (rowLength || options.trim === false) {
        rows[rows.length - 1] += " ";
        rowLength++;
      }
    }
    const wordLength = dist_default2(word);
    if (options.hard && wordLength > columns) {
      const remainingColumns = columns - rowLength;
      const breaksStartingThisLine = 1 + Math.floor((wordLength - remainingColumns - 1) / columns);
      const breaksStartingNextLine = Math.floor((wordLength - 1) / columns);
      if (breaksStartingNextLine < breaksStartingThisLine) {
        rows.push("");
      }
      wrapWord(rows, word, columns);
      rowLength = dist_default2(rows.at(-1) ?? "");
      continue;
    }
    if (rowLength + wordLength > columns && rowLength && wordLength) {
      if (options.wordWrap === false && rowLength < columns) {
        wrapWord(rows, word, columns);
        rowLength = dist_default2(rows.at(-1) ?? "");
        continue;
      }
      rows.push("");
      rowLength = 0;
    }
    if (rowLength + wordLength > columns && options.wordWrap === false) {
      wrapWord(rows, word, columns);
      rowLength = dist_default2(rows.at(-1) ?? "");
      continue;
    }
    rows[rows.length - 1] += word;
    rowLength += wordLength;
  }
  if (options.trim !== false) {
    rows = rows.map((row) => stringVisibleTrimSpacesRight(row));
  }
  const preString = rows.join(`
`);
  let inSurrogate = false;
  for (let i = 0;i < preString.length; i++) {
    const character = preString[i];
    returnValue += character;
    if (!inSurrogate) {
      inSurrogate = character >= "\uD800" && character <= "\uDBFF";
      if (inSurrogate) {
        continue;
      }
    } else {
      inSurrogate = false;
    }
    if (character === ESC || character === CSI) {
      GROUP_REGEX.lastIndex = i + 1;
      const groupsResult = GROUP_REGEX.exec(preString);
      const groups = groupsResult?.groups;
      if (groups?.code !== undefined) {
        const code = Number.parseFloat(groups.code);
        escapeCode = code === END_CODE ? undefined : code;
      } else if (groups?.uri !== undefined) {
        escapeUrl = groups.uri.length === 0 ? undefined : groups.uri;
      }
    }
    if (preString[i + 1] === `
`) {
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink("");
      }
      const closingCode = escapeCode ? getClosingCode(escapeCode) : undefined;
      if (escapeCode && closingCode) {
        returnValue += wrapAnsiCode(closingCode);
      }
    } else if (character === `
`) {
      if (escapeCode && getClosingCode(escapeCode)) {
        returnValue += wrapAnsiCode(escapeCode);
      }
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink(escapeUrl);
      }
    }
  }
  return returnValue;
};
var CRLF_OR_LF = /\r?\n/;
function wrapAnsi(string, columns, options) {
  return String(string).normalize().split(CRLF_OR_LF).map((line) => exec(line, columns, options)).join(`
`);
}

// node_modules/@clack/core/dist/index.mjs
var import_sisteransi = __toESM(require_src(), 1);
import { ReadStream } from "node:tty";
function findCursor(s, o, l2) {
  if (!l2.some((r) => !r.disabled))
    return s;
  const t = s + o, n = Math.max(l2.length - 1, 0), e = t < 0 ? n : t > n ? 0 : t;
  return l2[e]?.disabled ? findCursor(e, o < 0 ? -1 : 1, l2) : e;
}
function findTextCursor(s, o, l2, i) {
  const t = i.split(`
`);
  let n = 0, e = s;
  for (const r of t) {
    if (e <= r.length)
      break;
    e -= r.length + 1, n++;
  }
  for (n = Math.max(0, Math.min(t.length - 1, n + l2)), e = Math.min(e, t[n].length) + o;e < 0 && n > 0; )
    n--, e += t[n].length + 1;
  for (;e > t[n].length && n < t.length - 1; )
    e -= t[n].length + 1, n++;
  e = Math.max(0, Math.min(t[n].length, e));
  let h = 0;
  for (let r = 0;r < n; r++)
    h += t[r].length + 1;
  return h + e;
}
var a$1 = ["up", "down", "left", "right", "space", "enter", "cancel"];
var t = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
var settings = {
  actions: new Set(a$1),
  aliases: /* @__PURE__ */ new Map([
    ["k", "up"],
    ["j", "down"],
    ["h", "left"],
    ["l", "right"],
    ["\x03", "cancel"],
    ["escape", "cancel"]
  ]),
  messages: {
    cancel: "Canceled",
    error: "Something went wrong"
  },
  withGuide: true,
  date: {
    monthNames: [...t],
    messages: {
      required: "Please enter a valid date",
      invalidMonth: "There are only 12 months in a year",
      invalidDay: (n, e) => `There are only ${n} days in ${e}`,
      afterMin: (n) => `Date must be on or after ${n.toISOString().slice(0, 10)}`,
      beforeMax: (n) => `Date must be on or before ${n.toISOString().slice(0, 10)}`
    }
  }
};
function isActionKey(n, e) {
  if (typeof n == "string")
    return settings.aliases.get(n) === e;
  for (const s of n)
    if (s !== undefined && isActionKey(s, e))
      return true;
  return false;
}
function diffLines(i, s) {
  if (i === s)
    return;
  const e = i.split(`
`), t2 = s.split(`
`), r = Math.max(e.length, t2.length), f = [];
  for (let n = 0;n < r; n++)
    e[n] !== t2[n] && f.push(n);
  return {
    lines: f,
    numLinesBefore: e.length,
    numLinesAfter: t2.length,
    numLines: r
  };
}
var R = globalThis.process.platform.startsWith("win");
var CANCEL_SYMBOL = Symbol("clack:cancel");
function isCancel(e) {
  return e === CANCEL_SYMBOL;
}
function setRawMode(e, r) {
  const o = e;
  o.isTTY && o.setRawMode(r);
}
function block({
  input: e = stdin,
  output: r = stdout,
  overwrite: o = true,
  hideCursor: t2 = true
} = {}) {
  const s = l.createInterface({
    input: e,
    output: r,
    prompt: "",
    tabSize: 1
  });
  l.emitKeypressEvents(e, s), e instanceof ReadStream && e.isTTY && e.setRawMode(true);
  const n = (f, { name: a, sequence: p }) => {
    const c = String(f);
    if (isActionKey([c, a, p], "cancel")) {
      t2 && r.write(import_sisteransi.cursor.show), process.exit(0);
      return;
    }
    if (!o)
      return;
    const i = a === "return" ? 0 : -1, m = a === "return" ? -1 : 0;
    l.moveCursor(r, i, m, () => {
      l.clearLine(r, 1, () => {
        e.once("keypress", n);
      });
    });
  };
  return t2 && r.write(import_sisteransi.cursor.hide), e.once("keypress", n), () => {
    e.off("keypress", n), t2 && r.write(import_sisteransi.cursor.show), e instanceof ReadStream && e.isTTY && !R && e.setRawMode(false), s.terminal = false, s.close();
  };
}
var getColumns = (e) => ("columns" in e) && typeof e.columns == "number" ? e.columns : 80;
var getRows = (e) => ("rows" in e) && typeof e.rows == "number" ? e.rows : 20;
function wrapTextWithPrefix(e, r, o, t2 = o, s = o, n) {
  const f = getColumns(e ?? stdout);
  return wrapAnsi(r, f - o.length, {
    hard: true,
    trim: false
  }).split(`
`).map((c, i, m) => {
    const d = n ? n(c, i) : c;
    return i === 0 ? `${t2}${d}` : i === m.length - 1 ? `${s}${d}` : `${o}${d}`;
  }).join(`
`);
}
function runValidation(e, n) {
  if ("~standard" in e) {
    const a = e["~standard"].validate(n);
    if (a instanceof Promise)
      throw new TypeError("Schema validation must be synchronous. Update `validate()` and remove any asynchronous logic.");
    return a.issues?.at(0)?.message;
  }
  return e(n);
}

class V {
  input;
  output;
  _abortSignal;
  rl;
  opts;
  _render;
  _track = false;
  _prevFrame = "";
  _subscribers = /* @__PURE__ */ new Map;
  _cursor = 0;
  state = "initial";
  error = "";
  value;
  userInput = "";
  constructor(t2, e = true) {
    const { input: i = stdin, output: n = stdout, render: s, signal: r, ...o } = t2;
    this.opts = o, this.onKeypress = this.onKeypress.bind(this), this.close = this.close.bind(this), this.render = this.render.bind(this), this._render = s.bind(this), this._track = e, this._abortSignal = r, this.input = i, this.output = n;
  }
  unsubscribe() {
    this._subscribers.clear();
  }
  setSubscriber(t2, e) {
    const i = this._subscribers.get(t2) ?? [];
    i.push(e), this._subscribers.set(t2, i);
  }
  on(t2, e) {
    this.setSubscriber(t2, { cb: e });
  }
  once(t2, e) {
    this.setSubscriber(t2, { cb: e, once: true });
  }
  emit(t2, ...e) {
    const i = this._subscribers.get(t2) ?? [], n = [];
    for (const s of i)
      s.cb(...e), s.once && n.push(() => i.splice(i.indexOf(s), 1));
    for (const s of n)
      s();
  }
  prompt() {
    return new Promise((t2) => {
      if (this._abortSignal) {
        if (this._abortSignal.aborted)
          return this.state = "cancel", this.close(), t2(CANCEL_SYMBOL);
        this._abortSignal.addEventListener("abort", () => {
          this.state = "cancel", this.close();
        }, { once: true });
      }
      this.rl = l__default.createInterface({
        input: this.input,
        tabSize: 2,
        prompt: "",
        escapeCodeTimeout: 50,
        terminal: true
      }), this.rl.prompt(), this.opts.initialUserInput !== undefined && this._setUserInput(this.opts.initialUserInput, true), this.input.on("keypress", this.onKeypress), setRawMode(this.input, true), this.output.on("resize", this.render), this.render(), this.once("submit", () => {
        this.output.write(import_sisteransi.cursor.show), this.output.off("resize", this.render), setRawMode(this.input, false), t2(this.value);
      }), this.once("cancel", () => {
        this.output.write(import_sisteransi.cursor.show), this.output.off("resize", this.render), setRawMode(this.input, false), t2(CANCEL_SYMBOL);
      });
    });
  }
  _isActionKey(t2, e) {
    return t2 === "\t";
  }
  _shouldSubmit(t2, e) {
    return true;
  }
  _setValue(t2) {
    this.value = t2, this.emit("value", this.value);
  }
  _setUserInput(t2, e) {
    this.userInput = t2 ?? "", this.emit("userInput", this.userInput), e && this._track && this.rl && (this.rl.write(this.userInput), this._cursor = this.rl.cursor);
  }
  _clearUserInput() {
    this.rl?.write(null, { ctrl: true, name: "u" }), this._setUserInput("");
  }
  onKeypress(t2, e) {
    if (this._track && e.name !== "return" && (e.name && this._isActionKey(t2, e) && this.rl?.write(null, { ctrl: true, name: "h" }), this._cursor = this.rl?.cursor ?? 0, this._setUserInput(this.rl?.line)), this.state === "error" && (this.state = "active"), e?.name && (!this._track && settings.aliases.has(e.name) && this.emit("cursor", settings.aliases.get(e.name)), settings.actions.has(e.name) && this.emit("cursor", e.name)), t2 && (t2.toLowerCase() === "y" || t2.toLowerCase() === "n") && this.emit("confirm", t2.toLowerCase() === "y"), this.emit("key", t2, e), e?.name === "return" && this._shouldSubmit(t2, e)) {
      if (this.opts.validate) {
        const i = runValidation(this.opts.validate, this.value);
        i && (this.error = i instanceof Error ? i.message : i, this.state = "error", this.rl?.write(this.userInput));
      }
      this.state !== "error" && (this.state = "submit");
    }
    isActionKey([t2, e?.name, e?.sequence], "cancel") && (this.state = "cancel"), (this.state === "submit" || this.state === "cancel") && this.emit("finalize"), this.render(), (this.state === "submit" || this.state === "cancel") && this.close();
  }
  close() {
    this.input.unpipe(), this.input.removeListener("keypress", this.onKeypress), this.output.write(`
`), setRawMode(this.input, false), this.rl?.close(), this.rl = undefined, this.emit(`${this.state}`, this.value), this.unsubscribe();
  }
  restoreCursor() {
    const t2 = wrapAnsi(this._prevFrame, process.stdout.columns, { hard: true, trim: false }).split(`
`).length - 1;
    this.output.write(import_sisteransi.cursor.move(-999, t2 * -1));
  }
  render() {
    const t2 = wrapAnsi(this._render(this) ?? "", process.stdout.columns, {
      hard: true,
      trim: false
    });
    if (t2 !== this._prevFrame) {
      if (this.state === "initial")
        this.output.write(import_sisteransi.cursor.hide);
      else {
        const e = diffLines(this._prevFrame, t2), i = getRows(this.output);
        if (this.restoreCursor(), e) {
          const n = Math.max(0, e.numLinesAfter - i), s = Math.max(0, e.numLinesBefore - i);
          let r = e.lines.find((o) => o >= n);
          if (r === undefined) {
            this._prevFrame = t2;
            return;
          }
          if (e.lines.length === 1) {
            this.output.write(import_sisteransi.cursor.move(0, r - s)), this.output.write(import_sisteransi.erase.lines(1));
            const o = t2.split(`
`);
            this.output.write(o[r]), this._prevFrame = t2, this.output.write(import_sisteransi.cursor.move(0, o.length - r - 1));
            return;
          } else if (e.lines.length > 1) {
            if (n < s)
              r = n;
            else {
              const h = r - s;
              h > 0 && this.output.write(import_sisteransi.cursor.move(0, h));
            }
            this.output.write(import_sisteransi.erase.down());
            const f = t2.split(`
`).slice(r);
            this.output.write(f.join(`
`)), this._prevFrame = t2;
            return;
          }
        }
        this.output.write(import_sisteransi.erase.down());
      }
      this.output.write(t2), this.state === "initial" && (this.state = "active"), this._prevFrame = t2;
    }
  }
}
function p$1(l2, e) {
  if (l2 === undefined || e.length === 0)
    return 0;
  const i = e.findIndex((s) => s.value === l2);
  return i !== -1 ? i : 0;
}
function g(l2, e) {
  return (e.label ?? String(e.value)).toLowerCase().includes(l2.toLowerCase());
}
function m(l2, e) {
  if (e)
    return l2 ? e : e[0];
}
var T$1 = class T extends V {
  filteredOptions;
  multiple;
  isNavigating = false;
  selectedValues = [];
  focusedValue;
  #e = 0;
  #s = "";
  #t;
  #i;
  #n;
  get cursor() {
    return this.#e;
  }
  get userInputWithCursor() {
    if (!this.userInput)
      return styleText(["inverse", "hidden"], "_");
    if (this._cursor >= this.userInput.length)
      return `${this.userInput}█`;
    const e = this.userInput.slice(0, this.cursor), t2 = this.userInput.slice(this.cursor, this.cursor + 1), i = this.userInput.slice(this.cursor + 1);
    return `${e}${styleText("inverse", t2)}${i}`;
  }
  get options() {
    return typeof this.#i == "function" ? this.#i() : this.#i;
  }
  constructor(e) {
    super(e), this.#i = e.options, this.#n = e.placeholder;
    const t2 = this.options;
    this.filteredOptions = [...t2], this.multiple = e.multiple === true, this.#t = typeof e.options == "function" ? e.filter : e.filter ?? g;
    let i;
    if (e.initialValue && Array.isArray(e.initialValue) ? this.multiple ? i = e.initialValue : i = e.initialValue.slice(0, 1) : !this.multiple && this.options.length > 0 && (i = [this.options[0]?.value]), i)
      for (const s of i) {
        const n = t2.findIndex((o) => o.value === s);
        n !== -1 && (this.toggleSelected(s), this.#e = n);
      }
    this.focusedValue = this.options[this.#e]?.value, this.on("key", (s, n) => this.#l(s, n)), this.on("userInput", (s) => this.#u(s));
  }
  _isActionKey(e, t2) {
    return e === "\t" || this.multiple && this.isNavigating && t2.name === "space" && e !== undefined && e !== "";
  }
  #l(e, t2) {
    const i = t2.name === "up", s = t2.name === "down", n = t2.name === "return", o = this.userInput === "" || this.userInput === "\t", u = this.#n, a = this.options, f = u !== undefined && u !== "" && a.some((r) => !r.disabled && (this.#t ? this.#t(u, r) : true));
    if (t2.name === "tab" && o && f) {
      this.userInput === "\t" && this._clearUserInput(), this._setUserInput(u, true), this.isNavigating = false;
      return;
    }
    i || s ? (this.#e = findCursor(this.#e, i ? -1 : 1, this.filteredOptions), this.focusedValue = this.filteredOptions[this.#e]?.value, this.multiple || (this.selectedValues = [this.focusedValue]), this.isNavigating = true) : n ? this.value = m(this.multiple, this.selectedValues) : this.multiple ? this.focusedValue !== undefined && (t2.name === "tab" || this.isNavigating && t2.name === "space") ? this.toggleSelected(this.focusedValue) : this.isNavigating = false : (this.focusedValue && (this.selectedValues = [this.focusedValue]), this.isNavigating = false);
  }
  deselectAll() {
    this.selectedValues = [];
  }
  toggleSelected(e) {
    this.filteredOptions.length !== 0 && (this.multiple ? this.selectedValues.includes(e) ? this.selectedValues = this.selectedValues.filter((t2) => t2 !== e) : this.selectedValues = [...this.selectedValues, e] : this.selectedValues = [e]);
  }
  #u(e) {
    if (e !== this.#s) {
      this.#s = e;
      const t2 = this.options;
      e && this.#t ? this.filteredOptions = t2.filter((n) => this.#t?.(e, n)) : this.filteredOptions = [...t2];
      const i = p$1(this.focusedValue, this.filteredOptions);
      this.#e = findCursor(i, 0, this.filteredOptions);
      const s = this.filteredOptions[this.#e];
      s && !s.disabled ? this.focusedValue = s.value : this.focusedValue = undefined, this.multiple || (this.focusedValue !== undefined ? this.toggleSelected(this.focusedValue) : this.deselectAll());
    }
  }
};

class r extends V {
  get cursor() {
    return this.value ? 0 : 1;
  }
  get _value() {
    return this.cursor === 0;
  }
  constructor(t2) {
    super(t2, false), this.value = !!t2.initialValue, this.on("userInput", () => {
      this.value = this._value;
    }), this.on("confirm", (i) => {
      this.output.write(import_sisteransi.cursor.move(0, -1)), this.value = i, this.state = "submit", this.close();
    }), this.on("cursor", () => {
      this.value = !this.value;
    });
  }
}
var _ = {
  Y: { type: "year", len: 4 },
  M: { type: "month", len: 2 },
  D: { type: "day", len: 2 }
};
function M(r2) {
  return [...r2].map((t2) => _[t2]);
}
function P(r2) {
  const i = new Intl.DateTimeFormat(r2, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(2000, 0, 15)), s = [];
  let n = "/";
  for (const e of i)
    e.type === "literal" ? n = e.value.trim() || e.value : (e.type === "year" || e.type === "month" || e.type === "day") && s.push({ type: e.type, len: e.type === "year" ? 4 : 2 });
  return { segments: s, separator: n };
}
function p(r2) {
  return Number.parseInt((r2 || "0").replace(/_/g, "0"), 10) || 0;
}
function f(r2) {
  return {
    year: p(r2.year),
    month: p(r2.month),
    day: p(r2.day)
  };
}
function c(r2, t2) {
  return new Date(r2 || 2001, t2 || 1, 0).getDate();
}
function b(r2) {
  const { year: t2, month: i, day: s } = f(r2);
  if (!t2 || t2 < 0 || t2 > 9999 || !i || i < 1 || i > 12 || !s || s < 1)
    return;
  const n = new Date(Date.UTC(t2, i - 1, s));
  if (!(n.getUTCFullYear() !== t2 || n.getUTCMonth() !== i - 1 || n.getUTCDate() !== s))
    return { year: t2, month: i, day: s };
}
function C(r2) {
  const t2 = b(r2);
  return t2 ? new Date(Date.UTC(t2.year, t2.month - 1, t2.day)) : undefined;
}
function T2(r2, t2, i, s) {
  const n = i ? {
    year: i.getUTCFullYear(),
    month: i.getUTCMonth() + 1,
    day: i.getUTCDate()
  } : null, e = s ? {
    year: s.getUTCFullYear(),
    month: s.getUTCMonth() + 1,
    day: s.getUTCDate()
  } : null;
  return r2 === "year" ? { min: n?.year ?? 1, max: e?.year ?? 9999 } : r2 === "month" ? {
    min: n && t2.year === n.year ? n.month : 1,
    max: e && t2.year === e.year ? e.month : 12
  } : {
    min: n && t2.year === n.year && t2.month === n.month ? n.day : 1,
    max: e && t2.year === e.year && t2.month === e.month ? e.day : c(t2.year, t2.month)
  };
}

class U extends V {
  #i;
  #o;
  #t;
  #h;
  #u;
  #e = { segmentIndex: 0, positionInSegment: 0 };
  #n = true;
  #s = null;
  inlineError = "";
  get segmentCursor() {
    return { ...this.#e };
  }
  get segmentValues() {
    return { ...this.#t };
  }
  get segments() {
    return this.#i;
  }
  get separator() {
    return this.#o;
  }
  get formattedValue() {
    return this.#l(this.#t);
  }
  #l(t2) {
    return this.#i.map((i) => t2[i.type]).join(this.#o);
  }
  #r() {
    this._setUserInput(this.#l(this.#t)), this._setValue(C(this.#t) ?? undefined);
  }
  constructor(t2) {
    const i = t2.format ? { segments: M(t2.format), separator: t2.separator ?? "/" } : P(t2.locale), s = t2.separator ?? i.separator, n = t2.format ? M(t2.format) : i.segments, e = t2.initialValue ?? t2.defaultValue, m2 = e ? {
      year: String(e.getUTCFullYear()).padStart(4, "0"),
      month: String(e.getUTCMonth() + 1).padStart(2, "0"),
      day: String(e.getUTCDate()).padStart(2, "0")
    } : { year: "____", month: "__", day: "__" }, o = n.map((a) => m2[a.type]).join(s);
    super({ ...t2, initialUserInput: o }, false), this.#i = n, this.#o = s, this.#t = m2, this.#h = t2.minDate, this.#u = t2.maxDate, this.#r(), this.on("cursor", (a) => this.#f(a)), this.on("key", (a, u) => this.#y(a, u)), this.on("finalize", () => this.#p(t2));
  }
  #a() {
    const t2 = Math.max(0, Math.min(this.#e.segmentIndex, this.#i.length - 1)), i = this.#i[t2];
    if (i)
      return this.#e.positionInSegment = Math.max(0, Math.min(this.#e.positionInSegment, i.len - 1)), { segment: i, index: t2 };
  }
  #m(t2) {
    this.inlineError = "", this.#s = null;
    const i = this.#a();
    i && (this.#e.segmentIndex = Math.max(0, Math.min(this.#i.length - 1, i.index + t2)), this.#e.positionInSegment = 0, this.#n = true);
  }
  #d(t2) {
    const i = this.#a();
    if (!i)
      return;
    const { segment: s } = i, n = this.#t[s.type], e = !n || n.replace(/_/g, "") === "", m2 = Number.parseInt((n || "0").replace(/_/g, "0"), 10) || 0, o = T2(s.type, f(this.#t), this.#h, this.#u);
    let a;
    e ? a = t2 === 1 ? o.min : o.max : a = Math.max(Math.min(o.max, m2 + t2), o.min), this.#t = {
      ...this.#t,
      [s.type]: a.toString().padStart(s.len, "0")
    }, this.#n = true, this.#s = null, this.#r();
  }
  #f(t2) {
    if (t2)
      switch (t2) {
        case "right":
          return this.#m(1);
        case "left":
          return this.#m(-1);
        case "up":
          return this.#d(1);
        case "down":
          return this.#d(-1);
      }
  }
  #y(t2, i) {
    if (i?.name === "backspace" || i?.sequence === "" || i?.sequence === "\b" || t2 === "" || t2 === "\b") {
      this.inlineError = "";
      const n = this.#a();
      if (!n)
        return;
      if (!this.#t[n.segment.type].replace(/_/g, "")) {
        this.#m(-1);
        return;
      }
      this.#t[n.segment.type] = "_".repeat(n.segment.len), this.#n = true, this.#e.positionInSegment = 0, this.#r();
      return;
    }
    if (i?.name === "tab") {
      this.inlineError = "";
      const n = this.#a();
      if (!n)
        return;
      const e = i.shift ? -1 : 1, m2 = n.index + e;
      m2 >= 0 && m2 < this.#i.length && (this.#e.segmentIndex = m2, this.#e.positionInSegment = 0, this.#n = true);
      return;
    }
    if (t2 && /^[0-9]$/.test(t2)) {
      const n = this.#a();
      if (!n)
        return;
      const { segment: e } = n, m2 = !this.#t[e.type].replace(/_/g, "");
      if (this.#n && this.#s !== null && !m2) {
        const h = this.#s + t2, d = { ...this.#t, [e.type]: h }, g2 = this.#g(d, e);
        if (g2) {
          this.inlineError = g2, this.#s = null, this.#n = false;
          return;
        }
        this.inlineError = "", this.#t[e.type] = h, this.#s = null, this.#n = false, this.#r(), n.index < this.#i.length - 1 && (this.#e.segmentIndex = n.index + 1, this.#e.positionInSegment = 0, this.#n = true);
        return;
      }
      this.#n && !m2 && (this.#t[e.type] = "_".repeat(e.len), this.#e.positionInSegment = 0), this.#n = false, this.#s = null;
      const o = this.#t[e.type], a = o.indexOf("_"), u = a >= 0 ? a : Math.min(this.#e.positionInSegment, e.len - 1);
      if (u < 0 || u >= e.len)
        return;
      let l2 = o.slice(0, u) + t2 + o.slice(u + 1), D = false;
      if (u === 0 && o === "__" && (e.type === "month" || e.type === "day")) {
        const h = Number.parseInt(t2, 10);
        l2 = `0${t2}`, D = h <= (e.type === "month" ? 1 : 2);
      }
      if (e.type === "year" && (l2 = (o.replace(/_/g, "") + t2).padStart(e.len, "_")), !l2.includes("_")) {
        const h = { ...this.#t, [e.type]: l2 }, d = this.#g(h, e);
        if (d) {
          this.inlineError = d;
          return;
        }
      }
      this.inlineError = "", this.#t[e.type] = l2;
      const y = l2.includes("_") ? undefined : b(this.#t);
      if (y) {
        const { year: h, month: d } = y, g2 = c(h, d);
        this.#t = {
          year: String(Math.max(0, Math.min(9999, h))).padStart(4, "0"),
          month: String(Math.max(1, Math.min(12, d))).padStart(2, "0"),
          day: String(Math.max(1, Math.min(g2, y.day))).padStart(2, "0")
        };
      }
      this.#r();
      const S = l2.indexOf("_");
      D ? (this.#n = true, this.#s = t2) : S >= 0 ? this.#e.positionInSegment = S : a >= 0 && n.index < this.#i.length - 1 ? (this.#e.segmentIndex = n.index + 1, this.#e.positionInSegment = 0, this.#n = true) : this.#e.positionInSegment = Math.min(u + 1, e.len - 1);
    }
  }
  #g(t2, i) {
    const { month: s, day: n } = f(t2);
    if (i.type === "month" && (s < 0 || s > 12))
      return settings.date.messages.invalidMonth;
    if (i.type === "day" && (n < 0 || n > 31))
      return settings.date.messages.invalidDay(31, "any month");
  }
  #p(t2) {
    const { year: i, month: s, day: n } = f(this.#t);
    if (i && s && n) {
      const e = c(i, s);
      this.#t = {
        ...this.#t,
        day: String(Math.min(n, e)).padStart(2, "0")
      };
    }
    this.value = C(this.#t) ?? t2.defaultValue ?? undefined;
  }
}
var u$2 = class u extends V {
  options;
  cursor = 0;
  #t;
  getGroupItems(t2) {
    return this.options.filter((r2) => r2.group === t2);
  }
  isGroupSelected(t2) {
    const r2 = this.getGroupItems(t2), e = this.value;
    return e === undefined ? false : r2.every((s) => e.includes(s.value));
  }
  toggleValue() {
    const t2 = this.options[this.cursor];
    if (t2 !== undefined)
      if (this.value === undefined && (this.value = []), t2.group === true) {
        const r2 = t2.value, e = this.getGroupItems(r2);
        this.isGroupSelected(r2) ? this.value = this.value.filter((s) => e.findIndex((i) => i.value === s) === -1) : this.value = [...this.value, ...e.map((s) => s.value)], this.value = Array.from(new Set(this.value));
      } else {
        const r2 = this.value.includes(t2.value);
        this.value = r2 ? this.value.filter((e) => e !== t2.value) : [...this.value, t2.value];
      }
  }
  constructor(t2) {
    super(t2, false);
    const { options: r2 } = t2;
    this.#t = t2.selectableGroups !== false, this.options = Object.entries(r2).flatMap(([e, s]) => [
      { value: e, group: true, label: e },
      ...s.map((i) => ({ ...i, group: e }))
    ]), this.value = [...t2.initialValues ?? []], this.cursor = Math.max(this.options.findIndex(({ value: e }) => e === t2.cursorAt), this.#t ? 0 : 1), this.on("cursor", (e) => {
      switch (e) {
        case "left":
        case "up": {
          this.cursor = this.cursor === 0 ? this.options.length - 1 : this.cursor - 1;
          const s = this.options[this.cursor]?.group === true;
          !this.#t && s && (this.cursor = this.cursor === 0 ? this.options.length - 1 : this.cursor - 1);
          break;
        }
        case "down":
        case "right": {
          this.cursor = this.cursor === this.options.length - 1 ? 0 : this.cursor + 1;
          const s = this.options[this.cursor]?.group === true;
          !this.#t && s && (this.cursor = this.cursor === this.options.length - 1 ? 0 : this.cursor + 1);
          break;
        }
        case "space":
          this.toggleValue();
          break;
      }
    });
  }
};
var o = /* @__PURE__ */ new Set(["up", "down", "left", "right"]);

class h extends V {
  #t = false;
  #s;
  focused = "editor";
  get userInputWithCursor() {
    if (this.state === "submit")
      return this.userInput;
    const t2 = this.userInput;
    if (this.cursor >= t2.length)
      return `${t2}█`;
    const s = t2.slice(0, this.cursor), r2 = t2.slice(this.cursor, this.cursor + 1), i = t2.slice(this.cursor + 1);
    return r2 === `
` ? `${s}█
${i}` : `${s}${styleText("inverse", r2)}${i}`;
  }
  get cursor() {
    return this._cursor;
  }
  #r(t2) {
    if (this.userInput.length === 0) {
      this._setUserInput(t2);
      return;
    }
    this._setUserInput(this.userInput.slice(0, this.cursor) + t2 + this.userInput.slice(this.cursor));
  }
  #i(t2) {
    const s = this.value ?? "";
    switch (t2) {
      case "up":
        this._cursor = findTextCursor(this._cursor, 0, -1, s);
        return;
      case "down":
        this._cursor = findTextCursor(this._cursor, 0, 1, s);
        return;
      case "left":
        this._cursor = findTextCursor(this._cursor, -1, 0, s);
        return;
      case "right":
        this._cursor = findTextCursor(this._cursor, 1, 0, s);
        return;
    }
  }
  _shouldSubmit(t2, s) {
    if (this.#s)
      return this.focused === "submit" ? true : (this.#r(`
`), this._cursor++, false);
    const r2 = this.#t;
    return this.#t = true, r2 && this.cursor === this.userInput.length ? (this.userInput[this.cursor - 1] === `
` && (this._setUserInput(this.userInput.slice(0, this.cursor - 1) + this.userInput.slice(this.cursor)), this._cursor--), true) : (this.#r(`
`), this._cursor++, false);
  }
  constructor(t2) {
    const s = t2.initialUserInput ?? t2.initialValue;
    super({
      ...t2,
      initialUserInput: s
    }, false), s !== undefined && (this._cursor = s.length), this.#s = t2.showSubmit ?? false, this.on("key", (r2, i) => {
      if (i?.name && o.has(i.name)) {
        this.#t = false, this.#i(i.name);
        return;
      }
      if (r2 === "\t" && this.#s) {
        this.focused = this.focused === "editor" ? "submit" : "editor";
        return;
      }
      if (i?.name !== "return") {
        if (this.#t = false, i?.name === "backspace" && this.cursor > 0) {
          this._setUserInput(this.userInput.slice(0, this.cursor - 1) + this.userInput.slice(this.cursor)), this._cursor--;
          return;
        }
        if (i?.name === "delete" && this.cursor < this.userInput.length) {
          this._setUserInput(this.userInput.slice(0, this.cursor) + this.userInput.slice(this.cursor + 1));
          return;
        }
        r2 && (this.#s && this.focused === "submit" && (this.focused = "editor"), this.#r(r2 ?? ""), this._cursor++);
      }
    }), this.on("userInput", (r2) => {
      this._setValue(r2);
    }), this.on("finalize", () => {
      this.value || (this.value = t2.defaultValue), this.value === undefined && (this.value = "");
    });
  }
}
var n$1 = class n extends V {
  options;
  cursor = 0;
  get _selectedValue() {
    return this.options[this.cursor];
  }
  changeValue() {
    const e = this._selectedValue;
    this.value = e === undefined ? undefined : e.value;
  }
  constructor(e) {
    super(e, false), this.options = e.options;
    const o2 = this.options.findIndex(({ value: s }) => s === e.initialValue), t2 = o2 === -1 ? 0 : o2;
    this.cursor = this.options[t2]?.disabled ? findCursor(t2, 1, this.options) : t2, this.changeValue(), this.on("cursor", (s) => {
      switch (s) {
        case "left":
        case "up":
          this.cursor = findCursor(this.cursor, -1, this.options);
          break;
        case "down":
        case "right":
          this.cursor = findCursor(this.cursor, 1, this.options);
          break;
      }
      this.changeValue();
    });
  }
};
class n2 extends V {
  get userInputWithCursor() {
    if (this.state === "submit")
      return this.userInput;
    const t2 = this.userInput;
    if (this.cursor >= t2.length)
      return `${this.userInput}█`;
    const r2 = t2.slice(0, this.cursor), s = t2.slice(this.cursor, this.cursor + 1), e = t2.slice(this.cursor + 1);
    return `${r2}${styleText("inverse", s)}${e}`;
  }
  get cursor() {
    return this._cursor;
  }
  constructor(t2) {
    super({
      ...t2,
      initialUserInput: t2.initialUserInput ?? t2.initialValue
    }), this.on("userInput", (r2) => {
      this._setValue(r2);
    }), this.on("finalize", () => {
      this.value || (this.value = t2.defaultValue), this.value === undefined && (this.value = "");
    });
  }
}

// node_modules/@clack/prompts/dist/index.mjs
import { styleText as styleText2, stripVTControlCharacters } from "node:util";
import process$1 from "node:process";
var import_sisteransi2 = __toESM(require_src(), 1);
function isUnicodeSupported() {
  if (process$1.platform !== "win32") {
    return process$1.env.TERM !== "linux";
  }
  return Boolean(process$1.env.CI) || Boolean(process$1.env.WT_SESSION) || Boolean(process$1.env.TERMINUS_SUBLIME) || process$1.env.ConEmuTask === "{cmd::Cmder}" || process$1.env.TERM_PROGRAM === "Terminus-Sublime" || process$1.env.TERM_PROGRAM === "vscode" || process$1.env.TERM === "xterm-256color" || process$1.env.TERM === "alacritty" || process$1.env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}
var unicode = isUnicodeSupported();
var isCI = () => process.env.CI === "true";
var unicodeOr = (o2, e) => unicode ? o2 : e;
var S_STEP_ACTIVE = unicodeOr("◆", "*");
var S_STEP_CANCEL = unicodeOr("■", "x");
var S_STEP_ERROR = unicodeOr("▲", "x");
var S_STEP_SUBMIT = unicodeOr("◇", "o");
var S_BAR_START = unicodeOr("┌", "T");
var S_BAR = unicodeOr("│", "|");
var S_BAR_END = unicodeOr("└", "—");
var S_BAR_START_RIGHT = unicodeOr("┐", "T");
var S_BAR_END_RIGHT = unicodeOr("┘", "—");
var S_RADIO_ACTIVE = unicodeOr("●", ">");
var S_RADIO_INACTIVE = unicodeOr("○", " ");
var S_CHECKBOX_ACTIVE = unicodeOr("◻", "[•]");
var S_CHECKBOX_SELECTED = unicodeOr("◼", "[+]");
var S_CHECKBOX_INACTIVE = unicodeOr("◻", "[ ]");
var S_PASSWORD_MASK = unicodeOr("▪", "•");
var S_BAR_H = unicodeOr("─", "-");
var S_CORNER_TOP_RIGHT = unicodeOr("╮", "+");
var S_CONNECT_LEFT = unicodeOr("├", "+");
var S_CORNER_BOTTOM_RIGHT = unicodeOr("╯", "+");
var S_CORNER_BOTTOM_LEFT = unicodeOr("╰", "+");
var S_CORNER_TOP_LEFT = unicodeOr("╭", "+");
var S_INFO = unicodeOr("●", "•");
var S_SUCCESS = unicodeOr("◆", "*");
var S_WARN = unicodeOr("▲", "!");
var S_ERROR = unicodeOr("■", "x");
var symbol = (o2) => {
  switch (o2) {
    case "initial":
    case "active":
      return styleText2("cyan", S_STEP_ACTIVE);
    case "cancel":
      return styleText2("red", S_STEP_CANCEL);
    case "error":
      return styleText2("yellow", S_STEP_ERROR);
    case "submit":
      return styleText2("green", S_STEP_SUBMIT);
  }
};
var symbolBar = (o2) => {
  switch (o2) {
    case "initial":
    case "active":
      return styleText2("cyan", S_BAR);
    case "cancel":
      return styleText2("red", S_BAR);
    case "error":
      return styleText2("yellow", S_BAR);
    case "submit":
      return styleText2("green", S_BAR);
  }
};
function formatInstructionFooter(o2, e) {
  const r2 = [`${e ? `${styleText2("cyan", S_BAR)}  ` : ""}${o2.join(" • ")}`];
  return e && r2.push(styleText2("cyan", S_BAR_END)), r2;
}
var I = (l2, e, w, p2, b2, C2 = false) => {
  let r2 = e, O = 0;
  if (C2)
    for (let i = p2 - 1;i >= w; i--) {
      const m2 = l2[i];
      if (m2 && (r2 -= m2.length), O++, r2 <= b2)
        break;
    }
  else
    for (let i = w;i < p2; i++) {
      const m2 = l2[i];
      if (m2 && (r2 -= m2.length), O++, r2 <= b2)
        break;
    }
  return { lineCount: r2, removals: O };
};
var limitOptions = ({
  cursor: l2,
  options: e,
  style: w,
  output: p2 = process.stdout,
  maxItems: b2 = Number.POSITIVE_INFINITY,
  columnPadding: C2 = 0,
  rowPadding: r2 = 4
}) => {
  const i = getColumns(p2) - C2, m2 = getRows(p2), M2 = styleText2("dim", "..."), v = Math.max(m2 - r2, 0), a2 = Math.max(Math.min(b2, v), 5);
  let f2 = 0;
  l2 >= a2 - 3 && (f2 = Math.max(Math.min(l2 - a2 + 3, e.length - a2), 0));
  let d = a2 < e.length && f2 > 0, c2 = a2 < e.length && f2 + a2 < e.length;
  const W = Math.min(f2 + a2, e.length), s = [];
  let g2 = 0;
  d && g2++, c2 && g2++;
  const T3 = f2 + (d ? 1 : 0), y = W - (c2 ? 1 : 0);
  for (let t2 = T3;t2 < y; t2++) {
    const n3 = e[t2], o2 = n3 ? w(n3, t2 === l2) : "", h2 = wrapAnsi(o2, i, {
      hard: true,
      trim: false
    }).split(`
`);
    s.push(h2), g2 += h2.length;
  }
  if (g2 > v) {
    let t2 = 0, n3 = 0, o2 = g2;
    const h2 = l2 - T3;
    let u3 = v;
    const L = () => I(s, o2, 0, h2, u3), E = () => I(s, o2, h2 + 1, s.length, u3, true);
    d ? ({ lineCount: o2, removals: t2 } = L(), o2 > u3 && (c2 || (u3 -= 1), { lineCount: o2, removals: n3 } = E())) : (c2 || (u3 -= 1), { lineCount: o2, removals: n3 } = E(), o2 > u3 && (u3 -= 1, { lineCount: o2, removals: t2 } = L())), t2 > 0 && (d = true, s.splice(0, t2)), n3 > 0 && (c2 = true, s.splice(s.length - n3, n3));
  }
  const x = [];
  d && x.push(M2);
  for (const t2 of s)
    for (const n3 of t2)
      x.push(n3);
  return c2 && x.push(M2), x;
};
var confirm = (i) => {
  const a2 = i.active ?? "Yes", s = i.inactive ?? "No";
  return new r({
    active: a2,
    inactive: s,
    signal: i.signal,
    input: i.input,
    output: i.output,
    initialValue: i.initialValue ?? true,
    render() {
      const e = i.withGuide ?? settings.withGuide, u3 = `${symbol(this.state)}  `, l2 = e ? `${styleText2("gray", S_BAR)}  ` : "", f2 = wrapTextWithPrefix(i.output, i.message, l2, u3), o2 = `${e ? `${styleText2("gray", S_BAR)}
` : ""}${f2}
`, c2 = this.value ? a2 : s;
      switch (this.state) {
        case "submit": {
          const r2 = e ? `${styleText2("gray", S_BAR)}  ` : "";
          return `${o2}${r2}${styleText2("dim", c2)}`;
        }
        case "cancel": {
          const r2 = e ? `${styleText2("gray", S_BAR)}  ` : "";
          return `${o2}${r2}${styleText2(["strikethrough", "dim"], c2)}${e ? `
${styleText2("gray", S_BAR)}` : ""}`;
        }
        default: {
          const r2 = e ? `${styleText2("cyan", S_BAR)}  ` : "", g2 = e ? styleText2("cyan", S_BAR_END) : "";
          return `${o2}${r2}${this.value ? `${styleText2("green", S_RADIO_ACTIVE)} ${a2}` : `${styleText2("dim", S_RADIO_INACTIVE)} ${styleText2("dim", a2)}`}${i.vertical ? e ? `
${styleText2("cyan", S_BAR)}  ` : `
` : ` ${styleText2("dim", "/")} `}${this.value ? `${styleText2("dim", S_RADIO_INACTIVE)} ${styleText2("dim", s)}` : `${styleText2("green", S_RADIO_ACTIVE)} ${s}`}
${g2}
`;
        }
      }
    }
  }).prompt();
};
var MULTISELECT_INSTRUCTIONS = [
  `${styleText2("dim", "↑/↓")} to navigate`,
  `${styleText2("dim", "Space:")} select`,
  `${styleText2("dim", "Enter:")} confirm`
];
var intro = (o2 = "", t2) => {
  const i = t2?.output ?? process.stdout, e = t2?.withGuide ?? settings.withGuide ? `${styleText2("gray", S_BAR_START)}  ` : "";
  i.write(`${e}${o2}
`);
};
var outro = (o2 = "", t2) => {
  const i = t2?.output ?? process.stdout, e = t2?.withGuide ?? settings.withGuide ? `${styleText2("gray", S_BAR)}
${styleText2("gray", S_BAR_END)}  ` : "";
  i.write(`${e}${o2}

`);
};
var W = (l2) => styleText2("magenta", l2);
var spinner = ({
  indicator: l2 = "dots",
  onCancel: h2,
  output: n3 = process.stdout,
  cancelMessage: G,
  errorMessage: O,
  frames: E = unicode ? ["◒", "◐", "◓", "◑"] : ["•", "o", "O", "0"],
  delay: F = unicode ? 80 : 120,
  signal: m2,
  ...I2
} = {}) => {
  const u3 = isCI();
  let M2, T3, d = false, S = false, s = "", p2, w = performance.now();
  const x = getColumns(n3), k = I2?.styleFrame ?? W, g2 = (e) => {
    const r2 = e > 1 ? O ?? settings.messages.error : G ?? settings.messages.cancel;
    S = e === 1, d && (a2(r2, e), S && typeof h2 == "function" && h2());
  }, f2 = () => g2(2), i = () => g2(1), A = () => {
    process.on("uncaughtExceptionMonitor", f2), process.on("unhandledRejection", f2), process.on("SIGINT", i), process.on("SIGTERM", i), process.on("exit", g2), m2 && m2.addEventListener("abort", i);
  }, H = () => {
    process.removeListener("uncaughtExceptionMonitor", f2), process.removeListener("unhandledRejection", f2), process.removeListener("SIGINT", i), process.removeListener("SIGTERM", i), process.removeListener("exit", g2), m2 && m2.removeEventListener("abort", i);
  }, y = () => {
    if (p2 === undefined)
      return;
    u3 && n3.write(`
`);
    const r2 = wrapAnsi(p2, x, {
      hard: true,
      trim: false
    }).split(`
`);
    r2.length > 1 && n3.write(import_sisteransi2.cursor.up(r2.length - 1)), n3.write(import_sisteransi2.cursor.to(0)), n3.write(import_sisteransi2.erase.down());
  }, C2 = (e) => e.replace(/\.+$/, ""), _2 = (e) => {
    const r2 = (performance.now() - e) / 1000, t2 = Math.floor(r2 / 60), o2 = Math.floor(r2 % 60);
    return t2 > 0 ? `[${t2}m ${o2}s]` : `[${o2}s]`;
  }, N = I2.withGuide ?? settings.withGuide, P2 = (e = "") => {
    d = true, M2 = block({ output: n3 }), s = C2(e), w = performance.now(), N && n3.write(`${styleText2("gray", S_BAR)}
`);
    let r2 = 0, t2 = 0;
    A(), T3 = setInterval(() => {
      if (u3 && s === p2)
        return;
      y(), p2 = s;
      const o2 = k(E[r2]);
      let v;
      if (u3)
        v = `${o2}  ${s}...`;
      else if (l2 === "timer")
        v = `${o2}  ${s} ${_2(w)}`;
      else {
        const B = ".".repeat(Math.floor(t2)).slice(0, 3);
        v = `${o2}  ${s}${B}`;
      }
      const j = wrapAnsi(v, x, {
        hard: true,
        trim: false
      });
      n3.write(j), r2 = r2 + 1 < E.length ? r2 + 1 : 0, t2 = t2 < 4 ? t2 + 0.125 : 0;
    }, F);
  }, a2 = (e = "", r2 = 0, t2 = false) => {
    if (!d)
      return;
    d = false, clearInterval(T3), y();
    const o2 = r2 === 0 ? styleText2("green", S_STEP_SUBMIT) : r2 === 1 ? styleText2("red", S_STEP_CANCEL) : styleText2("red", S_STEP_ERROR);
    s = e ?? s, t2 || (l2 === "timer" ? n3.write(`${o2}  ${s} ${_2(w)}
`) : n3.write(`${o2}  ${s}
`)), H(), M2();
  };
  return {
    start: P2,
    stop: (e = "") => a2(e, 0),
    message: (e = "") => {
      s = C2(e ?? s);
    },
    cancel: (e = "") => a2(e, 1),
    error: (e = "") => a2(e, 2),
    clear: () => a2("", 0, true),
    get isCancelled() {
      return S;
    }
  };
};
var u3 = {
  light: unicodeOr("─", "-"),
  heavy: unicodeOr("━", "="),
  block: unicodeOr("█", "#")
};
var SELECT_INSTRUCTIONS = [
  `${styleText2("dim", "↑/↓")} to navigate`,
  `${styleText2("dim", "Enter:")} confirm`
];
var c2 = (t2, o2) => t2.includes(`
`) ? t2.split(`
`).map((d) => o2(d)).join(`
`) : o2(t2);
var select = (t2) => {
  const o2 = (n3, m2) => {
    if (n3 === undefined)
      return "";
    const s = n3.label ?? String(n3.value);
    switch (m2) {
      case "disabled":
        return `${styleText2("gray", S_RADIO_INACTIVE)} ${c2(s, (i) => styleText2("gray", i))}${n3.hint ? ` ${styleText2("dim", `(${n3.hint ?? "disabled"})`)}` : ""}`;
      case "selected":
        return `${c2(s, (i) => styleText2("dim", i))}`;
      case "active":
        return `${styleText2("green", S_RADIO_ACTIVE)} ${s}${n3.hint ? ` ${styleText2("dim", `(${n3.hint})`)}` : ""}`;
      case "cancelled":
        return `${c2(s, (i) => styleText2(["strikethrough", "dim"], i))}`;
      default:
        return `${styleText2("dim", S_RADIO_INACTIVE)} ${c2(s, (i) => styleText2("dim", i))}`;
    }
  }, d = t2.showInstructions ?? true;
  return new n$1({
    options: t2.options,
    signal: t2.signal,
    input: t2.input,
    output: t2.output,
    initialValue: t2.initialValue,
    render() {
      const n3 = t2.withGuide ?? settings.withGuide, m2 = `${symbol(this.state)}  `, s = `${symbolBar(this.state)}  `, i = wrapTextWithPrefix(t2.output, t2.message, s, m2), u4 = `${n3 ? `${styleText2("gray", S_BAR)}
` : ""}${i}
`;
      switch (this.state) {
        case "submit": {
          const r2 = n3 ? `${styleText2("gray", S_BAR)}  ` : "", a2 = wrapTextWithPrefix(t2.output, o2(this.options[this.cursor], "selected"), r2);
          return `${u4}${a2}`;
        }
        case "cancel": {
          const r2 = n3 ? `${styleText2("gray", S_BAR)}  ` : "", a2 = wrapTextWithPrefix(t2.output, o2(this.options[this.cursor], "cancelled"), r2);
          return `${u4}${a2}${n3 ? `
${styleText2("gray", S_BAR)}` : ""}`;
        }
        default: {
          const r2 = n3 ? `${styleText2("cyan", S_BAR)}  ` : "", a2 = u4.split(`
`).length, p2 = d ? formatInstructionFooter(SELECT_INSTRUCTIONS, n3) : n3 ? [styleText2("cyan", S_BAR_END)] : [], b2 = p2.join(`
`), f2 = p2.length + 1;
          return `${u4}${r2}${limitOptions({
            output: t2.output,
            cursor: this.cursor,
            options: this.options,
            maxItems: t2.maxItems,
            columnPadding: r2.length,
            rowPadding: a2 + f2,
            style: (g2, x) => o2(g2, g2.disabled ? "disabled" : x ? "active" : "inactive")
          }).join(`
${r2}`)}
${b2}
`;
        }
      }
    }
  }).prompt();
};
var i = `${styleText2("gray", S_BAR)}  `;
var text = (e) => new n2({
  validate: e.validate,
  placeholder: e.placeholder,
  defaultValue: e.defaultValue,
  initialValue: e.initialValue,
  output: e.output,
  signal: e.signal,
  input: e.input,
  render() {
    const i2 = e?.withGuide ?? settings.withGuide, s = `${`${i2 ? `${styleText2("gray", S_BAR)}
` : ""}${symbol(this.state)}  `}${e.message}
`, c3 = e.placeholder && e.placeholder.length > 0 ? styleText2("inverse", e.placeholder[0]) + styleText2("dim", e.placeholder.slice(1)) : styleText2(["inverse", "hidden"], "_"), o2 = this.userInput ? this.userInputWithCursor : c3, l2 = this.value ?? "";
    switch (this.state) {
      case "error": {
        const n3 = this.error ? `  ${styleText2("yellow", this.error)}` : "", r2 = i2 ? `${styleText2("yellow", S_BAR)}  ` : "", d = i2 ? styleText2("yellow", S_BAR_END) : "";
        return `${s.trim()}
${r2}${o2}
${d}${n3}
`;
      }
      case "submit": {
        const n3 = l2 ? `  ${styleText2("dim", l2)}` : "", r2 = i2 ? styleText2("gray", S_BAR) : "";
        return `${s}${r2}${n3}`;
      }
      case "cancel": {
        const n3 = l2 ? `  ${styleText2(["strikethrough", "dim"], l2)}` : "", r2 = i2 ? styleText2("gray", S_BAR) : "";
        return `${s}${r2}${n3}${l2.trim() ? `
${r2}` : ""}`;
      }
      default: {
        const n3 = i2 ? `${styleText2("cyan", S_BAR)}  ` : "", r2 = i2 ? styleText2("cyan", S_BAR_END) : "";
        return `${s}${n3}${o2}
${r2}
`;
      }
    }
  }
}).prompt();

// src/presentation/commands/create-app.ts
var import_mri = __toESM(require_lib(), 1);

// src/application/commands/state-resolver.ts
var resolveScaffoldState = (flags, defaults) => {
  return {
    projectName: flags.projectName ?? defaults.projectName,
    targetDir: flags.targetDir ?? defaults.targetDir,
    runtime: flags.runtime ?? defaults.runtime,
    language: flags.language ?? defaults.language,
    linter: flags.linter ?? defaults.linter,
    testFramework: flags.testFramework ?? defaults.testFramework,
    preCommit: flags.preCommit ?? defaults.preCommit,
    packageManager: flags.packageManager ?? defaults.packageManager,
    installDeps: flags.installDeps ?? defaults.installDeps,
    overwrite: flags.overwrite ?? defaults.overwrite,
    dryRun: flags.dryRun ?? defaults.dryRun
  };
};

// src/application/dtos/scaffold-input.ts
var DEFAULT_SCAFFOLD_INPUT = {
  projectName: "",
  runtime: "node",
  language: "typescript",
  linter: "biome",
  testFramework: "vitest",
  preCommit: "lefthook",
  packageManager: "npm",
  installDeps: true,
  overwrite: false,
  dryRun: false
};

// src/infrastructure/cli/environment-detector.ts
var detectPackageManager = (env) => {
  const userAgent = env !== undefined ? env.npm_config_user_agent ?? "" : process.env.npm_config_user_agent ?? "";
  if (userAgent.includes("pnpm"))
    return "pnpm";
  if (userAgent.includes("yarn"))
    return "yarn";
  if (userAgent.includes("bun"))
    return "bun";
  return "npm";
};
var isInteractive = (stdinIsTTY) => {
  return stdinIsTTY ?? process.stdin.isTTY ?? false;
};
var isAIAgent = (env, stdinIsTTY) => {
  const e = env !== undefined ? env : process.env;
  const tty = stdinIsTTY ?? process.stdin.isTTY ?? false;
  if (e.CI === "true" || e.CI === "1")
    return true;
  if (e.GITHUB_ACTIONS === "true")
    return true;
  if (!tty)
    return true;
  return false;
};

// src/presentation/formatters/output-formatter.ts
var getRunCommand = (runtime) => {
  return runtime === "bun" ? "bun run dev" : "npm run dev";
};
var getInstallCommand = (pm) => {
  switch (pm) {
    case "npm":
      return "npm install";
    case "pnpm":
      return "pnpm install";
    case "yarn":
      return "yarn";
    case "bun":
      return "bun install";
  }
};
var formatScaffoldSuccess = (result, options) => {
  const runtime = options?.runtime ?? "node";
  const packageManager = options?.packageManager ?? "npm";
  const runCmd = getRunCommand(runtime);
  const installCmd = getInstallCommand(packageManager);
  const projectDirDisplay = result.projectDir === "." ? "Current directory" : result.projectDir;
  const lines = [
    "",
    "  ✓ Project created successfully!",
    "",
    `  Project: ${projectDirDisplay}`,
    "",
    "  Files created:",
    ...result.files.map((f2) => `    • ${f2}`),
    "",
    "  Next steps:"
  ];
  if (result.projectDir !== ".") {
    lines.push(`    cd ${result.projectDir}`);
  }
  lines.push(`    ${installCmd}`);
  lines.push(`    ${runCmd}`);
  lines.push("");
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
    case "runtime_not_found":
      return `  ✗ ${error.message}`;
    case "not_writable":
      return `  ✗ ${error.message}`;
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
    "    --no-overwrite          Do not overwrite existing directory",
    "    --dry-run               Preview files without writing",
    "    --immediate             Auto-install dependencies",
    "    --runtime <runtime>     Runtime: node | bun",
    "    --language <lang>       Language: typescript | javascript",
    "    --linter <linter>       Linter: biome | eslint-prettier | none",
    "    --test <framework>      Test framework: vitest | jest",
    "    --precommit <tool>      Pre-commit tool: lefthook | husky | none",
    "    --pm <manager>          Package manager: npm | pnpm | yarn | bun",
    ""
  ].join(`
`);
};
var formatVersion = (version) => {
  return version;
};
var formatScaffoldResult = (result, options) => {
  if (result.ok) {
    return { text: formatScaffoldSuccess(result.value, options), exitCode: 0 };
  }
  return { text: formatScaffoldError(result.error), exitCode: 1 };
};
var formatInstallInstructions = (packageManager, runtime) => {
  const installCmd = getInstallCommand(packageManager);
  const lines = ["", "  \uD83D\uDCE6 Next steps to get started:", "", `    ${installCmd}`];
  if (runtime) {
    lines.push(`    ${getRunCommand(runtime)}`);
  }
  lines.push("");
  return lines.join(`
`);
};
var formatCancelMessage = () => {
  return ["", "  ⚠ Operation cancelled.", "  No files were written.", ""].join(`
`);
};
var formatNonInteractiveHint = () => {
  return "  ℹ Non-TTY detected: running in non-interactive mode. Use --help for usage.";
};
var formatAIAgentHint = () => {
  return [
    "  ℹ AI agent/CI environment detected.",
    "  ℹ Use --no-interactive mode with all required flags:",
    "    create-ink-app <project-name> --runtime node --language typescript --linter biome [options]",
    "  ℹ Run with --help to see all available options."
  ].join(`
`);
};

// node_modules/is-plain-obj/index.js
function isPlainObject(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}

// node_modules/execa/lib/arguments/file-url.js
import { fileURLToPath } from "node:url";
var safeNormalizeFileUrl = (file, name) => {
  const fileString = normalizeFileUrl(normalizeDenoExecPath(file));
  if (typeof fileString !== "string") {
    throw new TypeError(`${name} must be a string or a file URL: ${fileString}.`);
  }
  return fileString;
};
var normalizeDenoExecPath = (file) => isDenoExecPath(file) ? file.toString() : file;
var isDenoExecPath = (file) => typeof file !== "string" && file && Object.getPrototypeOf(file) === String.prototype;
var normalizeFileUrl = (file) => file instanceof URL ? fileURLToPath(file) : file;

// node_modules/execa/lib/methods/parameters.js
var normalizeParameters = (rawFile, rawArguments = [], rawOptions = {}) => {
  const filePath = safeNormalizeFileUrl(rawFile, "First argument");
  const [commandArguments, options] = isPlainObject(rawArguments) ? [[], rawArguments] : [rawArguments, rawOptions];
  if (!Array.isArray(commandArguments)) {
    throw new TypeError(`Second argument must be either an array of arguments or an options object: ${commandArguments}`);
  }
  if (commandArguments.some((commandArgument) => typeof commandArgument === "object" && commandArgument !== null)) {
    throw new TypeError(`Second argument must be an array of strings: ${commandArguments}`);
  }
  const normalizedArguments = commandArguments.map(String);
  const nullByteArgument = normalizedArguments.find((normalizedArgument) => normalizedArgument.includes("\x00"));
  if (nullByteArgument !== undefined) {
    throw new TypeError(`Arguments cannot contain null bytes ("\\0"): ${nullByteArgument}`);
  }
  if (!isPlainObject(options)) {
    throw new TypeError(`Last argument must be an options object: ${options}`);
  }
  return [filePath, normalizedArguments, { __proto__: null, ...options }];
};

// node_modules/execa/lib/methods/template.js
import { ChildProcess } from "node:child_process";

// node_modules/execa/lib/utils/uint-array.js
import { StringDecoder } from "node:string_decoder";
var { toString: objectToString } = Object.prototype;
var isArrayBuffer = (value) => objectToString.call(value) === "[object ArrayBuffer]";
var isUint8Array = (value) => objectToString.call(value) === "[object Uint8Array]";
var bufferToUint8Array = (buffer) => new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
var textEncoder = new TextEncoder;
var stringToUint8Array = (string) => textEncoder.encode(string);
var textDecoder = new TextDecoder;
var uint8ArrayToString = (uint8Array) => textDecoder.decode(uint8Array);
var joinToString = (uint8ArraysOrStrings, encoding) => {
  const strings = uint8ArraysToStrings(uint8ArraysOrStrings, encoding);
  return strings.join("");
};
var uint8ArraysToStrings = (uint8ArraysOrStrings, encoding) => {
  if (encoding === "utf8" && uint8ArraysOrStrings.every((uint8ArrayOrString) => typeof uint8ArrayOrString === "string")) {
    return uint8ArraysOrStrings;
  }
  const decoder = new StringDecoder(encoding);
  const strings = uint8ArraysOrStrings.map((uint8ArrayOrString) => typeof uint8ArrayOrString === "string" ? stringToUint8Array(uint8ArrayOrString) : uint8ArrayOrString).map((uint8Array) => decoder.write(uint8Array));
  const finalString = decoder.end();
  return finalString === "" ? strings : [...strings, finalString];
};
var joinToUint8Array = (uint8ArraysOrStrings) => {
  if (uint8ArraysOrStrings.length === 1 && isUint8Array(uint8ArraysOrStrings[0])) {
    return uint8ArraysOrStrings[0];
  }
  return concatUint8Arrays(stringsToUint8Arrays(uint8ArraysOrStrings));
};
var stringsToUint8Arrays = (uint8ArraysOrStrings) => uint8ArraysOrStrings.map((uint8ArrayOrString) => typeof uint8ArrayOrString === "string" ? stringToUint8Array(uint8ArrayOrString) : uint8ArrayOrString);
var concatUint8Arrays = (uint8Arrays) => {
  const result = new Uint8Array(getJoinLength(uint8Arrays));
  let index = 0;
  for (const uint8Array of uint8Arrays) {
    result.set(uint8Array, index);
    index += uint8Array.length;
  }
  return result;
};
var getJoinLength = (uint8Arrays) => {
  let joinLength = 0;
  for (const uint8Array of uint8Arrays) {
    joinLength += uint8Array.length;
  }
  return joinLength;
};

// node_modules/execa/lib/methods/template.js
var isTemplateString = (templates) => Array.isArray(templates) && Array.isArray(templates.raw);
var parseTemplates = (templates, expressions) => {
  let tokens = [];
  for (const [index, template] of templates.entries()) {
    tokens = parseTemplate({
      templates,
      expressions,
      tokens,
      index,
      template
    });
  }
  if (tokens.length === 0) {
    throw new TypeError("Template script must not be empty");
  }
  const [file, ...commandArguments] = tokens;
  return [file, commandArguments, {}];
};
var parseTemplate = ({ templates, expressions, tokens, index, template }) => {
  if (template === undefined) {
    throw new TypeError(`Invalid backslash sequence: ${templates.raw[index]}`);
  }
  const { nextTokens, leadingWhitespaces, trailingWhitespaces } = splitByWhitespaces(template, templates.raw[index]);
  const newTokens = concatTokens(tokens, nextTokens, leadingWhitespaces);
  if (index === expressions.length) {
    return newTokens;
  }
  const expression = expressions[index];
  const expressionTokens = Array.isArray(expression) ? expression.map((expression2) => parseExpression(expression2)) : [parseExpression(expression)];
  return concatTokens(newTokens, expressionTokens, trailingWhitespaces);
};
var splitByWhitespaces = (template, rawTemplate) => {
  if (rawTemplate.length === 0) {
    return { nextTokens: [], leadingWhitespaces: false, trailingWhitespaces: false };
  }
  const nextTokens = [];
  let templateStart = 0;
  const isLeadingWhitespaces = DELIMITERS.has(rawTemplate[0]);
  for (let templateIndex = 0, rawIndex = 0;templateIndex < template.length; templateIndex += 1, rawIndex += 1) {
    const rawCharacter = rawTemplate[rawIndex];
    if (DELIMITERS.has(rawCharacter)) {
      if (templateStart !== templateIndex) {
        nextTokens.push(template.slice(templateStart, templateIndex));
      }
      templateStart = templateIndex + 1;
    } else if (rawCharacter === "\\") {
      const nextRawCharacter = rawTemplate[rawIndex + 1];
      if (nextRawCharacter === `
`) {
        templateIndex -= 1;
        rawIndex += 1;
      } else if (nextRawCharacter === "u" && rawTemplate[rawIndex + 2] === "{") {
        rawIndex = rawTemplate.indexOf("}", rawIndex + 3);
      } else {
        rawIndex += ESCAPE_LENGTH[nextRawCharacter] ?? 1;
      }
    }
  }
  const isTrailingWhitespaces = templateStart === template.length;
  if (!isTrailingWhitespaces) {
    nextTokens.push(template.slice(templateStart));
  }
  return { nextTokens, leadingWhitespaces: isLeadingWhitespaces, trailingWhitespaces: isTrailingWhitespaces };
};
var DELIMITERS = new Set([" ", "\t", "\r", `
`]);
var ESCAPE_LENGTH = { x: 3, u: 5 };
var concatTokens = (tokens, nextTokens, isSeparated) => isSeparated || tokens.length === 0 || nextTokens.length === 0 ? [...tokens, ...nextTokens] : [
  ...tokens.slice(0, -1),
  `${tokens.at(-1)}${nextTokens[0]}`,
  ...nextTokens.slice(1)
];
var parseExpression = (expression) => {
  const typeOfExpression = typeof expression;
  if (typeOfExpression === "string") {
    return expression;
  }
  if (typeOfExpression === "number") {
    return String(expression);
  }
  if (isPlainObject(expression) && (("stdout" in expression) || ("isMaxBuffer" in expression))) {
    return getSubprocessResult(expression);
  }
  if (expression instanceof ChildProcess || Object.prototype.toString.call(expression) === "[object Promise]") {
    throw new TypeError("Unexpected subprocess in template expression. Please use ${await subprocess} instead of ${subprocess}.");
  }
  throw new TypeError(`Unexpected "${typeOfExpression}" in template expression`);
};
var getSubprocessResult = ({ stdout: stdout2 }) => {
  if (typeof stdout2 === "string") {
    return stdout2;
  }
  if (isUint8Array(stdout2)) {
    return uint8ArrayToString(stdout2);
  }
  if (stdout2 === undefined) {
    throw new TypeError(`Missing result.stdout in template expression. This is probably due to the previous subprocess' "stdout" option.`);
  }
  throw new TypeError(`Unexpected "${typeof stdout2}" stdout in template expression`);
};

// node_modules/execa/lib/methods/main-sync.js
import { spawnSync } from "node:child_process";

// node_modules/execa/lib/arguments/specific.js
import { debuglog } from "node:util";

// node_modules/execa/lib/utils/standard-stream.js
import process2 from "node:process";
var isStandardStream = (stream) => STANDARD_STREAMS.includes(stream);
var STANDARD_STREAMS = [process2.stdin, process2.stdout, process2.stderr];
var STANDARD_STREAMS_ALIASES = ["stdin", "stdout", "stderr"];
var getStreamName = (fdNumber) => STANDARD_STREAMS_ALIASES[fdNumber] ?? `stdio[${fdNumber}]`;

// node_modules/execa/lib/arguments/specific.js
var normalizeFdSpecificOptions = (options) => {
  const optionsCopy = { ...options };
  for (const optionName of FD_SPECIFIC_OPTIONS) {
    optionsCopy[optionName] = normalizeFdSpecificOption(options, optionName);
  }
  return optionsCopy;
};
var normalizeFdSpecificOption = (options, optionName) => {
  const stdioLength = getStdioLength(options);
  const optionBaseArray = Array.from({ length: stdioLength + 1 });
  const optionArray = normalizeFdSpecificValue(options[optionName], optionBaseArray, optionName, stdioLength);
  return addDefaultValue(optionArray, optionName);
};
var getStdioLength = ({ stdio }) => Array.isArray(stdio) ? Math.max(stdio.length, STANDARD_STREAMS_ALIASES.length) : STANDARD_STREAMS_ALIASES.length;
var normalizeFdSpecificValue = (optionValue, optionArray, optionName, stdioLength) => isPlainObject(optionValue) ? normalizeOptionObject(optionValue, optionArray, optionName, stdioLength) : optionArray.fill(optionValue);
var normalizeOptionObject = (optionValue, optionArray, optionName, stdioLength) => {
  for (const fdName of Object.keys(optionValue).sort(compareFdName)) {
    for (const fdNumber of parseFdName(fdName, optionName, stdioLength)) {
      optionArray[fdNumber] = optionValue[fdName];
    }
  }
  return optionArray;
};
var compareFdName = (fdNameA, fdNameB) => getFdNameOrder(fdNameA) < getFdNameOrder(fdNameB) ? 1 : -1;
var getFdNameOrder = (fdName) => {
  if (fdName === "stdout" || fdName === "stderr") {
    return 0;
  }
  return fdName === "all" ? 2 : 1;
};
var parseFdName = (fdName, optionName, stdioLength) => {
  if (fdName === "ipc") {
    return [stdioLength];
  }
  const fdNumber = parseFd(fdName);
  if (fdNumber === undefined || fdNumber === 0) {
    throw new TypeError(`"${optionName}.${fdName}" is invalid.
It must be "${optionName}.stdout", "${optionName}.stderr", "${optionName}.all", "${optionName}.ipc", or "${optionName}.fd3", "${optionName}.fd4" (and so on).`);
  }
  if (fdNumber !== "all" && fdNumber >= stdioLength) {
    throw new TypeError(`"${optionName}.${fdName}" is invalid: that file descriptor does not exist.
Please set the "stdio" option to ensure that file descriptor exists.`);
  }
  return fdNumber === "all" ? [1, 2] : [fdNumber];
};
var parseFd = (fdName) => {
  if (fdName === "all") {
    return fdName;
  }
  if (STANDARD_STREAMS_ALIASES.includes(fdName)) {
    return STANDARD_STREAMS_ALIASES.indexOf(fdName);
  }
  const regexpResult = FD_REGEXP.exec(fdName);
  if (regexpResult !== null) {
    return Number(regexpResult.groups.fdNumber);
  }
};
var FD_REGEXP = /^fd(?<fdNumber>\d+)$/;
var addDefaultValue = (optionArray, optionName) => optionArray.map((optionValue) => optionValue === undefined ? DEFAULT_OPTIONS[optionName] : optionValue);
var verboseDefault = debuglog("execa").enabled ? "full" : "none";
var DEFAULT_OPTIONS = {
  lines: false,
  buffer: true,
  maxBuffer: 1000 * 1000 * 100,
  verbose: verboseDefault,
  stripFinalNewline: true
};
var FD_SPECIFIC_OPTIONS = ["lines", "buffer", "maxBuffer", "verbose", "stripFinalNewline"];
var getFdSpecificValue = (optionArray, fdNumber) => fdNumber === "ipc" ? optionArray.at(-1) : optionArray[fdNumber];

// node_modules/execa/lib/verbose/values.js
var isVerbose = ({ verbose }, fdNumber) => getFdVerbose(verbose, fdNumber) !== "none";
var isFullVerbose = ({ verbose }, fdNumber) => !["none", "short"].includes(getFdVerbose(verbose, fdNumber));
var getVerboseFunction = ({ verbose }, fdNumber) => {
  const fdVerbose = getFdVerbose(verbose, fdNumber);
  return isVerboseFunction(fdVerbose) ? fdVerbose : undefined;
};
var getFdVerbose = (verbose, fdNumber) => fdNumber === undefined ? getFdGenericVerbose(verbose) : getFdSpecificValue(verbose, fdNumber);
var getFdGenericVerbose = (verbose) => verbose.find((fdVerbose) => isVerboseFunction(fdVerbose)) ?? VERBOSE_VALUES.findLast((fdVerbose) => verbose.includes(fdVerbose));
var isVerboseFunction = (fdVerbose) => typeof fdVerbose === "function";
var VERBOSE_VALUES = ["none", "short", "full"];

// node_modules/execa/lib/verbose/log.js
import { inspect } from "node:util";

// node_modules/execa/lib/arguments/escape.js
import { platform } from "node:process";
import { stripVTControlCharacters as stripVTControlCharacters2 } from "node:util";
var joinCommand = (filePath, rawArguments) => {
  const fileAndArguments = [filePath, ...rawArguments];
  const command = fileAndArguments.join(" ");
  const escapedCommand = fileAndArguments.map((fileAndArgument) => quoteString(escapeControlCharacters(fileAndArgument))).join(" ");
  return { command, escapedCommand };
};
var escapeLines = (lines) => stripVTControlCharacters2(lines).split(`
`).map((line) => escapeControlCharacters(line)).join(`
`);
var escapeControlCharacters = (line) => line.replaceAll(SPECIAL_CHAR_REGEXP, (character) => escapeControlCharacter(character));
var escapeControlCharacter = (character) => {
  const commonEscape = COMMON_ESCAPES[character];
  if (commonEscape !== undefined) {
    return commonEscape;
  }
  const codepoint = character.codePointAt(0);
  const codepointHex = codepoint.toString(16);
  return codepoint <= ASTRAL_START ? `\\u${codepointHex.padStart(4, "0")}` : `\\U${codepointHex}`;
};
var getSpecialCharRegExp = () => {
  try {
    return new RegExp("\\p{Separator}|\\p{Other}", "gu");
  } catch {
    return /[\s\u0000-\u001F\u007F-\u009F\u00AD]/g;
  }
};
var SPECIAL_CHAR_REGEXP = getSpecialCharRegExp();
var COMMON_ESCAPES = {
  " ": " ",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "\t": "\\t"
};
var ASTRAL_START = 65535;
var quoteString = (escapedArgument) => {
  if (NO_ESCAPE_REGEXP.test(escapedArgument)) {
    return escapedArgument;
  }
  return platform === "win32" ? `"${escapedArgument.replaceAll('"', '""')}"` : `'${escapedArgument.replaceAll("'", "'\\''")}'`;
};
var NO_ESCAPE_REGEXP = /^[\w\-./]+$/;

// node_modules/is-unicode-supported/index.js
import process3 from "node:process";
function isUnicodeSupported2() {
  const { env } = process3;
  const { TERM, TERM_PROGRAM } = env;
  if (process3.platform !== "win32") {
    return TERM !== "linux";
  }
  return Boolean(env.WT_SESSION) || Boolean(env.TERMINUS_SUBLIME) || env.ConEmuTask === "{cmd::Cmder}" || TERM_PROGRAM === "Terminus-Sublime" || TERM_PROGRAM === "vscode" || TERM === "xterm-256color" || TERM === "alacritty" || TERM === "rxvt-unicode" || TERM === "rxvt-unicode-256color" || env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}

// node_modules/figures/index.js
var common = {
  circleQuestionMark: "(?)",
  questionMarkPrefix: "(?)",
  square: "█",
  squareDarkShade: "▓",
  squareMediumShade: "▒",
  squareLightShade: "░",
  squareTop: "▀",
  squareBottom: "▄",
  squareLeft: "▌",
  squareRight: "▐",
  squareCenter: "■",
  bullet: "●",
  dot: "․",
  ellipsis: "…",
  pointerSmall: "›",
  triangleUp: "▲",
  triangleUpSmall: "▴",
  triangleDown: "▼",
  triangleDownSmall: "▾",
  triangleLeftSmall: "◂",
  triangleRightSmall: "▸",
  home: "⌂",
  heart: "♥",
  musicNote: "♪",
  musicNoteBeamed: "♫",
  arrowUp: "↑",
  arrowDown: "↓",
  arrowLeft: "←",
  arrowRight: "→",
  arrowLeftRight: "↔",
  arrowUpDown: "↕",
  almostEqual: "≈",
  notEqual: "≠",
  lessOrEqual: "≤",
  greaterOrEqual: "≥",
  identical: "≡",
  infinity: "∞",
  subscriptZero: "₀",
  subscriptOne: "₁",
  subscriptTwo: "₂",
  subscriptThree: "₃",
  subscriptFour: "₄",
  subscriptFive: "₅",
  subscriptSix: "₆",
  subscriptSeven: "₇",
  subscriptEight: "₈",
  subscriptNine: "₉",
  oneHalf: "½",
  oneThird: "⅓",
  oneQuarter: "¼",
  oneFifth: "⅕",
  oneSixth: "⅙",
  oneEighth: "⅛",
  twoThirds: "⅔",
  twoFifths: "⅖",
  threeQuarters: "¾",
  threeFifths: "⅗",
  threeEighths: "⅜",
  fourFifths: "⅘",
  fiveSixths: "⅚",
  fiveEighths: "⅝",
  sevenEighths: "⅞",
  line: "─",
  lineBold: "━",
  lineDouble: "═",
  lineDashed0: "┄",
  lineDashed1: "┅",
  lineDashed2: "┈",
  lineDashed3: "┉",
  lineDashed4: "╌",
  lineDashed5: "╍",
  lineDashed6: "╴",
  lineDashed7: "╶",
  lineDashed8: "╸",
  lineDashed9: "╺",
  lineDashed10: "╼",
  lineDashed11: "╾",
  lineDashed12: "−",
  lineDashed13: "–",
  lineDashed14: "‐",
  lineDashed15: "⁃",
  lineVertical: "│",
  lineVerticalBold: "┃",
  lineVerticalDouble: "║",
  lineVerticalDashed0: "┆",
  lineVerticalDashed1: "┇",
  lineVerticalDashed2: "┊",
  lineVerticalDashed3: "┋",
  lineVerticalDashed4: "╎",
  lineVerticalDashed5: "╏",
  lineVerticalDashed6: "╵",
  lineVerticalDashed7: "╷",
  lineVerticalDashed8: "╹",
  lineVerticalDashed9: "╻",
  lineVerticalDashed10: "╽",
  lineVerticalDashed11: "╿",
  lineDownLeft: "┐",
  lineDownLeftArc: "╮",
  lineDownBoldLeftBold: "┓",
  lineDownBoldLeft: "┒",
  lineDownLeftBold: "┑",
  lineDownDoubleLeftDouble: "╗",
  lineDownDoubleLeft: "╖",
  lineDownLeftDouble: "╕",
  lineDownRight: "┌",
  lineDownRightArc: "╭",
  lineDownBoldRightBold: "┏",
  lineDownBoldRight: "┎",
  lineDownRightBold: "┍",
  lineDownDoubleRightDouble: "╔",
  lineDownDoubleRight: "╓",
  lineDownRightDouble: "╒",
  lineUpLeft: "┘",
  lineUpLeftArc: "╯",
  lineUpBoldLeftBold: "┛",
  lineUpBoldLeft: "┚",
  lineUpLeftBold: "┙",
  lineUpDoubleLeftDouble: "╝",
  lineUpDoubleLeft: "╜",
  lineUpLeftDouble: "╛",
  lineUpRight: "└",
  lineUpRightArc: "╰",
  lineUpBoldRightBold: "┗",
  lineUpBoldRight: "┖",
  lineUpRightBold: "┕",
  lineUpDoubleRightDouble: "╚",
  lineUpDoubleRight: "╙",
  lineUpRightDouble: "╘",
  lineUpDownLeft: "┤",
  lineUpBoldDownBoldLeftBold: "┫",
  lineUpBoldDownBoldLeft: "┨",
  lineUpDownLeftBold: "┥",
  lineUpBoldDownLeftBold: "┩",
  lineUpDownBoldLeftBold: "┪",
  lineUpDownBoldLeft: "┧",
  lineUpBoldDownLeft: "┦",
  lineUpDoubleDownDoubleLeftDouble: "╣",
  lineUpDoubleDownDoubleLeft: "╢",
  lineUpDownLeftDouble: "╡",
  lineUpDownRight: "├",
  lineUpBoldDownBoldRightBold: "┣",
  lineUpBoldDownBoldRight: "┠",
  lineUpDownRightBold: "┝",
  lineUpBoldDownRightBold: "┡",
  lineUpDownBoldRightBold: "┢",
  lineUpDownBoldRight: "┟",
  lineUpBoldDownRight: "┞",
  lineUpDoubleDownDoubleRightDouble: "╠",
  lineUpDoubleDownDoubleRight: "╟",
  lineUpDownRightDouble: "╞",
  lineDownLeftRight: "┬",
  lineDownBoldLeftBoldRightBold: "┳",
  lineDownLeftBoldRightBold: "┯",
  lineDownBoldLeftRight: "┰",
  lineDownBoldLeftBoldRight: "┱",
  lineDownBoldLeftRightBold: "┲",
  lineDownLeftRightBold: "┮",
  lineDownLeftBoldRight: "┭",
  lineDownDoubleLeftDoubleRightDouble: "╦",
  lineDownDoubleLeftRight: "╥",
  lineDownLeftDoubleRightDouble: "╤",
  lineUpLeftRight: "┴",
  lineUpBoldLeftBoldRightBold: "┻",
  lineUpLeftBoldRightBold: "┷",
  lineUpBoldLeftRight: "┸",
  lineUpBoldLeftBoldRight: "┹",
  lineUpBoldLeftRightBold: "┺",
  lineUpLeftRightBold: "┶",
  lineUpLeftBoldRight: "┵",
  lineUpDoubleLeftDoubleRightDouble: "╩",
  lineUpDoubleLeftRight: "╨",
  lineUpLeftDoubleRightDouble: "╧",
  lineUpDownLeftRight: "┼",
  lineUpBoldDownBoldLeftBoldRightBold: "╋",
  lineUpDownBoldLeftBoldRightBold: "╈",
  lineUpBoldDownLeftBoldRightBold: "╇",
  lineUpBoldDownBoldLeftRightBold: "╊",
  lineUpBoldDownBoldLeftBoldRight: "╉",
  lineUpBoldDownLeftRight: "╀",
  lineUpDownBoldLeftRight: "╁",
  lineUpDownLeftBoldRight: "┽",
  lineUpDownLeftRightBold: "┾",
  lineUpBoldDownBoldLeftRight: "╂",
  lineUpDownLeftBoldRightBold: "┿",
  lineUpBoldDownLeftBoldRight: "╃",
  lineUpBoldDownLeftRightBold: "╄",
  lineUpDownBoldLeftBoldRight: "╅",
  lineUpDownBoldLeftRightBold: "╆",
  lineUpDoubleDownDoubleLeftDoubleRightDouble: "╬",
  lineUpDoubleDownDoubleLeftRight: "╫",
  lineUpDownLeftDoubleRightDouble: "╪",
  lineCross: "╳",
  lineBackslash: "╲",
  lineSlash: "╱"
};
var specialMainSymbols = {
  tick: "✔",
  info: "ℹ",
  warning: "⚠",
  cross: "✘",
  squareSmall: "◻",
  squareSmallFilled: "◼",
  circle: "◯",
  circleFilled: "◉",
  circleDotted: "◌",
  circleDouble: "◎",
  circleCircle: "ⓞ",
  circleCross: "ⓧ",
  circlePipe: "Ⓘ",
  radioOn: "◉",
  radioOff: "◯",
  checkboxOn: "☒",
  checkboxOff: "☐",
  checkboxCircleOn: "ⓧ",
  checkboxCircleOff: "Ⓘ",
  pointer: "❯",
  triangleUpOutline: "△",
  triangleLeft: "◀",
  triangleRight: "▶",
  lozenge: "◆",
  lozengeOutline: "◇",
  hamburger: "☰",
  smiley: "㋡",
  mustache: "෴",
  star: "★",
  play: "▶",
  nodejs: "⬢",
  oneSeventh: "⅐",
  oneNinth: "⅑",
  oneTenth: "⅒"
};
var specialFallbackSymbols = {
  tick: "√",
  info: "i",
  warning: "‼",
  cross: "×",
  squareSmall: "□",
  squareSmallFilled: "■",
  circle: "( )",
  circleFilled: "(*)",
  circleDotted: "( )",
  circleDouble: "( )",
  circleCircle: "(○)",
  circleCross: "(×)",
  circlePipe: "(│)",
  radioOn: "(*)",
  radioOff: "( )",
  checkboxOn: "[×]",
  checkboxOff: "[ ]",
  checkboxCircleOn: "(×)",
  checkboxCircleOff: "( )",
  pointer: ">",
  triangleUpOutline: "∆",
  triangleLeft: "◄",
  triangleRight: "►",
  lozenge: "♦",
  lozengeOutline: "◊",
  hamburger: "≡",
  smiley: "☺",
  mustache: "┌─┐",
  star: "✶",
  play: "►",
  nodejs: "♦",
  oneSeventh: "1/7",
  oneNinth: "1/9",
  oneTenth: "1/10"
};
var mainSymbols = { ...common, ...specialMainSymbols };
var fallbackSymbols = { ...common, ...specialFallbackSymbols };
var shouldUseMain = isUnicodeSupported2();
var figures = shouldUseMain ? mainSymbols : fallbackSymbols;
var figures_default = figures;
var replacements = Object.entries(specialMainSymbols);

// node_modules/yoctocolors/base.js
import tty from "node:tty";
var hasColors = tty?.WriteStream?.prototype?.hasColors?.() ?? false;
var format = (open, close) => {
  if (!hasColors) {
    return (input) => input;
  }
  const openCode = `\x1B[${open}m`;
  const closeCode = `\x1B[${close}m`;
  return (input) => {
    const string = input + "";
    let index = string.indexOf(closeCode);
    if (index === -1) {
      return openCode + string + closeCode;
    }
    let result = openCode;
    let lastIndex = 0;
    const reopenOnNestedClose = close === 22;
    const replaceCode = (reopenOnNestedClose ? closeCode : "") + openCode;
    while (index !== -1) {
      result += string.slice(lastIndex, index) + replaceCode;
      lastIndex = index + closeCode.length;
      index = string.indexOf(closeCode, lastIndex);
    }
    result += string.slice(lastIndex) + closeCode;
    return result;
  };
};
var reset = format(0, 0);
var bold = format(1, 22);
var dim = format(2, 22);
var italic = format(3, 23);
var underline = format(4, 24);
var overline = format(53, 55);
var inverse = format(7, 27);
var hidden = format(8, 28);
var strikethrough = format(9, 29);
var black = format(30, 39);
var red = format(31, 39);
var green = format(32, 39);
var yellow = format(33, 39);
var blue = format(34, 39);
var magenta = format(35, 39);
var cyan = format(36, 39);
var white = format(37, 39);
var gray = format(90, 39);
var bgBlack = format(40, 49);
var bgRed = format(41, 49);
var bgGreen = format(42, 49);
var bgYellow = format(43, 49);
var bgBlue = format(44, 49);
var bgMagenta = format(45, 49);
var bgCyan = format(46, 49);
var bgWhite = format(47, 49);
var bgGray = format(100, 49);
var redBright = format(91, 39);
var greenBright = format(92, 39);
var yellowBright = format(93, 39);
var blueBright = format(94, 39);
var magentaBright = format(95, 39);
var cyanBright = format(96, 39);
var whiteBright = format(97, 39);
var bgRedBright = format(101, 49);
var bgGreenBright = format(102, 49);
var bgYellowBright = format(103, 49);
var bgBlueBright = format(104, 49);
var bgMagentaBright = format(105, 49);
var bgCyanBright = format(106, 49);
var bgWhiteBright = format(107, 49);

// node_modules/execa/lib/verbose/default.js
var defaultVerboseFunction = ({
  type,
  message,
  timestamp,
  piped,
  commandId,
  result: { failed = false } = {},
  options: { reject = true }
}) => {
  const timestampString = serializeTimestamp(timestamp);
  const icon = ICONS[type]({ failed, reject, piped });
  const color = COLORS[type]({ reject });
  return `${gray(`[${timestampString}]`)} ${gray(`[${commandId}]`)} ${color(icon)} ${color(message)}`;
};
var serializeTimestamp = (timestamp) => `${padField(timestamp.getHours(), 2)}:${padField(timestamp.getMinutes(), 2)}:${padField(timestamp.getSeconds(), 2)}.${padField(timestamp.getMilliseconds(), 3)}`;
var padField = (field, padding) => String(field).padStart(padding, "0");
var getFinalIcon = ({ failed, reject }) => {
  if (!failed) {
    return figures_default.tick;
  }
  return reject ? figures_default.cross : figures_default.warning;
};
var ICONS = {
  command: ({ piped }) => piped ? "|" : "$",
  output: () => " ",
  ipc: () => "*",
  error: getFinalIcon,
  duration: getFinalIcon
};
var identity = (string) => string;
var COLORS = {
  command: () => bold,
  output: () => identity,
  ipc: () => identity,
  error: ({ reject }) => reject ? redBright : yellowBright,
  duration: () => gray
};

// node_modules/execa/lib/verbose/custom.js
var applyVerboseOnLines = (printedLines, verboseInfo, fdNumber) => {
  const verboseFunction = getVerboseFunction(verboseInfo, fdNumber);
  return printedLines.map(({ verboseLine, verboseObject }) => applyVerboseFunction(verboseLine, verboseObject, verboseFunction)).filter((printedLine) => printedLine !== undefined).map((printedLine) => appendNewline(printedLine)).join("");
};
var applyVerboseFunction = (verboseLine, verboseObject, verboseFunction) => {
  if (verboseFunction === undefined) {
    return verboseLine;
  }
  const printedLine = verboseFunction(verboseLine, verboseObject);
  if (typeof printedLine === "string") {
    return printedLine;
  }
};
var appendNewline = (printedLine) => printedLine.endsWith(`
`) ? printedLine : `${printedLine}
`;

// node_modules/execa/lib/verbose/log.js
var verboseLog = ({ type, verboseMessage, fdNumber, verboseInfo, result }) => {
  const verboseObject = getVerboseObject({ type, result, verboseInfo });
  const printedLines = getPrintedLines(verboseMessage, verboseObject);
  const finalLines = applyVerboseOnLines(printedLines, verboseInfo, fdNumber);
  if (finalLines !== "") {
    console.warn(finalLines.slice(0, -1));
  }
};
var getVerboseObject = ({ type, result, verboseInfo }) => {
  const { escapedCommand, commandId, rawOptions } = verboseInfo;
  const { piped = false, ...options } = rawOptions;
  return {
    type,
    escapedCommand,
    commandId: `${commandId}`,
    timestamp: new Date,
    piped,
    result,
    options
  };
};
var getPrintedLines = (verboseMessage, verboseObject) => verboseMessage.split(`
`).map((message) => getPrintedLine({ ...verboseObject, message }));
var getPrintedLine = (verboseObject) => {
  const verboseLine = defaultVerboseFunction(verboseObject);
  return { verboseLine, verboseObject };
};
var serializeVerboseMessage = (message) => {
  const messageString = typeof message === "string" ? message : inspect(message);
  const escapedMessage = escapeLines(messageString);
  return escapedMessage.replaceAll("\t", () => " ".repeat(TAB_SIZE));
};
var TAB_SIZE = 2;

// node_modules/execa/lib/verbose/start.js
var logCommand = (escapedCommand, verboseInfo) => {
  if (!isVerbose(verboseInfo)) {
    return;
  }
  verboseLog({
    type: "command",
    verboseMessage: escapedCommand,
    verboseInfo
  });
};

// node_modules/execa/lib/verbose/info.js
var getVerboseInfo = (verbose, escapedCommand, rawOptions) => {
  validateVerbose(verbose);
  const commandId = getCommandId(verbose);
  return {
    verbose,
    escapedCommand,
    commandId,
    rawOptions
  };
};
var getCommandId = (verbose) => isVerbose({ verbose }) ? COMMAND_ID++ : undefined;
var COMMAND_ID = 0n;
var validateVerbose = (verbose) => {
  for (const fdVerbose of verbose) {
    if (fdVerbose === false) {
      throw new TypeError(`The "verbose: false" option was renamed to "verbose: 'none'".`);
    }
    if (fdVerbose === true) {
      throw new TypeError(`The "verbose: true" option was renamed to "verbose: 'short'".`);
    }
    if (!VERBOSE_VALUES.includes(fdVerbose) && !isVerboseFunction(fdVerbose)) {
      const allowedValues = VERBOSE_VALUES.map((allowedValue) => `'${allowedValue}'`).join(", ");
      throw new TypeError(`The "verbose" option must not be ${fdVerbose}. Allowed values are: ${allowedValues} or a function.`);
    }
  }
};

// node_modules/execa/lib/return/duration.js
import { hrtime } from "node:process";
var getStartTime = () => hrtime.bigint();
var getDurationMs = (startTime) => Number(hrtime.bigint() - startTime) / 1e6;

// node_modules/execa/lib/arguments/command.js
var handleCommand = (filePath, rawArguments, rawOptions) => {
  const startTime = getStartTime();
  const { command, escapedCommand } = joinCommand(filePath, rawArguments);
  const verbose = normalizeFdSpecificOption(rawOptions, "verbose");
  const verboseInfo = getVerboseInfo(verbose, escapedCommand, { ...rawOptions });
  logCommand(escapedCommand, verboseInfo);
  return {
    command,
    escapedCommand,
    startTime,
    verboseInfo
  };
};

// node_modules/execa/lib/arguments/options.js
import path8 from "node:path";
import process8 from "node:process";

// node_modules/npm-run-path/index.js
import process4 from "node:process";
import path3 from "node:path";

// node_modules/path-key/index.js
function pathKey(options = {}) {
  const {
    env = process.env,
    platform: platform2 = process.platform
  } = options;
  if (platform2 !== "win32") {
    return "PATH";
  }
  return Object.keys(env).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
}

// node_modules/unicorn-magic/node.js
import { promisify } from "node:util";
import { execFile as execFileCallback, execFileSync as execFileSyncOriginal } from "node:child_process";
import path2 from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
var execFileOriginal = promisify(execFileCallback);
function toPath(urlOrPath) {
  return urlOrPath instanceof URL ? fileURLToPath2(urlOrPath) : urlOrPath;
}
function traversePathUp(startPath) {
  return {
    *[Symbol.iterator]() {
      let currentPath = path2.resolve(toPath(startPath));
      let previousPath;
      while (previousPath !== currentPath) {
        yield currentPath;
        previousPath = currentPath;
        currentPath = path2.resolve(currentPath, "..");
      }
    }
  };
}
var TEN_MEGABYTES_IN_BYTES = 10 * 1024 * 1024;

// node_modules/npm-run-path/index.js
var npmRunPath = ({
  cwd = process4.cwd(),
  path: pathOption = process4.env[pathKey()],
  preferLocal = true,
  execPath = process4.execPath,
  addExecPath = true
} = {}) => {
  const cwdPath = path3.resolve(toPath(cwd));
  const result = [];
  const pathParts = pathOption.split(path3.delimiter);
  if (preferLocal) {
    applyPreferLocal(result, pathParts, cwdPath);
  }
  if (addExecPath) {
    applyExecPath(result, pathParts, execPath, cwdPath);
  }
  return pathOption === "" || pathOption === path3.delimiter ? `${result.join(path3.delimiter)}${pathOption}` : [...result, pathOption].join(path3.delimiter);
};
var applyPreferLocal = (result, pathParts, cwdPath) => {
  for (const directory of traversePathUp(cwdPath)) {
    const pathPart = path3.join(directory, "node_modules/.bin");
    if (!pathParts.includes(pathPart)) {
      result.push(pathPart);
    }
  }
};
var applyExecPath = (result, pathParts, execPath, cwdPath) => {
  const pathPart = path3.resolve(cwdPath, toPath(execPath), "..");
  if (!pathParts.includes(pathPart)) {
    result.push(pathPart);
  }
};
var npmRunPathEnv = ({ env = process4.env, ...options } = {}) => {
  env = { ...env };
  const pathName = pathKey({ env });
  options.path = env[pathName];
  env[pathName] = npmRunPath(options);
  return env;
};

// node_modules/execa/lib/terminate/kill.js
import { setTimeout } from "node:timers/promises";

// node_modules/execa/lib/return/final-error.js
var getFinalError = (originalError, message, isSync) => {
  const ErrorClass = isSync ? ExecaSyncError : ExecaError;
  const options = originalError instanceof DiscardedError ? {} : { cause: originalError };
  return new ErrorClass(message, options);
};

class DiscardedError extends Error {
}
var setErrorName = (ErrorClass, value) => {
  Object.defineProperties(ErrorClass.prototype, {
    name: {
      value,
      writable: true,
      enumerable: false,
      configurable: true
    },
    [execaErrorSymbol]: {
      value: true,
      writable: false,
      enumerable: false,
      configurable: false
    }
  });
};
var isExecaError = (error) => isErrorInstance(error) && (execaErrorSymbol in error);
var execaErrorSymbol = Symbol("isExecaError");
var isErrorInstance = (value) => Object.prototype.toString.call(value) === "[object Error]";

class ExecaError extends Error {
}
setErrorName(ExecaError, ExecaError.name);

class ExecaSyncError extends Error {
}
setErrorName(ExecaSyncError, ExecaSyncError.name);

// node_modules/execa/lib/terminate/signal.js
import { constants as constants3 } from "node:os";

// node_modules/human-signals/build/src/main.js
import { constants as constants2 } from "node:os";

// node_modules/human-signals/build/src/realtime.js
var getRealtimeSignals = () => {
  const length = SIGRTMAX - SIGRTMIN + 1;
  return Array.from({ length }, getRealtimeSignal);
};
var getRealtimeSignal = (value, index) => ({
  name: `SIGRT${index + 1}`,
  number: SIGRTMIN + index,
  action: "terminate",
  description: "Application-specific signal (realtime)",
  standard: "posix"
});
var SIGRTMIN = 34;
var SIGRTMAX = 64;

// node_modules/human-signals/build/src/signals.js
import { constants } from "node:os";

// node_modules/human-signals/build/src/core.js
var SIGNALS = [
  {
    name: "SIGHUP",
    number: 1,
    action: "terminate",
    description: "Terminal closed",
    standard: "posix"
  },
  {
    name: "SIGINT",
    number: 2,
    action: "terminate",
    description: "User interruption with CTRL-C",
    standard: "ansi"
  },
  {
    name: "SIGQUIT",
    number: 3,
    action: "core",
    description: "User interruption with CTRL-\\",
    standard: "posix"
  },
  {
    name: "SIGILL",
    number: 4,
    action: "core",
    description: "Invalid machine instruction",
    standard: "ansi"
  },
  {
    name: "SIGTRAP",
    number: 5,
    action: "core",
    description: "Debugger breakpoint",
    standard: "posix"
  },
  {
    name: "SIGABRT",
    number: 6,
    action: "core",
    description: "Aborted",
    standard: "ansi"
  },
  {
    name: "SIGIOT",
    number: 6,
    action: "core",
    description: "Aborted",
    standard: "bsd"
  },
  {
    name: "SIGBUS",
    number: 7,
    action: "core",
    description: "Bus error due to misaligned, non-existing address or paging error",
    standard: "bsd"
  },
  {
    name: "SIGEMT",
    number: 7,
    action: "terminate",
    description: "Command should be emulated but is not implemented",
    standard: "other"
  },
  {
    name: "SIGFPE",
    number: 8,
    action: "core",
    description: "Floating point arithmetic error",
    standard: "ansi"
  },
  {
    name: "SIGKILL",
    number: 9,
    action: "terminate",
    description: "Forced termination",
    standard: "posix",
    forced: true
  },
  {
    name: "SIGUSR1",
    number: 10,
    action: "terminate",
    description: "Application-specific signal",
    standard: "posix"
  },
  {
    name: "SIGSEGV",
    number: 11,
    action: "core",
    description: "Segmentation fault",
    standard: "ansi"
  },
  {
    name: "SIGUSR2",
    number: 12,
    action: "terminate",
    description: "Application-specific signal",
    standard: "posix"
  },
  {
    name: "SIGPIPE",
    number: 13,
    action: "terminate",
    description: "Broken pipe or socket",
    standard: "posix"
  },
  {
    name: "SIGALRM",
    number: 14,
    action: "terminate",
    description: "Timeout or timer",
    standard: "posix"
  },
  {
    name: "SIGTERM",
    number: 15,
    action: "terminate",
    description: "Termination",
    standard: "ansi"
  },
  {
    name: "SIGSTKFLT",
    number: 16,
    action: "terminate",
    description: "Stack is empty or overflowed",
    standard: "other"
  },
  {
    name: "SIGCHLD",
    number: 17,
    action: "ignore",
    description: "Child process terminated, paused or unpaused",
    standard: "posix"
  },
  {
    name: "SIGCLD",
    number: 17,
    action: "ignore",
    description: "Child process terminated, paused or unpaused",
    standard: "other"
  },
  {
    name: "SIGCONT",
    number: 18,
    action: "unpause",
    description: "Unpaused",
    standard: "posix",
    forced: true
  },
  {
    name: "SIGSTOP",
    number: 19,
    action: "pause",
    description: "Paused",
    standard: "posix",
    forced: true
  },
  {
    name: "SIGTSTP",
    number: 20,
    action: "pause",
    description: 'Paused using CTRL-Z or "suspend"',
    standard: "posix"
  },
  {
    name: "SIGTTIN",
    number: 21,
    action: "pause",
    description: "Background process cannot read terminal input",
    standard: "posix"
  },
  {
    name: "SIGBREAK",
    number: 21,
    action: "terminate",
    description: "User interruption with CTRL-BREAK",
    standard: "other"
  },
  {
    name: "SIGTTOU",
    number: 22,
    action: "pause",
    description: "Background process cannot write to terminal output",
    standard: "posix"
  },
  {
    name: "SIGURG",
    number: 23,
    action: "ignore",
    description: "Socket received out-of-band data",
    standard: "bsd"
  },
  {
    name: "SIGXCPU",
    number: 24,
    action: "core",
    description: "Process timed out",
    standard: "bsd"
  },
  {
    name: "SIGXFSZ",
    number: 25,
    action: "core",
    description: "File too big",
    standard: "bsd"
  },
  {
    name: "SIGVTALRM",
    number: 26,
    action: "terminate",
    description: "Timeout or timer",
    standard: "bsd"
  },
  {
    name: "SIGPROF",
    number: 27,
    action: "terminate",
    description: "Timeout or timer",
    standard: "bsd"
  },
  {
    name: "SIGWINCH",
    number: 28,
    action: "ignore",
    description: "Terminal window size changed",
    standard: "bsd"
  },
  {
    name: "SIGIO",
    number: 29,
    action: "terminate",
    description: "I/O is available",
    standard: "other"
  },
  {
    name: "SIGPOLL",
    number: 29,
    action: "terminate",
    description: "Watched event",
    standard: "other"
  },
  {
    name: "SIGINFO",
    number: 29,
    action: "ignore",
    description: "Request for process information",
    standard: "other"
  },
  {
    name: "SIGPWR",
    number: 30,
    action: "terminate",
    description: "Device running out of power",
    standard: "systemv"
  },
  {
    name: "SIGSYS",
    number: 31,
    action: "core",
    description: "Invalid system call",
    standard: "other"
  },
  {
    name: "SIGUNUSED",
    number: 31,
    action: "terminate",
    description: "Invalid system call",
    standard: "other"
  }
];

// node_modules/human-signals/build/src/signals.js
var getSignals = () => {
  const realtimeSignals = getRealtimeSignals();
  const signals = [...SIGNALS, ...realtimeSignals].map(normalizeSignal);
  return signals;
};
var normalizeSignal = ({
  name,
  number: defaultNumber,
  description,
  action,
  forced = false,
  standard
}) => {
  const {
    signals: { [name]: constantSignal }
  } = constants;
  const supported = constantSignal !== undefined;
  const number = supported ? constantSignal : defaultNumber;
  return { name, number, description, supported, action, forced, standard };
};

// node_modules/human-signals/build/src/main.js
var getSignalsByName = () => {
  const signals = getSignals();
  return Object.fromEntries(signals.map(getSignalByName));
};
var getSignalByName = ({
  name,
  number,
  description,
  supported,
  action,
  forced,
  standard
}) => [name, { name, number, description, supported, action, forced, standard }];
var signalsByName = getSignalsByName();
var getSignalsByNumber = () => {
  const signals = getSignals();
  const length = SIGRTMAX + 1;
  const signalsA = Array.from({ length }, (value, number) => getSignalByNumber(number, signals));
  return Object.assign({}, ...signalsA);
};
var getSignalByNumber = (number, signals) => {
  const signal = findSignalByNumber(number, signals);
  if (signal === undefined) {
    return {};
  }
  const { name, description, supported, action, forced, standard } = signal;
  return {
    [number]: {
      name,
      number,
      description,
      supported,
      action,
      forced,
      standard
    }
  };
};
var findSignalByNumber = (number, signals) => {
  const signal = signals.find(({ name }) => constants2.signals[name] === number);
  if (signal !== undefined) {
    return signal;
  }
  return signals.find((signalA) => signalA.number === number);
};
var signalsByNumber = getSignalsByNumber();

// node_modules/execa/lib/terminate/signal.js
var normalizeKillSignal = (killSignal) => {
  const optionName = "option `killSignal`";
  if (killSignal === 0) {
    throw new TypeError(`Invalid ${optionName}: 0 cannot be used.`);
  }
  return normalizeSignal2(killSignal, optionName);
};
var normalizeSignalArgument = (signal) => signal === 0 ? signal : normalizeSignal2(signal, "`subprocess.kill()`'s argument");
var normalizeSignal2 = (signalNameOrInteger, optionName) => {
  if (Number.isInteger(signalNameOrInteger)) {
    return normalizeSignalInteger(signalNameOrInteger, optionName);
  }
  if (typeof signalNameOrInteger === "string") {
    return normalizeSignalName(signalNameOrInteger, optionName);
  }
  throw new TypeError(`Invalid ${optionName} ${String(signalNameOrInteger)}: it must be a string or an integer.
${getAvailableSignals()}`);
};
var normalizeSignalInteger = (signalInteger, optionName) => {
  if (signalsIntegerToName.has(signalInteger)) {
    return signalsIntegerToName.get(signalInteger);
  }
  throw new TypeError(`Invalid ${optionName} ${signalInteger}: this signal integer does not exist.
${getAvailableSignals()}`);
};
var getSignalsIntegerToName = () => new Map(Object.entries(constants3.signals).reverse().map(([signalName, signalInteger]) => [signalInteger, signalName]));
var signalsIntegerToName = getSignalsIntegerToName();
var normalizeSignalName = (signalName, optionName) => {
  if (signalName in constants3.signals) {
    return signalName;
  }
  if (signalName.toUpperCase() in constants3.signals) {
    throw new TypeError(`Invalid ${optionName} '${signalName}': please rename it to '${signalName.toUpperCase()}'.`);
  }
  throw new TypeError(`Invalid ${optionName} '${signalName}': this signal name does not exist.
${getAvailableSignals()}`);
};
var getAvailableSignals = () => `Available signal names: ${getAvailableSignalNames()}.
Available signal numbers: ${getAvailableSignalIntegers()}.`;
var getAvailableSignalNames = () => Object.keys(constants3.signals).sort().map((signalName) => `'${signalName}'`).join(", ");
var getAvailableSignalIntegers = () => [...new Set(Object.values(constants3.signals).sort((signalInteger, signalIntegerTwo) => signalInteger - signalIntegerTwo))].join(", ");
var getSignalDescription = (signal) => signalsByName[signal].description;

// node_modules/execa/lib/terminate/kill.js
var normalizeForceKillAfterDelay = (forceKillAfterDelay) => {
  if (forceKillAfterDelay === false) {
    return forceKillAfterDelay;
  }
  if (forceKillAfterDelay === true) {
    return DEFAULT_FORCE_KILL_TIMEOUT;
  }
  if (!Number.isFinite(forceKillAfterDelay) || forceKillAfterDelay < 0) {
    throw new TypeError(`Expected the \`forceKillAfterDelay\` option to be a non-negative integer, got \`${forceKillAfterDelay}\` (${typeof forceKillAfterDelay})`);
  }
  return forceKillAfterDelay;
};
var DEFAULT_FORCE_KILL_TIMEOUT = 1000 * 5;
var subprocessKill = ({ kill, options: { forceKillAfterDelay, killSignal }, onInternalError, context, controller }, signalOrError, errorArgument) => {
  const { signal, error } = parseKillArguments(signalOrError, errorArgument, killSignal);
  emitKillError(error, onInternalError);
  const killResult = kill(signal);
  setKillTimeout({
    kill,
    signal,
    forceKillAfterDelay,
    killSignal,
    killResult,
    context,
    controller
  });
  return killResult;
};
var parseKillArguments = (signalOrError, errorArgument, killSignal) => {
  const [signal = killSignal, error] = isErrorInstance(signalOrError) ? [undefined, signalOrError] : [signalOrError, errorArgument];
  if (typeof signal !== "string" && !Number.isInteger(signal)) {
    throw new TypeError(`The first argument must be an error instance or a signal name string/integer: ${String(signal)}`);
  }
  if (error !== undefined && !isErrorInstance(error)) {
    throw new TypeError(`The second argument is optional. If specified, it must be an error instance: ${error}`);
  }
  return { signal: normalizeSignalArgument(signal), error };
};
var emitKillError = (error, onInternalError) => {
  if (error !== undefined) {
    onInternalError.reject(error);
  }
};
var setKillTimeout = async ({ kill, signal, forceKillAfterDelay, killSignal, killResult, context, controller }) => {
  if (signal === killSignal && killResult) {
    killOnTimeout({
      kill,
      forceKillAfterDelay,
      context,
      controllerSignal: controller.signal
    });
  }
};
var killOnTimeout = async ({ kill, forceKillAfterDelay, context, controllerSignal }) => {
  if (forceKillAfterDelay === false) {
    return;
  }
  try {
    await setTimeout(forceKillAfterDelay, undefined, { signal: controllerSignal });
    if (kill("SIGKILL")) {
      context.isForcefullyTerminated ??= true;
    }
  } catch {}
};

// node_modules/execa/lib/utils/abort-signal.js
import { once } from "node:events";
var onAbortedSignal = async (mainSignal, stopSignal) => {
  if (!mainSignal.aborted) {
    await once(mainSignal, "abort", { signal: stopSignal });
  }
};

// node_modules/execa/lib/terminate/cancel.js
var validateCancelSignal = ({ cancelSignal }) => {
  if (cancelSignal !== undefined && Object.prototype.toString.call(cancelSignal) !== "[object AbortSignal]") {
    throw new Error(`The \`cancelSignal\` option must be an AbortSignal: ${String(cancelSignal)}`);
  }
};
var throwOnCancel = ({ kill, cancelSignal, gracefulCancel, context, controller }) => cancelSignal === undefined || gracefulCancel ? [] : [terminateOnCancel(kill, cancelSignal, context, controller)];
var terminateOnCancel = async (kill, cancelSignal, context, { signal }) => {
  await onAbortedSignal(cancelSignal, signal);
  context.terminationReason ??= "cancel";
  kill();
  throw cancelSignal.reason;
};

// node_modules/execa/lib/ipc/graceful.js
import { scheduler as scheduler2 } from "node:timers/promises";

// node_modules/execa/lib/ipc/send.js
import { promisify as promisify2 } from "node:util";

// node_modules/execa/lib/ipc/validation.js
var validateIpcMethod = ({ methodName, isSubprocess, ipc, isConnected }) => {
  validateIpcOption(methodName, isSubprocess, ipc);
  validateConnection(methodName, isSubprocess, isConnected);
};
var validateIpcOption = (methodName, isSubprocess, ipc) => {
  if (!ipc) {
    throw new Error(`${getMethodName(methodName, isSubprocess)} can only be used if the \`ipc\` option is \`true\`.`);
  }
};
var validateConnection = (methodName, isSubprocess, isConnected) => {
  if (!isConnected) {
    throw new Error(`${getMethodName(methodName, isSubprocess)} cannot be used: the ${getOtherProcessName(isSubprocess)} has already exited or disconnected.`);
  }
};
var throwOnEarlyDisconnect = (isSubprocess) => {
  throw new Error(`${getMethodName("getOneMessage", isSubprocess)} could not complete: the ${getOtherProcessName(isSubprocess)} exited or disconnected.`);
};
var throwOnStrictDeadlockError = (isSubprocess) => {
  throw new Error(`${getMethodName("sendMessage", isSubprocess)} failed: the ${getOtherProcessName(isSubprocess)} is sending a message too, instead of listening to incoming messages.
This can be fixed by both sending a message and listening to incoming messages at the same time:

const [receivedMessage] = await Promise.all([
	${getMethodName("getOneMessage", isSubprocess)},
	${getMethodName("sendMessage", isSubprocess, "message, {strict: true}")},
]);`);
};
var getStrictResponseError = (error, isSubprocess) => new Error(`${getMethodName("sendMessage", isSubprocess)} failed when sending an acknowledgment response to the ${getOtherProcessName(isSubprocess)}.`, { cause: error });
var throwOnMissingStrict = (isSubprocess) => {
  throw new Error(`${getMethodName("sendMessage", isSubprocess)} failed: the ${getOtherProcessName(isSubprocess)} is not listening to incoming messages.`);
};
var throwOnStrictDisconnect = (isSubprocess) => {
  throw new Error(`${getMethodName("sendMessage", isSubprocess)} failed: the ${getOtherProcessName(isSubprocess)} exited without listening to incoming messages.`);
};
var getAbortDisconnectError = () => new Error(`\`cancelSignal\` aborted: the ${getOtherProcessName(true)} disconnected.`);
var throwOnMissingParent = () => {
  throw new Error("`getCancelSignal()` cannot be used without setting the `cancelSignal` subprocess option.");
};
var handleEpipeError = ({ error, methodName, isSubprocess }) => {
  if (error.code === "EPIPE") {
    throw new Error(`${getMethodName(methodName, isSubprocess)} cannot be used: the ${getOtherProcessName(isSubprocess)} is disconnecting.`, { cause: error });
  }
};
var handleSerializationError = ({ error, methodName, isSubprocess, message }) => {
  if (isSerializationError(error)) {
    throw new Error(`${getMethodName(methodName, isSubprocess)}'s argument type is invalid: the message cannot be serialized: ${String(message)}.`, { cause: error });
  }
};
var isSerializationError = ({ code, message }) => SERIALIZATION_ERROR_CODES.has(code) || SERIALIZATION_ERROR_MESSAGES.some((serializationErrorMessage) => message.includes(serializationErrorMessage));
var SERIALIZATION_ERROR_CODES = new Set([
  "ERR_MISSING_ARGS",
  "ERR_INVALID_ARG_TYPE"
]);
var SERIALIZATION_ERROR_MESSAGES = [
  "could not be cloned",
  "circular structure",
  "call stack size exceeded"
];
var getMethodName = (methodName, isSubprocess, parameters = "") => methodName === "cancelSignal" ? "`cancelSignal`'s `controller.abort()`" : `${getNamespaceName(isSubprocess)}${methodName}(${parameters})`;
var getNamespaceName = (isSubprocess) => isSubprocess ? "" : "subprocess.";
var getOtherProcessName = (isSubprocess) => isSubprocess ? "parent process" : "subprocess";
var disconnect = (anyProcess) => {
  if (anyProcess.connected) {
    anyProcess.disconnect();
  }
};

// node_modules/execa/lib/utils/deferred.js
var createDeferred = () => {
  const methods = {};
  const promise = new Promise((resolve, reject) => {
    Object.assign(methods, { resolve, reject });
  });
  return Object.assign(promise, methods);
};

// node_modules/execa/lib/ipc/strict.js
import { once as once3 } from "node:events";

// node_modules/execa/lib/utils/max-listeners.js
import { addAbortListener } from "node:events";
var incrementMaxListeners = (eventEmitter, maxListenersIncrement, signal) => {
  const maxListeners = eventEmitter.getMaxListeners();
  if (maxListeners === 0 || maxListeners === Infinity) {
    return;
  }
  eventEmitter.setMaxListeners(maxListeners + maxListenersIncrement);
  addAbortListener(signal, () => {
    eventEmitter.setMaxListeners(eventEmitter.getMaxListeners() - maxListenersIncrement);
  });
};

// node_modules/execa/lib/ipc/forward.js
import { EventEmitter } from "node:events";

// node_modules/execa/lib/ipc/incoming.js
import { once as once2 } from "node:events";
import { scheduler } from "node:timers/promises";

// node_modules/execa/lib/ipc/reference.js
var addReference = (channel, reference) => {
  if (reference) {
    addReferenceCount(channel);
  }
};
var addReferenceCount = (channel) => {
  channel.refCounted();
};
var removeReference = (channel, reference) => {
  if (reference) {
    removeReferenceCount(channel);
  }
};
var removeReferenceCount = (channel) => {
  channel.unrefCounted();
};
var undoAddedReferences = (channel, isSubprocess) => {
  if (!isSubprocess) {
    return;
  }
  removeReferenceCount(channel);
  removeReferenceCount(channel);
};
var redoAddedReferences = (channel, isSubprocess) => {
  if (!isSubprocess) {
    return;
  }
  addReferenceCount(channel);
  addReferenceCount(channel);
};

// node_modules/execa/lib/ipc/incoming.js
var onMessage = async ({ anyProcess, channel, isSubprocess, ipcEmitter }, wrappedMessage) => {
  if (handleStrictResponse(wrappedMessage) || handleAbort(wrappedMessage)) {
    return;
  }
  if (!INCOMING_MESSAGES.has(anyProcess)) {
    INCOMING_MESSAGES.set(anyProcess, []);
  }
  const incomingMessages = INCOMING_MESSAGES.get(anyProcess);
  incomingMessages.push(wrappedMessage);
  if (incomingMessages.length > 1) {
    return;
  }
  while (incomingMessages.length > 0) {
    await waitForOutgoingMessages(anyProcess, ipcEmitter, wrappedMessage);
    await scheduler.yield();
    const message = await handleStrictRequest({
      wrappedMessage: incomingMessages[0],
      anyProcess,
      channel,
      isSubprocess,
      ipcEmitter
    });
    incomingMessages.shift();
    ipcEmitter.emit("message", message);
    ipcEmitter.emit("message:done");
  }
};
var onDisconnect = async ({ anyProcess, channel, isSubprocess, ipcEmitter, boundOnMessage }) => {
  abortOnDisconnect();
  const incomingMessages = INCOMING_MESSAGES.get(anyProcess);
  while (incomingMessages?.length > 0) {
    await once2(ipcEmitter, "message:done");
  }
  anyProcess.removeListener("message", boundOnMessage);
  redoAddedReferences(channel, isSubprocess);
  ipcEmitter.connected = false;
  ipcEmitter.emit("disconnect");
};
var INCOMING_MESSAGES = new WeakMap;

// node_modules/execa/lib/ipc/forward.js
var getIpcEmitter = (anyProcess, channel, isSubprocess) => {
  if (IPC_EMITTERS.has(anyProcess)) {
    return IPC_EMITTERS.get(anyProcess);
  }
  const ipcEmitter = new EventEmitter;
  ipcEmitter.connected = true;
  IPC_EMITTERS.set(anyProcess, ipcEmitter);
  forwardEvents({
    ipcEmitter,
    anyProcess,
    channel,
    isSubprocess
  });
  return ipcEmitter;
};
var IPC_EMITTERS = new WeakMap;
var forwardEvents = ({ ipcEmitter, anyProcess, channel, isSubprocess }) => {
  const boundOnMessage = onMessage.bind(undefined, {
    anyProcess,
    channel,
    isSubprocess,
    ipcEmitter
  });
  anyProcess.on("message", boundOnMessage);
  anyProcess.once("disconnect", onDisconnect.bind(undefined, {
    anyProcess,
    channel,
    isSubprocess,
    ipcEmitter,
    boundOnMessage
  }));
  undoAddedReferences(channel, isSubprocess);
};
var isConnected = (anyProcess) => {
  const ipcEmitter = IPC_EMITTERS.get(anyProcess);
  return ipcEmitter === undefined ? anyProcess.channel !== undefined && anyProcess.channel !== null : ipcEmitter.connected;
};

// node_modules/execa/lib/ipc/strict.js
var handleSendStrict = ({ anyProcess, channel, isSubprocess, message, strict }) => {
  if (!strict) {
    return message;
  }
  const ipcEmitter = getIpcEmitter(anyProcess, channel, isSubprocess);
  const hasListeners = hasMessageListeners(anyProcess, ipcEmitter);
  return {
    id: count++,
    type: REQUEST_TYPE,
    message,
    hasListeners
  };
};
var count = 0n;
var validateStrictDeadlock = (outgoingMessages, wrappedMessage) => {
  if (wrappedMessage?.type !== REQUEST_TYPE || wrappedMessage.hasListeners) {
    return;
  }
  for (const { id } of outgoingMessages) {
    if (id !== undefined) {
      STRICT_RESPONSES[id].resolve({ isDeadlock: true, hasListeners: false });
    }
  }
};
var handleStrictRequest = async ({ wrappedMessage, anyProcess, channel, isSubprocess, ipcEmitter }) => {
  if (wrappedMessage?.type !== REQUEST_TYPE || !anyProcess.connected) {
    return wrappedMessage;
  }
  const { id, message } = wrappedMessage;
  const response = { id, type: RESPONSE_TYPE, message: hasMessageListeners(anyProcess, ipcEmitter) };
  try {
    await sendMessage({
      anyProcess,
      channel,
      isSubprocess,
      ipc: true
    }, response);
  } catch (error) {
    ipcEmitter.emit("strict:error", error);
  }
  return message;
};
var handleStrictResponse = (wrappedMessage) => {
  if (wrappedMessage?.type !== RESPONSE_TYPE) {
    return false;
  }
  const { id, message: hasListeners } = wrappedMessage;
  STRICT_RESPONSES[id]?.resolve({ isDeadlock: false, hasListeners });
  return true;
};
var waitForStrictResponse = async (wrappedMessage, anyProcess, isSubprocess) => {
  if (wrappedMessage?.type !== REQUEST_TYPE) {
    return;
  }
  const deferred = createDeferred();
  STRICT_RESPONSES[wrappedMessage.id] = deferred;
  const controller = new AbortController;
  try {
    const { isDeadlock, hasListeners } = await Promise.race([
      deferred,
      throwOnDisconnect(anyProcess, isSubprocess, controller)
    ]);
    if (isDeadlock) {
      throwOnStrictDeadlockError(isSubprocess);
    }
    if (!hasListeners) {
      throwOnMissingStrict(isSubprocess);
    }
  } finally {
    controller.abort();
    delete STRICT_RESPONSES[wrappedMessage.id];
  }
};
var STRICT_RESPONSES = {};
var throwOnDisconnect = async (anyProcess, isSubprocess, { signal }) => {
  incrementMaxListeners(anyProcess, 1, signal);
  await once3(anyProcess, "disconnect", { signal });
  throwOnStrictDisconnect(isSubprocess);
};
var REQUEST_TYPE = "execa:ipc:request";
var RESPONSE_TYPE = "execa:ipc:response";

// node_modules/execa/lib/ipc/outgoing.js
var startSendMessage = (anyProcess, wrappedMessage, strict) => {
  if (!OUTGOING_MESSAGES.has(anyProcess)) {
    OUTGOING_MESSAGES.set(anyProcess, new Set);
  }
  const outgoingMessages = OUTGOING_MESSAGES.get(anyProcess);
  const onMessageSent = createDeferred();
  const id = strict ? wrappedMessage.id : undefined;
  const outgoingMessage = { onMessageSent, id };
  outgoingMessages.add(outgoingMessage);
  return { outgoingMessages, outgoingMessage };
};
var endSendMessage = ({ outgoingMessages, outgoingMessage }) => {
  outgoingMessages.delete(outgoingMessage);
  outgoingMessage.onMessageSent.resolve();
};
var waitForOutgoingMessages = async (anyProcess, ipcEmitter, wrappedMessage) => {
  while (!hasMessageListeners(anyProcess, ipcEmitter) && OUTGOING_MESSAGES.get(anyProcess)?.size > 0) {
    const outgoingMessages = [...OUTGOING_MESSAGES.get(anyProcess)];
    validateStrictDeadlock(outgoingMessages, wrappedMessage);
    await Promise.all(outgoingMessages.map(({ onMessageSent }) => onMessageSent));
  }
};
var OUTGOING_MESSAGES = new WeakMap;
var IPC_SUBPROCESS_OPTIONS = new WeakMap;
var setIpcSubprocessOptions = (subprocess, options) => {
  IPC_SUBPROCESS_OPTIONS.set(subprocess, options);
};
var hasMessageListeners = (anyProcess, ipcEmitter) => ipcEmitter.listenerCount("message") > getMinListenerCount(anyProcess);
var getMinListenerCount = (anyProcess) => getOptions(anyProcess) !== undefined && !getFdSpecificValue(getOptions(anyProcess).buffer, "ipc") ? 1 : 0;
var getOptions = (anyProcess) => IPC_SUBPROCESS_OPTIONS.get(anyProcess);

// node_modules/execa/lib/ipc/send.js
var sendMessage = ({ anyProcess, channel, isSubprocess, ipc }, message, { strict = false } = {}) => {
  const methodName = "sendMessage";
  validateIpcMethod({
    methodName,
    isSubprocess,
    ipc,
    isConnected: anyProcess.connected
  });
  return sendMessageAsync({
    anyProcess,
    channel,
    methodName,
    isSubprocess,
    message,
    strict
  });
};
var sendMessageAsync = async ({ anyProcess, channel, methodName, isSubprocess, message, strict }) => {
  const wrappedMessage = handleSendStrict({
    anyProcess,
    channel,
    isSubprocess,
    message,
    strict
  });
  const outgoingMessagesState = startSendMessage(anyProcess, wrappedMessage, strict);
  try {
    await sendOneMessage({
      anyProcess,
      methodName,
      isSubprocess,
      wrappedMessage,
      message
    });
  } catch (error) {
    disconnect(anyProcess);
    throw error;
  } finally {
    endSendMessage(outgoingMessagesState);
  }
};
var sendOneMessage = async ({ anyProcess, methodName, isSubprocess, wrappedMessage, message }) => {
  const sendMethod = getSendMethod(anyProcess);
  try {
    await Promise.all([
      waitForStrictResponse(wrappedMessage, anyProcess, isSubprocess),
      sendMethod(wrappedMessage)
    ]);
  } catch (error) {
    handleEpipeError({ error, methodName, isSubprocess });
    handleSerializationError({
      error,
      methodName,
      isSubprocess,
      message
    });
    throw error;
  }
};
var getSendMethod = (anyProcess) => {
  if (PROCESS_SEND_METHODS.has(anyProcess)) {
    return PROCESS_SEND_METHODS.get(anyProcess);
  }
  const sendMethod = promisify2(anyProcess.send.bind(anyProcess));
  PROCESS_SEND_METHODS.set(anyProcess, sendMethod);
  return sendMethod;
};
var PROCESS_SEND_METHODS = new WeakMap;

// node_modules/execa/lib/ipc/graceful.js
var sendAbort = (subprocess, message) => {
  const methodName = "cancelSignal";
  validateConnection(methodName, false, subprocess.connected);
  return sendOneMessage({
    anyProcess: subprocess,
    methodName,
    isSubprocess: false,
    wrappedMessage: { type: GRACEFUL_CANCEL_TYPE, message },
    message
  });
};
var getCancelSignal = async ({ anyProcess, channel, isSubprocess, ipc }) => {
  await startIpc({
    anyProcess,
    channel,
    isSubprocess,
    ipc
  });
  return cancelController.signal;
};
var startIpc = async ({ anyProcess, channel, isSubprocess, ipc }) => {
  if (isCancelListening) {
    return;
  }
  isCancelListening = true;
  if (!ipc) {
    throwOnMissingParent();
    return;
  }
  if (channel === null) {
    abortOnDisconnect();
    return;
  }
  getIpcEmitter(anyProcess, channel, isSubprocess);
  await scheduler2.yield();
};
var isCancelListening = false;
var handleAbort = (wrappedMessage) => {
  if (wrappedMessage?.type !== GRACEFUL_CANCEL_TYPE) {
    return false;
  }
  cancelController.abort(wrappedMessage.message);
  return true;
};
var GRACEFUL_CANCEL_TYPE = "execa:ipc:cancel";
var abortOnDisconnect = () => {
  cancelController.abort(getAbortDisconnectError());
};
var cancelController = new AbortController;

// node_modules/execa/lib/terminate/graceful.js
var validateGracefulCancel = ({ gracefulCancel, cancelSignal, ipc, serialization }) => {
  if (!gracefulCancel) {
    return;
  }
  if (cancelSignal === undefined) {
    throw new Error("The `cancelSignal` option must be defined when setting the `gracefulCancel` option.");
  }
  if (!ipc) {
    throw new Error("The `ipc` option cannot be false when setting the `gracefulCancel` option.");
  }
  if (serialization === "json") {
    throw new Error("The `serialization` option cannot be 'json' when setting the `gracefulCancel` option.");
  }
};
var throwOnGracefulCancel = ({
  subprocess,
  kill,
  cancelSignal,
  gracefulCancel,
  forceKillAfterDelay,
  context,
  controller
}) => gracefulCancel ? [sendOnAbort({
  subprocess,
  kill,
  cancelSignal,
  forceKillAfterDelay,
  context,
  controller
})] : [];
var sendOnAbort = async ({ subprocess, kill, cancelSignal, forceKillAfterDelay, context, controller: { signal } }) => {
  await onAbortedSignal(cancelSignal, signal);
  const reason = getReason(cancelSignal);
  await sendAbort(subprocess, reason);
  killOnTimeout({
    kill,
    forceKillAfterDelay,
    context,
    controllerSignal: signal
  });
  context.terminationReason ??= "gracefulCancel";
  throw cancelSignal.reason;
};
var getReason = ({ reason }) => {
  if (!(reason instanceof DOMException)) {
    return reason;
  }
  const error = new Error(reason.message);
  Object.defineProperty(error, "stack", {
    value: reason.stack,
    enumerable: false,
    configurable: true,
    writable: true
  });
  return error;
};

// node_modules/execa/lib/terminate/timeout.js
import { setTimeout as setTimeout2 } from "node:timers/promises";
var validateTimeout = ({ timeout }) => {
  if (timeout !== undefined && (!Number.isFinite(timeout) || timeout < 0)) {
    throw new TypeError(`Expected the \`timeout\` option to be a non-negative integer, got \`${timeout}\` (${typeof timeout})`);
  }
};
var throwOnTimeout = (kill, timeout, context, controller) => timeout === 0 || timeout === undefined ? [] : [killAfterTimeout(kill, timeout, context, controller)];
var killAfterTimeout = async (kill, timeout, context, { signal }) => {
  await setTimeout2(timeout, undefined, { signal });
  context.terminationReason ??= "timeout";
  kill();
  throw new DiscardedError;
};

// node_modules/execa/lib/methods/node.js
import { execPath, execArgv } from "node:process";
import path4 from "node:path";
var mapNode = ({ options }) => {
  if (options.node === false) {
    throw new TypeError('The "node" option cannot be false with `execaNode()`.');
  }
  return { options: { ...options, node: true } };
};
var handleNodeOption = (file, commandArguments, {
  node: shouldHandleNode = false,
  nodePath = execPath,
  nodeOptions = execArgv.filter((nodeOption) => !nodeOption.startsWith("--inspect")),
  cwd,
  execPath: formerNodePath,
  ...options
}) => {
  if (formerNodePath !== undefined) {
    throw new TypeError('The "execPath" option has been removed. Please use the "nodePath" option instead.');
  }
  const normalizedNodePath = safeNormalizeFileUrl(nodePath, 'The "nodePath" option');
  const resolvedNodePath = path4.resolve(cwd, normalizedNodePath);
  const newOptions = {
    __proto__: null,
    shell: false,
    ...options,
    nodePath: resolvedNodePath,
    node: shouldHandleNode,
    cwd
  };
  if (!shouldHandleNode) {
    return [file, commandArguments, newOptions];
  }
  if (path4.basename(file, ".exe") === "node") {
    throw new TypeError('When the "node" option is true, the first argument does not need to be "node".');
  }
  return [
    resolvedNodePath,
    [
      ...nodeOptions,
      file,
      ...commandArguments
    ],
    {
      __proto__: null,
      ipc: true,
      ...newOptions,
      shell: false
    }
  ];
};

// node_modules/execa/lib/ipc/ipc-input.js
import { serialize } from "node:v8";
var validateIpcInputOption = ({ ipcInput, ipc, serialization }) => {
  if (ipcInput === undefined) {
    return;
  }
  if (!ipc) {
    throw new Error("The `ipcInput` option cannot be set unless the `ipc` option is `true`.");
  }
  validateIpcInput[serialization](ipcInput);
};
var validateAdvancedInput = (ipcInput) => {
  try {
    serialize(ipcInput);
  } catch (error) {
    throw new Error("The `ipcInput` option is not serializable with a structured clone.", { cause: error });
  }
};
var validateJsonInput = (ipcInput) => {
  try {
    JSON.stringify(ipcInput);
  } catch (error) {
    throw new Error("The `ipcInput` option is not serializable with JSON.", { cause: error });
  }
};
var validateIpcInput = {
  advanced: validateAdvancedInput,
  json: validateJsonInput
};
var sendIpcInput = async (subprocess, ipcInput, ipc) => {
  if (ipcInput === undefined) {
    return;
  }
  await sendMessage({
    anyProcess: subprocess,
    channel: subprocess.channel,
    isSubprocess: false,
    ipc
  }, ipcInput);
};

// node_modules/execa/lib/arguments/encoding-option.js
var validateEncoding = ({ encoding }) => {
  if (ENCODINGS.has(encoding)) {
    return;
  }
  const correctEncoding = getCorrectEncoding(encoding);
  if (correctEncoding !== undefined) {
    throw new TypeError(`Invalid option \`encoding: ${serializeEncoding(encoding)}\`.
Please rename it to ${serializeEncoding(correctEncoding)}.`);
  }
  const correctEncodings = [...ENCODINGS].map((correctEncoding2) => serializeEncoding(correctEncoding2)).join(", ");
  throw new TypeError(`Invalid option \`encoding: ${serializeEncoding(encoding)}\`.
Please rename it to one of: ${correctEncodings}.`);
};
var TEXT_ENCODINGS = new Set(["utf8", "utf16le"]);
var BINARY_ENCODINGS = new Set(["buffer", "hex", "base64", "base64url", "latin1", "ascii"]);
var ENCODINGS = TEXT_ENCODINGS.union(BINARY_ENCODINGS);
var getCorrectEncoding = (encoding) => {
  if (encoding === null) {
    return "buffer";
  }
  if (typeof encoding !== "string") {
    return;
  }
  const lowerEncoding = encoding.toLowerCase();
  if (lowerEncoding in ENCODING_ALIASES) {
    return ENCODING_ALIASES[lowerEncoding];
  }
  if (ENCODINGS.has(lowerEncoding)) {
    return lowerEncoding;
  }
};
var ENCODING_ALIASES = {
  "utf-8": "utf8",
  "utf-16le": "utf16le",
  "ucs-2": "utf16le",
  ucs2: "utf16le",
  binary: "latin1"
};
var serializeEncoding = (encoding) => typeof encoding === "string" ? `"${encoding}"` : String(encoding);

// node_modules/execa/lib/arguments/command-file.js
import { openSync, readSync, closeSync } from "node:fs";
import { Buffer } from "node:buffer";
import path6 from "node:path";
import process6 from "node:process";

// node_modules/which-command/index.js
import fs2 from "node:fs";
import path5 from "node:path";
import process5 from "node:process";
var isWindows = process5.platform === "win32";
var separatorPattern = isWindows ? /[\/\\]/v : /\//v;
var defaultPathExt = ".COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC";
function resolveOptions(command, options) {
  if (typeof command !== "string" || command.length === 0) {
    throw new TypeError("Expected a non-empty string.");
  }
  const {
    cwd = process5.cwd(),
    path: searchPath = process5.env.PATH ?? (isWindows ? process5.env.Path : undefined) ?? "",
    pathExt = process5.env.PATHEXT || defaultPathExt
  } = options;
  return { cwd, searchPath, pathExt };
}
function windowsExtensions(command, pathExt) {
  const extensions = pathExt.split(path5.delimiter).filter(Boolean);
  const commandExtension = path5.extname(command).toLowerCase();
  if (commandExtension !== "" && extensions.some((extension) => extension.toLowerCase() === commandExtension)) {
    return ["", ...extensions];
  }
  return extensions;
}
function* candidatePaths(command, { cwd, searchPath, pathExt }) {
  const extensions = isWindows ? windowsExtensions(command, pathExt) : [""];
  if (separatorPattern.test(command)) {
    const base = path5.resolve(cwd, command);
    for (const extension of extensions) {
      yield base + extension;
    }
    return;
  }
  const directories = [
    ...isWindows ? [cwd] : [],
    ...searchPath.split(path5.delimiter)
  ];
  for (const directory of directories) {
    const unquoted = isWindows && directory.length > 1 && directory.startsWith('"') && directory.endsWith('"') ? directory.slice(1, -1) : directory;
    if (unquoted === "") {
      continue;
    }
    const base = path5.resolve(cwd, unquoted, command);
    for (const extension of extensions) {
      yield base + extension;
    }
  }
}
function isExecutableSync(filePath) {
  let stats;
  try {
    stats = fs2.statSync(filePath);
  } catch (error) {
    return isWindows && error.code === "EACCES";
  }
  if (!stats.isFile()) {
    return false;
  }
  if (isWindows) {
    return true;
  }
  try {
    fs2.accessSync(filePath, fs2.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
function whichCommandSync(command, options = {}) {
  const resolved = resolveOptions(command, options);
  for (const candidate of candidatePaths(command, resolved)) {
    if (isExecutableSync(candidate)) {
      return candidate;
    }
  }
  return;
}

// node_modules/execa/lib/arguments/command-file.js
var parseCommandFile = (file, commandArguments, options) => {
  const parsed = { file, commandArguments: [...commandArguments], options };
  if (options.shell || process6.platform !== "win32") {
    return parsed;
  }
  return escapeWindowsCommand(parsed);
};
var directlyExecutableRegExp = /\.(?:com|exe)$/i;
var batchFileRegExp = /\.(?:bat|cmd)$/i;
var escapeWindowsCommand = (parsed) => {
  const resolvedFile = resolveWithShebang(parsed);
  if (resolvedFile !== undefined && directlyExecutableRegExp.test(resolvedFile)) {
    return parsed;
  }
  for (const value of [parsed.file, ...parsed.commandArguments]) {
    assertNoLineBreak(value);
  }
  const isDoubleEscape = resolvedFile !== undefined && batchFileRegExp.test(resolvedFile);
  const escapedFile = escapeMetaChars(path6.normalize(parsed.file));
  const escapedArguments = parsed.commandArguments.map((argument) => escapeArgument(argument, isDoubleEscape));
  const commandLine = `"${[escapedFile, ...escapedArguments].join(" ")}"`;
  parsed.options.windowsVerbatimArguments = true;
  return {
    file: process6.env.comspec || "cmd.exe",
    commandArguments: ["/d", "/s", "/c", commandLine],
    options: parsed.options
  };
};
var resolveWithShebang = (parsed) => {
  const resolvedFile = resolvePath(parsed);
  const interpreter = resolvedFile !== undefined && readShebang(resolvedFile);
  if (!interpreter) {
    return resolvedFile;
  }
  parsed.commandArguments.unshift(resolvedFile);
  parsed.file = interpreter;
  return resolvePath(parsed);
};
var resolvePath = (parsed) => {
  const environment = parsed.options.env || process6.env;
  return whichCommandSync(parsed.file, {
    cwd: parsed.options.cwd,
    path: environment[pathKey({ env: environment })]
  });
};
var SHEBANG_BYTE_LENGTH = 150;
var readShebang = (file) => {
  const buffer = Buffer.alloc(SHEBANG_BYTE_LENGTH);
  try {
    const fileDescriptor = openSync(file, "r");
    try {
      readSync(fileDescriptor, buffer, 0, SHEBANG_BYTE_LENGTH, 0);
    } finally {
      closeSync(fileDescriptor);
    }
  } catch {
    return;
  }
  return parseShebang(buffer.toString());
};
var shebangRegExp = /^#!(?<line>.*)/;
var parseShebang = (contents) => {
  const shebangLine = contents.match(shebangRegExp)?.groups.line.trim();
  if (!shebangLine) {
    return;
  }
  const [interpreterPath, argument] = shebangLine.split(" ");
  const interpreter = interpreterPath.split("/").at(-1);
  if (interpreter === "env") {
    return argument;
  }
  return argument ? `${interpreter} ${argument}` : interpreter;
};
var lineBreakRegExp = /[\n\r]/;
var assertNoLineBreak = (value) => {
  if (lineBreakRegExp.test(value)) {
    throw new TypeError(`The command and its arguments cannot contain a line break on Windows without a shell.
This would allow a command injection with \`cmd.exe\`.
Invalid value: ${JSON.stringify(`${value}`)}`);
  }
};
var metaCharsRegExp = /[()\][%!^"`<>&|;, *?]/g;
var escapeMetaChars = (value) => value.replaceAll(metaCharsRegExp, "^$&");
var backslashRunRegExp = /\\+/g;
var escapeArgument = (rawArgument, doubleEscape) => {
  const argument = `${rawArgument}`.replaceAll(backslashRunRegExp, (backslashes, offset, string) => {
    const nextCharacter = string[offset + backslashes.length];
    const isPrecedesDoubleQuote = nextCharacter === '"' || nextCharacter === undefined;
    return isPrecedesDoubleQuote ? backslashes.repeat(2) : backslashes;
  }).replaceAll('"', "\\\"");
  const escapedArgument = escapeMetaChars(`"${argument}"`);
  return doubleEscape ? escapeMetaChars(escapedArgument) : escapedArgument;
};

// node_modules/execa/lib/arguments/cwd.js
import { statSync } from "node:fs";
import path7 from "node:path";
import process7 from "node:process";
var normalizeCwd = (cwd = getDefaultCwd()) => {
  const cwdString = safeNormalizeFileUrl(cwd, 'The "cwd" option');
  return path7.resolve(cwdString);
};
var getDefaultCwd = () => {
  try {
    return process7.cwd();
  } catch (error) {
    error.message = `The current directory does not exist.
${error.message}`;
    throw error;
  }
};
var fixCwdError = (originalMessage, cwd) => {
  if (cwd === getDefaultCwd()) {
    return originalMessage;
  }
  let cwdStat;
  try {
    cwdStat = statSync(cwd);
  } catch (error) {
    return `The "cwd" option is invalid: ${cwd}.
${error.message}
${originalMessage}`;
  }
  if (!cwdStat.isDirectory()) {
    return `The "cwd" option is not a directory: ${cwd}.
${originalMessage}`;
  }
  return originalMessage;
};

// node_modules/execa/lib/arguments/options.js
var normalizeOptions = (filePath, rawArguments, rawOptions) => {
  const sanitizedOptions = { __proto__: null, ...rawOptions };
  sanitizedOptions.cwd = normalizeCwd(sanitizedOptions.cwd);
  const [processedFile, processedArguments, processedOptions] = handleNodeOption(filePath, rawArguments, sanitizedOptions);
  const { file, commandArguments, options: initialOptions } = parseCommandFile(processedFile, processedArguments, processedOptions);
  const fdOptions = normalizeFdSpecificOptions(initialOptions);
  const options = addDefaultOptions(fdOptions);
  validateTimeout(options);
  validateEncoding(options);
  validateIpcInputOption(options);
  validateCancelSignal(options);
  validateGracefulCancel(options);
  options.shell = normalizeFileUrl(options.shell);
  options.env = getEnv(options);
  options.killSignal = normalizeKillSignal(options.killSignal);
  options.forceKillAfterDelay = normalizeForceKillAfterDelay(options.forceKillAfterDelay);
  options.lines = options.lines.map((lines, fdNumber) => lines && !BINARY_ENCODINGS.has(options.encoding) && options.buffer[fdNumber]);
  if (process8.platform === "win32" && path8.basename(file, ".exe") === "cmd") {
    commandArguments.unshift("/q");
  }
  return { file, commandArguments, options };
};
var addDefaultOptions = ({
  extendEnv = true,
  preferLocal = false,
  cwd,
  localDir: localDirectory = cwd,
  encoding = "utf8",
  reject = true,
  cleanup = true,
  killDescendants = false,
  all = false,
  windowsHide = true,
  killSignal = "SIGTERM",
  forceKillAfterDelay = true,
  gracefulCancel = false,
  ipcInput,
  ipc = ipcInput !== undefined || gracefulCancel,
  serialization = "advanced",
  ...options
}) => ({
  __proto__: null,
  ...options,
  extendEnv,
  preferLocal,
  cwd,
  localDirectory,
  encoding,
  reject,
  cleanup,
  killDescendants,
  all,
  windowsHide,
  killSignal,
  forceKillAfterDelay,
  gracefulCancel,
  ipcInput,
  ipc,
  serialization
});
var getEnv = ({ env: envOption, extendEnv, preferLocal, node, localDirectory, nodePath }) => {
  const env = extendEnv ? { ...process8.env, ...envOption } : envOption;
  if (preferLocal || node) {
    return npmRunPathEnv({
      env,
      cwd: localDirectory,
      execPath: nodePath,
      preferLocal,
      addExecPath: node
    });
  }
  return env;
};

// node_modules/execa/lib/arguments/shell.js
var concatenateShell = (file, commandArguments, options) => options.shell && commandArguments.length > 0 ? [[file, ...commandArguments].join(" "), [], options] : [file, commandArguments, options];

// node_modules/execa/lib/return/message.js
import { inspect as inspect2 } from "node:util";

// node_modules/strip-final-newline/index.js
function stripFinalNewline(input) {
  if (typeof input === "string") {
    return stripFinalNewlineString(input);
  }
  if (!(ArrayBuffer.isView(input) && input.BYTES_PER_ELEMENT === 1)) {
    throw new Error("Input must be a string or a Uint8Array");
  }
  return stripFinalNewlineBinary(input);
}
var stripFinalNewlineString = (input) => input.at(-1) === LF ? input.slice(0, input.at(-2) === CR ? -2 : -1) : input;
var stripFinalNewlineBinary = (input) => input.at(-1) === LF_BINARY ? input.subarray(0, input.at(-2) === CR_BINARY ? -2 : -1) : input;
var LF = `
`;
var LF_BINARY = LF.codePointAt(0);
var CR = "\r";
var CR_BINARY = CR.codePointAt(0);

// node_modules/get-stream/source/index.js
import { on } from "node:events";
import { finished } from "node:stream/promises";

// node_modules/get-stream/node_modules/is-stream/index.js
function isStream(stream, { checkOpen = true } = {}) {
  return stream !== null && typeof stream === "object" && (stream.writable || stream.readable || !checkOpen || stream.writable === undefined && stream.readable === undefined) && typeof stream.pipe === "function";
}
function isReadableStream(stream, { checkOpen = true } = {}) {
  return isStream(stream, { checkOpen }) && (stream.readable || !checkOpen) && typeof stream.read === "function" && typeof stream.readable === "boolean" && typeof stream.readableObjectMode === "boolean" && typeof stream.destroy === "function" && typeof stream.destroyed === "boolean";
}

// node_modules/@sec-ant/readable-stream/dist/ponyfill/asyncIterator.js
var a2 = Object.getPrototypeOf(Object.getPrototypeOf(async function* () {}).prototype);

class c3 {
  #t;
  #n;
  #r = false;
  #e = undefined;
  constructor(e, t2) {
    this.#t = e, this.#n = t2;
  }
  next() {
    const e = () => this.#s();
    return this.#e = this.#e ? this.#e.then(e, e) : e(), this.#e;
  }
  return(e) {
    const t2 = () => this.#i(e);
    return this.#e ? this.#e.then(t2, t2) : t2();
  }
  async#s() {
    if (this.#r)
      return {
        done: true,
        value: undefined
      };
    let e;
    try {
      e = await this.#t.read();
    } catch (t2) {
      throw this.#e = undefined, this.#r = true, this.#t.releaseLock(), t2;
    }
    return e.done && (this.#e = undefined, this.#r = true, this.#t.releaseLock()), e;
  }
  async#i(e) {
    if (this.#r)
      return {
        done: true,
        value: e
      };
    if (this.#r = true, !this.#n) {
      const t2 = this.#t.cancel(e);
      return this.#t.releaseLock(), await t2, {
        done: true,
        value: e
      };
    }
    return this.#t.releaseLock(), {
      done: true,
      value: e
    };
  }
}
var n3 = Symbol();
function i2() {
  return this[n3].next();
}
Object.defineProperty(i2, "name", { value: "next" });
function o2(r2) {
  return this[n3].return(r2);
}
Object.defineProperty(o2, "name", { value: "return" });
var u4 = Object.create(a2, {
  next: {
    enumerable: true,
    configurable: true,
    writable: true,
    value: i2
  },
  return: {
    enumerable: true,
    configurable: true,
    writable: true,
    value: o2
  }
});
function h2({ preventCancel: r2 = false } = {}) {
  const e = this.getReader(), t2 = new c3(e, r2), s = Object.create(u4);
  return s[n3] = t2, s;
}

// node_modules/get-stream/source/stream.js
var getAsyncIterable = (stream) => {
  if (isReadableStream(stream, { checkOpen: false }) && nodeImports.on !== undefined) {
    return getStreamIterable(stream);
  }
  if (typeof stream?.[Symbol.asyncIterator] === "function") {
    return stream;
  }
  if (toString.call(stream) === "[object ReadableStream]") {
    return h2.call(stream);
  }
  throw new TypeError("The first argument must be a Readable, a ReadableStream, or an async iterable.");
};
var { toString } = Object.prototype;
var getStreamIterable = async function* (stream) {
  const controller = new AbortController;
  const state = {};
  handleStreamEnd(stream, controller, state);
  try {
    for await (const [chunk] of nodeImports.on(stream, "data", { signal: controller.signal })) {
      yield chunk;
    }
  } catch (error) {
    if (state.error !== undefined) {
      throw state.error;
    } else if (!controller.signal.aborted) {
      throw error;
    }
  } finally {
    stream.destroy();
  }
};
var handleStreamEnd = async (stream, controller, state) => {
  try {
    await nodeImports.finished(stream, {
      cleanup: true,
      readable: true,
      writable: false,
      error: false
    });
  } catch (error) {
    state.error = error;
  } finally {
    controller.abort();
  }
};
var nodeImports = {};

// node_modules/get-stream/source/contents.js
var getStreamContents = async (stream, { init, convertChunk, getSize, truncateChunk, addChunk, getFinalChunk, finalize }, { maxBuffer = Number.POSITIVE_INFINITY } = {}) => {
  const asyncIterable = getAsyncIterable(stream);
  const state = init();
  state.length = 0;
  try {
    for await (const chunk of asyncIterable) {
      const chunkType = getChunkType(chunk);
      const convertedChunk = convertChunk[chunkType](chunk, state);
      appendChunk({
        convertedChunk,
        state,
        getSize,
        truncateChunk,
        addChunk,
        maxBuffer
      });
    }
    appendFinalChunk({
      state,
      convertChunk,
      getSize,
      truncateChunk,
      addChunk,
      getFinalChunk,
      maxBuffer
    });
    return finalize(state);
  } catch (error) {
    const normalizedError = typeof error === "object" && error !== null ? error : new Error(error);
    normalizedError.bufferedData = finalize(state);
    throw normalizedError;
  }
};
var appendFinalChunk = ({ state, getSize, truncateChunk, addChunk, getFinalChunk, maxBuffer }) => {
  const convertedChunk = getFinalChunk(state);
  if (convertedChunk !== undefined) {
    appendChunk({
      convertedChunk,
      state,
      getSize,
      truncateChunk,
      addChunk,
      maxBuffer
    });
  }
};
var appendChunk = ({ convertedChunk, state, getSize, truncateChunk, addChunk, maxBuffer }) => {
  const chunkSize = getSize(convertedChunk);
  const newLength = state.length + chunkSize;
  if (newLength <= maxBuffer) {
    addNewChunk(convertedChunk, state, addChunk, newLength);
    return;
  }
  const truncatedChunk = truncateChunk(convertedChunk, maxBuffer - state.length);
  if (truncatedChunk !== undefined) {
    addNewChunk(truncatedChunk, state, addChunk, maxBuffer);
  }
  throw new MaxBufferError;
};
var addNewChunk = (convertedChunk, state, addChunk, newLength) => {
  state.contents = addChunk(convertedChunk, state, newLength);
  state.length = newLength;
};
var getChunkType = (chunk) => {
  const typeOfChunk = typeof chunk;
  if (typeOfChunk === "string") {
    return "string";
  }
  if (typeOfChunk !== "object" || chunk === null) {
    return "others";
  }
  if (globalThis.Buffer?.isBuffer(chunk)) {
    return "buffer";
  }
  const prototypeName = objectToString2.call(chunk);
  if (prototypeName === "[object ArrayBuffer]") {
    return "arrayBuffer";
  }
  if (prototypeName === "[object DataView]") {
    return "dataView";
  }
  if (Number.isInteger(chunk.byteLength) && Number.isInteger(chunk.byteOffset) && objectToString2.call(chunk.buffer) === "[object ArrayBuffer]") {
    return "typedArray";
  }
  return "others";
};
var { toString: objectToString2 } = Object.prototype;

class MaxBufferError extends Error {
  name = "MaxBufferError";
  constructor() {
    super("maxBuffer exceeded");
  }
}

// node_modules/get-stream/source/utils.js
var identity2 = (value) => value;
var noop = () => {
  return;
};
var getContentsProperty = ({ contents }) => contents;
var throwObjectStream = (chunk) => {
  throw new Error(`Streams in object mode are not supported: ${String(chunk)}`);
};
var getLengthProperty = (convertedChunk) => convertedChunk.length;

// node_modules/get-stream/source/array.js
async function getStreamAsArray(stream, options) {
  return getStreamContents(stream, arrayMethods, options);
}
var initArray = () => ({ contents: [] });
var increment = () => 1;
var addArrayChunk = (convertedChunk, { contents }) => {
  contents.push(convertedChunk);
  return contents;
};
var arrayMethods = {
  init: initArray,
  convertChunk: {
    string: identity2,
    buffer: identity2,
    arrayBuffer: identity2,
    dataView: identity2,
    typedArray: identity2,
    others: identity2
  },
  getSize: increment,
  truncateChunk: noop,
  addChunk: addArrayChunk,
  getFinalChunk: noop,
  finalize: getContentsProperty
};
// node_modules/get-stream/source/array-buffer.js
async function getStreamAsArrayBuffer(stream, options) {
  return getStreamContents(stream, arrayBufferMethods, options);
}
var initArrayBuffer = () => ({ contents: new ArrayBuffer(0) });
var useTextEncoder = (chunk) => textEncoder2.encode(chunk);
var textEncoder2 = new TextEncoder;
var useUint8Array = (chunk) => new Uint8Array(chunk);
var useUint8ArrayWithOffset = (chunk) => new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
var truncateArrayBufferChunk = (convertedChunk, chunkSize) => convertedChunk.slice(0, chunkSize);
var addArrayBufferChunk = (convertedChunk, { contents, length: previousLength }, length) => {
  const newContents = hasArrayBufferResize() ? resizeArrayBuffer(contents, length) : resizeArrayBufferSlow(contents, length);
  new Uint8Array(newContents).set(convertedChunk, previousLength);
  return newContents;
};
var resizeArrayBufferSlow = (contents, length) => {
  if (length <= contents.byteLength) {
    return contents;
  }
  const arrayBuffer = new ArrayBuffer(getNewContentsLength(length));
  new Uint8Array(arrayBuffer).set(new Uint8Array(contents), 0);
  return arrayBuffer;
};
var resizeArrayBuffer = (contents, length) => {
  if (length <= contents.maxByteLength) {
    contents.resize(length);
    return contents;
  }
  const arrayBuffer = new ArrayBuffer(length, { maxByteLength: getNewContentsLength(length) });
  new Uint8Array(arrayBuffer).set(new Uint8Array(contents), 0);
  return arrayBuffer;
};
var getNewContentsLength = (length) => SCALE_FACTOR ** Math.ceil(Math.log(length) / Math.log(SCALE_FACTOR));
var SCALE_FACTOR = 2;
var finalizeArrayBuffer = ({ contents, length }) => hasArrayBufferResize() ? contents : contents.slice(0, length);
var hasArrayBufferResize = () => ("resize" in ArrayBuffer.prototype);
var arrayBufferMethods = {
  init: initArrayBuffer,
  convertChunk: {
    string: useTextEncoder,
    buffer: useUint8Array,
    arrayBuffer: useUint8Array,
    dataView: useUint8ArrayWithOffset,
    typedArray: useUint8ArrayWithOffset,
    others: throwObjectStream
  },
  getSize: getLengthProperty,
  truncateChunk: truncateArrayBufferChunk,
  addChunk: addArrayBufferChunk,
  getFinalChunk: noop,
  finalize: finalizeArrayBuffer
};
// node_modules/get-stream/source/string.js
async function getStreamAsString(stream, options) {
  return getStreamContents(stream, stringMethods, options);
}
var initString = () => ({ contents: "", textDecoder: new TextDecoder });
var useTextDecoder = (chunk, { textDecoder: textDecoder2 }) => textDecoder2.decode(chunk, { stream: true });
var addStringChunk = (convertedChunk, { contents }) => contents + convertedChunk;
var truncateStringChunk = (convertedChunk, chunkSize) => convertedChunk.slice(0, chunkSize);
var getFinalStringChunk = ({ textDecoder: textDecoder2 }) => {
  const finalChunk = textDecoder2.decode();
  return finalChunk === "" ? undefined : finalChunk;
};
var stringMethods = {
  init: initString,
  convertChunk: {
    string: identity2,
    buffer: useTextDecoder,
    arrayBuffer: useTextDecoder,
    dataView: useTextDecoder,
    typedArray: useTextDecoder,
    others: throwObjectStream
  },
  getSize: getLengthProperty,
  truncateChunk: truncateStringChunk,
  addChunk: addStringChunk,
  getFinalChunk: getFinalStringChunk,
  finalize: getContentsProperty
};
// node_modules/get-stream/source/index.js
Object.assign(nodeImports, { on, finished });

// node_modules/execa/lib/io/max-buffer.js
var handleMaxBuffer = ({ error, stream, readableObjectMode, lines, encoding, fdNumber }) => {
  if (!(error instanceof MaxBufferError)) {
    throw error;
  }
  if (fdNumber === "all") {
    return error;
  }
  const unit = getMaxBufferUnit(readableObjectMode, lines, encoding);
  error.maxBufferInfo = { fdNumber, unit };
  stream.destroy();
  throw error;
};
var getMaxBufferUnit = (readableObjectMode, lines, encoding) => {
  if (readableObjectMode) {
    return "objects";
  }
  if (lines) {
    return "lines";
  }
  if (encoding === "buffer") {
    return "bytes";
  }
  return "characters";
};
var checkIpcMaxBuffer = (subprocess, ipcOutput, maxBuffer) => {
  if (ipcOutput.length !== maxBuffer) {
    return;
  }
  const error = new MaxBufferError;
  error.maxBufferInfo = { fdNumber: "ipc" };
  throw error;
};
var getMaxBufferMessage = (error, maxBuffer) => {
  const { streamName, threshold, unit } = getMaxBufferInfo(error, maxBuffer);
  return `Command's ${streamName} was larger than ${threshold} ${unit}`;
};
var getMaxBufferInfo = (error, maxBuffer) => {
  if (error?.maxBufferInfo === undefined) {
    return { streamName: "output", threshold: maxBuffer[1], unit: "bytes" };
  }
  const { maxBufferInfo: { fdNumber, unit } } = error;
  delete error.maxBufferInfo;
  const threshold = getFdSpecificValue(maxBuffer, fdNumber);
  if (fdNumber === "ipc") {
    return { streamName: "IPC output", threshold, unit: "messages" };
  }
  return { streamName: getStreamName(fdNumber), threshold, unit };
};
var isMaxBufferSync = (resultError, output, maxBuffer) => resultError?.code === "ENOBUFS" && output !== null && output.some((result) => result !== null && result.length > getMaxBufferSync(maxBuffer));
var truncateMaxBufferSync = (result, isMaxBuffer, maxBuffer) => {
  if (!isMaxBuffer) {
    return result;
  }
  const maxBufferValue = getMaxBufferSync(maxBuffer);
  return result.length > maxBufferValue ? result.slice(0, maxBufferValue) : result;
};
var getMaxBufferSync = ([, stdoutMaxBuffer]) => stdoutMaxBuffer;

// node_modules/execa/lib/return/message.js
var createMessages = ({
  stdio,
  all,
  ipcOutput,
  originalError,
  signal,
  signalDescription,
  exitCode,
  escapedCommand,
  timedOut,
  isCanceled,
  isGracefullyCanceled,
  isMaxBuffer,
  isForcefullyTerminated,
  forceKillAfterDelay,
  killSignal,
  maxBuffer,
  timeout,
  cwd
}) => {
  const errorCode = originalError?.code;
  const prefix = getErrorPrefix({
    originalError,
    timedOut,
    timeout,
    isMaxBuffer,
    maxBuffer,
    errorCode,
    signal,
    signalDescription,
    exitCode,
    isCanceled,
    isGracefullyCanceled,
    isForcefullyTerminated,
    forceKillAfterDelay,
    killSignal
  });
  const originalMessage = getOriginalMessage(originalError, cwd);
  const suffix = originalMessage === undefined ? "" : `
${originalMessage}`;
  const shortMessage = `${prefix}: ${escapedCommand}${suffix}`;
  const messageStdio = all === undefined ? [stdio[2], stdio[1]] : [all];
  const message = [
    shortMessage,
    ...messageStdio,
    ...stdio.slice(3),
    ipcOutput.map((ipcMessage) => serializeIpcMessage(ipcMessage)).join(`
`)
  ].map((messagePart) => escapeLines(stripFinalNewline(serializeMessagePart(messagePart)))).filter(Boolean).join(`

`);
  return { originalMessage, shortMessage, message };
};
var getErrorPrefix = ({
  originalError,
  timedOut,
  timeout,
  isMaxBuffer,
  maxBuffer,
  errorCode,
  signal,
  signalDescription,
  exitCode,
  isCanceled,
  isGracefullyCanceled,
  isForcefullyTerminated,
  forceKillAfterDelay,
  killSignal
}) => {
  const forcefulSuffix = getForcefulSuffix(isForcefullyTerminated, forceKillAfterDelay);
  if (timedOut) {
    return `Command timed out after ${timeout} milliseconds${forcefulSuffix}`;
  }
  if (isGracefullyCanceled) {
    if (signal === undefined) {
      return `Command was gracefully canceled with exit code ${exitCode}`;
    }
    return isForcefullyTerminated ? `Command was gracefully canceled${forcefulSuffix}` : `Command was gracefully canceled with ${signal} (${signalDescription})`;
  }
  if (isCanceled) {
    return `Command was canceled${forcefulSuffix}`;
  }
  if (isMaxBuffer) {
    return `${getMaxBufferMessage(originalError, maxBuffer)}${forcefulSuffix}`;
  }
  if (errorCode !== undefined) {
    return `Command failed with ${errorCode}${forcefulSuffix}`;
  }
  if (isForcefullyTerminated) {
    return `Command was killed with ${killSignal} (${getSignalDescription(killSignal)})${forcefulSuffix}`;
  }
  if (signal !== undefined) {
    return `Command was killed with ${signal} (${signalDescription})`;
  }
  if (exitCode !== undefined) {
    return `Command failed with exit code ${exitCode}`;
  }
  return "Command failed";
};
var getForcefulSuffix = (isForcefullyTerminated, forceKillAfterDelay) => isForcefullyTerminated ? ` and was forcefully terminated after ${forceKillAfterDelay} milliseconds` : "";
var getOriginalMessage = (originalError, cwd) => {
  if (originalError instanceof DiscardedError) {
    return;
  }
  const originalMessage = isExecaError(originalError) ? originalError.originalMessage : String(originalError?.message ?? originalError);
  const escapedOriginalMessage = escapeLines(fixCwdError(originalMessage, cwd));
  return escapedOriginalMessage === "" ? undefined : escapedOriginalMessage;
};
var serializeIpcMessage = (ipcMessage) => typeof ipcMessage === "string" ? ipcMessage : inspect2(ipcMessage);
var serializeMessagePart = (messagePart) => Array.isArray(messagePart) ? messagePart.map((messageItem) => stripFinalNewline(serializeMessageItem(messageItem))).filter(Boolean).join(`
`) : serializeMessageItem(messagePart);
var serializeMessageItem = (messageItem) => {
  if (typeof messageItem === "string") {
    return messageItem;
  }
  if (isUint8Array(messageItem)) {
    return uint8ArrayToString(messageItem);
  }
  return "";
};

// node_modules/execa/lib/return/result.js
var makeSuccessResult = ({
  command,
  escapedCommand,
  stdio,
  all,
  ipcOutput,
  options: { cwd },
  startTime
}) => omitUndefinedProperties({
  command,
  escapedCommand,
  cwd,
  durationMs: getDurationMs(startTime),
  failed: false,
  timedOut: false,
  isCanceled: false,
  isGracefullyCanceled: false,
  isTerminated: false,
  isMaxBuffer: false,
  isForcefullyTerminated: false,
  exitCode: 0,
  stdout: stdio[1],
  stderr: stdio[2],
  all,
  stdio,
  ipcOutput,
  pipedFrom: []
});
var makeEarlyError = ({
  error,
  command,
  escapedCommand,
  fileDescriptors,
  options,
  startTime,
  isSync
}) => makeError({
  error,
  command,
  escapedCommand,
  startTime,
  timedOut: false,
  isCanceled: false,
  isGracefullyCanceled: false,
  isMaxBuffer: false,
  isForcefullyTerminated: false,
  stdio: Array.from({ length: fileDescriptors.length }),
  ipcOutput: [],
  options,
  isSync
});
var makeError = ({
  error: originalError,
  command,
  escapedCommand,
  startTime,
  timedOut,
  isCanceled,
  isGracefullyCanceled,
  isMaxBuffer,
  isForcefullyTerminated,
  exitCode: rawExitCode,
  signal: rawSignal,
  stdio,
  all,
  ipcOutput,
  options: {
    timeoutDuration,
    timeout = timeoutDuration,
    forceKillAfterDelay,
    killSignal,
    cwd,
    maxBuffer
  },
  isSync
}) => {
  const { exitCode, signal, signalDescription } = normalizeExitPayload(rawExitCode, rawSignal);
  const { originalMessage, shortMessage, message } = createMessages({
    stdio,
    all,
    ipcOutput,
    originalError,
    signal,
    signalDescription,
    exitCode,
    escapedCommand,
    timedOut,
    isCanceled,
    isGracefullyCanceled,
    isMaxBuffer,
    isForcefullyTerminated,
    forceKillAfterDelay,
    killSignal,
    maxBuffer,
    timeout,
    cwd
  });
  const error = getFinalError(originalError, message, isSync);
  Object.assign(error, getErrorProperties({
    error,
    command,
    escapedCommand,
    startTime,
    timedOut,
    isCanceled,
    isGracefullyCanceled,
    isMaxBuffer,
    isForcefullyTerminated,
    exitCode,
    signal,
    signalDescription,
    stdio,
    all,
    ipcOutput,
    cwd,
    originalMessage,
    shortMessage
  }));
  return error;
};
var getErrorProperties = ({
  error,
  command,
  escapedCommand,
  startTime,
  timedOut,
  isCanceled,
  isGracefullyCanceled,
  isMaxBuffer,
  isForcefullyTerminated,
  exitCode,
  signal,
  signalDescription,
  stdio,
  all,
  ipcOutput,
  cwd,
  originalMessage,
  shortMessage
}) => omitUndefinedProperties({
  shortMessage,
  originalMessage,
  command,
  escapedCommand,
  cwd,
  durationMs: getDurationMs(startTime),
  failed: true,
  timedOut,
  isCanceled,
  isGracefullyCanceled,
  isTerminated: signal !== undefined,
  isMaxBuffer,
  isForcefullyTerminated,
  exitCode,
  signal,
  signalDescription,
  code: error.cause?.code,
  stdout: stdio[1],
  stderr: stdio[2],
  all,
  stdio,
  ipcOutput,
  pipedFrom: []
});
var omitUndefinedProperties = (result) => Object.fromEntries(Object.entries(result).filter(([, value]) => value !== undefined));
var normalizeExitPayload = (rawExitCode, rawSignal) => {
  const exitCode = rawExitCode === null ? undefined : rawExitCode;
  const signal = rawSignal === null ? undefined : rawSignal;
  const signalDescription = signal === undefined ? undefined : getSignalDescription(rawSignal);
  return { exitCode, signal, signalDescription };
};

// node_modules/parse-ms/index.js
var toZeroIfInfinity = (value) => Number.isFinite(value) ? value : 0;
function parseNumber(milliseconds) {
  return {
    days: Math.trunc(milliseconds / 86400000),
    hours: Math.trunc(milliseconds / 3600000 % 24),
    minutes: Math.trunc(milliseconds / 60000 % 60),
    seconds: Math.trunc(milliseconds / 1000 % 60),
    milliseconds: Math.trunc(milliseconds % 1000),
    microseconds: Math.trunc(toZeroIfInfinity(milliseconds * 1000) % 1000),
    nanoseconds: Math.trunc(toZeroIfInfinity(milliseconds * 1e6) % 1000)
  };
}
function parseBigint(milliseconds) {
  return {
    days: milliseconds / 86400000n,
    hours: milliseconds / 3600000n % 24n,
    minutes: milliseconds / 60000n % 60n,
    seconds: milliseconds / 1000n % 60n,
    milliseconds: milliseconds % 1000n,
    microseconds: 0n,
    nanoseconds: 0n
  };
}
function parseMilliseconds(milliseconds) {
  switch (typeof milliseconds) {
    case "number": {
      if (Number.isFinite(milliseconds)) {
        return parseNumber(milliseconds);
      }
      break;
    }
    case "bigint": {
      return parseBigint(milliseconds);
    }
  }
  throw new TypeError("Expected a finite number or bigint");
}

// node_modules/pretty-ms/index.js
var isZero = (value) => value === 0 || value === 0n;
var pluralize = (word, count2) => count2 === 1 || count2 === 1n ? word : `${word}s`;
var SECOND_ROUNDING_EPSILON = 0.0000001;
var ONE_DAY_IN_MILLISECONDS = 24n * 60n * 60n * 1000n;
function prettyMilliseconds(milliseconds, options) {
  const isBigInt = typeof milliseconds === "bigint";
  if (!isBigInt && !Number.isFinite(milliseconds)) {
    throw new TypeError("Expected a finite number or bigint");
  }
  options = { ...options };
  const sign = milliseconds < 0 ? "-" : "";
  milliseconds = milliseconds < 0 ? -milliseconds : milliseconds;
  if (options.colonNotation) {
    options.compact = false;
    options.formatSubMilliseconds = false;
    options.separateMilliseconds = false;
    options.verbose = false;
  }
  if (options.compact) {
    options.unitCount = 1;
    options.secondsDecimalDigits = 0;
    options.millisecondsDecimalDigits = 0;
  }
  let result = [];
  const floorDecimals = (value, decimalDigits) => {
    const flooredInterimValue = Math.floor(value * 10 ** decimalDigits + SECOND_ROUNDING_EPSILON);
    const flooredValue = Math.round(flooredInterimValue) / 10 ** decimalDigits;
    return flooredValue.toFixed(decimalDigits);
  };
  const add = (value, long, short, valueString) => {
    if ((result.length === 0 || !options.colonNotation) && isZero(value) && !(options.colonNotation && short === "m")) {
      return;
    }
    valueString ??= String(value);
    if (options.colonNotation) {
      const wholeDigits = valueString.includes(".") ? valueString.split(".")[0].length : valueString.length;
      const minLength = result.length > 0 ? 2 : 1;
      valueString = "0".repeat(Math.max(0, minLength - wholeDigits)) + valueString;
    } else {
      valueString += options.verbose ? " " + pluralize(long, value) : short;
    }
    result.push(valueString);
  };
  const parsed = parseMilliseconds(milliseconds);
  const days = BigInt(parsed.days);
  if (options.hideYearAndDays) {
    add(BigInt(days) * 24n + BigInt(parsed.hours), "hour", "h");
  } else {
    if (options.hideYear) {
      add(days, "day", "d");
    } else {
      add(days / 365n, "year", "y");
      add(days % 365n, "day", "d");
    }
    add(Number(parsed.hours), "hour", "h");
  }
  add(Number(parsed.minutes), "minute", "m");
  if (!options.hideSeconds) {
    if (options.separateMilliseconds || options.formatSubMilliseconds || !options.colonNotation && milliseconds < 1000 && !options.subSecondsAsDecimals) {
      const seconds = Number(parsed.seconds);
      const milliseconds2 = Number(parsed.milliseconds);
      const microseconds = Number(parsed.microseconds);
      const nanoseconds = Number(parsed.nanoseconds);
      add(seconds, "second", "s");
      if (options.formatSubMilliseconds) {
        add(milliseconds2, "millisecond", "ms");
        add(microseconds, "microsecond", "µs");
        add(nanoseconds, "nanosecond", "ns");
      } else {
        const millisecondsAndBelow = milliseconds2 + microseconds / 1000 + nanoseconds / 1e6;
        const millisecondsDecimalDigits = typeof options.millisecondsDecimalDigits === "number" ? options.millisecondsDecimalDigits : 0;
        const roundedMilliseconds = millisecondsAndBelow >= 1 ? Math.round(millisecondsAndBelow) : Math.ceil(millisecondsAndBelow);
        const millisecondsString = millisecondsDecimalDigits ? millisecondsAndBelow.toFixed(millisecondsDecimalDigits) : roundedMilliseconds;
        add(Number.parseFloat(millisecondsString), "millisecond", "ms", millisecondsString);
      }
    } else {
      const seconds = (isBigInt ? Number(milliseconds % ONE_DAY_IN_MILLISECONDS) : milliseconds) / 1000 % 60;
      const secondsDecimalDigits = typeof options.secondsDecimalDigits === "number" ? options.secondsDecimalDigits : 1;
      const secondsFixed = floorDecimals(seconds, secondsDecimalDigits);
      const secondsString = options.keepDecimalsOnWholeSeconds ? secondsFixed : secondsFixed.replace(/\.0+$/, "");
      add(Number.parseFloat(secondsString), "second", "s", secondsString);
    }
  }
  if (result.length === 0) {
    return sign + "0" + (options.verbose ? " milliseconds" : "ms");
  }
  const separator = options.colonNotation ? ":" : " ";
  if (typeof options.unitCount === "number") {
    result = result.slice(0, Math.max(options.unitCount, 1));
  }
  return sign + result.join(separator);
}

// node_modules/execa/lib/verbose/error.js
var logError = (result, verboseInfo) => {
  if (result.failed) {
    verboseLog({
      type: "error",
      verboseMessage: result.shortMessage,
      verboseInfo,
      result
    });
  }
};

// node_modules/execa/lib/verbose/complete.js
var logResult = (result, verboseInfo) => {
  if (!isVerbose(verboseInfo)) {
    return;
  }
  logError(result, verboseInfo);
  logDuration(result, verboseInfo);
};
var logDuration = (result, verboseInfo) => {
  const verboseMessage = `(done in ${prettyMilliseconds(result.durationMs)})`;
  verboseLog({
    type: "duration",
    verboseMessage,
    verboseInfo,
    result
  });
};

// node_modules/execa/lib/return/reject.js
var handleResult = (result, verboseInfo, { reject }) => {
  logResult(result, verboseInfo);
  if (result.failed && reject) {
    throw result;
  }
  return result;
};

// node_modules/execa/lib/stdio/handle-sync.js
import { readFileSync as readFileSync2 } from "node:fs";

// node_modules/execa/node_modules/is-stream/index.js
function isStream2(stream, { checkOpen = true } = {}) {
  return stream !== null && typeof stream === "object" && (stream.writable || stream.readable || !checkOpen || stream.writable === undefined && stream.readable === undefined) && typeof stream.pipe === "function";
}
function isWritableStream(stream, { checkOpen = true } = {}) {
  return isStream2(stream, { checkOpen }) && (stream.writable || !checkOpen) && typeof stream.write === "function" && typeof stream.end === "function" && typeof stream.writable === "boolean" && typeof stream.writableObjectMode === "boolean" && typeof stream.destroy === "function" && typeof stream.destroyed === "boolean";
}
function isReadableStream2(stream, { checkOpen = true } = {}) {
  return isStream2(stream, { checkOpen }) && (stream.readable || !checkOpen) && typeof stream.read === "function" && typeof stream.readable === "boolean" && typeof stream.readableObjectMode === "boolean" && typeof stream.destroy === "function" && typeof stream.destroyed === "boolean";
}
function isDuplexStream(stream, options) {
  return isWritableStream(stream, options) && isReadableStream2(stream, options);
}

// node_modules/execa/lib/stdio/type.js
var getStdioItemType = (value, optionName) => {
  if (isAsyncGenerator(value)) {
    return "asyncGenerator";
  }
  if (isSyncGenerator(value)) {
    return "generator";
  }
  if (isUrl(value)) {
    return "fileUrl";
  }
  if (isFilePathObject(value)) {
    return "filePath";
  }
  if (isWebStream(value)) {
    return "webStream";
  }
  if (isStream2(value, { checkOpen: false })) {
    return "native";
  }
  if (isUint8Array(value)) {
    return "uint8Array";
  }
  if (isAsyncIterableObject(value)) {
    return "asyncIterable";
  }
  if (isIterableObject(value)) {
    return "iterable";
  }
  if (isTransformStream(value)) {
    return getTransformStreamType({ transform: value }, optionName);
  }
  if (isTransformOptions(value)) {
    return getTransformObjectType(value, optionName);
  }
  return "native";
};
var getTransformObjectType = (value, optionName) => {
  if (isDuplexStream(value.transform, { checkOpen: false })) {
    return getDuplexType(value, optionName);
  }
  if (isTransformStream(value.transform)) {
    return getTransformStreamType(value, optionName);
  }
  return getGeneratorObjectType(value, optionName);
};
var getDuplexType = (value, optionName) => {
  validateNonGeneratorType(value, optionName, "Duplex stream");
  return "duplex";
};
var getTransformStreamType = (value, optionName) => {
  validateNonGeneratorType(value, optionName, "web TransformStream");
  return "webTransform";
};
var validateNonGeneratorType = ({ final, binary, objectMode }, optionName, typeName) => {
  checkUndefinedOption(final, `${optionName}.final`, typeName);
  checkUndefinedOption(binary, `${optionName}.binary`, typeName);
  checkBooleanOption(objectMode, `${optionName}.objectMode`);
};
var checkUndefinedOption = (value, optionName, typeName) => {
  if (value !== undefined) {
    throw new TypeError(`The \`${optionName}\` option can only be defined when using a generator, not a ${typeName}.`);
  }
};
var getGeneratorObjectType = ({ transform, final, binary, objectMode }, optionName) => {
  if (transform !== undefined && !isGenerator(transform)) {
    throw new TypeError(`The \`${optionName}.transform\` option must be a generator, a Duplex stream or a web TransformStream.`);
  }
  if (isDuplexStream(final, { checkOpen: false })) {
    throw new TypeError(`The \`${optionName}.final\` option must not be a Duplex stream.`);
  }
  if (isTransformStream(final)) {
    throw new TypeError(`The \`${optionName}.final\` option must not be a web TransformStream.`);
  }
  if (final !== undefined && !isGenerator(final)) {
    throw new TypeError(`The \`${optionName}.final\` option must be a generator.`);
  }
  checkBooleanOption(binary, `${optionName}.binary`);
  checkBooleanOption(objectMode, `${optionName}.objectMode`);
  return isAsyncGenerator(transform) || isAsyncGenerator(final) ? "asyncGenerator" : "generator";
};
var checkBooleanOption = (value, optionName) => {
  if (value !== undefined && typeof value !== "boolean") {
    throw new TypeError(`The \`${optionName}\` option must use a boolean.`);
  }
};
var isGenerator = (value) => isAsyncGenerator(value) || isSyncGenerator(value);
var isAsyncGenerator = (value) => Object.prototype.toString.call(value) === "[object AsyncGeneratorFunction]";
var isSyncGenerator = (value) => Object.prototype.toString.call(value) === "[object GeneratorFunction]";
var isTransformOptions = (value) => isPlainObject(value) && (value.transform !== undefined || value.final !== undefined);
var isUrl = (value) => Object.prototype.toString.call(value) === "[object URL]";
var isRegularUrl = (value) => isUrl(value) && value.protocol !== "file:";
var isFilePathObject = (value) => isPlainObject(value) && Object.keys(value).length > 0 && Object.keys(value).every((key) => FILE_PATH_KEYS.has(key)) && isFilePathString(value.file);
var FILE_PATH_KEYS = new Set(["file", "append"]);
var isFilePathString = (file) => typeof file === "string";
var isStdioValueObject = (value) => isPlainObject(value) && Object.keys(value).length > 0 && Object.keys(value).every((key) => STDIO_VALUE_KEYS.has(key)) && ("value" in value);
var STDIO_VALUE_KEYS = new Set(["value", "input"]);
var isUnknownStdioString = (type, value) => type === "native" && typeof value === "string" && !KNOWN_STDIO_STRINGS.has(value);
var KNOWN_STDIO_STRINGS = new Set(["ipc", "ignore", "inherit", "overlapped", "pipe"]);
var isReadableStream3 = (value) => Object.prototype.toString.call(value) === "[object ReadableStream]";
var isWritableStream2 = (value) => Object.prototype.toString.call(value) === "[object WritableStream]";
var isWebStream = (value) => isReadableStream3(value) || isWritableStream2(value);
var isTransformStream = (value) => isReadableStream3(value?.readable) && isWritableStream2(value?.writable);
var isAsyncIterableObject = (value) => isObject(value) && typeof value[Symbol.asyncIterator] === "function";
var isIterableObject = (value) => isObject(value) && typeof value[Symbol.iterator] === "function";
var isObject = (value) => typeof value === "object" && value !== null;
var TRANSFORM_TYPES = new Set(["generator", "asyncGenerator", "duplex", "webTransform"]);
var FILE_TYPES = new Set(["fileUrl", "filePath", "fileNumber"]);
var SPECIAL_DUPLICATE_TYPES_SYNC = new Set(["fileUrl", "filePath"]);
var SPECIAL_DUPLICATE_TYPES = new Set([...SPECIAL_DUPLICATE_TYPES_SYNC, "webStream", "nodeStream"]);
var FORBID_DUPLICATE_TYPES = new Set(["webTransform", "duplex"]);
var TYPE_TO_MESSAGE = {
  generator: "a generator",
  asyncGenerator: "an async generator",
  fileUrl: "a file URL",
  filePath: "a file path string",
  fileNumber: "a file descriptor number",
  webStream: "a web stream",
  nodeStream: "a Node.js stream",
  webTransform: "a web TransformStream",
  duplex: "a Duplex stream",
  native: "any value",
  iterable: "an iterable",
  asyncIterable: "an async iterable",
  string: "a string",
  uint8Array: "a Uint8Array"
};

// node_modules/execa/lib/transform/object-mode.js
var getTransformObjectModes = (objectMode, index, newTransforms, direction) => direction === "output" ? getOutputObjectModes(objectMode, index, newTransforms) : getInputObjectModes(objectMode, index, newTransforms);
var getOutputObjectModes = (objectMode, index, newTransforms) => {
  const writableObjectMode = index !== 0 && newTransforms[index - 1].value.readableObjectMode;
  const readableObjectMode = objectMode ?? writableObjectMode;
  return { writableObjectMode, readableObjectMode };
};
var getInputObjectModes = (objectMode, index, newTransforms) => {
  const writableObjectMode = index === 0 ? objectMode === true : newTransforms[index - 1].value.readableObjectMode;
  const readableObjectMode = index !== newTransforms.length - 1 && (objectMode ?? writableObjectMode);
  return { writableObjectMode, readableObjectMode };
};
var getFdObjectMode = (stdioItems, direction) => {
  const lastTransform = stdioItems.findLast(({ type }) => TRANSFORM_TYPES.has(type));
  if (lastTransform === undefined) {
    return false;
  }
  return direction === "input" ? lastTransform.value.writableObjectMode : lastTransform.value.readableObjectMode;
};

// node_modules/execa/lib/transform/normalize.js
var normalizeTransforms = (stdioItems, optionName, direction, options) => [
  ...stdioItems.filter(({ type }) => !TRANSFORM_TYPES.has(type)),
  ...getTransforms(stdioItems, optionName, direction, options)
];
var getTransforms = (stdioItems, optionName, direction, { encoding }) => {
  const transforms = stdioItems.filter(({ type }) => TRANSFORM_TYPES.has(type));
  const newTransforms = Array.from({ length: transforms.length });
  for (const [index, stdioItem] of Object.entries(transforms)) {
    newTransforms[index] = normalizeTransform({
      stdioItem,
      index: Number(index),
      newTransforms,
      optionName,
      direction,
      encoding
    });
  }
  return sortTransforms(newTransforms, direction);
};
var normalizeTransform = ({ stdioItem, stdioItem: { type }, index, newTransforms, optionName, direction, encoding }) => {
  if (type === "duplex") {
    return normalizeDuplex({ stdioItem, optionName });
  }
  if (type === "webTransform") {
    return normalizeTransformStream({
      stdioItem,
      index,
      newTransforms,
      direction
    });
  }
  return normalizeGenerator({
    stdioItem,
    index,
    newTransforms,
    direction,
    encoding
  });
};
var normalizeDuplex = ({ stdioItem, optionName }) => {
  const { value } = stdioItem;
  const { transform } = value;
  const { writableObjectMode, readableObjectMode } = transform;
  const { objectMode = readableObjectMode } = value;
  if (objectMode && !readableObjectMode) {
    throw new TypeError(`The \`${optionName}.objectMode\` option can only be \`true\` if \`new Duplex({objectMode: true})\` is used.`);
  }
  if (!objectMode && readableObjectMode) {
    throw new TypeError(`The \`${optionName}.objectMode\` option cannot be \`false\` if \`new Duplex({objectMode: true})\` is used.`);
  }
  return {
    ...stdioItem,
    value: { transform, writableObjectMode, readableObjectMode }
  };
};
var normalizeTransformStream = ({ stdioItem, stdioItem: { value }, index, newTransforms, direction }) => {
  const { transform, objectMode } = isPlainObject(value) ? value : { transform: value };
  const { writableObjectMode, readableObjectMode } = getTransformObjectModes(objectMode, index, newTransforms, direction);
  return {
    ...stdioItem,
    value: { transform, writableObjectMode, readableObjectMode }
  };
};
var normalizeGenerator = ({ stdioItem, stdioItem: { value }, index, newTransforms, direction, encoding }) => {
  const {
    transform,
    final,
    binary: binaryOption = false,
    preserveNewlines = false,
    objectMode
  } = isPlainObject(value) ? value : { transform: value };
  const binary = binaryOption || BINARY_ENCODINGS.has(encoding);
  const { writableObjectMode, readableObjectMode } = getTransformObjectModes(objectMode, index, newTransforms, direction);
  return {
    ...stdioItem,
    value: {
      transform,
      final,
      binary,
      preserveNewlines,
      writableObjectMode,
      readableObjectMode
    }
  };
};
var sortTransforms = (newTransforms, direction) => direction === "input" ? newTransforms.reverse() : newTransforms;

// node_modules/execa/lib/stdio/direction.js
import process9 from "node:process";
var getStreamDirection = (stdioItems, fdNumber, optionName) => {
  const directions = stdioItems.map((stdioItem) => getStdioItemDirection(stdioItem, fdNumber));
  if (directions.includes("input") && directions.includes("output")) {
    throw new TypeError(`The \`${optionName}\` option must not be an array of both readable and writable values.`);
  }
  return directions.find(Boolean) ?? DEFAULT_DIRECTION;
};
var getStdioItemDirection = (stdioItem, fdNumber) => KNOWN_DIRECTIONS[fdNumber] ?? getRequestedDirection(stdioItem);
var getRequestedDirection = ({ type, value, direction, optionName }) => {
  const guessedDirection = guessStreamDirection[type](value);
  if (direction === "input" && guessedDirection === "output") {
    throw new TypeError(`The \`${optionName}\` option is invalid: \`input: true\` cannot be used with a writable value, which is always an output.`);
  }
  return direction ?? guessedDirection;
};
var KNOWN_DIRECTIONS = ["input", "output", "output"];
var anyDirection = () => {
  return;
};
var alwaysInput = () => "input";
var guessStreamDirection = {
  generator: anyDirection,
  asyncGenerator: anyDirection,
  fileUrl: anyDirection,
  filePath: anyDirection,
  iterable: alwaysInput,
  asyncIterable: alwaysInput,
  uint8Array: alwaysInput,
  webStream: (value) => isWritableStream2(value) ? "output" : "input",
  nodeStream(value) {
    if (!isReadableStream2(value, { checkOpen: false })) {
      return "output";
    }
    return isWritableStream(value, { checkOpen: false }) ? undefined : "input";
  },
  webTransform: anyDirection,
  duplex: anyDirection,
  native(value) {
    const standardStreamDirection = getStandardStreamDirection(value);
    if (standardStreamDirection !== undefined) {
      return standardStreamDirection;
    }
    if (isStream2(value, { checkOpen: false })) {
      return guessStreamDirection.nodeStream(value);
    }
  }
};
var getStandardStreamDirection = (value) => {
  if ([0, process9.stdin].includes(value)) {
    return "input";
  }
  if ([1, 2, process9.stdout, process9.stderr].includes(value)) {
    return "output";
  }
};
var DEFAULT_DIRECTION = "output";

// node_modules/execa/lib/ipc/array.js
var normalizeIpcStdioArray = (stdioArray, ipc) => ipc ? [...stdioArray, "ipc"] : stdioArray;

// node_modules/execa/lib/stdio/stdio-option.js
var normalizeStdioOption = ({ stdio, ipc, buffer, ...options }, verboseInfo, isSync) => {
  const stdioArray = getStdioArray(stdio, options).map((stdioOption, fdNumber) => addDefaultValue2(stdioOption, fdNumber));
  validateIpcStdioOption(stdioArray);
  return isSync ? normalizeStdioSync(stdioArray, buffer, verboseInfo) : normalizeIpcStdioArray(stdioArray, ipc);
};
var validateIpcStdioOption = (stdioArray) => {
  if (stdioArray.some((stdioOption) => hasIpcStdioOption(stdioOption))) {
    throw new Error("The `ipc: true` option must be used instead of `stdio: 'ipc'`.");
  }
};
var hasIpcStdioOption = (stdioOption) => {
  if (Array.isArray(stdioOption)) {
    return stdioOption.some((item) => hasIpcStdioItem(item));
  }
  return hasIpcStdioItem(stdioOption);
};
var hasIpcStdioItem = (stdioOption) => {
  if (isStdioValueObject(stdioOption)) {
    return stdioOption.value === "ipc";
  }
  return stdioOption === "ipc";
};
var getStdioArray = (stdio, options) => {
  if (stdio === undefined) {
    return STANDARD_STREAMS_ALIASES.map((alias) => options[alias]);
  }
  if (hasAlias(options)) {
    throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${STANDARD_STREAMS_ALIASES.map((alias) => `\`${alias}\``).join(", ")}`);
  }
  if (typeof stdio === "string") {
    return [stdio, stdio, stdio];
  }
  if (!Array.isArray(stdio)) {
    throw new TypeError(`Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof stdio}\``);
  }
  const length = Math.max(stdio.length, STANDARD_STREAMS_ALIASES.length);
  return Array.from({ length }, (_2, fdNumber) => stdio[fdNumber]);
};
var hasAlias = (options) => STANDARD_STREAMS_ALIASES.some((alias) => options[alias] !== undefined);
var addDefaultValue2 = (stdioOption, fdNumber) => {
  if (Array.isArray(stdioOption)) {
    return stdioOption.map((item) => addDefaultValue2(item, fdNumber));
  }
  if (stdioOption === null || stdioOption === undefined) {
    return fdNumber >= STANDARD_STREAMS_ALIASES.length ? "ignore" : "pipe";
  }
  return stdioOption;
};
var normalizeStdioSync = (stdioArray, buffer, verboseInfo) => stdioArray.map((stdioOption, fdNumber) => !buffer[fdNumber] && fdNumber !== 0 && !isFullVerbose(verboseInfo, fdNumber) && isOutputPipeOnly(stdioOption, fdNumber) ? "ignore" : stdioOption);
var isOutputPipeOnly = (stdioOption, fdNumber) => isOutputPipe(stdioOption, fdNumber) || Array.isArray(stdioOption) && stdioOption.every((item) => isOutputPipe(item, fdNumber));
var isOutputPipe = (stdioOption, fdNumber) => stdioOption === "pipe" || isOutputPipeObject(stdioOption, fdNumber);
var isOutputPipeObject = (stdioOption, fdNumber) => isStdioValueObject(stdioOption) && stdioOption.value === "pipe" && (stdioOption.input === undefined || stdioOption.input === false || isFixedOutputPipe(fdNumber, stdioOption.input));
var isFixedOutputPipe = (fdNumber, input) => input === true && (fdNumber === 1 || fdNumber === 2);

// node_modules/execa/lib/stdio/native.js
import { readFileSync } from "node:fs";
import tty2 from "node:tty";

// node_modules/execa/lib/arguments/fd-options.js
var getToStream = (destination, to = "stdin") => {
  const isWritable = true;
  const { options, fileDescriptors } = SUBPROCESS_OPTIONS.get(destination);
  const fdNumber = getFdNumber(fileDescriptors, to, isWritable);
  const destinationStream = destination.stdio[fdNumber];
  if (destinationStream === null) {
    throw new TypeError(getInvalidStdioOptionMessage(fdNumber, to, options, isWritable));
  }
  return destinationStream;
};
var getFromStream = (source, from = "stdout") => {
  const isWritable = false;
  const { options, fileDescriptors } = SUBPROCESS_OPTIONS.get(source);
  const fdNumber = getFdNumber(fileDescriptors, from, isWritable);
  const sourceStream = fdNumber === "all" ? source.all : source.stdio[fdNumber];
  if (sourceStream === null || sourceStream === undefined) {
    throw new TypeError(getInvalidStdioOptionMessage(fdNumber, from, options, isWritable));
  }
  return sourceStream;
};
var SUBPROCESS_OPTIONS = new WeakMap;
var getFdNumber = (fileDescriptors, fdName, isWritable) => {
  const fdNumber = parseFdNumber(fdName, isWritable);
  validateFdNumber(fdNumber, fdName, isWritable, fileDescriptors);
  return fdNumber;
};
var parseFdNumber = (fdName, isWritable) => {
  const fdNumber = parseFd(fdName);
  if (fdNumber !== undefined) {
    return fdNumber;
  }
  const { validOptions, defaultValue } = isWritable ? { validOptions: '"stdin"', defaultValue: "stdin" } : { validOptions: '"stdout", "stderr", "all"', defaultValue: "stdout" };
  throw new TypeError(`"${getOptionName(isWritable)}" must not be "${fdName}".
It must be ${validOptions} or "fd3", "fd4" (and so on).
It is optional and defaults to "${defaultValue}".`);
};
var validateFdNumber = (fdNumber, fdName, isWritable, fileDescriptors) => {
  const fileDescriptor = fileDescriptors[getUsedDescriptor(fdNumber)];
  if (fileDescriptor === undefined) {
    throw new TypeError(`"${getOptionName(isWritable)}" must not be ${fdName}. That file descriptor does not exist.
Please set the "stdio" option to ensure that file descriptor exists.`);
  }
  if (fileDescriptor.direction === "input" && !isWritable) {
    throw new TypeError(`"${getOptionName(isWritable)}" must not be ${fdName}. It must be a readable stream, not writable.`);
  }
  if (fileDescriptor.direction !== "input" && isWritable) {
    throw new TypeError(`"${getOptionName(isWritable)}" must not be ${fdName}. It must be a writable stream, not readable.
If you meant to use it as input, please set its "stdio" option to \`{value: 'pipe', input: true}\`.`);
  }
};
var getInvalidStdioOptionMessage = (fdNumber, fdName, options, isWritable) => {
  if (fdNumber === "all" && !options.all) {
    return `The "all" option must be true to use "from: 'all'".`;
  }
  const { optionName, optionValue } = getInvalidStdioOption(fdNumber, options);
  return `The "${optionName}: ${serializeOptionValue(optionValue)}" option is incompatible with using "${getOptionName(isWritable)}: ${serializeOptionValue(fdName)}".
Please set this option with "pipe" instead.`;
};
var getInvalidStdioOption = (fdNumber, { stdin: stdin2, stdout: stdout2, stderr, stdio }) => {
  const usedDescriptor = getUsedDescriptor(fdNumber);
  if (usedDescriptor === 0 && stdin2 !== undefined) {
    return { optionName: "stdin", optionValue: stdin2 };
  }
  if (usedDescriptor === 1 && stdout2 !== undefined) {
    return { optionName: "stdout", optionValue: stdout2 };
  }
  if (usedDescriptor === 2 && stderr !== undefined) {
    return { optionName: "stderr", optionValue: stderr };
  }
  return { optionName: `stdio[${usedDescriptor}]`, optionValue: stdio[usedDescriptor] };
};
var getUsedDescriptor = (fdNumber) => fdNumber === "all" ? 1 : fdNumber;
var getOptionName = (isWritable) => isWritable ? "to" : "from";
var serializeOptionValue = (value) => {
  if (typeof value === "string") {
    return `'${value}'`;
  }
  return typeof value === "number" ? `${value}` : "Stream";
};

// node_modules/execa/lib/stdio/native.js
var handleNativeStream = ({ stdioItem, stdioItem: { type }, isStdioArray, fdNumber, direction, isSync }) => {
  if (!isStdioArray || type !== "native") {
    return stdioItem;
  }
  return isSync ? handleNativeStreamSync({ stdioItem, fdNumber, direction }) : handleNativeStreamAsync({ stdioItem, fdNumber });
};
var handleNativeStreamSync = ({ stdioItem, stdioItem: { value, optionName }, fdNumber, direction }) => {
  const targetFd = getTargetFd({
    value,
    optionName,
    fdNumber,
    direction
  });
  if (targetFd !== undefined) {
    return targetFd;
  }
  if (isStream2(value, { checkOpen: false })) {
    throw new TypeError(`The \`${optionName}: Stream\` option cannot both be an array and include a stream with synchronous methods.`);
  }
  return stdioItem;
};
var getTargetFd = ({ value, optionName, fdNumber, direction }) => {
  const targetFdNumber = getTargetFdNumber(value, fdNumber);
  if (targetFdNumber === undefined) {
    return;
  }
  if (direction === "output") {
    return { type: "fileNumber", value: targetFdNumber, optionName };
  }
  if (tty2.isatty(targetFdNumber)) {
    throw new TypeError(`The \`${optionName}: ${serializeOptionValue(value)}\` option is invalid: it cannot be a TTY with synchronous methods.`);
  }
  return { type: "uint8Array", value: bufferToUint8Array(readFileSync(targetFdNumber)), optionName };
};
var getTargetFdNumber = (value, fdNumber) => {
  if (value === "inherit") {
    return fdNumber;
  }
  if (typeof value === "number") {
    return value;
  }
  const standardStreamIndex = STANDARD_STREAMS.indexOf(value);
  if (standardStreamIndex !== -1) {
    return standardStreamIndex;
  }
};
var handleNativeStreamAsync = ({ stdioItem, stdioItem: { value, optionName }, fdNumber }) => {
  if (value === "inherit") {
    return { type: "nodeStream", value: getStandardStream(fdNumber, value, optionName), optionName };
  }
  if (typeof value === "number") {
    return { type: "nodeStream", value: getStandardStream(value, value, optionName), optionName };
  }
  if (isStream2(value, { checkOpen: false })) {
    return { type: "nodeStream", value, optionName };
  }
  return stdioItem;
};
var getStandardStream = (fdNumber, value, optionName) => {
  const standardStream = STANDARD_STREAMS[fdNumber];
  if (standardStream === undefined) {
    throw new TypeError(`The \`${optionName}: ${value}\` option is invalid: no such standard stream.`);
  }
  return standardStream;
};

// node_modules/execa/lib/stdio/input-option.js
var handleInputOptions = ({ input, inputFile }, fdNumber) => fdNumber === 0 ? [
  ...handleInputOption(input),
  ...handleInputFileOption(inputFile)
] : [];
var handleInputOption = (input) => input === undefined ? [] : [{
  type: getInputType(input),
  value: input,
  optionName: "input"
}];
var getInputType = (input) => {
  if (isReadableStream2(input, { checkOpen: false })) {
    return "nodeStream";
  }
  if (typeof input === "string") {
    return "string";
  }
  if (isUint8Array(input)) {
    return "uint8Array";
  }
  throw new Error("The `input` option must be a string, a Uint8Array or a Node.js Readable stream.");
};
var handleInputFileOption = (inputFile) => inputFile === undefined ? [] : [{
  ...getInputFileType(inputFile),
  optionName: "inputFile"
}];
var getInputFileType = (inputFile) => {
  if (isUrl(inputFile)) {
    return { type: "fileUrl", value: inputFile };
  }
  if (isFilePathString(inputFile)) {
    return { type: "filePath", value: { file: inputFile } };
  }
  throw new Error("The `inputFile` option must be a file path string or a file URL.");
};

// node_modules/execa/lib/stdio/duplicate.js
var filterDuplicates = (stdioItems) => stdioItems.filter((stdioItemOne, indexOne) => stdioItems.every((stdioItemTwo, indexTwo) => !hasSameValueAndDirection(stdioItemOne, stdioItemTwo) || indexOne >= indexTwo || stdioItemOne.type === "generator" || stdioItemOne.type === "asyncGenerator"));
var hasSameValueAndDirection = (stdioItemOne, stdioItemTwo) => stdioItemOne.value === stdioItemTwo.value && stdioItemOne.direction === stdioItemTwo.direction;
var getDuplicateStream = ({ stdioItem: { type, value, optionName }, direction, fileDescriptors, isSync }) => {
  const otherStdioItems = getOtherStdioItems(fileDescriptors, type);
  if (otherStdioItems.length === 0) {
    return;
  }
  if (isSync) {
    validateDuplicateStreamSync({
      otherStdioItems,
      type,
      value,
      optionName,
      direction
    });
    return;
  }
  if (SPECIAL_DUPLICATE_TYPES.has(type)) {
    return getDuplicateStreamInstance({
      otherStdioItems,
      type,
      value,
      optionName,
      direction
    });
  }
  if (FORBID_DUPLICATE_TYPES.has(type)) {
    validateDuplicateTransform({
      otherStdioItems,
      type,
      value,
      optionName
    });
  }
};
var getOtherStdioItems = (fileDescriptors, type) => fileDescriptors.flatMap(({ direction, stdioItems }) => stdioItems.filter((stdioItem) => stdioItem.type === type).map((stdioItem) => ({ ...stdioItem, direction })));
var validateDuplicateStreamSync = ({ otherStdioItems, type, value, optionName, direction }) => {
  if (SPECIAL_DUPLICATE_TYPES_SYNC.has(type)) {
    getDuplicateStreamInstance({
      otherStdioItems,
      type,
      value,
      optionName,
      direction
    });
  }
};
var getDuplicateStreamInstance = ({ otherStdioItems, type, value, optionName, direction }) => {
  const duplicateStdioItems = otherStdioItems.filter((stdioItem) => hasSameValue(stdioItem, value));
  if (duplicateStdioItems.length === 0) {
    return;
  }
  const differentStdioItem = duplicateStdioItems.find((stdioItem) => stdioItem.direction !== direction);
  throwOnDuplicateStream(differentStdioItem, optionName, type);
  return direction === "output" ? duplicateStdioItems[0].stream : undefined;
};
var hasSameValue = ({ type, value }, secondValue) => {
  if (type === "filePath") {
    return value.file === secondValue.file;
  }
  if (type === "fileUrl") {
    return value.href === secondValue.href;
  }
  return value === secondValue;
};
var validateDuplicateTransform = ({ otherStdioItems, type, value, optionName }) => {
  const duplicateStdioItem = otherStdioItems.find(({ value: { transform } }) => transform === value.transform);
  throwOnDuplicateStream(duplicateStdioItem, optionName, type);
};
var throwOnDuplicateStream = (stdioItem, optionName, type) => {
  if (stdioItem !== undefined) {
    throw new TypeError(`The \`${stdioItem.optionName}\` and \`${optionName}\` options must not target ${TYPE_TO_MESSAGE[type]} that is the same.`);
  }
};

// node_modules/execa/lib/stdio/handle.js
var handleStdio = (addProperties, options, verboseInfo, isSync) => {
  const stdio = normalizeStdioOption(options, verboseInfo, isSync);
  const initialFileDescriptors = stdio.map((stdioOption, fdNumber) => getFileDescriptor({
    stdioOption,
    fdNumber,
    options,
    isSync
  }));
  const fileDescriptors = getFinalFileDescriptors({
    initialFileDescriptors,
    addProperties,
    options,
    isSync
  });
  options.stdio = fileDescriptors.map(({ stdioItems }) => forwardStdio(stdioItems));
  return fileDescriptors;
};
var getFileDescriptor = ({ stdioOption, fdNumber, options, isSync }) => {
  const optionName = getStreamName(fdNumber);
  const { stdioItems: initialStdioItems, isStdioArray } = initializeStdioItems({
    stdioOption,
    fdNumber,
    options,
    optionName
  });
  const direction = getStreamDirection(initialStdioItems, fdNumber, optionName);
  const stdioItems = initialStdioItems.map((stdioItem) => handleNativeStream({
    stdioItem,
    isStdioArray,
    fdNumber,
    direction,
    isSync
  }));
  const normalizedStdioItems = normalizeTransforms(stdioItems, optionName, direction, options);
  const objectMode = getFdObjectMode(normalizedStdioItems, direction);
  validateFileObjectMode(normalizedStdioItems, objectMode);
  return { direction, objectMode, stdioItems: normalizedStdioItems };
};
var initializeStdioItems = ({ stdioOption, fdNumber, options, optionName }) => {
  const values = Array.isArray(stdioOption) ? stdioOption : [stdioOption];
  const inputStdioItems = handleInputOptions(options, fdNumber);
  const initialStdioItems = [
    ...omitInheritedStdin(values.map((value) => initializeStdioItem(value, optionName)), inputStdioItems),
    ...inputStdioItems
  ];
  const stdioItems = filterDuplicates(initialStdioItems);
  const isStdioArray = stdioItems.length > 1;
  validateStdioArray(stdioItems, isStdioArray, optionName);
  validateStreams(stdioItems);
  return { stdioItems, isStdioArray };
};
var omitInheritedStdin = (stdioItems, inputStdioItems) => inputStdioItems.length > 0 && isInheritedStdinOnly(stdioItems) ? [] : stdioItems;
var isInheritedStdinOnly = (stdioItems) => stdioItems.length === 1 && stdioItems[0].type === "native" && stdioItems[0].value === "inherit";
var initializeStdioItem = (value, optionName) => {
  if (isStdioValueObject(value)) {
    return initializeStdioValueObject(value, optionName);
  }
  return {
    type: getStdioItemType(value, optionName),
    value,
    optionName
  };
};
var initializeStdioValueObject = ({ value, input }, optionName) => {
  checkBooleanOption(input, `${optionName}.input`);
  return {
    type: getStdioItemType(value, optionName),
    value,
    direction: input ? "input" : undefined,
    optionName
  };
};
var validateStdioArray = (stdioItems, isStdioArray, optionName) => {
  if (stdioItems.length === 0) {
    throw new TypeError(`The \`${optionName}\` option must not be an empty array.`);
  }
  if (!isStdioArray) {
    return;
  }
  for (const { value, optionName: optionName2 } of stdioItems) {
    if (INVALID_STDIO_ARRAY_OPTIONS.has(value)) {
      throw new Error(`The \`${optionName2}\` option must not include \`${value}\`.`);
    }
  }
};
var INVALID_STDIO_ARRAY_OPTIONS = new Set(["ignore"]);
var validateStreams = (stdioItems) => {
  for (const stdioItem of stdioItems) {
    validateFileStdio(stdioItem);
  }
};
var validateFileStdio = ({ type, value, optionName }) => {
  if (isRegularUrl(value)) {
    throw new TypeError(`The \`${optionName}: URL\` option must use the \`file:\` scheme.
For example, you can use the \`pathToFileURL()\` method of the \`url\` core module.`);
  }
  if (isUnknownStdioString(type, value)) {
    throw new TypeError(`The \`${optionName}: { file: '...' }\` option must be used instead of \`${optionName}: '...'\`.`);
  }
};
var validateFileObjectMode = (stdioItems, objectMode) => {
  if (!objectMode) {
    return;
  }
  const fileStdioItem = stdioItems.find(({ type }) => FILE_TYPES.has(type));
  if (fileStdioItem !== undefined) {
    throw new TypeError(`The \`${fileStdioItem.optionName}\` option cannot use both files and transforms in objectMode.`);
  }
};
var getFinalFileDescriptors = ({ initialFileDescriptors, addProperties, options, isSync }) => {
  const fileDescriptors = [];
  try {
    for (const fileDescriptor of initialFileDescriptors) {
      fileDescriptors.push(getFinalFileDescriptor({
        fileDescriptor,
        fileDescriptors,
        addProperties,
        options,
        isSync
      }));
    }
    return fileDescriptors;
  } catch (error) {
    cleanupCustomStreams(fileDescriptors);
    throw error;
  }
};
var getFinalFileDescriptor = ({
  fileDescriptor: { direction, objectMode, stdioItems },
  fileDescriptors,
  addProperties,
  options,
  isSync
}) => {
  const finalStdioItems = stdioItems.map((stdioItem) => addStreamProperties({
    stdioItem,
    addProperties,
    direction,
    options,
    fileDescriptors,
    isSync
  }));
  return { direction, objectMode, stdioItems: finalStdioItems };
};
var addStreamProperties = ({ stdioItem, addProperties, direction, options, fileDescriptors, isSync }) => {
  const duplicateStream = getDuplicateStream({
    stdioItem,
    direction,
    fileDescriptors,
    isSync
  });
  if (duplicateStream !== undefined) {
    return { ...stdioItem, stream: duplicateStream };
  }
  return {
    ...stdioItem,
    ...addProperties[direction][stdioItem.type](stdioItem, options)
  };
};
var cleanupCustomStreams = (fileDescriptors) => {
  for (const { stdioItems } of fileDescriptors) {
    for (const { stream } of stdioItems) {
      if (stream !== undefined && !isStandardStream(stream)) {
        stream.destroy();
      }
    }
  }
};
var forwardStdio = (stdioItems) => {
  if (stdioItems.length > 1) {
    return stdioItems.some(({ value: value2 }) => value2 === "overlapped") ? "overlapped" : "pipe";
  }
  const [{ type, value }] = stdioItems;
  return type === "native" ? value : "pipe";
};

// node_modules/execa/lib/stdio/handle-sync.js
var handleStdioSync = (options, verboseInfo) => handleStdio(addPropertiesSync, options, verboseInfo, true);
var forbiddenIfSync = ({ type, optionName }) => {
  throwInvalidSyncValue(optionName, TYPE_TO_MESSAGE[type]);
};
var forbiddenNativeIfSync = ({ optionName, value }) => {
  if (value === "overlapped") {
    throwInvalidSyncValue(optionName, `"${value}"`);
  }
  return {};
};
var forbiddenNativeInputIfSync = (stdioItem) => {
  const { optionName, value } = stdioItem;
  if (value === "pipe" && optionName !== "stdin") {
    throw new TypeError(`Only the \`stdin\` option, not \`${optionName}\`, can be an input pipe with synchronous methods.`);
  }
  return forbiddenNativeIfSync(stdioItem);
};
var throwInvalidSyncValue = (optionName, value) => {
  throw new TypeError(`The \`${optionName}\` option cannot be ${value} with synchronous methods.`);
};
var addProperties = {
  generator() {},
  asyncGenerator: forbiddenIfSync,
  webStream: forbiddenIfSync,
  nodeStream: forbiddenIfSync,
  webTransform: forbiddenIfSync,
  duplex: forbiddenIfSync,
  asyncIterable: forbiddenIfSync,
  native: forbiddenNativeIfSync
};
var addPropertiesSync = {
  input: {
    ...addProperties,
    native: forbiddenNativeInputIfSync,
    fileUrl: ({ value }) => ({ contents: [bufferToUint8Array(readFileSync2(value))] }),
    filePath: ({ value: { file } }) => ({ contents: [bufferToUint8Array(readFileSync2(file))] }),
    fileNumber: forbiddenIfSync,
    iterable: ({ value }) => ({ contents: [...value] }),
    string: ({ value }) => ({ contents: [value] }),
    uint8Array: ({ value }) => ({ contents: [value] })
  },
  output: {
    ...addProperties,
    fileUrl: ({ value }) => ({ path: value }),
    filePath: ({ value: { file, append } }) => ({ path: file, append }),
    fileNumber: ({ value }) => ({ path: value }),
    iterable: forbiddenIfSync,
    string: forbiddenIfSync,
    uint8Array: forbiddenIfSync
  }
};

// node_modules/execa/lib/io/strip-newline.js
var stripNewline = (value, { stripFinalNewline: stripFinalNewline2 }, fdNumber) => getStripFinalNewline(stripFinalNewline2, fdNumber) && value !== undefined && !Array.isArray(value) ? stripFinalNewline(value) : value;
var getStripFinalNewline = (stripFinalNewline2, fdNumber) => fdNumber === "all" ? stripFinalNewline2[1] || stripFinalNewline2[2] : stripFinalNewline2[fdNumber];

// node_modules/execa/lib/transform/generator.js
import { Transform, getDefaultHighWaterMark } from "node:stream";

// node_modules/execa/lib/transform/split.js
var getSplitLinesGenerator = (binary, preserveNewlines, skipped, state) => binary || skipped ? undefined : initializeSplitLines(preserveNewlines, state);
var splitLinesSync = (chunk, preserveNewlines, objectMode) => objectMode ? chunk.flatMap((item) => splitLinesItemSync(item, preserveNewlines)) : splitLinesItemSync(chunk, preserveNewlines);
var splitLinesItemSync = (chunk, preserveNewlines) => {
  const { transform, final } = initializeSplitLines(preserveNewlines, {});
  return [...transform(chunk), ...final()];
};
var initializeSplitLines = (preserveNewlines, state) => {
  state.previousChunks = "";
  return {
    transform: splitGenerator.bind(undefined, state, preserveNewlines),
    final: linesFinal.bind(undefined, state)
  };
};
var splitGenerator = function* (state, preserveNewlines, chunk) {
  if (typeof chunk !== "string") {
    yield chunk;
    return;
  }
  let { previousChunks } = state;
  let start = -1;
  for (let end = 0;end < chunk.length; end += 1) {
    if (chunk[end] !== `
`) {
      continue;
    }
    const newlineLength = getNewlineLength(chunk, end, preserveNewlines, state);
    let line = chunk.slice(start + 1, end + 1 - newlineLength);
    if (previousChunks.length > 0) {
      line = concatString(previousChunks, line);
      previousChunks = "";
    }
    yield line;
    start = end;
  }
  if (start !== chunk.length - 1) {
    previousChunks = concatString(previousChunks, chunk.slice(start + 1));
  }
  state.previousChunks = previousChunks;
};
var getNewlineLength = (chunk, end, preserveNewlines, state) => {
  if (preserveNewlines) {
    return 0;
  }
  state.isWindowsNewline = end !== 0 && chunk[end - 1] === "\r";
  return state.isWindowsNewline ? 2 : 1;
};
var linesFinal = function* ({ previousChunks }) {
  if (previousChunks.length > 0) {
    yield previousChunks;
  }
};
var getAppendNewlineGenerator = ({ binary, preserveNewlines, readableObjectMode, state }) => binary || preserveNewlines || readableObjectMode ? undefined : { transform: appendNewlineGenerator.bind(undefined, state) };
var appendNewlineGenerator = function* ({ isWindowsNewline = false }, chunk) {
  const { unixNewline, windowsNewline, LF: LF2, concatBytes } = typeof chunk === "string" ? linesStringInfo : linesUint8ArrayInfo;
  if (chunk.at(-1) === LF2) {
    yield chunk;
    return;
  }
  const newline = isWindowsNewline ? windowsNewline : unixNewline;
  yield concatBytes(chunk, newline);
};
var concatString = (firstChunk, secondChunk) => `${firstChunk}${secondChunk}`;
var linesStringInfo = {
  windowsNewline: `\r
`,
  unixNewline: `
`,
  LF: `
`,
  concatBytes: concatString
};
var concatUint8Array = (firstChunk, secondChunk) => {
  const chunk = new Uint8Array(firstChunk.length + secondChunk.length);
  chunk.set(firstChunk, 0);
  chunk.set(secondChunk, firstChunk.length);
  return chunk;
};
var linesUint8ArrayInfo = {
  windowsNewline: new Uint8Array([13, 10]),
  unixNewline: new Uint8Array([10]),
  LF: 10,
  concatBytes: concatUint8Array
};

// node_modules/execa/lib/transform/validate.js
import { Buffer as Buffer2 } from "node:buffer";
var getValidateTransformInput = (writableObjectMode, optionName) => writableObjectMode ? undefined : validateStringTransformInput.bind(undefined, optionName);
var validateStringTransformInput = function* (optionName, chunk) {
  if (typeof chunk !== "string" && !isUint8Array(chunk) && !Buffer2.isBuffer(chunk)) {
    throw new TypeError(`The \`${optionName}\` option's transform must use "objectMode: true" to receive as input: ${typeof chunk}.`);
  }
  yield chunk;
};
var getValidateTransformReturn = (readableObjectMode, optionName) => readableObjectMode ? validateObjectTransformReturn.bind(undefined, optionName) : validateStringTransformReturn.bind(undefined, optionName);
var validateObjectTransformReturn = function* (optionName, chunk) {
  validateEmptyReturn(optionName, chunk);
  yield chunk;
};
var validateStringTransformReturn = function* (optionName, chunk) {
  validateEmptyReturn(optionName, chunk);
  if (typeof chunk !== "string" && !isUint8Array(chunk)) {
    throw new TypeError(`The \`${optionName}\` option's function must yield a string or an Uint8Array, not ${typeof chunk}.`);
  }
  yield chunk;
};
var validateEmptyReturn = (optionName, chunk) => {
  if (chunk === null || chunk === undefined) {
    throw new TypeError(`The \`${optionName}\` option's function must not call \`yield ${chunk}\`.
Instead, \`yield\` should either be called with a value, or not be called at all. For example:
  if (condition) { yield value; }`);
  }
};

// node_modules/execa/lib/transform/encoding-transform.js
import { Buffer as Buffer3 } from "node:buffer";
import { StringDecoder as StringDecoder2 } from "node:string_decoder";
var getEncodingTransformGenerator = (binary, encoding, skipped) => {
  if (skipped) {
    return;
  }
  if (binary) {
    return { transform: encodingUint8ArrayGenerator.bind(undefined, new TextEncoder) };
  }
  const stringDecoder = new StringDecoder2(encoding);
  return {
    transform: encodingStringGenerator.bind(undefined, stringDecoder),
    final: encodingStringFinal.bind(undefined, stringDecoder)
  };
};
var encodingUint8ArrayGenerator = function* (textEncoder3, chunk) {
  if (Buffer3.isBuffer(chunk)) {
    yield bufferToUint8Array(chunk);
  } else if (typeof chunk === "string") {
    yield textEncoder3.encode(chunk);
  } else {
    yield chunk;
  }
};
var encodingStringGenerator = function* (stringDecoder, chunk) {
  yield isUint8Array(chunk) ? stringDecoder.write(chunk) : chunk;
};
var encodingStringFinal = function* (stringDecoder) {
  const lastChunk = stringDecoder.end();
  if (lastChunk !== "") {
    yield lastChunk;
  }
};

// node_modules/execa/lib/transform/run-async.js
import { callbackify } from "node:util";
var pushChunks = callbackify(async (getChunks, state, getChunksArguments, transformStream) => {
  state.currentIterable = getChunks(...getChunksArguments);
  try {
    for await (const chunk of state.currentIterable) {
      transformStream.push(chunk);
    }
  } finally {
    delete state.currentIterable;
  }
});
var transformChunk = async function* (chunk, generators, index) {
  if (index === generators.length) {
    yield chunk;
    return;
  }
  const { transform = identityGenerator } = generators[index];
  for await (const transformedChunk of transform(chunk)) {
    yield* transformChunk(transformedChunk, generators, index + 1);
  }
};
var finalChunks = async function* (generators) {
  for (const [index, { final }] of Object.entries(generators)) {
    yield* generatorFinalChunks(final, Number(index), generators);
  }
};
var generatorFinalChunks = async function* (final, index, generators) {
  if (final === undefined) {
    return;
  }
  for await (const finalChunk of final()) {
    yield* transformChunk(finalChunk, generators, index + 1);
  }
};
var destroyTransform = callbackify(async ({ currentIterable }, error) => {
  if (currentIterable !== undefined) {
    await (error ? currentIterable.throw(error) : currentIterable.return());
    return;
  }
  if (error) {
    throw error;
  }
});
var identityGenerator = function* (chunk) {
  yield chunk;
};

// node_modules/execa/lib/transform/run-sync.js
var pushChunksSync = (getChunksSync, getChunksArguments, transformStream, done) => {
  try {
    for (const chunk of getChunksSync(...getChunksArguments)) {
      transformStream.push(chunk);
    }
    done();
  } catch (error) {
    done(error);
  }
};
var runTransformSync = (generators, chunks) => [
  ...chunks.flatMap((chunk) => [...transformChunkSync(chunk, generators, 0)]),
  ...finalChunksSync(generators)
];
var transformChunkSync = function* (chunk, generators, index) {
  if (index === generators.length) {
    yield chunk;
    return;
  }
  const { transform = identityGenerator2 } = generators[index];
  for (const transformedChunk of transform(chunk)) {
    yield* transformChunkSync(transformedChunk, generators, index + 1);
  }
};
var finalChunksSync = function* (generators) {
  for (const [index, { final }] of Object.entries(generators)) {
    yield* generatorFinalChunksSync(final, Number(index), generators);
  }
};
var generatorFinalChunksSync = function* (final, index, generators) {
  if (final === undefined) {
    return;
  }
  for (const finalChunk of final()) {
    yield* transformChunkSync(finalChunk, generators, index + 1);
  }
};
var identityGenerator2 = function* (chunk) {
  yield chunk;
};

// node_modules/execa/lib/transform/generator.js
var generatorToStream = ({
  value,
  value: { transform, final, writableObjectMode, readableObjectMode },
  optionName
}, { encoding }) => {
  const state = {};
  const generators = addInternalGenerators(value, encoding, optionName);
  const transformAsync = isAsyncGenerator(transform);
  const finalAsync = isAsyncGenerator(final);
  const transformMethod = transformAsync ? pushChunks.bind(undefined, transformChunk, state) : pushChunksSync.bind(undefined, transformChunkSync);
  const finalMethod = transformAsync || finalAsync ? pushChunks.bind(undefined, finalChunks, state) : pushChunksSync.bind(undefined, finalChunksSync);
  const destroyMethod = transformAsync || finalAsync ? destroyTransform.bind(undefined, state) : undefined;
  const stream = new Transform({
    writableObjectMode,
    writableHighWaterMark: getDefaultHighWaterMark(writableObjectMode),
    readableObjectMode,
    readableHighWaterMark: getDefaultHighWaterMark(readableObjectMode),
    transform(chunk, encoding2, done) {
      transformMethod([chunk, generators, 0], this, done);
    },
    flush(done) {
      finalMethod([generators], this, done);
    },
    destroy: destroyMethod
  });
  return { stream };
};
var runGeneratorsSync = (chunks, stdioItems, encoding, isInput) => {
  const generators = stdioItems.filter(({ type }) => type === "generator");
  const reversedGenerators = isInput ? generators.reverse() : generators;
  for (const { value, optionName } of reversedGenerators) {
    const generators2 = addInternalGenerators(value, encoding, optionName);
    chunks = runTransformSync(generators2, chunks);
  }
  return chunks;
};
var addInternalGenerators = ({ transform, final, binary, writableObjectMode, readableObjectMode, preserveNewlines }, encoding, optionName) => {
  const state = {};
  return [
    { transform: getValidateTransformInput(writableObjectMode, optionName) },
    getEncodingTransformGenerator(binary, encoding, writableObjectMode),
    getSplitLinesGenerator(binary, preserveNewlines, writableObjectMode, state),
    { transform, final },
    { transform: getValidateTransformReturn(readableObjectMode, optionName) },
    getAppendNewlineGenerator({
      binary,
      preserveNewlines,
      readableObjectMode,
      state
    })
  ].filter(Boolean);
};

// node_modules/execa/lib/io/input-sync.js
var addInputOptionsSync = (fileDescriptors, options) => {
  for (const fdNumber of getInputFdNumbers(fileDescriptors)) {
    addInputOptionSync(fileDescriptors, fdNumber, options);
  }
};
var getInputFdNumbers = (fileDescriptors) => new Set(Object.entries(fileDescriptors).filter(([, { direction }]) => direction === "input").map(([fdNumber]) => Number(fdNumber)));
var addInputOptionSync = (fileDescriptors, fdNumber, options) => {
  const { stdioItems } = fileDescriptors[fdNumber];
  const allStdioItems = stdioItems.filter(({ contents }) => contents !== undefined);
  if (allStdioItems.length === 0) {
    return;
  }
  if (fdNumber !== 0) {
    const [{ type, optionName }] = allStdioItems;
    throw new TypeError(`Only the \`stdin\` option, not \`${optionName}\`, can be ${TYPE_TO_MESSAGE[type]} with synchronous methods.`);
  }
  const allContents = allStdioItems.map(({ contents }) => contents);
  const transformedContents = allContents.map((contents) => applySingleInputGeneratorsSync(contents, stdioItems));
  options.input = joinToUint8Array(transformedContents);
};
var applySingleInputGeneratorsSync = (contents, stdioItems) => {
  const newContents = runGeneratorsSync(contents, stdioItems, "utf8", true);
  validateSerializable(newContents);
  return joinToUint8Array(newContents);
};
var validateSerializable = (newContents) => {
  const invalidItem = newContents.find((item) => typeof item !== "string" && !isUint8Array(item));
  if (invalidItem !== undefined) {
    throw new TypeError(`The \`stdin\` option is invalid: when passing objects as input, a transform must be used to serialize them to strings or Uint8Arrays: ${invalidItem}.`);
  }
};

// node_modules/execa/lib/io/output-sync.js
import { writeFileSync, appendFileSync } from "node:fs";

// node_modules/execa/lib/verbose/output.js
var shouldLogOutput = ({ stdioItems, encoding, verboseInfo, fdNumber }) => fdNumber !== "all" && isFullVerbose(verboseInfo, fdNumber) && !BINARY_ENCODINGS.has(encoding) && isFdVerbose(fdNumber) && (stdioItems.some(({ type, value }) => type === "native" && PIPED_STDIO_VALUES.has(value)) || stdioItems.every(({ type }) => TRANSFORM_TYPES.has(type)));
var isFdVerbose = (fdNumber) => fdNumber === 1 || fdNumber === 2;
var PIPED_STDIO_VALUES = new Set(["pipe", "overlapped"]);
var logLines = async (linesIterable, stream, fdNumber, verboseInfo) => {
  for await (const line of linesIterable) {
    if (!isPipingStream(stream)) {
      logLine(line, fdNumber, verboseInfo);
    }
  }
};
var logLinesSync = (linesArray, fdNumber, verboseInfo) => {
  for (const line of linesArray) {
    logLine(line, fdNumber, verboseInfo);
  }
};
var isPipingStream = (stream) => stream._readableState.pipes.length > 0;
var logLine = (line, fdNumber, verboseInfo) => {
  const verboseMessage = serializeVerboseMessage(line);
  verboseLog({
    type: "output",
    verboseMessage,
    fdNumber,
    verboseInfo
  });
};

// node_modules/execa/lib/io/output-sync.js
var transformOutputSync = ({ fileDescriptors, syncResult: { output }, options, isMaxBuffer, verboseInfo }) => {
  if (output === null) {
    return { output: Array.from({ length: 3 }) };
  }
  const state = {};
  const outputFiles = new Set;
  const transformedOutput = output.map((result, fdNumber) => transformOutputResultSync({
    result,
    fileDescriptors,
    fdNumber,
    state,
    outputFiles,
    isMaxBuffer,
    verboseInfo
  }, options));
  return { output: transformedOutput, ...state };
};
var transformOutputResultSync = ({ result, fileDescriptors, fdNumber, state, outputFiles, isMaxBuffer, verboseInfo }, { buffer, encoding, lines, stripFinalNewline: stripFinalNewline2, maxBuffer }) => {
  if (result === null) {
    return;
  }
  const truncatedResult = truncateMaxBufferSync(result, isMaxBuffer, maxBuffer);
  const uint8ArrayResult = bufferToUint8Array(truncatedResult);
  const { stdioItems, objectMode } = fileDescriptors[fdNumber];
  const chunks = runOutputGeneratorsSync([uint8ArrayResult], stdioItems, encoding, state);
  const { serializedResult, finalResult = serializedResult } = serializeChunks({
    chunks,
    objectMode,
    encoding,
    lines,
    stripFinalNewline: stripFinalNewline2,
    fdNumber
  });
  logOutputSync({
    serializedResult,
    fdNumber,
    state,
    verboseInfo,
    encoding,
    stdioItems,
    objectMode
  });
  const returnedResult = buffer[fdNumber] ? finalResult : undefined;
  try {
    if (state.error === undefined) {
      writeToFiles(serializedResult, stdioItems, outputFiles);
    }
    return returnedResult;
  } catch (error) {
    state.error = error;
    return returnedResult;
  }
};
var runOutputGeneratorsSync = (chunks, stdioItems, encoding, state) => {
  try {
    return runGeneratorsSync(chunks, stdioItems, encoding, false);
  } catch (error) {
    state.error = error;
    return chunks;
  }
};
var serializeChunks = ({ chunks, objectMode, encoding, lines, stripFinalNewline: stripFinalNewline2, fdNumber }) => {
  if (objectMode) {
    return { serializedResult: chunks };
  }
  if (encoding === "buffer") {
    return { serializedResult: joinToUint8Array(chunks) };
  }
  const serializedResult = joinToString(chunks, encoding);
  if (lines[fdNumber]) {
    return { serializedResult, finalResult: splitLinesSync(serializedResult, !stripFinalNewline2[fdNumber], objectMode) };
  }
  return { serializedResult };
};
var logOutputSync = ({ serializedResult, fdNumber, state, verboseInfo, encoding, stdioItems, objectMode }) => {
  if (!shouldLogOutput({
    stdioItems,
    encoding,
    verboseInfo,
    fdNumber
  })) {
    return;
  }
  const linesArray = splitLinesSync(serializedResult, false, objectMode);
  try {
    logLinesSync(linesArray, fdNumber, verboseInfo);
  } catch (error) {
    state.error ??= error;
  }
};
var writeToFiles = (serializedResult, stdioItems, outputFiles) => {
  const fileItems = stdioItems.filter(({ type }) => FILE_TYPES.has(type));
  for (const { path: path9, append } of fileItems) {
    const pathString = typeof path9 === "string" ? path9 : path9.toString();
    if (append || outputFiles.has(pathString)) {
      appendFileSync(path9, serializedResult);
    } else {
      outputFiles.add(pathString);
      writeFileSync(path9, serializedResult);
    }
  }
};

// node_modules/execa/lib/resolve/all-sync.js
var getAllSync = ([, stdout2, stderr], options) => {
  if (!options.all) {
    return;
  }
  if (stdout2 === undefined) {
    return stderr;
  }
  if (stderr === undefined) {
    return stdout2;
  }
  if (Array.isArray(stdout2)) {
    return Array.isArray(stderr) ? [...stdout2, ...stderr] : [...stdout2, stripNewline(stderr, options, "all")];
  }
  if (Array.isArray(stderr)) {
    return [stripNewline(stdout2, options, "all"), ...stderr];
  }
  if (isUint8Array(stdout2) && isUint8Array(stderr)) {
    return concatUint8Arrays([stdout2, stderr]);
  }
  return `${stdout2}${stderr}`;
};

// node_modules/execa/lib/resolve/exit-async.js
import { once as once4 } from "node:events";
var waitForExit = async (subprocess, context) => {
  const [exitCode, signal] = await waitForExitOrError(subprocess);
  context.isForcefullyTerminated ??= false;
  return [exitCode, signal];
};
var waitForExitOrError = async (subprocess) => {
  const [spawnPayload, exitPayload] = await Promise.allSettled([
    once4(subprocess, "spawn"),
    once4(subprocess, "exit")
  ]);
  if (spawnPayload.status === "rejected") {
    return [];
  }
  return exitPayload.status === "rejected" ? waitForSubprocessExit(subprocess) : exitPayload.value;
};
var waitForSubprocessExit = async (subprocess) => {
  try {
    return await once4(subprocess, "exit");
  } catch {
    return waitForSubprocessExit(subprocess);
  }
};
var waitForSuccessfulExit = async (exitPromise) => {
  const [exitCode, signal] = await exitPromise;
  if (!isSubprocessErrorExit(exitCode, signal) && isFailedExit(exitCode, signal)) {
    throw new DiscardedError;
  }
  return [exitCode, signal];
};
var isSubprocessErrorExit = (exitCode, signal) => exitCode === undefined && signal === undefined;
var isFailedExit = (exitCode, signal) => exitCode !== 0 || signal !== null;

// node_modules/execa/lib/resolve/exit-sync.js
var getExitResultSync = ({ error, status: exitCode, signal, output }, { maxBuffer }) => {
  const resultError = getResultError(error, exitCode, signal);
  const isTimedOut = resultError?.code === "ETIMEDOUT";
  const isMaxBuffer = isMaxBufferSync(resultError, output, maxBuffer);
  return {
    resultError,
    exitCode,
    signal,
    timedOut: isTimedOut,
    isMaxBuffer
  };
};
var getResultError = (error, exitCode, signal) => {
  if (error !== undefined) {
    return error;
  }
  return isFailedExit(exitCode, signal) ? new DiscardedError : undefined;
};

// node_modules/execa/lib/methods/main-sync.js
var execaCoreSync = (rawFile, rawArguments, rawOptions) => {
  const { file, commandArguments, command, escapedCommand, startTime, verboseInfo, options, fileDescriptors } = handleSyncArguments(rawFile, rawArguments, rawOptions);
  const result = spawnSubprocessSync({
    file,
    commandArguments,
    options,
    command,
    escapedCommand,
    verboseInfo,
    fileDescriptors,
    startTime
  });
  return handleResult(result, verboseInfo, options);
};
var handleSyncArguments = (rawFile, rawArguments, rawOptions) => {
  const { command, escapedCommand, startTime, verboseInfo } = handleCommand(rawFile, rawArguments, rawOptions);
  const syncOptions = normalizeSyncOptions(rawOptions);
  const { file, commandArguments, options } = normalizeOptions(rawFile, rawArguments, syncOptions);
  validateSyncOptions(options);
  const fileDescriptors = handleStdioSync(options, verboseInfo);
  return {
    file,
    commandArguments,
    command,
    escapedCommand,
    startTime,
    verboseInfo,
    options,
    fileDescriptors
  };
};
var normalizeSyncOptions = (options) => options.node && !options.ipc ? { ...options, ipc: false } : options;
var validateSyncOptions = ({ ipc, ipcInput, detached, cancelSignal, killDescendants }) => {
  if (ipcInput) {
    throwInvalidSyncOption("ipcInput");
  }
  if (ipc) {
    throwInvalidSyncOption("ipc: true");
  }
  if (detached) {
    throwInvalidSyncOption("detached: true");
  }
  if (killDescendants) {
    throwInvalidSyncOption("killDescendants: true");
  }
  if (cancelSignal) {
    throwInvalidSyncOption("cancelSignal");
  }
};
var throwInvalidSyncOption = (value) => {
  throw new TypeError(`The "${value}" option cannot be used with synchronous methods.`);
};
var spawnSubprocessSync = ({ file, commandArguments, options, command, escapedCommand, verboseInfo, fileDescriptors, startTime }) => {
  const syncResult = runSubprocessSync({
    file,
    commandArguments,
    options,
    command,
    escapedCommand,
    fileDescriptors,
    startTime
  });
  if (syncResult.failed) {
    return syncResult;
  }
  const { resultError, exitCode, signal, timedOut, isMaxBuffer } = getExitResultSync(syncResult, options);
  const { output, error = resultError } = transformOutputSync({
    fileDescriptors,
    syncResult,
    options,
    isMaxBuffer,
    verboseInfo
  });
  const stdio = output.map((stdioOutput, fdNumber) => stripNewline(stdioOutput, options, fdNumber));
  const all = stripNewline(getAllSync(output, options), options, "all");
  return getSyncResult({
    error,
    exitCode,
    signal,
    timedOut,
    isMaxBuffer,
    stdio,
    all,
    options,
    command,
    escapedCommand,
    startTime
  });
};
var runSubprocessSync = ({ file, commandArguments, options, command, escapedCommand, fileDescriptors, startTime }) => {
  try {
    addInputOptionsSync(fileDescriptors, options);
    const normalizedOptions = normalizeSpawnSyncOptions(options);
    return spawnSync(...concatenateShell(file, commandArguments, normalizedOptions));
  } catch (error) {
    return makeEarlyError({
      error,
      command,
      escapedCommand,
      fileDescriptors,
      options,
      startTime,
      isSync: true
    });
  }
};
var normalizeSpawnSyncOptions = ({ encoding, maxBuffer, ...options }) => ({ ...options, encoding: "buffer", maxBuffer: getMaxBufferSync(maxBuffer) });
var getSyncResult = ({ error, exitCode, signal, timedOut, isMaxBuffer, stdio, all, options, command, escapedCommand, startTime }) => error === undefined ? makeSuccessResult({
  command,
  escapedCommand,
  stdio,
  all,
  ipcOutput: [],
  options,
  startTime
}) : makeError({
  error,
  command,
  escapedCommand,
  timedOut,
  isCanceled: false,
  isGracefullyCanceled: false,
  isMaxBuffer,
  isForcefullyTerminated: false,
  exitCode,
  signal,
  stdio,
  all,
  ipcOutput: [],
  options,
  startTime,
  isSync: true
});

// node_modules/execa/lib/methods/main-async.js
import { setMaxListeners } from "node:events";
import { spawn } from "node:child_process";

// node_modules/execa/lib/ipc/methods.js
import process10 from "node:process";

// node_modules/execa/lib/ipc/get-one.js
import { once as once5, on as on2 } from "node:events";
var internalGetOneMessageOptions = Symbol("internalGetOneMessageOptions");
var getOneMessage = ({ anyProcess, channel, isSubprocess, ipc }, options = {}) => {
  const { reference = true, filter } = options;
  const { signal } = options[internalGetOneMessageOptions] ?? {};
  validateIpcMethod({
    methodName: "getOneMessage",
    isSubprocess,
    ipc,
    isConnected: isConnected(anyProcess)
  });
  return getOneMessageAsync({
    anyProcess,
    channel,
    isSubprocess,
    filter,
    reference,
    signal
  });
};
var getOneMessageAsync = async ({ anyProcess, channel, isSubprocess, filter, reference, signal }) => {
  addReference(channel, reference);
  const ipcEmitter = getIpcEmitter(anyProcess, channel, isSubprocess);
  const controller = new AbortController;
  stopOnAbort(signal, controller);
  try {
    return await Promise.race([
      getMessage(ipcEmitter, filter, controller),
      throwOnDisconnect2(ipcEmitter, isSubprocess, controller),
      throwOnStrictError(ipcEmitter, isSubprocess, controller)
    ]);
  } catch (error) {
    disconnect(anyProcess);
    throw error;
  } finally {
    controller.abort();
    removeReference(channel, reference);
  }
};
var stopOnAbort = (signal, controller) => {
  if (signal === undefined) {
    return;
  }
  if (signal.aborted) {
    controller.abort();
    return;
  }
  signal.addEventListener("abort", () => {
    controller.abort();
  }, { once: true, signal: controller.signal });
};
var getMessage = async (ipcEmitter, filter, { signal }) => {
  if (filter === undefined) {
    const [message] = await once5(ipcEmitter, "message", { signal });
    return message;
  }
  for await (const [message] of on2(ipcEmitter, "message", { signal })) {
    if (filter(message)) {
      return message;
    }
  }
};
var throwOnDisconnect2 = async (ipcEmitter, isSubprocess, { signal }) => {
  await once5(ipcEmitter, "disconnect", { signal });
  throwOnEarlyDisconnect(isSubprocess);
};
var throwOnStrictError = async (ipcEmitter, isSubprocess, { signal }) => {
  const [error] = await once5(ipcEmitter, "strict:error", { signal });
  throw getStrictResponseError(error, isSubprocess);
};

// node_modules/execa/lib/ipc/get-each.js
import { once as once6, on as on3 } from "node:events";
var internalGetEachMessageOptions = Symbol("internalGetEachMessageOptions");
var getEachMessage = (subprocessInfo, options = {}) => {
  const { reference = true } = options;
  const { signal, shouldAwait = !subprocessInfo.isSubprocess } = options[internalGetEachMessageOptions] ?? {};
  return loopOnMessages({
    ...subprocessInfo,
    shouldAwait,
    reference,
    signal
  });
};
var loopOnMessages = ({ anyProcess, waitProcess = anyProcess, channel, isSubprocess, ipc, shouldAwait, reference, signal }) => {
  validateIpcMethod({
    methodName: "getEachMessage",
    isSubprocess,
    ipc,
    isConnected: isConnected(anyProcess)
  });
  addReference(channel, reference);
  const ipcEmitter = getIpcEmitter(anyProcess, channel, isSubprocess);
  const controller = new AbortController;
  const state = {};
  stopOnAbort2(signal, controller);
  stopOnDisconnect(anyProcess, ipcEmitter, controller);
  abortOnStrictError({
    ipcEmitter,
    isSubprocess,
    controller,
    state
  });
  return iterateOnMessages({
    anyProcess,
    waitProcess,
    channel,
    ipcEmitter,
    isSubprocess,
    shouldAwait,
    controller,
    state,
    reference
  });
};
var stopOnAbort2 = (signal, controller) => {
  if (signal === undefined) {
    return;
  }
  if (signal.aborted) {
    controller.abort();
    return;
  }
  signal.addEventListener("abort", () => {
    controller.abort();
  }, { once: true, signal: controller.signal });
};
var stopOnDisconnect = async (anyProcess, ipcEmitter, controller) => {
  try {
    await once6(ipcEmitter, "disconnect", { signal: controller.signal });
    controller.abort();
  } catch {}
};
var abortOnStrictError = async ({ ipcEmitter, isSubprocess, controller, state }) => {
  try {
    const [error] = await once6(ipcEmitter, "strict:error", { signal: controller.signal });
    state.error = getStrictResponseError(error, isSubprocess);
    controller.abort();
  } catch {}
};
var iterateOnMessages = async function* ({ anyProcess, waitProcess, channel, ipcEmitter, isSubprocess, shouldAwait, controller, state, reference }) {
  try {
    for await (const [message] of on3(ipcEmitter, "message", { signal: controller.signal })) {
      throwIfStrictError(state);
      yield message;
    }
  } catch {
    throwIfStrictError(state);
  } finally {
    controller.abort();
    removeReference(channel, reference);
    if (!isSubprocess) {
      disconnect(anyProcess);
    }
    if (shouldAwait) {
      await waitProcess;
    }
  }
};
var throwIfStrictError = ({ error }) => {
  if (error) {
    throw error;
  }
};

// node_modules/execa/lib/ipc/methods.js
var addIpcMethods = (target, subprocess, { ipc }) => {
  Object.assign(target, getIpcMethods(subprocess, false, ipc, target));
};
var getIpcExport = () => {
  const anyProcess = process10;
  const isSubprocess = true;
  const isIpc = process10.channel !== undefined;
  return {
    ...getIpcMethods(anyProcess, isSubprocess, isIpc),
    getCancelSignal: getCancelSignal.bind(undefined, {
      anyProcess,
      channel: anyProcess.channel,
      isSubprocess,
      ipc: isIpc
    })
  };
};
var getIpcMethods = (anyProcess, isSubprocess, ipc, waitProcess = anyProcess) => ({
  sendMessage: sendMessage.bind(undefined, {
    anyProcess,
    channel: anyProcess.channel,
    isSubprocess,
    ipc
  }),
  getOneMessage: getOneMessage.bind(undefined, {
    anyProcess,
    channel: anyProcess.channel,
    isSubprocess,
    ipc
  }),
  getEachMessage: getEachMessage.bind(undefined, {
    anyProcess,
    channel: anyProcess.channel,
    isSubprocess,
    ipc,
    waitProcess
  })
});

// node_modules/execa/lib/return/early-error.js
import { ChildProcess as ChildProcess2 } from "node:child_process";
import {
  PassThrough,
  Readable,
  Writable,
  Duplex
} from "node:stream";
var handleEarlyError = ({ error, command, escapedCommand, fileDescriptors, options, startTime, verboseInfo }) => {
  cleanupCustomStreams(fileDescriptors);
  const subprocess = new ChildProcess2;
  const all = createDummyStreams(subprocess, fileDescriptors);
  const earlyError = makeEarlyError({
    error,
    command,
    escapedCommand,
    fileDescriptors,
    options,
    startTime,
    isSync: false
  });
  const promise = handleDummyPromise(earlyError, verboseInfo, options);
  return {
    subprocess,
    promise,
    all: options.all ? all : undefined,
    convertedStreams: {
      readable,
      writable,
      duplex,
      readableStream,
      writableStream,
      transformStream,
      iterable,
      [Symbol.asyncIterator]: iterable
    }
  };
};
var createDummyStreams = (subprocess, fileDescriptors) => {
  const stdin2 = createDummyStream();
  const stdout2 = createDummyStream();
  const stderr = createDummyStream();
  const extraStdio = Array.from({ length: fileDescriptors.length - 3 }, createDummyStream);
  const all = createDummyStream();
  const stdio = [stdin2, stdout2, stderr, ...extraStdio];
  Object.assign(subprocess, {
    stdin: stdin2,
    stdout: stdout2,
    stderr,
    stdio
  });
  return all;
};
var createDummyStream = () => {
  const stream = new PassThrough;
  stream.end();
  return stream;
};
var readable = () => new Readable({ read() {} });
var writable = () => new Writable({ write() {} });
var duplex = () => new Duplex({ read() {}, write() {} });
var readableStream = () => Readable.toWeb(readable());
var writableStream = () => Writable.toWeb(writable());
var transformStream = () => Duplex.toWeb(duplex());
var iterable = async function* () {};
var handleDummyPromise = async (error, verboseInfo, options) => handleResult(error, verboseInfo, options);

// node_modules/execa/lib/stdio/handle-async.js
import { createReadStream, createWriteStream } from "node:fs";
import { Buffer as Buffer4 } from "node:buffer";
import { Readable as Readable2, Writable as Writable2, Duplex as Duplex2 } from "node:stream";
var handleStdioAsync = (options, verboseInfo) => handleStdio(addPropertiesAsync, options, verboseInfo, false);
var forbiddenIfAsync = ({ type, optionName }) => {
  throw new TypeError(`The \`${optionName}\` option cannot be ${TYPE_TO_MESSAGE[type]}.`);
};
var addProperties2 = {
  fileNumber: forbiddenIfAsync,
  generator: generatorToStream,
  asyncGenerator: generatorToStream,
  nodeStream: ({ value }) => ({ stream: value }),
  webTransform({ value: { transform, writableObjectMode, readableObjectMode } }) {
    const objectMode = writableObjectMode || readableObjectMode;
    const stream = Duplex2.fromWeb(transform, { objectMode });
    return { stream };
  },
  duplex: ({ value: { transform } }) => ({ stream: transform }),
  native() {}
};
var addPropertiesAsync = {
  input: {
    ...addProperties2,
    fileUrl: ({ value }) => ({ stream: createReadStream(value) }),
    filePath: ({ value: { file } }) => ({ stream: createReadStream(file) }),
    webStream: ({ value }) => ({ stream: Readable2.fromWeb(value) }),
    iterable: ({ value }) => ({ stream: Readable2.from(value) }),
    asyncIterable: ({ value }) => ({ stream: Readable2.from(value) }),
    string: ({ value }) => ({ stream: Readable2.from(value) }),
    uint8Array: ({ value }) => ({ stream: Readable2.from(Buffer4.from(value)) })
  },
  output: {
    ...addProperties2,
    fileUrl: ({ value }) => ({ stream: createWriteStream(value) }),
    filePath: ({ value: { file, append } }) => ({ stream: createWriteStream(file, append ? { flags: "a" } : {}) }),
    webStream: ({ value }) => ({ stream: Writable2.fromWeb(value) }),
    iterable: forbiddenIfAsync,
    asyncIterable: forbiddenIfAsync,
    string: forbiddenIfAsync,
    uint8Array: forbiddenIfAsync
  }
};

// node_modules/@sindresorhus/merge-streams/index.js
import { on as on4, once as once7 } from "node:events";
import { PassThrough as PassThroughStream, getDefaultHighWaterMark as getDefaultHighWaterMark2 } from "node:stream";
import { finished as finished2 } from "node:stream/promises";
function mergeStreams(streams) {
  if (!Array.isArray(streams)) {
    throw new TypeError(`Expected an array, got \`${typeof streams}\`.`);
  }
  for (const stream of streams) {
    validateStream(stream);
  }
  const objectMode = streams.some(({ readableObjectMode }) => readableObjectMode);
  const highWaterMark = getHighWaterMark(streams, objectMode);
  const passThroughStream = new MergedStream({
    objectMode,
    writableHighWaterMark: highWaterMark,
    readableHighWaterMark: highWaterMark
  });
  for (const stream of streams) {
    passThroughStream.add(stream);
  }
  return passThroughStream;
}
var getHighWaterMark = (streams, objectMode) => {
  if (streams.length === 0) {
    return getDefaultHighWaterMark2(objectMode);
  }
  const highWaterMarks = streams.filter(({ readableObjectMode }) => readableObjectMode === objectMode).map(({ readableHighWaterMark }) => readableHighWaterMark);
  return Math.max(...highWaterMarks);
};

class MergedStream extends PassThroughStream {
  #streams = new Set([]);
  #ended = new Set([]);
  #aborted = new Set([]);
  #onFinished;
  #unpipeEvent = Symbol("unpipe");
  #streamPromises = new WeakMap;
  add(stream) {
    validateStream(stream);
    if (this.#streams.has(stream)) {
      return;
    }
    this.#streams.add(stream);
    this.#onFinished ??= onMergedStreamFinished(this, this.#streams, this.#unpipeEvent);
    const streamPromise = endWhenStreamsDone({
      passThroughStream: this,
      stream,
      streams: this.#streams,
      ended: this.#ended,
      aborted: this.#aborted,
      onFinished: this.#onFinished,
      unpipeEvent: this.#unpipeEvent
    });
    this.#streamPromises.set(stream, streamPromise);
    stream.pipe(this, { end: false });
  }
  async remove(stream) {
    validateStream(stream);
    if (!this.#streams.has(stream)) {
      return false;
    }
    const streamPromise = this.#streamPromises.get(stream);
    if (streamPromise === undefined) {
      return false;
    }
    this.#streamPromises.delete(stream);
    stream.unpipe(this);
    await streamPromise;
    return true;
  }
}
var onMergedStreamFinished = async (passThroughStream, streams, unpipeEvent) => {
  updateMaxListeners(passThroughStream, PASSTHROUGH_LISTENERS_COUNT);
  const controller = new AbortController;
  try {
    await Promise.race([
      onMergedStreamEnd(passThroughStream, controller),
      onInputStreamsUnpipe(passThroughStream, streams, unpipeEvent, controller)
    ]);
  } finally {
    controller.abort();
    updateMaxListeners(passThroughStream, -PASSTHROUGH_LISTENERS_COUNT);
  }
};
var onMergedStreamEnd = async (passThroughStream, { signal }) => {
  try {
    await finished2(passThroughStream, { signal, cleanup: true });
  } catch (error) {
    errorOrAbortStream(passThroughStream, error);
    throw error;
  }
};
var onInputStreamsUnpipe = async (passThroughStream, streams, unpipeEvent, { signal }) => {
  for await (const [unpipedStream] of on4(passThroughStream, "unpipe", { signal })) {
    if (streams.has(unpipedStream)) {
      unpipedStream.emit(unpipeEvent);
    }
  }
};
var validateStream = (stream) => {
  if (typeof stream?.pipe !== "function") {
    throw new TypeError(`Expected a readable stream, got: \`${typeof stream}\`.`);
  }
};
var endWhenStreamsDone = async ({ passThroughStream, stream, streams, ended, aborted, onFinished, unpipeEvent }) => {
  updateMaxListeners(passThroughStream, PASSTHROUGH_LISTENERS_PER_STREAM);
  const controller = new AbortController;
  try {
    await Promise.race([
      afterMergedStreamFinished(onFinished, stream, controller),
      onInputStreamEnd({
        passThroughStream,
        stream,
        streams,
        ended,
        aborted,
        controller
      }),
      onInputStreamUnpipe({
        stream,
        streams,
        ended,
        aborted,
        unpipeEvent,
        controller
      })
    ]);
  } finally {
    controller.abort();
    updateMaxListeners(passThroughStream, -PASSTHROUGH_LISTENERS_PER_STREAM);
  }
  if (streams.size > 0 && streams.size === ended.size + aborted.size) {
    if (ended.size === 0 && aborted.size > 0) {
      abortStream(passThroughStream);
    } else {
      endStream(passThroughStream);
    }
  }
};
var afterMergedStreamFinished = async (onFinished, stream, { signal }) => {
  try {
    await onFinished;
    if (!signal.aborted) {
      abortStream(stream);
    }
  } catch (error) {
    if (!signal.aborted) {
      errorOrAbortStream(stream, error);
    }
  }
};
var onInputStreamEnd = async ({ passThroughStream, stream, streams, ended, aborted, controller: { signal } }) => {
  try {
    await finished2(stream, {
      signal,
      cleanup: true,
      readable: true,
      writable: false
    });
    if (streams.has(stream)) {
      ended.add(stream);
    }
  } catch (error) {
    if (signal.aborted || !streams.has(stream)) {
      return;
    }
    if (isAbortError(error)) {
      aborted.add(stream);
    } else {
      errorStream(passThroughStream, error);
    }
  }
};
var onInputStreamUnpipe = async ({ stream, streams, ended, aborted, unpipeEvent, controller: { signal } }) => {
  await once7(stream, unpipeEvent, { signal });
  if (!stream.readable) {
    return once7(signal, "abort", { signal });
  }
  streams.delete(stream);
  ended.delete(stream);
  aborted.delete(stream);
};
var endStream = (stream) => {
  if (stream.writable) {
    stream.end();
  }
};
var errorOrAbortStream = (stream, error) => {
  if (isAbortError(error)) {
    abortStream(stream);
  } else {
    errorStream(stream, error);
  }
};
var isAbortError = (error) => error?.code === "ERR_STREAM_PREMATURE_CLOSE";
var abortStream = (stream) => {
  if (stream.readable || stream.writable) {
    stream.destroy();
  }
};
var errorStream = (stream, error) => {
  if (!stream.destroyed) {
    stream.once("error", noop2);
    stream.destroy(error);
  }
};
var noop2 = () => {};
var updateMaxListeners = (passThroughStream, increment2) => {
  const maxListeners = passThroughStream.getMaxListeners();
  if (maxListeners !== 0 && maxListeners !== Number.POSITIVE_INFINITY) {
    passThroughStream.setMaxListeners(maxListeners + increment2);
  }
};
var PASSTHROUGH_LISTENERS_COUNT = 2;
var PASSTHROUGH_LISTENERS_PER_STREAM = 1;

// node_modules/execa/lib/io/pipeline.js
import { finished as finished3 } from "node:stream/promises";
var pipeStreams = (source, destination) => {
  source.pipe(destination);
  onSourceFinish(source, destination);
  onDestinationFinish(source, destination);
};
var onSourceFinish = async (source, destination) => {
  if (isStandardStream(source) || isStandardStream(destination)) {
    return;
  }
  try {
    await finished3(source, { cleanup: true, readable: true, writable: false });
  } catch {}
  endDestinationStream(destination);
};
var endDestinationStream = (destination) => {
  if (destination.writable) {
    destination.end();
  }
};
var onDestinationFinish = async (source, destination) => {
  if (isStandardStream(source) || isStandardStream(destination)) {
    return;
  }
  try {
    await finished3(destination, { cleanup: true, readable: false, writable: true });
  } catch {}
  abortSourceStream(source);
};
var abortSourceStream = (source) => {
  if (source.readable) {
    source.destroy();
  }
};

// node_modules/execa/lib/io/output-async.js
var pipeOutputAsync = (subprocess, fileDescriptors, controller) => {
  const pipeGroups = new Map;
  for (const [fdNumber, { stdioItems, direction }] of Object.entries(fileDescriptors)) {
    const transformItems = stdioItems.filter(({ type }) => TRANSFORM_TYPES.has(type));
    for (const { stream } of transformItems) {
      pipeTransform(subprocess, stream, direction, fdNumber);
    }
    const nonTransformItems = stdioItems.filter(({ type }) => !TRANSFORM_TYPES.has(type));
    for (const { stream } of nonTransformItems) {
      pipeStdioItem({
        subprocess,
        stream,
        direction,
        fdNumber,
        pipeGroups,
        controller
      });
    }
  }
  for (const [outputStream, inputStreams] of pipeGroups) {
    const inputStream = inputStreams.length === 1 ? inputStreams[0] : mergeStreams(inputStreams);
    pipeStreams(inputStream, outputStream);
  }
};
var pipeTransform = (subprocess, stream, direction, fdNumber) => {
  if (direction === "output") {
    pipeStreams(subprocess.stdio[fdNumber], stream);
  } else {
    pipeStreams(stream, subprocess.stdio[fdNumber]);
  }
  const streamProperty = SUBPROCESS_STREAM_PROPERTIES[fdNumber];
  if (streamProperty !== undefined) {
    subprocess[streamProperty] = stream;
  }
  subprocess.stdio[fdNumber] = stream;
};
var SUBPROCESS_STREAM_PROPERTIES = ["stdin", "stdout", "stderr"];
var pipeStdioItem = ({ subprocess, stream, direction, fdNumber, pipeGroups, controller }) => {
  if (stream === undefined) {
    return;
  }
  setStandardStreamMaxListeners(stream, controller);
  const [inputStream, outputStream] = direction === "output" ? [stream, subprocess.stdio[fdNumber]] : [subprocess.stdio[fdNumber], stream];
  const outputStreams = pipeGroups.get(inputStream) ?? [];
  pipeGroups.set(inputStream, [...outputStreams, outputStream]);
};
var setStandardStreamMaxListeners = (stream, { signal }) => {
  if (isStandardStream(stream)) {
    incrementMaxListeners(stream, MAX_LISTENERS_INCREMENT, signal);
  }
};
var MAX_LISTENERS_INCREMENT = 2;

// node_modules/execa/lib/terminate/kill-descendants.js
import process11 from "node:process";
import { execFile } from "node:child_process";
import path9 from "node:path/win32";
var isWindows2 = process11.platform === "win32";
var getSpawnOptions = (options) => options.killDescendants && !isWindows2 ? { ...options, detached: true } : options;
var getKillFunction = (subprocess, { killDescendants }) => {
  if (!killDescendants) {
    return subprocess.kill.bind(subprocess);
  }
  const killDescendantsFunction = isWindows2 ? killDescendantsWindows : killDescendantsUnix;
  return killDescendantsFunction.bind(undefined, subprocess);
};
var killDescendantsUnix = (subprocess, signal) => {
  if (subprocess.pid === undefined) {
    return false;
  }
  try {
    return process11.kill(-subprocess.pid, signal);
  } catch {
    return subprocess.kill(signal);
  }
};
var killDescendantsWindows = (subprocess, signal) => {
  if (subprocess.pid === undefined) {
    return false;
  }
  const taskkillFile = getTaskkillFile();
  if (taskkillFile === undefined) {
    return subprocess.kill(signal);
  }
  execFile(taskkillFile, ["/pid", `${subprocess.pid}`, "/T", "/F"], (error) => {
    if (error) {
      subprocess.kill(signal);
    }
  });
  return true;
};
var getTaskkillFile = () => {
  const windowsDirectory = [process11.env.SystemRoot, process11.env.windir].find((directory) => directory && isWindowsDriveAbsolutePath(directory));
  return windowsDirectory === undefined ? undefined : path9.join(windowsDirectory, "System32", "taskkill.exe");
};
var isWindowsDriveAbsolutePath = (directory) => {
  const { root } = path9.parse(directory);
  return /^[a-z]:[/\\]/i.test(root);
};

// node_modules/execa/lib/terminate/cleanup.js
import { addAbortListener as addAbortListener2 } from "node:events";

// node_modules/signal-exit/dist/mjs/signals.js
var signals = [];
signals.push("SIGHUP", "SIGINT", "SIGTERM");
if (process.platform !== "win32") {
  signals.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
}
if (process.platform === "linux") {
  signals.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
}

// node_modules/signal-exit/dist/mjs/index.js
var processOk = (process12) => !!process12 && typeof process12 === "object" && typeof process12.removeListener === "function" && typeof process12.emit === "function" && typeof process12.reallyExit === "function" && typeof process12.listeners === "function" && typeof process12.kill === "function" && typeof process12.pid === "number" && typeof process12.on === "function";
var kExitEmitter = Symbol.for("signal-exit emitter");
var global = globalThis;
var ObjectDefineProperty = Object.defineProperty.bind(Object);

class Emitter {
  emitted = {
    afterExit: false,
    exit: false
  };
  listeners = {
    afterExit: [],
    exit: []
  };
  count = 0;
  id = Math.random();
  constructor() {
    if (global[kExitEmitter]) {
      return global[kExitEmitter];
    }
    ObjectDefineProperty(global, kExitEmitter, {
      value: this,
      writable: false,
      enumerable: false,
      configurable: false
    });
  }
  on(ev, fn) {
    this.listeners[ev].push(fn);
  }
  removeListener(ev, fn) {
    const list = this.listeners[ev];
    const i3 = list.indexOf(fn);
    if (i3 === -1) {
      return;
    }
    if (i3 === 0 && list.length === 1) {
      list.length = 0;
    } else {
      list.splice(i3, 1);
    }
  }
  emit(ev, code, signal) {
    if (this.emitted[ev]) {
      return false;
    }
    this.emitted[ev] = true;
    let ret = false;
    for (const fn of this.listeners[ev]) {
      ret = fn(code, signal) === true || ret;
    }
    if (ev === "exit") {
      ret = this.emit("afterExit", code, signal) || ret;
    }
    return ret;
  }
}

class SignalExitBase {
}
var signalExitWrap = (handler) => {
  return {
    onExit(cb, opts) {
      return handler.onExit(cb, opts);
    },
    load() {
      return handler.load();
    },
    unload() {
      return handler.unload();
    }
  };
};

class SignalExitFallback extends SignalExitBase {
  onExit() {
    return () => {};
  }
  load() {}
  unload() {}
}

class SignalExit extends SignalExitBase {
  #hupSig = process12.platform === "win32" ? "SIGINT" : "SIGHUP";
  #emitter = new Emitter;
  #process;
  #originalProcessEmit;
  #originalProcessReallyExit;
  #sigListeners = {};
  #loaded = false;
  constructor(process12) {
    super();
    this.#process = process12;
    this.#sigListeners = {};
    for (const sig of signals) {
      this.#sigListeners[sig] = () => {
        const listeners = this.#process.listeners(sig);
        let { count: count2 } = this.#emitter;
        const p2 = process12;
        if (typeof p2.__signal_exit_emitter__ === "object" && typeof p2.__signal_exit_emitter__.count === "number") {
          count2 += p2.__signal_exit_emitter__.count;
        }
        if (listeners.length === count2) {
          this.unload();
          const ret = this.#emitter.emit("exit", null, sig);
          const s = sig === "SIGHUP" ? this.#hupSig : sig;
          if (!ret)
            process12.kill(process12.pid, s);
        }
      };
    }
    this.#originalProcessReallyExit = process12.reallyExit;
    this.#originalProcessEmit = process12.emit;
  }
  onExit(cb, opts) {
    if (!processOk(this.#process)) {
      return () => {};
    }
    if (this.#loaded === false) {
      this.load();
    }
    const ev = opts?.alwaysLast ? "afterExit" : "exit";
    this.#emitter.on(ev, cb);
    return () => {
      this.#emitter.removeListener(ev, cb);
      if (this.#emitter.listeners["exit"].length === 0 && this.#emitter.listeners["afterExit"].length === 0) {
        this.unload();
      }
    };
  }
  load() {
    if (this.#loaded) {
      return;
    }
    this.#loaded = true;
    this.#emitter.count += 1;
    for (const sig of signals) {
      try {
        const fn = this.#sigListeners[sig];
        if (fn)
          this.#process.on(sig, fn);
      } catch (_2) {}
    }
    this.#process.emit = (ev, ...a3) => {
      return this.#processEmit(ev, ...a3);
    };
    this.#process.reallyExit = (code) => {
      return this.#processReallyExit(code);
    };
  }
  unload() {
    if (!this.#loaded) {
      return;
    }
    this.#loaded = false;
    signals.forEach((sig) => {
      const listener = this.#sigListeners[sig];
      if (!listener) {
        throw new Error("Listener not defined for signal: " + sig);
      }
      try {
        this.#process.removeListener(sig, listener);
      } catch (_2) {}
    });
    this.#process.emit = this.#originalProcessEmit;
    this.#process.reallyExit = this.#originalProcessReallyExit;
    this.#emitter.count -= 1;
  }
  #processReallyExit(code) {
    if (!processOk(this.#process)) {
      return 0;
    }
    this.#process.exitCode = code || 0;
    this.#emitter.emit("exit", this.#process.exitCode, null);
    return this.#originalProcessReallyExit.call(this.#process, this.#process.exitCode);
  }
  #processEmit(ev, ...args) {
    const og = this.#originalProcessEmit;
    if (ev === "exit" && processOk(this.#process)) {
      if (typeof args[0] === "number") {
        this.#process.exitCode = args[0];
      }
      const ret = og.call(this.#process, ev, ...args);
      this.#emitter.emit("exit", this.#process.exitCode, null);
      return ret;
    } else {
      return og.call(this.#process, ev, ...args);
    }
  }
}
var process12 = globalThis.process;
var {
  onExit,
  load,
  unload
} = signalExitWrap(processOk(process12) ? new SignalExit(process12) : new SignalExitFallback);

// node_modules/execa/lib/terminate/cleanup.js
var cleanupOnExit = (kill, { cleanup, detached }, { signal }) => {
  if (!cleanup || detached) {
    return;
  }
  const removeExitHandler = onExit(() => {
    kill();
  });
  addAbortListener2(signal, () => {
    removeExitHandler();
  });
};

// node_modules/execa/lib/convert/concurrent.js
var initializeConcurrentStreams = () => ({
  readableDestroy: new WeakMap,
  writableFinal: new WeakMap,
  writableDestroy: new WeakMap
});
var addConcurrentStream = (concurrentStreams, stream, waitName) => {
  const weakMap = concurrentStreams[waitName];
  if (!weakMap.has(stream)) {
    weakMap.set(stream, []);
  }
  const promises = weakMap.get(stream);
  const promise = createDeferred();
  promises.push(promise);
  const resolve = promise.resolve.bind(promise);
  return { resolve, promises };
};
var waitForConcurrentStreams = async ({ resolve, promises }, subprocess) => {
  resolve();
  const [isSubprocessExit] = await Promise.race([
    Promise.allSettled([true, subprocess]),
    Promise.all([false, ...promises])
  ]);
  return !isSubprocessExit;
};

// node_modules/execa/lib/io/iterate.js
import { on as on5 } from "node:events";
import { getDefaultHighWaterMark as getDefaultHighWaterMark3 } from "node:stream";
var iterateOnSubprocessStream = ({ subprocessStdout, subprocess, binary, shouldEncode, encoding, preserveNewlines }) => {
  const controller = new AbortController;
  stopReadingOnExit(subprocess, controller);
  return iterateOnStream({
    stream: subprocessStdout,
    controller,
    binary,
    shouldEncode: !subprocessStdout.readableObjectMode && shouldEncode,
    encoding,
    shouldSplit: !subprocessStdout.readableObjectMode,
    preserveNewlines
  });
};
var stopReadingOnExit = async (subprocess, controller) => {
  try {
    await subprocess;
  } catch {} finally {
    controller.abort();
  }
};
var iterateForResult = ({ stream, onStreamEnd, lines, encoding, stripFinalNewline: stripFinalNewline2, allMixed }) => {
  const controller = new AbortController;
  stopReadingOnStreamEnd(onStreamEnd, controller, stream);
  const objectMode = stream.readableObjectMode && !allMixed;
  return iterateOnStream({
    stream,
    controller,
    binary: encoding === "buffer",
    shouldEncode: !objectMode,
    encoding,
    shouldSplit: !objectMode && lines,
    preserveNewlines: !stripFinalNewline2
  });
};
var stopReadingOnStreamEnd = async (onStreamEnd, controller, stream) => {
  try {
    await onStreamEnd;
  } catch {
    stream.destroy();
  } finally {
    controller.abort();
  }
};
var iterateOnStream = ({ stream, controller, binary, shouldEncode, encoding, shouldSplit, preserveNewlines }) => {
  const onStdoutChunk = on5(stream, "data", {
    signal: controller.signal,
    highWaterMark: HIGH_WATER_MARK,
    highWatermark: HIGH_WATER_MARK
  });
  return iterateOnData({
    onStdoutChunk,
    controller,
    binary,
    shouldEncode,
    encoding,
    shouldSplit,
    preserveNewlines
  });
};
var DEFAULT_OBJECT_HIGH_WATER_MARK = getDefaultHighWaterMark3(true);
var HIGH_WATER_MARK = DEFAULT_OBJECT_HIGH_WATER_MARK;
var iterateOnData = async function* ({ onStdoutChunk, controller, binary, shouldEncode, encoding, shouldSplit, preserveNewlines }) {
  const generators = getGenerators({
    binary,
    shouldEncode,
    encoding,
    shouldSplit,
    preserveNewlines
  });
  try {
    for await (const [chunk] of onStdoutChunk) {
      yield* transformChunkSync(chunk, generators, 0);
    }
  } catch (error) {
    if (!controller.signal.aborted) {
      throw error;
    }
  } finally {
    yield* finalChunksSync(generators);
  }
};
var getGenerators = ({ binary, shouldEncode, encoding, shouldSplit, preserveNewlines }) => [
  getEncodingTransformGenerator(binary, encoding, !shouldEncode),
  getSplitLinesGenerator(binary, preserveNewlines, !shouldSplit, {})
].filter(Boolean);

// node_modules/execa/lib/convert/iterable.js
var createIterable = (subprocess, encoding, {
  from,
  binary: binaryOption = false,
  preserveNewlines = false
} = {}) => {
  const binary = binaryOption || BINARY_ENCODINGS.has(encoding);
  const subprocessStdout = getFromStream(subprocess, from);
  const onStdoutData = iterateOnSubprocessStream({
    subprocessStdout,
    subprocess,
    binary,
    shouldEncode: true,
    encoding,
    preserveNewlines
  });
  return iterateOnStdoutData(onStdoutData, subprocessStdout, subprocess);
};
var iterateOnStdoutData = async function* (onStdoutData, subprocessStdout, subprocess) {
  try {
    yield* onStdoutData;
  } finally {
    if (subprocessStdout.readable) {
      subprocessStdout.destroy();
    }
    await subprocess;
  }
};

// node_modules/execa/lib/convert/readable.js
import { Readable as Readable3 } from "node:stream";
import { callbackify as callbackify2 } from "node:util";

// node_modules/execa/lib/convert/shared.js
import { finished as finished5 } from "node:stream/promises";

// node_modules/execa/lib/resolve/wait-stream.js
import { finished as finished4 } from "node:stream/promises";
var waitForStream = async (stream, fdNumber, streamInfo, { isSameDirection, stopOnExit = false } = {}) => {
  const state = handleStdinDestroy(stream, streamInfo);
  const abortController = new AbortController;
  try {
    await Promise.race([
      ...stopOnExit ? [streamInfo.exitPromise] : [],
      finished4(stream, { cleanup: true, signal: abortController.signal })
    ]);
  } catch (error) {
    if (!state.stdinCleanedUp) {
      handleStreamError(error, fdNumber, streamInfo, isSameDirection);
    }
  } finally {
    abortController.abort();
  }
};
var handleStdinDestroy = (stream, { originalStreams, subprocess }) => {
  const [originalStdin] = originalStreams;
  const state = { stdinCleanedUp: false };
  if (stream === originalStdin) {
    spyOnStdinDestroy(stream, subprocess, state);
  }
  return state;
};
var spyOnStdinDestroy = (subprocessStdin, subprocess, state) => {
  const { _destroy } = subprocessStdin;
  subprocessStdin._destroy = (...destroyArguments) => {
    setStdinCleanedUp(subprocess, state);
    _destroy.call(subprocessStdin, ...destroyArguments);
  };
};
var setStdinCleanedUp = ({ exitCode, signalCode }, state) => {
  if (exitCode !== null || signalCode !== null) {
    state.stdinCleanedUp = true;
  }
};
var handleStreamError = (error, fdNumber, streamInfo, isSameDirection) => {
  if (!shouldIgnoreStreamError(error, fdNumber, streamInfo, isSameDirection)) {
    throw error;
  }
};
var shouldIgnoreStreamError = (error, fdNumber, streamInfo, isSameDirection = true) => {
  if (streamInfo.propagating) {
    return isStreamEpipe(error) || isStreamAbort(error);
  }
  streamInfo.propagating = true;
  return isInputFileDescriptor(streamInfo, fdNumber) === isSameDirection ? isStreamEpipe(error) : isStreamAbort(error);
};
var isInputFileDescriptor = ({ fileDescriptors }, fdNumber) => fdNumber !== "all" && fileDescriptors[fdNumber].direction === "input";
var isStreamAbort = (error) => error?.code === "ERR_STREAM_PREMATURE_CLOSE";
var isStreamEpipe = (error) => error?.code === "EPIPE";

// node_modules/execa/lib/convert/shared.js
var safeWaitForSubprocessStdin = async (subprocessStdin) => {
  if (subprocessStdin === undefined) {
    return;
  }
  try {
    await waitForSubprocessStdin(subprocessStdin);
  } catch {}
};
var safeWaitForSubprocessStdout = async (subprocessStdout) => {
  if (subprocessStdout === undefined) {
    return;
  }
  try {
    await waitForSubprocessStdout(subprocessStdout);
  } catch {}
};
var waitForSubprocessStdin = async (subprocessStdin) => {
  await finished5(subprocessStdin, { cleanup: true, readable: false, writable: true });
};
var waitForSubprocessStdout = async (subprocessStdout) => {
  await finished5(subprocessStdout, { cleanup: true, readable: true, writable: false });
};
var waitForSubprocess = async (subprocess, error) => {
  await subprocess;
  if (error) {
    throw error;
  }
};
var destroyOtherStream = (stream, isOpen, error) => {
  if (error && !isStreamAbort(error)) {
    stream.destroy(error);
  } else if (isOpen) {
    stream.destroy();
  }
};

// node_modules/execa/lib/convert/readable.js
var createReadable = ({ subprocess, concurrentStreams, encoding }, { from, binary: binaryOption = true, preserveNewlines = true } = {}) => {
  const binary = binaryOption || BINARY_ENCODINGS.has(encoding);
  const { subprocessStdout, waitReadableDestroy } = getSubprocessStdout(subprocess, from, concurrentStreams);
  const { readableEncoding, readableObjectMode, readableHighWaterMark } = getReadableOptions(subprocessStdout, binary);
  const { read, onStdoutDataDone } = getReadableMethods({
    subprocessStdout,
    subprocess,
    binary,
    encoding,
    preserveNewlines
  });
  const readable2 = new Readable3({
    read,
    destroy: callbackify2(onReadableDestroy.bind(undefined, { subprocessStdout, subprocess, waitReadableDestroy })),
    highWaterMark: readableHighWaterMark,
    objectMode: readableObjectMode,
    encoding: readableEncoding
  });
  onStdoutFinished({
    subprocessStdout,
    onStdoutDataDone,
    readable: readable2,
    subprocess
  });
  return readable2;
};
var getSubprocessStdout = (subprocess, from, concurrentStreams) => {
  const subprocessStdout = getFromStream(subprocess, from);
  const waitReadableDestroy = addConcurrentStream(concurrentStreams, subprocessStdout, "readableDestroy");
  return { subprocessStdout, waitReadableDestroy };
};
var getReadableOptions = ({ readableEncoding, readableObjectMode, readableHighWaterMark }, binary) => binary ? { readableEncoding, readableObjectMode, readableHighWaterMark } : { readableEncoding, readableObjectMode: true, readableHighWaterMark: DEFAULT_OBJECT_HIGH_WATER_MARK };
var getReadableMethods = ({ subprocessStdout, subprocess, binary, encoding, preserveNewlines }) => {
  const onStdoutDataDone = createDeferred();
  const onStdoutData = iterateOnSubprocessStream({
    subprocessStdout,
    subprocess,
    binary,
    shouldEncode: !binary,
    encoding,
    preserveNewlines
  });
  return {
    read() {
      onRead(this, onStdoutData, onStdoutDataDone);
    },
    onStdoutDataDone
  };
};
var onRead = async (readable2, onStdoutData, onStdoutDataDone) => {
  try {
    const { value, done } = await onStdoutData.next();
    if (done) {
      onStdoutDataDone.resolve();
    } else {
      readable2.push(value);
    }
  } catch {}
};
var onStdoutFinished = async ({ subprocessStdout, onStdoutDataDone, readable: readable2, subprocess, subprocessStdin }) => {
  try {
    await waitForSubprocessStdout(subprocessStdout);
    await subprocess;
    await safeWaitForSubprocessStdin(subprocessStdin);
    await onStdoutDataDone;
    if (readable2.readable) {
      readable2.push(null);
    }
  } catch (error) {
    await safeWaitForSubprocessStdin(subprocessStdin);
    destroyOtherReadable(readable2, await getPrematureCloseError(subprocess, error));
  }
};
var getPrematureCloseError = async (subprocess, error) => {
  if (error.code !== "ERR_STREAM_PREMATURE_CLOSE") {
    return error;
  }
  try {
    await subprocess;
  } catch (subprocessError) {
    return subprocessError;
  }
  return error;
};
var onReadableDestroy = async ({ subprocessStdout, subprocess, waitReadableDestroy }, error) => {
  if (!await waitForConcurrentStreams(waitReadableDestroy, subprocess)) {
    return;
  }
  destroyOtherReadable(subprocessStdout, error);
  await waitForSubprocess(subprocess, error);
};
var destroyOtherReadable = (stream, error) => {
  destroyOtherStream(stream, stream.readable, error);
};

// node_modules/execa/lib/convert/web.js
import { Readable as Readable4, Writable as Writable3, Duplex as Duplex3 } from "node:stream";
var createReadableStream = (subprocess, readableOptions) => Readable4.toWeb(subprocess.readable(readableOptions));
var createWritableStream = (subprocess, writableOptions) => Writable3.toWeb(subprocess.writable(writableOptions));
var createTransformStream = (subprocess, duplexOptions) => Duplex3.toWeb(subprocess.duplex(duplexOptions));

// node_modules/execa/lib/pipe/pipe-arguments.js
var normalizePipeArguments = ({ source, sourcePromise, boundOptions, createNested }, ...pipeArguments) => {
  const startTime = getStartTime();
  const {
    destination,
    destinationStream,
    destinationError,
    from,
    unpipeSignal
  } = getDestinationStream(boundOptions, createNested, pipeArguments);
  const { sourceStream, sourceError } = getSourceStream(source, from);
  const { options: sourceOptions, fileDescriptors } = SUBPROCESS_OPTIONS.get(source);
  return {
    sourcePromise,
    sourceStream,
    sourceOptions,
    sourceError,
    destination,
    destinationStream,
    destinationError,
    unpipeSignal,
    fileDescriptors,
    startTime
  };
};
var getDestinationStream = (boundOptions, createNested, pipeArguments) => {
  try {
    const {
      destination,
      pipeOptions: { from, to, unpipeSignal } = {}
    } = getDestination(boundOptions, createNested, ...pipeArguments);
    const destinationStream = getToStream(destination, to);
    return {
      destination,
      destinationStream,
      from,
      unpipeSignal
    };
  } catch (error) {
    return { destinationError: error };
  }
};
var getDestination = (boundOptions, createNested, firstArgument, ...pipeArguments) => {
  if (Array.isArray(firstArgument)) {
    const destination = createNested(mapDestinationArguments, boundOptions)(firstArgument, ...pipeArguments);
    return { destination, pipeOptions: boundOptions };
  }
  if (typeof firstArgument === "string" || firstArgument instanceof URL || isDenoExecPath(firstArgument)) {
    if (Object.keys(boundOptions).length > 0) {
      throw new TypeError('Please use .pipe("file", ..., options) or .pipe(execa("file", ..., options)) instead of .pipe(options)("file", ...).');
    }
    const [rawFile, rawArguments, rawOptions] = normalizeParameters(firstArgument, ...pipeArguments);
    const destination = createNested(mapDestinationArguments)(rawFile, rawArguments, rawOptions);
    return { destination, pipeOptions: rawOptions };
  }
  if (SUBPROCESS_OPTIONS.has(firstArgument)) {
    if (Object.keys(boundOptions).length > 0) {
      throw new TypeError("Please use .pipe(options)`command` or .pipe($(options)`command`) instead of .pipe(options)($`command`).");
    }
    return { destination: firstArgument, pipeOptions: pipeArguments[0] };
  }
  throw new TypeError(`The first argument must be a template string, an options object, or an Execa subprocess: ${firstArgument}`);
};
var mapDestinationArguments = ({ options }) => ({ options: { ...options, stdin: "pipe", piped: true } });
var getSourceStream = (source, from) => {
  try {
    const sourceStream = getFromStream(source, from);
    return { sourceStream };
  } catch (error) {
    return { sourceError: error };
  }
};

// node_modules/execa/lib/pipe/throw.js
var handlePipeArgumentsError = ({
  sourceStream,
  sourceError,
  destinationStream,
  destinationError,
  fileDescriptors,
  sourceOptions,
  startTime
}) => {
  const error = getPipeArgumentsError({
    sourceStream,
    sourceError,
    destinationStream,
    destinationError
  });
  if (error !== undefined) {
    throw createNonCommandError({
      error,
      fileDescriptors,
      sourceOptions,
      startTime
    });
  }
};
var getPipeArgumentsError = ({ sourceStream, sourceError, destinationStream, destinationError }) => {
  if (sourceError !== undefined && destinationError !== undefined) {
    return destinationError;
  }
  if (destinationError !== undefined) {
    abortSourceStream(sourceStream);
    return destinationError;
  }
  if (sourceError !== undefined) {
    endDestinationStream(destinationStream);
    return sourceError;
  }
};
var createNonCommandError = ({ error, fileDescriptors, sourceOptions, startTime }) => makeEarlyError({
  error,
  command: PIPE_COMMAND_MESSAGE,
  escapedCommand: PIPE_COMMAND_MESSAGE,
  fileDescriptors,
  options: sourceOptions,
  startTime,
  isSync: false
});
var PIPE_COMMAND_MESSAGE = "source.pipe(destination)";

// node_modules/execa/lib/pipe/sequence.js
var waitForBothSubprocesses = async (subprocessPromises) => {
  const [
    { status: sourceStatus, reason: sourceReason, value: sourceResult = sourceReason },
    { status: destinationStatus, reason: destinationReason, value: destinationResult = destinationReason }
  ] = await subprocessPromises;
  if (!destinationResult.pipedFrom.includes(sourceResult)) {
    destinationResult.pipedFrom.push(sourceResult);
  }
  if (destinationStatus === "rejected") {
    throw destinationResult;
  }
  if (sourceStatus === "rejected") {
    throw sourceResult;
  }
  return destinationResult;
};

// node_modules/execa/lib/pipe/streaming.js
import { finished as finished6 } from "node:stream/promises";
var pipeSubprocessStream = (sourceStream, destinationStream, maxListenersController) => {
  const mergedStream = MERGED_STREAMS.has(destinationStream) ? pipeMoreSubprocessStream(sourceStream, destinationStream) : pipeFirstSubprocessStream(sourceStream, destinationStream);
  incrementMaxListeners(sourceStream, SOURCE_LISTENERS_PER_PIPE, maxListenersController.signal);
  incrementMaxListeners(destinationStream, DESTINATION_LISTENERS_PER_PIPE, maxListenersController.signal);
  cleanupMergedStreamsMap(destinationStream);
  return mergedStream;
};
var pipeFirstSubprocessStream = (sourceStream, destinationStream) => {
  const mergedStream = mergeStreams([sourceStream]);
  pipeStreams(mergedStream, destinationStream);
  MERGED_STREAMS.set(destinationStream, mergedStream);
  return mergedStream;
};
var pipeMoreSubprocessStream = (sourceStream, destinationStream) => {
  const mergedStream = MERGED_STREAMS.get(destinationStream);
  mergedStream.add(sourceStream);
  return mergedStream;
};
var cleanupMergedStreamsMap = async (destinationStream) => {
  try {
    await finished6(destinationStream, { cleanup: true, readable: false, writable: true });
  } catch {}
  MERGED_STREAMS.delete(destinationStream);
};
var MERGED_STREAMS = new WeakMap;
var SOURCE_LISTENERS_PER_PIPE = 2;
var DESTINATION_LISTENERS_PER_PIPE = 1;

// node_modules/execa/lib/pipe/abort.js
import { aborted } from "node:util";
var unpipeOnAbort = (unpipeSignal, unpipeContext) => unpipeSignal === undefined ? [] : [unpipeOnSignalAbort(unpipeSignal, unpipeContext)];
var unpipeOnSignalAbort = async (unpipeSignal, { sourceStream, mergedStream, fileDescriptors, sourceOptions, startTime }) => {
  await aborted(unpipeSignal, sourceStream);
  await mergedStream.remove(sourceStream);
  const error = new Error("Pipe canceled by `unpipeSignal` option.");
  throw createNonCommandError({
    error,
    fileDescriptors,
    sourceOptions,
    startTime
  });
};

// node_modules/execa/lib/pipe/setup.js
var pipeToSubprocess = (sourceInfo, ...pipeArguments) => {
  if (isPlainObject(pipeArguments[0])) {
    return pipeToSubprocess.bind(undefined, {
      ...sourceInfo,
      boundOptions: { ...sourceInfo.boundOptions, ...pipeArguments[0] }
    });
  }
  const { destination, ...normalizedInfo } = normalizePipeArguments(sourceInfo, ...pipeArguments);
  const pipeFailureController = new AbortController;
  const promise = handlePipePromise({ ...normalizedInfo, destination, pipeFailureController });
  promise.pipe = pipeToSubprocess.bind(undefined, {
    ...sourceInfo,
    source: destination,
    sourcePromise: promise,
    boundOptions: {}
  });
  forwardDestinationMethods(promise, destination, pipeFailureController.signal);
  return promise;
};
var forwardDestinationMethods = (promise, destination, pipeFailureSignal) => {
  if (destination === undefined) {
    return;
  }
  forwardReadableMethods(promise, destination);
  forwardIpcMethods(promise, destination, pipeFailureSignal);
};
var forwardReadableMethods = (promise, destination) => {
  const subprocessOptions = SUBPROCESS_OPTIONS.get(destination);
  SUBPROCESS_OPTIONS.set(promise, subprocessOptions);
  promise.stdio = destination.stdio;
  promise.all = destination.all;
  const { options: { encoding } } = subprocessOptions;
  const concurrentStreams = initializeConcurrentStreams();
  promise[Symbol.asyncIterator] = createIterable.bind(undefined, promise, encoding, {});
  promise.iterable = createIterable.bind(undefined, promise, encoding);
  promise.readable = createPipeReadable.bind(undefined, promise, {
    subprocess: promise,
    concurrentStreams,
    encoding
  });
  promise.readableStream = createReadableStream.bind(undefined, promise);
  forwardAll(promise, destination);
};
var forwardAll = (promise, destination) => {
  if (destination.all === undefined) {
    promise.all = undefined;
    return;
  }
  Object.defineProperty(promise, "all", {
    get() {
      setAllProperty(promise, destination.all);
      const all = promise.readable({ from: "all" });
      setAllProperty(promise, all);
      return all;
    },
    enumerable: true,
    configurable: true
  });
};
var setAllProperty = (promise, value) => {
  Object.defineProperty(promise, "all", {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });
};
var createPipeReadable = (promise, readableOptions, ...arguments_) => {
  const readable2 = createReadable(readableOptions, ...arguments_);
  destroyOnPipeFailure(promise, readable2);
  return readable2;
};
var destroyOnPipeFailure = async (promise, readable2) => {
  try {
    await promise;
  } catch (error) {
    readable2.destroy(error);
  }
};
var forwardIpcMethods = (promise, destination, pipeFailureSignal) => {
  promise.sendMessage = destination.sendMessage;
  promise.getOneMessage = getOnePipeMessage.bind(undefined, destination, pipeFailureSignal);
  promise.getEachMessage = getEachPipeMessage.bind(undefined, promise, destination, pipeFailureSignal);
};
var getOnePipeMessage = (destination, pipeFailureSignal, ...arguments_) => {
  const controller = new AbortController;
  const messagePromise = destination.getOneMessage(...addPipeOptions(arguments_, controller.signal, internalGetOneMessageOptions));
  return waitForOnePipeMessage(pipeFailureSignal, messagePromise, controller);
};
var waitForOnePipeMessage = async (pipeFailureSignal, messagePromise, controller) => {
  try {
    return await Promise.race([messagePromise, getSignalRejection(pipeFailureSignal, controller.signal)]);
  } finally {
    controller.abort();
  }
};
var getSignalRejection = (signal, listenerSignal) => new Promise((_2, reject) => {
  if (signal.aborted) {
    reject(signal.reason);
    return;
  }
  signal.addEventListener("abort", () => {
    reject(signal.reason);
  }, { once: true, signal: listenerSignal });
});
var getEachPipeMessage = (promise, destination, pipeFailureSignal, ...arguments_) => {
  const controller = new AbortController;
  const iterator = destination.getEachMessage(...addPipeOptions(arguments_, controller.signal, internalGetEachMessageOptions));
  abortOnSignal(pipeFailureSignal, controller);
  return iterateOnPipeMessages(promise, iterator, controller);
};
var iterateOnPipeMessages = async function* (promise, iterator, controller) {
  try {
    yield* iterator;
  } finally {
    controller.abort();
    await promise;
  }
};
var addPipeOptions = (arguments_, signal, internalOptionsSymbol) => {
  if (arguments_[0] === null) {
    return arguments_;
  }
  const [options] = arguments_;
  return [{ ...options, [internalOptionsSymbol]: { signal, shouldAwait: false } }];
};
var abortOnSignal = (signal, controller) => {
  if (signal.aborted) {
    controller.abort();
    return;
  }
  signal.addEventListener("abort", () => {
    controller.abort();
  }, { once: true, signal: controller.signal });
};
var handlePipePromise = async ({
  sourcePromise,
  sourceStream,
  sourceOptions,
  sourceError,
  destination,
  destinationStream,
  destinationError,
  unpipeSignal,
  fileDescriptors,
  startTime,
  pipeFailureController
}) => {
  const maxListenersController = new AbortController;
  try {
    const subprocessPromises = getSubprocessPromises(sourcePromise, destination);
    handlePipeArgumentsError({
      sourceStream,
      sourceError,
      destinationStream,
      destinationError,
      fileDescriptors,
      sourceOptions,
      startTime
    });
    const mergedStream = pipeSubprocessStream(sourceStream, destinationStream, maxListenersController);
    return await Promise.race([
      waitForBothSubprocesses(subprocessPromises),
      ...unpipeOnAbort(unpipeSignal, {
        sourceStream,
        mergedStream,
        sourceOptions,
        fileDescriptors,
        startTime
      })
    ]);
  } catch (error) {
    pipeFailureController.abort(error);
    throw error;
  } finally {
    maxListenersController.abort();
  }
};
var getSubprocessPromises = (sourcePromise, destination) => Promise.allSettled([sourcePromise, destination]);

// node_modules/execa/lib/io/contents.js
import { setImmediate } from "node:timers/promises";
var getStreamOutput = async ({ stream, onStreamEnd, fdNumber, encoding, buffer, maxBuffer, lines, allMixed, stripFinalNewline: stripFinalNewline2, verboseInfo, streamInfo }) => {
  const logPromise = logOutputAsync({
    stream,
    onStreamEnd,
    fdNumber,
    encoding,
    allMixed,
    verboseInfo,
    streamInfo
  });
  if (!buffer) {
    await Promise.all([resumeStream(stream), logPromise]);
    return;
  }
  const stripFinalNewlineValue = getStripFinalNewline(stripFinalNewline2, fdNumber);
  const iterable2 = iterateForResult({
    stream,
    onStreamEnd,
    lines,
    encoding,
    stripFinalNewline: stripFinalNewlineValue,
    allMixed
  });
  const [output] = await Promise.all([
    getStreamContents2({
      stream,
      iterable: iterable2,
      fdNumber,
      encoding,
      maxBuffer,
      lines
    }),
    logPromise
  ]);
  return output;
};
var logOutputAsync = async ({ stream, onStreamEnd, fdNumber, encoding, allMixed, verboseInfo, streamInfo: { fileDescriptors } }) => {
  if (!shouldLogOutput({
    stdioItems: fileDescriptors[fdNumber]?.stdioItems,
    encoding,
    verboseInfo,
    fdNumber
  })) {
    return;
  }
  const linesIterable = iterateForResult({
    stream,
    onStreamEnd,
    lines: true,
    encoding,
    stripFinalNewline: true,
    allMixed
  });
  await logLines(linesIterable, stream, fdNumber, verboseInfo);
};
var resumeStream = async (stream) => {
  await setImmediate();
  if (stream.readableFlowing === null) {
    stream.resume();
  }
};
var getStreamContents2 = async ({ stream, stream: { readableObjectMode }, iterable: iterable2, fdNumber, encoding, maxBuffer, lines }) => {
  try {
    if (readableObjectMode || lines) {
      return await getStreamAsArray(iterable2, { maxBuffer });
    }
    if (encoding === "buffer") {
      return new Uint8Array(await getStreamAsArrayBuffer(iterable2, { maxBuffer }));
    }
    return await getStreamAsString(iterable2, { maxBuffer });
  } catch (error) {
    return handleBufferedData(handleMaxBuffer({
      error,
      stream,
      readableObjectMode,
      lines,
      encoding,
      fdNumber
    }));
  }
};
var getBufferedData = async (streamPromise) => {
  try {
    return await streamPromise;
  } catch (error) {
    return handleBufferedData(error);
  }
};
var handleBufferedData = ({ bufferedData }) => isArrayBuffer(bufferedData) ? new Uint8Array(bufferedData) : bufferedData;

// node_modules/execa/lib/resolve/stdio.js
var waitForStdioStreams = ({ subprocess, encoding, buffer, maxBuffer, lines, stripFinalNewline: stripFinalNewline2, verboseInfo, streamInfo }) => subprocess.stdio.map((stream, fdNumber) => waitForSubprocessStream({
  stream,
  fdNumber,
  encoding,
  buffer: buffer[fdNumber],
  maxBuffer: maxBuffer[fdNumber],
  lines: lines[fdNumber],
  allMixed: false,
  stripFinalNewline: stripFinalNewline2,
  verboseInfo,
  streamInfo
}));
var waitForSubprocessStream = async ({ stream, fdNumber, encoding, buffer, maxBuffer, lines, allMixed, stripFinalNewline: stripFinalNewline2, verboseInfo, streamInfo }) => {
  if (!stream) {
    return;
  }
  const onStreamEnd = waitForStream(stream, fdNumber, streamInfo);
  if (isInputFileDescriptor(streamInfo, fdNumber)) {
    await onStreamEnd;
    return;
  }
  const [output] = await Promise.all([
    getStreamOutput({
      stream,
      onStreamEnd,
      fdNumber,
      encoding,
      buffer,
      maxBuffer,
      lines,
      allMixed,
      stripFinalNewline: stripFinalNewline2,
      verboseInfo,
      streamInfo
    }),
    onStreamEnd
  ]);
  return output;
};

// node_modules/execa/lib/resolve/all-async.js
var makeAllStream = ({ stdout: stdout2, stderr }, { all }) => all && (stdout2 || stderr) ? mergeStreams([stdout2, stderr].filter(Boolean)) : undefined;
var waitForAllStream = ({ subprocess, all, encoding, buffer, maxBuffer, lines, stripFinalNewline: stripFinalNewline2, verboseInfo, streamInfo }) => waitForSubprocessStream({
  ...getAllStream(subprocess, all, buffer),
  fdNumber: "all",
  encoding,
  maxBuffer: maxBuffer[1] + maxBuffer[2],
  lines: lines[1] || lines[2],
  allMixed: getAllMixed(subprocess, all),
  stripFinalNewline: stripFinalNewline2,
  verboseInfo,
  streamInfo
});
var getAllStream = ({ stdout: stdout2, stderr }, all, [, bufferStdout, bufferStderr]) => {
  const buffer = bufferStdout || bufferStderr;
  if (!buffer) {
    return { stream: all, buffer };
  }
  if (!bufferStdout) {
    return { stream: stderr, buffer };
  }
  if (!bufferStderr) {
    return { stream: stdout2, buffer };
  }
  return { stream: all, buffer };
};
var getAllMixed = ({ stdout: stdout2, stderr }, all) => all && stdout2 && stderr && stdout2.readableObjectMode !== stderr.readableObjectMode;

// node_modules/execa/lib/resolve/wait-subprocess.js
import { once as once8 } from "node:events";

// node_modules/execa/lib/verbose/ipc.js
var shouldLogIpc = (verboseInfo) => isFullVerbose(verboseInfo, "ipc");
var logIpcOutput = (message, verboseInfo) => {
  const verboseMessage = serializeVerboseMessage(message);
  verboseLog({
    type: "ipc",
    verboseMessage,
    fdNumber: "ipc",
    verboseInfo
  });
};

// node_modules/execa/lib/ipc/buffer-messages.js
var waitForIpcOutput = async ({
  subprocess,
  buffer: bufferArray,
  maxBuffer: maxBufferArray,
  ipc,
  ipcOutput,
  verboseInfo
}) => {
  if (!ipc) {
    return ipcOutput;
  }
  const isVerbose2 = shouldLogIpc(verboseInfo);
  const buffer = getFdSpecificValue(bufferArray, "ipc");
  const maxBuffer = getFdSpecificValue(maxBufferArray, "ipc");
  for await (const message of loopOnMessages({
    anyProcess: subprocess,
    channel: subprocess.channel,
    isSubprocess: false,
    ipc,
    shouldAwait: false,
    reference: true
  })) {
    if (buffer) {
      checkIpcMaxBuffer(subprocess, ipcOutput, maxBuffer);
      ipcOutput.push(message);
    }
    if (isVerbose2) {
      logIpcOutput(message, verboseInfo);
    }
  }
  return ipcOutput;
};
var getBufferedIpcOutput = async (ipcOutputPromise, ipcOutput) => {
  await Promise.allSettled([ipcOutputPromise]);
  return ipcOutput;
};

// node_modules/execa/lib/resolve/wait-subprocess.js
var waitForSubprocessResult = async ({
  subprocess,
  kill,
  all,
  options: {
    encoding,
    buffer,
    maxBuffer,
    lines,
    timeoutDuration: timeout,
    cancelSignal,
    gracefulCancel,
    forceKillAfterDelay,
    stripFinalNewline: stripFinalNewline2,
    ipc,
    ipcInput
  },
  context,
  verboseInfo,
  fileDescriptors,
  originalStreams,
  onInternalError,
  controller
}) => {
  const exitPromise = waitForExit(subprocess, context);
  const streamInfo = {
    originalStreams,
    fileDescriptors,
    subprocess,
    exitPromise,
    propagating: false
  };
  const stdioPromises = waitForStdioStreams({
    subprocess,
    encoding,
    buffer,
    maxBuffer,
    lines,
    stripFinalNewline: stripFinalNewline2,
    verboseInfo,
    streamInfo
  });
  const allPromise = waitForAllStream({
    subprocess,
    all,
    encoding,
    buffer,
    maxBuffer,
    lines,
    stripFinalNewline: stripFinalNewline2,
    verboseInfo,
    streamInfo
  });
  const ipcOutput = [];
  const ipcOutputPromise = waitForIpcOutput({
    subprocess,
    buffer,
    maxBuffer,
    ipc,
    ipcOutput,
    verboseInfo
  });
  const originalPromises = waitForOriginalStreams(originalStreams, subprocess, streamInfo);
  const customStreamsEndPromises = waitForCustomStreamsEnd(fileDescriptors, streamInfo);
  try {
    return await Promise.race([
      Promise.all([
        {},
        waitForSuccessfulExit(exitPromise),
        Promise.all(stdioPromises),
        allPromise,
        ipcOutputPromise,
        sendIpcInput(subprocess, ipcInput, ipc),
        ...originalPromises,
        ...customStreamsEndPromises
      ]),
      onInternalError,
      throwOnSubprocessError(subprocess, controller),
      ...throwOnTimeout(kill, timeout, context, controller),
      ...throwOnCancel({
        kill,
        cancelSignal,
        gracefulCancel,
        context,
        controller
      }),
      ...throwOnGracefulCancel({
        subprocess,
        kill,
        cancelSignal,
        gracefulCancel,
        forceKillAfterDelay,
        context,
        controller
      })
    ]);
  } catch (error) {
    context.terminationReason ??= "other";
    return Promise.all([
      { error },
      exitPromise,
      Promise.all(stdioPromises.map((stdioPromise) => getBufferedData(stdioPromise))),
      getBufferedData(allPromise),
      getBufferedIpcOutput(ipcOutputPromise, ipcOutput),
      Promise.allSettled(originalPromises),
      Promise.allSettled(customStreamsEndPromises)
    ]);
  }
};
var waitForOriginalStreams = (originalStreams, subprocess, streamInfo) => originalStreams.map((stream, fdNumber) => stream === subprocess.stdio[fdNumber] ? undefined : waitForStream(stream, fdNumber, streamInfo));
var waitForCustomStreamsEnd = (fileDescriptors, streamInfo) => fileDescriptors.flatMap(({ stdioItems }, fdNumber) => stdioItems.filter(({ value, stream = value }) => isStream2(stream, { checkOpen: false }) && !isStandardStream(stream)).map(({ type, value, stream = value }) => waitForStream(stream, fdNumber, streamInfo, {
  isSameDirection: TRANSFORM_TYPES.has(type),
  stopOnExit: type === "native"
})));
var throwOnSubprocessError = async (subprocess, { signal }) => {
  const [error] = await once8(subprocess, "error", { signal });
  throw error;
};

// node_modules/execa/lib/convert/writable.js
import { Writable as Writable4 } from "node:stream";
import { callbackify as callbackify3 } from "node:util";
var createWritable = ({ subprocess, concurrentStreams }, { to } = {}) => {
  const { subprocessStdin, waitWritableFinal, waitWritableDestroy } = getSubprocessStdin(subprocess, to, concurrentStreams);
  const writable2 = new Writable4({
    ...getWritableMethods(subprocessStdin, subprocess, waitWritableFinal),
    destroy: callbackify3(onWritableDestroy.bind(undefined, {
      subprocessStdin,
      subprocess,
      waitWritableFinal,
      waitWritableDestroy
    })),
    highWaterMark: subprocessStdin.writableHighWaterMark,
    objectMode: subprocessStdin.writableObjectMode
  });
  onStdinFinished(subprocessStdin, writable2, undefined, subprocess);
  return writable2;
};
var getSubprocessStdin = (subprocess, to, concurrentStreams) => {
  const subprocessStdin = getToStream(subprocess, to);
  const waitWritableFinal = addConcurrentStream(concurrentStreams, subprocessStdin, "writableFinal");
  const waitWritableDestroy = addConcurrentStream(concurrentStreams, subprocessStdin, "writableDestroy");
  return { subprocessStdin, waitWritableFinal, waitWritableDestroy };
};
var getWritableMethods = (subprocessStdin, subprocess, waitWritableFinal) => ({
  write: onWrite.bind(undefined, subprocessStdin),
  final: callbackify3(onWritableFinal.bind(undefined, subprocessStdin, subprocess, waitWritableFinal))
});
var onWrite = (subprocessStdin, chunk, encoding, done) => {
  if (subprocessStdin.write(chunk, encoding)) {
    done();
  } else {
    subprocessStdin.once("drain", done);
  }
};
var onWritableFinal = async (subprocessStdin, subprocess, waitWritableFinal) => {
  if (!await waitForConcurrentStreams(waitWritableFinal, subprocess)) {
    return;
  }
  if (subprocessStdin.writable) {
    subprocessStdin.end();
  }
  await subprocess;
};
var onStdinFinished = async (subprocessStdin, writable2, subprocessStdout, subprocess) => {
  try {
    await waitForSubprocessStdin(subprocessStdin);
    await subprocess;
    if (writable2.writable) {
      writable2.end();
    }
  } catch (error) {
    await safeWaitForSubprocessStdout(subprocessStdout);
    destroyOtherWritable(writable2, await getSubprocessError(subprocess, error));
  }
};
var getSubprocessError = async (subprocess, error) => {
  if (!shouldUseSubprocessError(error)) {
    return error;
  }
  try {
    await subprocess;
  } catch (subprocessError) {
    return subprocessError;
  }
  return error;
};
var shouldUseSubprocessError = (error) => error === undefined || isStreamAbort(error);
var onWritableDestroy = async ({ subprocessStdin, subprocess, waitWritableFinal, waitWritableDestroy }, error) => {
  await waitForConcurrentStreams(waitWritableFinal, subprocess);
  if (await waitForConcurrentStreams(waitWritableDestroy, subprocess)) {
    destroyOtherWritable(subprocessStdin, error);
    await waitForSubprocess(subprocess, error);
  }
};
var destroyOtherWritable = (stream, error) => {
  destroyOtherStream(stream, stream.writable, error);
};

// node_modules/execa/lib/convert/duplex.js
import { Duplex as Duplex4 } from "node:stream";
import { callbackify as callbackify4 } from "node:util";
var createDuplex = ({ subprocess, concurrentStreams, encoding }, { from, to, binary: binaryOption = true, preserveNewlines = true } = {}) => {
  const binary = binaryOption || BINARY_ENCODINGS.has(encoding);
  const { subprocessStdout, waitReadableDestroy } = getSubprocessStdout(subprocess, from, concurrentStreams);
  const { subprocessStdin, waitWritableFinal, waitWritableDestroy } = getSubprocessStdin(subprocess, to, concurrentStreams);
  const { readableEncoding, readableObjectMode, readableHighWaterMark } = getReadableOptions(subprocessStdout, binary);
  const { read, onStdoutDataDone } = getReadableMethods({
    subprocessStdout,
    subprocess,
    binary,
    encoding,
    preserveNewlines
  });
  const duplex2 = new Duplex4({
    read,
    ...getWritableMethods(subprocessStdin, subprocess, waitWritableFinal),
    destroy: callbackify4(onDuplexDestroy.bind(undefined, {
      subprocessStdout,
      subprocessStdin,
      subprocess,
      waitReadableDestroy,
      waitWritableFinal,
      waitWritableDestroy
    })),
    readableHighWaterMark,
    writableHighWaterMark: subprocessStdin.writableHighWaterMark,
    readableObjectMode,
    writableObjectMode: subprocessStdin.writableObjectMode,
    encoding: readableEncoding
  });
  onStdoutFinished({
    subprocessStdout,
    onStdoutDataDone,
    readable: duplex2,
    subprocess,
    subprocessStdin
  });
  onStdinFinished(subprocessStdin, duplex2, subprocessStdout, subprocess);
  return duplex2;
};
var onDuplexDestroy = async ({ subprocessStdout, subprocessStdin, subprocess, waitReadableDestroy, waitWritableFinal, waitWritableDestroy }, error) => {
  await Promise.all([
    onReadableDestroy({ subprocessStdout, subprocess, waitReadableDestroy }, error),
    onWritableDestroy({
      subprocessStdin,
      subprocess,
      waitWritableFinal,
      waitWritableDestroy
    }, error)
  ]);
};

// node_modules/execa/lib/convert/add.js
var addConvertedStreams = (subprocess, { encoding }) => {
  const concurrentStreams = initializeConcurrentStreams();
  subprocess.readable = createReadable.bind(undefined, { subprocess, concurrentStreams, encoding });
  subprocess.writable = createWritable.bind(undefined, { subprocess, concurrentStreams });
  subprocess.duplex = createDuplex.bind(undefined, { subprocess, concurrentStreams, encoding });
  subprocess.readableStream = createReadableStream.bind(undefined, subprocess);
  subprocess.writableStream = createWritableStream.bind(undefined, subprocess);
  subprocess.transformStream = createTransformStream.bind(undefined, subprocess);
  subprocess.iterable = createIterable.bind(undefined, subprocess, encoding);
  subprocess[Symbol.asyncIterator] = createIterable.bind(undefined, subprocess, encoding, {});
};

// node_modules/execa/lib/methods/promise.js
var mergePromise = (promise, properties) => Object.assign(promise, properties);

// node_modules/execa/lib/methods/main-async.js
var execaCoreAsync = (rawFile, rawArguments, rawOptions, createNested) => {
  const { file, commandArguments, command, escapedCommand, startTime, verboseInfo, options, fileDescriptors } = handleAsyncArguments(rawFile, rawArguments, rawOptions);
  const { subprocess: nodeChildProcess, promise, kill, all, convertedStreams } = spawnSubprocessAsync({
    file,
    commandArguments,
    options,
    startTime,
    verboseInfo,
    command,
    escapedCommand,
    fileDescriptors
  });
  const subprocess = getSubprocessPromise({
    promise,
    nodeChildProcess,
    kill,
    all,
    convertedStreams,
    options
  });
  subprocess.pipe = pipeToSubprocess.bind(undefined, {
    source: subprocess,
    sourcePromise: promise,
    boundOptions: {},
    createNested
  });
  SUBPROCESS_OPTIONS.set(subprocess, { options, fileDescriptors });
  return subprocess;
};
var handleAsyncArguments = (rawFile, rawArguments, rawOptions) => {
  const { command, escapedCommand, startTime, verboseInfo } = handleCommand(rawFile, rawArguments, rawOptions);
  const { file, commandArguments, options: normalizedOptions } = normalizeOptions(rawFile, rawArguments, rawOptions);
  const options = handleAsyncOptions(normalizedOptions);
  const fileDescriptors = handleStdioAsync(options, verboseInfo);
  return {
    file,
    commandArguments,
    command,
    escapedCommand,
    startTime,
    verboseInfo,
    options,
    fileDescriptors
  };
};
var handleAsyncOptions = ({ timeout, signal, ...options }) => {
  if (signal !== undefined) {
    throw new TypeError('The "signal" option has been renamed to "cancelSignal" instead.');
  }
  return { ...options, timeoutDuration: timeout };
};
var spawnSubprocessAsync = ({ file, commandArguments, options, startTime, verboseInfo, command, escapedCommand, fileDescriptors }) => {
  let subprocess;
  try {
    subprocess = spawn(...concatenateShell(file, commandArguments, getSpawnOptions(options)));
  } catch (error) {
    return handleEarlyError({
      error,
      command,
      escapedCommand,
      fileDescriptors,
      options,
      startTime,
      verboseInfo
    });
  }
  const controller = new AbortController;
  setMaxListeners(Infinity, controller.signal);
  const originalStreams = [...subprocess.stdio];
  pipeOutputAsync(subprocess, fileDescriptors, controller);
  setIpcSubprocessOptions(subprocess, options);
  const context = {};
  const onInternalError = createDeferred();
  const kill = subprocessKill.bind(undefined, {
    kill: getKillFunction(subprocess, options),
    options,
    onInternalError,
    context,
    controller
  });
  cleanupOnExit(kill, options, controller);
  const all = makeAllStream(subprocess, options);
  const promise = handlePromise({
    subprocess,
    kill,
    all,
    options,
    startTime,
    verboseInfo,
    fileDescriptors,
    originalStreams,
    command,
    escapedCommand,
    context,
    onInternalError,
    controller
  });
  return {
    subprocess,
    promise,
    kill,
    all
  };
};
var getSubprocessPromise = ({ promise, nodeChildProcess, kill, all, convertedStreams, options }) => {
  const subprocess = mergePromise(promise, getSubprocessProperties(nodeChildProcess, all));
  subprocess.kill = kill ?? subprocess.kill;
  if (convertedStreams === undefined) {
    addConvertedStreams(subprocess, options);
  } else {
    Object.assign(subprocess, convertedStreams);
  }
  addIpcMethods(subprocess, nodeChildProcess, options);
  return subprocess;
};
var getSubprocessProperties = (nodeChildProcess, all) => ({
  nodeChildProcess,
  pid: nodeChildProcess.pid,
  stdin: nodeChildProcess.stdin,
  stdout: nodeChildProcess.stdout,
  stderr: nodeChildProcess.stderr,
  stdio: nodeChildProcess.stdio,
  all,
  kill: nodeChildProcess.kill.bind(nodeChildProcess)
});
var handlePromise = async ({ subprocess, kill, all: allStream, options, startTime, verboseInfo, fileDescriptors, originalStreams, command, escapedCommand, context, onInternalError, controller }) => {
  const [
    errorInfo,
    [exitCode, signal],
    stdioResults,
    allResult,
    ipcOutput
  ] = await waitForSubprocessResult({
    subprocess,
    kill,
    all: allStream,
    options,
    context,
    verboseInfo,
    fileDescriptors,
    originalStreams,
    onInternalError,
    controller
  });
  controller.abort();
  onInternalError.resolve();
  const stdio = stdioResults.map((stdioResult, fdNumber) => stripNewline(stdioResult, options, fdNumber));
  const all = stripNewline(allResult, options, "all");
  const result = getAsyncResult({
    errorInfo,
    exitCode,
    signal,
    stdio,
    all,
    ipcOutput,
    context,
    options,
    command,
    escapedCommand,
    startTime
  });
  return handleResult(result, verboseInfo, options);
};
var getAsyncResult = ({ errorInfo, exitCode, signal, stdio, all, ipcOutput, context, options, command, escapedCommand, startTime }) => ("error" in errorInfo) ? makeError({
  error: errorInfo.error,
  command,
  escapedCommand,
  timedOut: context.terminationReason === "timeout",
  isCanceled: context.terminationReason === "cancel" || context.terminationReason === "gracefulCancel",
  isGracefullyCanceled: context.terminationReason === "gracefulCancel",
  isMaxBuffer: errorInfo.error instanceof MaxBufferError,
  isForcefullyTerminated: context.isForcefullyTerminated,
  exitCode,
  signal,
  stdio,
  all,
  ipcOutput,
  options,
  startTime,
  isSync: false
}) : makeSuccessResult({
  command,
  escapedCommand,
  stdio,
  all,
  ipcOutput,
  options,
  startTime
});

// node_modules/execa/lib/methods/bind.js
var mergeOptions = (boundOptions, options) => {
  const safeBoundOptions = { __proto__: null, ...boundOptions };
  const mergedOptions = Object.fromEntries(Object.entries(options).map(([optionName, optionValue]) => [
    optionName,
    mergeOption(optionName, safeBoundOptions[optionName], optionValue)
  ]));
  return { ...safeBoundOptions, ...mergedOptions };
};
var mergeOption = (optionName, boundOptionValue, optionValue) => {
  if (DEEP_OPTIONS.has(optionName) && isPlainObject(boundOptionValue) && isPlainObject(optionValue)) {
    return { ...boundOptionValue, ...optionValue };
  }
  return optionValue;
};
var DEEP_OPTIONS = new Set(["env", ...FD_SPECIFIC_OPTIONS]);

// node_modules/execa/lib/methods/create.js
var createExeca = (mapArguments, boundOptions, deepOptions, setBoundExeca) => {
  const createNested = (mapArguments2, boundOptions2, setBoundExeca2) => createExeca(mapArguments2, boundOptions2, deepOptions, setBoundExeca2);
  const boundExeca = (...execaArguments) => callBoundExeca({
    mapArguments,
    deepOptions,
    boundOptions,
    setBoundExeca,
    createNested
  }, ...execaArguments);
  if (setBoundExeca !== undefined) {
    setBoundExeca(boundExeca, createNested, boundOptions);
  }
  return boundExeca;
};
var callBoundExeca = ({ mapArguments, deepOptions = {}, boundOptions = {}, setBoundExeca, createNested }, firstArgument, ...nextArguments) => {
  if (isPlainObject(firstArgument)) {
    return createNested(mapArguments, mergeOptions(boundOptions, firstArgument), setBoundExeca);
  }
  const { file, commandArguments, options, isSync } = parseArguments({
    mapArguments,
    firstArgument,
    nextArguments,
    deepOptions,
    boundOptions
  });
  return isSync ? execaCoreSync(file, commandArguments, options) : execaCoreAsync(file, commandArguments, options, createNested);
};
var parseArguments = ({ mapArguments, firstArgument, nextArguments, deepOptions, boundOptions }) => {
  const callArguments = isTemplateString(firstArgument) ? parseTemplates(firstArgument, nextArguments) : [firstArgument, ...nextArguments];
  const [initialFile, initialArguments, initialOptions] = normalizeParameters(...callArguments);
  const mergedOptions = mergeOptions(mergeOptions(deepOptions, boundOptions), initialOptions);
  const {
    options = mergedOptions,
    isSync = false
  } = mapArguments({ options: mergedOptions });
  return {
    file: initialFile,
    commandArguments: initialArguments,
    options,
    isSync
  };
};

// node_modules/execa/lib/methods/script.js
var setScriptSync = (boundExeca, createNested, boundOptions) => {
  boundExeca.sync = createNested(mapScriptSync, boundOptions);
  boundExeca.s = boundExeca.sync;
};
var mapScriptAsync = ({ options }) => getScriptOptions(options);
var mapScriptSync = ({ options }) => ({ ...getScriptOptions(options), isSync: true });
var getScriptOptions = (options) => ({ options: { ...getScriptStdinOption(options), ...options } });
var getScriptStdinOption = ({ input, inputFile, stdio }) => input === undefined && inputFile === undefined && stdio === undefined ? { stdin: "inherit" } : {};
var deepScriptOptions = { preferLocal: true };

// node_modules/execa/index.js
var execa = createExeca(() => ({}));
var execaSync = createExeca(() => ({ isSync: true }));
var execaNode = createExeca(mapNode);
var $ = createExeca(mapScriptAsync, {}, deepScriptOptions, setScriptSync);
var {
  sendMessage: sendMessage2,
  getOneMessage: getOneMessage2,
  getEachMessage: getEachMessage2,
  getCancelSignal: getCancelSignal2
} = getIpcExport();

// src/presentation/install/package-installer.ts
var installDependencies = async (options) => {
  const { cwd, packageManager, spinner: spinner2 } = options;
  spinner2.start("Installing dependencies...");
  try {
    const result = await execa(packageManager, ["install"], { cwd });
    if (result.failed || result.exitCode !== 0) {
      const errorMsg = result.stderr || `Install failed with exit code ${result.exitCode}`;
      spinner2.error(`Installation failed: ${errorMsg}`);
      return err(errorMsg);
    }
    spinner2.stop("Dependencies installed successfully");
    return ok(undefined);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    spinner2.error(`Installation failed: ${errorMsg}`);
    return err(errorMsg);
  }
};

// src/presentation/parsers/args-parser.ts
var parseArgs = (args) => {
  const overwrite = args.overwrite === true;
  const noOverwrite = args["no-overwrite"] === true || args.noOverwrite === true;
  return {
    help: args.help === true,
    version: args.version === true,
    noInteractive: args["no-interactive"] === true || args.noInteractive === true,
    overwrite: noOverwrite ? false : overwrite,
    noOverwrite,
    dryRun: args.dryRun === true || args["dry-run"] === true,
    immediate: args.immediate === true,
    projectName: typeof args._[0] === "string" ? args._[0] : "",
    runtime: typeof args.runtime === "string" ? args.runtime : "",
    language: typeof args.language === "string" ? args.language : "",
    linter: typeof args.linter === "string" ? args.linter : "",
    testFramework: typeof args.test === "string" ? args.test : "",
    preCommit: typeof args.precommit === "string" ? args.precommit : "",
    packageManager: typeof args.pm === "string" ? args.pm : "",
    unknownArgs: args._.slice(1).map(String)
  };
};
var parsedArgsToScaffoldInput = (parsed) => {
  const result = {};
  if (parsed.projectName) {
    result.projectName = parsed.projectName;
  }
  if (parsed.runtime) {
    result.runtime = parsed.runtime;
  }
  if (parsed.language) {
    result.language = parsed.language;
  }
  if (parsed.linter) {
    result.linter = parsed.linter;
  }
  if (parsed.testFramework) {
    result.testFramework = parsed.testFramework;
  }
  if (parsed.preCommit) {
    result.preCommit = parsed.preCommit;
  }
  if (parsed.packageManager) {
    result.packageManager = parsed.packageManager;
  }
  if (parsed.overwrite) {
    result.overwrite = true;
  }
  if (parsed.dryRun) {
    result.dryRun = true;
  }
  return result;
};

// src/presentation/wizard/interactive-wizard.ts
var RUNTIME_OPTIONS = [
  { value: "node", label: "Node.js", hint: "Node.js 18+" },
  { value: "bun", label: "Bun", hint: "Bun 1.0+" }
];
var LANGUAGE_OPTIONS = [
  { value: "typescript", label: "TypeScript", hint: "Static typing" },
  { value: "javascript", label: "JavaScript", hint: "Dynamic typing" }
];
var PM_OPTIONS = [
  { value: "npm", label: "npm", hint: "Node package manager" },
  { value: "pnpm", label: "pnpm", hint: "Fast, disk-efficient" },
  { value: "yarn", label: "Yarn", hint: "Yarn Classic" },
  { value: "bun", label: "Bun", hint: "Bun package manager" }
];
var LINTER_OPTIONS = [
  { value: "biome", label: "Biome", hint: "Fast all-in-one linter/formatter" },
  { value: "eslint-prettier", label: "ESLint + Prettier", hint: "Traditional setup" },
  { value: "none", label: "None", hint: "Skip linter setup" }
];
var TEST_OPTIONS = [
  { value: "vitest", label: "Vitest", hint: "Fast ESM-native test runner" }
];
var PRECOMMIT_OPTIONS = [
  { value: "lefthook", label: "Lefthook", hint: "Fast, Go-based hook manager" },
  { value: "husky", label: "Husky", hint: "Git hooks made easy" },
  { value: "none", label: "None", hint: "Skip Git hook setup" }
];
var runInteractiveWizard = async (partial, prompts) => {
  prompts.intro("create-ink-app");
  const result = {
    projectName: DEFAULT_SCAFFOLD_INPUT.projectName,
    runtime: DEFAULT_SCAFFOLD_INPUT.runtime,
    language: DEFAULT_SCAFFOLD_INPUT.language,
    linter: DEFAULT_SCAFFOLD_INPUT.linter,
    testFramework: DEFAULT_SCAFFOLD_INPUT.testFramework,
    preCommit: DEFAULT_SCAFFOLD_INPUT.preCommit,
    packageManager: DEFAULT_SCAFFOLD_INPUT.packageManager,
    installDeps: DEFAULT_SCAFFOLD_INPUT.installDeps,
    overwrite: DEFAULT_SCAFFOLD_INPUT.overwrite,
    dryRun: DEFAULT_SCAFFOLD_INPUT.dryRun
  };
  if (!partial.projectName) {
    const projectNameResult = await prompts.text({
      message: "What is the name of your project?",
      placeholder: "my-ink-app",
      defaultValue: "my-ink-app"
    });
    if (prompts.isCancel(projectNameResult))
      throw new Error("Cancelled");
    result.projectName = projectNameResult;
  } else {
    result.projectName = partial.projectName;
  }
  if (!partial.runtime) {
    const runtimeResult = await prompts.select({
      message: "Which runtime does your project use?",
      options: RUNTIME_OPTIONS,
      initialValue: result.runtime
    });
    if (prompts.isCancel(runtimeResult))
      throw new Error("Cancelled");
    result.runtime = runtimeResult;
  } else {
    result.runtime = partial.runtime;
  }
  if (!partial.language) {
    const languageResult = await prompts.select({
      message: "Which language?",
      options: LANGUAGE_OPTIONS,
      initialValue: result.language
    });
    if (prompts.isCancel(languageResult))
      throw new Error("Cancelled");
    result.language = languageResult;
  } else {
    result.language = partial.language;
  }
  if (result.runtime === "bun") {
    result.packageManager = "bun";
  } else if (!partial.packageManager) {
    const pmResult = await prompts.select({
      message: "Which package manager?",
      options: PM_OPTIONS,
      initialValue: result.packageManager
    });
    if (prompts.isCancel(pmResult))
      throw new Error("Cancelled");
    result.packageManager = pmResult;
  } else {
    result.packageManager = partial.packageManager;
  }
  if (!partial.linter) {
    const linterResult = await prompts.select({
      message: "Which linter/formatter?",
      options: LINTER_OPTIONS,
      initialValue: result.linter
    });
    if (prompts.isCancel(linterResult))
      throw new Error("Cancelled");
    result.linter = linterResult;
  } else {
    result.linter = partial.linter;
  }
  if (result.runtime !== "bun" && !partial.testFramework) {
    const testResult = await prompts.select({
      message: "Which test framework?",
      options: TEST_OPTIONS,
      initialValue: result.testFramework
    });
    if (prompts.isCancel(testResult))
      throw new Error("Cancelled");
    result.testFramework = testResult;
  } else if (partial.testFramework) {
    result.testFramework = partial.testFramework;
  }
  if (!partial.preCommit) {
    const precommitResult = await prompts.select({
      message: "Which pre-commit tool?",
      options: PRECOMMIT_OPTIONS,
      initialValue: result.preCommit
    });
    if (prompts.isCancel(precommitResult))
      throw new Error("Cancelled");
    result.preCommit = precommitResult;
  } else {
    result.preCommit = partial.preCommit;
  }
  if (partial.installDeps === undefined) {
    const installResult = await prompts.confirm({
      message: "Install dependencies?",
      initialValue: true
    });
    if (prompts.isCancel(installResult))
      throw new Error("Cancelled");
    result.installDeps = installResult;
  } else {
    result.installDeps = partial.installDeps;
  }
  return result;
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
var cleanExit = () => {
  process.exit(0);
};
var setupSignalHandlers = (cleanup) => {
  const handler = () => {
    cleanup?.();
    cleanExit();
  };
  process.on("SIGINT", handler);
  process.on("SIGTERM", handler);
  return () => {
    process.off("SIGINT", handler);
    process.off("SIGTERM", handler);
  };
};
var resolveProjectTarget = (projectName) => {
  if (projectName === ".") {
    const cwd = process.cwd();
    return {
      targetDir: ".",
      displayName: path10.basename(cwd)
    };
  }
  return { targetDir: projectName, displayName: projectName };
};
var resolveOverwriteMode = (overwrite, noOverwrite) => {
  if (overwrite)
    return "yes";
  if (noOverwrite)
    return "no";
  return "ask";
};
var shouldHandleOverwrite = (targetDir, overwriteMode) => {
  const dirExists = fs3.existsSync(targetDir);
  if (!dirExists)
    return "proceed";
  if (overwriteMode === "yes")
    return "proceed";
  if (overwriteMode === "no")
    return "abort";
  return "prompt";
};
var runCreateApp = async (scaffoldProject, options) => {
  let scaffoldStarted = false;
  const removeHandlers = setupSignalHandlers(() => {
    if (scaffoldStarted) {
      console.log(`
  ⚠ Scaffold interrupted. Partial output may exist.`);
    }
  });
  const rawArgs = process.argv.slice(2);
  const parsed = import_mri.default(rawArgs, {
    alias: {
      help: ["h"],
      version: ["v"],
      "no-interactive": ["noInteractive"],
      "no-overwrite": ["noOverwrite"],
      overwrite: ["o"],
      "dry-run": ["dryRun"]
    },
    boolean: [
      "help",
      "version",
      "no-interactive",
      "no-overwrite",
      "overwrite",
      "dry-run",
      "immediate"
    ],
    string: ["runtime", "language", "linter", "test", "precommit", "pm"],
    default: {
      help: false,
      version: false,
      "no-interactive": false,
      "no-overwrite": false,
      overwrite: false,
      "dry-run": false,
      immediate: false,
      runtime: "",
      language: "",
      linter: "",
      test: "",
      precommit: "",
      pm: ""
    }
  });
  const args = parseArgs(parsed);
  if (args.help) {
    removeHandlers();
    console.log(formatHelp());
    gracefulExit(0);
    return;
  }
  if (args.version) {
    removeHandlers();
    console.log(formatVersion(options.version));
    gracefulExit(0);
    return;
  }
  const partialInput = parsedArgsToScaffoldInput(args);
  const aiAgent = isAIAgent();
  const tty3 = isInteractive();
  const useInteractive = !args.noInteractive && tty3 && !aiAgent;
  if (useInteractive) {
    try {
      const wizardState = await runInteractiveWizard(partialInput, {
        text,
        select,
        confirm,
        isCancel,
        intro,
        outro
      });
      const pm2 = detectPackageManager();
      const { targetDir: targetDir2, displayName: displayName2 } = resolveProjectTarget(wizardState.projectName);
      const finalInput2 = resolveScaffoldState({
        ...wizardState,
        targetDir: targetDir2,
        projectName: displayName2,
        packageManager: wizardState.packageManager || pm2
      }, DEFAULT_SCAFFOLD_INPUT);
      const overwriteMode2 = resolveOverwriteMode(finalInput2.overwrite, args.noOverwrite);
      const overwriteAction2 = shouldHandleOverwrite(targetDir2, overwriteMode2);
      if (overwriteAction2 === "abort") {
        removeHandlers();
        console.error(`  ✗ Directory "${targetDir2}" already exists. Use --overwrite to overwrite.`);
        gracefulExit(1);
        return;
      }
      if (overwriteAction2 === "prompt") {
        const overwriteResult = await confirm({
          message: `Directory "${targetDir2}" already exists. Overwrite?`,
          initialValue: false
        });
        if (isCancel(overwriteResult)) {
          removeHandlers();
          console.log(formatCancelMessage());
          gracefulExit(0);
          return;
        }
        finalInput2.overwrite = overwriteResult;
      }
      outro("Ready to scaffold!");
      scaffoldStarted = true;
      const result2 = scaffoldProject(finalInput2);
      const scaffoldOptions2 = {
        runtime: finalInput2.runtime,
        packageManager: finalInput2.packageManager
      };
      const { text: text3, exitCode: exitCode2 } = formatScaffoldResult(result2, scaffoldOptions2);
      if (exitCode2 === 0) {
        console.log(text3);
        if (args.immediate && finalInput2.installDeps) {
          const s = spinner();
          const installResult = await installDependencies({
            cwd: path10.resolve(targetDir2),
            packageManager: finalInput2.packageManager,
            spinner: s
          });
          if (installResult.ok) {
            console.log(formatInstallInstructions(finalInput2.packageManager, finalInput2.runtime));
          } else {
            removeHandlers();
            gracefulExit(1);
            return;
          }
        } else if (args.immediate && !finalInput2.installDeps) {
          console.log(formatInstallInstructions(finalInput2.packageManager, finalInput2.runtime));
        }
      } else {
        console.error(text3);
      }
      removeHandlers();
      gracefulExit(exitCode2);
      return;
    } catch (error) {
      if (error instanceof Error && error.message === "Cancelled") {
        removeHandlers();
        console.log(formatCancelMessage());
        gracefulExit(0);
        return;
      }
      throw error;
    }
  }
  if (!tty3 && aiAgent) {
    console.log(formatAIAgentHint());
  } else if (!tty3 && args.noInteractive) {
    console.log(formatNonInteractiveHint());
  }
  if (!args.projectName) {
    removeHandlers();
    console.error("  ✗ Project name is required when running in non-interactive mode.");
    console.error("  Usage: create-ink-app <project-name> [options]");
    console.error("  Try:   create-ink-app --help");
    gracefulExit(1);
    return;
  }
  const { targetDir, displayName } = resolveProjectTarget(args.projectName);
  const pm = detectPackageManager();
  const overwriteMode = resolveOverwriteMode(args.overwrite, args.noOverwrite);
  const overwriteAction = shouldHandleOverwrite(targetDir, overwriteMode);
  if (overwriteAction === "abort" || overwriteAction === "prompt") {
    removeHandlers();
    console.error(`  ✗ Directory "${targetDir}" already exists. Use --overwrite to overwrite.`);
    gracefulExit(1);
    return;
  }
  const finalInput = resolveScaffoldState({
    ...partialInput,
    targetDir,
    projectName: displayName,
    packageManager: partialInput.packageManager || pm
  }, DEFAULT_SCAFFOLD_INPUT);
  scaffoldStarted = true;
  const result = scaffoldProject(finalInput);
  const scaffoldOptions = {
    runtime: finalInput.runtime,
    packageManager: finalInput.packageManager
  };
  const { text: text2, exitCode } = formatScaffoldResult(result, scaffoldOptions);
  if (exitCode === 0) {
    console.log(text2);
    if (args.immediate && finalInput.installDeps) {
      const s = spinner();
      const installResult = await installDependencies({
        cwd: path10.resolve(targetDir),
        packageManager: finalInput.packageManager,
        spinner: s
      });
      if (installResult.ok) {
        console.log(formatInstallInstructions(finalInput.packageManager, finalInput.runtime));
      } else {
        removeHandlers();
        gracefulExit(1);
        return;
      }
    } else if (args.immediate && !finalInput.installDeps) {
      console.log(formatInstallInstructions(finalInput.packageManager, finalInput.runtime));
    }
  } else {
    console.error(text2);
  }
  removeHandlers();
  gracefulExit(exitCode);
};
// package.json
var package_default = {
  name: "@xzy-ai/create-ink-app",
  version: "0.1.6",
  description: "Scaffold a complete, runnable Ink React project",
  type: "module",
  bin: {
    "create-ink-app": "bin/create-ink-app.js"
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
    "@clack/prompts": "^1.7.0",
    execa: "^10.0.0",
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
    "bin/",
    "package.json"
  ]
};

// src/index.ts
var __filename2 = fileURLToPath3(import.meta.url);
var packageRoot = path11.resolve(path11.dirname(__filename2), "..");
var fs4 = makeNodeFileSystem();
var templates = makeTemplateEngine(fs4);
var checkNodeRuntime = makeNodeRuntimeChecker();
var checkBunRuntime = makeBunRuntimeChecker();
var checkRuntime = (runtime) => {
  if (runtime === "bun")
    return checkBunRuntime();
  return checkNodeRuntime();
};
var scaffoldProject = makeScaffoldProject({
  fs: fs4,
  templates,
  templatesDir: path11.join(packageRoot, "templates"),
  checkRuntime
});
runCreateApp(scaffoldProject, { version: package_default.version });
