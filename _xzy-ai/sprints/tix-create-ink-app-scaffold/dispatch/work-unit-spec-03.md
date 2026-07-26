# Work Unit 03: Extended Node.js Combinations

**Backlog:** tix-create-ink-app-scaffold
**Type:** functional
**Status:** dispatched
**Mode:** TDD

## Background

WU-01 built the Node+TS+Biome+Lefthook scaffold engine. WU-02 added the interactive wizard and state resolution. This work unit extends the engine to support all remaining Node.js combinations: JavaScript, ESLint+Prettier, Husky, dry-run mode, and runtime validation.

## Previous Progress

- **WU-01** (DONE): Scaffold engine, template substitution, config generators. 111 tests.
- **WU-02** (DONE): Interactive wizard, state resolver, env detection. 173 cumulative tests.

## What to Build

Full Node.js scaffolding options: JavaScript language produces `.jsx` files, ESLint+Prettier generates `eslint.config.js` + `.prettierrc`, Husky generates `.husky/pre-commit`. `--dry-run` previews output without writing. Runtime validation confirms Node.js is installed before scaffolding.

## Acceptance Criteria

- [ ] Node + JS scaffold creates `.jsx` files with correct `package.json`, no `tsconfig.json`
- [ ] ESLint+Prettier generates `eslint.config.js` (flat config) and `.prettierrc`
- [ ] Husky generates `.husky/pre-commit` shell hook
- [ ] `vitest.config.ts` generated for Node scaffolds
- [ ] Biome and ESLint+Prettier are mutually exclusive; none creates no lint config
- [ ] Lefthook and Husky are mutually exclusive; none creates no hook config
- [ ] `--dry-run` shows all files that would be created without writing to disk
- [ ] Runtime validation checks `node --version` before scaffolding
- [ ] MIT license file contains standard text with project name as copyright holder

## Blocked By

01 — Node + TypeScript Scaffold Engine (tracer bullet)
02 — Interactive Wizard & Full State Resolution

## Constraints

- TDD mode: write failing tests first, then implement
- No `tsconfig.json` for JS scaffolds
- `eslint.config.js` uses flat config format (ESM)
- `.husky/pre-commit` shell hook with `#!/usr/bin/env sh`
- Dry-run: log all files to console, never write to disk
- Runtime validation: use `node --version` check via `execa`
- ESM module system
- Follow existing Clean Architecture layers

## Notes

Templates for JS: `templates/node/javascript/`. ESLint config generator is a new pure function. Husky hook generator is new. Dry-run mode should be tested separately from real file writes. Runtime validation can use `execa` to check `node --version`.
