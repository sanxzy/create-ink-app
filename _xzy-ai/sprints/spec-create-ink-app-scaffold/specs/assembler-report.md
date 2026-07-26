# Assembler Report — `@xzy-ai/create-ink-app`

> **Sprint:** `spec-create-ink-app-scaffold`
> **Date:** 2026-07-26
> **Agent:** specification-assembler (generate-engineering-specs)
> **Status:** Complete

---

## Artifacts Consumed

| # | Artifact | Lines | Source Agent | Status |
|---|----------|-------|-------------|--------|
| 1 | `workspace-summary.md` | 429 | discovery-agent | ✅ Consumed |
| 2 | `reference-summary.md` | 597 | discovery-agent | ✅ Consumed |
| 3 | `requirements.md` | 362 | requirements-agent | ✅ Consumed |
| 4 | `implementation-decisions.md` | 1268 | architecture-agent | ✅ Consumed |
| 5 | `testing-decisions.md` | 1006 | architecture-agent | ✅ Consumed |

**Total lines consumed:** 3,662

---

## Completeness Check

| Spec Section | Sourcing Artifact | Covered? |
|-------------|-------------------|----------|
| Problem Statement | `requirements.md` (ll. 3-19) | ✅ |
| Solution | `requirements.md` (ll. 23-53) | ✅ |
| User Stories | `requirements.md` (ll. 57-173) | ✅ (73 stories) |
| Implementation Decisions | `implementation-decisions.md` (ll. 1-1268) | ✅ (13 ADRs, contracts, schemas, data flows) |
| Testing Decisions | `testing-decisions.md` (ll. 1-1006) | ✅ (8 seams, 3 test levels, E2E matrix, limitations) |
| Out of Scope | `requirements.md` (ll. 243-271) | ✅ (21 items across 3 categories) |
| Further Notes | `requirements.md` (ll. 318-358); `workspace-summary.md` (ll. 408-429) | ✅ (8 notes + 5 open questions) |

**All 7 required sections are covered.** No blocking issues.

---

## Deduplications Performed

| Content | Duplicate Sources | Canonical Source | Action |
|---------|------------------|-----------------|--------|
| **Tech stack table** | workspace-summary §3, reference-summary §1, implementation-decisions §7 | workspace-summary (v3.0.2 comparison) | Kept workspace-summary as reference; used implementation-decisions for dependency-specific decisions |
| **ADR summaries** | workspace-summary §7 (table), implementation-decisions §1 (full ADRs) | implementation-decisions §1–11 | Used full ADR log from implementation-decisions; removed the summary table from workspace-summary |
| **Template architecture** | workspace-summary §5 (diagram), requirements (Solution prose), implementation-decisions §3, §4, §8 | implementation-decisions §8 (`.template` suffix convention) | Normalized to implementation-decisions §8 convention; added template variable table |
| **Testing strategy** | workspace-summary §6, reference-summary §3, testing-decisions (entire document) | testing-decisions | Used testing-decisions as canonical; omitted duplicate E2E combo lists from other artifacts |
| **Out of scope** | requirements.md (Out of Scope), workspace-summary §5 (Deno dropped), implementation-decisions §6 | requirements.md | Used requirements.md as canonical; removed duplicate references from other sections |
| **create-vite patterns** | workspace-summary §10, reference-summary §2.1, implementation-decisions (ADR-001, ADR-010, ADR-011) | reference-summary §2.1 (detailed), implementation-decisions (architectural impact) | De-duplicated into a single architectural note in implementation decisions section |
| **Error handling** | requirements.md (Edge Cases 45 items), implementation-decisions §10 | implementation-decisions §10 | Used implementation-decisions for implementation-level error handling; requirements.md for user-facing error stories |
| **Ink testing issues** | reference-summary §3.4, workspace-summary §6, requirements.md (Further Notes), testing-decisions §9 | testing-decisions §9 | Consolidated into a single note in Further Notes section |

---

## Terminology Normalization

| Term Variants | Normalized To | Reason |
|---------------|---------------|--------|
| `Linter` / `Linter/Formatter` / `Linter and Formatter` | **linter/formatter** | Most descriptive; matches UX label |
| `precommit` / `Pre-commit` / `Pre-commit hooks` / `Pre-commit hook` | **pre-commit hooks** (prose), `precommit` (code type) | Clear and unambiguous |
| `--no-interactive` / `non-interactive mode` / `non-interactive` | **non-interactive mode** (conceptual), **`--no-interactive`** (flag reference) | Distinguishes concept from flag |
| `User` / `Developer` / `End-user` | **developer** (person using tool), **user** (of the scaffolded CLI app) | User stories consistently use "developer" |
| `WizardState` / `wizard state` / `Wizard state` | **`WizardState`** (code font for type), **wizard state** (prose) | Follows code convention |
| `Config generators` / `Config file generators` / `Generated config files` | **config generators** | Standardized in ADR-004 and testing seams |
| `Template engine` / `Template rendering` / `Template substitution` | **template substitution** | Matches ADR-006 and module name |
| `<% VAR %>` / `<% VARIABLE %>` | **`<% VAR %>`** | Matches regex pattern in ADR-006 |
| `Runtime` / `runtime` / `target runtime` | **runtime** (lowercase prose) | Consistent across artifacts |
| `Scaffolding tool` / `Scaffolder` / `create-ink-app` | **scaffolding tool** (generic), **`@xzy-ai/create-ink-app`** (specific) | Distinguishes concept from package name |

---

## Cross-Reference Resolutions

| Reference | Source Artifact | Target | Status |
|-----------|----------------|--------|--------|
| ADR-009 (Runtime) ↔ Test framework decision | implementation-decisions §1, testing-decisions §2 | Node→vitest, Bun→bun:test | ✅ Consistent |
| S5 (scaffold engine seam) ↔ `scaffold.ts` | testing-decisions §1, implementation-decisions §2 | Both reference `src/scaffold.ts` | ✅ Consistent |
| S1 (config generators) ↔ ADR-004 | testing-decisions §1, implementation-decisions §1 | Both reference `src/config-generators/*` | ✅ Consistent |
| S2 (template substitution) ↔ ADR-006 | testing-decisions §1, implementation-decisions §1 | Both reference `src/template-substitution.ts` | ✅ Consistent |
| `createState()` fixture ↔ `WizardState` type | testing-decisions §3, implementation-decisions §3 | Fixture shape matches `WizardState` | ✅ Consistent |
| `runWizard()` function ↔ `wizard.ts` | testing-decisions §3 (S6), implementation-decisions §2 | Both reference `src/wizard.ts` | ✅ Consistent |
| E2E combo list ↔ Runtime-specific differences table | testing-decisions §7, implementation-decisions §9 | Combos cover all 2×2×3×3 matrix | ✅ Consistent |
| `compat.json` shape (tool) ↔ `compat.json` shape (output) | implementation-decisions §4 | Two schemas documented; tool has version mapping, output records generated state | ✅ Consistent |
| `tempy` in devDeps ↔ `tempy` in testing fixtures | implementation-decisions §7, testing-decisions §6 | Both reference `tempy` for temp directories | ✅ Consistent |

---

## Consistency Issues Found

The following issues were identified during assembly. None are blocking, but they should be addressed:

1. **Ink version resolution: v6+ vs v7** — The requirements and workspace summary consistently refer to "Ink v6+" as the baseline, while `compat.json` in implementation-decisions specifies `"^7.0.0"`. The Further Notes section in requirements acknowledges this and says to use the latest stable version. This is acceptable as a policy rather than a contradiction, but implementers should confirm the exact Ink version at release time.

2. **Template naming convention inconsistency (within implementation-decisions)** — Section 4 (Template Directory Schema) lists output filenames without `.template` suffix (e.g., `cli.tsx`), while Section 8 (Template Architecture) explicitly shows source filenames with `.template` suffix (e.g., `cli.tsx.template`). The Section 8 convention (`.` suffix) is the authoritative version and was used in the assembled spec. Implementers should follow the `.template` convention consistently.

3. **`bun.lock` in `.gitignore` uncertainty** — The runtime-specific differences table (implementation-decisions §9) notes that `bun.lock` should be in `.gitignore` but includes a comment that "bun.lock is checked in by convention — see note." This unresolved uncertainty should be resolved before implementation. Recommended: check in `bun.lock` (do NOT add to `.gitignore`), matching Bun's convention.

4. **`--dry-run` flag in interface but not in requirements** — The `CliFlags` interface (implementation-decisions §3) includes `'dry-run'?: boolean`, but the requirements and user stories never discuss `--dry-run`. This was added ad-hoc by the architecture agent. It is reserved for future use but should be noted as an unscoped addition.

5. **Node.js version target ambiguity** — Workspace summary says Node ≥20, Further Notes in requirements says Node ≥24, and implementation-decisions uses `">=20"` in the generated `package.json`. The Further Notes clarifies this as "recommended v24, minimum ≥20", which is consistent. Implementers should ensure the scaffolded project sets `engines.node = ">=20"` while documentation recommends v24.

---

## Modifications Made During Assembly

1. **User stories renumbered**: Original requirements.md had numbered user stories (1-73). These were converted to bullet points in the assembled spec to prevent confusion between requirement IDs and UI numbering.

2. **Edge cases from requirements omitted from spec body**: The 45 detailed edge case items from requirements.md were not reproduced verbatim in the spec. They informed the Implementation Decisions (especially ADR-013 validation and §10 error handling) and Testing Decisions, but are best maintained as test case specifications rather than spec prose.

3. **Code snippets removed**: The following code snippets from upstream artifacts were removed from the final spec because they encode implementation details rather than architectural decisions:
   - Template substitution implementation function (just a regex replace)
   - Scaffold engine algorithm pseudocode (prose summary sufficient)
   - Post-scaffold `outro()` display function (pattern clear from ADR-007 prose)
   - Package manager install `execa` integration (standard pattern)
   - Signal handler implementation (standard Node.js pattern)
   - Test code patterns (test implementations, not decisions)
   - Config generator test patterns (the contract is what matters)

4. **Code snippets retained** (encode precise decisions):
   - `WizardState` interface — central data contract
   - `CliFlags` interface — user-facing API contract
   - `ScaffoldResult` interface — scaffold engine return contract
   - `FileEntry` + `ConfigGenerator` types — config generator contract
   - `compat.json` schemas (tool + output) — version policy encoding
   - Exit codes table — error handling contract

5. **Known Ink testing issues consolidated**: The same 4 issues (stdin.write, ANSI stripping, unmount cleanup, async rendering) appeared in workspace-summary, reference-summary, requirements, and testing-decisions. Consolidated into a single note in Further Notes. The authoritative testing decisions §9 is referenced for the full discussion.

6. **Template variable table added**: The list of supported template variables (`PROJECT_NAME`, `BINARY_NAME`, `RUNTIME`, `INK_VERSION`, `REACT_VERSION`) was extracted from ADR-006 prose into a clear table in the Implementation Decisions section.

---

## Output Files

| File | Path | Status |
|------|------|--------|
| **spec.md** | `_xzy-ai/sprints/spec-create-ink-app-scaffold/spec.md` | ✅ Written |
| **assembler-report.md** | `_xzy-ai/sprints/spec-create-ink-app-scaffold/specs/assembler-report.md` | ✅ Written |

---

## Recommendations for Downstream

1. **Resolve the `bun.lock` in `.gitignore` ambiguity** before implementation begins. Confirm whether `bun.lock` should be checked in (Bun convention) or gitignored.

2. **Confirm exact Ink version at release time** — The spec targets "Ink v6+" but `compat.json` references `^7.0.0`. Verify the latest stable Ink version and update `compat.json` accordingly.

3. **Decide on `--dry-run` support** — The flag is reserved in the `CliFlags` interface but not specified in requirements. Either implement it or remove the flag definition.

4. **Create formal ADR documents** from the ADR log in this spec, as recommended by the workspace-summary. The 13 ADRs in the Implementation Decisions section capture the key architectural decisions and should be extracted to standalone ADR files.

5. **Add a Windows CI matrix** to catch cross-platform path issues early. The testing-decisions note this gap.

6. **Resolve the 5 open questions in Further Notes** before or during implementation sprint planning.

---

*Report generated by specification-assembler for the `generate-engineering-specs` skill. Backlog: `spec-create-ink-app-scaffold`.*
