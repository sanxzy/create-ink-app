# Work Unit 01: Node + TypeScript Scaffold Engine (tracer bullet)

**Backlog:** tix-create-ink-app-scaffold
**Type:** functional
**Status:** dispatched

## Background

Build a CLI tool called `create-ink-app` that scaffolds complete, runnable Ink React projects. This initial tracer-bullet work unit validates the full architecture end-to-end by implementing the Node.js + TypeScript + Biome + Lefthook combination first, before extending to other combinations in later work units.

The project is greenfield — there is no source code yet. The architecture reference is at `_xzy-ai/architecture.md`, which prescribes Clean Architecture with Functional Programming conventions: domain layer (pure value objects, port interfaces), application layer (use case functions returning Result<T,E>), infrastructure layer (adapters implementing ports), presentation layer (CLI command handlers), and a composition root at `src/index.ts`.

Use `bun` as the runtime/package manager, `vitest` for testing, `biome` for formatting/linting, `lefthook` for pre-commit hooks.

## Previous Progress

None — this is the first work unit.

## What to Build

Running `create-ink-app my-app --no-interactive` scaffolds a complete, runnable Node.js + TypeScript Ink project with Biome linter, Lefthook pre-commit hooks, MIT license, and all shared infrastructure files. Validates the full architecture before building out remaining combinations.

## Acceptance Criteria

- [ ] `create-ink-app my-app --no-interactive` creates a valid project directory at `./my-app/`
- [ ] Generated project contains: `source/app.tsx`, `source/cli.tsx`, `test.tsx`, `package.json`, `tsconfig.json`, `biome.json`, `lefthook.yml`, `compat.json`, `.gitignore`, `.editorconfig`, `readme.md`, `LICENSE` (MIT)
- [ ] `package.json` has correct name, scripts (`build`, `dev`, `start`, `test`, `lint`, `format`, `check`, `typecheck`), and Ink v6+/React 19+ dependencies
- [ ] Template substitution replaces `<% VAR %>` placeholders in `.template` files and strips the suffix
- [ ] `create-ink-app --help` displays usage; `--version` displays version
- [ ] Invalid project name produces clear error with exit code 1
- [ ] Unit tests cover: template substitution, config generators (biome, lefthook, tsconfig, package.json), project name validation
- [ ] Integration tests (real temp dirs via `tempy`, `execa` mocked) cover: scaffold engine producing correct file tree, all config generators producing expected output

## Blocked By

None — can start immediately

## Constraints

- Clean Architecture with Functional Programming: domain → application → infrastructure → presentation → composition root
- `Result<T, E>` pattern for use case functions — no throwing exceptions for expected error paths
- Dependency injection via function parameters (factory pattern)
- Use `bun` for package management and scripting
- Use `vitest` for testing
- Use `biome` for formatting and linting
- Templates stored under `templates/node/typescript/`
- Template files use `.template` suffix with `<% VAR %>` substitution markers
- `package.json` version set to `1.0.0` for the generated project
- `compat.json` records the scaffold version used to create the project
- MIT license with `<% PROJECT_NAME %>` as copyright holder
- Project name validation: valid npm package name, no reserved names, lowercase+normalized
- ESM module system (`"type": "module"` in package.json)

## Notes

This is a functional work unit — full tests are required (unit + integration). The architecture.md at the project root is the authoritative reference for project structure. Read it before starting implementation. The `bun build` command should compile TypeScript to `dist/`. The `test.tsx` in the generated template should be a simple Ink component render test.
