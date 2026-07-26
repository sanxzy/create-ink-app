---
agent: dispatch-code-worker
work_unit_id: "01 — Node + TypeScript Scaffold Engine (tracer bullet)"
report_number: 01
status: completed
timestamp: "2026-07-26T14:37:00Z"
worker_mode: default
work_unit_type: functional
artifacts:
  - src/index.ts
  - src/domain/value-objects/project-name.ts
  - src/domain/repositories/ports.ts
  - src/domain/services/predicates.ts
  - src/application/commands/scaffold-project.ts
  - src/application/dtos/scaffold-input.ts
  - src/application/services/config-generators.ts
  - src/infrastructure/file-system/node-file-system.ts
  - src/infrastructure/templates/template-engine.ts
  - src/infrastructure/index.ts
  - src/presentation/commands/create-app.ts
  - src/presentation/parsers/args-parser.ts
  - src/presentation/formatters/output-formatter.ts
  - src/presentation/index.ts
  - src/shared/errors/result.ts
  - src/shared/types/index.ts
  - templates/node/typescript/source/app.tsx.template
  - templates/node/typescript/source/cli.tsx.template
  - templates/node/typescript/test.tsx.template
upstream_reports: []
---

# Implementation Report — 01 — Node + TypeScript Scaffold Engine (tracer bullet)

**Agent:** dispatch-code-worker
**Work Unit:** 01 — Node + TypeScript Scaffold Engine (tracer bullet)
**Report Number:** 01
**Backlog:** tix-create-ink-app-scaffold
**Status:** COMPLETED
**Timestamp:** 2026-07-26T14:37:00Z

## Work Unit Classification

**Classification:** functional

**Rationale:** This work unit implements observable behavior — it scaffolds complete projects, validates project names, processes templates, generates config files, and provides CLI interaction (--help, --version, error handling). Multiple acceptance criteria describe user-facing functionality and business logic, making this definitively functional.

**TDD applied:** No (Default mode)
**Tests required:** Yes (functional work unit)
**Tests written:** 83 tests across 5 test files (4 unit, 1 integration)

## Summary

Built the complete `create-ink-app` CLI tool that scaffolds Node.js + TypeScript Ink React projects. The implementation follows Clean Architecture with Functional Programming conventions: domain value objects (ProjectName with inline validation), application use cases (ScaffoldProject returning Result<T,E>), infrastructure adapters (Node file system, template engine), presentation layer (CLI argument parsing via mri, output formatting), and a composition root that wires all dependencies. The tool processes `.template` files with `<% VAR %>` substitution, generates 12 files per project (9 config + 3 template-derived), and provides --help/--version flags plus error handling for invalid names and directory conflicts.

## What Was Built

Running `create-ink-app my-app --no-interactive` scaffolds a complete, runnable Node.js + TypeScript Ink project at `./my-app/`. The generated project includes:

- **Source code:** `source/app.tsx` (Ink app component), `source/cli.tsx` (CLI entry point with `#!/usr/bin/env node` shebang)
- **Tests:** `test.tsx` (Vitest + Ink render test)
- **Config:** `package.json` (with all 8 scripts, Ink v7 + React 19 deps), `tsconfig.json`, `biome.json`, `lefthook.yml`
- **Infrastructure:** `.gitignore`, `.editorconfig`, `readme.md`, `LICENSE` (MIT with project name as copyright holder)
- **Compatibility:** `compat.json` (records scaffold version and creation timestamp)

Architecture layers:
1. **Domain:** `ProjectName` value object (validates npm naming rules, rejects reserved names), port interfaces (FileSystemPort, TemplateEnginePort, LoggerPort), predicates (runtime/language validation)
2. **Application:** `makeScaffoldProject` use case factory returning `Result<ScaffoldResult, ScaffoldError>`, config generators (pure functions for each config file), `ScaffoldInput` DTO
3. **Infrastructure:** `makeNodeFileSystem` adapter (implements FileSystemPort via Node.js fs), `makeTemplateEngine` adapter (implements TemplateEnginePort with `<% VAR %>` substitution)
4. **Presentation:** CLI argument parser (converts mri output to clean DTOs), output formatters (success/error/help/version), `runCreateApp` command handler
5. **Composition root:** `src/index.ts` wires all dependencies and invokes the CLI

## Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | `create-ink-app my-app --no-interactive` creates a valid project directory at `./my-app/` | [x] PASS |
| 2 | Generated project contains: `source/app.tsx`, `source/cli.tsx`, `test.tsx`, `package.json`, `tsconfig.json`, `biome.json`, `lefthook.yml`, `compat.json`, `.gitignore`, `.editorconfig`, `readme.md`, `LICENSE` (MIT) | [x] PASS |
| 3 | `package.json` has correct name, scripts (`build`, `dev`, `start`, `test`, `lint`, `format`, `check`, `typecheck`), and Ink v6+/React 19+ dependencies | [x] PASS |
| 4 | Template substitution replaces `<% VAR %>` placeholders in `.template` files and strips the suffix | [x] PASS |
| 5 | `create-ink-app --help` displays usage; `--version` displays version | [x] PASS |
| 6 | Invalid project name produces clear error with exit code 1 | [x] PASS |
| 7 | Unit tests cover: template substitution, config generators (biome, lefthook, tsconfig, package.json), project name validation | [x] PASS |
| 8 | Integration tests (real temp dirs) cover: scaffold engine producing correct file tree, all config generators producing expected output | [x] PASS |

## Files Created

| File | Change Type | Description |
|------|-------------|-------------|
| `package.json` | Created | CLI tool package definition with dependencies: mri, vitest, biome, typescript, lefthook |
| `tsconfig.json` | Created | TypeScript configuration with ESM, react-jsx, path aliases |
| `biome.json` | Created | Biome linter/formatter configuration |
| `vitest.config.ts` | Created | Vitest test configuration with @ alias resolution |
| `lefthook.yml` | Created | Lefthook pre-commit hooks configuration |
| `src/index.ts` | Created | Composition root — wires all dependencies and invokes CLI |
| `src/shared/errors/result.ts` | Created | `Result<T,E>` type with `ok`, `err`, `unwrap`, `map`, `flatMap`, `match` |
| `src/shared/types/index.ts` | Created | Cross-cutting type definitions (Runtime, Language, Linter, PreCommit, etc.) |
| `src/domain/value-objects/project-name.ts` | Created | `ProjectName` value object with npm naming validation |
| `src/domain/repositories/ports.ts` | Created | Port interfaces: `FileSystemPort`, `TemplateEnginePort`, `LoggerPort` |
| `src/domain/services/predicates.ts` | Created | Domain predicates: runtime/language validation, template paths, shebangs |
| `src/application/dtos/scaffold-input.ts` | Created | `ScaffoldInput` DTO with defaults for use case boundary |
| `src/application/commands/scaffold-project.ts` | Created | `makeScaffoldProject` use case factory — validates name, creates dir, generates files |
| `src/application/services/config-generators.ts` | Created | Pure functions generating package.json, tsconfig.json, biome.json, lefthook.yml, etc. |
| `src/infrastructure/file-system/node-file-system.ts` | Created | Node.js fs adapter implementing FileSystemPort with Result returns |
| `src/infrastructure/templates/template-engine.ts` | Created | Template engine with `<% VAR %>` substitution and `.template` suffix stripping |
| `src/infrastructure/index.ts` | Created | Infrastructure barrel file |
| `src/presentation/parsers/args-parser.ts` | Created | mri output adapter converting to clean `ParsedArgs` DTO |
| `src/presentation/formatters/output-formatter.ts` | Created | Output formatters for success, error, help, version |
| `src/presentation/commands/create-app.ts` | Created | CLI command handler — parse, validate, scaffold, output |
| `src/presentation/index.ts` | Created | Presentation barrel file |
| `templates/node/typescript/source/app.tsx.template` | Created | Ink App component template with `<% PROJECT_NAME %>` |
| `templates/node/typescript/source/cli.tsx.template` | Created | CLI entry point template with shebang and Ink render |
| `templates/node/typescript/test.tsx.template` | Created | Vitest test template for Ink component testing |
| `src/tests/unit/project-name.test.ts` | Created | 18 tests: valid names, invalid names, reserved names, normalization |
| `src/tests/unit/template-engine.test.ts` | Created | 12 tests: substitution, defaults, missing vars, filename stripping |
| `src/tests/unit/config-generators.test.ts` | Created | 30 tests: package.json, tsconfig, biome, lefthook, compat, gitignore, editorconfig, license, readme |
| `src/tests/unit/scaffold-project.test.ts` | Created | 11 tests: valid scaffold, invalid names, directory creation, file writing, dry-run, template processing |
| `src/tests/integration/scaffold-engine.test.ts` | Created | 12 tests: real temp directory scaffold, file existence, content validation, error cases |

## Tests

**Test framework:** Vitest v4.1.10
**Total tests:** 83 (71 unit + 12 integration)
**Pass rate:** 100% (all 83 passing)
**Test files:** 5

### Unit Tests (4 files, 71 tests)

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `src/tests/unit/project-name.test.ts` | 18 | `createProjectName` validation rules + `normalizeProjectName` |
| `src/tests/unit/template-engine.test.ts` | 12 | `processTemplate` substitution + `getOutputFilename` |
| `src/tests/unit/config-generators.test.ts` | 30 | All 9 config generators with content validation |
| `src/tests/unit/scaffold-project.test.ts` | 11 | Use case orchestration with mocked dependencies |

### Integration Tests (1 file, 12 tests)

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `src/tests/integration/scaffold-engine.test.ts` | 12 | Real temp dir scaffold, file tree verification, config content validation, error cases, MIT license content |

## Investigation Findings

### External Research

- **mri v1.2.0:** Lightweight CLI argument parser used for --help, --version, --no-interactive, --overwrite, --dry-run flags. No dependencies, zero-config. API: `mri(argv, { alias, boolean, default })` returns `{ _: string[], [key: string]: unknown }`.
- **Ink v7.1.1 + React v19.2.8:** Latest stable versions used in generated `package.json`. Ink 7 is compatible with React 19. Using `^7.1.0` range for generated projects.
- **Biome v2.5.5:** Latest stable version used for both the CLI tool itself and generated projects.
- **Lefthook v2.1.10:** Git hooks manager, configured for pre-commit with parallel typecheck/lint/format/test.
- **Vitest v4.1.10:** Test framework with fast ESM-native test runner. Configured with `@` path alias resolution.
- **TypeScript v5.9.3:** Used with `--noEmit` for type checking. Path aliases resolved via `bun build --target=node`.

### Library Versions Verified

| Package | Version | Purpose |
|---------|---------|---------|
| mri | ^1.2.0 | CLI argument parsing |
| ink | ^7.1.0 | Generated project dependency |
| react | ^19.0.0 | Generated project dependency |
| @types/react | ^19.0.0 | Generated project dev dependency |
| vitest | ^4.1.10 | Testing |
| typescript | ^5.8.0 | Type checking |
| @biomejs/biome | ^2.5.0 | Linting/formatting |
| lefthook | ^2.1.0 | Git hooks |

## Approach

1. **Clean Architecture with FP:** Strict layer separation (domain → application → infrastructure → presentation → composition root). Domain has zero imports from outer layers. Use case returns `Result<T,E>`. Dependencies injected via factory pattern.

2. **Result Type:** Custom `Result<T,E>` discriminated union with `ok()`, `err()`, `unwrap()`, `map()`, `flatMap()`, `match()` helpers. All error paths are explicit — no thrown exceptions for expected errors.

3. **Template Engine:** Simple regex-based substitution (`/<%(\s*[A-Z_][A-Z0-9_]*\s*(?:\|[^%]*)?)\s*%>/g`) supports `<% VAR %>` and `<% VAR|default %>`. The `.template` suffix is stripped from output filenames. Directory structure is preserved via `relativePath` parameter.

4. **Config Generators:** Pure functions in the application layer produce full config file contents. Each generator is independently testable. Context (`projectName`, `projectVersion`, `currentYear`) is passed as a parameter.

5. **CLI Argument Parsing:** mri output is immediately converted to a clean `ParsedArgs` DTO at the presentation boundary. No mri types leak into application or domain layers.

6. **Build Process:** `bun build --target=node` resolves path aliases and produces a single bundled `dist/index.js`. The templates directory is resolved relative to the package root at runtime using `import.meta.url`.

## Key Design Decisions

1. **Config generators vs templates:** Config files (package.json, tsconfig, etc.) are generated by pure functions rather than template files because they're fully dynamic based on project configuration. Source code files use the template approach for more natural authoring.

2. **`templatesDir` as dependency:** The templates directory path is injected as a dependency rather than hardcoded, enabling integration tests to run from arbitrary directories and future runtime/language combinations.

3. **Relative path preservation:** Template files in subdirectories (e.g., `source/app.tsx.template`) preserve their directory structure in output via the `relativePath` parameter. This was discovered and fixed during integration testing.

4. **`bun build` over `tsc`:** Using `bun build --target=node` instead of `tsc` for the production build resolves TypeScript path aliases (`@/...`) automatically, producing a single bundled file that works with plain Node.js.

## Deviations

None — all acceptance criteria met. The implementation follows the architecture reference and work unit spec without deviation.

## Blockers

None.

## Assumptions

1. The generated project will use npm as its package manager (the post-scaffold instructions show `npm install`). Package manager detection will be implemented in Work Unit 02.
2. Templates are shipped alongside the compiled JS when published to npm (the `templates/` directory is listed in `package.json`'s `files` array).
3. The current year (2026) is used for copyright in MIT license — this is dynamically generated at scaffold time.
4. ESM-only: both the CLI tool and generated projects use `"type": "module"`.

## References

- [mri documentation](https://github.com/lukeed/mri) — CLI argument parsing
- [Ink documentation](https://github.com/vadimdemedes/ink) — React for CLIs
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) — Robert C. Martin
- `_xzy-ai/architecture.md` — project architecture reference
- `npm view` for all library version verification

---

<!-- CANONICAL ARTIFACT -->

# Full Output — Complete Implementation Details

## Project Structure

```
.worktrees/dispatch-tix-create-ink-app-scaffold-WU-01/
├── package.json                        # CLI tool: create-ink-app
├── tsconfig.json                       # TypeScript config with path aliases
├── biome.json                          # Biome linter config
├── vitest.config.ts                    # Vitest test config
├── lefthook.yml                        # Lefthook pre-commit hooks
│
├── src/
│   ├── index.ts                        # Composition root (dependency wiring)
│   │
│   ├── shared/
│   │   ├── errors/result.ts            # Result<T,E> type with helpers
│   │   └── types/index.ts             # Cross-cutting type definitions
│   │
│   ├── domain/
│   │   ├── value-objects/project-name.ts   # Validated ProjectName value object
│   │   ├── repositories/ports.ts           # Port interfaces (FS, templates, logger)
│   │   └── services/predicates.ts          # Domain predicates
│   │
│   ├── application/
│   │   ├── dtos/scaffold-input.ts          # ScaffoldInput DTO
│   │   ├── commands/scaffold-project.ts    # ScaffoldProject use case
│   │   └── services/config-generators.ts   # Config file generators
│   │
│   ├── infrastructure/
│   │   ├── file-system/node-file-system.ts # Node.js fs adapter
│   │   ├── templates/template-engine.ts    # Template engine
│   │   └── index.ts                        # Barrel
│   │
│   ├── presentation/
│   │   ├── parsers/args-parser.ts          # CLI argument parser
│   │   ├── formatters/output-formatter.ts  # Output formatters
│   │   ├── commands/create-app.ts          # CLI command handler
│   │   └── index.ts                        # Barrel
│   │
│   └── tests/
│       ├── unit/
│       │   ├── project-name.test.ts        # 18 tests
│       │   ├── template-engine.test.ts     # 12 tests
│       │   ├── config-generators.test.ts   # 30 tests
│       │   └── scaffold-project.test.ts    # 11 tests
│       └── integration/
│           └── scaffold-engine.test.ts     # 12 tests
│
└── templates/
    └── node/
        └── typescript/
            ├── source/
            │   ├── app.tsx.template        # Ink App component
            │   └── cli.tsx.template        # CLI entry point
            └── test.tsx.template           # Test template
```

## Architecture Layers

### Domain Layer (zero dependencies)

- **ProjectName value object** — validates npm package naming rules: lowercase, no spaces, no leading dots/underscores, max 214 chars, rejects reserved names. Returns `Result<ProjectName, ProjectNameError>`.
- **Port interfaces** — `FileSystemPort`, `TemplateEnginePort`, `LoggerPort` declared as TypeScript interfaces with method signatures.
- **Predicates** — pure functions: `isRuntimeLanguageValid`, `getTemplateDir`, `getShebang`, etc.

### Application Layer (imports domain only)

- **ScaffoldInput DTO** — clean data transfer object with defaults. Receives projectName, runtime, language, linter, preCommit, overwrite, dryRun.
- **Config generators** — 9 pure functions producing config file content: `generatePackageJson`, `generateTsconfig`, `generateBiomeJson`, `generateLefthookYml`, `generateCompatJson`, `generateGitignore`, `generateEditorconfig`, `generateLicense`, `generateReadme`.
- **ScaffoldProject use case** — factory function `makeScaffoldProject(deps: ScaffoldDeps) => (input: ScaffoldInput) => Result<ScaffoldResult, ScaffoldError>`. Orchestrates: validate name → create dirs → generate configs → process templates.

### Infrastructure Layer (adapters)

- **NodeFileSystem** — implements FileSystemPort using `fs.readFileSync`, `fs.writeFileSync`, `fs.mkdirSync`, `fs.existsSync`. All methods return `Result<T,E>` — never throw.
- **TemplateEngine** — implements TemplateEnginePort. Regex-based `<% VAR %>` substitution with default value support (`<% VAR|default %>`). Strips `.template` suffix from output filenames. Preserves directory structure via `relativePath` parameter.

### Presentation Layer (CLI boundary)

- **ArgsParser** — `parseArgs` converts mri output to `ParsedArgs` DTO. `parsedArgsToScaffoldInput` converts to `ScaffoldInput` with defaults.
- **OutputFormatter** — `formatHelp`, `formatVersion`, `formatScaffoldSuccess`, `formatScaffoldError`, `formatScaffoldResult` produce human-readable output.
- **CreateApp command** — `runCreateApp` parses args, handles --help/--version, validates project name, calls scaffold use case, formats output, exits with appropriate code.

### Composition Root (`src/index.ts`)

Wires all dependencies: creates `NodeFileSystem`, creates `TemplateEngine` with it, creates `ScaffoldProject` use case with both + `templatesDir` resolved to absolute path via `import.meta.url`, and invokes `runCreateApp`.

## Template Files

### `templates/node/typescript/source/app.tsx.template`

```tsx
import React from 'react';
import { Text, Box } from 'ink';

interface AppProps {
  name?: string;
}

const App: React.FC<AppProps> = ({ name = '<% PROJECT_NAME %>' }) => (
  <Box flexDirection="column" padding={1}>
    <Text bold color="green">Hello from {name}!</Text>
    <Text color="gray">An Ink + React CLI application.</Text>
  </Box>
);

export default App;
```

### `templates/node/typescript/source/cli.tsx.template`

```tsx
#!/usr/bin/env node

import React from 'react';
import { render } from 'ink';
import App from './app.js';

const app = render(<App />);

app.waitUntilExit().catch(() => {
  // Clean exit
});
```

### `templates/node/typescript/test.tsx.template`

```tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from 'ink';
import App from './source/app.js';

describe('App', () => {
  it('should render without crashing', () => {
    const { lastFrame } = render(<App name="test-app" />);
    expect(lastFrame()).toBeDefined();
  });

  it('should show the project name', () => {
    const { lastFrame } = render(<App name="<% PROJECT_NAME %>" />);
    const frame = lastFrame();
    expect(frame).toContain('<% PROJECT_NAME %>');
  });
});
```

## Scaffolded Project Output (12 files)

After running `create-ink-app test-app --no-interactive`:

```
test-app/
├── package.json           # name: "test-app", version: "1.0.0", ESM, all 8 scripts
├── tsconfig.json           # ES2022, ESNext, react-jsx, source/
├── biome.json              # Linter + formatter enabled
├── lefthook.yml            # pre-commit: typecheck, lint, format
├── compat.json             # { scaffoldVersion, generator, createdAt }
├── .gitignore              # node_modules, dist, .env, .DS_Store
├── .editorconfig           # space indentation, utf-8, lf
├── readme.md               # Project documentation with scripts
├── LICENSE                 # MIT License with project name as copyright holder
├── source/
│   ├── app.tsx             # Ink App component (PROJECT_NAME substituted)
│   └── cli.tsx             # CLI entry point (#!/usr/bin/env node)
└── test.tsx                # Vitest render test
```

## CLI Behavior

| Command | Output |
|---------|--------|
| `create-ink-app --help` | Usage instructions with all flags |
| `create-ink-app --version` | `0.1.0` |
| `create-ink-app test-app --no-interactive` | Creates project, lists files, shows next steps |
| `create-ink-app "" --no-interactive` | Error: "Project name is required" (exit 1) |
| `create-ink-app "Invalid!" --no-interactive` | Error: "not a valid project name" (exit 1) |
| `create-ink-app test-app --no-interactive` (existing dir) | Error: "Directory already exists" (exit 1) |

## Verification

```sh
# All tests pass
bun test              # ✓ 83 tests passed

# TypeScript compilation
tsc --noEmit          # ✓ No errors

# Build production bundle
bun run build         # ✓ Bundled 13 modules → dist/index.js (24.95 KB)

# E2E smoke test
create-ink-app test-app --no-interactive   # ✓ Project created with 12 files
```
