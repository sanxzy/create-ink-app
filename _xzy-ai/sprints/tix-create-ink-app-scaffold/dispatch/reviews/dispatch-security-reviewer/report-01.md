---
agent: dispatch-security-reviewer
work_unit_id: "01 — Node + TypeScript Scaffold Engine (tracer bullet)"
report_number: 01
status: completed
timestamp: "2026-07-26T15:00:00Z"
artifacts:
  - src/index.ts
  - src/domain/value-objects/project-name.ts
  - src/domain/repositories/ports.ts
  - src/domain/services/predicates.ts
  - src/application/commands/scaffold-project.ts
  - src/application/dtos/scaffold-input.ts
  - src/application/services/config-generators.ts
  - src/infrastructure/file-system/node-file-system.ts
  - src/infrastructure/templates/template-engine.ts
  - src/infrastructure/index.ts
  - src/presentation/commands/create-app.ts
  - src/presentation/parsers/args-parser.ts
  - src/presentation/formatters/output-formatter.ts
  - src/presentation/index.ts
  - src/shared/errors/result.ts
  - src/shared/types/index.ts
  - templates/node/typescript/source/app.tsx.template
  - templates/node/typescript/source/cli.tsx.template
  - templates/node/typescript/test.tsx.template
  - package.json
  - tsconfig.json
  - biome.json
  - vitest.config.ts
  - lefthook.yml
upstream_reports:
  - _xzy-ai/sprints/tix-create-ink-app-scaffold/dispatch/worker/report-01.md
---

# Security Review Report — 01 — Node + TypeScript Scaffold Engine (tracer bullet)

**Agent:** dispatch-security-reviewer
**Work Unit:** 01 — Node + TypeScript Scaffold Engine (tracer bullet)
**Report Number:** 01
**Backlog:** tix-create-ink-app-scaffold
**Status:** COMPLETED
**Timestamp:** 2026-07-26T15:00:00Z

## Verdict

**APPROVED**

No Blocker, Critical, or Major security issues found. Two Minor and two Trivial findings are documented below — none warrant a rejection.

## Finding Summary

| Severity | Count |
|----------|-------|
| Blocker  | 0     |
| Critical | 0     |
| Major    | 0     |
| Minor    | 2     |
| Trivial  | 2     |

## Verification Summary

**Files reviewed:** 23 source files, 3 template files, 5 configuration files, 5 test files (entire source tree)

**Technology stack:** TypeScript (ESM), Bun runtime, mri (CLI parsing), Vitest (testing), Biome (linting), Lefthook (git hooks), Ink + React (generated project templates)

**Security domains evaluated:**

| Domain | Coverage | Findings |
|--------|----------|----------|
| Secure coding | Full | SEC-01 (Minor), SEC-04 (Trivial) |
| Template injection | Full | SEC-01 (Minor) |
| Path traversal | Full | None |
| Command injection | Full | None |
| File system security | Full | None |
| Dependency supply chain | Full | SEC-02 (Minor) |
| Input validation | Full | None |
| Output encoding | Full | None |
| Error handling / Info leakage | Full | None |
| Authentication | N/A | No auth in scope |
| Authorization | N/A | No auth in scope |
| Cryptography | N/A | No crypto in scope |
| Web security | N/A | CLI tool, no web surface |
| API security | N/A | No API in scope |
| Session management | N/A | No sessions in scope |
| Logging and monitoring | Full | SEC-03 (Trivial) |
| Secure configuration | Full | None |
| CI/CD security | Review | Not part of work unit |
| Source-code review | Full | See findings |

## Domains Evaluated

| Domain | Coverage | Findings |
|--------|----------|----------|
| Secure Coding | Full codebase audit: input validation, output encoding, error handling, safe defaults | SEC-01, SEC-03, SEC-04 |
| Template Injection | Template engine regex analysis, variable substitution paths, prototype chain | SEC-01 |
| Path Traversal | All file system write paths traced: project name → directory/file construction | None |
| Command Injection | All `process.*`, `child_process`, `exec`, `spawn`, `eval`, `Function()` invocations checked | None |
| File System Security | Write targets, permission handling, symlink risks, recursive mkdir | None |
| Dependency Supply Chain | Third-party deps analyzed: mri, vitest, biome, typescript, lefthook; generated project deps | SEC-02 |
| Input Validation | Project name validation rules, template variable regex, mri argument coercion | None |
| Logging & Monitoring | Console output patterns, error message verbosity, exit code handling | SEC-03 |

---

## Full Findings List

### Minor Findings

---

#### SEC-01: Template engine uses `in` operator — prototype chain traversal

| Field | Value |
|-------|-------|
| **Domain** | Secure Coding / Template Injection |
| **Location** | `src/infrastructure/templates/template-engine.ts`, line 39 |
| **Severity** | Minor |
| **OWASP Reference** | A03:2021 — Injection |
| **CVSS Estimate** | 3.1 (AV:L/AC:H/PR:N/UI:N/S:U/C:N/I:L/A:N) |

**Description:**

The `processTemplate` function uses the `in` operator to check whether a variable name exists in the `vars` record before substitution:

```typescript
if (varName in vars) {
  return vars[varName];
}
```

The `in` operator traverses the entire prototype chain of the object. This means inherited properties such as `__proto__`, `constructor`, `toString`, `hasOwnProperty`, etc. are all found by this check — even though they are not actual template variables. If a template file contained `<% __proto__ %>`, the guard would pass (`'__proto__' in {}` is `true` in JavaScript), and `vars['__proto__']` would resolve to `Object.prototype` (a non-string value), which would be coerced to the string `"[object Object]"` in the output.

**Exploitability analysis:**

- **Currently not exploitable.** The regex pattern `[A-Z_][A-Z0-9_]*` restricts matched placeholders to uppercase ASCII letters, digits, and underscores. While `__PROTO__` would technically match the regex, it is not present in any of the three template files shipped with the package, and the `vars` record only contains `PROJECT_NAME`, `PROJECT_VERSION`, and `CURRENT_YEAR`.
- The template files are shipped with the package and not user-controllable.
- However, if a future work unit adds user-supplied template files or variable names, this code path could become exploitable.

**Recommendation:**

Replace `varName in vars` with `Object.hasOwn(vars, varName)` (available in Node.js 18+, which is the tool's minimum target):

```typescript
if (Object.hasOwn(vars, varName)) {
  return vars[varName];
}
```

Alternatively, use `Object.prototype.hasOwnProperty.call(vars, varName)` for broader compatibility. This ensures only own properties (actual template variables) are considered, never prototype-inherited properties.

---

#### SEC-02: Generated lefthook.yml uses `npx` for local tool commands

| Field | Value |
|-------|-------|
| **Domain** | Dependency Supply Chain / Secure Configuration |
| **Location** | `src/application/services/config-generators.ts`, lines 128–132 |
| **Severity** | Minor |
| **OWASP Reference** | A06:2021 — Vulnerable and Outdated Components |
| **CVSS Estimate** | 3.7 (AV:L/AC:H/PR:N/UI:R/S:U/C:N/I:L/A:L) |

**Description:**

The generated `lefthook.yml` configures pre-commit hooks using raw `npx` invocations:

```yaml
commands:
  typecheck:
    run: npx tsc --noEmit
  lint:
    run: npx biome check source/
  format:
    run: npx biome format --write source/
```

`npx` with a bare command name will first search `node_modules/.bin/` for the binary. If not found locally, it falls back to downloading the package from the npm registry at execution time. This introduces a supply chain risk: if the generated project is run before `npm install`, or if the local binary is missing, `npx` will fetch the latest version of the package from the registry, which could differ from the pinned version in `devDependencies`.

**Impact:**

- TypeScript, Biome, or other lint/format tools could be fetched at a different version than what is specified in `devDependencies`, causing inconsistent behavior.
- In a CI/CD context, a compromised npm registry response could inject malicious code through the `npx` download-and-execute flow.

**Recommendation:**

Replace `npx <tool>` with `npm run <script>` references to use scripts defined in `package.json`. For example:

```yaml
commands:
  typecheck:
    run: npm run typecheck
  lint:
    run: npm run lint
  format:
    run: npm run format
```

This ensures the generated project uses the exact tool versions specified in `devDependencies` after `npm install` has been run. The package.json already defines `typecheck`, `lint`, and `format` scripts that invoke `tsc` and `biome` correctly.

---

### Trivial Findings

---

#### SEC-03: `process.exit()` without explicit stdout/stderr flush

| Field | Value |
|-------|-------|
| **Domain** | Logging and Monitoring |
| **Location** | `src/presentation/commands/create-app.ts`, lines 59, 65, 73, 78, 91 |
| **Severity** | Trivial |
| **OWASP Reference** | N/A |
| **CVSS Estimate** | 0.0 (No security impact) |

**Description:**

The `runCreateApp` function calls `process.exit(0)` or `process.exit(1)` after `console.log()` / `console.error()` calls. Node.js `process.exit()` terminates the process immediately without flushing pending I/O. While `console.log` is synchronous in the default implementation for TTY mode, it can be asynchronous in pipe/redirect mode (e.g., when output is piped to another process or a file).

**Recommendation:**

Use `process.stdout.write()` and `process.stderr.write()` followed by explicit `process.exit()`, or call `process.exitCode = code` without invoking `process.exit()` to let the event loop flush on natural termination. This is a best-practice concern with negligible security impact.

---

#### SEC-04: `normalizeProjectName()` retains path-traversal-capable characters (advisory)

| Field | Value |
|-------|-------|
| **Domain** | Secure Coding |
| **Location** | `src/domain/value-objects/project-name.ts`, lines 108–113 |
| **Severity** | Trivial |
| **OWASP Reference** | A01:2021 — Broken Access Control |
| **CVSS Estimate** | 1.2 (AV:L/AC:H/PR:N/UI:N/S:U/C:N/I:L/A:N) |

**Description:**

The `normalizeProjectName` helper function strips non-alphanumeric characters but retains `.` (dot) and `_` (underscore):

```typescript
.replace(/[^a-z0-9-_.]/g, '');
```

A project name containing `..` would pass through normalization. Currently, this function **is not used** for any file system operations — it is only exported and tested. The `createProjectName` validator (which IS used for FS operations) blocks `..` traversal because the regex `[a-z0-9-._~]*` allows `.` only in non-leading positions but the first character `[a-z0-9-~]` excludes dot and the overall pattern prevents `/` in unscoped names.

**Recommendation:**

Add a code comment to `normalizeProjectName` warning that the output is not suitable for file path construction because dots are preserved. If this function is ever used for path generation in future work units, a `path.normalize()` or `path.resolve()` check should be added to prevent traversal.

---

## Standards Coverage

| Standard | Reference | Status | Finding ID(s) |
|----------|-----------|--------|---------------|
| OWASP Top 10 2021 | A01 — Broken Access Control | Pass (advisory) | SEC-04 (Trivial) |
| OWASP Top 10 2021 | A03 — Injection | Pass (one Minor) | SEC-01 (Minor) |
| OWASP Top 10 2021 | A06 — Vulnerable Components | Pass (one Minor) | SEC-02 (Minor) |
| OWASP Top 10 2021 | A09 — Security Logging & Monitoring Failures | Pass | SEC-03 (Trivial) |
| OWASP ASVS V5 | Input Validation | Pass | Project name validation is comprehensive |
| OWASP ASVS V12 | File and Resource Management | Pass | File paths are constrained by validated input |
| OWASP ASVS V14 | Configuration | Pass | No hardcoded secrets or insecure defaults |
| MITRE ATT&CK | T1574 — Hijack Execution Flow | Not applicable | SEC-02 has theoretical npx supply chain risk |
| NIST CSF | PR.PT — Protective Technology | Pass | Dependency pinning through ^ ranges is acceptable for 0.x tool |
| PTES | Information Gathering | Not applicable | No network exposure |

## Risk Assessment

### Overall Risk: Low

**Attack Surface:**
- The CLI tool writes files to disk based on user-supplied project names
- Template substitution operates on bundled templates with validated variable names
- The tool does not execute external commands, make network requests, or process untrusted data beyond the project name

**Key Risk Vectors:**
1. **Path traversal** (if validation were bypassed): Mitigated by comprehensive regex-based project name validation (`[a-z0-9-._~]` character whitelist, length limit, leading character enforcement). No bypass identified.
2. **Template substitution injection** (if templates were user-supplied): Mitigated by restrictive regex (`[A-Z_][A-Z0-9_]*`) and template files being shipped with the package. Minor prototype-chain concern (SEC-01).
3. **Supply chain via generated lefthook.yml**: Low severity — user must have run `npm install` in the generated project before lefthook triggers, and `npx` resolves local binaries first (SEC-02).

**Mitigations Already in Place:**
- Project name validated against npm naming rules (lowercase, character whitelist, length limit, reserved words)
- Template variables restricted to uppercase-alphanumeric-only names
- All file system errors return `Result<T,E>` — never throw
- No `child_process`, `exec`, `spawn`, `eval`, or `Function()` constructor usage anywhere
- No hardcoded credentials, API keys, or secrets
- No network calls
- Dependencies use standard `^` ranges (semver-compatible)

## Fix Instructions

No fixes required for approval. The Minor and Trivial findings should be addressed in future work units:

1. **SEC-01 (Minor):** Change `varName in vars` to `Object.hasOwn(vars, varName)` in `src/infrastructure/templates/template-engine.ts:39`. This is a simple one-line change.
2. **SEC-02 (Minor):** Update the generated `lefthook.yml` config in `src/application/services/config-generators.ts:128-132` to use `npm run typecheck`, `npm run lint`, and `npm run format` instead of `npx tsc --noEmit`, `npx biome check source/`, and `npx biome format --write source/`.
3. **SEC-03 (Trivial):** Optionally set `process.exitCode` instead of calling `process.exit()` directly, or add explicit flush calls. Non-urgent.
4. **SEC-04 (Trivial):** Add a docstring comment to `normalizeProjectName` indicating it is not safe for file path construction. Non-urgent.

## Last Loop Rule Checkbox

- [x] **Triggered?** No — this is the first review cycle (previous_review_cycles = 0). No prior findings to verify remediation.

---

<!-- CANONICAL ARTIFACT -->

# Full Output — Complete Security Review Findings

## Complete Finding Inventory

### SEC-01 (Minor) — Template engine uses `in` operator — prototype chain traversal
- **File:** `src/infrastructure/templates/template-engine.ts:39`
- **Domain:** Secure Coding / Template Injection
- **OWASP:** A03:2021 (Injection)
- **CVSS:** 3.1 (AV:L/AC:H/PR:N/UI:N/S:U/C:N/I:L/A:N)
- **Detail:** The `processTemplate` function checks `varName in vars`, which traverses the prototype chain. A template variable named `__proto__` would pass the guard and return `Object.prototype` coerced to string. Not exploitable in current codebase (template files are bundled, not user-supplied; regex restricts to `[A-Z_][A-Z0-9_]*`), but represents a latent code quality issue.
- **Fix:** Replace `varName in vars` with `Object.hasOwn(vars, varName)`.

### SEC-02 (Minor) — Generated lefthook.yml uses `npx` for local tool commands
- **File:** `src/application/services/config-generators.ts:128-132`
- **Domain:** Dependency Supply Chain / Secure Configuration
- **OWASP:** A06:2021 (Vulnerable and Outdated Components)
- **CVSS:** 3.7 (AV:L/AC:H/PR:N/UI:R/S:U/C:N/I:L/A:L)
- **Detail:** Generated lefthook.yml runs `npx tsc --noEmit`, `npx biome check source/`, `npx biome format --write source/`. If the user runs lefthook before `npm install`, `npx` fetches these packages from the npm registry at runtime instead of using the version pinned in `devDependencies`.
- **Fix:** Replace `npx tsc --noEmit` with `npm run typecheck`, `npx biome check source/` with `npm run lint`, and `npx biome format --write source/` with `npm run format`.

### SEC-03 (Trivial) — `process.exit()` without explicit stdout/stderr flush
- **File:** `src/presentation/commands/create-app.ts` (lines 59, 65, 73, 78, 91)
- **Domain:** Logging and Monitoring
- **Detail:** `process.exit()` is called after `console.log()`/`console.error()` without flush. Output could be truncated when stdout is piped.
- **Fix:** Use `process.exitCode` and let the event loop drain, or add explicit flush call.

### SEC-04 (Trivial) — `normalizeProjectName()` retains path-traversal-capable characters
- **File:** `src/domain/value-objects/project-name.ts:113`
- **Domain:** Secure Coding
- **OWASP:** A01:2021 (Broken Access Control - advisory)
- **Detail:** The function preserves `.` in output. Not used for FS operations currently, but a future work unit could inadvertently expose a path traversal vector.
- **Fix:** Add documentation comment warning against using this function for file path construction.

## Technology-Specific Analysis

### mri (CLI Argument Parsing)
- Version: ^1.2.0 (zero-dependency)
- Analyzed for: Prototype pollution, injection through args
- Result: Clean. The library is minimal and well-audited. Output is converted to a typed DTO at the presentation boundary, preventing any parser types from leaking inward.

### Node.js File System (fs)
- All operations use synchronous variants (`readFileSync`, `writeFileSync`, `mkdirSync`, etc.) — no race conditions from concurrent access.
- `mkdirSync` with `{ recursive: true }` is used in `writeFile` for auto-creating parent directories. This is safe because the directory path is derived from the validated project name.
- No symlink check is performed before writing. A malicious symlink at the target path could redirect writes. Acceptable risk for a CLI scaffold tool — the user runs it in their own workspace.

### Template Engine
- Regex-based substitution with strict pattern: `/<%(\s*[A-Z_][A-Z0-9_]*\s*(?:\|[^%]*)?)\s*%>/g`
- Variables are restricted to `[A-Z_][A-Z0-9_]*` — no lowercase, no special characters, no numbers at start.
- Default value support: `<% VAR|default %>` with pipe-delimited fallback.
- Unmatched placeholders are left intact (not silently stripped).
- Template files are read from the bundled `templates/` directory, not user-controllable paths.

### Generated Project Security Posture
- `package.json`: ESM, strict mode, no `postinstall` scripts, no `preinstall` scripts.
- `tsconfig.json`: Strict mode enabled, source maps generated (standard for debugging), no path traversal in include/exclude patterns.
- `biome.json`: Standard recommended rule set.
- `lefthook.yml`: Run commands only on pre-commit, no dangerous commands (typecheck, lint, format).
- `.gitignore`: Standard patterns (node_modules, dist, .env, .DS_Store).
- `LICENSE`: Standard MIT template.
- Generated templates: No eval, no dynamic require, no external network calls in generated code.

## Archive

No previous review cycles exist (previous_review_cycles = 0). No remediation verification was required.
