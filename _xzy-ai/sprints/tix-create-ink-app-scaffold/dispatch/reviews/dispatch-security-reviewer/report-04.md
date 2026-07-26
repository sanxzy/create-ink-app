---
agent: dispatch-security-reviewer
work_unit_id: "04 — Bun Runtime Support (all combinations)"
report_number: "04"
backlog: tix-create-ink-app-scaffold
status: APPROVED
review_cycle: 5
timestamp: "2026-07-26T18:30:00Z"
artifacts:
  - src/application/commands/scaffold-project.ts
  - src/application/services/config-generators.ts
  - src/infrastructure/cli/runtime-checker.ts
  - src/presentation/formatters/output-formatter.ts
  - src/presentation/parsers/args-parser.ts
  - src/domain/services/predicates.ts
  - src/shared/types/index.ts
  - src/application/dtos/scaffold-input.ts
  - src/index.ts
  - templates/bun/typescript/source/app.tsx.template
  - templates/bun/typescript/source/cli.tsx.template
  - templates/bun/typescript/test.tsx.template
  - templates/bun/javascript/source/app.jsx.template
  - templates/bun/javascript/source/cli.jsx.template
  - templates/bun/javascript/test.jsx.template
  - src/tests/unit/scaffold-project.test.ts
upstream_reports:
  - _xzy-ai/sprints/tix-create-ink-app-scaffold/dispatch/work-unit-spec-04.md
  - _xzy-ai/sprints/tix-create-ink-app-scaffold/dispatch/worker/report-04.md
  - _xzy-ai/sprints/tix-create-ink-app-scaffold/dispatch/reviews/dispatch-security-reviewer/report-04.md
---

# Security Review Report — 04 — Bun Runtime Support

**Agent:** dispatch-security-reviewer
**Work Unit:** 04 — Bun Runtime Support (all combinations)
**Report Number:** 04
**Review Cycle:** 5
**Backlog:** tix-create-ink-app-scaffold
**Status:** APPROVED
**Timestamp:** 2026-07-26T18:30:00Z

## Verdict

**APPROVED** — The Blocker path traversal vulnerability (B-01) has been fixed. Allowlist validation has been restored for both `runtime` and `language` parameters in `getTemplateDir`. All 292 tests pass. The 4 remaining Minor findings and 1 Trivial finding are pre-existing issues from prior cycles that do not block approval. The Last Loop Rule is triggered — fixes for Minor/Trivial findings can be delegated to the worker without another reviewer cycle.

## Previous Review Findings Status (Cycle 4 → Cycle 5)

| ID | Severity (Previous) | Description | Status | Note |
|:--:|:-------------------:|-------------|:------:|------|
| B-01 | 🔴 Blocker | Path traversal via `--runtime`/`--language` — allowlist validation removed in WU-04 rewrite | ✅ **FIXED** | Allowlist validation restored with both `VALID_RUNTIMES` and `VALID_LANGUAGES` |
| M-01 | Minor | `targetDir` uses raw untrimmed `input.projectName` instead of validated `projectName.value` | ❌ Not addressed | Line 158 |
| M-02 | Minor | ESLint flat config missing `languageOptions` | ❌ Not addressed | Unchanged |
| M-03 | Minor | Husky/Lefthook hardcode `npm`/`bun` instead of respecting `--pm` selection | ❌ Not addressed | Unchanged |
| M-04 | Minor | `formatScaffoldSuccess` always shows `npm install`/`npm run dev` regardless of runtime | ❌ Not addressed | Unchanged |
| T-01 | Trivial | `execSync` calls omit explicit `shell: false` | ❌ Not addressed | Both calls unchanged |

## Finding Summary

| Severity | Count | Action Required |
|----------|:-----:|-----------------|
| Blocker  | 0     | — |
| Critical | 0     | — |
| Major    | 0     | — |
| Minor    | 4     | Optional (Last Loop Rule) |
| Trivial  | 1     | Optional (Last Loop Rule) |

## Verification Summary

### Key Files Reviewed

| # | File | Lines | Role | Status |
|---|------|:-----:|------|:------:|
| 1 | `src/application/commands/scaffold-project.ts` | 265 | Scaffold use case — `getTemplateDir` now has allowlist validation | ✅ **Fixed** |
| 2 | `src/application/services/config-generators.ts` | 402 | Config generators — runtime-aware additions | ✅ Good |
| 3 | `src/infrastructure/cli/runtime-checker.ts` | 58 | Runtime validation via execSync — added Bun checker | ✅ Good |
| 4 | `src/infrastructure/index.ts` | 15 | Infrastructure barrel — added Bun checker export | ✅ Good |
| 5 | `src/index.ts` | 55 | Composition root — combined runtime checker | ✅ Good |
| 6 | `src/presentation/formatters/output-formatter.ts` | 99 | Output formatters — added `runtime_not_found` case | ⚠️ M-04 |
| 7 | `src/presentation/parsers/args-parser.ts` | 82 | CLI argument parsing — raw type casts to union types | ⚠️ Defense-in-depth gap |
| 8 | `src/domain/services/predicates.ts` | 45 | Domain predicates — type-safe `getTemplateDir` | ✅ Good |
| 9 | `templates/bun/**` | 6 files | Bun template files | ✅ Good |
| 10 | `src/shared/types/index.ts` | 35 | Shared types — `Runtime = 'node' \| 'bun'` | ✅ Good |
| 11 | `src/application/dtos/scaffold-input.ts` | 42 | Scaffold input DTO — typed `Runtime` field | ✅ Good |
| 12 | `src/tests/unit/scaffold-project.test.ts` | 746 | Scaffold unit tests — 292 pass | ✅ Good |

### Domains Evaluated

| Domain | Coverage | Findings |
|--------|:--------:|:--------:|
| Secure coding (input validation & path traversal) | Full | 0 (B-01 fixed) |
| Secure configuration | Full | 2 Minor (M-02, M-03) |
| OS security (execSync) | Full | 1 Trivial (T-01) |
| Input validation & directory operations | Full | 1 Minor (M-01) |
| Output formatting | Full | 1 Minor (M-04) |
| Threat modeling | Full | 0 |
| Dependency security | Full | 0 |
| Authentication/Authorization | N/A | 0 |
| Cryptography | N/A | 0 |

---

## Full Findings — Grouped by Severity

### BLOCKER (CVSS 7.0–10.0)

**No Blocker findings.** The previous B-01 (path traversal regression) has been fixed.

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
| **Location** | `src/application/commands/scaffold-project.ts` line 158 |
| **OWASP Reference** | [A04:2021 – Insecure Design](https://owasp.org/Top10/A04_2021-Insecure_Design/) |
| **CVSS Estimate** | 3.5 — AV:L/AC:L/PR:N/UI:R/S:U/C:N/I:L/A:N |

**Description:**

Line 158 uses the raw `input.projectName` instead of the validated `projectName.value`:

```typescript
const projectName = nameResult.value;       // validated, trimmed
const targetDir = input.projectName;        // raw, untrimmed — NOT FIXED
```

If `input.projectName` has leading/trailing whitespace or special characters, the directory will be created with that name while `package.json` uses the trimmed value. This can cause inconsistency and confusing behavior. Since `project-name.ts` already validates project names, this is a low-risk consistency issue rather than a path traversal vulnerability.

**Recommendation:**

Change `const targetDir = input.projectName` to `const targetDir = projectName.value` on line 158.

---

#### M-02: Generated ESLint flat config missing `languageOptions` (unresolved)

| Field | Value |
|-------|-------|
| **Finding ID** | M-02 |
| **Severity** | Minor |
| **Domain** | Secure configuration |
| **Location** | `src/application/services/config-generators.ts` lines 349–365 |
| **OWASP Reference** | [A05:2021 – Security Misconfiguration](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/) |
| **CVSS Estimate** | 2.1 — AV:L/AC:H/PR:N/UI:R/S:U/C:N/I:L/A:N |

**Description:**

The generated `eslint.config.js` flat config in `generateEslintConfig` omits `languageOptions` (`ecmaVersion`, `sourceType`). Modern ESLint 9.x may warn or misparse ESM code without these settings, leading to spurious parsing errors for the scaffolded project.

**Recommendation:**

Add `languageOptions` to the generated config object:

```typescript
languageOptions: {
  ecmaVersion: 2022,
  sourceType: "module",
},
```

---

#### M-03: Husky/Lefthook configs hardcode `npm`/`bun` instead of respecting `--pm` selection (unresolved)

| Field | Value |
|-------|-------|
| **Finding ID** | M-03 |
| **Severity** | Minor |
| **Domain** | Secure configuration |
| **Location** | `src/application/services/config-generators.ts` line 179 (`generateLefthookYml`) and line 384 (`generateHuskyHook`) |
| **OWASP Reference** | N/A — not a direct security vulnerability |
| **CVSS Estimate** | N/A |

**Description:**

The `generateHuskyHook` and `generateLefthookYml` functions select between `bun` and `npm` based on `ctx.runtime`:

```typescript
const pm = ctx.runtime === 'bun' ? 'bun' : 'npm';
```

They do not respect the `ctx.packageManager` selection (`npm`, `pnpm`, `yarn`, `bun`). A user who scaffolds with `--pm pnpm` will get `npm test` in the pre-commit hook, which will fail if `npm` is not available. Note: `GeneratorContext` lacks a `packageManager` field, so adding this support requires updating both the interface and its construction site.

**Recommendation:**

Add `packageManager` to `GeneratorContext` and use it in both hook generators:

```typescript
// In generateHuskyHook:
const pm = ctx.runtime === 'bun' ? 'bun' : (ctx.packageManager || 'npm');

// In generateLefthookYml:
const pm = ctx.runtime === 'bun' ? 'bun' : (ctx.packageManager || 'npm');
```

---

#### M-04: `formatScaffoldSuccess` always shows `npm` commands regardless of runtime (unresolved)

| Field | Value |
|-------|-------|
| **Finding ID** | M-04 |
| **Severity** | Minor |
| **Domain** | Secure configuration |
| **Location** | `src/presentation/formatters/output-formatter.ts` lines 21–23 |
| **OWASP Reference** | N/A |
| **CVSS Estimate** | N/A |

**Description:**

The success message shown after scaffolding always displays `npm install` and `npm run dev` in the "Next steps" section:

```typescript
'  Next steps:',
`    cd ${result.projectDir}`,
'    npm install',
'    npm run dev',
```

For Bun scaffolds, the correct commands are `bun install` and `bun run dev`. This causes user confusion — users who scaffold a Bun project see incorrect instructions for the next steps.

**Recommendation:**

Make `formatScaffoldSuccess` runtime-aware by adding the runtime or package manager to the `ScaffoldResult` type and selecting the appropriate command display text.

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

Both `execSync` calls (`node --version` and `bun --version`) omit explicit `shell: false`. On Unix the default is `false`, so this is not exploitable. However, explicitly setting `shell: false` documents intent, eliminates ambiguity on platforms where defaults differ, and provides defense-in-depth against shell injection if the command strings are ever modified in the future.

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
| **OWASP Top 10 A01** | Broken Access Control | ✅ **COMPLIANT** — path traversal fixed in `getTemplateDir` | None |
| **OWASP Top 10 A04** | Insecure Design | ⚠️ Partial — untrimmed raw input for directory operations | M-01 |
| **OWASP Top 10 A05** | Security Misconfiguration | ⚠️ Partial — missing `languageOptions` in ESLint config | M-02 |
| **OWASP ASVS V5.3** | Input Validation | ✅ **COMPLIANT** — allowlist validation restored | None |
| **OWASP ASVS V12.1** | File Path Security | ✅ **COMPLIANT** — template directory path validated before construction | None |
| **MITRE ATT&CK T1005** | Data from Local System | ✅ **MITIGATED** — path traversal blocked by allowlist | None |
| **OWASP ASVS V1.5** | Input and Output Requirements | ⚠️ Partial — typed input exists but not enforced at CLI boundary | Defense-in-depth gap |

## Risk Assessment

### Overall Risk Level: **LOW** (previously CRITICAL — Blocker fixed)

### Attack Surface Analysis

| Attack Vector | Likelihood | Impact | Status |
|---------------|:----------:|:------:|--------|
| Path traversal via `--runtime`/`--language` to read arbitrary files | Low (requires CLI access) | High — arbitrary file read | ✅ **FIXED** — allowlist blocks path traversal sequences |
| Whitespace inconsistency in directory name | Low | Low — causes confusion | ❌ Not fixed (Minor) |
| ESLint misconfiguration (missing `languageOptions`) | Low | Low — spurious warnings | ❌ Not fixed (Minor) |
| Broken pre-commit hook with non-npm/non-bun PM | Low | Low — hook failure for pnpm/yarn users | ❌ Not fixed (Minor) |
| Incorrect "Next steps" for Bun scaffold | Low | Low — user confusion | ❌ Not fixed (Minor) |
| Shell injection via execSync | None | None — hardcoded commands only | ❌ Not fixed (Trivial) |

### Root Cause of Regression

The `getTemplateDir` function was rewritten from `getTemplateDir(language: string)` (with allowlist validation for `language`) to `getTemplateDir(runtime: string, language: string)` (no validation). The allowlist validation was inadvertently dropped during the signature change.

### Remediation Applied

**B-01 (Blocker):** ✅ `getTemplateDir` now validates both `runtime` and `language` against static allowlists (`['node', 'bun']` and `['typescript', 'javascript']`) before constructing the path. Invalid values throw `Error` with descriptive messages.

### Protection Layers (Defense-in-Depth)

| Layer | Status | Note |
|-------|:------:|------|
| Type-level: `Runtime`/`Language` union types | ✅ Present | `ScaffoldInput` uses typed fields |
| Function-level: allowlist validation in `getTemplateDir` | ✅ **RESTORED** | Both `runtime` and `language` validated |
| CLI boundary: `args-parser.ts` casts with `as` | ⚠️ Gap | TypeScript `as` assertions bypassed at runtime |
| Defensive: `predicates.ts` uses typed signatures | ✅ Present | But not called by the scaffold use case |

## Fix Instructions

### REQUIRED — Blocker (None)

**No blocker fixes required.** B-01 has been remediated.

### OPTIONAL — Minor/Trivial (Last Loop Rule)

The following findings remain from prior review cycles. Since they are Minor/Trivial, fixes can be delegated to the worker without another security review cycle.

**M-01 — Fix untrimmed targetDir:**
`src/application/commands/scaffold-project.ts` line 158:
```typescript
// Change from:
const targetDir = input.projectName;
// To:
const targetDir = projectName.value;
```

**M-02 — Add languageOptions to ESLint config:**
`src/application/services/config-generators.ts` lines 349–365:
Add `languageOptions: { ecmaVersion: 2022, sourceType: "module" }` to the generated ESLint config object.

**M-03 — Respect `--pm` in hooks:**
`src/application/services/config-generators.ts`:
1. Add `packageManager: PackageManager` to `GeneratorContext` interface.
2. Update `makeScaffoldProject` in `scaffold-project.ts` to pass `input.packageManager` to the `GeneratorContext`.
3. Update `generateHuskyHook` (line 384) and `generateLefthookYml` (line 179) to use `ctx.packageManager`.

**M-04 — Runtime-aware success message:**
`src/presentation/formatters/output-formatter.ts` lines 21–23:
Make `formatScaffoldSuccess` display `bun install`/`bun run dev` for Bun scaffolds.

**T-01 — Add `shell: false` to execSync:**
`src/infrastructure/cli/runtime-checker.ts` lines 22–25 and 46–49:
Add `shell: false` to both `execSync` options objects.

## Test Coverage Note

Path traversal prevention tests (invalid `runtime`/`language` values throw errors) were recommended in Cycle 3 and Cycle 4 but have not been added. Consider adding tests for:
1. `getTemplateDir("../../etc", "passwd")` throws `Error`
2. `getTemplateDir("node", "../../etc/passwd")` throws `Error`
3. `getTemplateDir("bun", "typescript")` returns `"bun/typescript"` (already indirectly tested)
4. `getTemplateDir("node", "javascript")` returns `"node/javascript"` (already indirectly tested)

However, this is a recommendation, not a requirement for approval.

## Last Loop Rule Checkbox

- [x] **Last Loop Rule triggered**: Yes — only Minor/Trivial findings remain; fixes can be delegated to the worker without re-review.
- [ ] **Re-review required after fixes**: No — the Blocker has been fixed; remaining issues are Minor/Trivial.

---

## CANONICAL ARTIFACT — Full Output — Complete Security Review Findings

### Verdict

**APPROVED** — B-01 (Blocker path traversal) fixed. Remaining issues: 4 Minor, 1 Trivial.

### Previous Review Findings Status

| ID | Prior Severity | Description | Status |
|:--:|:--------------:|-------------|:------:|
| B-01 | 🔴 Blocker | Path traversal via `--runtime`/`--language` regression | ✅ **FIXED** |
| M-01 | Minor | `targetDir` uses raw untrimmed `input.projectName` | ❌ Unresolved |
| M-02 | Minor | ESLint flat config missing `languageOptions` | ❌ Unresolved |
| M-03 | Minor | Husky/Lefthook don't respect `--pm` | ❌ Unresolved |
| M-04 | Minor | `formatScaffoldSuccess` always shows `npm` commands | ❌ Unresolved |
| T-01 | Trivial | `execSync` calls omit `shell: false` | ❌ Unresolved |

### Summary Table

| ID | Severity | Domain | Location | Short Description | Status |
|:--:|:--------:|:------:|----------|-------------------|:------:|
| B-01 | 🔴 ~~Blocker~~ | Input validation | `scaffold-project.ts:126-136` | Path traversal via `--runtime`/`--language` — allowlist removed in WU-04 rewrite | ✅ **FIXED** |
| M-01 | Minor | Input validation | `scaffold-project.ts:158` | `targetDir` uses raw untrimmed `input.projectName` instead of validated `projectName.value` | ❌ Unresolved |
| M-02 | Minor | Secure config | `config-generators.ts:349-365` | ESLint flat config missing `languageOptions` | ❌ Unresolved |
| M-03 | Minor | Secure config | `config-generators.ts:179,384` | Husky/Lefthook hardcode `npm`/`bun` instead of respecting `--pm` selection | ❌ Unresolved |
| M-04 | Minor | Secure config | `output-formatter.ts:21-23` | `formatScaffoldSuccess` always shows `npm install`/`npm run dev` | ❌ Unresolved |
| T-01 | Trivial | Secure coding | `runtime-checker.ts:22-25,46-49` | Both `execSync` calls omit explicit `shell: false` | ❌ Unresolved |

### Fix Verification — B-01 (Path Traversal)

**Before (vulnerable):**
```typescript
const getTemplateDir = (runtime: string, language: string): string => {
  return `${runtime}/${language}`;
};
```

**After (fixed):**
```typescript
/** Get the template subdirectory for a given runtime and language. Validates against known values to prevent path traversal. */
const getTemplateDir = (runtime: string, language: string): string => {
  const VALID_RUNTIMES = ['node', 'bun'] as const;
  const VALID_LANGUAGES = ['typescript', 'javascript'] as const;
  if (!(VALID_RUNTIMES as readonly string[]).includes(runtime)) {
    throw new Error(`Invalid runtime: ${runtime}`);
  }
  if (!(VALID_LANGUAGES as readonly string[]).includes(language)) {
    throw new Error(`Invalid language: ${language}`);
  }
  return `${runtime}/${language}`;
};
```

**Verification matrix:**
| Input | Expected | Actual (code) |
|-------|----------|:-------------:|
| `getTemplateDir("node", "typescript")` | `"node/typescript"` | ✅ Correct |
| `getTemplateDir("bun", "javascript")` | `"bun/javascript"` | ✅ Correct |
| `getTemplateDir("../../etc", "passwd")` | throws Error | ✅ Correct |
| `getTemplateDir("node", "../../etc/passwd")` | throws Error | ✅ Correct |
| `getTemplateDir("invalid", "typescript")` | throws Error | ✅ Correct |
| `getTemplateDir("node", "invalid")` | throws Error | ✅ Correct |

### What Was Done Well

1. **Allowlist validation restored**: Both `runtime` and `language` are validated against static allowlists before path construction — exactly matching the previous cycle's recommendation.
2. **All 292 tests pass**: The fix doesn't break any existing functionality.
3. **Runtime union types**: `Runtime = 'node' | 'bun'` properly limits valid values at the type level.
4. **Shebangs**: `#!/usr/bin/env bun` in all Bun CLI templates correctly.
5. **bun.lock in .gitignore**: Correctly includes `bun.lock` only for Bun scaffolds.
6. **No vitest.config.ts**: Correctly skipped for Bun scaffolds.
7. **Config generator runtime-awareness**: All generators produce Bun-specific output.
8. **Runtime checker**: `makeBunRuntimeChecker` with 5-second timeout prevents hanging.
9. **Error handling**: `runtime_not_found` case was added to `formatScaffoldError`.
10. **Combined checker**: Composition root correctly selects between `node` and `bun` checkers.
11. **execSync timeout**: Both runtime checkers use `timeout: 5000` to prevent hanging in CI.
12. **Test coverage**: 49 new tests covering 12 Bun combinations.
