# Work Unit 04: Bun Runtime Support

**Backlog:** tix-create-ink-app-scaffold
**Type:** functional
**Status:** dispatched
**Mode:** TDD

## Background

WU-01-03 built the scaffold engine for Node.js with TS/JS, Biome/ESLint+Prettier, Lefthook/Husky, dry-run, and runtime validation. This work unit adds full Bun runtime support.

## Previous Progress

WU-01 (DONE): Scaffold engine, 111 tests.
WU-02 (DONE): Interactive wizard, state resolver, env detection, 173 tests.
WU-03 (DONE): JS/ESLint/Husky/dry-run/runtime validation, 243 tests.

## What to Build

Full Bun runtime support: scaffolds Bun Ink projects using `bun build`, `bun test`, and Bun-native tooling. Works with all language, linter, and pre-commit combinations. Runtime validation checks Bun is installed.

## Acceptance Criteria

- [ ] Bun + TS and Bun + JS scaffolds create correct project using `templates/bun/<language>/`
- [ ] Bun `package.json` has `bun build`, `bun run dev`, `bun start`, `bun test` scripts
- [ ] No `vitest.config.ts` generated for Bun scaffolds
- [ ] Bun shebang (`#!/usr/bin/env bun`) in `cli.tsx`
- [ ] Bun `.gitignore` includes `bun.lock`
- [ ] Bun works with all linter options (Biome, ESLint+Prettier, none)
- [ ] Bun works with all pre-commit options (Lefthook, Husky, none)
- [ ] Runtime validation checks `bun --version` before scaffolding

## Blocked By

01 — Node + TypeScript Scaffold Engine (tracer bullet)
02 — Interactive Wizard & Full State Resolution

## Constraints

- TDD mode
- Templates at `templates/bun/typescript/` and `templates/bun/javascript/`
- Bun uses `bun build` instead of `tsc`, `bun test` instead of `vitest`
- No `vitest.config.ts` for Bun scaffolds
- `.gitignore` includes `bun.lock`
- Shebang: `#!/usr/bin/env bun`
- Runtime validation: check `bun --version`

## Notes

The existing `checkRuntime` infrastructure from WU-03 can be extended to support both `node` and `bun` runtimes. The config generators need to be runtime-aware (Bun scripts vs Node scripts). Template files are similar but with Bun shebang and no tsconfig for JS.
