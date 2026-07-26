# Implementation Decisions — `@xzy-ai/create-ink-app`

> **Sprint:** `spec-create-ink-app-scaffold`
> **Date:** 2026-07-26
> **Agent:** architecture-agent (generate-engineering-specs)
> **Status:** Complete

---

## Table of Contents

1. [Architecture Decisions (Decision Log)](#1-architecture-decisions-decision-log)
2. [Module Architecture & Boundaries](#2-module-architecture--boundaries)
3. [API Contracts & Interfaces](#3-api-contracts--interfaces)
4. [Schema Designs & Data Models](#4-schema-designs--data-models)
5. [Data Flow](#5-data-flow)
6. [Integration Strategy](#6-integration-strategy)
7. [Dependency Analysis](#7-dependency-analysis)
8. [Template Architecture](#8-template-architecture)
9. [Runtime-Specific Differences](#9-runtime-specific-differences)
10. [Error Handling & Edge Cases](#10-error-handling--edge-cases)
11. [Gap Resolution Cross-Reference](#11-gap-resolution-cross-reference)

---

## 1. Architecture Decisions (Decision Log)

### ADR-001: Module Structure (Single File vs Modular)

**Context:** create-vite uses a single `src/index.ts` (~400 lines). Our scaffolding tool has more combinatorial complexity (2 runtimes × 2 languages × 3 linter choices × 3 pre-commit choices = 36 base combinations before considering auto-derived defaults).

**Decision:** Modular architecture with a thin `src/index.ts` orchestration entry point. The wizard state construction, scaffold engine, config generators, template substitution, and post-scaffold display each get their own module.

**Rationale:**
- A single file for this complexity would exceed 800+ lines, harming readability and testability
- Config generators (`biome.ts`, `eslint.ts`, `vitest.ts`, etc.) are naturally independent units — each produces a single file from WizardState input
- The scaffold engine (`scaffold.ts`) is the core logic and benefits from isolation for testing
- Clear module boundaries enable parallel development

**Alternatives considered:**
- **Single-file (create-vite pattern):** Rejected — too many configuration dimensions for a single file
- **Feature-based subdirectories:** Over-engineering for this scope; flat modules are sufficient
- **Plugin-based architecture:** Premature; no third-party template plugin support in scope

**Trade-offs:**
- Slightly more files to navigate, but each is <200 lines with clear responsibility
- Import management across modules adds minor overhead vs a single-file approach

### ADR-002: Wizard State as Central Data Contract

**Context:** The scaffolding flow has clear stages: CLI parsing → environment detection → choice resolution → scaffold → post-scaffold. These stages need a shared data contract.

**Decision:** A single `WizardState` interface serves as the contract between all modules. It is:
- Constructed by either `wizard.ts` (interactive) or `resolve-args.ts` (non-interactive/mixed from flags)
- Consumed by `scaffold.ts`, `config-generators/*`, and `post-scaffold.ts`
- Immutable after construction (all required fields resolved before scaffold begins)

**Rationale:**
- Single source of truth prevents inconsistencies between modules
- Enables trivial non-interactive mode: construct WizardState from flags instead of prompts
- Serialize-friendly for logging and debugging
- Testable: test every module against known WizardState fixtures

**Alternatives considered:**
- **Passing individual parameters:** Rejected — too many parameters (8+ choices), error-prone
- **Mutable builder pattern:** Unnecessary; WizardState is simple enough for direct construction

### ADR-003: Template Resolution Strategy

**Context:** Templates must be bundled inside the npm package (no remote fetching). They need to vary by runtime × language combination.

**Decision:** Base template files organized as `templates/<runtime>/<language>/` directory tree inside the package. Resolution path: `templates/node/ts/`, `templates/node/js/`, `templates/bun/ts/`, `templates/bun/js/`.

**Rationale:**
- Clear, navigable structure
- Shared files (`readme.md`, `.gitignore`, `.editorconfig`) in `templates/shared/`
- Runtime × Language = 4 directories, each ~5-10 files — manageable
- ESM-resolvable via `new URL('templates/node/ts/', import.meta.url)`

**Alternatives considered:**
- **Single template with conditionals:** Rejected — files would be cluttered with branches
- **Programmatic file content generation:** Rejected for source code (too verbose), used only for config files
- **Remote template fetching (giget):** Out of scope per requirements

### ADR-004: Config File Generation Strategy

**Context:** Tool configuration files (biome.json, eslint.config.js, .prettierrc, vitest.config.ts, lefthook.yml) vary by user choices and cannot efficiently use template files due to combinatorial explosion.

**Decision:** Generate all tool configuration files programmatically — construct the file content as JS objects/strings in dedicated `src/config-generators/` modules. Only the core Ink application source code uses template files.

**Rationale:**
- Eliminates template combinatorial explosion: 3 linter choices × 3 pre-commit choices × 2 languages × 2 runtimes = 36 combos → instead, 6 config generator modules
- Config files are naturally structured (JSON, JS config exports, YAML) — easy to generate programmatically
- Version bumps require updating only the generator function, not N template files
- Pattern validated by create-vite for selected config files

**Modules:**
| Generator | Input From | Output File | Condition |
|-----------|-----------|-------------|-----------|
| `package-json.ts` | Entire WizardState | `package.json` | Always |
| `biome.ts` | WizardState.linter === 'biome' | `biome.json` | Conditional |
| `eslint.ts` | WizardState.linter === 'eslint-prettier' | `eslint.config.js` | Conditional |
| `prettier.ts` | WizardState.linter === 'eslint-prettier' | `.prettierrc` | Conditional |
| `vitest.ts` | WizardState.runtime === 'node' | `vitest.config.ts` | Conditional |
| `lefthook.ts` | WizardState.precommit === 'lefthook' | `lefthook.yml` | Conditional |
| `husky.ts` | WizardState.precommit === 'husky' | `.husky/pre-commit` | Conditional |
| `tsconfig.ts` | WizardState.language === 'typescript' | `tsconfig.json` | Conditional |
| `compat.ts` | WizardState | `compat.json` | Always |

### ADR-005: package.json as a Single Programmatic Generator

**Context:** The scaffolded `package.json` is the most complex generated file — it varies based on runtime, language, linter, test framework, pre-commit hooks, and install behavior. Using template files for package.json would require 36+ template variants.

**Decision:** Generate `package.json` entirely programmatically in `src/package-json.ts`. The function takes `WizardState` and produces a complete `package.json` object.

**Rationale:**
- Avoids combinatorial explosion of template files
- Dependency version management centralised in one file
- Clean separation: template files contain application source code; config is generated
- Same approach used by the most mature scaffolding tools

**Decision branches generating package.json sections:**
```
WizardState → package.json
  ├── name, bin → projectName
  ├── engines.node → ">=20" (Node scaffolds) or absent (Bun scaffolds)
  ├── scripts.build → esbuild or bun build
  ├── scripts.dev → esbuild --watch or bun --watch
  ├── scripts.test → vitest run or bun test
  ├── scripts.lint → biome check or eslint (conditional)
  ├── scripts.format → biome format or prettier (conditional)
  ├── dependencies → react, ink (latest)
  ├── devDependencies → typescript (TS only), vitest (Node), @biomejs/biome (Biome)...
  └── files → ["dist"]
```

### ADR-006: Template Substitution Engine

**Context:** Template files need placeholder substitution for project name, binary name, and possibly version strings. The old tool used simple `%NAME%` replacement.

**Decision:** `<% VAR %>` EJS-style substitution with a simple regex-based engine (no dependencies). Binary files (images, fonts) are excluded by extension allow-list. Template variables are passed as a `Record<string, string>`.

**Supported template variables:**
| Variable | Value | Example |
|----------|-------|---------|
| `PROJECT_NAME` | Normalized npm package name | `my-ink-app` |
| `BINARY_NAME` | Binary in `package.json` `bin` | `my-ink-app` |
| `RUNTIME` | `node` or `bun` | `node` |
| `INK_VERSION` | Resolved Ink version | `^7.0.0` |
| `REACT_VERSION` | Resolved React version | `^19.1.0` |
| `COMPAT_FRAMEWORK` | JSON string of compat table | (internal) |

**Regex:** `/<%\s*(\w+)\s*%>/g`

**Engine (src/template-substitution.ts):**
```typescript
const TEMPLATE_VAR_RE = /<%\\s*(\\w+)\\s*%>/g;

export function substituteTemplate(
  content: string,
  variables: Record<string, string>,
): string {
  return content.replace(TEMPLATE_VAR_RE, (match, name) => {
    if (name in variables) return variables[name];
    return match; // leave unresolvable vars in place (safety)
  });
}

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg',
  '.woff', '.woff2', '.ttf', '.eot',
  '.zip', '.gz',
]);

export function shouldSkipSubstitution(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
}
```

**Alternatives considered:**
- **EJS/Handlebars full library:** Overkill — template variables are simple key-value substitutions with no conditionals or loops
- **Template literals with eval:** Security concern — untrusted template content
- **`replace-string` (old approach):** Works but limited to single variable; our `<% VAR %>` is extensible

### ADR-007: Post-Scaffold UX

**Context:** After scaffolding, the tool should display runtime-aware instructions. The `--immediate` flag auto-installs dependencies.

**Decision:** Use `@clack/prompts` `outro()` for the success message, with runtime-aware commands. The `--immediate` flag runs install automatically (if user chose to install) and shows next steps.

**Pattern:**
```typescript
// post-scaffold.ts
export function showSuccessMessage(state: WizardState, targetDir: string): void {
  const cdCmd = targetDir === process.cwd() ? '' : `cd ${path.relative(process.cwd(), targetDir)}`;

  const devCmd = state.runtime === 'node' ? 'npm run dev' : 'bun run dev';
  const buildCmd = state.runtime === 'node' ? 'npm run build' : 'bun run build';
  const testCmd = state.runtime === 'node' ? 'npm test' : 'bun test';

  outro(
    `${picocolors.bold(picocolors.green('✔'))} Ink app created in ${picocolors.cyan(targetDir)}

${picocolors.bold('Next steps:')}
${cdCmd ? `  ${cdCmd}` : ''}
  ${install ? '' : `${state.packageManager} install`}
  ${devCmd}

${picocolors.bold('Your choices:')}
  Runtime: ${state.runtime}
  Language: ${state.language}
  Linter: ${state.linter}
  Test: ${state.testFramework}
  Pre-commit: ${state.precommit}`
  );
}
```

### ADR-008: Cancellation & Cleanup Strategy

**Context:** Users can cancel at any prompt (Ctrl+C, Escape). If scaffolding fails mid-operation, partial output should be cleaned up.

**Decision:**
- SIGINT/SIGTERM handlers clean up the target directory (if scaffold was in progress) and restore terminal state
- The tool tracks whether scaffold has completed or is in progress via a state flag
- On cancel at prompt stage (before file copy starts), no cleanup needed — just exit
- On cancel during file copy or install, clean up the target directory

**Implementation:**
```typescript
// Cleanup tracking
let cleanupNeeded = false;
let targetDir = '';

process.on('SIGINT', () => {
  if (cleanupNeeded) {
    fs.rm(targetDir, { recursive: true, force: true });
  }
  process.exit(0);
});
```

### ADR-009: Version Policy — Latest-Only

**Context:** The old tool pinned specific old versions. The new tool needs a version strategy that minimizes maintenance while staying current.

**Decision:** Always scaffold the latest stable versions of Ink and React. No version selection in wizard. Versions are resolved from `compat.json` which is updated per release.

**Rationale:**
- Eliminates version matrix complexity entirely
- Users building new projects want current versions
- `compat.json` in the package tracks the mapping: runtime → ink version → react version
- When Ink v8 ships, update `compat.json` and templates in a single PR

**Version resolution flow:**
1. At scaffold time, read `compat.json` from the package
2. Look up the latest stable versions for the selected runtime
3. Write the resolved versions into `package.json`, `compat.json` in scaffolded project

### ADR-010: Package Manager Detection & Install

**Context:** `npm_config_user_agent` is set by npm, pnpm, yarn, and bun when running via `npx`, `pnpm dlx`, `yarn dlx`, or `bunx`. The detected package manager should be the default for both scaffold-time install and scaffolded project recommendations.

**Decision:** Read `process.env.npm_config_user_agent`, parse the package manager name. Default to `npm` if unset. The package manager choice affects:
- The install command run during scaffolding (if install requested)
- The post-scaffold instructions (e.g., `npm run dev` vs `pnpm run dev` vs `bun run dev`)
- Whether a lockfile entry is in `.gitignore` (bun → include `bun.lock`)

**Parser (src/detect.ts):**
```typescript
export interface PkgManagerInfo {
  name: 'npm' | 'pnpm' | 'yarn' | 'bun';
  version?: string;
}

export function detectPackageManager(): PkgManagerInfo {
  const agent = process.env.npm_config_user_agent;
  if (!agent) return { name: 'npm' };

  const [nameWithVersion] = agent.split(' ');
  const [name] = nameWithVersion.split('/');

  const known: string[] = ['npm', 'pnpm', 'yarn', 'bun'];
  if (known.includes(name)) return { name: name as PkgManagerInfo['name'] };

  return { name: 'npm' };
}
```

### ADR-011: Non-Interactive Mode Resolution

**Context:** The tool must work in CI/CD and AI agent environments. Every wizard option should be controllable via CLI flags.

**Decision:** All wizard options have corresponding CLI flags. The tool resolves the final WizardState by merging:
1. Default values (defined in `src/defaults.ts`)
2. CLI flag values (parsed by mri)
3. Interactive prompt results (if TTY and not `--no-interactive`)

Resolution precedence: CLI flags > interactive prompts > defaults.

**Non-interactive mode logic:**
```
IF --no-interactive OR no TTY OR AI agent detected
  → Use CLI flags (fail if project name missing)
  → Apply defaults for any unspecified flags
  → Skip all prompts
ELSE
  → Present prompts, pre-filling from CLI flags (mixed mode)
  → Apply defaults for missing prompts
```

### ADR-012: Cross-Platform Path Handling

**Context:** The scaffolding tool must work on Windows, macOS, and Linux. Template paths, file copying, and shebang generation must be platform-aware.

**Decision:**
- Use `path` module for all path operations (Node.js handles `\` vs `/`)
- Template paths use forward slashes in source; `path.join` resolves on all platforms
- Shebang line: `#!/usr/bin/env node` for Node scaffolds (same on all platforms); `#!/usr/bin/env bun` for Bun
- Line endings: Generate files with `\n` only (LF). Windows Git clients typically auto-convert
- Binary extensions list excludes `.svg` from substitution (SVG can contain `<%` sequences)

### ADR-013: Validation Architecture

**Context:** Project names, target directories, and environment conditions need validation before scaffolding begins.

**Decision:** Dedicated `src/validate.ts` module with pure validation functions:

```typescript
export interface ValidationError {
  field: string;
  message: string;
  code: 'EMPTY_NAME' | 'INVALID_CHARS' | 'TOO_LONG' | 'RESERVED_WORD' | 'DIR_EXISTS_FILE' | 'NOT_WRITABLE' | 'INVALID_SCOPE';
}

export function validateProjectName(name: string): ValidationError | null;
export function validateTargetDirectory(dirPath: string): Promise<ValidationError | null>;
export function validateDirectoryWritable(dirPath: string): Promise<ValidationError | null>;
export function normalizeProjectName(name: string): string;
```

**npm package name rules enforced:**
- Length: 1–214 characters
- Must be lowercase (normalize if uppercase provided)
- No leading dot or underscore
- No spaces
- No non-URL-safe characters (`~)('!*`)
- Scoped names (`@scope/name`) handled correctly

---

## 2. Module Architecture & Boundaries

### Directory Structure

```
src/
├── index.ts                 # Entry: flags, detection, orchestration
├── resolve-args.ts          # CLI flags → partial WizardState
├── wizard.ts                # Interactive prompts → WizardState
├── scaffold.ts              # Core engine: copy, substitute, generate
├── validate.ts              # Input validators (pure functions)
├── detect.ts                # Environment detection (TTY, agent, pm)
├── cleanup.ts               # Signal handling and cleanup
├── template-substitution.ts # <% VAR %> engine
├── package-json.ts          # package.json generator
├── post-scaffold.ts         # Success message display
├── types.ts                 # WizardState, interfaces, constants
├── defaults.ts              # Default values for all options
└── config-generators/
    ├── index.ts             # Registry: which generators for which state
    ├── biome.ts             # → biome.json
    ├── eslint.ts            # → eslint.config.js
    ├── prettier.ts          # → .prettierrc
    ├── vitest.ts            # → vitest.config.ts
    ├── lefthook.ts          # → lefthook.yml
    ├── husky.ts             # → .husky/pre-commit
    ├── tsconfig.ts          # → tsconfig.json
    └── compat.ts            # → compat.json
```

### Module Responsibility Boundaries

| Module | Responsibility | Dependencies | Output |
|--------|---------------|--------------|--------|
| `index.ts` | Parse flags, detect env, resolve WizardState, orchestrate scaffold, handle errors | All other modules | Side effects (CLI execution) |
| `resolve-args.ts` | Parse mri argv, validate flag types, produce partial WizardState | `types.ts`, `detect.ts` | `Partial<WizardState>` |
| `wizard.ts` | Run @clack/prompts sequence, return WizardState | `types.ts`, `validate.ts` | `WizardState` |
| `scaffold.ts` | Create dirs, copy templates, run substitution, invoke config generators, exec install | `template-substitution.ts`, all config-generators, `package-json.ts`, `validate.ts` | Side effects (files created) |
| `validate.ts` | Pure validation functions | None | `ValidationError \| null` |
| `detect.ts` | Detect TTY, AI agent, package manager, runtime | `@vercel/detect-agent` | Detection results |
| `cleanup.ts` | Signal handlers, temp directory management | `fs/promises` | Side effects |
| `template-substitution.ts` | Regex-based `<% VAR %>` replacement | None | Transformed string |
| `package-json.ts` | Generate package.json object from WizardState | `types.ts`, `compat.ts` | `Record<string, any>` |
| `post-scaffold.ts` | Display success message | `picocolors`, `@clack/prompts` | Side effects (stdout) |
| `config-generators/*` | Each generates one config file | `types.ts` | `string` (file content) |

### Module Dependency Graph

```
index.ts
  ├── resolve-args.ts
  │   └── detect.ts
  ├── wizard.ts
  │   └── validate.ts
  ├── scaffold.ts
  │   ├── template-substitution.ts
  │   ├── package-json.ts
  │   │   └── config-generators/compat.ts
  │   └── config-generators/* (all)
  ├── post-scaffold.ts
  └── cleanup.ts
```

---

## 3. API Contracts & Interfaces

### WizardState (src/types.ts)

```typescript
export type Runtime = 'node' | 'bun';
export type Language = 'typescript' | 'javascript';
export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';
export type LinterOption = 'biome' | 'eslint-prettier' | 'none';
export type TestFramework = 'vitest' | 'bun:test';
export type PrecommitOption = 'lefthook' | 'husky' | 'none';
export type OverwriteMode = 'ask' | 'yes' | 'no';

export interface WizardState {
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

### Flags Interface (src/types.ts)

```typescript
export interface CliFlags {
  _: string[];  // positional args from mri
  help?: boolean;
  version?: boolean;
  interactive?: boolean;     // --no-interactive sets false
  template?: string;         // reserved for future use
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

### Scaffold Engine Contract (src/scaffold.ts)

```typescript
export interface ScaffoldResult {
  /** Absolute path to the created project */
  targetDir: string;
  /** Number of files created */
  filesCreated: number;
  /** Whether install was completed */
  installCompleted: boolean;
  /** Any errors during scaffold (non-fatal warnings) */
  warnings: string[];
}

/**
 * Main scaffold function.
 * Creates the project directory, copies templates, generates config files,
 * performs variable substitution, and optionally installs dependencies.
 */
export async function scaffold(
  state: WizardState,
  options?: ScaffoldOptions,
): Promise<ScaffoldResult>;

export interface ScaffoldOptions {
  /** Whether to actually write files (false = dry run) */
  dryRun?: boolean;
  /** Signal for cancellation */
  signal?: AbortSignal;
}
```

### Config Generator Contract (src/config-generators/index.ts)

```typescript
/**
 * Each config generator is a function that takes WizardState
 * and returns either a file entry or null (when the generator
 * doesn't apply to the given state).
 */
export interface FileEntry {
  /** Path relative to project root (e.g., "biome.json") */
  path: string;
  /** File content as string */
  content: string;
  /** Whether this file should be executable (e.g., husky hook) */
  executable?: boolean;
}

export type ConfigGenerator = (state: WizardState) => FileEntry | null;

/** Registry of all config generators */
export const configGenerators: ConfigGenerator[] = [
  require('./biome').generateBiomeConfig,
  require('./eslint').generateEslintConfig,
  require('./prettier').generatePrettierConfig,
  require('./vitest').generateVitestConfig,
  require('./lefthook').generateLefthookConfig,
  require('./husky').generateHuskyConfig,
  require('./tsconfig').generateTsconfig,
  // package-json.ts and compat.ts are called separately
];
```

### Environment Detection (src/detect.ts)

```typescript
export interface EnvironmentInfo {
  /** Whether stdin is a TTY */
  isTTY: boolean;
  /** Whether an AI agent was detected */
  agentDetected: boolean;
  /** The detected AI agent name, if any */
  agentName?: string;
  /** The detected package manager info */
  packageManager: PkgManagerInfo;
}

export async function detectEnvironment(): Promise<EnvironmentInfo>;
export function detectPackageManager(): PkgManagerInfo;
export function isInteractive(flags: CliFlags, env: EnvironmentInfo): boolean;
```

### Template Substitution (src/template-substitution.ts)

```typescript
export interface TemplateVariables {
  PROJECT_NAME: string;     // npm package name
  BINARY_NAME: string;      // binary name for package.json bin
  RUNTIME: Runtime;         // 'node' | 'bun'
  INK_VERSION: string;      // resolved version, e.g. "^7.0.0"
  REACT_VERSION: string;    // resolved version, e.g. "^19.1.0"
}

export function substituteTemplate(
  content: string,
  variables: TemplateVariables,
): string;

export function shouldSkipSubstitution(filePath: string): boolean;

export function collectTemplateVariables(state: WizardState, compat: CompatTable): TemplateVariables;
```

### Post-Scaffold (src/post-scaffold.ts)

```typescript
export interface PostScaffoldOptions {
  state: WizardState;
  targetDir: string;
  durationMs: number;
  skipInstall: boolean;
}

export async function showSuccessMessage(options: PostScaffoldOptions): Promise<void>;
```

---

## 4. Schema Designs & Data Models

### compat.json (Scaffolding Tool's Version Table)

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

### compat.json (Scaffolded Project Output)

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

### package.json Shape (Generated Programmatically)

The shape varies significantly by choices. Below is the template for each dimension:

**Node + TypeScript + Biome + vitest + Lefthook:**
```json
{
  "name": "my-ink-app",
  "version": "0.0.0",
  "description": "Ink CLI application",
  "license": "MIT",
  "bin": {
    "my-ink-app": "dist/cli.js"
  },
  "type": "module",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "build": "esbuild --bundle --platform=node --target=node20 --format=esm source/cli.tsx --outdir=dist --external:react --external:ink",
    "dev": "esbuild --bundle --platform=node --target=node20 --format=esm source/cli.tsx --outdir=dist --external:react --external:ink --watch",
    "start": "node dist/cli.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "biome check .",
    "format": "biome format --write .",
    "check": "biome check --write .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "ink": "^7.0.0",
    "react": "^19.1.0",
    "mri": "^1.2.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/react": "^19.0.0",
    "vitest": "^3.0.0",
    "ink-testing-library": "^4.0.0",
    "@biomejs/biome": "^1.9.0"
  },
  "files": ["dist"]
}
```

**Bun + JavaScript + ESLint+Prettier + Husky:**
```json
{
  "name": "my-ink-app",
  "version": "0.0.0",
  "description": "Ink CLI application",
  "license": "MIT",
  "bin": {
    "my-ink-app": "dist/cli.js"
  },
  "type": "module",
  "scripts": {
    "build": "bun build ./source/cli.jsx --outdir=dist",
    "dev": "bun --watch ./source/cli.jsx",
    "start": "bun ./source/cli.jsx",
    "test": "bun test",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "ink": "^7.0.0",
    "react": "^19.1.0",
    "mri": "^1.2.0"
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "prettier": "^3.3.0",
    "ink-testing-library": "^4.0.0",
    "husky": "^9.0.0"
  },
  "files": ["dist"]
}
```

### Template Directory Schema

```
templates/
├── shared/
│   ├── .gitignore           # [direct copy]
│   ├── .editorconfig        # [direct copy]
│   └── readme.md            # [<% PROJECT_NAME %> substitution]
│
├── node/
│   └── ts/
│       ├── source/
│       │   ├── app.tsx      # [direct copy]
│       │   └── cli.tsx      # [<% PROJECT_NAME %>, <% BINARY_NAME %>]
│       └── test.tsx         # [direct copy]
│
├── node/
│   └── js/
│       ├── source/
│       │   ├── app.jsx      # [direct copy]
│       │   └── cli.jsx      # [<% PROJECT_NAME %>, <% BINARY_NAME %>]
│       └── test.jsx         # [direct copy]
│
├── bun/
│   └── ts/
│       ├── source/
│       │   ├── app.tsx      # [direct copy]
│       │   └── cli.tsx      # [<% PROJECT_NAME %>, <% BINARY_NAME %>]
│       └── test.tsx         # [direct copy]
│
└── bun/
    └── js/
        ├── source/
        │   ├── app.jsx      # [direct copy]
        │   └── cli.jsx      # [<% PROJECT_NAME %>, <% BINARY_NAME %>]
        └── test.jsx         # [direct copy]
```

All tool config files (biome.json, eslint.config.js, .prettierrc, vitest.config.ts, lefthook.yml, husky hooks, tsconfig.json, compat.json, package.json) are generated programmatically — NOT stored as template files.

---

## 5. Data Flow

### Flow 1: Full Interactive Session

```
User runs: npx @xzy-ai/create-ink-app
│
├── src/index.ts
│   ├── 1. Parse argv with mri → CliFlags
│   │     (no flags → all undefined/empty)
│   │
│   ├── 2. detectEnvironment()
│   │     ├── process.stdin.isTTY → true
│   │     ├── @vercel/detect-agent → false
│   │     └── npm_config_user_agent → 'pnpm/9.0.0'
│   │     └── returns: { isTTY: true, agentDetected: false, pkgManager: 'pnpm' }
│   │
│   ├── 3. isInteractive(flags, env) → true (TTY + no --no-interactive)
│   │
│   ├── 4. wizard.ts (interactive prompts)
│   │     a. text("Project name:") → "my-ink-app"
│   │        validate → passes npm rules
│   │     b. select("Runtime:") → "node"
│   │     c. select("Package manager:") → "pnpm" (auto-detected, user confirms)
│   │     d. select("Language:") → "typescript"
│   │     e. select("Linter/Formatter:") → "biome"
│   │     f. (test framework auto-set: vitest because node)
│   │     g. select("Pre-commit hooks:") → "lefthook"
│   │     h. confirm("Install dependencies?") → true
│   │     └── returns: WizardState { ... }
│   │
│   ├── 5. validate()
│   │     ├── validateProjectName("my-ink-app") → null (valid)
│   │     └── validateTargetDirectory("/cwd/my-ink-app") → null (writable, empty)
│   │
│   ├── 6. scaffold(state)
│   │     ├── mkdir "/cwd/my-ink-app"
│   │     ├── Copy templates/node/ts/ → project/
│   │     │   ├── source/app.tsx
│   │     │   ├── source/cli.tsx (substitute: PROJECT_NAME, BINARY_NAME)
│   │     │   └── test.tsx
│   │     ├── Copy templates/shared/ → project/
│   │     │   ├── .gitignore
│   │     │   ├── .editorconfig
│   │     │   └── readme.md (substitute: PROJECT_NAME)
│   │     ├── Generate config generators:
│   │     │   ├── package-json.ts → package.json
│   │     │   ├── biome.ts → biome.json
│   │     │   ├── vitest.ts → vitest.config.ts
│   │     │   ├── lefthook.ts → lefthook.yml
│   │     │   ├── tsconfig.ts → tsconfig.json
│   │     │   └── compat.ts → compat.json
│   │     ├── (no substitute for binary content - none in this path)
│   │     └── execa('pnpm install', { cwd: projectDir })
│   │     └── returns: ScaffoldResult
│   │
│   ├── 7. showSuccessMessage(state, targetDir)
│   │     └── outro: "✔ Ink app created!"
│   │     └── "cd my-ink-app && pnpm run dev"
│   │
│   └── 8. process.exit(0)
```

### Flow 2: Non-Interactive (CI/CD)

```
User runs: npx @xzy-ai/create-ink-app my-tool --no-interactive --runtime=bun --language=js
│
├── src/index.ts
│   ├── 1. Parse argv → CliFlags
│   │     positional: ['my-tool']
│   │     flags: { interactive: false, runtime: 'bun', language: 'javascript' }
│   │
│   ├── 2. detectEnvironment()
│   │     └── (not needed for interactivity, but for pkg mgr detection)
│   │
│   ├── 3. isInteractive() → false (--no-interactive was passed)
│   │
│   ├── 4. resolve-args.ts → WizardState
│   │     projectName ← 'my-tool' (normalized)
│   │     runtime ← 'bun'
│   │     language ← 'javascript'
│   │     linter ← defaults.linter ('biome')
│   │     precommit ← defaults.precommit ('none')
│   │     installDependencies ← defaults.install (true)
│   │     ...
│   │     └── returns: WizardState { ... }
│   │
│   ├── 5. validate()...
│   ├── 6. scaffold()...
│   └── 7. showSuccessMessage()...
```

### Flow 3: Mixed Mode (Partial Flags)

```
User runs: npx @xzy-ai/create-ink-app --linter=none --precommit=husky
│
├── Prompt flow skips linter and precommit steps
├── Prompt flow shows: project name, runtime, package manager, language
└── (test framework auto-derived, install confirmed)
```

### Flow 4: Directory Overwrite Prompt

```
Target directory exists and is non-empty:
├── IF overwrite === 'ask'
│   ├── Prompt: "Directory exists. Overwrite?" (confirm)
│   ├── If yes → rm -rf targetDir, scaffold fresh
│   └── If no → cancel with message
├── IF overwrite === 'yes' (--overwrite flag)
│   └── rm -rf targetDir, scaffold fresh
└── IF overwrite === 'no' (--no-overwrite flag)
    └── Error: "Directory exists. Use --overwrite to overwrite."
```

---

## 6. Integration Strategy

### Integration: Template Loading

Templates are bundled in the npm package at install time (via `package.json` `"files"` key). Access at runtime via:

```typescript
// ESM path resolution (works in both Node and Bun)
const templateDir = new URL('../../templates/', import.meta.url).pathname;
```

All template reading uses `fs/promises.readFile` with `utf-8` encoding for text files and `null` encoding for binary detection.

### Integration: Package Manager Install

The scaffold engine spawns the package manager install process using `execa`:

```typescript
const installCmd = state.packageManager === 'bun' ? 'bun' : state.packageManager;
const installArgs = state.packageManager === 'bun' ? ['install'] : ['install'];

const spinner = clackSpinner();
spinner.start(`Installing dependencies with ${state.packageManager}...`);

try {
  await execa(installCmd, installArgs, {
    cwd: state.projectDirectory,
    stdio: 'pipe',  // capture output for error display
    timeout: 5 * 60 * 1000,  // 5 minute timeout
  });
  spinner.stop('Dependencies installed');
} catch (error) {
  spinner.stop('Installation failed');
  // Display the error output and suggest manual install
  throw new ScaffoldError('INSTALL_FAILED', `Installation failed. Run "${state.packageManager} install" manually.`);
}
```

### Integration: `@vercel/detect-agent`

```typescript
import { detect as detectAgent } from '@vercel/detect-agent';

async function detectEnvironment(): Promise<EnvironmentInfo> {
  const agentResult = await detectAgent().catch(() => null);
  return {
    isTTY: process.stdin.isTTY === true,
    agentDetected: agentResult !== null && agentResult.isAgent,
    agentName: agentResult?.name,
    packageManager: detectPackageManager(),
  };
}
```

### Integration: Signal Handling

```typescript
// src/cleanup.ts
let _cleanupRequired = false;
let _targetDir: string | null = null;

export function registerCleanup(targetDir: string): void {
  _targetDir = targetDir;
  _cleanupRequired = true;
}

export function markComplete(): void {
  _cleanupRequired = false;
}

export function setupSignalHandlers(): void {
  const handleSignal = (signal: string) => {
    if (_cleanupRequired && _targetDir) {
      fs.rm(_targetDir, { recursive: true, force: true })
        .catch(() => {});
    }
    process.exit(signal === 'SIGINT' ? 0 : 1);
  };

  process.on('SIGINT', () => handleSignal('SIGINT'));
  process.on('SIGTERM', () => handleSignal('SIGTERM'));
}
```

---

## 7. Dependency Analysis

### Runtime Dependencies (Scaffolding Tool Itself)

| Package | Version | Purpose | Size | Justification |
|---------|---------|---------|------|---------------|
| `mri` | latest | CLI flag parsing | 0 deps, ~2KB | Proven by create-vite; faster than commander.js |
| `@clack/prompts` | latest | Interactive prompts | ~200KB | Modern, beautiful terminal prompts; includes spinner/tasks |
| `picocolors` | latest | Terminal colors | 0 deps, ~5KB | Tiny alternative to chalk |
| `@vercel/detect-agent` | latest | AI agent detection | ~10KB | Fail-safe; graceful fallback if unavailable |
| `execa` | ^9.0.0 | Process spawning | ~100KB | Reliable cross-platform subprocess management |

### Dev Dependencies

| Package | Purpose |
|---------|---------|
| `typescript` ^5.6 | Type checking |
| `@types/node` ≥20 | Node.js type definitions |
| `vitest` ^3.0 | Test runner for the scaffolding tool itself |
| `tempy` latest | Temporary directories for tests |
| `strip-ansi` latest | Strip ANSI for test assertions |

### What We Deliberately Do NOT Use

| Package | Reason |
|---------|--------|
| `commander.js` | Heavier than mri; not needed for simple flag parsing |
| `chalk` | picocolors is smaller and faster |
| `listr` | Unmaintained; `@clack/prompts` tasks() is the replacement |
| `cpy` / `make-dir` | Node.js 20+ `fs/promises` `cp` and `mkdir` are sufficient |
| `replace-string` | Simple regex replacement is trivial to implement |
| `slugify` | npm name normalization is simpler than a full slugify library |
| `ejs` / `handlebars` / `mustache` | Template variables are simple key-value; no conditionals needed |

### Dependency Version Strategy

- Use `^` (caret) ranges in the scaffolding tool's own `package.json`
- The scaffolder pins `^` ranges in generated `package.json` (flexible for patch/minor updates)
- `compat.json` records the exact versions used at the time of generation
- Dependencies updated per-semver in the scaffolding tool itself

---

## 8. Template Architecture

### Template File Organization

```
templates/
├── shared/
│   ├── .gitignore
│   ├── .editorconfig
│   └── readme.md.template    # .template suffix = substitution required
│
├── node/
│   └── ts/
│       ├── source/
│       │   ├── app.tsx        # No substitution needed
│       │   └── cli.tsx.template  # Has <% PROJECT_NAME %>
│       └── test.tsx
│
├── node/
│   └── js/
│       ├── source/
│       │   ├── app.jsx
│       │   └── cli.jsx.template
│       └── test.jsx
│
├── bun/
│   └── ts/
│       ├── source/
│       │   ├── app.tsx
│       │   └── cli.tsx.template
│       └── test.tsx
│
└── bun/
    └── js/
        ├── source/
        │   ├── app.jsx
        │   └── cli.jsx.template
        └── test.jsx
```

**Naming Convention:** Files with `.template` suffix undergo `<% VAR %>` substitution during copy. The `.template` suffix is stripped in the output. Files without `.template` are copied as-is.

### Template Variable Usage

| Template File | Variables |
|--------------|-----------|
| `cli.tsx.template` / `cli.jsx.template` | `PROJECT_NAME`, `BINARY_NAME` |
| `readme.md.template` | `PROJECT_NAME` |

All other content is generated programmatically (package.json, config files) or copied verbatim (source app components, tests).

### Scaffold Engine Algorithm (src/scaffold.ts)

```
1. Create target directory (if not exists, handle overwrite)
2. Resolve template path from state.runtime + state.language
3. Walk template directory recursively:
   For each file:
     a. Determine relative path from template root
     b. If file has .template extension:
        - Read as UTF-8 string
        - Run substituteTemplate(content, variables)
        - Write to output path with .template suffix removed
     c. Else if shouldSkipSubstitution(filePath):
        - Copy file as-is (binary)
     d. Else:
        - Read as UTF-8 string
        - Run substituteTemplate(content, variables) for safety
        - Write to output path
4. Copy shared/ files:
   - .gitignore, .editorconfig (no substitution)
   - readme.md.template (substitution)
5. Generate config files from config-generators/*:
   For each generator in configGenerators:
     result = generator(state)
     if result !== null:
       writeFile(path.resolve(targetDir, result.path), result.content)
       if result.executable: chmod +x
6. Generate package.json from package-json.ts
7. Generate compat.json from compat.ts
8. If installDependencies:
   - Run package manager install
9. Return ScaffoldResult
```

---

## 9. Runtime-Specific Differences

### Node.js Scaffolds vs Bun Scaffolds

| Aspect | Node.js | Bun |
|--------|---------|-----|
| **Build command** | `esbuild --bundle --platform=node --target=node20 --format=esm source/cli.tsx --outdir=dist --external:react --external:ink` | `bun build ./source/cli.tsx --outdir=dist` |
| **Dev command** | `esbuild ... --watch` | `bun --watch` |
| **Start command** | `node dist/cli.js` | `bun ./source/cli.tsx` |
| **Test command** | `vitest run` / `vitest` (watch) | `bun test` |
| **Test config** | `vitest.config.ts` | None (built-in) |
| **Shebang** | `#!/usr/bin/env node` | `#!/usr/bin/env bun` |
| **.gitignore** | Standard `.gitignore` | Standard + `bun.lock` (actually `bun.lock` is checked in by convention — see note) |
| **Lockfile** | `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock` | `bun.lock` |
| **Build tool** | `esbuild` in devDependencies | None (built into Bun) |
| **TypeScript** | `tsc --noEmit` for type-checking (separate from build) | `tsc --noEmit` for type-checking OR Bun's built-in |
| **engines.node** | `">=20"` | Not set |
| **executable bundle** | Not available | Optional `bun build --compile` for single-binary |

### Shebang Generation Details

For the scaffolded `cli.tsx`/`cli.jsx`, the shebang is determined by runtime:

```
Node.js scaffold → #!/usr/bin/env node
Bun scaffold → #!/usr/bin/env bun
```

This is handled by the template file already having the correct shebang per runtime template directory. No runtime substitution needed for shebangs.

### Test Template Variations

Node.js test template (`templates/node/*/test.tsx`):
```typescript
import { render, cleanup } from 'ink-testing-library';
import { describe, test, expect, afterEach } from 'vitest';
import App from './source/app.js';

afterEach(() => cleanup());

describe('<App />', () => {
  test('renders greeting', () => {
    const { lastFrame } = render(<App name="Test" />);
    expect(lastFrame()).toContain('Hello');
  });
});
```

Bun test template (`templates/bun/*/test.tsx`):
```typescript
import { render, cleanup } from 'ink-testing-library';
import { describe, test, expect, afterEach } from 'bun:test';
import App from './source/app.js';

afterEach(() => cleanup());

describe('<App />', () => {
  test('renders greeting', () => {
    const { lastFrame } = render(<App name="Test" />);
    expect(lastFrame()).toContain('Hello');
  });
});
```

Note: The only difference is the import source — `vitest` vs `bun:test`.

---

## 10. Error Handling & Edge Cases

### Input Validation Edge Cases

| Scenario | Handling | Module |
|----------|----------|--------|
| Empty project name | Re-prompt with validation error message | `wizard.ts` / `validate.ts` |
| Whitespace-only name | Treat as invalid, re-prompt | `validate.ts` |
| Name > 214 chars | Reject with error | `validate.ts` |
| Name with uppercase | Normalize to lowercase for package.json `name`; preserve directory casing | `validate.ts` |
| Name with spaces | Reject (not valid in npm package names) | `validate.ts` |
| Name with leading dot | Allow directory as hidden; normalize package name (strip leading dot) | `validate.ts` |
| Name with leading underscore | Strip leading underscore for package name | `validate.ts` |
| Scoped name (@scope/name) | Handle specially: use full scope+name for package.json `name`; use just `name` for directory | `validate.ts` |
| Name with emoji | Allow in directory name; strip for npm package name | `validate.ts` |
| Reserved npm word | Warn but allow (npm accepts them) | `validate.ts` |
| Project path is a file | Clear error: "path exists and is not a directory" | `validate.ts` |
| Path with glob characters | Treat literally (pass through path.resolve) | `validate.ts` |

### Filesystem Edge Cases

| Scenario | Handling |
|----------|----------|
| Directory exists, empty | Proceed without prompt |
| Directory exists, non-empty, overwrite=ask | Prompt for confirmation |
| Directory exists, non-empty, overwrite=yes | Delete and re-create |
| Directory exists, non-empty, overwrite=no | Error: "use --overwrite" |
| Target dir not writable | Error with permission details |
| Disk space insufficient | Catch ENOSPC, error with message |
| Symlink in target path | Resolve symlink, scaffold to actual directory |
| Case-insensitive FS collision | On macOS/Windows, handle gracefully |
| Path too long (>255 chars) | Warn on very long paths (Windows MAX_PATH) |
| Home dir expansion (~) | Do NOT expand; shell handles this |

### Template Edge Cases

| Scenario | Handling |
|----------|----------|
| Binary file in templates | Excluded from substitution by extension allow-list |
| Template with literal `<%` | Edge case: not handled (very rare in Ink apps). Document as known limitation. |
| Missing template file | Error: "Template file not found: path" — indicates corrupted installation |
| UTF-8 BOM in template | `fs.readFile` with `utf-8` strips BOM |
| Non-UTF-8 encoding | Detect and error; templates should be UTF-8 |
| CRLF in template | Read as-is; output with platform line endings (Node/fs preserves source) |

### Runtime Error Scenarios

| Scenario | Handling |
|----------|----------|
| Package manager not found on PATH | Catch execa ENOENT, show clear error: `{packageManager} not found` |
| Install fails network error | Show package manager's error output, suggest manual install |
| Install times out | 5-minute timeout, error message, suggest manual install |
| Partial install (Ctrl+C) | Warn about partial node_modules, suggest `{pm} install` |
| `npm_config_user_agent` not set | Default to npm |
| `@vercel/detect-agent` fails | Gracefully assume no agent |
| isTTY undefined | Treat as non-TTY (fall back to non-interactive) |
| Restricted shell / no raw mode | `@clack/prompts` handles gracefully; fall back to non-interactive |

### Non-Interactive Mode Errors

| Scenario | Handling |
|----------|----------|
| Missing project name | Error: "Project name is required in non-interactive mode" — exit 1 |
| Invalid flag value | Error: "Invalid value for --runtime: 'deno'. Expected 'node' or 'bun'." — exit 1 |
| Conflicting flags (e.g., --overwrite + --no-overwrite) | Error: "Conflicting flags" — exit 1 |

### Exit Codes

| Exit Code | Condition |
|-----------|-----------|
| 0 | Success |
| 0 | User-initiated cancellation (Ctrl+C or Escape at prompt) |
| 1 | Error during scaffolding (validation failure, install failure, I/O error) |
| 1 | Non-interactive mode with missing/invalid flags |

---

## 11. Gap Resolution Cross-Reference

Every resolved gap from the Brainstorming Round 001 is addressed by one or more architectural decisions:

| Gap | Resolution | ADR Reference |
|-----|-----------|---------------|
| GAP-001 (Runtime compat) | Deno dropped; Node + Bun only | ADR-001, ADR-009 |
| GAP-002 (Package name) | `@xzy-ai/create-ink-app` | Naming established in requirements |
| GAP-003 (Deno templates) | Deno dropped — no Deno templates needed | ADR-001 |
| GAP-004 (Ink versions) | Latest-only policy (v6+/v7) | ADR-009 |
| GAP-005 (Linter choices) | Biome / ESLint+Prettier / none | ADR-004 |
| GAP-006 (Pre-commit) | Lefthook / Husky / none | ADR-004 |
| GAP-007 (CI/CD) | No CI/CD in scaffold (out of scope) | Requirements confirmation |
| GAP-008 (Test framework) | Node→vitest, Bun→bun:test | ADR-009, Section 9 |
| GAP-009 (Package mgr) | Applies to both runtimes; Deno dropped | ADR-010 |
| GAP-010 (Non-interactive) | Full flag support + agent detection | ADR-011 |
| GAP-011 (Template engine) | `<% VAR %>` + programmatic config | ADR-006 |
| GAP-012 (Post-scaffold UX) | Runtime-aware outro + --immediate | ADR-007 |
| GAP-013 (Overwrite) | --overwrite / --no-overwrite + prompt | ADR-012 |
| GAP-014 (React version) | Latest React 19+ | ADR-009 |
| GAP-015 (Build system) | Node→esbuild, Bun→bun build | ADR-009 |
| GAP-016 (Maintenance) | compat.json + reduced matrix + latest-only | ADR-009 |

---

*End of implementation-decisions.md*
