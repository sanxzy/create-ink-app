# Tickets — tix-create-ink-app-scaffold

## 01 — Node + TypeScript Scaffold Engine (tracer bullet)

**What to build:** Running `create-ink-app my-app --no-interactive` scaffolds a complete, runnable Node.js + TypeScript Ink project with Biome linter, Lefthook pre-commit hooks, MIT license, and all shared infrastructure files. Validates the full architecture before building out remaining combinations.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] `create-ink-app my-app --no-interactive` creates a valid project directory at `./my-app/`
- [ ] Generated project contains: `source/app.tsx`, `source/cli.tsx`, `test.tsx`, `package.json`, `tsconfig.json`, `biome.json`, `lefthook.yml`, `compat.json`, `.gitignore`, `.editorconfig`, `readme.md`, `LICENSE` (MIT)
- [ ] `package.json` has correct name, scripts (`build`, `dev`, `start`, `test`, `lint`, `format`, `check`, `typecheck`), and Ink v6+/React 19+ dependencies
- [ ] Template substitution replaces `<% VAR %>` placeholders in `.template` files and strips the suffix
- [ ] `create-ink-app --help` displays usage; `--version` displays version
- [ ] Invalid project name produces clear error with exit code 1
- [ ] Unit tests cover: template substitution, config generators (biome, lefthook, tsconfig, package.json), project name validation
- [ ] Integration tests (real temp dirs via `tempy`, `execa` mocked) cover: scaffold engine producing correct file tree, all config generators producing expected output

---

## 02 — Interactive Wizard & Full State Resolution

**What to build:** Running `create-ink-app` with no arguments starts a beautiful interactive wizard via `@clack/prompts`. Running with some flags provides mixed mode. AI agents are auto-detected with helpful usage hints. `--help` shows all flags. State resolves as: CLI flags > prompts > defaults.

**Blocked by:** 01 — Node + TypeScript Scaffold Engine (tracer bullet)

**Status:** ready-for-agent

- [ ] Full interactive wizard with all prompts: project name, runtime, language, package manager, linter, test framework, precommit, install deps
- [ ] All CLI flags parsed by `mri`: `--runtime`, `--language`, `--linter`, `--test`, `--precommit`, `--pm`, `--overwrite`, `--no-overwrite`, `--immediate`, `--no-interactive`, `--dry-run`, `--help`, `--version`
- [ ] Resolution precedence strictly: CLI flags > interactive prompts > defaults
- [ ] Non-interactive mode skips all prompts; requires project name; exits code 1 if missing
- [ ] Mixed mode: provided flags pre-fill prompts
- [ ] Non-TTY detection auto-falls back to non-interactive with message
- [ ] AI agent detection shows non-interactive usage hint
- [ ] Package manager detection from `npm_config_user_agent` with npm fallback

---

## 03 — Extended Node.js Combinations (JavaScript, ESLint+Prettier, Husky, dry-run, runtime validation)

**What to build:** The full range of Node.js scaffolding options: JavaScript language produces `.jsx` files, ESLint+Prettier generates `eslint.config.js` + `.prettierrc`, Husky generates `.husky/pre-commit`. `--dry-run` previews output without writing. Runtime validation confirms Node.js is installed before scaffolding.

**Blocked by:** 01 — Node + TypeScript Scaffold Engine (tracer bullet), 02 — Interactive Wizard & Full State Resolution

**Status:** ready-for-agent

- [ ] Node + JS scaffold creates `.jsx` files with correct `package.json`, no `tsconfig.json`
- [ ] ESLint+Prettier generates `eslint.config.js` (flat config) and `.prettierrc`
- [ ] Husky generates `.husky/pre-commit` shell hook
- [ ] `vitest.config.ts` generated for Node scaffolds
- [ ] Biome and ESLint+Prettier are mutually exclusive; none creates no lint config
- [ ] Lefthook and Husky are mutually exclusive; none creates no hook config
- [ ] `--dry-run` shows all files that would be created without writing to disk
- [ ] Runtime validation checks `node --version` before scaffolding
- [ ] MIT license file contains standard text with project name as copyright holder

---

## 04 — Bun Runtime Support (all combinations)

**What to build:** Full Bun runtime support: scaffolds Bun Ink projects using `bun build`, `bun test`, and Bun-native tooling. Works with all language, linter, and pre-commit combinations. Runtime validation checks Bun is installed.

**Blocked by:** 01 — Node + TypeScript Scaffold Engine (tracer bullet), 02 — Interactive Wizard & Full State Resolution

**Status:** ready-for-agent

- [ ] Bun + TS and Bun + JS scaffolds create correct project using `templates/bun/<language>/`
- [ ] Bun `package.json` has `bun build`, `bun run dev`, `bun start`, `bun test` scripts
- [ ] No `vitest.config.ts` generated for Bun scaffolds
- [ ] Bun shebang (`#!/usr/bin/env bun`) in `cli.tsx`
- [ ] Bun `.gitignore` includes `bun.lock`
- [ ] Bun works with all linter options (Biome, ESLint+Prettier, none)
- [ ] Bun works with all pre-commit options (Lefthook, Husky, none)
- [ ] Runtime validation checks `bun --version` before scaffolding

---

## 05 — Post-Scaffold UX, Package Install, Cleanup & Polish

**What to build:** After scaffolding, a beautiful runtime-aware success message shows the correct dev command. `--immediate` auto-installs with a spinner. Ctrl+C cleanly cancels with code 0. Directory conflicts, permission errors, and signal handling are all handled gracefully.

**Blocked by:** 01 — Node + TypeScript Scaffold Engine (tracer bullet), 02 — Interactive Wizard & Full State Resolution

**Status:** ready-for-agent

- [ ] Post-scaffold `outro()` shows runtime-aware dev command and option summary
- [ ] `--immediate` with install=yes runs `execa` install with spinner and shows next steps
- [ ] `--immediate` with install=no skips install but shows next-step instructions
- [ ] Install command uses the detected/selected package manager
- [ ] Failed install shows clear error and exits code 1
- [ ] SIGINT/SIGTERM during scaffold cleans up partial output, exits code 0
- [ ] Cancel at prompt shows formatted message, exits code 0, no files written
- [ ] Overwrite modes (ask, yes, no) work correctly
- [ ] `.` as project name scaffolds into current directory
- [ ] Directory not writable detected early with clear error

---

## 06 — E2E Matrix & Edge Case Testing

**What to build:** Complete test infrastructure with full E2E coverage validating all 8 scaffold combinations end-to-end. Test fixtures (`createState()`, minimal templates, expected outputs) and edge case coverage for cross-platform behavior, spaces in paths, and special character handling.

**Blocked by:** 03 — Extended Node.js Combinations (JavaScript, ESLint+Prettier, Husky, dry-run, runtime validation), 04 — Bun Runtime Support (all combinations), 05 — Post-Scaffold UX, Package Install, Cleanup & Polish

**Status:** ready-for-agent

- [ ] Test fixtures exist: `createState()` helper, minimal template directories, expected output snapshots
- [ ] All 8 E2E matrix combinations pass (scaffold, file verify, install, build, test): 1. Node+TS+Biome+Lefthook 2. Node+JS+ESLint+Prettier+none 3. Node+TS+none+Husky 4. Bun+TS+Biome+Lefthook 5. Bun+JS+ESLint+Prettier+none 6. Bun+TS+none+none 7. Node+TS+ESLint+Prettier+none 8. Node+JS+Biome+Lefthook
- [ ] All three operating modes tested: interactive (mocked), non-interactive (flags), mixed (partial flags + prompts)
- [ ] Edge case tests pass: spaces in paths, leading dot, current dir, uppercase normalized
- [ ] Cross-platform path handling: `path` module usage, forward slashes, Windows path documentation
- [ ] E2E tests run in CI only with parallel matrix and 10-minute timeout
