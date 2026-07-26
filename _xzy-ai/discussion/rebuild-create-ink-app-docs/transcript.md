# Discussion Transcript: Rebuild `.docs/create-ink-app` Documentation

## Topic
Rebuilding the `.docs/create-ink-app` documentation into a modern, up-to-date reference that reflects current best practices, architecture, patterns, and development workflows for building professional Ink applications.

## Context
The `.docs/create-ink-app` directory contains a copy of the original `create-ink-app` v3.0.2 by Vadim Demedes (2023-era). It scaffolds Ink CLI apps using:
- Node >= 16, Ink v4, React 18
- npm as package manager
- Babel (JS) / tsc (TS) for transpilation
- meow for CLI parsing
- xo + prettier for linting/formatting
- ava + ink-testing-library for testing
- listr for task runner UX
- `%NAME%` placeholder template substitution

This project is now being superseded by `create-bun-ink-app`, which uses Bun as the runtime and toolchain.

---

## Interview Log

Q1: What is the primary scope and target audience for this rebuilt documentation?

Answer: Rebuild project wizard with modern stacks — The documentation should cover rebuilding the project wizard (scaffolding tool) itself, designed to be compatible with Node.js, Deno, and Bun runtimes, and all package managers: npm, pnpm, yarn, and bun.

Q2: What should the baseline modern tech stack look like?

Answer: Interactive wizard using commander.js — Instead of a fixed tech stack, the scaffolding tool will be a fully interactive wizard (using commander.js) that asks users about each stack choice: runtime (Node/Deno/Bun), linter, formatter/prettier, pre-commit hooks, test framework, and other tooling. No hardcoded defaults — every major decision is user-driven at scaffold time.

Q3: What form should the rebuilt documentation take?

Answer: Research create-next-app and create-vite — The user wants to research how create-next-app and create-vite structure their tooling and documentation before deciding on the documentation form.

Research Findings (see below)

### create-vite Architecture (gold standard for scaffolding CLIs)
- **CLI parsing**: `mri` (lightweight) for flags, NOT commander.js
- **Interactive prompts**: `@clack/prompts` (beautiful, modern terminal prompts), NOT commander.js
- **Colors**: `picocolors` (tiny, zero-dependency)
- **Package manager detection**: reads `npm_config_user_agent` env variable (npm/pnpm/yarn/bun all set this)
- **AI agent detection**: `@vercel/detect-agent` — if an agent is running, logs helpful non-interactive usage hint
- **TTY detection**: `process.stdin.isTTY` — only enables interactive mode if connected to a terminal
- **Non-interactive mode**: `--no-interactive` flag for CI/CD/AI agents
- **Graceful cancellation**: checks `prompts.isCancel()` after every prompt, displays "Operation Cancelled"
- **Framework → variant pattern**: two-tier selection (e.g., React → TypeScript / JavaScript / React Compiler)
- **Template-based**: copies template files from package to target directory
- **Written in**: TypeScript, single file `src/index.ts`
- **Overwrite support**: `--overwrite` / `--no-overwrite` for non-empty directories
- **Immediate mode**: `--immediate` / `--no-immediate` to install deps and start dev server after scaffolding

### create-next-app / create-next-arch patterns
- **Remote templates**: uses `giget` to fetch templates from GitHub repos (always latest)
- **Architecture selection**: feature-based, layer-based, or DDD (Domain Driven Design)
- **Pre-configured tooling**: ESLint, Prettier, Husky, Conventional Commits out of the box
- **Universal package manager**: npm, pnpm, yarn, bun
- **Dynamic generators**: scaffold components, hooks, services, features from project root

### Key insight
The user mentioned commander.js, but the industry gold standard (create-vite) uses `mri` + `@clack/prompts`. The interactive wizard approach is validated by both create-vite and create-next-app. The main difference: create-vite uses `@clack/prompts` (not commander.js) for prompts, and `mri` (not commander.js) for flag parsing.

Q4: Which CLI tooling stack should we adopt for the interactive wizard?

Answer: mri + @clack/prompts (Recommended) — Follow create-vite's pattern: mri for lightweight flag parsing and @clack/prompts for beautiful interactive prompts.

Q5: What form should the rebuilt .docs/create-ink-app take?

Answer: Reference only, build new architecture from scratch — The existing .docs/create-ink-app remains as a historical reference. We will build a completely new architecture for the modern scaffolding tool from scratch, not as a modification of the old codebase.

Q6: What should the interactive wizard's question flow look like?

Answer: Proposed flow (Recommended) — 11-step flow: project name → runtime (Node/Deno/Bun) → package manager (auto-detected from npm_config_user_agent, override available) → language (TS/JS) → Ink version → linter → formatter → test framework → pre-commit hooks → CI/CD → install dependencies. Mirrors create-vite's proven pattern.

Q7: How should the template system handle the combinatorial matrix of user choices?

Answer: Hybrid (Recommended) — Base template for runtime + language (the Ink app structure: package.json, source files, etc.) + programmatic config file generation for tools (generate eslint.config.js, biome.json, vitest.config.ts, etc. based on user choices). Clean templates, manageable code, no remote dependency.

### Research: Ink.js Testing Patterns (from professional-tui wiki + warriorjs + gemini-cli)

**Testing tools:**
- `ink-testing-library` (v4.0.0) is the standard — `render()` returns `{ lastFrame, frames, rerender, unmount, stdin, stdout, stderr }`
- `vitest` is the modern test runner (warriorjs migrated from ava to vitest)

**Key testing challenges & solutions:**
- **Timing**: Tests need 50ms+ delays for async rendering. Use custom `waitForRender()` helper.
- **Frame handling**: Use `frames` array + `getLastContentFrame()` instead of `lastFrame()` because `exit()` may write an empty frame after unmount.
- **stdin.write() bug**: In Ink v5, `stdin.write()` does NOT trigger `useInput` callbacks. Workaround: extract input handler logic into pure functions and test them directly.
- **Hook testing**: Hooks are independently testable — call the hook in a test renderer with mock arguments, no full provider tree needed.
- **28 examples** ship with Ink covering every component, hook, and render option — useful as reference patterns.

**Gemini CLI testing approach:**
- Hooks are independently testable — test by calling the hook in a test renderer with mock arguments
- No need for full AppContainer or provider tree — just the hook and its inputs

Q8: What testing and quality practices should the scaffolding tool follow?

Answer: Runtime-dependent test framework — The test framework for the generated app depends on the runtime the user selects: Node.js → vitest, Bun → bun:test, Deno → deno test. The scaffolding tool itself will use vitest as its default test runner (runtime-agnostic). E2E verification will scaffold the top 8-10 most common stack combinations and verify each builds + runs correctly.

Q9: How should the scaffolding tool be distributed?

Answer: Single npm package (Recommended) — Publish as a single npm package with templates bundled inside. Users run `npx create-bun-ink-app`. Simplest distribution (follows create-vite pattern), no external template fetching, works offline, supports all package managers.

---

## Brainstormer Review (Round 001)

**Result:** 16 gaps identified — 4 Critical, 7 High, 5 Medium. Full report at `_xzy-ai/discussion/rebuild-create-ink-app-docs/storming/round-001.md`.

### Critical Gaps (must resolve before implementation):

1. **GAP-001: Ink runtime compatibility is unproven** — Ink uses Node.js `process.stdout`, `process.stdin`, `node:stream`, `node:events`. Deno's Node compat layer may not handle TTY/stream correctly. Bun's compatibility is better but untested with Ink v5.
2. **GAP-002: Package name/branding ambiguity** — Named `create-bun-ink-app` but claims tri-runtime support.
3. **GAP-003: Deno template strategy undefined** — Deno uses `deno.json`, URL imports, no `package.json`; the "package manager" wizard step doesn't apply.
4. **GAP-004: Ink version selection matrix undefined** — What Ink versions offered? What React versions? What runtime compat?

### High-Priority Gaps:
5. Linter/formatter choices not specified (ESLint/Biome/Prettier/xo?)
6. Pre-commit hook tool not specified (Husky/lefthook?)
7. CI/CD provider options not specified (GitHub Actions?)
8. Test framework + ink-testing-library integration details missing
9. "Package manager" step inconsistent for Deno
10. Non-interactive/CI agent mode not decided

### Medium-Priority Gaps:
11. Template rendering engine/placeholder strategy
12. Post-scaffold UX (success message, auto-start)
13. Existing directory / overwrite handling
14. React version strategy
15. Build system per runtime (tsc/bun build/deno compile)
16. Maintenance burden for 500+ stack combinations

### Critical dependency chain:
GAP-001 (runtime compat) → GAP-003 (Deno templates) → GAP-004 (Ink versions) → GAP-014 (React) → GAP-015 (build system)

---

## Gap Resolution Log

### GAP-001: Ink cross-runtime compatibility — RESOLVED

**Research findings:**
- **Bun**: Good compatibility. `stdin.ref()` bug fixed (Bun PR #16767). One open issue (cursor disappears on auto-exit, issue #26642) is easily worked around with `useApp().exit()`. Users actively ship Ink CLI binaries with Bun.
- **Deno**: **Limited compatibility.** Basic rendering (Box, Text, useFocus) works via `npm:ink` imports. However, `useInput`/raw mode does NOT work — Deno's `node:tty` compat layer explicitly states "Missing ReadStream and WriteStream implementation." Interactive Ink apps cannot work on Deno.

**Decision:** Drop Deno as a target runtime. Focus on Node.js + Bun only — both have solid Ink compatibility. This resolves GAP-001, GAP-003, and GAP-009 simultaneously.

### GAP-002: Package name resolved
**Decision:** `@xzy-ai/create-ink-app` — Scoped npm package name that is runtime-agnostic (doesn't mention Bun), clearly branded under the xzy-ai organization, and signals this is a scaffolding tool for Ink applications.

### GAP-004 + GAP-014: Ink and React version strategy — RESOLVED
**Decision:** Latest only — Always scaffold with the latest stable Ink (v6+) and React (19+). No version option in wizard. Simplest maintenance, forces everyone onto current best practices. This also removes the "Ink version" step from the wizard flow.

### GAP-005: Linter and formatter choices — RESOLVED
**Decision:** Offer choices in the wizard — Let the user choose. Options: Biome (unified linter+formatter), ESLint flat config + Prettier (traditional), or none. The wizard presents these as choices rather than hardcoding one.

### GAP-006: Pre-commit hooks — RESOLVED
**Decision:** Offer both Husky and Lefthook as choices in the wizard. Lefthook as the recommended default (lighter, cross-platform), Husky as the traditional alternative.

### GAP-007: CI/CD provider — RESOLVED
**Decision:** None by default — Don't generate CI config in the scaffold. Keeps it minimal. Users who need CI add their own. This simplifies template generation significantly.

### GAP-010: Non-interactive / CI agent mode — RESOLVED
**Decision:** Full support with flags — Support `--no-interactive` with CLI flags for every wizard choice (like create-vite). Auto-detect AI agents via `@vercel/detect-agent` and show helpful hint. Auto-detect TTY. For non-interactive mode, all choices get sensible defaults.

### GAP-008: Test framework integration — RESOLVED
**Decision:** Node.js → vitest + ink-testing-library, Bun → bun:test + ink-testing-library (Bun's Node compat covers it). The test framework depends on runtime choice in the wizard. Handle Ink v5/v6 stdin.write() issue by including pure-function handler extraction patterns in test templates.

### GAP-011: Template rendering engine — RESOLVED
**Decision:** Simple `<% VARIABLE %>` placeholder substitution (EJS-style) for template files, and programmatic JSON object generation for config files (eslint.config.js, biome.json, etc.). No heavy template engine dependency.

### GAP-012: Post-scaffold UX — RESOLVED
**Decision:** Post-scaffold success message with runtime-aware instructions (different commands for `cd my-app && npm run dev` vs `bun run dev`). Support `--immediate` flag to auto-install deps and start dev server (like create-vite). Show summary of chosen options.

### GAP-013: Existing directory handling — RESOLVED
**Decision:** Support `--overwrite` / `--no-overwrite` flags (like create-vite). Default: prompt user if directory exists and is non-empty. Support scaffolding into current directory (`.`).

### GAP-015: Build system per runtime — RESOLVED
**Decision:** Node.js → esbuild, Bun → bun build/compile. Each runtime uses the fastest available transpiler. esbuild for Node (faster than tsc), bun build for Bun (native, no extra deps).

### GAP-016: Maintenance strategy — RESOLVED
**Decision:** Version compatibility table stored in the package (compat.json) mapping runtime × Ink × React versions. Automated CI validation of top combinations. Deprecate Ink versions when upstream drops support. Focus on the reduced matrix: 2 runtimes × 1 language (TS preferred) × ~3 tooling combos = manageable scope.

