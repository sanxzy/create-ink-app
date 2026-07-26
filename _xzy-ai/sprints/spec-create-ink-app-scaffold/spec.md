# Engineering Specification — `@xzy-ai/create-ink-app`

> **Sprint:** `spec-create-ink-app-scaffold`
> **Date:** 2026-07-26
> **Status:** Draft

---

## Problem Statement

Developers building terminal applications with Ink today face an outdated, rigid, and increasingly broken scaffolding experience. The existing `create-ink-app` (v3.0.2, last updated 2023) has not kept pace with the modern JavaScript ecosystem:

**Outdated stack lock-in.** The old tool scaffolds projects with Ink v4 (React 18), forcing users onto a legacy version combination. It hardcodes npm as the only package manager, Babel for transpilation (10–100x slower than modern alternatives), ava as the test runner, and xo for linting — every one of these choices is stale or deprecated by current standards. Users who want Bun runtime support, esbuild, vitest, Biome, or any modern tool must manually rework the scaffolded output.

**No interactivity or choice.** The old tool accepts at most two arguments (project name + optional `--typescript` flag). There is no interactive wizard, no runtime selection, no tooling selection, and no way to opt out of features. Every project gets the same hardcoded defaults regardless of the user's preferences or environment.

**Single-runtime limitation.** The old tool supports Node.js only. Bun — now a fully viable runtime for Ink applications with confirmed compatibility — is ignored. Developers using Bun must manually create their entire project structure from scratch.

**No CI/CD or automation support.** The old tool has no non-interactive mode, no flag-based configuration, and no AI agent detection. It cannot be used in CI/CD pipelines, Docker builds, or AI agent workflows without complex workarounds.

**No post-scaffold guidance.** After scaffolding, the old tool shows a generic success message with no runtime-aware instructions. Users must already know the correct `npm run dev` or `bun run dev` command for their setup.

**Unmaintained dependency chain.** The old tool depends on libraries like `listr` (last published 2019), `meow`, `xo`, and `cpy` — several of which are unmaintained or deprecated. This creates a security and maintenance burden for any team using the scaffolded output.

The result is that developers who want to build modern Ink terminal applications must either accept a legacy scaffold and spend significant effort upgrading it, or start from scratch — neither option provides a good developer experience.

---

## Solution

`@xzy-ai/create-ink-app` solves these problems by providing a modern, interactive, runtime-agnostic project wizard that generates professional Ink applications with up-to-date tooling and best practices.

The tool is a single npm package (`@xzy-ai/create-ink-app`) that users run via `npx @xzy-ai/create-ink-app`. It presents an interactive wizard (when run in a terminal) or accepts CLI flags (when run non-interactively) to capture the developer's preferences across these dimensions:

- **Project name** — validated npm package name
- **Runtime** — Node.js or Bun (Deno is not supported)
- **Package manager** — auto-detected from `npm_config_user_agent`, with user override
- **Language** — TypeScript (default) or JavaScript
- **Linter/Formatter** — Biome, ESLint+Prettier, or none
- **Test framework** — automatically selected based on runtime (vitest for Node, bun:test for Bun)
- **Pre-commit hooks** — Lefthook, Husky, or none
- **Install dependencies** — yes/no confirmation

After collecting preferences, the tool uses a **hybrid template architecture**: base template files for the core Ink application structure (varying by runtime × language combination) plus programmatic generation of tool configuration files (varying by linter, test framework, and pre-commit choice). Template placeholders use `<% VAR %>` EJS-style substitution. The generated project includes:

- A fully functional, runnable Ink terminal application with `source/app.tsx` and `source/cli.tsx`
- Runtime-appropriate build scripts (esbuild for Node, `bun build` for Bun)
- Runtime-appropriate test setup (vitest + ink-testing-library for Node, bun:test + ink-testing-library for Bun)
- Selected linter/formatter configuration (Biome, ESLint+Prettier, or none)
- Selected pre-commit hooks configuration (Lefthook, Husky, or none)
- Ink v6+ with React 19+ (always latest versions — no version choice)
- A `compat.json` for version compatibility tracking
- Proper `.gitignore`, `.editorconfig`, and `readme.md`

Post-scaffold, the tool displays a runtime-aware success message with the exact commands the developer needs to run (`npm run dev` for Node scaffolds, `bun run dev` for Bun scaffolds). An `--immediate` flag auto-installs dependencies and shows next steps without waiting for a manual install command.

The tool operates in **three modes**:
- **Fully interactive** — all choices via `@clack/prompts` wizard (TTY terminal)
- **Fully non-interactive** — all flags provided, for CI/CD and AI agents (`--no-interactive`)
- **Mixed mode** — some flags provided, wizard prompts for the missing options

AI agent environments are auto-detected via `@vercel/detect-agent` with a helpful hint displayed showing the non-interactive usage pattern.

This solution replaces the legacy `create-ink-app` v3.0.2 entirely. The old codebase remains as a historical reference but the new tool is a greenfield implementation with no backward compatibility requirements.

---

## User Stories

### Interactive Wizard — Happy Path

- As a developer, I want to run `npx @xzy-ai/create-ink-app` with no arguments, so that the interactive wizard starts immediately in a TTY terminal.
- As a developer, I want to enter a project name that follows npm package naming rules, so that the scaffolded project has a valid, publishable package name.
- As a developer, I want to select between Node.js and Bun as my runtime, so that the scaffolded project uses the appropriate build system (esbuild or bun build) and test framework (vitest or bun:test) for my chosen runtime.
- As a developer, I want my package manager to be auto-detected from the `npm_config_user_agent` environment variable, so that I don't need to manually select the package manager I'm already using.
- As a developer, I want to override the auto-detected package manager, so that I can use a different package manager when desired (e.g., pnpm instead of npm).
- As a developer, I want to select TypeScript or JavaScript as my language, so that the scaffolded project has the type system and configuration files I prefer.
- As a developer, I want to select a linter/formatter option from Biome (unified), ESLint+Prettier (traditional), or none, so that the scaffolded project has code quality tooling matching my preferences.
- As a developer, I want the test framework to be automatically selected based on my runtime choice (vitest for Node, bun:test for Bun), so that I don't need to manually choose a test framework.
- As a developer, I want to select a pre-commit hook framework from Lefthook (recommended), Husky, or none, so that automated code quality checks run before commits if desired.
- As a developer, I want to confirm whether to install dependencies after scaffolding, so that I can choose to install immediately or defer installation.
- As a developer, I want to see a progress indicator (spinner) while dependencies are being installed, so that I know the tool is working during potentially long installs.

### Non-Interactive Mode

- As a developer, I want to run the tool with `--no-interactive` and provide all choices via CLI flags, so that I can scaffold projects in CI/CD pipelines and automated scripts.
- As a developer, I want the tool to require a project name argument in non-interactive mode but provide sensible defaults for all other options, so that CI/CD usage is concise.
- As a developer, I want to use individual flags (`--runtime`, `--language`, `--linter`, `--test`, `--precommit`, `--pm`) to control specific options in non-interactive mode, so that I can customize exactly what I need.
- As a developer, I want the tool to fail with a clear error message when required flags are missing in non-interactive mode, so that I know exactly what I need to provide.
- As a developer, I want the tool to exit with a non-zero exit code when scaffolding fails in non-interactive mode, so that CI/CD systems can detect the failure.

### Mixed Mode (Partial Flags)

- As a developer, I want to provide some flags but still receive interactive prompts for the missing options, so that I can pre-fill common choices while still being guided through the rest.
- As a developer, I want the tool to detect that it is running in a non-TTY environment (e.g., piped output) and automatically fall back to non-interactive mode using flag values or defaults, so that it works correctly without a terminal.

### Directory and Overwrite Handling

- As a developer, I want to scaffold a project into a new empty directory, so that the process completes without conflicts.
- As a developer, I want to be prompted before scaffolding into a non-empty directory, so that I can confirm or cancel to prevent data loss.
- As a developer, I want to use the `--overwrite` flag to automatically overwrite the contents of an existing directory, so that I can re-scaffold a project without being prompted.
- As a developer, I want to use the `--no-overwrite` flag to explicitly refuse overwriting an existing directory, so that I protect existing files from accidental replacement.
- As a developer, I want to scaffold a project into the current directory by passing `.` as the project name/path, so that I can initialize an Ink project in my current working directory.

### Post-Scaffold Experience

- As a developer, I want to see a formatted success message after scaffolding completes, so that I know the project was created successfully.
- As a developer, I want to see runtime-aware post-scaffold instructions (e.g., `npm run dev` for Node, `bun run dev` for Bun), so that I know the correct command to start my project.
- As a developer, I want to see a summary of my chosen options in the post-scaffold message, so that I can confirm my selections were applied correctly.
- As a developer, I want to use the `--immediate` flag to automatically install dependencies and show post-scaffold instructions, so that I can get started immediately without a separate install step.
- As a developer, I want the post-scaffold message to include the correct package manager-specific install commands, so that I don't need to mentally translate between package managers.

### Cancellation and Error Recovery

- As a developer, I want to cancel the wizard at any prompt using Ctrl+C or Escape, so that I can abort the scaffolding process cleanly.
- As a developer, I want to see a clear "Operation cancelled" message when I cancel the wizard, so that I know the process was aborted intentionally (not crashed).
- As a developer, I want the tool to exit with code 0 after a clean cancellation (user-initiated), so that shell workflows are not disrupted.
- As a developer, I want to see inline validation errors when I enter an invalid project name, so that I can correct my input before proceeding (npm naming rules: lowercase, no leading dot or underscore, no spaces).
- As a developer, I want to see an error when the target directory is not writable, so that I can check permissions or choose a different location.
- As a developer, I want to see an error when dependency installation fails (network error, package manager not found, registry unavailable), so that I can troubleshoot the issue.
- As a developer, I want the tool to clean up partial output if scaffolding fails mid-process, so that I don't end up with a broken project directory.
- As a developer, I want the tool to handle SIGINT and SIGTERM signals gracefully during long operations, so that killing the process doesn't leave the terminal in a broken state.

### AI Agent Detection

- As a developer running the tool inside an AI agent environment, I want the tool to detect that it's running under an agent via `@vercel/detect-agent`, so that it can automatically use non-interactive mode or display helpful usage hints.
- As a developer running the tool inside an AI agent, I want the tool to display a helpful message showing the non-interactive usage pattern, so that the agent knows how to use the tool correctly.

### Help and Version

- As a developer, I want to run the tool with `--help` to see usage instructions and all available flags, so that I can learn about the tool's interface.
- As a developer, I want to run the tool with `--version` to see the current version of `@xzy-ai/create-ink-app`, so that I know what version I'm using.

### Template System — Project Structure

- As a developer, I want the scaffolded project to include a complete, runnable Ink application entry point, so that I can run it immediately without adding any code.
- As a developer, I want the scaffolded `package.json` to have my project name, correct dependency versions (Ink v6+, React 19+), and appropriate scripts, so that the project metadata and dependencies are correct for my choices.
- As a developer, I want the scaffolded project to include a `readme.md` with basic usage instructions, so that users of my CLI tool know how to use it.
- As a developer, I want the scaffolded project to include a `.gitignore` with Node.js/Bun-appropriate ignore patterns, so that generated files and dependencies are excluded from version control.
- As a developer, I want the scaffolded project to include a `.editorconfig` with consistent style settings, so that editor behavior is consistent across contributors.
- As a developer, I want the scaffolded project to include `tsconfig.json` with strict mode when TypeScript is selected, so that type checking is enabled from the start.

### Template System — Runtime Variations

- As a developer choosing Node.js, I want the scaffolded build script to use esbuild, so that my project builds efficiently with a fast, native binary bundler.
- As a developer choosing Node.js, I want the scaffolded test configuration to use vitest, so that my project has a modern, fast test runner with Jest-compatible API.
- As a developer choosing Bun, I want the scaffolded build script to use `bun build`, so that my project builds with Bun's native, zero-dependency bundler.
- As a developer choosing Bun, I want the scaffolded test configuration to use bun:test, so that my project tests with Bun's built-in test runner.
- As a developer choosing Bun, I want the post-scaffold instructions to use `bun` commands (e.g., `bun run dev`, `bun test`), so that the instructions match my runtime.
- As a developer choosing Bun, I want the scaffolded project to include a `bun.lock` lockfile convention in `.gitignore`, so that the lockfile is properly version-controlled.

### Template System — Tooling Variations

- As a developer choosing Biome, I want the scaffolded project to include a `biome.json` configuration file with recommended defaults, so that I have unified linting and formatting out of the box.
- As a developer choosing Biome, I want the scaffolded project to include `lint`, `format`, and `check` scripts in `package.json`, so that I can run Biome commands through npm/bun scripts.
- As a developer choosing ESLint+Prettier, I want the scaffolded project to include an `eslint.config.js` (flat config) and a `.prettierrc` configuration file, so that I have traditional linting and formatting set up.
- As a developer choosing ESLint+Prettier, I want the scaffolded project to include `lint` and `format` scripts in `package.json`, so that I can run ESLint and Prettier through npm/bun scripts.
- As a developer choosing no linter/formatter, I want no linting or formatting configuration files generated, so that my project stays minimal and I can add my own tooling later.
- As a developer choosing Lefthook, I want the scaffolded project to include a `lefthook.yml` configuration file with pre-commit hooks for linting and type-checking, so that code quality is enforced on every commit.
- As a developer choosing Husky, I want the scaffolded project to include a `.husky/` directory with a `pre-commit` hook script for linting, so that code quality is enforced on every commit.
- As a developer choosing no pre-commit hooks, I want no git hook configuration files generated, so that my project stays simple.

### Version Compatibility

- As a developer using the tool, I want the scaffolded project to always use the latest stable versions of Ink (v6+) and React (19+), so that I get the most up-to-date features and fixes without needing to manually upgrade.
- As a developer examining a scaffolded project, I want the project to include a `compat.json` file mapping the versions of Ink, React, and Node.js/Bun that this scaffold targets, so that I can verify compatibility.

### Edge Case Stories

- As a developer providing a project name with a leading dot (e.g., `.my-ink-app`), I want the tool to handle it as a valid directory name and scaffold into that hidden directory, so that hidden/named projects work correctly.
- As a developer providing a project name with uppercase letters or spaces, I want the tool to normalize it to a valid npm package name (lowercase, kebab-case) for the `package.json` `name` field, while preserving the directory name as provided.
- As a developer running the tool on Windows, I want template paths to resolve correctly with Windows path separators, so that scaffolding works cross-platform.
- As a developer running the tool from a directory with spaces in its path, I want the project to scaffold correctly, so that paths with spaces are handled robustly.
- As a developer whose `npm_config_user_agent` is not set (unusual environments), I want the tool to default to npm as the package manager, so that it always has a fallback.
- As a developer whose selected package manager is not installed on the system PATH, I want the tool to show a clear error during the install step, rather than failing silently.
- As a developer running the tool in a read-only file system, I want the tool to detect the permission issue and display a clear error, so that I understand why scaffolding failed.
- As a developer who provides the same project name as an existing npm package, I want the tool to still scaffold successfully (npm does not enforce uniqueness at scaffold time), so that I can create local projects with any name.

### Scaffolding Tool as a Package

- As a developer wanting to run the scaffolding tool, I want to invoke it via `npx @xzy-ai/create-ink-app`, so that I don't need to globally install the package.
- As a developer wanting to install the scaffolding tool, I want to install it globally with `npm install -g @xzy-ai/create-ink-app`, so that I can run it as `create-ink-app`.
- As a developer using the tool via `npx`, I want the package to be small and fast to download, so that running the tool is quick even on first use.

---

## Implementation Decisions

### Architecture Overview

The tool uses a **modular architecture** with a thin orchestration entry point. Unlike `create-vite` (which uses a single `~400-line index.ts`), this tool has greater combinatorial complexity (2 runtimes × 2 languages × 3 linter choices × 3 pre-commit choices). Clear module boundaries enable independent development and testing.

The central data contract — `WizardState` — is constructed by either the interactive wizard (via `@clack/prompts`) or the args resolver (flags only), and is consumed by the scaffold engine, config generators, and post-scaffold display. The state is immutable after construction.

### Architectural Decision Record

**ADR-001: Modular Module Structure** — The codebase uses separate modules for orchestration (`src/index.ts`), CLI parsing (`resolve-args.ts`), interactive wizard (`wizard.ts`), scaffold engine (`scaffold.ts`), validation (`validate.ts`), environment detection (`detect.ts`), template substitution (`template-substitution.ts`), package.json generation (`package-json.ts`), cleanup (`cleanup.ts`), post-scaffold display (`post-scaffold.ts`), and config generators (`config-generators/*.ts`). A single-file approach was rejected because the number of configuration dimensions would produce an unreadable 800+ line file.

**ADR-002: `WizardState` as Central Data Contract** — A single interface serves as the contract between all modules. Constructed by either the interactive wizard or the args resolver. Consumed by the scaffold engine, config generators, and post-scaffold display. Immutable after construction.

**ADR-003: Template Resolution Strategy** — Base template files organized as `templates/<runtime>/<language>/` with shared files in `templates/shared/`. Resolution path: `templates/node/ts/`, `templates/node/js/`, `templates/bun/ts/`, `templates/bun/js/`.

**ADR-004: Programmatic Config File Generation** — All tool configuration files (biome.json, eslint.config.js, .prettierrc, vitest.config.ts, lefthook.yml, husky hooks, tsconfig.json, compat.json, package.json) are generated programmatically in dedicated modules. This avoids a combinatorial explosion of template files (36+ variants reduced to 9 generator modules).

**ADR-005: `package.json` as Programmatic Generator** — The scaffolded `package.json` is the most complex generated file. It is produced entirely programmatically from `WizardState`, avoiding 36+ template variants.

**ADR-006: Lightweight Template Substitution** — Uses `<% VAR %>` EJS-style syntax with a regex-based engine (`/<%\s*(\w+)\s*%>/g`). No template engine dependency is needed — variables are simple key-value substitutions. Files with a `.template` suffix undergo substitution during copy (the suffix is stripped in output). Binary files (images, fonts) are excluded from substitution by extension allow-list.

**ADR-007: Post-Scaffold UX** — Uses `@clack/prompts` `outro()` for a formatted success message with runtime-aware commands. The `--immediate` flag installs dependencies automatically (respecting the user's install decision) and shows next steps.

**ADR-008: Cancellation and Cleanup Strategy** — SIGINT/SIGTERM handlers track whether scaffold has completed. If cancelled during file copy or install, the target directory is cleaned up. Cancellation at prompt stage requires no cleanup.

**ADR-009: Latest-Only Version Policy** — Always scaffold the latest stable Ink and React versions. No version selection in the wizard. Versions are resolved from a bundled `compat.json` in the scaffolding tool package, updated per release.

**ADR-010: Package Manager Detection** — Reads `process.env.npm_config_user_agent` to auto-detect npm, pnpm, yarn, or bun. Defaults to npm if unset. The detected package manager influences install commands, post-scaffold instructions, and `.gitignore` content.

**ADR-011: Non-Interactive Mode Resolution** — All wizard options have corresponding CLI flags. Resolution precedence: CLI flags > interactive prompts > defaults. In non-interactive mode, the tool requires a project name and applies defaults for unspecified flags.

**ADR-012: Cross-Platform Path Handling** — Uses the `path` module for all path operations. Template paths use forward slashes in source. Shebang varies by runtime (`#!/usr/bin/env node` vs `#!/usr/bin/env bun`). Line endings default to LF.

**ADR-013: Validation Architecture** — Dedicated `src/validate.ts` module with pure validation functions for project name (npm rules), target directory existence/writability, and environment constraints.

### API Contracts

The central data contract is `WizardState`:

```typescript
type Runtime = 'node' | 'bun';
type Language = 'typescript' | 'javascript';
type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';
type LinterOption = 'biome' | 'eslint-prettier' | 'none';
type TestFramework = 'vitest' | 'bun:test';
type PrecommitOption = 'lefthook' | 'husky' | 'none';
type OverwriteMode = 'ask' | 'yes' | 'no';

interface WizardState {
  /** Normalized npm package name (lowercase, kebab-case) */
  projectName: string;
  /** Absolute path to the target directory */
  projectDirectory: string;
  /** JavaScript runtime for the scaffolded project */
  runtime: Runtime;
  /** Package manager for install commands */
  packageManager: PackageManager;
  /** Programming language for source code */
  language: Language;
  /** Linter/formatter tool selection */
  linter: LinterOption;
  /** Test framework (auto-derived from runtime) */
  testFramework: TestFramework;
  /** Pre-commit hook tool selection */
  precommit: PrecommitOption;
  /** Whether to run install after scaffolding */
  installDependencies: boolean;
  /** Overwrite behavior for existing directories */
  overwrite: OverwriteMode;
  /** Whether --immediate flag was passed */
  immediate: boolean;
  /** Currently detected package manager (user agent) */
  detectedPackageManager?: PackageManager;
}
```

CLI flags parsed by mri adhere to the following interface:

```typescript
interface CliFlags {
  _: string[];                   // positional args
  help?: boolean;
  version?: boolean;
  interactive?: boolean;         // --no-interactive sets false
  template?: string;             // reserved for future use
  overwrite?: boolean;
  'no-overwrite'?: boolean;
  immediate?: boolean;
  runtime?: Runtime;
  pm?: PackageManager;
  language?: Language;
  linter?: LinterOption;
  test?: TestFramework;
  precommit?: PrecommitOption;
  'dry-run'?: boolean;
}
```

The scaffold engine returns:

```typescript
interface ScaffoldResult {
  targetDir: string;           // absolute path to created project
  filesCreated: number;        // number of files written
  installCompleted: boolean;   // whether install was run
  warnings: string[];          // non-fatal warnings
}
```

Each config generator conforms to:

```typescript
interface FileEntry {
  path: string;              // relative path from project root
  content: string;           // file content
  executable?: boolean;      // whether to chmod +x
}

type ConfigGenerator = (state: WizardState) => FileEntry | null;
```

### Version Compatibility Schema

The bundled `compat.json` in the scaffolding tool records the version mapping:

```json
{
  "schema": "1.0",
  "updated": "2026-07-26",
  "versions": {
    "node": {
      "minimum": ">=20",
      "recommended": ">=24",
      "ink": "^7.0.0",
      "react": "^19.1.0",
      "esbuild": "latest"
    },
    "bun": {
      "minimum": "latest",
      "recommended": "latest",
      "ink": "^7.0.0",
      "react": "^19.1.0",
      "buildTool": "bun build"
    }
  }
}
```

Each scaffolded project also includes a `compat.json` recording the exact versions used at generation time:

```json
{
  "schema": "1.0",
  "created": "2026-07-26T12:00:00Z",
  "generator": "@xzy-ai/create-ink-app@1.0.0",
  "runtime": "node",
  "dependencies": {
    "ink": "^7.0.0",
    "react": "^19.1.0"
  }
}
```

### Template Architecture

Template files are bundled in the npm package under `templates/`:

```
templates/
├── shared/
│   ├── .gitignore                         # copied verbatim
│   ├── .editorconfig                      # copied verbatim  
│   └── readme.md.template                 # <% PROJECT_NAME %> substitution
├── node/ts/  → source/app.tsx, cli.tsx.template, test.tsx
├── node/js/  → source/app.jsx, cli.jsx.template, test.jsx
├── bun/ts/   → source/app.tsx, cli.tsx.template, test.tsx
└── bun/js/   → source/app.jsx, cli.jsx.template, test.jsx
```

Naming convention: files with `.template` suffix undergo `<% VAR %>` substitution during copy; the suffix is stripped in the output. Files without `.template` are copied as-is. Binary files (specified by extension allow-list) are excluded from substitution.

Template variables available for substitution:
- `PROJECT_NAME` — normalized npm package name
- `BINARY_NAME` — binary name for `package.json` `bin` field
- `RUNTIME` — `node` or `bun`
- `INK_VERSION` — resolved latest Ink version
- `REACT_VERSION` — resolved latest React version

All tool configuration files (package.json, biome.json, eslint.config.js, .prettierrc, vitest.config.ts, lefthook.yml, husky hooks, tsconfig.json, compat.json) are generated programmatically — they are NOT stored as template files.

### Data Flow — Resolution Precedence

The final `WizardState` is resolved by merging three sources in order:
1. Default values (defined in `src/defaults.ts`)
2. CLI flag values (parsed by mri)
3. Interactive prompt results (if TTY and not `--no-interactive`)

Resolution precedence: CLI flags > interactive prompts > defaults.

Non-interactive mode logic:
- If `--no-interactive` OR no TTY OR AI agent detected → use CLI flags (fail if project name missing), apply defaults for unspecified flags, skip all prompts
- Otherwise → present prompts, pre-filling from CLI flags (mixed mode), apply defaults for missing prompts

### Runtime-Specific Differences

| Aspect | Node.js | Bun |
|--------|---------|-----|
| Build command | `esbuild --bundle --platform=node ...` | `bun build ./source/cli.tsx --outdir=dist` |
| Dev command | `esbuild ... --watch` | `bun --watch` |
| Start command | `node dist/cli.js` | `bun ./source/cli.tsx` |
| Test command | `vitest run` / `vitest` (watch) | `bun test` |
| Test config | `vitest.config.ts` | None (built-in) |
| Shebang | `#!/usr/bin/env node` | `#!/usr/bin/env bun` |
| Build tool dep | esbuild in devDependencies | None (built into Bun) |
| TypeScript check | `tsc --noEmit` | `tsc --noEmit` or Bun's built-in |
| `engines.node` in package.json | `">=20"` | Not set |
| Single-binary executable | Not available | Optional `bun build --compile` |

### Dependencies

**Runtime dependencies for the scaffolding tool:**
- `mri` — CLI flag parsing (zero dependencies, ~2KB)
- `@clack/prompts` — Interactive prompts, spinner, tasks
- `picocolors` — Terminal colors (zero dependencies, ~5KB)
- `@vercel/detect-agent` — AI agent detection (fail-safe, graceful fallback)
- `execa` — Process spawning (for package manager install)

**Dev dependencies:**
- `typescript` — Type checking
- `@types/node` — Node.js type definitions
- `vitest` — Test runner
- `tempy` — Temporary directories for tests
- `strip-ansi` — ANSI stripping for test assertions

### Exit Codes

| Exit Code | Condition |
|-----------|-----------|
| 0 | Success |
| 0 | User-initiated cancellation (Ctrl+C or Escape at prompt) |
| 1 | Error during scaffolding (validation failure, install failure, I/O error) |
| 1 | Non-interactive mode with missing/invalid flags |

---

## Testing Decisions

### Testing Seam Analysis

The scaffolding tool's architecture provides eight testing seams at natural module boundaries, prioritized by confidence gain per execution effort:

| Rank | Seam | Type | Confidence | Effort | Run Frequency |
|------|------|------|------------|--------|---------------|
| 1 | **Scaffold engine** (`scaffold.ts`) | Integration | ★★★★★ | Medium | Every commit |
| 2 | **Config generators** (`config-generators/*.ts`) | Unit (pure function) | ★★★★☆ | Low | Every commit |
| 3 | **Template substitution** (`template-substitution.ts`) | Unit (pure function) | ★★★☆☆ | Very Low | Every commit |
| 4 | **Validation** (`validate.ts`) | Unit (pure function) | ★★★☆☆ | Low | Every commit |
| 5 | **Environment detection** (`detect.ts`) | Unit (mock) | ★★★☆☆ | Low | Every commit |
| 6 | **Wizard state construction** (`wizard.ts`) | Integration (mock) | ★★★★☆ | Medium | Every commit |
| 7 | **CLI entry point** (`index.ts`) | Integration | ★★★★☆ | High | On PRs (CI) |
| 8 | **E2E matrix** (full scaffold+build+test) | Contract/E2E | ★★★★★ | Very High | Nightly/pre-release |

### Why the Scaffold Engine Is the Highest-Value Seam

The scaffold engine tests the core product: correct files on disk. It uses real temporary directories (via `tempy`) with NO mocking of the filesystem. Only `execa` is mocked (to prevent actual install). This means tests genuinely verify file creation, content encoding, template substitution output, and config generator integration — in ~100-200ms per combination.

### Test Levels

**Unit tests** (`test/unit/`) — Pure function tests only. No mocking needed (no I/O). Coverage: config generators, template substitution, validation, environment detection. Target: ~65 tests, <1 second.

**Integration tests** (`test/integration/`) — Modules with controlled side effects. Mocked: `execa` only. Filesystem: real temp directories via `tempy`. Coverage: scaffold engine (full file output), wizard state construction. Target: ~70 tests, 2-5 seconds.

**E2E tests** (`test/e2e/`) — Full workflow from CLI entry point. No mocking. Coverage: CLI behavior (`--help`, `--version`), full scaffold matrix (8 combinations). Target: ~13 tests, 5-30 minutes (CI only).

### Test Fixtures Strategy

Test fixtures live in `test/fixtures/` and include:
- `state.ts` — `createState()` helper for constructing `WizardState` test fixtures with sensible defaults
- `templates/` — minimal template directory for scaffold engine tests (avoid depending on real templates that may change)
- `expected/` — expected output snapshots for config generators

The `scaffold()` function accepts an optional `templateDir` override for testing, defaulting to the real template directory in production.

### E2E Matrix Combinations

Eight combinations covering the full combinatorial space:

1. Node + TypeScript + Biome + Lefthook **(most popular)**
2. Node + JavaScript + ESLint+Prettier + none
3. Node + TypeScript + none + Husky
4. Bun + TypeScript + Biome + Lefthook
5. Bun + JavaScript + ESLint+Prettier + none
6. Bun + TypeScript + none + none
7. Node + TypeScript + ESLint+Prettier + none
8. Node + JavaScript + Biome + Lefthook

These cover all 2 runtimes, 2 languages, 3 linter choices, and 3 pre-commit choices. E2E tests run in CI (nightly or pre-release) with parallel matrix strategy. Each combination has a 10-minute timeout.

### Known Testing Limitations

1. **`stdin.write()` does not trigger `useInput`** in Ink v5+. The scaffolded test templates include a comment recommending pure-function extraction of input handlers for testability.
2. **Real package manager not tested in CI/unit tests** — E2E matrix tests cover real installs in CI.
3. **Cross-platform testing gap** — If CI runs only on Linux, Windows-specific path issues won't be caught until a Windows CI matrix is added.
4. **Test template directory drift** — If fixtures diverge from real templates, tests may pass while production scaffolds fail. Mitigation: one test per release verifies the real template directory against fixture expectations.
5. **`@vercel/detect-agent` not tested** — Agent detection is a thin wrapper around a third-party package. Integration tests verify fallback behavior and error handling.

### Rejected Seam Alternatives

- **Full filesystem mock (Node.js `fs`)** — Rejected because mocking `fs` is brittle and temp directories are fast enough (~10ms creation)
- **Subprocess-based scaffold testing** — Rejected for adding overhead without benefit; direct import testing is cleaner
- **Snapshot testing for all generated files** — Rejected as brittle; explicit assertions on key properties provide better documentation

---

## Out of Scope

### Deliberately Excluded

1. **Deno runtime support** — Deno is not supported as a target runtime. Research confirmed `node:tty` incompatibility with Ink's `useInput`/raw mode. This decision is final.
2. **CI/CD configuration scaffolding** — No GitHub Actions, GitLab CI, CircleCI, or other CI configuration files are generated.
3. **Ink version selection** — The tool always scaffolds the latest stable Ink (v6+) and React (19+). No option to select older versions.
4. **Remote template fetching** — All templates are bundled inside the npm package. No `giget` or remote template repository support.
5. **Component generators** — No `generate component`, `generate hook`, or other project-after-init code generators.
6. **Built-in project upgrade/migration** — No command to upgrade existing scaffolded projects to newer versions.
7. **Plugin system for third-party templates** — No plugin architecture for community-contributed templates.
8. **Visual UI builder** — No visual/TUI-based drag-and-drop project configuration.
9. **Multi-project workspace scaffolding** — No monorepo or workspace-level scaffolding.
10. **Deployment configuration** — No Docker, Vercel, Netlify, or other deployment platform configuration.
11. **The old `create-ink-app` architecture** — The old v3.0.2 codebase is a historical reference only. No backward compatibility, migration path, or shared code.
12. **AI agent prompt engineering** — The tool may detect AI agents but will not craft tailored prompts beyond showing the non-interactive usage hint.
13. **`stdin.write()` test workaround in scaffolded templates** — The scaffolded project will include a note about the known `stdin.write()` bug but will not include dedicated infrastructure code beyond the pure-function extraction pattern in test templates.

### Future Considerations (Deferred)

14. **Additional linter/formatter options** — Only Biome, ESLint+Prettier, and none are offered.
15. **Additional pre-commit hook tools** — Only Lefthook and Husky are offered.
16. **Windows-native install wizard** — A Windows-specific installer experience is deferred.
17. **Multi-language template base** — Only TypeScript and JavaScript.
18. **Custom template registries** — Ability to point to a custom template repository is deferred.

### Out of Scope Entirely

19. **The Ink framework itself** — This tool scaffolds applications that use Ink. It does not modify, extend, or fix the Ink framework.
20. **React/Ink application framework layer** — No additional abstractions on top of Ink (no custom routing, state management, or component libraries).
21. **CLI tool distribution/deployment** — The scaffolded project's distribution strategy is the developer's responsibility.

---

## Further Notes

### Dependencies Between User Stories

- Project name validation (user story) is a prerequisite for `package.json` generation.
- Runtime selection determines the build system (esbuild vs bun build) and test framework (vitest vs bun:test).
- Linter/formatter selection determines which config files are generated (biome.json, eslint.config.js, .prettierrc, or none).
- Pre-commit hooks selection determines which hook files are generated (lefthook.yml, .husky/pre-commit, or none).
- Non-interactive mode (`--no-interactive`) requires all flag-based configuration to be implemented together.
- Directory handling stories are prerequisites for the scaffold process itself.

### Node.js Version: v24 vs v20

The recommended Node.js version for scaffolded projects is v24 (current LTS). Ink v6 requires Node.js ≥20 minimum. The generated `package.json` `engines.node` field is set to `">=20"` for maximum compatibility while recommendations guide toward v24.

### Ink v6 vs v7

The tool should target the absolute latest stable Ink version at time of release. The specification refers to "Ink v6+" as the baseline minimum; if v7 is stable at release time, it should be used instead. The `compat.json` version table reflects the actual versions used at generation time. The version resolution is: read `compat.json` from the package → look up latest stable versions for selected runtime → write resolved versions into the scaffolded project.

### `--immediate` Behavior

The `--immediate` flag installs dependencies if the developer selected "yes" for dependency install (or if no choice was made yet). If the developer explicitly chose not to install dependencies, `--immediate` still shows the next-step instructions but skips installation. This matches create-vite's behavior.

### Template Structure Convention

Each template directory follows the convention `templates/<runtime>/<language>/` for base template files. Config file generators are organized as `src/config-generators/<tool-name>.ts`. This keeps the architecture organized as the number of option combinations grows.

### Known Ink Testing Issues in Scaffolded Projects

The scaffolded test templates should include documentation comments about these known issues:
1. `stdin.write()` does not trigger `useInput` in Ink v5+ — recommend extracting handlers as pure functions for testability.
2. `lastFrame()` strips ANSI — use `frames` array for raw output assertions.
3. Always call `unmount()` in `afterEach` to prevent timer pollution across tests.
4. Async rendering requires fake timers or 50ms+ delays.

### Efficiency Note on Template Generation

Generating config files programmatically (as JavaScript/TypeScript objects written to files) is more efficient and maintainable than maintaining a separate template file for every permutation. For example, `biome.json` can be constructed as a JSON object and written with `JSON.stringify()`, rather than having a `biome.json.template` file with conditionals.

### Open Questions

1. Should the tool provide a `--dry-run` flag that shows what would be scaffolded without writing files? (Not discussed in requirements; a `dry-run` field exists in the `CliFlags` interface as a reservation.)
2. Should the tool validate that the selected runtime is actually installed before starting the scaffold?
3. What should the default description be in the scaffolded `package.json`?
4. Should `bun build --compile` be offered as an option for Bun scaffold targets, or only `bun build`?
5. Should the scaffolded project include a license file? If so, which license?

---

*Specification assembled for the `generate-engineering-specs` skill. Backlog: `spec-create-ink-app-scaffold`.*
