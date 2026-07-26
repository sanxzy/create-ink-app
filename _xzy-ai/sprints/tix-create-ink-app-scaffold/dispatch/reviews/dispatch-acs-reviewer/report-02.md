---
agent: dispatch-acs-reviewer
work_unit_id: "02 — Interactive Wizard & Full State Resolution"
report_number: 02
status: APPROVED
timestamp: "2026-07-26T19:00:00Z"
artifacts:
  - work-unit-spec-02.md
  - report-02.md (implementation report)
  - src/application/commands/state-resolver.ts
  - src/application/dtos/scaffold-input.ts
  - src/infrastructure/cli/environment-detector.ts
  - src/infrastructure/index.ts
  - src/presentation/commands/create-app.ts
  - src/presentation/formatters/output-formatter.ts
  - src/presentation/index.ts
  - src/presentation/parsers/args-parser.ts
  - src/presentation/wizard/interactive-wizard.ts
  - src/tests/unit/environment-detector.test.ts
  - src/tests/unit/interactive-wizard.test.ts
  - src/tests/unit/state-resolver.test.ts
  - src/tests/unit/presentation-layer.test.ts
  - src/index.ts
  - package.json
upstream_reports:
  - _xzy-ai/sprints/tix-create-ink-app-scaffold/dispatch/with-ui-worker/report-02.md
  - _xzy-ai/sprints/tix-create-ink-app-scaffold/dispatch/reviews/dispatch-acs-reviewer/report-02.md (previous cycle)
---

# ACS Review Report — 02 — Interactive Wizard & Full State Resolution

**Reviewer:** dispatch-acs-reviewer
**Work Unit:** 02 — Interactive Wizard & Full State Resolution
**Report Number:** 02 (re-review, cycle 2)
**Backlog:** tix-create-ink-app-scaffold
**Status:** APPROVED
**Timestamp:** 2026-07-26T19:00:00Z

## Verdict

**APPROVED** — All 8 acceptance criteria are satisfied. The Blocker (B1: defaults applied too early) has been fixed. Previously filed Minor issues m-2 (hint formatters lack tests) and m-3 (missing state resolver tests) have been addressed. Minor issue m-1 (dead code path) remains but does not block approval.

## Finding Summary

| Severity | Count |
|----------|-------|
| Blocker  | 0     |
| Critical | 0     |
| Major    | 0     |
| Minor    | 1     |
| Trivial  | 0     |

## Verification Summary

| Aspect | Result |
|--------|--------|
| Files verified | 15 source files, 4 test files, implementation report |
| Tests run | 173/173 pass (111 existing + 62 new), 346 expect() calls across 9 files |
| ACs verified | 8 total: 8 satisfied, 0 partially_satisfied, 0 not_satisfied |
| Compilation | Build succeeds (23 modules → 88.90 KB dist/index.js) |
| Implementation report | Found at `dispatch/with-ui-worker/report-02.md` — present and complete |

## Work Unit Classification (Verified)

| Aspect | Value |
|--------|-------|
| Worker's claimed type | functional |
| Reviewer's verified type | functional |
| Agreement | Yes — the ACs describe behavioral requirements (prompts, state resolution, detection) |
| Basis | All 8 ACs describe observable behavior (interactive prompts, CLI flag parsing, state resolution, environment detection). No AC is purely structural. |
| Scaffolding exemption applied? | No — functional work unit, tests required. Tests exist and were reviewed normally. |

## AC Status Table

| # | AC Description | Status | Evidence |
|---|----------------|--------|----------|
| 1 | Full interactive wizard with all prompts: project name, runtime, language, package manager, linter, test framework, precommit, install deps | **satisfied** | `src/presentation/wizard/interactive-wizard.ts:72-196` implements all 8 prompt slots. `parsedArgsToScaffoldInput` at `src/presentation/parsers/args-parser.ts:65-81` now correctly only includes explicitly provided CLI flags — all unprovided fields remain `undefined` in the partial, causing the wizard to show all 8 prompts. When `create-ink-app` is run with no args, the empty `ParsedArgs` produces an empty partial `{}`, so every `!partial.field` check passes and all prompts are shown. |
| 2 | All CLI flags parsed by `mri`: `--runtime`, `--language`, `--linter`, `--test`, `--precommit`, `--pm`, `--overwrite`, `--no-overwrite`, `--immediate`, `--no-interactive`, `--dry-run`, `--help`, `--version` | **satisfied** | `src/presentation/parsers/args-parser.ts:16-31` defines all 13 flags. `src/presentation/commands/create-app.ts:64-98` configures mri with proper aliases and type declarations. `parseArgs()` maps mri output correctly including `--no-overwrite` precedence. Tests at `src/tests/unit/presentation-layer.test.ts:88-146` verify each flag individually. |
| 3 | Resolution precedence strictly: CLI flags > interactive prompts > defaults | **satisfied** | The three-tier chain is now correctly realized: (1) `parsedArgsToScaffoldInput` only includes CLI-provided values, (2) wizard prompts fill in `undefined` fields, (3) `resolveScaffoldState` at `src/application/commands/state-resolver.ts:45-63` applies `??` fallback to `DEFAULT_SCAFFOLD_INPUT`. The `validateOneOf` function (lines 26-30) rejects invalid string values, falling through to defaults. Tests at `presentation-layer.test.ts:248-303` verify end-to-end resolution. |
| 4 | Non-interactive mode skips all prompts; requires project name; exits code 1 if missing | **satisfied** | `create-app.ts:126` sets `useInteractive = !args.noInteractive && tty && !aiAgent`. Lines 170-176 check `!args.projectName`, print error, and exit code 1 via `gracefulExit(1)`. Non-interactive path has no wizard calls. |
| 5 | Mixed mode: provided flags pre-fill prompts | **satisfied** | Wizard guard conditions (`!partial.field` for strings, `partial.installDeps === undefined` for boolean) correctly skip prompts for truthy/defined CLI values. When `--runtime bun` is provided, `parsedArgsToScaffoldInput` includes `runtime: 'bun'` and the wizard skips the runtime prompt. Unprovided fields remain `undefined` and are prompted. Test at `interactive-wizard.test.ts:263-307` verifies mixed mode explicitly. |
| 6 | Non-TTY detection auto-falls back to non-interactive with message | **satisfied** | `environment-detector.ts:37-39`: `isInteractive` checks `process.stdin.isTTY`. `create-app.ts:123-126`: non-TTY forces non-interactive. AI/hint message is shown (see AC7). |
| 7 | AI agent detection shows non-interactive usage hint | **satisfied** | `environment-detector.ts:48-63`: `isAIAgent` checks `CI`, `GITHUB_ACTIONS`, and TTY. `create-app.ts:162-164`: shows `formatAIAgentHint()` when `!tty && aiAgent`. Hint output includes `--no-interactive` usage instructions. Tests at `environment-detector.test.ts:76-104` cover all AI agent scenarios. |
| 8 | Package manager detection from `npm_config_user_agent` with npm fallback | **satisfied** | `environment-detector.ts:22-31`: parses `npm_config_user_agent` for pnpm/yarn/bun/npm, falls back to `'npm'`. Accepts optional `env` parameter for DI. Tests at `environment-detector.test.ts:18-53` with 7 cases covering all detection paths and fallbacks. |

## Findings

### Blocker Issues

None.

### Critical Issues

None.

### Major Issues

None.

### Minor Issues

#### m-1 — `formatNonInteractiveHint` is dead code in production

- **Severity:** Minor
- **Category:** Unreachable code
- **AC:** 6
- **Location:** `src/presentation/commands/create-app.ts:162-168`

**Description:**
The `else if (!tty && args.noInteractive)` branch at line 165 and the `formatNonInteractiveHint()` call at line 167 remain unreachable. This is because `isAIAgent()` (environment-detector.ts:60) returns `true` whenever `process.stdin.isTTY` is falsy (`if (!tty) return true`). Since `!tty` always implies `aiAgent === true`, the first branch at line 162 (`if (!tty && aiAgent)`) captures every non-TTY case. The `else if` branch can never execute. This was flagged as m-1 in the previous review cycle and has not been changed.

**Recommendation:** Either (a) remove the dead branch and `formatNonInteractiveHint` export, or (b) adjust the routing logic so that the specific "non-TTY detected" hint is shown for non-CI non-TTY cases rather than always showing the AI agent hint.

### Trivial Issues

None.

## Fix Instructions

No Blocker, Critical, or Major issues found. Approval is granted. The single Minor finding (m-1, dead code) is a pre-existing issue from the previous review cycle and does not block approval.

**Previous findings resolution:**
- **B1 (Defaults applied too early)** — FIXED. `parsedArgsToScaffoldInput` at `args-parser.ts:65-81` now uses conditional `if` guards instead of `||` defaults. Unprovided flags produce `undefined`, wizard prompts for all undefined fields, `resolveScaffoldState` applies defaults as final fallback. Verified: 173 tests pass, all 8 ACs satisfied.
- **m-1 (Dead code)** — NOT resolved. Still present, Minor severity, does not block.
- **m-2 (Hint formatters lack tests)** — FIXED. Tests added at `presentation-layer.test.ts:419-431` for both `formatNonInteractiveHint` and `formatAIAgentHint`.
- **m-3 (Missing state resolver tests)** — FIXED. Full 12-test coverage for all field overrides, multiple overrides, and immutability at `state-resolver.test.ts`. Additionally, validation logic (`validateOneOf`) was added to `state-resolver.ts`.

## Last Loop Rule Checkbox

- [ ] **Triggered** — The coordinator must verify this report's findings are addressed before the next loop.
- [x] **Not triggered** — All findings are Minor or below. Approval granted.

## Full Output — Complete Review Findings

### B1 Fix Verification

The Blocker finding from the previous review cycle (B1: "Defaults applied too early: interactive wizard silently skips 7 of 8 prompts") has been verified as fixed.

**Root cause:** `parsedArgsToScaffoldInput` was using `||` to fill in defaults for all empty CLI flag values:
```typescript
// BEFORE (broken):
runtime: (parsed.runtime as ScaffoldInput['runtime']) || DEFAULT_SCAFFOLD_INPUT.runtime,
```
This caused the wizard to receive all fields pre-filled with defaults, silently skipping 7 of 8 prompts.

**Fix applied:** `parsedArgsToScaffoldInput` now conditionally includes only fields that were explicitly provided:
```typescript
// AFTER (fixed):
if (parsed.runtime) input.runtime = parsed.runtime as ScaffoldInput['runtime'];
// ... same pattern for all string fields
if (parsed.overwrite !== undefined) input.overwrite = parsed.overwrite;
```

**Verification:** When `create-ink-app my-app` is run:
1. `parseArgs` returns `runtime: ''`, `language: ''`, etc.
2. `parsedArgsToScaffoldInput` returns `{ projectName: 'my-app' }` — only the project name (truthy string) is included
3. Wizard receives `partial = { projectName: 'my-app' }`
4. Wizard shows all prompts except project name (since `!partial.projectName` is false but all other `!partial.field` checks are true)
5. `resolveScaffoldState` applies defaults via `??` after wizard completes

This is confirmed working by:
- Code inspection of `args-parser.ts:65-81`
- Passing tests at `presentation-layer.test.ts:149-246` (specifically lines 169-176 which assert `expect(result.runtime).toBeUndefined()`)
- Integration test at `presentation-layer.test.ts:277-303` (verifying defaults through path)
- All 173 tests pass (62 new + 111 existing)

### AC Verification Details

#### AC 1 — Full interactive wizard with all prompts

**Status: SATISFIED**

The wizard at `src/presentation/wizard/interactive-wizard.ts:72-196` implements all 8 prompts:
- Lines 92-102: Project name text prompt (`!partial.projectName`)
- Lines 105-115: Runtime select prompt (`!partial.runtime`)
- Lines 118-128: Language select prompt (`!partial.language`)
- Lines 131-141: Package manager select prompt (`!partial.packageManager`)
- Lines 144-154: Linter select prompt (`!partial.linter`)
- Lines 157-167: Test framework select prompt (`!partial.testFramework`)
- Lines 170-180: Pre-commit tool select prompt (`!partial.preCommit`)
- Lines 183-192: Install deps confirm prompt (`partial.installDeps === undefined`)

The key fix is in `args-parser.ts:65-81` where `parsedArgsToScaffoldInput` now only includes explicitly provided flags. For `create-ink-app` with no flags, the partial is `{ projectName: 'my-app' }`. All 7 other fields are `undefined`, so all 7 prompts are shown. The `installDeps` field (boolean) uses `=== undefined` check which also correctly triggers the prompt when not provided.

**Tests:** `interactive-wizard.test.ts` has 15 tests including:
- "should prompt for project name when not provided" (line 52)
- "should prompt for runtime when not provided" (line 74)
- "should prompt for language when not provided" (line 95)
- "should prompt for package manager when not provided" (line 128)
- "should prompt for linter when not provided" (line 142)
- "should prompt for install deps when not provided" (line 157)
- "should resolve to full ScaffoldInput with all fields" (line 226)
- "should use default values for skipped prompts" (line 309)

#### AC 2 — All CLI flags parsed by mri

**Status: SATISFIED**

All 13 flags are parsed:
- `ParsedArgs` interface at `args-parser.ts:16-31` defines: `help`, `version`, `noInteractive`, `overwrite`, `noOverwrite`, `dryRun`, `immediate`, `projectName`, `runtime`, `language`, `linter`, `testFramework`, `preCommit`, `packageManager`
- mri config at `create-app.ts:64-98` with aliases (`-h`, `-v`, `--noInteractive`, `-o`, `--dryRun`) and type declarations
- `parseArgs` correctly maps: `--test` → `testFramework`, `--pm` → `packageManager`, `--precommit` → `preCommit`
- `--no-overwrite` properly takes precedence over `--overwrite` (args-parser.ts:42,49)
- Boolean string/number defaulting: all booleans default to `false`, all string flags to `''`

**Tests:** `presentation-layer.test.ts:88-146` — 13 tests covering each flag individually + defaults + precedence.

#### AC 3 — Resolution precedence strictly: CLI flags > interactive prompts > defaults

**Status: SATISFIED**

The three-tier precedence is correctly implemented:

1. **CLI flags (first tier):** `parsedArgsToScaffoldInput` at `args-parser.ts:65-81` only includes fields that were explicitly provided on the command line. Unprovided fields remain `undefined`.

2. **Interactive prompts (second tier):** `runInteractiveWizard` at `interactive-wizard.ts:72-196` receives the partial and only prompts for fields where `!partial.field` is true (or `partial.field === undefined` for booleans). Prompt results fill in any missing values.

3. **Defaults (third tier):** `resolveScaffoldState` at `state-resolver.ts:45-63` uses `??` (nullish coalescing) to merge resolved values with `DEFAULT_SCAFFOLD_INPUT`. The function also includes `validateOneOf` (lines 26-30) which rejects invalid string values, causing fallthrough to defaults.

The data flow is:
- Interactive: `args → parsedArgsToScaffoldInput → wizard → resolveScaffoldState`
- Non-interactive: `args → parsedArgsToScaffoldInput → resolveScaffoldState`

**Tests:** `state-resolver.test.ts` (12 tests), `presentation-layer.test.ts:248-303` (2 integration tests).

#### AC 4 — Non-interactive mode skips all prompts; requires project name; exits code 1

**Status: SATISFIED**

Control flow at `create-app.ts:126`:
```typescript
const useInteractive = !args.noInteractive && tty && !aiAgent;
```

When `useInteractive` is false, execution jumps to line 161 (non-interactive mode). No wizard calls occur. At line 171:
```typescript
if (!args.projectName) {
    console.error('  ✗ Project name is required when running in non-interactive mode.');
    // ...
    gracefulExit(1);
    return;
}
```

This exits code 1 with clear error message. Tested through the non-interactive test scenarios.

#### AC 5 — Mixed mode: provided flags pre-fill prompts

**Status: SATISFIED**

The wizard correctly skips prompts for fields already provided via CLI flags. Each prompt guard:
```typescript
if (!partial.runtime) { /* prompt */ } else { result.runtime = partial.runtime; }
```

When `--runtime bun` is provided, `parsedArgsToScaffoldInput` includes `runtime: 'bun'`. The wizard skips the runtime prompt and uses the CLI value. Unprovided fields remain `undefined` and are prompted.

Explicit mixed-mode test at `interactive-wizard.test.ts:263-307`:
- Input: `{ projectName: 'cli-name', runtime: 'bun', language: 'javascript', installDeps: true }`
- Expected: 4 prompts skipped (projectName, runtime, language, installDeps)
- Expected: 4 prompts shown (packageManager, linter, testFramework, preCommit)
- Verifies CLI values preserved and prompt values filled in

#### AC 6 — Non-TTY detection auto-falls back to non-interactive with message

**Status: SATISFIED**

- `isInteractive()` at `environment-detector.ts:37-39` checks `process.stdin.isTTY`
- `create-app.ts:123`: `const tty = isInteractive()`
- Line 126: `useInteractive = ... && tty && ...` — non-TTY forces non-interactive
- A message IS shown: the AI agent hint at lines 162-164, which covers non-TTY since `isAIAgent` returns true when `!tty`

#### AC 7 — AI agent detection shows non-interactive usage hint

**Status: SATISFIED**

- `isAIAgent()` at `environment-detector.ts:48-63` checks `CI`, `GITHUB_ACTIONS`, and TTY
- `create-app.ts:120`: `const aiAgent = isAIAgent()`
- Lines 162-164: When `!tty && aiAgent`, output `formatAIAgentHint()` with non-interactive usage instructions
- Tests at `environment-detector.test.ts:76-104` cover all AI detection scenarios (CI=true, CI=1, GITHUB_ACTIONS, non-TTY, interactive clean)
- Hint formatter tests added at `presentation-layer.test.ts:419-431`

#### AC 8 — Package manager detection from `npm_config_user_agent` with npm fallback

**Status: SATISFIED**

- `detectPackageManager()` at `environment-detector.ts:22-31` parses `npm_config_user_agent`
- Detection order: pnpm → yarn → bun → npm (fallback)
- Accepts optional `env` parameter for DI/testability
- When `env` is omitted, uses `process.env.npm_config_user_agent`
- Fallback `'npm'` returned when user agent is empty, undefined, or no recognized manager

**Tests:** `environment-detector.test.ts:18-53` — 7 test cases covering all detection paths and fallbacks.

### Test Coverage Assessment

| Test File | Tests | Coverage Assessment |
|-----------|-------|---------------------|
| `environment-detector.test.ts` | 16 | Good — all detection paths, DI, edge cases |
| `state-resolver.test.ts` | 12 | Good — all 10 field overrides, multiple overrides, immutability |
| `interactive-wizard.test.ts` | 15 | Good — prompt/skip behavior for all 8 fields, cancel, mixed mode, full resolution, default values for skipped prompts |
| `presentation-layer.test.ts` | ~19 new | Good — flag parsing (13 flags + defaults), `parsedArgsToScaffoldInput` behavior, end-to-end resolution, formatters, hint formatters |

Key improvement from previous cycle: `parsedArgsToScaffoldInput` tests at `presentation-layer.test.ts:149-246` now explicitly verify that empty string flags produce `undefined` (not defaults), which confirms the B1 fix. The integration tests at lines 248-303 verify end-to-end resolution through `resolveScaffoldState`.

### Build & Type Verification

```sh
bun test        → 173 pass, 0 fail, 346 expect() calls across 9 files ✓
bun run build   → Bundled 23 modules → dist/index.js (88.90 KB) ✓
```

No regressions. Pre-existing scaffold engine tests (111 tests) continue to pass. The 62 new tests cover all WU-02 functionality.
