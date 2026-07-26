# Workspace Summary — `@xzy-ai/create-ink-app`

> **Backlog:** `tix-create-ink-app-scaffold`
> **Date:** 2026-07-26
> **Agent:** tix-discovery v0.0.1

---

## Project Type

**GREENFIELD** — with strong supporting evidence.

### Evidence

1. **No `package.json` at project root** — The root directory contains no `package.json`, no source code, no `src/` directory, no `dist/` directory, and no build configuration. The only `package.json` exists inside `.opencode/` (for the AI agent infrastructure itself, not the project).

2. **No source files** — There are zero `.ts`, `.tsx`, `.js`, `.jsx` files at the project root. The directory consists entirely of AI agent configuration (`.agents/`, `.claude/`, `.opencode/`), discussion transcripts and sprint artifacts (`_xzy-ai/`), and historical reference documentation (`.docs/create-ink-app/`).

3. **Historical reference only** — `.docs/create-ink-app/` contains the source code of the original `create-ink-app` v3.0.2 (by Vadim Demedes, 2023-era). This is explicitly designated as a historical reference to learn from, NOT the target codebase. The spec (Section 1) confirms: *"The old codebase remains as a historical reference but the new tool is a greenfield implementation with no backward compatibility requirements."*

4. **Unanimous agreement in discussion** — The discussion transcript (Q5) confirms: *"The existing .docs/create-ink-app remains as a historical reference. We will build a completely new architecture from scratch."*

### Implication

All downstream agents should operate with a **greenfield mindset**: there is no existing code to refactor, no backward compatibility requirements with the old `create-ink-app`, and no migration path to maintain. The old reference is a learning source only.

---

## Tech Stack

### Scaffolding Tool Itself (the new package `@xzy-ai/create-ink-app`)

- **Language**: TypeScript (source), output targeting ES modules
- **Runtime**: Node.js ≥20 (development & execution)
- **CLI Flag Parsing**: `mri` v1.x — zero-dependency, 5x faster than minimist, ~13KB unpacked
- **Interactive Prompts**: `@clack/prompts` v1.7.x (latest) — beautiful, minimal UI with text, select, confirm, spinner, group, intro/outro, cancel handling
- **Terminal Colors**: `picocolors` — zero-dependency, ~5KB
- **AI Agent Detection**: `@vercel/detect-agent` — lightweight utility detecting AI agents (Cursor, Claude Code, Devin, Gemini CLI, Codex, Copilot, Replit, etc.) via environment variables
- **Process Spawning**: `execa` — for running package manager install commands
- **Test Framework**: `vitest` — modern, fast, Jest-compatible
- **Test Fixtures**: `tempy` — temporary directories for scaffold engine tests
- **Test Utilities**: `strip-ansi` — ANSI stripping for test assertions

### Scaffolded Projects (what the tool generates)

- **UI Framework**: Ink v6+ (latest stable) with React 19+
- **Node.js Scaffolds**:
  - Build: `esbuild` (fast, native binary bundler)
  - Test: `vitest` + `ink-testing-library` v4+
  - TypeScript: `tsc` for type checking (`tsc --noEmit`)
- **Bun Scaffolds**:
  - Build: `bun build` (native, zero-dependency bundler)
  - Test: `bun:test` + `ink-testing-library` v4+
  - TypeScript: `tsc --noEmit` or Bun's built-in checker
- **Linter/Formatter Options**: Biome (unified), ESLint flat config + Prettier, or none
- **Pre-commit Hook Options**: Lefthook (YAML config, parallel execution, recommended), Husky (shell scripts in `.husky/`), or none
- **Package Managers**: npm, pnpm, yarn, bun (auto-detected from `npm_config_user_agent`)
- **Template Syntax**: `<% VAR %>` EJS-style regex-based substitution (`/<%\s*(\w+)\s*%>/g`)
- **Version Compatibility**: `compat.json` mapping runtime × Ink × React versions

### Old Reference Stack (`.docs/create-ink-app` v3.0.2 — for learning only)

| Component | Technology | Notes |
|-----------|-----------|-------|
| Runtime | Node.js ≥16 | Hardcoded |
| Language | JavaScript (ESM) | CLI tool itself |
| CLI Parsing | `meow` v11 | Heavier than `mri` |
| Task Runner | `listr` v0.14.3 | Unmaintained (last publish 2019) |
| Build (JS) | Babel v7 | 10-100x slower than esbuild |
| Build (TS) | `tsc` v5 | Slower than esbuild |
| Test Framework | `ava` v5 | Losing popularity |
| Linter | `xo` v0.53 | ESLint wrapper (deprecated approach) |
| Formatter | Prettier v2 | Older version |
| Template Engine | `replace-string` | Simple `%NAME%` substitution |
| Package Manager | npm | Hardcoded, no detection |
| Template Structure | 2 templates (JS/TS) × common files | No runtime/tooling choice |

---

## Architecture Overview

### New Architecture (Proposed for `@xzy-ai/create-ink-app`)

The tool uses a **modular architecture** with a thin orchestration entry point and separate modules for each responsibility. Unlike `create-vite`'s single-file ~400-line `index.ts`, this tool has greater combinatorial complexity (2 runtimes × 2 languages × 3 linter choices × 3 pre-commit choices = 36+ combinations), justifying clear module boundaries.

#### Module Structure (13+ modules)

```
src/
├── index.ts                    # Orchestration entry point
├── resolve-args.ts             # CLI flag parsing with mri
├── wizard.ts                   # Interactive prompts via @clack/prompts
├── scaffold.ts                 # Scaffold engine (core file writer)
├── validate.ts                 # Pure validation functions
├── detect.ts                   # Environment detection (TTY, AI agent, package manager)
├── template-substitution.ts    # <% VAR %> regex-based substitution
├── package-json.ts             # Programmatic package.json generation
├── cleanup.ts                  # SIGINT/SIGTERM cleanup handlers
├── post-scaffold.ts            # Post-scaffold success display
├── defaults.ts                 # Default WizardState values
└── config-generators/          # Tool config file generators
    ├── biome.ts                # biome.json
    ├── eslint.ts               # eslint.config.js (flat config)
    ├── prettier.ts             # .prettierrc
    ├── vitest-config.ts        # vitest.config.ts
    ├── lefthook.ts             # lefthook.yml
    ├── husky.ts                # .husky/pre-commit
    ├── tsconfig.ts             # tsconfig.json
    └── compat.ts               # compat.json
```

#### Data Flow

```
User Input (TTY / CLI flags)
       │
       ▼
┌──────────────┐    ┌──────────────┐
│  resolve-args │    │    wizard    │
│  (mri parse)  │    │ (@clack)     │
└──────┬───────┘    └──────┬───────┘
       │                   │
       ▼                   ▼
┌──────────────────────────────────┐
│  WizardState (central contract)  │
│  - projectName, runtime, lang    │
│  - linter, precommit, test, etc  │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│              scaffold.ts                      │
│  1. Copy base template (runtime/language)     │
│  2. Run config-generators/*.ts                │
│  3. Run template-substitution.ts              │
│  4. Run formatter on output                   │
│  5. Install deps (if requested)               │
│  6. Display success message                   │
└──────────────────────────────────────────────┘
```

#### Template Architecture

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

Resolution precedence (WizardState construction): **CLI flags > interactive prompts > defaults**

Three operating modes:
- **Fully interactive**: TTY terminal, all choices via `@clack/prompts` wizard
- **Fully non-interactive**: `--no-interactive`, all flags provided, for CI/CD/AI agents
- **Mixed mode**: Some flags provided, wizard prompts for missing options

#### Key Architectural Principles (from ADRs)

| ADR | Decision |
|-----|----------|
| ADR-001 | Modular module structure (not single-file) |
| ADR-002 | `WizardState` as central immutable data contract |
| ADR-003 | Template resolution: `templates/<runtime>/<language>/` |
| ADR-004 | Programmatic config generation (not template files) |
| ADR-005 | `package.json` generated programmatically |
| ADR-006 | Lightweight `<% VAR %>` regex substitution (no template engine dependency) |
| ADR-007 | Post-scaffold UX with `@clack/prompts` `outro()` |
| ADR-008 | SIGINT/SIGTERM cleanup handlers |
| ADR-009 | Latest-only version policy (Ink v6+, React 19+) |
| ADR-010 | Package manager detection via `npm_config_user_agent` |
| ADR-011 | Non-interactive mode with full flag set |
| ADR-012 | Cross-platform path handling (path module, LF line endings) |
| ADR-013 | Dedicated validation module for project name, directory, environment |

### Old Reference Architecture (`.docs/create-ink-app` v3.0.2)

```
cli.js (meow parser) → index.js (Listr pipeline: copy → npm install → format → build → link)
Templates: _common/ + js/ or ts/
Substitution: %NAME% via replace-string
```

Key differences: 2 templates only, hardcoded npm, no interactivity, single-file core logic (182 lines), outdated dependencies.

---

## Domain Glossary

### Core Scaffolding Concepts

| Term | Definition |
|------|------------|
| **Scaffolding tool** | A CLI tool that generates starter project structure from templates; the primary product being built (`@xzy-ai/create-ink-app`) |
| **Template** | A directory of files that serves as the base for generating a new project; contains placeholders for variable substitution |
| **Base template** | The fundamental project structure (source files) that varies by runtime × language combination |
| **Programmatic config generation** | Generating configuration files by constructing JS objects in code rather than using template files |
| **Hybrid template architecture** | Combining base template directories with programmatic config generation for maximum flexibility |
| **Wizard flow** | The sequence of interactive prompts presented to the user to determine scaffolding options |
| **WizardState** | The central immutable data contract shared across all modules containing all user choices |
| **Non-interactive mode** | CLI operation without prompts, controlled via `--no-interactive` flag for CI/CD/AI agents |
| **Mixed mode** | Operation where some flags are provided and the wizard prompts for remaining options |
| **Runtime** | The JavaScript runtime environment for the scaffolded project: Node.js or Bun |
| **Package manager detection** | Reading `process.env.npm_config_user_agent` to auto-detect npm/pnpm/yarn/bun |
| **AI agent detection** | Using `@vercel/detect-agent` to detect if running under an AI agent environment |
| **Template substitution** | The process of replacing `<% VAR %>` placeholders in template files with actual values |
| **ScaffoldResult** | Return type of the scaffold engine containing targetDir, filesCreated, installCompleted, warnings |
| **FileEntry** | Interface for config generator output: path, content, optional executable flag |
| **ConfigGenerator** | Function type `(state: WizardState) => FileEntry \| null` for generating tool configuration |

### Interactive Wizard Options

| Term | Definition |
|------|------------|
| **Project name** | The name of the CLI tool being scaffolded; becomes `package.json` name and binary directory name |
| **Runtime** | Node.js or Bun — determines available features, build system, and test framework |
| **Package manager** | npm, pnpm, yarn, or bun — auto-detected from `npm_config_user_agent` with user override |
| **Language** | TypeScript (default) or JavaScript |
| **Linter/Formatter** | Biome (unified), ESLint + Prettier (traditional), or none |
| **Test framework** | Runtime-dependent: Node → vitest, Bun → bun:test |
| **Pre-commit hooks** | Lefthook (recommended, YAML config, parallel execution) or Husky (shell scripts, traditional) |
| **Install dependencies** | Whether to run `npm install` / `bun install` after scaffolding |
| **Overwrite mode** | Behavior when target directory exists: ask, yes (overwrite), or no (refuse) |
| **Immediate mode** | `--immediate` flag to auto-install dependencies and show next steps |

### ClI Flags (CliFlags interface)

| Term | Definition |
|------|------------|
| `--help` | Display usage instructions and all available flags |
| `--version` | Display current version of `@xzy-ai/create-ink-app` |
| `--no-interactive` | Skip all interactive prompts, use flag values or defaults |
| `--overwrite` | Automatically overwrite existing non-empty directory |
| `--no-overwrite` | Refuse to overwrite existing directory |
| `--immediate` | Auto-install dependencies and show next steps |
| `--runtime` | Target runtime (`node` or `bun`) |
| `--pm` | Package manager (`npm`, `pnpm`, `yarn`, `bun`) |
| `--language` | Language (`typescript` or `javascript`) |
| `--linter` | Linter/formatter (`biome`, `eslint-prettier`, `none`) |
| `--test` | Test framework (`vitest`, `bun:test`) |
| `--precommit` | Pre-commit hooks (`lefthook`, `husky`, `none`) |
| `--dry-run` | Show what would be scaffolded without writing files (reserved) |

### Ink Framework Concepts

| Term | Definition |
|------|------------|
| **Ink** | React-based terminal UI rendering framework; uses Yoga layout engine and custom React reconciler |
| **`render()`** | Entry-point function that mounts an Ink application; returns instance with `waitUntilExit()` |
| **`<Box>`** | Core layout component; a flexbox container backed by Yoga (supports all flex properties) |
| **`<Text>`** | Core text component; renders styled text with color, bold, italic, underline, strikethrough |
| **`<Static>`** | Component that absorbs children once and never re-renders them |
| **`useInput()`** | Hook for raw keyboard input; receives `(input, key)` with key modifiers |
| **`useApp()`** | Hook providing app lifecycle control: `exit()`, `waitUntilRenderFlush()` |
| **`ink-testing-library`** | Official testing utility; provides `render()`, `lastFrame()`, `frames`, `stdin.write()`, `rerender()`, `unmount()` |

### Version Compatibility

| Term | Definition |
|------|------------|
| **compat.json** | Bundled JSON file mapping runtime × Ink × React versions for compatibility validation |
| **Latest-only policy** | Always scaffold latest stable Ink (v6+) and React (19+); no version selection in wizard |
| **Exit codes** | 0 = success (or user cancellation), 1 = error (validation failure, install failure, I/O error) |

---

## Existing Testing Patterns

### NEW Testing Strategy (for `@xzy-ai/create-ink-app`)

**Test Framework**: `vitest`

**Test Levels**:

| Level | Location | Coverage | Count | Speed |
|-------|----------|----------|-------|-------|
| **Unit** | `test/unit/` | Config generators, template substitution, validation, environment detection | ~65 tests | <1 second |
| **Integration** | `test/integration/` | Scaffold engine (full file output, real temp directories via tempy), wizard state construction | ~70 tests | 2-5 seconds |
| **E2E** | `test/e2e/` | CLI behavior (`--help`, `--version`), full scaffold matrix (8 combinations) | ~13 tests | 5-30 minutes (CI only) |

**Testing Seams (prioritized)**:

| Rank | Seam | Type | Confidence | Mocking |
|------|------|------|------------|---------|
| 1 | **Scaffold engine** (`scaffold.ts`) | Integration | ★★★★★ | `execa` only (prevent actual install) |
| 2 | **Config generators** (`config-generators/*.ts`) | Unit (pure function) | ★★★★☆ | None |
| 3 | **Template substitution** (`template-substitution.ts`) | Unit (pure function) | ★★★☆☆ | None |
| 4 | **Validation** (`validate.ts`) | Unit (pure function) | ★★★☆☆ | None |
| 5 | **Environment detection** (`detect.ts`) | Unit (mock) | ★★★☆☆ | Env vars |
| 6 | **Wizard state construction** (`wizard.ts`) | Integration (mock) | ★★★★☆ | `@clack/prompts` |
| 7 | **CLI entry point** (`index.ts`) | Integration | ★★★★☆ | None |
| 8 | **E2E matrix** (full scaffold+build+test) | Contract/E2E | ★★★★★ | None |

**Test Fixtures**: `test/fixtures/`
- `state.ts` — `createState()` helper for constructing `WizardState` test fixtures with sensible defaults
- `templates/` — minimal template directory for scaffold engine tests (avoids depending on real templates)
- `expected/` — expected output snapshots for config generators

**E2E Matrix (8 combinations)**:
1. Node + TypeScript + Biome + Lefthook (most popular)
2. Node + JavaScript + ESLint+Prettier + none
3. Node + TypeScript + none + Husky
4. Bun + TypeScript + Biome + Lefthook
5. Bun + JavaScript + ESLint+Prettier + none
6. Bun + TypeScript + none + none
7. Node + TypeScript + ESLint+Prettier + none
8. Node + JavaScript + Biome + Lefthook

**Known Testing Limitations**:
1. `stdin.write()` does NOT trigger `useInput` in Ink v5+ — workaround: extract input handlers as pure functions
2. Real package manager not tested in CI/unit tests (E2E matrix covers real installs in CI)
3. Cross-platform testing gap (Windows-specific path issues)
4. Test template directory drift from real templates
5. `@vercel/detect-agent` not directly tested (thin wrapper around third-party package)

**Rejected Approaches**:
- Full filesystem mock (Node.js `fs`) — brittle, temp directories are faster
- Subprocess-based scaffold testing — added overhead without benefit
- Snapshot testing for all generated files — brittle; explicit assertions preferred

### OLD Testing (`.docs/create-ink-app` v3.0.2 — reference only)

- **Framework**: `ava` v5.2.0
- **Test file**: `test.js` (56 lines, 2 tests — JS + TS)
- **Pattern**: Creates temp dir via `tempy`, calls `createInkApp()`, spawns scaffolded app via `execa`, asserts with `strip-ansi`, runs `npm test` on scaffolded project
- **Coverage**: Only 2 E2E tests — no unit tests
- **CI**: GitHub Actions (Node 16 + 18), `npm install && npm test`

---

## ADRs

### Formal ADR Documents

**No formal ADR documents exist** in the workspace. The specification document (`spec.md`) contains **13 embedded ADRs** (ADR-001 through ADR-013) defined inline in the "Architectural Decision Record" section. These are well-defined decisions but are not stored as separate ADR files in a conventional `docs/adr/` directory.

### Summary of ADR-001 through ADR-013

| ADR | Decision |
|-----|----------|
| **ADR-001: Modular Module Structure** | Separate modules for orchestration, CLI parsing, wizard, scaffold engine, validation, detection, template substitution, package.json generation, cleanup, post-scaffold display, and config generators |
| **ADR-002: WizardState as Central Contract** | Single immutable interface shared across all modules |
| **ADR-003: Template Resolution** | `templates/<runtime>/<language>/` with shared files in `templates/shared/` |
| **ADR-004: Programmatic Config Files** | All tool config files generated programmatically in dedicated modules |
| **ADR-005: package.json Generator** | Most complex generated file, produced programmatically from WizardState |
| **ADR-006: Lightweight Substitution** | `<% VAR %>` EJS-style regex-based, no template engine dependency |
| **ADR-007: Post-Scaffold UX** | Uses `@clack/prompts` `outro()` for formatted success message |
| **ADR-008: Cancellation & Cleanup** | SIGINT/SIGTERM handlers with scaffold-completion tracking |
| **ADR-009: Latest-Only Versions** | Always Ink v6+ / React 19+; no version selection |
| **ADR-010: Package Manager Detection** | Reads `npm_config_user_agent`; defaults to npm |
| **ADR-011: Non-Interactive Resolution** | CLI flags > interactive prompts > defaults |
| **ADR-012: Cross-Platform Paths** | Uses `path` module, forward slashes in source, LF line endings |
| **ADR-013: Validation Architecture** | Dedicated `validate.ts` module with pure functions |

### De facto ADRs from Discussion

The discussion transcript and storming document contain additional resolved decisions that function as de facto ADRs:

| Decision | Status | Source |
|----------|--------|--------|
| Deno dropped as target runtime (Ink incompatibility) | RESOLVED | GAP-001 resolution |
| Package name: `@xzy-ai/create-ink-app` | RESOLVED | GAP-002 resolution |
| Latest-only Ink/React version policy | RESOLVED | GAP-004 + GAP-014 |
| Linter choices: Biome / ESLint+Prettier / none | RESOLVED | GAP-005 |
| Pre-commit: Lefthook / Husky / none | RESOLVED | GAP-006 |
| No CI/CD config in scaffold | RESOLVED | GAP-007 |
| Runtime-dependent test framework | RESOLVED | GAP-008 |
| Full non-interactive mode with flag set | RESOLVED | GAP-010 |
| `<% VAR %>` template syntax (EJS-style) | RESOLVED | GAP-011 |
| Runtime-aware post-scaffold instructions | RESOLVED | GAP-012 |
| `--overwrite` / `--no-overwrite` support | RESOLVED | GAP-013 |
| esbuild (Node) / bun build (Bun) | RESOLVED | GAP-015 |
| Version compatibility table (compat.json) | RESOLVED | GAP-016 |

**Recommendation**: Create formal ADR files in a `docs/adr/` directory for the implementation phase.

---

## Documentation Assessment

### Existing Documentation Quality

| Document | Quality | Completeness | Relevance |
|----------|---------|-------------|-----------|
| **Specification** (`spec.md`) | **Very High** | **Comprehensive** (585 lines) | **Primary source** — full API contracts, ADRs, testing matrix, user stories |
| **Discussion Transcript** (182 lines) | High | Very high | Core decision source for runtime, package name, template strategy |
| **Storming GAP Analysis** (368 lines) | Very high | Very high | Gap identification and resolution log |
| **OLD create-ink-app README** (18 lines) | Low | Minimal | Historical reference only |
| **OLD create-ink-app source** (index.js, cli.js, test.js) | Medium | Complete (v3.0.2) | Learning reference for patterns to avoid |

### Strengths

1. **Spec is exceptional** — The engineering specification at `spec.md` contains fully detailed API contracts (`WizardState`, `CliFlags`, `ScaffoldResult`, `FileEntry`, `ConfigGenerator`), a complete E2E testing matrix (8 combinations), 13 ADRs, runtime differences table, exit codes, template architecture, and dependency lists. It is implementation-ready.

2. **Discussion artifacts are thorough** — The transcript (182 lines) and storming document (368 lines) capture the full decision-making process with gap analysis, resolution log, and cross-cutting concerns.

3. **Industry research is extensive** — create-vite architecture, `@clack/prompts` patterns, Ink v5/v6 differences, `ink-testing-library` v4 compatibility, Lefthook vs Husky comparison are all well-documented in the discussion artifacts.

### Gaps

1. **No formal ADR files** — 13 ADRs exist inline in the spec but not as standalone documents
2. **No architecture.md** — No formal architecture document for the project itself
3. **No CONTRIBUTING.md** — No contributing guidelines for the scaffolding tool
4. **No deployment/publishing plan** — How `@xzy-ai/create-ink-app` is published to npm
5. **No CI configuration** for the scaffolding tool's own testing pipeline

---

## Relevant Files

### Primary Reference Files (the Spec and Discussion)

| File | Path | Relevance |
|------|------|-----------|
| **Engineering Specification** | `_xzy-ai/sprints/spec-create-ink-app-scaffold/spec.md` | **PRIMARY** — 585 lines with full API, ADRs, testing strategy, user stories |
| **Discussion Transcript** | `_xzy-ai/discussion/rebuild-create-ink-app-docs/transcript.md` | Decision log (GAP resolutions, runtime choices, template strategy) |
| **Storming GAP Analysis** | `_xzy-ai/discussion/rebuild-create-ink-app-docs/storming/round-001.md` | Gap identification with 16 gaps (4 critical, 7 high, 5 medium) |
| **Workspace Summary (previous)** | `_xzy-ai/sprints/spec-create-ink-app-scaffold/specs/workspace-summary.md` | Prior discovery analysis from spec generation phase |
| **Implementation Decisions** | `_xzy-ai/sprints/spec-create-ink-app-scaffold/specs/implementation-decisions.md` | Additional implementation guidance |

### Old Reference Implementation (for understanding legacy patterns)

| File | Path | Relevance |
|------|------|-----------|
| `package.json` | `.docs/create-ink-app/package.json` | Old dependency manifest (v3.0.2) |
| `index.js` | `.docs/create-ink-app/index.js` | Old core logic — Listr task pipeline (182 lines) |
| `cli.js` | `.docs/create-ink-app/cli.js` | Old CLI entry — meow pattern (61 lines) |
| `test.js` | `.docs/create-ink-app/test.js` | Old E2E tests — ava pattern (56 lines) |
| `templates/ts/_package.json` | `.docs/create-ink-app/templates/ts/_package.json` | TS template — Ink v4, React 18, xo, ava |
| `templates/js/_package.json` | `.docs/create-ink-app/templates/js/_package.json` | JS template — Babel, Ink v4, React 18 |
| `templates/ts/source/app.tsx` | `.docs/create-ink-app/templates/ts/source/app.tsx` | TS app component template |
| `templates/ts/source/cli.tsx` | `.docs/create-ink-app/templates/ts/source/cli.tsx` | TS CLI entry template with `%NAME%` |
| `templates/ts/test.tsx` | `.docs/create-ink-app/templates/ts/test.tsx` | TS test template with ava + ink-testing-library v3 |
| `templates/js/source/app.js` | `.docs/create-ink-app/templates/js/source/app.js` | JS app component template |
| `templates/js/source/cli.js` | `.docs/create-ink-app/templates/js/source/cli.js` | JS CLI entry template |
| `templates/js/test.js` | `.docs/create-ink-app/templates/js/test.js` | JS test template |
| `.github/workflows/test.yml` | `.docs/create-ink-app/.github/workflows/test.yml` | Old CI configuration |

### Agent Configuration Files

| File | Path | Relevance |
|------|------|-----------|
| **tix-discovery agent definition** | `.agents/skills/generate-tickets/_agents/tix-discovery.md` | Defines this agent's role and workflow |
| **Contract format** | `.agents/skills/generate-tickets/references/CONTRACT-FORMAT.md` | Validation rules and deliverable schemas |
| **Execution YAML** | `_xzy-ai/sprints/tix-create-ink-app-scaffold/tickets/execution.yaml` | Sprint phase tracking |
| **Workflow process** | `.agents/skills/generate-tickets/references/WORKFLOW-PROCESS.md` | generate-tickets workflow definition |

---

## Implementation Patterns

### Proven Patterns from create-vite (to adopt)

1. **`mri` + `@clack/prompts` + `picocolors`**: The proven gold standard for scaffolding CLIs. `mri` for lightweight flag parsing (zero-deps, 5x faster than minimist), `@clack/prompts` for beautiful interactive prompts, `picocolors` for terminal coloring.

2. **Non-interactive mode with full flag set**: Every wizard option has a corresponding CLI flag. Resolution: CLI flags > interactive prompts > defaults. `--no-interactive` forces flag-only mode.

3. **Package manager detection**: Read `process.env.npm_config_user_agent` to detect npm/pnpm/yarn/bun. Automatically select the appropriate install command (`npm install`, `pnpm install`, `yarn`, `bun install`).

4. **Graceful cancellation**: Check `isCancel()` from `@clack/prompts` after every prompt. Display formatted "Operation cancelled" message via `cancel()`. Exit with code 0.

5. **Agent-aware hints**: Use `@vercel/detect-agent` `determineAgent()` to detect AI environments. Display helpful non-interactive usage hint when running under an agent.

6. **TTY detection**: Only enable interactive mode when `process.stdin.isTTY` is true. Auto-fallback to non-interactive mode in piped/non-TTY environments.

7. **`@clack/prompts` `group()` for sequential prompts**: Group related prompts together with shared cancel handling. Provides cleaner code organization than individual promise chains.

8. **`@clack/prompts` `spinner()` for async operations**: Show progress indicator during dependency installation. Use `s.start('message')`, `s.stop('message')` pattern.

9. **Base template + programmatic config generation**: Keep templates clean (just the Ink app source files). Generate all tool configuration files programmatically (biome.json, eslint.config.js, etc.).

10. **Template `.template` suffix convention**: Files with `.template` suffix undergo `<% VAR %>` substitution during copy; the suffix is stripped in the output. Binary files excluded by extension allow-list.

### Module Organization Patterns

11. **Pure validation functions**: `validate.ts` exports pure functions with no side effects. Project name validation follows npm naming rules (lowercase, no leading dot/underscore, no spaces).

12. **Config generator pattern**: Each config generator is a pure function `(state: WizardState) => FileEntry | null`. Returns `null` when that config should not be generated (e.g., no linter selected → no biome.json).

13. **Central immutable state**: `WizardState` is constructed once and never mutated. All modules consume it as read-only.

14. **Shebang strategy**: `#!/usr/bin/env node` for Node scaffolds, `#!/usr/bin/env bun` for Bun scaffolds.

### Testing Patterns

15. **Real temp directories (tempy)**: Scaffold engine tests use real temporary directories via `tempy`, NOT mocked filesystem. Only `execa` is mocked to prevent actual package installs.

16. **`createState()` fixture helper**: Test utility that constructs `WizardState` with sensible defaults, overridable per test case. Reduces test boilerplate.

17. **Pure function unit tests**: Config generators, template substitution, and validation functions are tested as pure functions — no mocking needed, no I/O involved.

18. **E2E matrix pattern**: 8 scaffold combinations covering all 2 runtimes × 2 languages × 3 linters × 3 pre-commit choices. Run in CI (nightly/pre-release) with parallel matrix strategy and 10-minute timeout per combination.

### Error Handling Patterns

19. **Cleanup on failure**: SIGINT/SIGTERM handlers track whether scaffold has completed. If cancelled during file copy or install, clean up the target directory.

20. **Validation-first**: Validate project name and target directory before any file operations. Early exit with clear error messages.

21. **Exit codes defined**: 0 = success (or user cancellation), 1 = error. CI/CD systems can detect failure from exit code.

22. **Inline validation in prompts**: `@clack/prompts` `text()` accepts a `validate` callback for real-time input validation. Invalid project names show error before proceeding.

### Patterns to Avoid (from old reference)

23. **Single-file orchestration**: The old `index.js` (182 lines) mixed template copying, install, format, build, and link in one function. Avoid this — use separate modules.

24. **Hardcoded package manager**: The old tool always used npm. The new tool detects from `npm_config_user_agent` and allows user override.

25. **Listr task runner**: Unmaintained since 2019. Use `@clack/prompts` `spinner()` and `taskLog()` instead.

26. **xo linter**: Deprecated ESLint wrapper. Use Biome (recommended) or ESLint flat config.

27. **Babel transpilation**: 10-100x slower than esbuild. Use esbuild for Node scaffolds, `bun build` for Bun scaffolds.

28. **Simple `%NAME%` substitution**: Limited and fragile. Use `<% VAR %>` EJS-style regex substitution for structured template variables.

---

## Assumptions

1. **Greenfield confirmed** — The project directory contains zero application source files. The old `create-ink-app` v3.0.2 in `.docs/` is a historical reference only, explicitly designated as such in both the spec and discussion.

2. **Spec is authoritative** — The engineering specification at `spec.md` (585 lines) is treated as the authoritative source of truth for the scaffold tool's design, architecture, and testing strategy.

3. **ADR-001 through ADR-013 are validated** — All 13 inline ADRs in the spec are treated as final decisions. No re-opening of these decisions is expected during ticket generation.

4. **Deno exclusion is final** — Deno is definitively excluded as a target runtime due to confirmed `node:tty` incompatibility with Ink's `useInput`/raw mode. GAP-001 resolution is complete.

5. **Bun compatibility is solid** — Bun's Ink compatibility is established. `stdin.ref()` bug is fixed (Bun PR #16767). Cursor disappearance on auto-exit has a known workaround (`useApp().exit()`).

6. **Ink v6+/React 19+ are stable** — Ink v6 (released 2025-05-29) is stable. React 19 compatibility with Ink v6 is confirmed by the Ink v6.0.0 release. The tool targets latest stable versions.

7. **`@clack/prompts` v1.7.x patterns** — Latest version supports `group()`, `spinner()`, `text()` with validation, `select()`, `confirm()`, `intro()`, `outro()`, `cancel()`, `isCancel()`, and `AbortController` for programmatic cancellation.

8. **`ink-testing-library` v4 compatibility** — v4.0.0 is compatible with Ink v6+ and vitest. The known `stdin.write()` issue with Ink v5's `useInput` hook is documented and has a workaround (extract handlers as pure functions).

9. **`mri` is sufficient** — `mri` v1.2.x (latest, 2021) provides all needed flag parsing capabilities. The tool does not need `yargs`, `commander`, or other heavier parsers.

10. **Package manager detection reliability** — `process.env.npm_config_user_agent` is set by npm, pnpm, yarn (v2+), and bun when running via `npx`, `yarn create`, `pnpm create`, or `bun create`. Defaults to npm when unset.

11. **Template substitution is sufficient** — `<% VAR %>` regex-based substitution (`/<%\s*(\w+)\s*%>/g`) with simple key-value replacements is sufficient for template needs. No conditional logic or loops are needed in templates.

12. **E2E 8-combination matrix covers the space** — 2 runtimes × 2 languages × 3 linter choices × 3 pre-commit choices = 36 theoretical combinations reduced to 8 representative ones. This is sufficient coverage.

13. **`--immediate` behavior follows create-vite** — Installs deps if user selected "yes" for install (or made no explicit choice). If user chose "no install", skip install but still show next-step instructions.

14. **No existing ADR files** — No formal ADR documents exist in the workspace. The 13 inline ADRs in the spec and the gap resolutions in the discussion transcript serve as the decision record.

---

## Open Questions

1. Should the tool provide a `--dry-run` flag that shows what would be scaffolded without writing files? The `CliFlags` interface reserves a `dry-run` field but this is not discussed in requirements.

2. Should the scaffolded project include a license file? If so, which license (MIT by default)?

3. Should the tool validate that the selected runtime is actually installed (e.g., `node --version` or `bun --version`) before starting the scaffold?

4. What should the default `description` field be in the scaffolded `package.json`?

5. Should `bun build --compile` be offered as an option for Bun scaffold targets, or only `bun build`?

6. How should the tool be published to npm? Under the `@xzy-ai` scope — what npm token/publishing workflow is expected?

7. What is the CI configuration for the scaffolding tool itself (GitHub Actions? What Node versions? What OS matrix?)?

---

## Recommendations for Downstream Agents

1. **Ticket Planning Agent**: Use the domain glossary terms (WizardState, CliFlags, ScaffoldResult, FileEntry, ConfigGenerator, compat.json, etc.) consistently in ticket descriptions. Reference ADR numbers when relevant. Use "tracer bullet" approach — start with the simplest end-to-end path (Node + TypeScript + Biome + Lefthook) and build outward.

2. **Prioritize scaffold engine as Ticket #1**: The scaffold engine (`scaffold.ts`) is the highest-value testing seam and the core of the product. It should be the first ticket implemented. Template files and config generators can be stubbed initially.

3. **Follow create-vite patterns**: The `mri` + `@clack/prompts` + `picocolors` architecture is proven. Tickets should respect this pattern. Avoid introducing `commander.js`, `inquirer`, or other heavier alternatives.

4. **Respect the 13 ADRs**: ADR-001 through ADR-013 should be treated as binding decisions. Tickets should not propose re-opening settled architectural decisions.

5. **Template generation vs programmatic config**: Base templates (source/app.tsx, source/cli.tsx, etc.) use `<% VAR %>` substitution. Config files (biome.json, eslint.config.js, etc.) are generated programmatically. Tickets should respect this split.

6. **Testing strategy**: Unit tests can run every commit (pure functions, <1 second). Integration tests run every commit (temp directories, only execa mocked). E2E tests run nightly/pre-release in CI (full matrix, 5-30 minutes). Tickets should include test requirements at the appropriate level.

7. **Cross-platform awareness**: Template paths must use `path` module. Windows path separators must be handled. Include cross-platform considerations in relevant tickets.

8. **Reference the old codebase sparingly**: Only use `.docs/create-ink-app/` to understand what NOT to do. All implementation should be greenfield.
