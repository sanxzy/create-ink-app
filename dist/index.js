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
import * as path2 from "node:path";
import { fileURLToPath } from "node:url";

// src/application/services/config-generators.ts
var generatePackageJson = (ctx) => {
  const isBun = ctx.runtime === "bun";
  const scripts = {};
  if (isBun) {
    scripts.build = `bun build --target=node --outdir=dist source/cli.${ctx.language === "typescript" ? "tsx" : "jsx"}`;
    scripts.dev = `bun --watch source/cli.${ctx.language === "typescript" ? "tsx" : "jsx"}`;
    scripts.start = "bun dist/cli.js";
    scripts.test = "bun test";
  } else {
    scripts.build = ctx.language === "typescript" ? "tsc" : "bun build --target=node --outdir=dist source/cli.jsx";
    scripts.dev = ctx.language === "typescript" ? "tsc --watch" : "bun --watch source/cli.jsx";
    scripts.start = "node dist/cli.js";
    scripts.test = "vitest run";
  }
  if (ctx.language === "typescript") {
    scripts.typecheck = "tsc --noEmit";
  }
  if (ctx.linter === "biome") {
    scripts.lint = "biome check source/";
    scripts.format = "biome format --write source/";
    scripts.check = "biome check --write source/";
  } else if (ctx.linter === "eslint-prettier") {
    scripts.lint = "eslint source/";
    scripts.format = "prettier --write source/";
    scripts.check = "eslint source/ --fix";
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
    return ["source/app.jsx.template", "source/cli.jsx.template", "test.jsx.template"];
  }
  return ["source/app.tsx.template", "source/cli.tsx.template", "test.tsx.template"];
};
var getTemplateDir = (runtime, language) => {
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

// node_modules/@clack/core/dist/index.mjs
import { styleText } from "node:util";
import { stdout, stdin } from "node:process";
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
function findCursor(s, o, l) {
  if (!l.some((r) => !r.disabled))
    return s;
  const t = s + o, n = Math.max(l.length - 1, 0), e = t < 0 ? n : t > n ? 0 : t;
  return l[e]?.disabled ? findCursor(e, o < 0 ? -1 : 1, l) : e;
}
function findTextCursor(s, o, l, i) {
  const t = i.split(`
`);
  let n = 0, e = s;
  for (const r of t) {
    if (e <= r.length)
      break;
    e -= r.length + 1, n++;
  }
  for (n = Math.max(0, Math.min(t.length - 1, n + l)), e = Math.min(e, t[n].length) + o;e < 0 && n > 0; )
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
function p$1(l, e) {
  if (l === undefined || e.length === 0)
    return 0;
  const i = e.findIndex((s) => s.value === l);
  return i !== -1 ? i : 0;
}
function g(l, e) {
  return (e.label ?? String(e.value)).toLowerCase().includes(l.toLowerCase());
}
function m(l, e) {
  if (e)
    return l ? e : e[0];
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
      let l = o.slice(0, u) + t2 + o.slice(u + 1), D = false;
      if (u === 0 && o === "__" && (e.type === "month" || e.type === "day")) {
        const h = Number.parseInt(t2, 10);
        l = `0${t2}`, D = h <= (e.type === "month" ? 1 : 2);
      }
      if (e.type === "year" && (l = (o.replace(/_/g, "") + t2).padStart(e.len, "_")), !l.includes("_")) {
        const h = { ...this.#t, [e.type]: l }, d = this.#g(h, e);
        if (d) {
          this.inlineError = d;
          return;
        }
      }
      this.inlineError = "", this.#t[e.type] = l;
      const y = l.includes("_") ? undefined : b(this.#t);
      if (y) {
        const { year: h, month: d } = y, g2 = c(h, d);
        this.#t = {
          year: String(Math.max(0, Math.min(9999, h))).padStart(4, "0"),
          month: String(Math.max(1, Math.min(12, d))).padStart(2, "0"),
          day: String(Math.max(1, Math.min(g2, y.day))).padStart(2, "0")
        };
      }
      this.#r();
      const S = l.indexOf("_");
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
var I = (l, e, w, p2, b2, C2 = false) => {
  let r2 = e, O = 0;
  if (C2)
    for (let i = p2 - 1;i >= w; i--) {
      const m2 = l[i];
      if (m2 && (r2 -= m2.length), O++, r2 <= b2)
        break;
    }
  else
    for (let i = w;i < p2; i++) {
      const m2 = l[i];
      if (m2 && (r2 -= m2.length), O++, r2 <= b2)
        break;
    }
  return { lineCount: r2, removals: O };
};
var limitOptions = ({
  cursor: l,
  options: e,
  style: w,
  output: p2 = process.stdout,
  maxItems: b2 = Number.POSITIVE_INFINITY,
  columnPadding: C2 = 0,
  rowPadding: r2 = 4
}) => {
  const i = getColumns(p2) - C2, m2 = getRows(p2), M2 = styleText2("dim", "..."), v = Math.max(m2 - r2, 0), a2 = Math.max(Math.min(b2, v), 5);
  let f2 = 0;
  l >= a2 - 3 && (f2 = Math.max(Math.min(l - a2 + 3, e.length - a2), 0));
  let d = a2 < e.length && f2 > 0, c2 = a2 < e.length && f2 + a2 < e.length;
  const W = Math.min(f2 + a2, e.length), s = [];
  let g2 = 0;
  d && g2++, c2 && g2++;
  const T3 = f2 + (d ? 1 : 0), y = W - (c2 ? 1 : 0);
  for (let t2 = T3;t2 < y; t2++) {
    const n3 = e[t2], o2 = n3 ? w(n3, t2 === l) : "", h2 = wrapAnsi(o2, i, {
      hard: true,
      trim: false
    }).split(`
`);
    s.push(h2), g2 += h2.length;
  }
  if (g2 > v) {
    let t2 = 0, n3 = 0, o2 = g2;
    const h2 = l - T3;
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
      const e = i.withGuide ?? settings.withGuide, u3 = `${symbol(this.state)}  `, l = e ? `${styleText2("gray", S_BAR)}  ` : "", f2 = wrapTextWithPrefix(i.output, i.message, l, u3), o2 = `${e ? `${styleText2("gray", S_BAR)}
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
`, c3 = e.placeholder && e.placeholder.length > 0 ? styleText2("inverse", e.placeholder[0]) + styleText2("dim", e.placeholder.slice(1)) : styleText2(["inverse", "hidden"], "_"), o2 = this.userInput ? this.userInputWithCursor : c3, l = this.value ?? "";
    switch (this.state) {
      case "error": {
        const n3 = this.error ? `  ${styleText2("yellow", this.error)}` : "", r2 = i2 ? `${styleText2("yellow", S_BAR)}  ` : "", d = i2 ? styleText2("yellow", S_BAR_END) : "";
        return `${s.trim()}
${r2}${o2}
${d}${n3}
`;
      }
      case "submit": {
        const n3 = l ? `  ${styleText2("dim", l)}` : "", r2 = i2 ? styleText2("gray", S_BAR) : "";
        return `${s}${r2}${n3}`;
      }
      case "cancel": {
        const n3 = l ? `  ${styleText2(["strikethrough", "dim"], l)}` : "", r2 = i2 ? styleText2("gray", S_BAR) : "";
        return `${s}${r2}${n3}${l.trim() ? `
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
var formatScaffoldSuccess = (result) => {
  const lines = [
    "",
    "  ✓ Project created successfully!",
    "",
    `  Project directory: ${result.projectDir}`,
    "",
    "  Files created:",
    ...result.files.map((f2) => `    • ${f2}`),
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
    case "runtime_not_found":
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
var formatScaffoldResult = (result) => {
  if (result.ok) {
    return { text: formatScaffoldSuccess(result.value), exitCode: 0 };
  }
  return { text: formatScaffoldError(result.error), exitCode: 1 };
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
  return {
    projectName: parsed.projectName || DEFAULT_SCAFFOLD_INPUT.projectName,
    runtime: parsed.runtime || DEFAULT_SCAFFOLD_INPUT.runtime,
    language: parsed.language || DEFAULT_SCAFFOLD_INPUT.language,
    linter: parsed.linter || DEFAULT_SCAFFOLD_INPUT.linter,
    testFramework: parsed.testFramework || DEFAULT_SCAFFOLD_INPUT.testFramework,
    preCommit: parsed.preCommit || DEFAULT_SCAFFOLD_INPUT.preCommit,
    packageManager: parsed.packageManager || DEFAULT_SCAFFOLD_INPUT.packageManager,
    overwrite: parsed.overwrite || DEFAULT_SCAFFOLD_INPUT.overwrite,
    dryRun: parsed.dryRun || DEFAULT_SCAFFOLD_INPUT.dryRun
  };
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
  if (!partial.packageManager) {
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
  if (!partial.testFramework) {
    const testResult = await prompts.select({
      message: "Which test framework?",
      options: TEST_OPTIONS,
      initialValue: result.testFramework
    });
    if (prompts.isCancel(testResult))
      throw new Error("Cancelled");
    result.testFramework = testResult;
  } else {
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
  prompts.outro("Ready to scaffold!");
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
var runCreateApp = async (scaffoldProject, options) => {
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
    console.log(formatHelp());
    gracefulExit(0);
    return;
  }
  if (args.version) {
    console.log(formatVersion(options.version));
    gracefulExit(0);
    return;
  }
  const partialInput = parsedArgsToScaffoldInput(args);
  const aiAgent = isAIAgent();
  const tty = isInteractive();
  const useInteractive = !args.noInteractive && tty && !aiAgent;
  if (useInteractive) {
    const wizardState = await runInteractiveWizard(partialInput, {
      text,
      select,
      confirm,
      isCancel,
      intro,
      outro
    });
    const pm2 = detectPackageManager();
    const finalInput2 = resolveScaffoldState({ ...wizardState, packageManager: wizardState.packageManager || pm2 }, DEFAULT_SCAFFOLD_INPUT);
    const result2 = scaffoldProject(finalInput2);
    const { text: text3, exitCode: exitCode2 } = formatScaffoldResult(result2);
    if (exitCode2 === 0) {
      console.log(text3);
    } else {
      console.error(text3);
    }
    gracefulExit(exitCode2);
    return;
  }
  if (!tty && aiAgent) {
    console.log(formatAIAgentHint());
  } else if (!tty && args.noInteractive) {
    console.log(formatNonInteractiveHint());
  }
  if (!args.projectName) {
    console.error("  ✗ Project name is required when running in non-interactive mode.");
    console.error("  Usage: create-ink-app <project-name> [options]");
    console.error("  Try:   create-ink-app --help");
    gracefulExit(1);
    return;
  }
  const pm = detectPackageManager();
  const finalInput = resolveScaffoldState({ ...partialInput, packageManager: partialInput.packageManager || pm }, DEFAULT_SCAFFOLD_INPUT);
  const result = scaffoldProject(finalInput);
  const { text: text2, exitCode } = formatScaffoldResult(result);
  if (exitCode === 0) {
    console.log(text2);
  } else {
    console.error(text2);
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
    "@clack/prompts": "^1.7.0",
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
var checkNodeRuntime = makeNodeRuntimeChecker();
var checkBunRuntime = makeBunRuntimeChecker();
var checkRuntime = (runtime) => {
  if (runtime === "bun")
    return checkBunRuntime();
  return checkNodeRuntime();
};
var scaffoldProject = makeScaffoldProject({
  fs: fs2,
  templates,
  templatesDir: path2.join(packageRoot, "templates"),
  checkRuntime
});
runCreateApp(scaffoldProject, { version: package_default.version });
