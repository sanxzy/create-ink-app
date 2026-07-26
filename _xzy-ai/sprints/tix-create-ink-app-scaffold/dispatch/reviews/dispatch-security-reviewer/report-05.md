---
agent: dispatch-security-reviewer
work_unit_id: "05 — Post-Scaffold UX, Package Install, Cleanup & Polish"
report_number: 05
status: APPROVED
review_cycle: 1
timestamp: "2026-07-26T19:00:00Z"
artifacts:
  - src/presentation/install/package-installer.ts
  - src/presentation/commands/create-app.ts
  - src/presentation/formatters/output-formatter.ts
  - src/application/dtos/scaffold-input.ts
  - src/application/commands/scaffold-project.ts
  - src/application/commands/state-resolver.ts
  - src/domain/repositories/ports.ts
  - src/infrastructure/file-system/node-file-system.ts
  - src/shared/types/index.ts
  - src/tests/unit/post-scaffold-ux.test.ts
  - src/tests/unit/package-installer.test.ts
upstream_reports:
  - _xzy-ai/sprints/tix-create-ink-app-scaffold/dispatch/work-unit-spec-05.md
  - _xzy-ai/sprints/tix-create-ink-app-scaffold/dispatch/with-ui-worker/report-05.md
  - _xzy-ai/sprints/tix-create-ink-app-scaffold/dispatch/reviews/dispatch-security-reviewer/report-04.md
---

# Security Review Report — 05 — Post-Scaffold UX, Package Install, Cleanup & Polish

**Agent:** dispatch-security-reviewer
**Work Unit:** 05 — Post-Scaffold UX, Package Install, Cleanup & Polish
**Report Number:** 05
**Review Cycle:** 1
**Backlog:** tix-create-ink-app-scaffold
**Status:** APPROVED
**Timestamp:** 2026-07-26T19:00:00Z

## Verdict

**APPROVED** — No Blocker, Critical, or Major security issues found. Two Minor findings (M-01 unresolved from report-04) and one Trivial finding (T-01 unresolved from report-04) remain. One Minor finding (M-04) from report-04 has been resolved by this work unit. No new security vulnerabilities are introduced.

## Previous Review Findings Status (Report-04 → Report-05)

| ID | Severity (Previous) | Description | Status | Note |
|:--:|:-------------------:|-------------|:------:|------|
| M-01 | Minor | `targetDir` uses raw untrimmed `input.projectName` instead of validated `projectName.value` | ❌ **Unresolved** | `scaffold-project.ts:160` still uses raw input (now via new `targetDir` field) |
| M-02 | Minor | ESLint flat config missing `languageOptions` | ❌ Unresolved | Not in scope of WU-05 |
| M-03 | Minor | Husky/Lefthook don't respect `--pm` selection | ❌ Unresolved | Not in scope of WU-05 |
| M-04 | Minor | `formatScaffoldSuccess` always shows `npm` commands regardless of runtime | ✅ **RESOLVED** | `formatScaffoldSuccess` now accepts `ScaffoldOptions` with runtime-aware dev commands and package-manager-aware install commands |
| T-01 | Trivial | `execSync` calls omit explicit `shell: false` | ❌ Unresolved | `runtime-checker.ts` unchanged by WU-05 |

## Finding Summary

| Severity | Count | Action Required |
|----------|:-----:|-----------------|
| Blocker  | 0     | — |
| Critical | 0     | — |
| Major    | 0     | — |
| Minor    | 3     | Documented (2 pre-existing, 1 defense-in-depth) |
| Trivial  | 1     | Documented (pre-existing) |

## Verification Summary

### Technology Stack

TypeScript (ESM), Bun runtime, mri (CLI parsing), **execa v10** (package installation), **@clack/prompts** (spinner/outro), Vitest (testing), Biome (linting)

### Files Reviewed

| # | File | Lines | Role | Security Assessment |
|---|------|:-----:|------|:------------------:|
| 1 | `src/presentation/install/package-installer.ts` | 59 | Package install via execa | ✅ Safe — array syntax, typed PM union |
| 2 | `src/presentation/commands/create-app.ts` | 400 | CLI handler — signal handlers, overwrite, install | ✅ Safe — handlers properly torn down, overwrite logic correct |
| 3 | `src/presentation/formatters/output-formatter.ts` | 164 | Runtime-aware success messages | ✅ Resolves M-04 |
| 4 | `src/application/commands/scaffold-project.ts` | 275 | `isWritable` check, `targetDir` support | ⚠️ M-01 still unresolved |
| 5 | `src/domain/repositories/ports.ts` | 69 | `isWritable` on `FileSystemPort` | ✅ Clean interface |
| 6 | `src/infrastructure/file-system/node-file-system.ts` | 123 | `isWritable` implementation | ✅ Correct — `accessSync` with `W_OK`, parent fallback |
| 7 | `src/shared/types/index.ts` | 38 | `OverwriteMode` type, `PackageManager` union | ✅ Typed union prevents injection |
| 8 | `src/application/dtos/scaffold-input.ts` | 44 | `targetDir` field | ✅ Optional, clean DTO |
| 9 | `src/application/commands/state-resolver.ts` | 40 | State resolver | ✅ Untainted |
| 10 | `src/infrastructure/cli/runtime-checker.ts` | 58 | Runtime detection via `execSync` | ⚠️ T-01 still unresolved |
| 11 | `src/presentation/parsers/args-parser.ts` | 82 | CLI boundary — type assertions | ⚠️ Defense-in-depth gap (pre-existing) |
| 12 | `src/tests/unit/package-installer.test.ts` | 137 | Install test suite | ✅ Good coverage |
| 13 | `src/tests/unit/post-scaffold-ux.test.ts` | 146 | UX test suite | ✅ Good coverage |

### Security Domains Evaluated

| Domain | Coverage | Findings |
|--------|:--------:|:--------:|
| Command injection (execa) | Full code path audit — array vs shell syntax, typed PM union, cwd origin | 0 new |
| Signal handling | SIGINT/SIGTERM setup, cleanup, teardown on all paths | 0 new |
| Overwrite mode safety | 3-state logic (ask/yes/no) in interactive + non-interactive | 0 new |
| Directory writability | `isWritable` implementation, parent-fallback, error propagation | 0 new |
| Path traversal | `targetDir` → `scaffold-project.ts` → directory creation | M-01 (unresolved, Minor) |
| Input validation at CLI boundary | TypeScript `as` assertions without runtime validation | SEC-05 (Minor, defense-in-depth) |
| Secure configuration | Config generator output (pre-existing) | M-02, M-03 (unresolved, Minor) |
| Security logging / error handling | Error messages, exit codes, unclear error from invalid PM | 0 new |
| Dependencies | execa v10, @clack/prompts — no known CVEs | 0 new |
| Authorization/Authentication | N/A — CLI scaffold tool | N/A |
| Cryptography | N/A — no crypto in scope | N/A |

---

## Full Findings — Grouped by Severity

### BLOCKER (CVSS 7.0–10.0)

**No Blocker findings.**

---

### CRITICAL (CVSS 9.0–10.0)

**No Critical findings.**

---

### MAJOR (CVSS 4.0–6.9)

**No Major findings.**

---

### MINOR (CVSS 2.0–3.9)

---

#### M-01: Directory path uses raw untrimmed input instead of validated value (unresolved)

| Field | Value |
|-------|-------|
| **Finding ID** | M-01 |
| **Severity** | Minor |
| **Domain** | Secure coding, Input validation |
| **Location** | `src/application/commands/scaffold-project.ts` line 160 |
| **OWASP Reference** | [A04:2021 – Insecure Design](https://owasp.org/Top10/A04_2021-Insecure_Design/) |
| **CVSS Estimate** | 3.5 — AV:L/AC:L/PR:N/UI:R/S:U/C:N/I:L/A:N |

**Description:**

Line 160 uses the raw `input.projectName` (or `input.targetDir`) instead of the validated `projectName.value`:

```typescript
const projectName = nameResult.value;       // validated, trimmed
const targetDir = input.targetDir ?? input.projectName;  // raw, untrimmed
```

While `input.projectName` passes the `createProjectName` validator (so it is a syntactically valid name), the raw value may have leading/trailing whitespace that the validator trimmed in `projectName.value`. This means the directory created on disk could differ from the `package.json` name field, causing user confusion. Not exploitable for path traversal because `createProjectName` already restricts to `[a-z0-9-._~]`.

**Status:** Unresolved since report-04. Not addressed in WU-05.

**Recommendation:**

Change line 160 to:
```typescript
const targetDir = input.targetDir ?? projectName.value;
```

---

#### M-04 (RESOLVED): `formatScaffoldSuccess` now shows runtime-aware commands

| Field | Value |
|-------|-------|
| **Finding ID** | M-04 |
| **Severity** | Minor |
| **Domain** | Secure configuration |
| **Location** | `src/presentation/formatters/output-formatter.ts` lines 35–67 |
| **OWASP Reference** | N/A |
| **CVSS Estimate** | N/A |

**Description (resolved):**

Previously, `formatScaffoldSuccess` hardcoded `npm install` and `npm run dev` regardless of the selected runtime or package manager. This work unit introduced `ScaffoldOptions` (runtime + packageManager) and rewrote `formatScaffoldSuccess` to use `getRunCommand(runtime)` and `getInstallCommand(packageManager)` for runtime-aware next-step instructions.

**Verification:**

| Input | Output | Status |
|-------|--------|:------:|
| `runtime: 'node', pm: 'npm'` | Shows `npm install` + `npm run dev` | ✅ Correct |
| `runtime: 'bun', pm: 'bun'` | Shows `bun install` + `bun run dev` | ✅ Correct |
| `runtime: 'node', pm: 'pnpm'` | Shows `pnpm install` + `npm run dev` | ✅ Correct |
| `runtime: 'bun', pm: 'npm'` | Shows `npm install` + `bun run dev` | ✅ Correct |

**Recommendation:** None — resolved.

---

#### SEC-05: CLI boundary type assertions bypass runtime validation for string union types

| Field | Value |
|-------|-------|
| **Finding ID** | SEC-05 |
| **Severity** | Minor |
| **Domain** | Secure coding, Input validation, Defense-in-depth |
| **Location** | `src/presentation/parsers/args-parser.ts` lines 69–78 |
| **OWASP Reference** | [A04:2021 – Insecure Design](https://owasp.org/Top10/A04_2021-Insecure_Design/) |
| **CVSS Estimate** | 2.1 — AV:L/AC:H/PR:N/UI:R/S:U/C:N/I:N/A:L |

**Description:**

The `parsedArgsToScaffoldInput` function uses TypeScript type assertions to cast raw CLI string values into union types without runtime validation:

```typescript
runtime: (parsed.runtime as ScaffoldInput['runtime']) || DEFAULT_SCAFFOLD_INPUT.runtime,
packageManager: (parsed.packageManager as ScaffoldInput['packageManager']) || DEFAULT_SCAFFOLD_INPUT.packageManager,
```

A TypeScript `as` assertion is a compile-time only operation — it generates no runtime validation code. An arbitrary CLI string (e.g., `--pm "rm -rf /"`) passes through unchecked and reaches:

1. **`installDependencies`** in `package-installer.ts`: `execa(packageManager, ['install'], { cwd })` — execa treats the first argument as a binary name (array syntax), so the arbitrary string would fail with a "command not found" error. **No shell injection is possible** because execa's array form does not invoke a shell. The impact is limited to a confusing error message.

2. **`GeneratorContext`** in `config-generators.ts`: The `ctx.packageManager` value propagates to generated project config files, where an unexpected string could produce malformed output.

**Exploitability analysis:**
- execa's array syntax (`execa(packageManager, ['install'])`) prevents shell injection — the first argument is always treated as a binary name, not a shell command string
- The `PackageManager` union restriction (`'npm' | 'pnpm' | 'yarn' | 'bun'`) is only enforced at the TypeScript type level, not at runtime
- Even with an arbitrary string, the worst case is `ENOENT` (binary not found) leading to a clear error message via `installDependencies` error handler
- No path traversal, file read/write, or code execution vector exists through this path

**Recommendation:**

Add a runtime guard in `parsedArgsToScaffoldInput` to validate string union values against their allowed sets:

```typescript
const VALID_PACKAGE_MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'] as const;
const packageManager: string = parsed.packageManager;
if (packageManager && !(VALID_PACKAGE_MANAGERS as readonly string[]).includes(packageManager)) {
  // Fall through to default or throw
}
```

Alternatively, move the validation to `installDependencies` to fail early with a clear message.

---

### TRIVIAL (Informational / Defense-in-depth)

---

#### T-01: `execSync` calls omit explicit `shell: false` (unresolved)

| Field | Value |
|-------|-------|
| **Finding ID** | T-01 |
| **Severity** | Trivial |
| **Domain** | Secure coding, OS security |
| **Location** | `src/infrastructure/cli/runtime-checker.ts` lines 22–25 and 46–49 |
| **OWASP Reference** | N/A — defense-in-depth |
| **CVSS Estimate** | N/A |

**Description:**

Both `execSync` calls (`node --version` and `bun --version`) omit explicit `shell: false`. On Unix the default is `false`, so this is not exploitable. However, explicitly setting `shell: false` documents intent and provides defense-in-depth against shell injection if the command strings are ever modified in the future.

**Status:** Unresolved since report-04. Not addressed in WU-05.

**Recommendation:**

Add `shell: false` to both `execSync` options objects:
```typescript
const output = execSync('node --version', {
  encoding: 'utf-8',
  timeout: 5000,
  shell: false,
});
```

---

## Standards Coverage

| Standard | Reference | Status | Related Findings |
|----------|-----------|:------:|:----------------:|
| **OWASP Top 10 A01** | Broken Access Control | ✅ **COMPLIANT** — no traversal vulnerability introduced | None |
| **OWASP Top 10 A03** | Injection | ✅ **COMPLIANT** — execa array syntax prevents command injection; SEC-05 is defense-in-depth only | SEC-05 (Minor) |
| **OWASP Top 10 A04** | Insecure Design | ⚠️ Partial — raw input used for directory path (M-01) | M-01 |
| **OWASP Top 10 A05** | Security Misconfiguration | ⚠️ Partial — ESLint config (M-02), hook PM selection (M-03) | M-02, M-03 |
| **OWASP Top 10 A09** | Security Logging & Monitoring Failures | ✅ **COMPLIANT** — errors clearly reported to user | None |
| **OWASP ASVS V5.1** | Input Validation | ⚠️ Partial — CLI boundary lacks runtime validation for union types | SEC-05 |
| **OWASP ASVS V5.3** | Input Validation — allowlists | ✅ **COMPLIANT** — `getTemplateDir` allowlist validation restored in WU-04 | None |
| **OWASP ASVS V12.1** | File Path Security | ✅ **COMPLIANT** — `isWritable` prevents writing to non-writable directories | None |
| **OWASP ASVS V14.2** | Secure Configuration — Dependency Integrity | ✅ **COMPLIANT** — execa in array syntax, no shell invocation | None |
| **MITRE ATT&CK T1059** | Command and Scripting Interpreter | ✅ **NOT EXPLOITABLE** — execa array syntax prevents shell injection | SEC-05 (Minor, defense-in-depth) |
| **MITRE ATT&CK T1574** | Hijack Execution Flow | ✅ **LOW RISK** — `packageManager` typed union limits binary names | None |

## Risk Assessment

### Overall Risk Level: **LOW**

### Key Attack Vectors (WU-05 Specific)

| Attack Vector | Likelihood | Impact | Mitigation | Status |
|---------------|:----------:|:------:|------------|:------:|
| Command injection via execa `packageManager` argument | None | Critical — arbitrary command execution | execa array syntax treats first arg as binary name, not shell command; error handling catches ENOENT | ✅ Mitigated by architecture |
| Command injection via execa `cwd` argument | None | Moderate — directory traversal | `cwd` is `path.resolve(targetDir)` where `targetDir` is either `'.'` or validated project name | ✅ Mitigated by validation |
| Signal handler abuse (repeated SIGINT/SIGTERM) | Very Low | Low — unclean child process termination | `process.exit(0)` is idempotent; child processes share process group | ✅ Acceptable for CLI tool |
| Arbitrary string propagation through PM type assertion | Low | Very Low — confusing error message | execa array syntax prevents shell injection; `installDependencies` catches errors gracefully | ⚠️ SEC-05 (Minor) |

### WU-05 Specific Security Analysis

**1. execa-based install (command injection focus)**

The `installDependencies` function in `package-installer.ts` (line 44) uses:
```typescript
const result = await execa(packageManager, ['install'], { cwd });
```

This is the **safe array syntax** — execa does not invoke a shell. The `packageManager` value originates from the typed `PackageManager` union (`'npm' | 'pnpm' | 'yarn' | 'bun'`). While the CLI type assertion in `args-parser.ts` could pass an arbitrary string (SEC-05), execa treats it as a binary name only. There is no shell metacharacter interpretation, no pipe injection, no command chaining. The `['install']` subcommand is hardcoded. The `cwd` is `path.resolve(targetDir)` which resolves relative to CWD.

**2. Signal handling (SIGINT/SIGTERM)**

Signal handlers are registered at `create-app.ts:76-77` and removed on every return path. The `handler` calls `cleanup?.()` then `process.exit(0)`. The `removeHandlers()` function is called before every `gracefulExit()` — all 7 return paths have been verified. No handler leak.

**3. Overwrite mode safety**

Three-state overwrite resolution (`resolveOverwriteMode` at line 102) correctly maps `--overwrite` → `'yes'`, `--no-overwrite` → `'no'`, neither → `'ask'`. In interactive mode, `'ask'` prompts the user via `@clack/prompts.confirm()`. In non-interactive mode, `'ask'` behaves as `'no'` with a clear error. The `shouldHandleOverwrite` function correctly gates on directory existence.

**4. Directory writability**

`isWritable` in `node-file-system.ts` (line 97) uses `fs.accessSync(path, fs.constants.W_OK)` with a parent-directory fallback when the target path doesn't exist. This is the standard node.js pattern for writability checks. The check occurs before directory creation and file writing in `scaffold-project.ts` (line 163), and the `not_writable` error kind is handled by `formatScaffoldError`.

### Defense-in-Depth Layers

| Layer | Status | Note |
|-------|:------:|------|
| Type-level: `PackageManager` union type | ✅ Present | Restricted to `'npm' \| 'pnpm' \| 'yarn' \| 'bun'` |
| execa array syntax (no shell) | ✅ Present | `execa(cmd, args[])` prevents shell injection |
| CLI boundary: TypeScript type assertion | ⚠️ Gap | `as ScaffoldInput['packageManager']` — no runtime validation |
| Scoped error handling | ✅ Present | All execa errors caught with `try/catch`, returned as `Err` |
| exit code consistency | ✅ Present | Success → 0, failure → 1, signal/interrupt → 0 |
| Signal handler cleanup | ✅ Present | All 7 return paths call `removeHandlers()` |

## Fix Instructions

### REQUIRED — Blocker/Critical/Major (None)

**No blocker, critical, or major fixes required.** The work unit is approved.

### OPTIONAL — Minor/Trivial (Last Loop Rule)

The following findings remain from prior cycles or are newly identified in this cycle. Since they are Minor/Trivial, fixes can be delegated to the worker without another security review cycle.

**M-01 — Use validated projectName.value for targetDir (unresolved from report-04):**
`src/application/commands/scaffold-project.ts` line 160:
```typescript
// Change from:
const targetDir = input.targetDir ?? input.projectName;
// To:
const targetDir = input.targetDir ?? projectName.value;
```

**SEC-05 — Add runtime validation for type-asserted string unions:**
`src/presentation/parsers/args-parser.ts` lines 69–78:
Add a runtime guard for `packageManager` (and other union-typed string fields) to validate against the allowed values:
```typescript
const VALID_PMS = ['npm', 'pnpm', 'yarn', 'bun'] as const;
const rawPm: string = parsed.packageManager;
const packageManager = rawPm && (VALID_PMS as readonly string[]).includes(rawPm) ? rawPm : DEFAULT_SCAFFOLD_INPUT.packageManager;
```

**T-01 — Add `shell: false` to execSync (unresolved from report-04):**
`src/infrastructure/cli/runtime-checker.ts` lines 22–25 and 46–49:
Add `shell: false` to both `execSync` options objects.

**M-02 — Add languageOptions to ESLint config (unresolved from report-04):**
`src/application/services/config-generators.ts` lines 349–365.
Not in scope of WU-05 — address in a future work unit.

**M-03 — Respect `--pm` in hooks (unresolved from report-04):**
`src/application/services/config-generators.ts` lines 179 and 384.
Not in scope of WU-05 — address in a future work unit.

## What Was Done Well

1. **Safe execa usage**: The `installDependencies` function correctly uses `execa(packageManager, ['install'], { cwd })` array syntax with a hardcoded subcommand. No shell is invoked. This is the recommended secure pattern.

2. **Comprehensive signal handler cleanup**: All 7 return paths in `runCreateApp` properly remove signal handlers before exit. No handler is leaked.

3. **Three-state overwrite resolution**: Clean separation between CLI flag parsing (`resolveOverwriteMode`), existence check (`shouldHandleOverwrite`), and user prompting. Correct behavior in both interactive and non-interactive modes.

4. **Runtime-aware install instructions (M-04 resolved)**: `formatScaffoldSuccess` now correctly shows `bun run dev` / `bun install` for Bun scaffolds and `npm run dev` / `npm install` for Node scaffolds.

5. **Writability check with parent fallback**: `isWritable` correctly handles the case where the target directory doesn't exist yet by checking the parent directory.

6. **`targetDir` / `projectName` separation**: Clean architectural decision to separate the display name (`projectName`) from the directory path (`targetDir`), preventing `.` scaffolding from using `path.basename(cwd)` as the package name.

7. **Comprehensive test coverage**: 33 new tests (325 total) covering all package managers, signal handling, overwrite modes, and error conditions.

## Test Coverage Note

The `scaffold-project.test.ts` mocks `isWritable` to return `true` but has no test for the `not_writable` error path (when `isWritable` returns `false`). Consider adding a test case:

```typescript
it('should fail when directory is not writable', () => {
  deps.fs.isWritable = vi.fn(() => false);
  const result = scaffold(createValidInput());
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.error.kind).toBe('not_writable');
  }
});
```

This is a recommendation, not a requirement for approval.

## Last Loop Rule Checkbox

- [x] **Last Loop Rule triggered**: Yes — only Minor and Trivial findings remain; fixes can be delegated to the worker without another security review cycle.
- [ ] **Re-review required after fixes**: No — remaining issues are Minor (M-01, SEC-05, M-02, M-03) and Trivial (T-01).

---

## CANONICAL ARTIFACT — Full Output — Complete Security Review Findings

### Verdict

**APPROVED** — No Blocker, Critical, or Major findings. Previous M-04 resolved. Remaining: 3 Minor (M-01, SEC-05, plus M-02/M-03 pre-existing), 1 Trivial (T-01).

### Previous Review Findings Status

| ID | Prior Severity | Description | Status |
|:--:|:--------------:|-------------|:------:|
| M-01 | Minor | `targetDir` uses raw untrimmed `input.projectName` instead of validated `projectName.value` | ❌ Unresolved |
| M-02 | Minor | ESLint flat config missing `languageOptions` | ❌ Unresolved |
| M-03 | Minor | Husky/Lefthook don't respect `--pm` selection | ❌ Unresolved |
| M-04 | Minor | `formatScaffoldSuccess` always shows `npm` commands regardless of runtime | ✅ **RESOLVED** |
| T-01 | Trivial | `execSync` calls omit explicit `shell: false` | ❌ Unresolved |

### Complete Finding Inventory

#### M-01 (Minor) — Directory path uses raw input instead of validated value (unresolved)
- **File:** `src/application/commands/scaffold-project.ts:160`
- **Domain:** Secure coding, Input validation
- **OWASP:** A04:2021 (Insecure Design)
- **CVSS:** 3.5 (AV:L/AC:L/PR:N/UI:R/S:U/C:N/I:L/A:N)
- **Detail:** `const targetDir = input.targetDir ?? input.projectName` uses the raw unvalidated input. The validated `projectName.value` exists but is ignored. The directory on disk may differ from the package name if whitespace is present.
- **Fix:** Change to `const targetDir = input.targetDir ?? projectName.value`.

#### SEC-05 (Minor) — CLI boundary type assertions bypass runtime validation
- **File:** `src/presentation/parsers/args-parser.ts:69-78`
- **Domain:** Secure coding, Input validation, Defense-in-depth
- **OWASP:** A04:2021 (Insecure Design)
- **CVSS:** 2.1 (AV:L/AC:H/PR:N/UI:R/S:U/C:N/I:N/A:L)
- **Detail:** `as ScaffoldInput['packageManager']` type assertion does not validate at runtime. An arbitrary CLI string could propagate to execa as a binary name. No shell injection is possible due to execa array syntax, but the binary lookup would fail with a confusing error.
- **Fix:** Add runtime guard against allowed values: `['npm', 'pnpm', 'yarn', 'bun']`.

#### M-02 (Minor) — ESLint config missing languageOptions (unresolved)
- **File:** `src/application/services/config-generators.ts:349-365`
- **Domain:** Secure configuration
- **OWASP:** A05:2021 (Security Misconfiguration)
- **Detail:** Generated ESLint flat config omits `languageOptions` required by ESLint 9.x for ESM projects. Not in WU-05 scope.
- **Status:** Unresolved, pre-existing.

#### M-03 (Minor) — Husky/Lefthook hardcode runtime-based PM (unresolved)
- **File:** `src/application/services/config-generators.ts:179,384`
- **Domain:** Secure configuration
- **Detail:** Pre-commit hooks select PM based on runtime (`bun` or `npm`) instead of respecting the `--pm` flag. Not in WU-05 scope.
- **Status:** Unresolved, pre-existing.

#### T-01 (Trivial) — execSync calls omit explicit `shell: false` (unresolved)
- **File:** `src/infrastructure/cli/runtime-checker.ts:22-25,46-49`
- **Domain:** Secure coding, OS security
- **Detail:** Both `execSync` calls (`node --version` and `bun --version`) omit `shell: false`. Not exploitable on Unix (default is `false`).
- **Fix:** Add `shell: false` to both `execSync` options objects.

### Technology-Specific Security Analysis

#### execa v10 (Package Installation)

| Aspect | Assessment |
|--------|------------|
| API form used | `execa(command, args[], options)` — safe array syntax |
| Shell invocation | **None** — execa array form does not invoke a shell |
| `command` origin | Typed `PackageManager` union → CLI flags (type-asserted) |
| `args[]` origin | Hardcoded `['install']` — not user-controllable |
| `cwd` origin | `path.resolve(targetDir)` — normalized, project-validated path |
| Error handling | `try/catch` wraps the entire execa call → `Result<Err>` |
| Spinner lifecycle | `start()` before, `stop()`/`error()` after — always terminates |
| Worst-case injection | Binary not found → ENOENT → caught, displayed as clear error |
| **Verdict** | ✅ **Secure** — no shell injection vector exists |

#### Signal Handling (SIGINT/SIGTERM)

| Aspect | Assessment |
|--------|------------|
| Registration | `setupSignalHandlers()` at `create-app.ts:128` |
| Cleanup callback | Logs warning about partial output |
| Handler behavior | `cleanExit()` → `process.exit(0)` |
| Removal | `removeHandlers()` called on all 7 return paths ✅ |
| Handler leak | None verified — exhaustive path audit ✅ |
| Child process impact | Child processes share process group → receive same signal |
| **Verdict** | ✅ **Correct** — handlers properly managed |

#### Overwrite Mode Safety

| Mode | Interactive | Non-interactive | Behavior |
|:----:|:-----------:|:----------------:|----------|
| `yes` | Proceed | Proceed | Overwrites existing directory |
| `no` | Abort with error | Abort with error | Rejects with clear message |
| `ask` | Prompts user | Abort with error | Interactive prompts; non-interactive errors |
| **Verdict** | ✅ **Correct** — all modes handled safely |

#### Directory Writability (`isWritable`)

- **Primary check:** `fs.accessSync(dirPath, fs.constants.W_OK)` — standard POSIX writability check
- **Fallback:** `path.dirname(path.resolve(dirPath))` — checks parent when target doesn't exist
- **Integration:** Called in `scaffold-project.ts` after project name validation, before directory creation
- **Edge case:** `'.'` path resolves via `path.resolve('.')` → CWD → checked for write access
- **Verdict:** ✅ **Correct**

### Exploit Scenario Walkthroughs

#### Scenario 1: Attempted command injection via `--pm`
```
Input: create-ink-app my-app --pm "rm -rf /" --immediate
Flow:  CLI → parseArgs → parsedArgsToScaffoldInput → installDependencies
       → execa("rm -rf /", ["install"], { cwd })
Result: execa tries to execute a binary literally named "rm -rf /"
        → ENOENT (file not found) → catch block → spinner.error()
        → "Installation failed: Command not found"
Impact: ❌ No injection — binary name is not shell-interpreted
```

#### Scenario 2: Attempted path traversal via project name
```
Input: create-ink-app "../../../etc/passwd"
Flow:  CLI → parseArgs → resolveProjectTarget
       → scaffoldProject → createProjectName("../../../etc/passwd")
Result: ❌ Fails validation — "/" not in [a-z0-9-._~]
        → err({ kind: 'invalid_name' }) → error displayed, exit 1
Impact: ❌ No traversal — blocked by project name validation
```

#### Scenario 3: SIGINT during install (Ctrl+C)
```
Input: create-ink-app my-app --immediate
       User presses Ctrl+C during "npm install"
Flow:  SIGINT → handler → cleanup() logs warning → process.exit(0)
Result: Parent process exits 0, child (npm install) receives same signal
        → npm exits with interrupt → no orphan process
Impact: ✅ Clean termination — partial node_modules may exist,
        user can delete and re-run
```

### Archive

**Previous review cycles:** 0 (first review cycle for WU-05). Prior findings from report-04 are referenced and tracked for resolution status.
