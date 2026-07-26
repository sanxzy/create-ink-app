---
agent: dispatch-code-worker
work_unit_id: "01 — Node + TypeScript Scaffold Engine (tracer bullet)"
report_number: 01-fixes
status: completed
timestamp: "2026-07-26T15:08:00Z"
worker_mode: default
work_unit_type: functional
artifacts:
  - src/infrastructure/templates/template-engine.ts
  - src/application/services/config-generators.ts
  - src/presentation/commands/create-app.ts
  - src/domain/value-objects/project-name.ts
  - package.json
  - src/tests/integration/scaffold-engine.test.ts
  - src/tests/unit/presentation-layer.test.ts
upstream_reports:
  - dispatch/worker/report-01.md
  - dispatch/reviews/dispatch-acs-reviewer/report-01.md
  - dispatch/reviews/dispatch-security-reviewer/report-01.md
  - dispatch/reviews/dispatch-quality-gate-reviewer/report-01.md
---

# Fixes Report — 01 — Node + TypeScript Scaffold Engine (tracer bullet)

**Agent:** dispatch-code-worker
**Work Unit:** 01 — Node + TypeScript Scaffold Engine (tracer bullet)
**Report Number:** 01-fixes
**Backlog:** tix-create-ink-app-scaffold
**Status:** COMPLETED
**Review Status:** All three gates APPROVED — applying Last Loop Rule fixes
**Timestamp:** 2026-07-26T15:08:00Z

## Summary

Applied all 9 Minor and Trivial findings from the ACS, Security, and Quality Gate reviews. Changes include: prototype-chain safety fix in template engine, supply-chain hardening in generated lefthook.yml, graceful process exit with I/O flushing, documentation warning for normalizeProjectName, tempy dependency for integration tests, 28 new presentation-layer unit tests, and deprecated `--apply` → `--write` flag migration for Biome v2.

## Acceptance Criteria Status (All Still Passing)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | `create-ink-app my-app --no-interactive` creates a valid project directory | [x] PASS |
| 2 | Generated project contains all 12 required files | [x] PASS |
| 3 | `package.json` has correct name, 8 scripts, Ink v6+/React 19+ deps | [x] PASS |
| 4 | Template substitution replaces `<% VAR %>` and strips `.template` suffix | [x] PASS |
| 5 | `--help` and `--version` flags work | [x] PASS |
| 6 | Invalid project name produces clear error with exit 1 | [x] PASS |
| 7 | Unit tests cover template substitution, config generators, name validation | [x] PASS |
| 8 | Integration tests cover scaffold engine with real temp dirs | [x] PASS |

## Files Modified

| File | Change | Fix ID |
|------|--------|--------|
| `src/infrastructure/templates/template-engine.ts` | `varName in vars` → `Object.hasOwn(vars, varName)` | SEC-01 |
| `src/application/services/config-generators.ts` | `npx` → `npm run` in lefthook.yml generation | SEC-02 |
| `src/application/services/config-generators.ts` | `--apply` → `--write` in generated package.json check script | QG-01 |
| `src/presentation/commands/create-app.ts` | Added `gracefulExit()` helper flushes stdout/stderr before `process.exit()` | SEC-03 |
| `src/domain/value-objects/project-name.ts` | Added docstring warning about FS path safety | SEC-04 |
| `package.json` | `--apply` → `--write` in check script; added `tempy` to devDependencies | QG-01, m-2 |
| `src/tests/integration/scaffold-engine.test.ts` | `fs.mkdtempSync` → `temporaryDirectory()` from tempy | m-2 |

## Files Created

| File | Change | Fix ID |
|------|--------|--------|
| `src/tests/unit/presentation-layer.test.ts` | 28 new tests for parseArgs, formatHelp, formatVersion, formatScaffoldSuccess, formatScaffoldError, formatScaffoldResult, parsedArgsToScaffoldInput | m-3 |

## Tests

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Test files | 5 | 6 | +1 |
| Total tests | 83 | 111 | +28 |
| Pass rate | 100% | 100% | Unchanged |

## Fix Details

### ACS Review Findings (3 Minor)

| ID | Severity | Description | Fix |
|----|----------|-------------|-----|
| m-1 | Minor | Implementation report not at `dispatch/worker/report-01.md` | **Verified:** Report already exists at expected path from initial implementation (23061 bytes, written 2026-07-26T14:38) |
| m-2 | Minor | Integration tests use Node.js built-ins instead of `tempy` | Added `tempy@^3.2.0` to `devDependencies` via `bun add -d`. Updated `scaffold-engine.test.ts` to import `temporaryDirectory` from `tempy` and replaced `createTempDir()` with `temporaryDirectory()`. Manually clean up still in place via `afterEach`. |
| m-3 | Minor | Integration tests bypass CLI layer — no tests for `parseArgs`, `formatHelp`, etc. | Created new `src/tests/unit/presentation-layer.test.ts` with 28 tests covering: `parseArgs` (11 tests: all flag variants, camelCase support, default values, empty/extra positional args), `parsedArgsToScaffoldInput` (3 tests: conversion, flag propagation, empty name), `formatHelp` (2 tests: usage text, option listing), `formatVersion` (2 tests), `formatScaffoldSuccess` (4 tests: success message, directory, files, next steps), `formatScaffoldError` (4 tests: all 4 error kinds), `formatScaffoldResult` (2 tests: exit code 0 for success, exit code 1 for error). |

### Security Review Findings (2 Minor + 2 Trivial)

| ID | Severity | Description | Fix |
|----|----------|-------------|-----|
| SEC-01 | Minor | `varName in vars` traverses prototype chain | Replaced `if (varName in vars)` with `if (Object.hasOwn(vars, varName))` in `template-engine.ts:39`. Added comment: "Use Object.hasOwn to check only own properties, avoiding prototype chain traversal." |
| SEC-02 | Minor | Generated lefthook.yml uses `npx` — supply chain risk | Changed lefthook commands from `npx tsc --noEmit` / `npx biome check source/` / `npx biome format --write source/` to `npm run typecheck` / `npm run lint` / `npm run format`. This ensures the generated project uses exact tool versions from `devDependencies`. |
| SEC-03 | Trivial | `process.exit()` without stdout/stderr flush | Added `gracefulExit()` helper function in `create-app.ts` that calls `process.stdout.write('', callback)` and `process.stderr.write('', callback)` before `process.exit()`. Replaced all 5 `process.exit(N)` calls with `gracefulExit(N)`. |
| SEC-04 | Trivial | `normalizeProjectName()` retains `.` and `_` chars | Added JSDoc comment with explicit WARNING: "This function is NOT safe for file path construction. The output preserves dots (`.`) and underscores (`_`), which could permit path traversal sequences (`..`) if used in file system operations. Use `createProjectName()` for validated names suitable for directory creation." |

### Quality Gate Findings (2 Minor)

| ID | Severity | Description | Fix |
|----|----------|-------------|-----|
| QG-01 | Minor | `--apply` flag deprecated in Biome v2 | Changed `--apply` to `--write` in two places: (1) `package.json` script `"check": "biome check --write src/"`, (2) `config-generators.ts` generated package.json: `check: 'biome check --write source/'`. Verified `bun run check` now works: "Checked 22 files in 17ms. No fixes applied." |
| QG-02 | Minor | `@vitest/coverage-v8` not in devDependencies | **Already resolved:** `@vitest/coverage-v8@^4.1.10` was already present in `package.json` devDependencies. Verified coverage runs: Statements 82.32%, Branches 79.12%, Functions 82.5%, Lines 83.76%. |

## Verification

```
bun test         → 6 test files, 111 tests, 0 failures
tsc --noEmit     → Clean exit, 0 errors
bun run check    → Checked 22 files, no fixes applied (--write works)
bun ci src/      → Checked 22 files, no fixes applied (format check passes)
bun run build    → Bundled 13 modules → dist/index.js (25.30 KB)
bun run --coverage → Coverage v8: 82.32% stmts, 79.12% branches
```
