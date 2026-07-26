# Workspace Summary — `@xzy-ai/create-ink-app`

> **Backlog:** `spec-create-ink-app-scaffold`
> **Date:** 2026-07-26
> **Agent:** discovery-agent v0.0.1

---

## 1. Greenfield/Brownfield Determination

**Status: GREENFIELD** — with a brownfield *reference* implementation.

### Supporting Evidence

1. **No `package.json` at project root** — The root directory `/Users/budisantoso/Documents/Xzy/create-bun-ink-app` contains no `package.json`, no source code, no `src/` directory, no `dist/` directory, and no build configuration. The only `package.json` exists inside `.opencode/` (for the AI agent infrastructure itself).

2. **No source files** — There are no `.ts`, `.tsx`, `.js`, `.jsx` files at the project root. The directory consists entirely of:
   - AI agent configuration (`.agents/`, `.claude/`, `.opencode/`)
   - Discussion transcripts and sprint artifacts (`_xzy-ai/`)
   - Historical reference documentation (`.docs/create-ink-app/`)

3. **Historical reference exists** — `.docs/create-ink-app/` contains the source code of `create-ink-app` v3.0.2 (by Vadim Demedes, 2023-era). This is explicitly designated as a historical reference to learn from, NOT the target codebase. The discussion transcript (Q5) confirms: *"The existing .docs/create-ink-app remains as a historical reference. We will build a completely new architecture from scratch."*

4. **Unanimous discussion agreement** — Throughout the discussion transcript (20 pages, 182 lines), all participants agreed the project is a greenfield rebuild. All gap resolutions start from scratch with modern stacks.

### Implication

All downstream agents should operate with a **greenfield mindset**: there is no existing code to refactor, no backward compatibility requirements with the old `create-ink-app`, and no migration path to maintain. The old `.docs/create-ink-app` is a learning reference only.

---

## 2. Project Structure Overview

```
/Users/budisantoso/Documents/Xzy/create-bun-ink-app/
├── .agents/                          # AI agent skill definitions
│   └── skills/
│       ├── discussion/               # Brainstorming/interview skill
│       ├── dispatch-for-implementation/  # Implementation coordinator
│       ├── generate-architecture/    # Architecture generation skill
│       ├── generate-design-md/       # Design token generation skill
│       ├── generate-engineering-specs/  # ⬅ THIS SKILL (spec generation)
│       ├── generate-tickets/         # Ticket generation skill
│       └── install-bundled-agents/   # Agent installer utility
├── .claude/                          # Claude AI configuration
│   └── skills/                       # Mirrored skill definitions
├── .docs/                            # Project documentation
│   └── create-ink-app/               # Historical reference (OLD v3.0.2)
├── .opencode/                        # OpenCode AI configuration
│   ├── agents/                       # 13 registered agents
│   ├── node_modules/                 # Agent runtime dependencies
│   └── package.json                  # Agent infrastructure (NOT project code)
├── _xzy-ai/                          # Sprint and discussion artifacts
│   ├── discussion/
│   │   └── rebuild-create-ink-app-docs/
│   │       ├── transcript.md         # Full discussion transcript (182 lines)
│   │       └── storming/
│   │           └── round-001.md      # Brainstorming gap analysis (368 lines)
│   └── sprints/
│       └── spec-create-ink-app-scaffold/
│           └── specs/
│               ├── execution.yaml    # Phase tracking
│               ├── workspace-summary.md  # ⬅ THIS FILE
│               └── reference-summary.md  # ⬅ THIS FILE
└── .DS_Store
```

---

## 3. Tech Stack Summary

### Target Tech Stack for the NEW `@xzy-ai/create-ink-app`

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| **Package Name** | `@xzy-ai/create-ink-app` | — | Scoped, runtime-agnostic |
| **Language** | TypeScript | 5.x | Scaffolding tool itself |
| **Runtime** | Node.js + Bun | Node ≥20, Bun latest | Deno dropped (unconfirmed Ink compatibility) |
| **CLI Flag Parsing** | `mri` | latest | Follows create-vite pattern |
| **Interactive Prompts** | `@clack/prompts` | latest | Text, select, confirm, spinner |
| **Colors** | `picocolors` | latest | Tiny, zero-dependency |
| **Agent Detection** | `@vercel/detect-agent` | latest | For non-interactive mode |
| **Ink Version** | Ink v6+ | ≥6.0.0 | Requires Node ≥20, React 19+ |
| **React Version** | React 19+ | ≥19.1.0 | Ink v6 peer dependency |
| **Build System (Node)** | esbuild | latest | Fast, native binary |
| **Build System (Bun)** | `bun build` / `bun build --compile` | built-in | Native, no extra dep |
| **Test Framework (Node)** | vitest | latest | Modern, fast, Jest-compatible |
| **Test Framework (Bun)** | `bun:test` | built-in | Native test runner |
| **Testing Library** | `ink-testing-library` | v4.0.0 | Ink's official test utility |
| **Linter/Formatter Option 1** | Biome | latest | Unified lint+format |
| **Linter/Formatter Option 2** | ESLint (flat config) + Prettier | latest | Traditional approach |
| **Pre-commit Option 1** | Lefthook | latest | Recommended (lightweight, cross-platform) |
| **Pre-commit Option 2** | Husky | latest | Traditional alternative |
| **Package Manager Detection** | `process.env.npm_config_user_agent` | — | npm/pnpm/yarn/bun detection |
| **Template Syntax** | `<% VARIABLE %>` | — | EJS-style substitution |

### Old Reference Stack (`.docs/create-ink-app` v3.0.2)

| Component | Technology | Version |
|-----------|-----------|---------|
| Language | JavaScript | ESM |
| Runtime Node | ≥16 |
| CLI Parsing | `meow` | ^11.0.0 |
| Task Runner | `listr` | ^0.14.3 (outdated, unmaintained) |
| Build (JS) | Babel | ^7.21.0 |
| Build (TS) | tsc | ^5.0.3 |
| Test Framework | ava | ^5.2.0 |
| Testing Library | `ink-testing-library` | ^3.0.0 |
| Linter | xo | ^0.53.1 |
| Formatter | Prettier | ^2.8.7 |
| Template Engine | `replace-string` | ^4.0.0 (simple `%NAME%`) |
| Package Manager | npm | hardcoded |
| Copy Utility | `cpy` | ^9.0.1 |
| Process Spawn | `execa` | ^7.1.1 |

---

## 4. Domain Glossary

### Core Concepts

| Term | Definition |
|------|-----------|
| **Scaffolding tool** | A CLI tool that generates starter project structure from templates; the primary product being built |
| **Template** | A directory of files that serves as the base for generating a new project; contains placeholders for variable substitution |
| **Base template** | The fundamental project structure (package.json, source files) that varies by runtime × language combination |
| **Programmatic config generation** | Generating configuration files (e.g., `biome.json`, `eslint.config.js`, `vitest.config.ts`) by constructing JS objects in code rather than using template files |
| **Hybrid template architecture** | Combining base template directories with programmatic config generation for maximum flexibility |
| **Wizard flow** | The sequence of interactive prompts presented to the user to determine scaffolding options |
| **Runtime** | The JavaScript runtime environment: Node.js or Bun (Deno dropped) |
| **Package manager** | npm, pnpm, yarn, or bun — auto-detected from `npm_config_user_agent` env variable |
| **Non-interactive mode** | CLI operation without prompts, controlled via `--no-interactive` flag for CI/CD/AI agents |
| **E2E verification** | Full end-to-end testing that scaffolds a project, builds it, and verifies it runs correctly |

### UI Framework Concepts (Ink)

| Term | Definition |
|------|-----------|
| **Ink** | React-based terminal UI rendering framework; uses Yoga layout engine and custom React reconciler |
| **`render()`** | The entry-point function that mounts an Ink application; returns instance with `waitUntilExit()` |
| **`<Box>`** | Core layout component; a flexbox container backed by Yoga (supports all flex properties) |
| **`<Text>`** | Core text component; renders styled text with color, bold, italic, underline, strikethrough |
| **`<Static>`** | Component that absorbs children once and never re-renders them; used for "scrolled out" completed output |
| **`<Transform>`** | Component that applies a transform function to its children's output (e.g., for screen reader text substitution) |
| **`useInput()`** | Hook for raw keyboard input; receives `(input, key)` where `key` is `{escape, return, tab, backspace, delete, upArrow, downArrow, leftArrow, rightArrow, ...}` |
| **`useApp()`** | Hook providing app lifecycle control: `exit()`, `waitUntilRenderFlush()`, `suspendTerminal()` |
| **`useFocus()`** | Hook for focus management; auto-registers with Ink's focus state machine |
| **`useStdout()`** / **`useStderr()`** | Hooks for out-of-tree I/O; useful for debug logging or side-channel output |
| **`useAnimation()`** | Hook for shared-timer animation; multiple animated components share a single `setTimeout` |
| **`useCursor()`** | Hook for IME cursor positioning; essential for CJK text input |
| **`ink-testing-library`** | Official testing utility; provides `render()`, `lastFrame()`, `frames`, `stdin.write()`, `rerender()`, `unmount()` |

### Ink v6 Specific Terms (from changelog)

| Term | Definition |
|------|-----------|
| **LegacyRoot** | React 19's `react-reconciler/constants.js` export replacing the legacy mode constant `0` |
| **`updateContainerSync()`** | New React 19 reconciler API replacing `updateContainer()` for synchronous updates |
| **`key.backspace` vs `key.delete`** | Ink v6 fixed the Backspace key reporting; previously Backspace was reported as `key.delete`, now correctly `key.backspace` |
| **`key.escape` vs `key.meta`** | Ink v6 stopped setting `key.meta` on plain Escape presses; `key.meta` is now reserved for actual Alt/Meta modifiers |

### Wizard Flow Terms

| Term | Definition |
|------|-----------|
| **Project name** | The name of the CLI tool being scaffolded; becomes `package.json` name and binary name |
| **Runtime** | Node.js or Bun — determines available features and build system |
| **Package manager** | Auto-detected from `npm_config_user_agent`; override available |
| **Language** | TypeScript or JavaScript (TypeScript is default/recommended for new projects) |
| **Linter/Formatter** | Biome (unified), ESLint + Prettier (traditional), or none |
| **Test framework** | Runtime-dependent: Node → vitest, Bun → bun:test |
| **Pre-commit hooks** | Lefthook (recommended) or Husky, or none |
| **Install dependencies** | Whether to run `npm install` / `bun install` after scaffolding |

---

## 5. Architecture Overview

### Old Reference Architecture (`.docs/create-ink-app` v3.0.2)

```
┌─────────────────────────────────────────────────────────┐
│                    cli.js (entry point)                   │
│  meow CLI parser → flags {typescript} → positional arg  │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   index.js (core logic)                  │
│  Listr task pipeline:                                    │
│    1. Copy files (js or ts template)                    │
│    2. npm install                                        │
│    3. Prettier format                                    │
│    4. npm run build                                      │
│    5. npm link                                           │
│  Template: replace-string %NAME% placeholder            │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Template Structure                      │
│  templates/                                              │
│    ├── _common/  (readme.md, .editorconfig, .gitignore) │
│    ├── js/       (app.js, cli.js, test.js, package.json)│
│    └── ts/       (app.tsx, cli.tsx, test.tsx, tsconfig) │
│  Placeholder: %NAME% in package.json, cli, readme        │
└─────────────────────────────────────────────────────────┘
```

**Key characteristics of the old architecture:**
- **Two templates only**: JavaScript or TypeScript (no runtime choice, no tooling choice)
- **Hardcoded npm**: Always uses npm for install, format, build, link
- **Serial task pipeline**: Listr tasks run one after another
- **No interactivity**: Wizard has no prompts; user passes project name + optional `--typescript` flag
- **Single-file core logic**: Everything in `index.js` (182 lines)
- **Outdated dependencies**: listr (unmaintained), meow, xo, ava, Babel

### New Architecture (Proposed for `@xzy-ai/create-ink-app`)

```
┌──────────────────────────────────────────────────────────────────┐
│                    CLI Entry Point (src/index.ts)                 │
│                                                                   │
│  1. Parse flags with mri                                          │
│     --no-interactive, --template, --overwrite, --immediate        │
│     --runtime, --pm, --language, --linter, --test, --precommit    │
│                                                                   │
│  2. Detect environment                                            │
│     - TTY detection (process.stdin.isTTY)                         │
│     - AI agent detection (@vercel/detect-agent)                   │
│     - Package manager detection (npm_config_user_agent)           │
│     - Runtime detection                                           │
│                                                                   │
│  3. If interactive → @clack/prompts wizard sequence:              │
│     a. Project name (text prompt)                                 │
│     b. Runtime (select: Node / Bun)                               │
│     c. Package manager (select: auto-detected / npm / pnpm / ...) │
│     d. Language (select: TypeScript / JavaScript)                 │
│     e. Linter/Formatter (select: Biome / ESLint+Prettier / none)  │
│     f. Test framework (auto-selected from runtime)                │
│     g. Pre-commit hooks (select: Lefthook / Husky / none)         │
│     h. Install dependencies? (confirm)                            │
│                                                                   │
│  4. If non-interactive → use flag values or defaults              │
│                                                                   │
│  5. Scaffold process:                                             │
│     a. Copy base template for runtime + language                  │
│     b. Generate tool config files programmatically                │
│     c. Substitute template placeholders (<% VAR %>)               │
│     d. Run formatter on generated output                          │
│     e. Install dependencies (if requested)                        │
│     f. Display success message with runtime-aware instructions    │
└──────────────────────────────────────────────────────────────────┘
```

**Key architectural decisions (from gap resolution):**

1. **Hybrid template system**: Base templates for runtime × language combos + programmatic JS object generation for tool configs
2. **Single npm package**: Templates bundled inside the package (no remote fetching)
3. **Runtime-dependent testing**: vitest for Node scaffolds, bun:test for Bun scaffolds
4. **Runtime-dependent build**: esbuild for Node, bun build for Bun
5. **Latest-only Ink/React**: Always scaffold Ink v6+ and React 19+ (no version choice)
6. **Deno dropped**: Due to confirmed `node:tty` incompatibility (`useInput`/raw mode does not work)

---

## 6. Existing Testing Patterns

### Old Reference Testing (`.docs/create-ink-app` v3.0.2)

- **Framework**: ava v5.2.0
- **Test file**: `test.js` (56 lines, 2 tests)
- **Pattern**: 
  - Creates temporary directory via `tempy`
  - Calls `createInkApp()` programmatically
  - Spawns scaffolded app via `execa` and asserts output with `strip-ansi`
  - Runs `npm test` on scaffolded project
  - Cleans up with `npm unlink --global`
- **Coverage**: Only 2 E2E tests (JS + TS) — no unit tests
- **CI**: GitHub Actions (Node 16 + 18), `npm install && npm test`

### Scaffolded Project Tests (Old Templates)

- **JS template test**: Uses ava + `ink-testing-library` v3.0.0; renders `<App>` and asserts `lastFrame()`
- **TS template test**: Same pattern with TypeScript
- **Known bug**: `chalk.green('Stranger')` in assertion doesn't match ANSI output in newer chalk versions (color format changed)

### Testing Patterns for the NEW Project

- **Scaffolding tool itself**: vitest (runtime-agnostic, modern)
- **Scaffolded projects**: 
  - Node → vitest + `ink-testing-library` v4.0.0
  - Bun → bun:test + `ink-testing-library` v4.0.0
- **E2E testing**: Scaffold top 8-10 most common stack combos, verify each builds + runs
- **Known stdin.write() issue**: In Ink v5+, `stdin.write()` does NOT trigger `useInput` callbacks. Workaround: extract input handler logic into pure functions and test them directly.

---

## 7. ADR Summaries

**No formal ADR documents exist** in the workspace. The discussion transcript (`_xzy-ai/discussion/rebuild-create-ink-app-docs/transcript.md`) and brainstorming gap analysis (`round-001.md`) serve as de facto decision records. Key decisions recorded:

| Decision | Status | Source |
|----------|--------|--------|
| Deno dropped as target runtime | RESOLVED | GAP-001 resolution |
| Package name: `@xzy-ai/create-ink-app` | RESOLVED | GAP-002 resolution |
| Ink v6+ / React 19+ only (latest) | RESOLVED | GAP-004 + GAP-014 resolution |
| Linter choices: Biome / ESLint+Prettier / none | RESOLVED | GAP-005 resolution |
| Pre-commit: Lefthook / Husky / none | RESOLVED | GAP-006 resolution |
| No CI/CD config in scaffold | RESOLVED | GAP-007 resolution |
| Runtime-dependent test framework | RESOLVED | GAP-008 resolution |
| `--no-interactive` + `@vercel/detect-agent` | RESOLVED | GAP-010 resolution |
| `<% VAR %>` template syntax | RESOLVED | GAP-011 resolution |
| Runtime-aware post-scaffold instructions | RESOLVED | GAP-012 resolution |
| `--overwrite` / `--no-overwrite` support | RESOLVED | GAP-013 resolution |
| esbuild (Node) / bun build (Bun) | RESOLVED | GAP-015 resolution |
| Version compatibility table (compat.json) | RESOLVED | GAP-016 resolution |

**Recommendation**: Create formal ADRs for the Architectural Decision Agent to reference.

---

## 8. Documentation Assessment

### Existing Documentation Quality

| Document | Quality | Completeness | Relevance |
|----------|---------|-------------|-----------|
| `.docs/create-ink-app/readme.md` | Low | Minimal (18 lines) | Historical reference only |
| Discussion transcript | High | Very high (182 lines) | Core decision source |
| Storming round-001.md | High | Very high (368 lines) | Gap analysis source |
| Professional TUI wiki | Very high | 79 pages across 8 categories | Ink best practices reference |

### Gaps in Documentation

1. **No architecture document**: No formal architecture.md exists for the project
2. **No API documentation**: No specification for the CLI flags, prompt flow, or template API
3. **No testing plan**: No document describing the E2E testing strategy
4. **No migration guide**: Though unnecessary for greenfield, a comparison doc may help users transitioning from old `create-ink-app`
5. **No CONTRIBUTING.md**: No contributing guidelines for the scaffolding tool itself

---

## 9. Relevant Files

### Primary Reference Implementation (OLD)

| File | Path | Relevance |
|------|------|-----------|
| `package.json` | `.docs/create-ink-app/package.json` | Old dependency manifest (v3.0.2) |
| `cli.js` | `.docs/create-ink-app/cli.js` | Old CLI entry point (meow pattern) |
| `index.js` | `.docs/create-ink-app/index.js` | Old core logic (Listr task pipeline) |
| `test.js` | `.docs/create-ink-app/test.js` | Old E2E tests (ava pattern) |
| `templates/js/_package.json` | `.docs/create-ink-app/templates/js/_package.json` | JS template (Ink v4, React 18) |
| `templates/js/source/app.js` | `.docs/create-ink-app/templates/js/source/app.js` | JS template app component |
| `templates/js/source/cli.js` | `.docs/create-ink-app/templates/js/source/cli.js` | JS template CLI entry |
| `templates/js/test.js` | `.docs/create-ink-app/templates/js/test.js` | JS template test |
| `templates/ts/_package.json` | `.docs/create-ink-app/templates/ts/_package.json` | TS template (Ink v4, React 18) |
| `templates/ts/source/app.tsx` | `.docs/create-ink-app/templates/ts/source/app.tsx` | TS template app component |
| `templates/ts/source/cli.tsx` | `.docs/create-ink-app/templates/ts/source/cli.tsx` | TS template CLI entry |
| `templates/ts/test.tsx` | `.docs/create-ink-app/templates/ts/test.tsx` | TS template test |
| `.github/workflows/test.yml` | `.docs/create-ink-app/.github/workflows/test.yml` | Old CI config |

### Decision Records

| File | Path | Relevance |
|------|------|-----------|
| Transcript | `_xzy-ai/discussion/rebuild-create-ink-app-docs/transcript.md` | Full discussion with gap resolutions |
| Storming Round 001 | `_xzy-ai/discussion/rebuild-create-ink-app-docs/storming/round-001.md` | Gap analysis and critical decisions |

### Reference Wiki

| File | Path | Relevance |
|------|------|-----------|
| Ink Examples Catalog | `professional-tui/pages/reference/ink-examples.md` | 28 Ink examples reference |
| Anatomy of an Ink App | `professional-tui/pages/architecture/anatomy-of-ink-app.md` | Ink's 8-context provider tree architecture |
| Professional TUI Wiki INDEX | `professional-tui/INDEX.md` | Full wiki index (79 pages) |

---

## 10. Implementation Patterns Observed

### Old Reference Patterns (to avoid)

1. **`%NAME%` placeholder substitution**: Simple but limited; no conditional logic, no tool version injection
2. **Hardcoded npm**: Cannot adapt to user's preferred package manager
3. **Listr task runner**: Outdated package (last publish 2019); unmaintained
4. **meow CLI parser**: Decent but heavier than mri; create-vite moved away from it
5. **xo linter**: Deprecated approach (ESLint wrapper); modern projects use ESLint flat config or Biome
6. **ava test runner**: Losing popularity; vitest is the modern alternative
7. **Babel transpilation**: Functional but slow; esbuild is 10-100x faster

### Patterns to Adopt (from create-vite and research)

1. **`mri` + `@clack/prompts` + `picocolors`**: The proven gold standard for scaffolding CLIs
2. **Non-interactive mode with flag overrides**: Every prompt option has a corresponding CLI flag for CI/agent use
3. **Package manager detection**: Read `process.env.npm_config_user_agent` to auto-detect
4. **Graceful cancellation**: Check `prompts.isCancel()` after every prompt
5. **Agent-aware hints**: Show helpful non-interactive usage when `@vercel/detect-agent` detects an AI agent
6. **TTY detection**: Only enable interactive mode when `process.stdin.isTTY` is true
7. **Base template + programmatic config**: Keep templates clean; generate config files in code
8. **Runtime-aware instructions**: Different post-scaffold messages for Node vs Bun
9. **Latest-only version policy**: Always scaffold with latest stable versions (no version matrix explosion)
10. **Version compatibility table**: A `compat.json` mapping runtime × Ink × React versions for validation

---

## 11. Assumptions Made During Analysis

1. **Greenfield assumption**: The project directory is confirmed greenfield — no existing source code at the root level. The `.docs/create-ink-app/` directory is a historical reference only.
2. **Ink v6 stability**: Ink v6 (confirmed released 2025-05-29) is stable and will remain the recommended version through 2026+.
3. **React 19 compatibility**: React 19 is fully compatible with Ink v6 as confirmed by the Ink v6.0.0 release.
4. **create-vite pattern applicability**: The `mri` + `@clack/prompts` architecture used by create-vite is the correct model for the new scaffolding tool.
5. **Deno exclusion final**: Deno is definitively excluded from the target runtimes due to confirmed `node:tty` incompatibility with Ink's `useInput`/raw mode.
6. **Bun compatibility**: Bun's Ink compatibility is solid (stdin.ref() bug fixed, cursor issue has known workaround).
7. **`ink-testing-library` v4 compatibility**: v4.0.0 (released 2024-05-22) is compatible with Ink v6+ and vitest.
8. **esbuild for Node builds**: esbuild is the recommended build tool for Node scaffolds (faster than tsc, simpler than Webpack/Rollup).
9. **Biome as viable ESLint+Prettier replacement**: Biome v1.9+ provides comprehensive lint rules (270+) and Prettier-compatible formatting.
10. **No existing ADRs**: No formal ADR documents exist; the discussion transcript serves as the decision record.

---

## 12. Incomplete Information

1. **Exact create-vite source structure**: The create-vite single `src/index.ts` pattern was confirmed, but the exact template directory structure needs further investigation.
2. **Ink v7 migration details**: Ink v7 was mentioned in research but its complete API changes beyond Backspace/Meta fixes need confirmation.
3. **`@clack/prompts` AbortController integration**: The exact mechanism for programmatic cancellation via AbortController needs verification.
4. **Bun's ink-testing-library specifics**: Whether `ink-testing-library` v4 is fully compatible with `bun:test` without shims needs focused validation.
5. **Cross-platform file path handling**: Template path resolution on Windows needs specific attention during implementation.
