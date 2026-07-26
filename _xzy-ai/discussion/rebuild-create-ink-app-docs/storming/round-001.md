# Brainstorming Round 001: Gap Analysis

**Topic:** Rebuild `.docs/create-ink-app` Documentation
**Date:** 2026-07-26
**Agent:** discussion-brainstormer v0.0.1
**Status:** 16 gaps identified, 4 critical, 7 high, 5 medium

---

## Executive Summary

The discussion transcript covers 9 well-structured questions and answers covering scope, tooling, wizard flow, template strategy, testing, and distribution. However, cross-referencing the transcript against the existing codebase (`.docs/create-ink-app`, an Ink v4 / React 18 / Node ≥16 scaffolding tool from 2023) and industry patterns reveals significant gaps in critical areas — particularly around **cross-runtime compatibility assumptions**, **template rendering specifics**, **unresolved decision branches**, and **operational concerns**. The most critical issue is that Ink's fundamental dependency on Node.js internals has not been validated against Bun and Deno, which could invalidate the entire multi-runtime premise.

---

## 🔴 CRITICAL GAPS (Must Resolve Before Implementation)

### GAP-001: Ink Runtime Compatibility Is Unproven (CRITICAL)

**Severity:** 🔴 Blocks multi-runtime architecture  
**Transcript ref:** Q1, Q2, Q6  
**What's missing:** The transcript assumes Ink apps can run on all three runtimes (Node.js, Bun, Deno), but **this has never been validated**.

**Evidence:**
- Ink is built on `react-reconciler` and directly manages Node.js `process.stdout`, `process.stdin`, and `process.stderr` via the `node:stream` module.
- Ink v4/v5 use `node:process` imports and `node:events` (EventEmitter).
- Deno does not have full Node.js compatibility. Deno's `node:` compat layer covers common APIs but stream handling and TTY detection are known weak points.
- Bun has strong Node.js compatibility, but Ink's use of raw file descriptors (`process.stdout.write`) and `isTTY` may behave differently.

**Questions to resolve:**
1. Has Ink v4 or v5 been tested under Deno? Does it render correctly?
2. Has Ink v4 or v5 been tested under Bun? Are there known issues?
3. If incompatibilities exist, should the wizard prompt a warning when selecting certain runtime+Ink combinations?
4. Should the Deno runtime option be dropped if Ink doesn't work reliably on Deno?
5. Should the project build a runtime abstraction layer to normalize `stdout`/`stdin` access across runtimes?

---

### GAP-002: Package Name / Branding Ambiguity (CRITICAL)

**Severity:** 🔴 Confuses product identity  
**Transcript ref:** Q1, Q9  
**What's missing:** The scaffolding tool is named `create-bun-ink-app` but claims compatibility with **Node.js, Deno, and Bun**. This creates inherent branding confusion.

**Evidence:**
- The package name says "bun" but the tool generates apps for three runtimes.
- The old project was `create-ink-app` (Node-only, npm-only).
- If the tool is truly cross-runtime, shouldn't it be named `create-ink-app` (v4) or something runtime-agnostic like `create-ink-app`?
- If it's primarily Bun tooling that can also target other runtimes, the naming might still mislead users looking for a Node.js scaffold.

**Decision branches to resolve:**
1. Is `create-bun-ink-app` Bun-only or tri-runtime? (The transcript says tri-runtime in Q1, but the name says Bun.)
   - **Branch A:** Bun-only tool that scaffolds for all runtimes → name is misleading, should rename.
   - **Branch B:** Tri-runtime tool → "bun" in the name is inaccurate.
   - **Branch C:** Bun-first, others secondary → clarify positioning.
2. If the name changes, what to rename to? `create-ink-app` (take over the old npm name)? `create-ink-app-v4`? `create-ink-app-next`? `create-ink-starter`?

---

### GAP-003: Deno Template Strategy Is Not Defined (CRITICAL)

**Severity:** 🔴 Deno integration is undefined  
**Transcript ref:** Q1, Q6, Q7  
**What's missing:** Deno has a fundamentally different project structure than Node.js — no `package.json`, no `node_modules`, uses URL imports and `deno.json` / `deno.jsonc`. The hybrid template architecture (base template + programmatic config generation) assumes a Node.js-style `package.json` world.

**Evidence:**
- The original templates all use `package.json` for dependencies, scripts, and tool config.
- Deno uses `deno.json` for tasks, `deno.jsonc` for compiler options, import maps for dependency management.
- Deno permissions (`--allow-read`, `--allow-write`, etc.) are required to run Ink apps but are never mentioned.
- The 11-step wizard includes "package manager" (step 3), but Deno doesn't use npm/pnpm/yarn/bun as package managers.

**Questions to resolve:**
1. For a Deno scaffold: what is the project root config file? `deno.json`? `deno.jsonc`? Or `package.json` (using `deno install`)?
2. How are dependencies declared in a Deno scaffold? URL imports? Import maps? `npm:` specifiers?
3. What permissions does a scaffolded Deno Ink app need? Are they pre-configured in a `deno.json`?
4. What does "package manager" mean for Deno in step 3 of the wizard? Skip the question? Default to `deno`?
5. Does the build step concept apply to Deno (which runs TypeScript natively)?

---

### GAP-004: Ink Version Selection Matrix Is Undefined (CRITICAL)

**Severity:** 🔴 Blocks wizard step 6  
**Transcript ref:** Q6 (step 6: Ink version), Q7  
**What's missing:** The wizard offers "Ink version" as a choice, but the transcript never discusses what versions will be offered or what the compatibility matrix looks like with other choices.

**Evidence:**
- Ink v4 uses React 18, Ink v5 uses React 18/19.
- The transcript mentions Ink v5's `stdin.write()` bug in testing (from research).
- No discussion of which Ink versions are compatible with which runtime+React+testing combinations.

**Questions to resolve:**
1. What Ink versions will be offered? v4? v5? Latest only?
2. What React versions correspond to each Ink version?
3. Does Ink v5 work with Bun and Deno? Does Ink v4?
4. Should the Ink version be auto-selected based on the runtime choice instead of being a separate question?
5. What happens if the user chooses "Ink v4" + "Deno"? Is that validated?

---

## 🟠 HIGH-PRIORITY GAPS (Should Resolve Before Implementation)

### GAP-005: Linter and Formatter Choices Are Not Specified

**Severity:** 🟠 Blocks wizard steps 7-8  
**Transcript ref:** Q6 (steps 7-8)  
**What's missing:** The wizard offers "linter" (step 7) and "formatter" (step 8) choices, but the actual tool options are never discussed.

**Questions to resolve:**
1. Which linters will be offered? ESLint (flat config)? Biome? xo (old style is deprecated)? None?
2. Which formatters will be offered? Prettier? Biome? dprint? None?
3. If both ESLint and Prettier are chosen, should the template include `eslint-config-prettier`?
4. Should Biome be offered as a combined linter+formatter (one step instead of two)?
5. What is the default selection if the user skips the question?
6. Are these choices independent per runtime, or consistent across all runtimes? (Biome works with all three. ESLint is Node/Node-compat only.)

---

### GAP-006: Pre-commit Hook Tooling Is Not Specified

**Severity:** 🟠 Blocks wizard step 9  
**Transcript ref:** Q6 (step 9: pre-commit hooks)  
**What's missing:** The wizard offers "pre-commit hooks" but doesn't specify which tool or configuration will be used.

**Questions to resolve:**
1. Which pre-commit hook tool? Husky? lefthook? simple-git-hooks?
2. What hooks run by default? lint-staged? full lint? tests?
3. Should pre-commit hooks be conditional on having a linter/formatter selected?
4. How does the hook configuration differ across runtimes?

---

### GAP-007: CI/CD Provider Choices Are Not Specified

**Severity:** 🟠 Blocks wizard step 10  
**Transcript ref:** Q6 (step 10: CI/CD)  
**What's missing:** The wizard offers "CI/CD" but doesn't specify providers or what the generated CI config includes.

**Questions to resolve:**
1. Which CI providers? GitHub Actions only? GitLab CI? CircleCI? All?
2. What does the CI workflow include? `npm test`? `npm run build`? Multi-runtime matrix testing?
3. Does the CI config differ based on other wizard choices (runtime, linter, test framework)?
4. Should CI/CD be optional? What if the user says "none"?

---

### GAP-008: Test Framework Integration Details Are Missing

**Severity:** 🟠 Affects template correctness  
**Transcript ref:** Q8  
**What's missing:** The transcript says Node→vitest, Bun→bun:test, Deno→deno test, but doesn't explain how `ink-testing-library` integrates with each.

**Evidence:**
- `ink-testing-library` is a Node.js package published to npm.
- Bun's `bun:test` has good Node.js compat — `ink-testing-library` likely works.
- Deno's `deno test` can use npm packages via `npm:` specifiers or CDN imports. Does `ink-testing-library` work via these paths?
- The transcript mentions Ink v5's `stdin.write()` bug — does this affect all runtimes or just Node.js?

**Questions to resolve:**
1. Has `ink-testing-library` been tested with `bun:test`?
2. Has `ink-testing-library` been tested with `deno test`?
3. If not compatible, is there a runtime-specific testing workaround or adapter?
4. Is `ink-testing-library` always bundled as a dependency, or is it conditional on test framework choice?
5. Who maintains `ink-testing-library`? Is it actively updated for Ink v5?

---

### GAP-009: "Package Manager" Step Inconsistency Across Runtimes

**Severity:** 🟠 Affects UX flow  
**Transcript ref:** Q6 (step 3: package manager)  
**What's missing:** Step 3 assumes a Node.js-style package manager world, but Deno doesn't use any of the offered options (npm/pnpm/yarn/bun).

**Questions to resolve:**
1. For Deno scaffolds: should step 3 be skipped entirely, or replaced with "dependency management approach" (deno.land/x, npm:, import maps)?
2. Does the "package manager" choice affect only the scaffold-time `install` command, or does it change the generated project structure?
3. If the user picks Deno + npm as package manager, does that mean the scaffold uses `deno install`? Or `npm install` in a hybrid setup?
4. Should the package manager question be gated behind runtime selection? (Only ask for Node.js/Bun, skip for Deno.)

---

### GAP-010: Non-Interactive Mode / CI Agent Support

**Severity:** 🟠 Blocks automated use cases  
**Transcript ref:** Q3 (create-vite patterns), Q6  
**What's missing:** create-vite supports `--no-interactive`, `@vercel/detect-agent`, and TTY detection. The transcript mentions these as research findings but never specifies whether the new tool will implement them.

**Questions to resolve:**
1. Will the new tool support `--no-interactive` / `--yes` flags for CI/CD use?
2. Will `@vercel/detect-agent` be used to auto-detect non-interactive environments?
3. How are all 11 wizard steps handled in non-interactive mode? Default values? Fail? CLI flags for each?
4. In non-interactive mode, are there minimum required flags (e.g., `--project-name`) or comprehensive defaults?

---

## 🟡 MEDIUM-PRIORITY GAPS (Should Discuss Before Finalizing)

### GAP-011: Template Rendering / Placeholder Engine

**Severity:** 🟡 Implementation detail  
**Transcript ref:** Q7  
**What's missing:** The original used `%NAME%` string substitution via `replace-string`. The new system needs a placeholder strategy.

**Questions to resolve:**
1. What template variable syntax? `{{NAME}}`? `<%= NAME %>`? `%NAME%` (keep)?
2. Is a template engine library needed (e.g., EJS, Handlebars, mustache) or is simple string replacement sufficient?
3. What variables need substitution across templates? Project name, package name, Ink version, React version, tool versions, etc.
4. For programmatic config generation (eslint.config.js, biome.json, etc.), is the approach:
   - Plain string templates with placeholders?
   - Programmatic object generation (generate JS objects and serialize)?
   - Mix of both?

---

### GAP-012: Post-Scaffold User Experience

**Severity:** 🟡 UX polish  
**Transcript ref:** Q6 (install step), Q9  
**What's missing:** The original create-ink-app displayed instructions after scaffolding. The new tool needs defined post-scaffold output.

**Questions to resolve:**
1. What success message is displayed after scaffolding?
2. Does the tool auto-start the dev server (like create-vite's `--immediate`)?
3. Are post-scaffold instructions runtime-aware? (Different instructions for `cd my-app && bun dev` vs `cd my-app && npm run dev` vs `cd my-app && deno task dev`?)
4. Is there a summary of what was scaffolded (list of chosen options)?

---

### GAP-013: Existing Directory Handling / Overwrite Behavior

**Severity:** 🟡 Edge case  
**Transcript ref:** Q3 (mentions create-vite's `--overwrite` flag)  
**What's missing:** No decision about what happens when the target directory already exists.

**Questions to resolve:**
1. What happens if the target directory exists and is non-empty?
   - Fail with error?
   - Prompt to overwrite?
   - Add `--overwrite` / `--no-overwrite` flags?
2. If overwriting, what's the merge strategy? Delete and replace? Overlay?
3. Does the tool support scaffolding into the current directory (`.`)?

---

### GAP-014: React Version Strategy

**Severity:** 🟡 Dependency of Ink version  
**Transcript ref:** Q6  
**What's missing:** No discussion of which React versions the templates should support or target.

**Evidence:**
- Original: React 18 (Ink v4)
- Ink v5 can use React 18 or 19
- React 19 is the latest stable as of 2026

**Questions to resolve:**
1. Which React version(s) should templates use? Latest stable? Match Ink version?
2. Should React version be a separate wizard question or auto-derived from Ink version?
3. If React 19 has breaking changes, do templates need to handle both?

---

### GAP-015: Build System Strategy Per Runtime

**Severity:** 🟡 Affects template generation  
**Transcript ref:** Q7  
**What's missing:** The original used Babel (JS) or tsc (TS). The new architecture doesn't define the build pipeline.

**Questions to resolve:**
1. For Node.js scaffolds: use tsc for TS? Babel for JS? esbuild? swc? Bun's transpiler?
2. For Bun scaffolds: use Bun's native transpiler (`bun build`) or tsc for compatibility?
3. For Deno scaffolds: Deno natively runs TS — is a build step needed at all? If so, `deno compile`?
4. Should the "build" script name be consistent across runtimes (`build`) or follow runtime conventions (`bun run build` vs `deno task build`)?
5. What about the `dev` (watch mode) script — runtime-specific or normalized?

---

### GAP-016: Maintenance Burden and Long-Term Strategy

**Severity:** 🟡 Operational risk  
**Transcript ref:** Q7, Q8, Q9  
**What's missing:** No discussion of how this project will be maintained over time given its combinatorial complexity.

**Evidence:**
- 3 runtimes × 2 languages × 2-3 Ink versions × 3+ linters × 3+ formatters × 3 test frameworks × multiple CI options = 500+ possible stack combinations.
- Managing template compatibility across all combinations is a significant burden.
- Version bumps (Ink v6, React 20, new linters) will require coordinated updates.

**Questions to resolve:**
1. What is the deprecation policy for older Ink versions in the wizard?
2. How often should the compatibility matrix be validated?
3. How are version bumps managed? Automated PRs? Manual testing?
4. Is there a mechanism to remove obsolete combinations without breaking existing users?
5. Should the project use a version compatibility table stored in the repo and referenced during generation?

---

## 📋 CROSS-CUTTING CONCERNS

### CC-001: Scaffolding Tool's Own Language

The transcript doesn't explicitly state what language the scaffolding tool itself is written in. create-vite uses TypeScript (single `src/index.ts`). The original create-ink-app used plain JavaScript. Given the project's modernization goals, TypeScript would be the expected choice, but this should be confirmed.

### CC-002: Template Organization

The original had:
```
templates/
  _common/   (shared files)
  js/        (JS template)
  ts/        (TS template)
```

The new hybrid approach (base template + programmatic config) needs a defined directory structure. Where do templates live? How are they organized by runtime? By language? By tool?

### CC-003: Dependency Version Pinning

Should the generated `package.json` use exact versions or semver ranges? create-vite uses `^` (caret) ranges. The original used `^` ranges. However, as of 2026, there's a trend toward lockfiles and exact versioning. This decision affects reproducibility vs flexibility of scaffolded apps.

### CC-004: E2E Testing Scope

The transcript mentions "E2E verification of top 8-10 most common stack combinations" but doesn't specify:
- Which specific combinations are "most common"?
- How is E2E testing structured? Spawn process → scaffold → build → run tests → clean up?
- What CI runner? GitHub Actions? What OS?
- How long does the E2E suite take? Is it practical to run on every PR?

### CC-005: Version Pin Resolution

When the scaffolding tool generates `package.json`, should it resolve dependency versions at scaffold time (pinning the latest compatibles) or leave them as flexible ranges? create-vite pins ranges (e.g., `"react": "^18.2.0"`). The new tool might want to pin exact versions for reproducibility, especially given the cross-runtime compatibility concerns.

---

## 🔍 EDGE CASES AND SPECIAL CONDITIONS

1. **Scaffolding in a restricted environment** — No network access, no `npm install` possible. Should the tool support a `--offline` mode?
2. **Scaffolding as root / admin** — `npm install` with `sudo` or postinstall scripts may behave differently.
3. **Scaffolding with spaces in the path** — Template output paths with spaces must be handled.
4. **Project name scoping** — If the user enters `@scope/my-ink-app`, does the template system handle npm scoped packages correctly?
5. **Scaffolding for monorepo context** — E.g., generating a package within an existing monorepo (no root `package.json` generation).
6. **AI agent detection still needs interactive confirmation** — Even if an AI agent is detected, some prompts may still need explicit values. What's the fallback for missing data?
7. **Deprecated version detection** — If the user selects an Ink version that's been deprecated or has known security issues, should there be a warning?
8. **Cross-platform shebang** — The generated `cli.js`/`cli.tsx` has `#!/usr/bin/env node`. For Bun scaffolds, should it be `#!/usr/bin/env bun`? For Deno, `#!/usr/bin/env deno`?

---

## 🔄 UNRESOLVED DEPENDENCIES

| Depends On | Affects | Description |
|---|---|---|
| GAP-001 (Runtime compat) | GAP-003, GAP-004, GAP-008 | If Ink doesn't work on Deno, entire Deno path is blocked |
| GAP-004 (Ink versions) | GAP-014 (React), GAP-015 (Build) | Ink version drives React version and build strategy |
| GAP-003 (Deno templates) | GAP-009 (Package mgr), GAP-015 (Build) | Deno template structure determines all Deno-specific decisions |
| GAP-005 (Linter) + GAP-006 (Precommit) | GAP-007 (CI/CD) | CI config depends on which tools are selected |
| GAP-002 (Package name) | Everything | Name affects npm publishing, branding, discoverability |

---

## ✅ ACTIONS RECOMMENDED (Priority Order)

1. **GAP-001: Validate Ink cross-runtime compatibility** — Before any more architecture work, test Ink v4 and v5 on Bun and Deno. If it doesn't work, revisit the multi-runtime premise.
2. **GAP-002: Resolve package name** — Decide whether this is `create-bun-ink-app` (Bun-only) or tri-runtime (rename needed).
3. **GAP-003: Define Deno template strategy** — Either commit to Deno support with concrete templates, or drop Deno from scope.
4. **GAP-004: Define Ink version matrix** — Document which Ink + React + Runtime combinations are supported.
5. **GAP-005 + GAP-006 + GAP-007: Specify tool options** — Define the exact lists of linters, formatters, pre-commit tools, and CI providers.
6. **GAP-009: Resolve package manager step for Deno** — Make the wizard flow runtime-aware.
7. **GAP-010: Define non-interactive mode** — Decide on CI/agent support before implementation.
8. **All others** — Resolve during design specification phase.
