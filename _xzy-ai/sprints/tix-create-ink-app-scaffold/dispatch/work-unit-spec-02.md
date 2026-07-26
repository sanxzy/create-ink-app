# Work Unit 02: Interactive Wizard & Full State Resolution

**Backlog:** tix-create-ink-app-scaffold
**Type:** functional
**Status:** dispatched
**Mode:** TDD

## Background

Building a CLI tool called `create-ink-app` that scaffolds complete, runnable Ink React projects. WU-01 implemented the Node + TypeScript scaffold engine with `--no-interactive` mode. This work unit adds the interactive wizard using `@clack/prompts`, full CLI flag parsing with `mri`, state resolution precedence (CLI flags > prompts > defaults), AI agent detection, and package manager detection.

The project follows Clean Architecture with FP conventions per `_xzy-ai/architecture.md`. Use `bun`, `vitest`, `biome`, `lefthook`.

## Previous Progress

WU-01 complete: Scaffold engine with `--no-interactive` mode implemented, committed, and merged. 111 tests passing. Clean Architecture layers in place (domain, application, infrastructure, presentation). Template engine, config generators, project name validation, CLI argument parsing, and output formatting all implemented.

## What to Build

Running `create-ink-app` with no arguments starts a beautiful interactive wizard via `@clack/prompts`. Running with some flags provides mixed mode. AI agents are auto-detected with helpful usage hints. `--help` shows all flags. State resolves as: CLI flags > prompts > defaults.

## Acceptance Criteria

- [ ] Full interactive wizard with all prompts: project name, runtime, language, package manager, linter, test framework, precommit, install deps
- [ ] All CLI flags parsed by `mri`: `--runtime`, `--language`, `--linter`, `--test`, `--precommit`, `--pm`, `--overwrite`, `--no-overwrite`, `--immediate`, `--no-interactive`, `--dry-run`, `--help`, `--version`
- [ ] Resolution precedence strictly: CLI flags > interactive prompts > defaults
- [ ] Non-interactive mode skips all prompts; requires project name; exits code 1 if missing
- [ ] Mixed mode: provided flags pre-fill prompts
- [ ] Non-TTY detection auto-falls back to non-interactive with message
- [ ] AI agent detection shows non-interactive usage hint
- [ ] Package manager detection from `npm_config_user_agent` with npm fallback

## Blocked By

01 — Node + TypeScript Scaffold Engine (tracer bullet)

## Constraints

- TDD mode: write failing tests first, then implement
- Use `@clack/prompts` for interactive wizard UI
- Use `mri` for CLI argument parsing (already a dependency from WU-01)
- Clean Architecture with FP conventions (domain → application → infrastructure → presentation → composition root)
- `Result<T, E>` pattern for use case functions
- Dependency injection via function parameters
- ESM module system
- `package.json` version `0.1.0` for the CLI tool
- AI agent detection: check `npm_config_user_agent`, `CI` env var, `GITHUB_ACTIONS` env var, or non-TTY stdin
- Package manager detection: check `npm_config_user_agent` env var, fall back to `npm`
- Non-TTY detection: check `process.stdin.isTTY`

## Notes

This is a functional work unit — full TDD required. Tests must cover: prompt logic, state resolution precedence, AI agent detection, non-TTY detection, package manager detection, and CLI flag parsing. The interactive wizard uses `@clack/prompts` which provides `text`, `select`, `confirm`, `multiselect`, `isCancel`, `outro` functions.
