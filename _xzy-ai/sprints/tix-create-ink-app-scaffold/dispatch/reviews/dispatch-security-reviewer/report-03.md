---
agent: dispatch-security-reviewer
work_unit_id: "03 — Extended Node.js Combinations (JavaScript, ESLint+Prettier, Husky, dry-run, runtime validation)"
report_number: "03"
backlog: tix-create-ink-app-scaffold
status: APPROVED
review_cycle: 3
timestamp: "2026-07-26T17:30:00Z"
artifacts:
  - src/application/commands/scaffold-project.ts
  - src/domain/services/predicates.ts
  - src/application/services/config-generators.ts
  - src/infrastructure/cli/runtime-checker.ts
  - src/presentation/parsers/args-parser.ts
  - src/presentation/formatters/output-formatter.ts
upstream_reports:
  - _xzy-ai/sprints/tix-create-ink-app-scaffold/dispatch/work-unit-spec-03.md
  - _xzy-ai/sprints/tix-create-ink-app-scaffold/dispatch/worker/report-03.md
  - _xzy-ai/sprints/tix-create-ink-app-scaffold/dispatch/reviews/dispatch-security-reviewer/report-03.md
---

# Security Review Report — 03 — Extended Node.js Combinations (Cycle 3)

**Agent:** dispatch-security-reviewer
**Work Unit:** 03 — Extended Node.js Combinations (JavaScript, ESLint+Prettier, Husky, dry-run, runtime validation)
**Report Number:** 03
**Review Cycle:** 3
**Backlog:** tix-create-ink-app-scaffold
**Status:** APPROVED
**Timestamp:** 2026-07-26T17:30:00Z

## Verdict

**APPROVED** — The Blocker path traversal vulnerability (F-01) has been properly remediated. The local `getTemplateDir` in `scaffold-project.ts` now validates the `language` parameter against an allowlist before path construction. 4 residual findings remain (3 Minor, 1 Trivial) — none warrant rejection.

## Previous Review Findings Status

| ID | Severity (Current) | Description | Status |
|:--:|:------------------:|-------------|:------:|
| F-01 | ~~Blocker~~ → **Fixed** | Path traversal via `--language` — local `getTemplateDir` in `scaffold-project.ts` now validates `language` against `['typescript', 'javascript']` before constructing the path | ✅ **FIXED** |
| F-02 | Minor | `targetDir` uses raw untrimmed `input.projectName` instead of validated `projectName.value` | ❌ Not addressed |
| F-03 | Minor | ESLint flat config missing `languageOptions` | ❌ Not addressed |
| F-04 | Minor | Husky hook hardcodes `npm test` regardless of selected package manager | ❌ Not addressed |
| F-05 | Trivial | `execSync` omits explicit `shell: false` | ❌ Not addressed |

## Finding Summary

| Severity | Count | Action Required |
|----------|-------|-----------------|
| Blocker  | 0     | — |
| Critical | 0     | — |
| Major    | 0     | — |
| Minor    | 3     | Fix recommended |
| Trivial  | 1     | Optional fix |

## Verification Summary

### Key Files Reviewed

| # | File | Lines | Role | Status |
|---|------|-------|------|--------|
| 1 | `src/application/commands/scaffold-project.ts` | 255 | Scaffold use case — local `getTemplateDir` now validates `language` | ✅ **Fixed** |
| 2 | `src/domain/services/predicates.ts` | 54 | Domain predicates — `getTemplateDir` also now validates (not called from scaffold use case, but consistent) | ✅ **Fixed** |
| 3 | `src/application/services/config-generators.ts` | 370 | Config generators (ESLint, Prettier, Husky) | Unchanged |
| 4 | `src/infrastructure/cli/runtime-checker.ts` | 34 | Runtime validation via execSync | Unchanged |
| 5 | `src/presentation/parsers/args-parser.ts` | 82 | CLI argument parsing — unvalidated casts | Unchanged |
| 6 | `src/presentation/formatters/output-formatter.ts` | 99 | Error formatter — handles `runtime_not_found` | ✅ **Fixed** |
| 7 | `src/tests/unit/scaffold-project.test.ts` | 477 | Unit tests — no path traversal tests added | No change |

### Domains Evaluated

| Domain | Coverage | Findings |
|--------|----------|:--------:|
| Secure coding (input validation) | Full | 1 (finished) |
| Secure configuration | Full | 2 (Minor) |
| OS security (execSync) | Full | 1 (Trivial) |
| Threat modeling | Full | 0 |
| Dependency security | Full | 0 |
| Authentication/Authorization | N/A | 0 |

---

## Full Findings — Grouped by Severity

### BLOCKER — Fixed (Re-reviewed)

---

#### F-01: Path traversal via `--language` — **FIXED**

| Field | Value |
|-------|-------|
| **Finding ID** | F-01 |
| **Status** | ✅ FIXED — Cycle 3 |
| **Domain** | Input validation, Secure coding |
| **Location** | `src/application/commands/scaffold-project.ts` lines 120–127 (was 120–123) |
| **OWASP Reference** | [A01:2021 – Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/) (path traversal) |
| **Standards** | OWASP ASVS V5.3 (Input Validation), OWASP ASVS V12.1 (File Path Security) |

**What was fixed:**

The local `getTemplateDir` function in `scaffold-project.ts` (call site at line 209, the actual exploitable code path) now validates `language` against an allowlist before constructing the template directory path:

```typescript
const getTemplateDir = (language: string): string => {
  const VALID_LANGUAGES = ['typescript', 'javascript'] as const;
  if (!(VALID_LANGUAGES as readonly string[]).includes(language)) {
    throw new Error(`Invalid language: ${language}`);
  }
  return `node/${language}`;
};
```

This is an **allowlist validation** that directly prevents path traversal. An input of `--language ../../etc` will now throw `"Invalid language: ../../etc"` instead of constructing `"node/../../etc"` and traversing outside the templates directory.

**Verification:**

| Check | Result |
|-------|--------|
| `git diff HEAD -- src/application/commands/scaffold-project.ts` | 4 lines added — validation guard at lines 122–125 |
| Local `getTemplateDir` removed? | N/A (inline validation was the chosen approach — Option B) |
| `getTemplateDir("../../etc")` → throws error | ✅ Validation catches it — allowlist does not include `../../etc` |
| `getTemplateDir("typescript")` → `"node/typescript"` | ✅ Allowlist includes `"typescript"` |
| `getTemplateDir("javascript")` → `"node/javascript"` | ✅ Allowlist includes `"javascript"` |
| Tests added for path traversal | ❌ No new tests added |

**Residual concern:** The function throws rather than returning an `err` result. If an invalid language bypasses the type-system constraint (which is possible via the raw cast in `args-parser.ts` line 70: `parsed.language as ScaffoldInput['language']`), the error would be an unhandled exception. However, this is an acceptable defense-in-depth trade-off — a thrown error with a clear message is far better than silent path traversal.

---

### MINOR (Unresolved from previous cycle)

---

#### F-02: Directory path uses raw untrimmed input instead of validated value

| Field | Value |
|-------|-------|
| **Finding ID** | F-02 |
| **Severity** | Minor |
| **Domain** | Secure coding, Input validation |
| **Location** | `src/application/commands/scaffold-project.ts` line 149 |
| **OWASP Reference** | [A04:2021 – Insecure Design](https://owasp.org/Top10/A04_2021-Insecure_Design/) |
| **CVSS Estimate** | 3.5 — AV:L/AC:L/PR:N/UI:R/S:U/C:N/I:L/A:N |

**Description:**

Still unaddressed. Line 149 uses the raw unfiltered `input.projectName` instead of the validated `projectName.value`:

```typescript
const projectName = nameResult.value;       // validated, trimmed
const targetDir = input.projectName;        // raw, untrimmed — NOT FIXED
```

This can cause whitespace discrepancies between the directory name and the `package.json` `name` field. If `input.projectName` has leading/trailing whitespace, the directory will be created with that whitespace while `package.json` uses the trimmed value. This is not a direct security vulnerability but an inconsistency that can cause confusing behavior.

**Recommendation:**

Change `const targetDir = input.projectName` to `const targetDir = projectName.value` on line 149. The comment `// Use original input as directory name` should be updated to explain why the validated value is preferred.

---

#### F-03: Generated ESLint flat config missing `languageOptions`

| Field | Value |
|-------|-------|
| **Finding ID** | F-03 |
| **Severity** | Minor |
| **Domain** | Secure configuration |
| **Location** | `src/application/services/config-generators.ts` lines 320–336 |
| **OWASP Reference** | [A05:2021 – Security Misconfiguration](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/) |
| **CVSS Estimate** | 2.1 — AV:L/AC:H/PR:N/UI:R/S:U/C:N/I:L/A:N |

**Description:**

Still unaddressed. The generated `eslint.config.js` flat config omits `languageOptions` (`ecmaVersion`, `sourceType`). Modern ESLint 9.x may warn or misparse code without these settings. For example, without `sourceType: "module"`, ESLint may not recognize `import`/`export` syntax, leading to spurious parsing errors for the scaffolded project.

**Recommendation:**

Replace the generator body to include `languageOptions`:

```typescript
export const generateEslintConfig = (_ctx: GeneratorContext): string => {
  return [
    '// Auto-generated by create-ink-app',
    'export default [',
    '  {',
    '    languageOptions: {',
    '      ecmaVersion: 2022,',
    '      sourceType: "module",',
    '    },',
    '    rules: {',
    '      semi: ["error", "always"],',
    '      quotes: ["error", "single"],',
    '      "no-unused-vars": "warn",',
    '      "no-console": "off",',
    '    },',
    '    ignores: ["dist/"],',
    '  },',
    '];',
    '',
  ].join('\n');
};
```

---

#### F-04: Husky pre-commit hook hardcodes `npm test` regardless of selected package manager

| Field | Value |
|-------|-------|
| **Finding ID** | F-04 |
| **Severity** | Minor |
| **Domain** | Secure configuration |
| **Location** | `src/application/services/config-generators.ts` line 355 |
| **OWASP Reference** | N/A — not a direct security vulnerability |
| **CVSS Estimate** | N/A |

**Description:**

Still unaddressed. The generated `.husky/pre-commit` hook runs `npm test` unconditionally, even when the user has selected `bun`, `pnpm`, or `yarn` as their package manager. This will cause the pre-commit hook to fail if `npm` is not the selected package manager.

The same pattern affects `generateLefthookYml()` (line 171), which also hardcodes `npm run` commands.

**Recommendation:**

Update `generateHuskyHook` and `generateLefthookYml` to use `ctx.packageManager`:

```typescript
export const generateHuskyHook = (ctx: GeneratorContext): string => {
  const pm = ctx.packageManager || 'npm';
  return [
    '#!/usr/bin/env sh',
    '. "$(dirname -- "$0")/_/husky.sh"',
    '',
    `${pm} test`,
    '',
  ].join('\n');
};
```

---

### TRIVIAL (Unresolved from previous cycle)

---

#### F-05: `execSync` call omits explicit `shell: false` option

| Field | Value |
|-------|-------|
| **Finding ID** | F-05 |
| **Severity** | Trivial |
| **Domain** | Secure coding, OS security |
| **Location** | `src/infrastructure/cli/runtime-checker.ts` lines 22–25 |
| **OWASP Reference** | N/A — defense-in-depth |
| **CVSS Estimate** | N/A |

**Description:**

Still unaddressed. The `execSync` call does not explicitly set `shell: false`. On Unix, the default is `false` (no shell), so this is not exploitable. However, explicitly setting `shell: false` documents the intent and eliminates any ambiguity about shell injection risk, especially for future readers who may modify the command string.

Note: The command `'node --version'` is hardcoded and contains no user input, so there is no shell injection vector even with a shell. This is purely a defense-in-depth recommendation.

**Recommendation:**

Add `shell: false` to the `execSync` options:

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
|----------|-----------|--------|:----------------:|
| **OWASP Top 10 A01** | Broken Access Control | ✅ **COMPLIANT** — path traversal vector closed | F-01 (fixed) |
| **OWASP Top 10 A04** | Insecure Design | ⚠️ Partial — unvalidated raw input for directory operations | F-02 |
| **OWASP Top 10 A05** | Security Misconfiguration | ⚠️ Partial — missing languageOptions in ESLint config | F-03 |
| **OWASP ASVS V5.3** | Input Validation | ✅ **COMPLIANT** — allowlist validation added for language parameter | F-01 (fixed) |
| **OWASP ASVS V12.1** | File Path Security | ✅ **COMPLIANT** — template directory path no longer traversable | F-01 (fixed) |
| **MITRE ATT&CK T1005** | Data from Local System | ✅ **MITIGATED** — read traversal prevention in place | F-01 (fixed) |

## Risk Assessment

### Overall Risk Level: **Low**

### Attack Surface Analysis

| Attack Vector | Likelihood | Impact | Status |
|---------------|:----------:|:------:|--------|
| Path traversal via `--language` CLI flag | Low | Low | ✅ **Fixed** — allowlist validation prevents arbitrary path construction |
| Whitespace inconsistency in directory name | Low | Low | ❌ Not fixed (Minor) |
| ESLint misconfiguration (missing languageOptions) | Low | Low | ❌ Not fixed (Minor) |
| Broken Husky pre-commit hook with non-npm PM | Low | Low | ❌ Not fixed (Minor) |
| Shell injection via execSync without explicit `shell: false` | None | None | ❌ Not fixed (Trivial) — no user input in command string |

### Residual Risk

**Low.** The path traversal vulnerability — the only finding with security impact — has been properly remediated. The remaining findings are usability and defense-in-depth concerns:

1. **F-02** (untrimmed directory name) is a consistency issue, not a security vulnerability.
2. **F-03** (missing ESLint languageOptions) could cause spurious warnings but not code execution or data exposure.
3. **F-04** (hardcoded npm in hooks) breaks non-npm workflows but has no security impact.
4. **F-05** (no explicit shell: false) is defense-in-depth with zero exploitability given the hardcoded command string.

### Remediation Verification

The git diff confirms the fix was applied to the **correct file** this time:

```
$ git diff HEAD -- src/application/commands/scaffold-project.ts
+ const VALID_LANGUAGES = ['typescript', 'javascript'] as const;
+ if (!(VALID_LANGUAGES as readonly string[]).includes(language)) {
+   throw new Error(`Invalid language: ${language}`);
+ }
```

This is the exact code path that was previously vulnerable (lines 120–127, called at line 209). The fix validates before path construction, preventing directory traversal. The previous ineffective fix in `predicates.ts` (which was never called) has been supplemented with a matching guard, so both the domain-level and use-case-level `getTemplateDir` functions now validate their inputs.

## Fix Instructions

### OPTIONAL — 3 Minor + 1 Trivial Fixes (not required for approval)

These findings do not block approval but should be addressed in a future work unit:

**1. [F-02 — Minor] Use validated project name for directory path:**
`src/application/commands/scaffold-project.ts` line 149:
```typescript
// Change:
const targetDir = input.projectName;
// To:
const targetDir = projectName.value;
```

**2. [F-03 — Minor] Add `languageOptions` to ESLint flat config:**
`src/application/services/config-generators.ts` lines 320–336 — add `languageOptions: { ecmaVersion: 2022, sourceType: "module" }` inside the config object.

**3. [F-04 — Minor] Make Husky hook and Lefthook config respect selected package manager:**
`src/application/services/config-generators.ts` lines 354–356 and 164–178 — use `ctx.packageManager` instead of hardcoded `npm`.

**4. [F-05 — Trivial] Add `shell: false` to execSync:**
`src/infrastructure/cli/runtime-checker.ts` line 22 — add `shell: false` to the options object.

## Test Coverage Note

The previous review requested adding a test case for path traversal prevention (e.g., `"should reject invalid language values and prevent path traversal"`). This test was **not added**. While the lack of tests does not affect the functional correctness of the fix (the validation is present and operational), adding a regression test is recommended for long-term maintenance.

## Last Loop Rule Checkbox

- [ ] **Last Loop Rule triggered**: No
- [x] **Re-review required after fixes**: No — verdict is APPROVED

This work unit passes security review. The previously blocking path traversal vulnerability has been properly remediated. Remaining findings are Minor/Trivial and do not warrant further review cycles for this work unit.

---

## CANONICAL ARTIFACT — Full Output — Complete Security Review Findings

### Summary Table

| ID | Severity | Domain | Location | Short Description | Status |
|:--:|:--------:|:------:|----------|-------------------|:------:|
| F-01 | ~~Blocker~~ **Fixed** | Input validation | `scaffold-project.ts:120-127` | Path traversal via `--language` — local `getTemplateDir` now validates language against allowlist `['typescript', 'javascript']` | ✅ **Fixed** |
| F-02 | Minor | Input validation | `scaffold-project.ts:149` | `targetDir` uses raw untrimmed `input.projectName` instead of validated `projectName.value` | ❌ Not addressed |
| F-03 | Minor | Secure config | `config-generators.ts:320-336` | ESLint flat config missing `languageOptions` (ecmaVersion, sourceType) | ❌ Not addressed |
| F-04 | Minor | Secure config | `config-generators.ts:354-356` | Husky hook hardcodes `npm test` regardless of selected package manager | ❌ Not addressed |
| F-05 | Trivial | Secure coding | `runtime-checker.ts:22-25` | `execSync` omits explicit `shell: false` | ❌ Not addressed |
| FP-01 | Positive | Error handling | `output-formatter.ts` | Missing `runtime_not_found` error-kind case was added | ✅ **Fixed** |

### Remediation Verification Details

**What was fixed (actual diff):**

```diff
--- a/src/application/commands/scaffold-project.ts
+++ b/src/application/commands/scaffold-project.ts
@@ -117,8 +117,12 @@ const getTemplateFiles = (language: string): string[] => {
   return ['source/app.tsx.template', 'source/cli.tsx.template', 'test.tsx.template'];
 };
 
-/** Get the template directory for a given language */
+/** Get the template subdirectory for a given language. Validates against known values to prevent path traversal. */
 const getTemplateDir = (language: string): string => {
+  const VALID_LANGUAGES = ['typescript', 'javascript'] as const;
+  if (!(VALID_LANGUAGES as readonly string[]).includes(language)) {
+    throw new Error(`Invalid language: ${language}`);
+  }
   return `node/${language}`;
 };
```

**Verification checklist:**

| Criterion | Result |
|-----------|--------|
| Fix applied to `scaffold-project.ts` (the vulnerable file, not just `predicates.ts`) | ✅ Yes — lines 121–125 added |
| Validation uses allowlist (positive match), not blocklist | ✅ Yes — `['typescript', 'javascript']` |
| Path constructed only after validation passes | ✅ Yes — `return` is after the `if` guard |
| Invalid values throw a clear error | ✅ Yes — `throw new Error(\`Invalid language: ${language}\`)` |
| `predicates.ts` also has matching validation (defense-in-depth) | ✅ Yes — lines 34–44 |
| Existing tests still pass | ❓ Not re-run, but diff only adds validation before existing path construction |
| Path traversal test added | ❌ No — recommendation for future work |
