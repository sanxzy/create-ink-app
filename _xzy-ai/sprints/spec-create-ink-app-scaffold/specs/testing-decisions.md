# Testing Decisions — `@xzy-ai/create-ink-app`

> **Sprint:** `spec-create-ink-app-scaffold`
> **Date:** 2026-07-26
> **Agent:** architecture-agent (generate-engineering-specs)
> **Status:** Complete

---

## Table of Contents

1. [Testing Seam Analysis](#1-testing-seam-analysis)
2. [Seam Prioritization](#2-seam-prioritization)
3. [Testing Strategy per Seam](#3-testing-strategy-per-seam)
4. [Test Levels & Scope](#4-test-levels--scope)
5. [Tooling Choices](#5-tooling-choices)
6. [Test Data Strategy](#6-test-data-strategy)
7. [E2E Matrix Testing](#7-e2e-matrix-testing)
8. [Rejected Seam Alternatives](#8-rejected-seam-alternatives)
9. [Known Testing Limitations & Mitigations](#9-known-testing-limitations--mitigations)

---

## 1. Testing Seam Analysis

### Testing Seam Principles

For the `@xzy-ai/create-ink-app` scaffolding tool, we identify testing seams at natural module boundaries. The ideal seam is one that provides the **highest confidence per test execution** — meaning it tests the core logic (file generation, template substitution, config generation) without requiring expensive E2E runs.

The scaffolding tool's architecture naturally provides these seams:

### Seam S1: Config Generators (Pure Function Boundary)

| Property | Value |
|----------|-------|
| **Name** | `config-generators` |
| **Type** | unit-test / pure-function |
| **Location** | `src/config-generators/*.ts` (each file) |
| **Boundary** | Input: `WizardState` → Output: `FileEntry \| null` |
| **Isolates** | Config generation from filesystem, templates, and flags |
| **What it tests** | Each generator produces correct file content for every WizardState permutation |
| **Blind spots** | Does not verify files are actually written to disk; does not verify template substitution |
| **Effort** | Low — each generator is a pure function; 8 generators × ~4 test cases each = ~32 unit tests |
| **Confidence gain** | High — config files represent ~50% of scaffolded project content |

### Seam S2: Template Substitution Engine

| Property | Value |
|----------|-------|
| **Name** | `template-substitution` |
| **Type** | unit-test / pure-function |
| **Location** | `src/template-substitution.ts` |
| **Boundary** | Input: `(content: string, variables: Record<string, string>)` → Output: `string` |
| **Isolates** | Variable replacement logic from filesystem and templates |
| **What it tests** | Correct replacement of `<% VAR %>`; edge cases (missing vars, binary exclusion, escaped sequences) |
| **Blind spots** | Does not verify that template files exist or have correct content; does not test file I/O |
| **Effort** | Very low — single function, ~8 test cases |
| **Confidence gain** | Medium — critical correctness but simple logic |

### Seam S3: Validation Functions

| Property | Value |
|----------|-------|
| **Name** | `validation` |
| **Type** | unit-test / pure-function |
| **Location** | `src/validate.ts` |
| **Boundary** | Input: `(name: string) → ValidationError \| null` |
| **Isolates** | Name validation, directory validation from I/O |
| **What it tests** | All npm naming rules, edge cases (scoped names, unicode, length limits) |
| **Blind spots** | Directory writability checks require real filesystem (handled in S5) |
| **Effort** | Low — ~15 test cases |
| **Confidence gain** | Medium — prevents invalid project names from reaching scaffold |

### Seam S4: Environment Detection

| Property | Value |
|----------|-------|
| **Name** | `environment-detection` |
| **Type** | unit-test / mock |
| **Location** | `src/detect.ts` |
| **Boundary** | Input: mocked `process.env`, `process.stdin`, `@vercel/detect-agent` result |
| **Isolates** | Detection logic from real environment |
| **What it tests** | Package manager parsing from `npm_config_user_agent`; TTY detection; agent detection fallback |
| **Blind spots** | Does not test actual `@vercel/detect-agent` integration (separate package tests) |
| **Effort** | Low — ~10 test cases |
| **Confidence gain** | Medium — prevents mis-detection in CI/agent scenarios |

### Seam S5: Scaffold Engine (Filesystem Boundary)

**This is the highest-value single seam.**

| Property | Value |
|----------|-------|
| **Name** | `scaffold-engine` |
| **Type** | integration-test |
| **Location** | `src/scaffold.ts` (with `tempy` for temp directories) |
| **Boundary** | Filesystem (real temp directory) + mocked `execa` |
| **Isolates** | Tests all file creation, template copying, substitution, and config generation against a real filesystem |
| **What it tests** | |
| | - Correct template directory selected for each runtime × language |
| | - All files created with correct paths |
| | - `<% VAR %>` substituted correctly in output files |
| | - Config generators produce correct files |
| | - package.json has correct structure for all permutations |
| | - Binary files excluded from substitution |
| | - Error handling (missing template, unwritable dir, etc.) |
| **Blind spots** | Does not test `execa` integration (mock prevents actual install); does not test CLI entry point; does not test interactive prompts |
| **Effort** | Medium — scaffold a fixture for each of ~8 representative combinations; ~40-60 test cases total |
| **Confidence gain** | **Highest** — directly validates the tool's core output: files on disk |

### Seam S6: Wizard State Construction (Interactive)

| Property | Value |
|----------|-------|
| **Name** | `wizard-state` |
| **Type** | integration-test / mock |
| **Location** | `src/wizard.ts` + `src/resolve-args.ts` |
| **Boundary** | Mocked `@clack/prompts` responses; mocked `process.argv` |
| **Isolates** | Prompt flow from actual terminal I/O |
| **What it tests** | Correct state constructed from mock prompt responses; cancellation handling; validation integration |
| **Blind spots** | Does not test actual terminal rendering or keyboard input |
| **Effort** | Medium — mocking `@clack/prompts` is non-trivial; ~10 scenarios |
| **Confidence gain** | Medium-high — validates that the wizard produces correct WizardState |

### Seam S7: CLI Entry Point (End-to-End Orchestration)

| Property | Value |
|----------|-------|
| **Name** | `cli-entry` |
| **Type** | integration-test |
| **Location** | `src/index.ts` |
| **Boundary** | Mocked `argv`, captured stdout/stderr, temp directory for output |
| **Isolates** | Full orchestration flow from flags to file output |
| **What it tests** | End-to-end: argv → environment detection → state construction → scaffold → success message |
| **Blind spots** | Does not test real `@clack/prompts` rendering; does not test real `execa` install |
| **Effort** | High — requires careful mocking of all I/O boundaries |
| **Confidence gain** | High — validates the entire orchestration without E2E cost |

### Seam S8: E2E Matrix (Real Scaffold + Build)

| Property | Value |
|----------|-------|
| **Name** | `e2e-matrix` |
| **Type** | contract-test / e2e |
| **Location** | `test/e2e/` — full workflow tests |
| **Boundary** | Real subprocess: scaffold → install → build → test |
| **Isolates** | Nothing — tests the full tool against real package registries |
| **What it tests** | Tool runs successfully; generated project builds; generated project tests pass |
| **Blind spots** | None (within scope) — but only samples a limited number of combinations |
| **Effort** | High — each combination takes 1-5 minutes; requires CI infrastructure |
| **Confidence gain** | **Ultimate validation** — but expensive, so reserved for CI and critical combinations |

---

## 2. Seam Prioritization

### Prioritization Matrix

Priority determined by: **Confidence Gain ÷ Effort** (highest ratio first)

| Rank | Seam | Confidence | Effort | Ratio | Recommendation |
|------|------|-----------|--------|-------|---------------|
| **1** | **S5: scaffold-engine** | ★★★★★ | Medium | **Best** | **Run on every commit (unit test suite)** |
| **2** | **S1: config-generators** | ★★★★☆ | Low | **Excellent** | **Run on every commit (unit test suite)** |
| **3** | **S2: template-substitution** | ★★★☆☆ | Very Low | **Excellent** | **Run on every commit** |
| **4** | **S3: validation** | ★★★☆☆ | Low | **Excellent** | **Run on every commit** |
| **5** | **S4: environment-detection** | ★★★☆☆ | Low | **Good** | **Run on every commit** |
| **6** | **S6: wizard-state** | ★★★★☆ | Medium | **Good** | **Run on every commit** |
| **7** | **S7: cli-entry** | ★★★★☆ | High | **Moderate** | **Run on PRs (CI)** |
| **8** | **S8: e2e-matrix** | ★★★★★ | Very High | **Lower** | **Run in CI (nightly or pre-release)** |

### Why S5 (scaffold-engine) Is the Highest-Value Seam

1. **Tests the core product**: The scaffolding tool's primary job is creating correct files on disk. S5 directly validates this.
2. **Real filesystem**: Uses `tempy` for temp directories with NO mocking of `fs`. This means we truly verify file creation, content encoding, permissions, and structure.
3. **Covers config generators indirectly**: When scaffold calls config generators, S5 validates their output is written correctly.
4. **Covers template substitution indirectly**: When scaffold copies templates with substitution, S5 validates the output content.
5. **Single mock boundary**: Only `execa` is mocked (preventing actual install commands). Everything else is real.
6. **Fast**: ~100-200ms per scaffold combination with temp directories (no install). 8 combinations = ~1-2 seconds.

### Recommended Test Suite Structure

```
npm test (or vitest run)
├── test/unit/           # S1, S2, S3, S4 — Pure function tests (~65 tests, <1s)
│   ├── config-generators.test.ts
│   ├── template-substitution.test.ts
│   ├── validate.test.ts
│   └── detect.test.ts
│
├── test/integration/    # S5, S6 — Integration tests (~70 tests, 2-5s)
│   ├── scaffold.test.ts
│   └── wizard.test.ts
│
└── test/e2e/            # S7, S8 — Slow tests (separate CI step, 5-30min)
    ├── cli-entry.test.ts
    └── matrix.test.ts
```

---

## 3. Testing Strategy per Seam

### S1: Config Generators Strategy

**Test file:** `test/unit/config-generators.test.ts`

**Approach:** Test each generator function with multiple WizardState inputs. Assert the output `FileEntry` has correct `path` and `content`. For JSON configs, parse and assert structure. For JS configs, use snapshot testing.

**Pattern:**
```typescript
import { describe, test, expect } from 'vitest';
import { generateBiomeConfig } from '../../src/config-generators/biome.js';
import { createState } from '../fixtures/state.js';

describe('biome config generator', () => {
  test('produces biome.json for biome linter choice', () => {
    const state = createState({ linter: 'biome', language: 'typescript', runtime: 'node' });
    const result = generateBiomeConfig(state);

    expect(result).not.toBeNull();
    expect(result!.path).toBe('biome.json');

    const config = JSON.parse(result!.content);
    expect(config.linter.enabled).toBe(true);
    expect(config.formatter.enabled).toBe(true);
    expect(config.formatter.indentStyle).toBe('tab');
  });

  test('returns null for non-biome linter choices', () => {
    const state = createState({ linter: 'eslint-prettier' });
    expect(generateBiomeConfig(state)).toBeNull();

    const state2 = createState({ linter: 'none' });
    expect(generateBiomeConfig(state2)).toBeNull();
  });

  test('TS template has strict typecheck rules', () => {
    const state = createState({ linter: 'biome', language: 'typescript' });
    const config = JSON.parse(generateBiomeConfig(state)!.content);
    expect(config.linter.rules.style.useConst).toBeDefined();
  });
});
```

**Coverage targets:**
- Every generator produces correct output for its trigger condition
- Every generator returns null when its trigger condition is not met
- JSON generators produce valid JSON
- Biome config varies correctly by language (TS extra rules)
- Husky config marks file as executable

**Number of tests:** ~8 generators × 3-5 cases each = ~30 tests

---

### S2: Template Substitution Strategy

**Test file:** `test/unit/template-substitution.test.ts`

**Approach:** Pure function tests for `substituteTemplate()` and `shouldSkipSubstitution()`.

**Pattern:**
```typescript
describe('substituteTemplate', () => {
  const vars = { PROJECT_NAME: 'my-app', BINARY_NAME: 'my-app', RUNTIME: 'node' };

  test('replaces single variable', () => {
    expect(substituteTemplate('const name = "<% PROJECT_NAME %>";', vars))
      .toBe('const name = "my-app";');
  });

  test('replaces multiple occurrences', () => {
    expect(substituteTemplate('<% PROJECT_NAME %> <% PROJECT_NAME %>', vars))
      .toBe('my-app my-app');
  });

  test('leaves unknown variables unchanged', () => {
    expect(substituteTemplate('<% UNKNOWN %>', vars))
      .toBe('<% UNKNOWN %>');
  });

  test('handles content with no variables', () => {
    expect(substituteTemplate('plain text', vars)).toBe('plain text');
  });

  test('handles empty string', () => {
    expect(substituteTemplate('', vars)).toBe('');
  });
});

describe('shouldSkipSubstitution', () => {
  test('skips binary file extensions', () => {
    expect(shouldSkipSubstitution('icon.png')).toBe(true);
    expect(shouldSkipSubstitution('font.woff2')).toBe(true);
  });

  test('does not skip source files', () => {
    expect(shouldSkipSubstitution('app.tsx')).toBe(false);
    expect(shouldSkipSubstitution('cli.js')).toBe(false);
  });

  test('is case-insensitive for extensions', () => {
    expect(shouldSkipSubstitution('image.PNG')).toBe(true);
  });
});
```

**Number of tests:** ~8

---

### S3: Validation Strategy

**Test file:** `test/unit/validate.test.ts`

**Approach:** Pure function tests for all `validateProjectName` rules and edge cases.

**Pattern:**
```typescript
describe('validateProjectName', () => {
  const validNames = ['my-app', 'test', 'a', '@scope/my-app', 'my-app-v2'];
  const invalidNames = [
    ['', 'EMPTY_NAME'],
    ['   ', 'INVALID_CHARS'],
    ['.hidden', 'LEADING_DOT'],
    ['_internal', 'LEADING_UNDERSCORE'],
    ['UPPERCASE', 'INVALID_CHARS'],
    ['has space', 'INVALID_CHARS'],
    ['a'.repeat(215), 'TOO_LONG'],
    ['special!chars', 'INVALID_CHARS'],
  ];

  test.each(validNames)('accepts valid name: %s', (name) => {
    expect(validateProjectName(name)).toBeNull();
  });

  test.each(invalidNames)('rejects invalid name: %s with code %s', (name, code) => {
    const error = validateProjectName(name);
    expect(error).not.toBeNull();
    expect(error!.code).toBe(code);
  });
});
```

**Number of tests:** ~15

---

### S4: Environment Detection Strategy

**Test file:** `test/unit/detect.test.ts`

**Approach:** Mock `process.env.npm_config_user_agent` and test detection logic.

**Pattern:**
```typescript
describe('detectPackageManager', () => {
  beforeEach(() => {
    delete process.env.npm_config_user_agent;
  });

  test('detects npm', () => {
    process.env.npm_config_user_agent = 'npm/10.0.0';
    expect(detectPackageManager().name).toBe('npm');
  });

  test('detects pnpm', () => {
    process.env.npm_config_user_agent = 'pnpm/9.0.0';
    expect(detectPackageManager().name).toBe('pnpm');
  });

  test('detects yarn', () => {
    process.env.npm_config_user_agent = 'yarn/4.0.0';
    expect(detectPackageManager().name).toBe('yarn');
  });

  test('detects bun', () => {
    process.env.npm_config_user_agent = 'bun/1.1.0';
    expect(detectPackageManager().name).toBe('bun');
  });

  test('defaults to npm when env not set', () => {
    expect(detectPackageManager().name).toBe('npm');
  });

  test('defaults to npm for unknown agents', () => {
    process.env.npm_config_user_agent = 'unknown/1.0.0';
    expect(detectPackageManager().name).toBe('npm');
  });
});
```

**Number of tests:** ~10

---

### S5: Scaffold Engine Strategy (HIGHEST VALUE)

**Test file:** `test/integration/scaffold.test.ts`

**Approach:** Use `tempy` for real temp directories. Mock only `execa` (to prevent install). Call `scaffold()` with various WizardState fixtures and assert files on disk.

**Pattern:**
```typescript
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { scaffold } from '../../src/scaffold.js';
import { createState } from '../fixtures/state.js';
import tempy from 'tempy';

// Mock execa to prevent actual install commands
vi.mock('execa');

describe('scaffold engine', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = tempy.directory();
    vi.resetAllMocks();
  });

  test('creates all expected files for Node + TS + Biome scaffold', async () => {
    const state = createState({
      projectName: 'test-app',
      projectDirectory: path.join(tmpDir, 'test-app'),
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      precommit: 'lefthook',
    });

    const result = await scaffold(state);

    expect(result.filesCreated).toBeGreaterThan(5);

    // Core source files
    expect(fs.existsSync(path.join(tmpDir, 'test-app', 'source', 'app.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'test-app', 'source', 'cli.tsx'))).toBe(true);

    // Config files
    expect(fs.existsSync(path.join(tmpDir, 'test-app', 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'test-app', 'biome.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'test-app', 'vitest.config.ts'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'test-app', 'lefthook.yml'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'test-app', 'tsconfig.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'test-app', 'compat.json'))).toBe(true);

    // Shared files
    expect(fs.existsSync(path.join(tmpDir, 'test-app', '.gitignore'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'test-app', '.editorconfig'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'test-app', 'readme.md'))).toBe(true);
  });

  test('template substitution works in cli.tsx', async () => {
    const state = createState({
      projectName: 'test-app',
      projectDirectory: path.join(tmpDir, 'test-app'),
      runtime: 'node',
      language: 'typescript',
    });

    await scaffold(state);
    const cliContent = fs.readFileSync(path.join(tmpDir, 'test-app', 'source', 'cli.tsx'), 'utf-8');

    expect(cliContent).not.toContain('<%');
    expect(cliContent).toContain('test-app');
  });

  test('package.json has correct structure for Node scaffold', async () => {
    const state = createState({
      projectName: 'test-app',
      projectDirectory: path.join(tmpDir, 'test-app'),
      runtime: 'node',
      language: 'typescript',
      linter: 'biome',
      precommit: 'none',
    });

    await scaffold(state);
    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'test-app', 'package.json'), 'utf-8')
    );

    expect(pkg.name).toBe('test-app');
    expect(pkg.engines.node).toBe('>=20');
    expect(pkg.scripts.build).toContain('esbuild');
    expect(pkg.scripts.test).toContain('vitest');
    expect(pkg.dependencies.ink).toBeDefined();
    expect(pkg.dependencies.react).toBeDefined();
    expect(pkg.devDependencies.vitest).toBeDefined();
  });

  test('package.json uses bun build for Bun scaffolds', async () => {
    const state = createState({
      projectName: 'bun-app',
      projectDirectory: path.join(tmpDir, 'bun-app'),
      runtime: 'bun',
      language: 'javascript',
    });

    await scaffold(state);
    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'bun-app', 'package.json'), 'utf-8')
    );

    expect(pkg.scripts.build).toContain('bun build');
    expect(pkg.scripts.test).toContain('bun test');
    expect(pkg.engines).toBeUndefined(); // Bun doesn't set engines.node
  });

  test('scaffold fails with clear error for missing template', async () => {
    // Template for a non-existent combination
    const state = createState({
      projectName: 'test',
      projectDirectory: path.join(tmpDir, 'test'),
      runtime: 'node',
      language: 'typescript',
    });

    // Temporarily move template directory
    // ... (test error handling)

    await expect(scaffold(state)).rejects.toThrow();
  });

  test('handles unwritable directory gracefully', async () => {
    // Skip on CI/root — but demonstrate structure
  });

  test.each([
    ['node', 'typescript'],
    ['node', 'javascript'],
    ['bun', 'typescript'],
    ['bun', 'javascript'],
  ] as const)('scaffolds all runtime × language combos: %s + %s', async (runtime, lang) => {
    const state = createState({ runtime, language: lang, projectDirectory: path.join(tmpDir, `${runtime}-${lang}`) });
    const result = await scaffold(state);

    expect(result.filesCreated).toBeGreaterThan(3);
    expect(result.warnings).toHaveLength(0);
  });
});
```

**Fixture helper:**
```typescript
// test/fixtures/state.ts
import { WizardState } from '../../src/types';

export function createState(overrides: Partial<WizardState> = {}): WizardState {
  return {
    projectName: overrides.projectName ?? 'test-app',
    projectDirectory: overrides.projectDirectory ?? '/tmp/test-app',
    runtime: overrides.runtime ?? 'node',
    packageManager: overrides.packageManager ?? 'npm',
    language: overrides.language ?? 'typescript',
    linter: overrides.linter ?? 'biome',
    testFramework: overrides.runtime === 'bun' ? 'bun:test' : 'vitest',
    precommit: overrides.precommit ?? 'none',
    installDependencies: overrides.installDependencies ?? false,
    overwrite: overrides.overwrite ?? 'ask',
    immediate: overrides.immediate ?? false,
    ...overrides,
  };
}
```

**Coverage targets:**
- All 4 runtime × language combinations scaffold correctly
- All 3 linter choices produce correct config files
- All 3 pre-commit choices produce correct hook files
- package.json matches expectations for all combinations
- Template variables are substituted
- Binary files are not corrupted by substitution
- Error cases: missing template, unwritable directory, invalid path
- Edge case: project with scoped name (`@scope/my-app`)

**Number of tests:** ~40-60 test cases

---

### S6: Wizard State Construction Strategy

**Test file:** `test/integration/wizard.test.ts`

**Approach:** Mock `@clack/prompts` functions. Test the wizard flow produces correct WizardState from a sequence of mock responses.

**Pattern:**
```typescript
import { describe, test, expect, vi } from 'vitest';
import { runWizard } from '../../src/wizard.js';

vi.mock('@clack/prompts', async () => {
  const actual = await vi.importActual('@clack/prompts');
  return {
    ...actual,
    text: vi.fn(),
    select: vi.fn(),
    confirm: vi.fn(),
    isCancel: vi.fn(() => false),
  };
});

describe('wizard flow', () => {
  test('produces correct state from mock responses', async () => {
    const mockPrompts = vi.mocked(prompts);
    mockPrompts.text.mockResolvedValueOnce('my-app');
    mockPrompts.select
      .mockResolvedValueOnce('node')
      .mockResolvedValueOnce('npm')
      .mockResolvedValueOnce('typescript')
      .mockResolvedValueOnce('biome')
      .mockResolvedValueOnce('lefthook');
    mockPrompts.confirm.mockResolvedValueOnce(true);

    const state = await runWizard({ detectedPm: 'npm' });

    expect(state.projectName).toBe('my-app');
    expect(state.runtime).toBe('node');
    expect(state.language).toBe('typescript');
    expect(state.testFramework).toBe('vitest'); // auto-derived from runtime
  });

  test('handles cancellation at any prompt', async () => {
    const mockPrompts = vi.mocked(prompts);
    mockPrompts.text.mockResolvedValueOnce('my-app');
    mockPrompts.select.mockResolvedValueOnce('node');
    mockPrompts.isCancel.mockReturnValueOnce(true); // cancelled at package manager

    await expect(runWizard({ detectedPm: 'npm' })).rejects.toThrow('cancelled');
  });
});
```

**Number of tests:** ~10

---

### S7: CLI Entry Point Strategy

**Test file:** `test/e2e/cli-entry.test.ts`

**Approach:** Run the entry point function with mocked `process.argv`, captured stdout. Assert correct behavior for various flag combinations.

```typescript
// Note: This uses a special test entry that exports the main function.
// It does NOT spawn a subprocess — it calls the function directly with mocked deps.

describe('CLI entry point', () => {
  test('--version prints version', async () => {
    const { main } = await import('../../src/index.js');
    const argv = ['node', 'create-ink-app', '--version'];
    const output = await captureStdout(() => main({ argv }));

    expect(output).toMatch(/\d+\.\d+\.\d+/);
  });

  test('--help shows usage', async () => {
    const { main } = await import('../../src/index.js');
    const argv = ['node', 'create-ink-app', '--help'];
    const output = await captureStdout(() => main({ argv }));

    expect(output).toContain('Usage');
    expect(output).toContain('--runtime');
  });
});
```

**Number of tests:** ~5

---

### S8: E2E Matrix Strategy

**Test file:** `test/e2e/matrix.test.ts`

**Approach:** Create a temp directory, run `npx @xzy-ai/create-ink-app` (or `node dist/index.js`) as a subprocess with specific flag combinations, `cd` into the created directory, run install, run build, run test.

```typescript
import { describe, test, expect } from 'vitest';
import { execa } from 'execa';
import tempy from 'tempy';
import path from 'node:path';

// Only run in CI or with E2E=1 env var
const runE2e = process.env.CI || process.env.E2E;

describe.runIf(runE2e)('E2E matrix', () => {
  const combos = [
    { flags: ['--no-interactive', '--runtime=node', '--language=ts', '--linter=biome', '--precommit=lefthook'] },
    { flags: ['--no-interactive', '--runtime=bun', '--language=ts', '--linter=biome', '--precommit=lefthook'] },
    // ... 6-8 more combos
  ];

  test.each(combos)('scaffolds and builds: %j', async ({ flags }) => {
    const tmpDir = tempy.directory();
    const projectName = `e2e-${Date.now()}`;

    // Scaffold
    await execa('node', ['dist/index.js', projectName, ...flags], { cwd: tmpDir });

    // Verify project directory exists
    const projectDir = path.join(tmpDir, projectName);
    expect(fs.existsSync(path.join(projectDir, 'package.json'))).toBe(true);

    // Install (with timeout)
    await execa('npm', ['install'], { cwd: projectDir, timeout: 5 * 60 * 1000 });

    // Build
    await execa('npm', ['run', 'build'], { cwd: projectDir, timeout: 2 * 60 * 1000 });

    // Test
    await execa('npm', ['test'], { cwd: projectDir, timeout: 2 * 60 * 1000 });
  }, 10 * 60 * 1000); // 10 min timeout per combo
});
```

**Combination priority (test in this order):**
1. Node + TS + Biome + Lefthook **(most popular)**
2. Node + JS + ESLint+Prettier + none
3. Node + TS + none + Husky
4. Bun + TS + Biome + Lefthook
5. Bun + JS + ESLint+Prettier + none
6. Bun + TS + none + none
7. Node + TS + ESLint+Prettier + none
8. Node + JS + Biome + Lefthook

**Number of tests:** 8 combinations, ~5-10 min each = 40-80 min total (run in CI parallel)

---

## 4. Test Levels & Scope

### Unit Tests (`test/unit/`)
- **Scope:** Pure functions only
- **No mocking needed** (pure functions have no I/O)
- **No filesystem access**
- **Coverage:** Config generators, template substitution, validation, environment detection
- **Target:** ~65 tests, <1 second execution

### Integration Tests (`test/integration/`)
- **Scope:** Modules with controlled side effects
- **Mocking:** `execa` only (prevent install)
- **Filesystem:** Real temp directories via `tempy`
- **Coverage:** Scaffold engine (full file output), wizard state construction
- **Target:** ~70 tests, 2-5 seconds execution

### E2E Tests (`test/e2e/`)
- **Scope:** Full workflow from CLI entry point
- **Mocking:** None (real subprocess calls)
- **Filesystem:** Real temp directories
- **Coverage:** CLI behavior (--help, --version), full scaffold matrix (8 combos)
- **Target:** ~13 tests, 5-30 minutes execution (CI only)

### Test Filtering

```json
// package.json scripts
{
  "test": "vitest run",
  "test:unit": "vitest run test/unit",
  "test:integration": "vitest run test/integration",
  "test:e2e": "E2E=1 vitest run test/e2e --timeout=600000",
  "test:quick": "vitest run test/unit test/integration"
}
```

---

## 5. Tooling Choices

### Test Runner: vitest

**Why vitest for the scaffolding tool itself:**
- ESM-native (our scaffolding tool is pure ESM)
- Compatible with `ink-testing-library` if needed
- Built-in mocking (`vi.mock()`, `vi.fn()`)
- Built-in fake timers
- Fast (uses esbuild for transformation)
- Jest-compatible API (familiar for contributors)
- Coverage reports via `@vitest/coverage-v8`

**Config:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/types.ts'], // types only
    },
    setupFiles: ['./test/setup.ts'],
  },
});
```

### Supporting Tools

| Tool | Purpose |
|------|---------|
| `tempy` | Create temporary directories for scaffold tests |
| `strip-ansi` | Strip ANSI codes from stdout for CLI tests |
| `@vitest/coverage-v8` | Code coverage reports |
| `execa` | Process spawning for E2E tests (also a runtime dep) |

---

## 6. Test Data Strategy

### Fixtures

All test fixtures live in `test/fixtures/`:

| Fixture | Purpose |
|---------|---------|
| `test/fixtures/state.ts` | `createState()` helper for constructing WizardState |
| `test/fixtures/templates/` | Minimal template directory for scaffold engine tests (avoids depending on real templates) |
| `test/fixtures/expected/` | Expected output snapshots for config generators |

### Template Test Fixtures

Instead of using the real template directory (which could change), integration tests for the scaffold engine should use a minimal fixture template directory:

```
test/fixtures/templates/
├── node/
│   └── ts/
│       ├── source/
│       │   ├── app.tsx      # Simple "Hello" component
│       │   └── cli.tsx      # With <% PROJECT_NAME %>
│       └── test.tsx          # Basic test template
├── node/
│   └── js/
│       ├── source/
│       │   ├── app.jsx
│       │   └── cli.jsx
│       └── test.jsx
├── bun/
│   └── ts/                  # Same structure
├── bun/
│   └── js/                  # Same structure
└── shared/
    ├── .gitignore
    ├── .editorconfig
    └── readme.md.template
```

The `scaffold()` function should accept an optional `templateDir` override for testing, defaulting to the real template directory in production.

### Snapshot Testing

Config generators that produce deterministic output (JSON configs, YAML configs) may use vitest snapshot testing for initial creation, but explicit assertions are preferred for clarity and diff readability.

---

## 7. E2E Matrix Testing

### Combination Selection Rationale

| Priority | Combo | Rationale |
|----------|-------|-----------|
| **1** | Node + TS + Biome + Lefthook | Most popular modern Node stack |
| **2** | Node + JS + ESLint+Prettier + none | Traditional JS stack, no pre-commit |
| **3** | Node + TS + none + Husky | No linter, Husky pre-commit |
| **4** | Bun + TS + Biome + Lefthook | Most popular modern Bun stack |
| **5** | Bun + JS + ESLint+Prettier + none | Traditional JS on Bun |
| **6** | Bun + TS + none + none | Minimal Bun scaffold |
| **7** | Node + TS + ESLint+Prettier + none | Traditional linting on Node |
| **8** | Node + JS + Biome + Lefthook | Biome on JS |

These 8 combinations cover:
- All 2 runtimes (Node, Bun)
- All 2 languages (TS, JS)
- All 3 linter choices (Biome, ESLint+Prettier, none)
- All 3 pre-commit choices (Lefthook, Husky, none) — Husky at least once

### CI Execution Strategy

```yaml
# GitHub Actions (conceptual)
jobs:
  unit-and-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - run: npm ci
      - run: npm run test:quick   # unit + integration

  e2e:
    needs: unit-and-integration
    strategy:
      matrix:
        combo: [
          { flags: "--no-interactive --runtime=node --language=ts --linter=biome --precommit=lefthook" },
          { flags: "--no-interactive --runtime=node --language=js --linter=eslint-prettier" },
          # ... all 8 combos
        ]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - uses: oven-sh/setup-bun@v2
      - run: npm ci
      - run: node dist/index.js e2e-test ${{ matrix.combo.flags }}
      - run: cd e2e-test && npm install && npm run build && npm test
```

---

## 8. Rejected Seam Alternatives

### Rejected: Full Filesystem Mock (Seam at Node.js `fs`)

**Approach:** Mock all `fs/promises` calls to test scaffold engine without touching the disk.

**Rejected because:**
- Mocking `fs` is brittle — the mock must reproduce the exact file system behavior (directories, permissions, encodings)
- Temp directories are fast enough (~10ms creation) and provide real validation
- Real filesystem tests catch encoding issues, permission errors, and path resolution bugs that mocks miss
- The difference in test speed is negligible (1-2s for real fs vs <100ms for mocked)

### Rejected: Subprocess-Based Scaffold Testing

**Approach:** Test the scaffold engine by spawning a Node.js process that imports it.

**Rejected because:**
- Adds process spawn overhead for no benefit
- Makes debugging harder (stack traces cross process boundary)
- Direct import testing is cleaner and faster
- E2E tests already cover subprocess scenarios

### Rejected: Mock `@clack/prompts` Entirely

**Approach:** Isolate wizard tests at a higher abstraction, mocking all of `@clack/prompts`.

**Accepted (not rejected):** This IS the approach for S6. The alternative was to test prompts end-to-end with keyboard input simulation, which is impractical and fragile.

### Rejected: Snapshot Testing for All Generated Files

**Approach:** Use vitest snapshot testing for all scaffolded file content.

**Rejected because:**
- Snapshots are brittle for large generated files (package.json varies significantly)
- Snapshot updates can hide regressions
- Explicit assertions on key properties provide better documentation and more targeted failure messages
- Use snapshots only for config generators that produce deterministic, small outputs (e.g., `compat.json`)

---

## 9. Known Testing Limitations & Mitigations

### Limitation 1: `stdin.write()` Does Not Trigger `useInput`

This is a known Ink issue that affects scaffolded project tests, not the scaffolding tool's own tests. However, it's documented here for template test files.

**Mitigation:** The scaffolded test template includes a comment recommending pure-function extraction:
```typescript
// Note: Ink's stdin.write() does not trigger useInput callbacks.
// Extract input handlers as pure functions for testability:
// export function handleInput(input: string, key: Key): AppState { ... }
```

### Limitation 2: Real Package Manager Not Tested in CI/Unit Tests

The scaffold engine integration tests mock `execa`, so they never run actual `npm install`. This means we don't test:
- Package manager network failures
- Package manager not found
- Lockfile generation

**Mitigation:** E2E matrix tests run real installs in CI. If install fails, the CI job fails, surfacing regressions.

### Limitation 3: Cross-Platform Testing Gap

If CI runs only on Linux, Windows-specific path issues won't be caught until a Windows CI matrix is added.

**Mitigation:** The scaffold engine uses `path` module for all path operations, which handles cross-platform differences. Template fixtures use forward slashes in source. E2E tests should eventually run on macOS + Windows in CI.

### Limitation 4: Test Template Directory Drift

If fixtures diverge from real templates, tests may pass while production scaffolds fail.

**Mitigation:** 
- One test per release verifies the real template directory against fixture expectations
- The fixture directory structure mirrors real templates closely
- CI runs at least one E2E test against the real templates

### Limitation 5: `@vercel/detect-agent` Not Tested

We mock agent detection in unit tests but cannot easily test real agent environments without running inside an agent.

**Mitigation:** Agent detection is a thin wrapper around a third-party package. We test our integration (fallback behavior, error handling). The package itself is tested by its maintainers.

---

*End of testing-decisions.md*
