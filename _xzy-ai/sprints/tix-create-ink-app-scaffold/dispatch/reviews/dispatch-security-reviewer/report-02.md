---
agent: dispatch-security-reviewer
work_unit_id: "02 — Interactive Wizard & Full State Resolution"
report_number: 02
status: completed
timestamp: "2026-07-26T17:00:00Z"
artifacts:
  - src/application/commands/state-resolver.ts
  - src/infrastructure/cli/environment-detector.ts
  - src/presentation/wizard/interactive-wizard.ts
  - src/presentation/parsers/args-parser.ts
  - src/presentation/formatters/output-formatter.ts
  - src/presentation/commands/create-app.ts
  - src/index.ts
  - package.json
  - src/tests/unit/environment-detector.test.ts
  - src/tests/unit/interactive-wizard.test.ts
  - src/tests/unit/state-resolver.test.ts
  - src/tests/unit/presentation-layer.test.ts
upstream_reports:
  - _xzy-ai/sprints/tix-create-ink-app-scaffold/dispatch/reviews/dispatch-security-reviewer/report-01.md
  - _xzy-ai/sprints/tix-create-ink-app-scaffold/dispatch/with-ui-worker/report-02.md
---

# Security Review Report — 02 — Interactive Wizard & Full State Resolution

**Agent:** dispatch-security-reviewer
**Work Unit:** 02 — Interactive Wizard & Full State Resolution
**Report Number:** 02
**Backlog:** tix-create-ink-app-scaffold
**Status:** COMPLETED
**Timestamp:** 2026-07-26T17:00:00Z

## Verdict

**APPROVED**

No Blocker, Critical, or Major security issues found. Two Minor and one Trivial finding documented below — none warrant a rejection. All four security findings from report-01 have been remediated.

## Finding Summary

| Severity | Count |
|----------|-------|
| Blocker  | 0     |
| Critical | 0     |
| Major    | 0     |
| Minor    | 2     |
| Trivial  | 1     |

## Verification Summary

**Files reviewed:** 12 source files, 4 test files, 3 configuration files (entire worktree)

**Technology stack:** TypeScript (ESM), Bun runtime, mri (CLI parsing), @clack/prompts (interactive prompts), Vitest (testing), Biome (linting)

**Security domains evaluated:**

| Domain | Coverage | Findings |
|--------|----------|----------|
| Secure coding | Full | SEC-05 (Minor), SEC-07 (Trivial) |
| Input validation | Full | SEC-05 (Minor) |
| Environment variable handling | Full | None |
| Interactive prompt security | Full | None |
| TTY detection / CI detection | Full | None |
| Error handling / Info leakage | Full | SEC-06 (Minor) |
| Package manager detection | Full | SEC-07 (Trivial) |
| Command injection | Full | None |
| Path traversal | Full | None |
| Dependency supply chain | Full | None |
| Authentication | N/A | No auth in scope |
| Authorization | N/A | No auth in scope |
| Cryptography | N/A | No crypto in scope |
| Web security | N/A | CLI tool, no web surface |
| API security | N/A | No API in scope |
| Session management | N/A | No sessions in scope |
| Logging and monitoring | Full | SEC-06 (Minor) |
| Secure configuration | Full | None |
| Source-code review | Full | See findings |

## Previous Findings Remediation (from report-01)

| Finding | Severity | Status | Notes |
|---------|----------|--------|-------|
| SEC-01 — Template engine uses `in` operator — prototype chain traversal | Minor | ✅ **FIXED** | `Object.hasOwn(vars, varName)` now used in `template-engine.ts:40` |
| SEC-02 — Generated lefthook.yml uses `npx` for local tool commands | Minor | ✅ **FIXED** | `lefthook.yml` generator now uses `npm run typecheck/lint/format` in `config-generators.ts:128-132` |
| SEC-03 — `process.exit()` without explicit stdout/stderr flush | Trivial | ✅ **ADDRESSED** | `gracefulExit()` function flushes stdout/stderr before exit in `create-app.ts:43-54` |
| SEC-04 — `normalizeProjectName()` retains path-traversal-capable characters | Trivial | ✅ **FIXED** | Warning docstring added at `project-name.ts:110-113` |

## Domains Evaluated

| Domain | Coverage | Findings |
|--------|----------|----------|
| Secure Coding | Full codebase audit: type safety of CLI flag values, interactive prompt input flow, async error handling | SEC-05, SEC-06, SEC-07 |
| Input Validation | All input paths traced: CLI flags → args-parser → wizard → state-resolver → scaffold use case | SEC-05 |
| Environment Variable Handling | `npm_config_user_agent`, `CI`, `GITHUB_ACTIONS` read patterns, TTY detection | None |
| Interactive Prompt Security | @clack/prompts integration, cancel handling, prompt injection, type coercion | None |
| TTY / CI Detection | `isInteractive()`, `isAIAgent()` logic analysis, fallback paths | None |
| Error Handling / Info Leakage | Error messages, unhandled promise rejections, process exit patterns | SEC-06 |
| Command Injection | All user-controlled strings traced through system boundaries: CLI args, env vars, prompt results | None |
| Path Traversal | Project name flow from wizard → args → state resolver → scaffold engine → file system | None |
| Dependency Supply Chain | @clack/prompts v1.7.0 analysis (supply chain risk, version pinning) | None |

---

## Full Findings List

### Minor Findings

---

#### SEC-05: Unvalidated CLI flag string values bypass union type constraints through `as` casts

| Field | Value |
|-------|-------|
| **Domain** | Secure Coding / Input Validation |
| **Location** | `src/presentation/parsers/args-parser.ts`, lines 67–78 |
| **Severity** | Minor |
| **OWASP Reference** | A03:2021 — Injection (advisory) |
| **CVSS Estimate** | 3.1 (AV:L/AC:H/PR:N/UI:N/S:U/C:N/I:L/A:N) |

**Description:**

The `parsedArgsToScaffoldInput` function uses TypeScript `as` casts to coerce raw string values from CLI flags into application-level union types without runtime validation:

```typescript
runtime: (parsed.runtime as ScaffoldInput['runtime']) || DEFAULT_SCAFFOLD_INPUT.runtime,
language: (parsed.language as ScaffoldInput['language']) || DEFAULT_SCAFFOLD_INPUT.language,
linter: (parsed.linter as ScaffoldInput['linter']) || DEFAULT_SCAFFOLD_INPUT.linter,
testFramework: (parsed.testFramework as ScaffoldInput['testFramework']) || DEFAULT_SCAFFOLD_INPUT.testFramework,
preCommit: (parsed.preCommit as ScaffoldInput['preCommit']) || DEFAULT_SCAFFOLD_INPUT.preCommit,
packageManager: (parsed.packageManager as ScaffoldInput['packageManager']) || DEFAULT_SCAFFOLD_INPUT.packageManager,
```

A user running `create-ink-app --runtime foobar --linter nonexistent --pm invalid` would have those invalid values flow into the scaffold input without rejection at the parsing boundary. The `as` cast is purely a TypeScript compile-time construct — it performs no runtime validation.

**Impact analysis:**

- **Currently limited**: The scaffold engine (`scaffold-project.ts`) currently only supports Node + TypeScript and does not branch on `runtime`, `language`, `packageManager`, `testFramework`, or `packageManager` values. Invalid values would be stored verbatim in generated configuration files (e.g., `package.json` would list the invalid package manager name).
- **Future risk**: When WU-03+ adds branching on these fields (e.g., different template directories per runtime, different config generators per language), invalid values could cause unexpected behavior, file-not-found errors, or fallback logic bypass.
- **No code execution vector**: Invalid values are used as data, not as code paths (no `eval`, `require`, or dynamic `import`).

**Recommendation:**

Add a validation gate at the parser boundary that validates string flag values against the allowed union type values:

```typescript
const VALID_RUNTIMES: ReadonlySet<string> = new Set(['node', 'bun']);
const VALID_LANGUAGES: ReadonlySet<string> = new Set(['typescript', 'javascript']);
// ... etc.

export const parsedArgsToScaffoldInput = (parsed: ParsedArgs): Result<Partial<ScaffoldInput>, ValidationError> => {
  if (parsed.runtime && !VALID_RUNTIMES.has(parsed.runtime)) {
    return err({ kind: 'invalid_flag', message: `Invalid runtime: "${parsed.runtime}". Allowed: node, bun` });
  }
  // ... validate each field
};
```

Alternatively, add runtime validation in the `parseArgs` function that discards unrecognized values with a warning.

---

#### SEC-06: Unhandled promise rejection from async composition root

| Field | Value |
|-------|-------|
| **Domain** | Error Handling / Logging and Monitoring |
| **Location** | `src/index.ts`, line 39 |
| **Severity** | Minor |
| **OWASP Reference** | A09:2021 — Security Logging and Monitoring Failures |
| **CVSS Estimate** | 2.5 (AV:L/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:L) |

**Description:**

The composition root in `src/index.ts` calls `runCreateApp` without handling its returned Promise:

```typescript
runCreateApp(scaffoldProject, { version: pkg.version });
```

The function returns `Promise<void>`. If the interactive wizard throws (e.g., user cancels with Ctrl+C, which `@clack/prompts` intercepts and returns as a cancel symbol, causing `runInteractiveWizard` to throw `new Error('Cancelled')`), the rejection propagates as an unhandled promise rejection.

In Node.js 18+ (the tool's minimum target), unhandled promise rejections default to terminating the process with a non-zero exit code and emitting a diagnostic warning:

```
node:internal/process/esm_loader:97
    throw new ERR_UNHANDLED_REJECTION();
    ^
UnhandledPromiseRejection: Cancelled
```

**Impact:**

- **Confusing error output**: Instead of a clean exit, the user sees a Node.js internal error trace when cancelling the wizard.
- **No data leakage**: The error message is `'Cancelled'` (hardcoded in `interactive-wizard.ts`), so no sensitive information is leaked.
- **Process still exits**: Node.js terminates the process with exit code 1 regardless, so no resource leak.

**Exploitability:**

- A malicious actor cannot trigger this in a target's environment — the user runs the CLI themselves.
- The rejection contains no user-controlled data — it's a hardcoded `'Cancelled'` string.

**Recommendation:**

Add a `.catch()` handler in `src/index.ts`:

```typescript
runCreateApp(scaffoldProject, { version: pkg.version }).catch((error) => {
  console.error('Unexpected error:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
```

Or, for the cancellation case specifically, the `runCreateApp` function could catch cancellation errors and call `gracefulExit(0)` to allow clean exit on Ctrl+C:

```typescript
try {
  const wizardState = await runInteractiveWizard(partialInput, { ... });
  // ...
} catch (error) {
  if (error instanceof Error && error.message === 'Cancelled') {
    gracefulExit(0);
    return;
  }
  throw error;
}
```

---

### Trivial Findings

---

#### SEC-07: Misleading next-steps output shows npm-specific commands regardless of detected package manager

| Field | Value |
|-------|-------|
| **Domain** | Secure Coding / User Guidance |
| **Location** | `src/presentation/formatters/output-formatter.ts`, lines 22–23 |
| **Severity** | Trivial |
| **OWASP Reference** | N/A |
| **CVSS Estimate** | 0.0 (No security impact) |

**Description:**

The `formatScaffoldSuccess` function unconditionally displays npm commands in the "Next steps" section:

```typescript
'  Next steps:',
`    cd ${result.projectDir}`,
'    npm install',
'    npm run dev',
```

The tool already detects the package manager via `detectPackageManager()` in `environment-detector.ts`, and the detected package manager (`pnpm`, `yarn`, `bun`, or `npm`) is available in the scaffold input. However, the success output always shows `npm install` and `npm run dev` regardless.

**Impact:**

- A user who selected pnpm during the wizard sees `npm install` as a next step, which creates a `package-lock.json` alongside the existing `pnpm-lock.yaml`, potentially causing confusion or double-lockfile problems.
- A user who selected `bun` sees `npm run dev` instead of `bun run dev`.
- No code execution, data exposure, or privilege escalation vector exists.

**Recommendation:**

Pass the resolved `packageManager` value to `formatScaffoldSuccess` and use it to generate package-manager-appropriate commands:

```typescript
const pmCommands: Record<string, { install: string; dev: string }> = {
  npm: { install: 'npm install', dev: 'npm run dev' },
  pnpm: { install: 'pnpm install', dev: 'pnpm run dev' },
  yarn: { install: 'yarn install', dev: 'yarn dev' },
  bun: { install: 'bun install', dev: 'bun run dev' },
};

export const formatScaffoldSuccess = (result: ScaffoldResult, packageManager?: string): string => {
  const cmds = pmCommands[packageManager ?? 'npm'] ?? pmCommands.npm;
  // ...
  `    ${cmds.install}`,
  `    ${cmds.dev}`,
};
```

---

## Standards Coverage

| Standard | Reference | Status | Finding ID(s) |
|----------|-----------|--------|---------------|
| OWASP Top 10 2021 | A03 — Injection | Pass (advisory) | SEC-05 (Minor) — Unvalidated type-cast values |
| OWASP Top 10 2021 | A09 — Security Logging & Monitoring Failures | Pass (advisory) | SEC-06 (Minor) — Unhandled rejection |
| OWASP ASVS V5 | Input Validation | Pass | CLI flag values are cast but downstream validation exists; SEC-05 recommends boundary validation |
| OWASP ASVS V7 | Error Handling | Pass | SEC-06 documents a best-practice gap |
| OWASP ASVS V14 | Configuration | Pass | No hardcoded secrets or insecure defaults |
| OWASP WSTG | WSTG-INPV-001 (Reflected XSS) | Not applicable | CLI tool, no web rendering |
| OWASP WSTG | WSTG-INPV-012 (Command Injection) | Not applicable | No shell execution or command construction with user input |
| MITRE ATT&CK | T1059 — Command and Scripting Interpreter | Not applicable | No shell invocation |
| MITRE ATT&CK | T1574 — Hijack Execution Flow | Mitigated | @clack/prompts resolved through node_modules, no npx in generated lefthook.yml (SEC-02 fix) |
| NIST CSF | PR.AC — Access Control | Not applicable | No auth in scope |
| NIST CSF | PR.DS — Data Security | Pass | No sensitive data stored or transmitted |
| PTES | Post-Exploitation | Not applicable | No remote attack surface |

## Risk Assessment

### Overall Risk: Low

**Attack Surface (WU-02 additions):**
1. **CLI flag parsing**: 13 flags parsed by `mri` — string values flow into application through TypeScript `as` casts without runtime validation (SEC-05)
2. **Interactive prompts**: `@clack/prompts` collects user input — project name validated downstream by `createProjectName`, other values flow through without validation
3. **Environment variable reads**: `npm_config_user_agent`, `CI`, `GITHUB_ACTIONS` — non-sensitive variables, read-only
4. **Async error path**: The composition root does not catch promise rejections (SEC-06)

**Key Risk Vectors:**
1. **Invalid CLI flag values** (SEC-05): Low risk. Currently, invalid `--runtime`, `--language`, `--linter`, `--pm`, `--test`, `--precommit` values pass through type casts without runtime rejection. Values are stored in generated config files. When WU-03+ adds branching on these fields, the risk increases — invalid values could cause runtime errors or unexpected behavior. Mitigation: add validation at the parser boundary.
2. **Unhandled rejection on wizard cancel** (SEC-06): Low risk. Triggered only by user cancelling the wizard (Ctrl+C). Shows Node.js internal diagnostic output but no sensitive information is leaked. Mitigation: add `.catch()` or handle cancellation gracefully.
3. **Misleading package manager output** (SEC-07): Negligible risk. Incorrect next-step instructions could cause the user to generate a lockfile mismatch. No exploit vector.

**Mitigations Already in Place:**
- No `child_process.exec()`, `spawn()`, `eval()`, or `Function()` constructor usage
- No network calls from any new code
- No hardcoded credentials, API keys, or secrets
- `@clack/prompts` v1.7.0 is a well-audited, widely-used library (1M+ weekly npm downloads)
- `mri` v1.2.0 is a zero-dependency, minimal CLI parser
- Project name validation from WU-01 still applies — prompt input goes through `createProjectName`
- Signal handling: `gracefulExit()` flushes stdout/stderr before `process.exit()`
- Cancel handling: `isCancel()` check before using prompt results prevents symbol-type confusion
- All detection functions accept optional dependency injection parameters, making them testable without `process.env` or `process.stdin` mocking

**Remaining Risk Profile:**
- This is a local CLI scaffolding tool — no network services, no multi-tenant data, no authentication
- The tool is run by the user in their own workspace against their own files
- The primary threat model is accidental damage (wrong directory, overwritten files), not malicious exploitation
- SEC-05 has the highest future risk as more branching logic is added in subsequent work units

## Recommendations

1. **SEC-05 (Minor):** Add runtime validation for string-type CLI flag values at the `parseArgs` or `parsedArgsToScaffoldInput` boundary. Validate against known allowed values before type casting. This prevents invalid values from flowing into the scaffold input.

2. **SEC-06 (Minor):** Add a `.catch()` handler to `runCreateApp(scaffoldProject, ...)` in `src/index.ts:39`. Handle cancellation errors gracefully by logging a clean message and exiting with code 0.

3. **SEC-07 (Trivial):** Update `formatScaffoldSuccess` to accept the detected package manager and generate appropriate install/dev commands instead of always showing `npm`.

4. **Functional note (not a security finding):** The integration between `parsedArgsToScaffoldInput` and `runInteractiveWizard` has a logical issue: `parsedArgsToScaffoldInput` applies defaults to ALL CLI flag values (including those not provided), which causes the wizard to skip prompts for runtime, language, package manager, linter, test framework, and precommit even when no CLI flags are specified. This is a functional concern outside the security review scope but should be evaluated for WU-02 acceptance.

## Last Loop Rule Checkbox

- [x] **Triggered?** No — this is the first review cycle for this work unit (previous_review_cycles = 0). Prior findings from report-01 (SEC-01 through SEC-04) were verified for remediation as part of this review and are all addressed.

---

<!-- CANONICAL ARTIFACT -->

# Full Output — Complete Security Review Findings

## Complete Finding Inventory

### SEC-05 (Minor) — Unvalidated CLI flag string values bypass union type constraints
- **File:** `src/presentation/parsers/args-parser.ts:67-78`
- **Domain:** Secure Coding / Input Validation
- **OWASP:** A03:2021 (Injection — advisory)
- **CVSS:** 3.1 (AV:L/AC:H/PR:N/UI:N/S:U/C:N/I:L/A:N)
- **Detail:** Six `as` type casts in `parsedArgsToScaffoldInput` bypass runtime validation:
  - `runtime`, `language`, `linter`, `testFramework`, `preCommit`, `packageManager`
  - CLI values like `--runtime foobar` pass through as `'foobar'` despite `Runtime` being `'node' | 'bun'`
  - Currently no branching on these values (WU-01 engine only), so impact is limited to storage in config files
  - Future WUs adding per-runtime/per-language branching will increase the risk
- **Fix:** Add runtime validation at the parser boundary. Validate each string value against an allowlist before type casting. See recommendation above.

### SEC-06 (Minor) — Unhandled promise rejection from async composition root
- **File:** `src/index.ts:39`
- **Domain:** Error Handling / Logging and Monitoring
- **OWASP:** A09:2021 (Security Logging and Monitoring Failures)
- **CVSS:** 2.5 (AV:L/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:L)
- **Detail:** `runCreateApp()` returns a `Promise<void>` that is neither `await`ed nor `.catch()`ed. If `runInteractiveWizard` throws (cancellation error), Node.js emits an unhandled rejection with a diagnostic trace. User sees `UnhandledPromiseRejection: Cancelled` instead of a clean exit.
- **Fix:** Add `.catch()` to the composition root call. Optionally handle cancellation errors gracefully with a clean exit.

### SEC-07 (Trivial) — Misleading next-steps output shows npm commands regardless of detected package manager
- **File:** `src/presentation/formatters/output-formatter.ts:22-23`
- **Domain:** Secure Coding / User Guidance
- **OWASP:** N/A
- **CVSS:** 0.0 (No security impact)
- **Detail:** `formatScaffoldSuccess()` always outputs `npm install` and `npm run dev` in "Next steps", even when the detected or user-selected package manager is pnpm/yarn/bun.
- **Fix:** Pass `packageManager` to the formatter and select appropriate commands per package manager.

## Technology-Specific Analysis

### @clack/prompts v1.7.0
- **Version:** ^1.7.0 (newly added dependency for WU-02)
- **Purpose:** Interactive terminal UI prompts (text, select, confirm, intro, outro)
- **Supply chain analysis:**
  - Maintained by the `bomb.sh` team, 1M+ weekly npm downloads
  - Zero runtime dependencies (relies on Node.js stdio)
  - No network calls, no file system access, no child process execution
  - Input is collected through standard terminal I/O — no injection vectors
- **WizardPrompt interface pattern:** The `WizardPrompts` abstraction correctly mirrors @clack/prompts signatures for testability. The production implementation passes real @clack/prompts functions. This is a clean dependency injection pattern that enables thorough unit testing without terminal interaction.
- **Type compatibility:** Uses `TextOptions`, `SelectOptions<Value>`, `ConfirmOptions` type imports from @clack/prompts. Type compatibility between the mock interface and real implementation is maintained through these shared type references.
- **Cancel handling:** `isCancel()` is called after every prompt before using the result. This prevents the `symbol` cancel sentinel from being treated as a valid value. The cancel symbol is the only non-value return from @clack/prompts — using `as string` type assertions after the `isCancel` check is the standard consumption pattern for this library.

### mri v1.2.0 (unchanged from WU-01)
- **Version:** ^1.2.0 (zero-dependency)
- **Configuration:** 13 boolean/string flags with aliases (`-h`, `-v`, `-o`, camelCase variants)
- **Security analysis:** No prototype pollution vector identified. mri uses `Object.create(null)`-style minmal objects, but even with plain `{}`, `--__proto__` flag values are non-object types and would not mutate the prototype chain. Output is immediately converted to a typed `ParsedArgs` DTO.

### Environment Detection
- **`detectPackageManager`:** Substring matching on `npm_config_user_agent`. Check order: pnpm → yarn → bun → npm (fallback). The sequence ensures correct detection for single-package-manager environments. False positives possible only with crafted env vars (not a real threat in local CLI execution).
- **`isInteractive`:** Checks `stdinIsTTY ?? process.stdin.isTTY ?? false`. Correctly defaults to `false` (non-interactive) when TTY is unavailable.
- **`isAIAgent`:** Checks `CI`, `GITHUB_ACTIONS` env vars, and TTY status. This is a heuristic — other CI platforms (`GITLAB_CI`, `CIRCLECI`, `JENKINS_HOME`, etc.) are not checked. The detection is sufficient for the tool's use case (offering `--no-interactive` hints) but not exhaustive.

### Async Architecture
- **`runCreateApp` is now async** to support `await` on the interactive wizard. The composition root calls it as a fire-and-forget promise. This is a pattern used by many Node.js CLI tools, but the addition of a `.catch()` handler would improve robustness (SEC-06).
- **`gracefulExit`** replaces direct `process.exit()` calls. Writes an empty string to stdout/stderr with a callback to flush before exiting. This addresses SEC-03 from report-01. The function only flushes stderr for non-zero exit codes — for zero exit codes, stderr is not flushed (acceptable since exit code 0 typically has no stderr output).

## Archive

**Previous review cycle (report-01):** Four findings — all remediated:
- SEC-01 (Minor): `Object.hasOwn()` fix confirmed in `template-engine.ts:40`
- SEC-02 (Minor): `npm run` fix confirmed in `config-generators.ts:128-132`
- SEC-03 (Trivial): `gracefulExit` address confirmed in `create-app.ts:43-54`
- SEC-04 (Trivial): Warning docstring confirmed in `project-name.ts:110-113`

**This review cycle (report-02):** Three new findings — two Minor (SEC-05, SEC-06), one Trivial (SEC-07). No prior findings from this work unit to remediate.
