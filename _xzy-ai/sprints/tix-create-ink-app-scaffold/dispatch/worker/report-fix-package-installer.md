# WU Report: Fix `package-installer.test.ts`

**work_unit_id:** `fix-package-installer-tests`
**status:** ✅ Complete

## Changes

**File:** `src/tests/unit/package-installer.test.ts`

### Problem

1. `vi.hoisted()` used to create `mockExeca` — not available in this Vitest environment, causing test suite failures.
2. Duplicate `beforeEach` block (identical `mockExeca.mockClear()` on lines 36 and 40).
3. `vi.mocked()` also not available in Vitest 4.x (removed from the API).

### Fix

1. Replaced `vi.hoisted` + variable hoisting pattern with standard `vi.mock('execa', () => ({ execa: vi.fn() }))`.
2. Removed duplicate `beforeEach` — consolidated to single `beforeEach(() => { vi.clearAllMocks() })`.
3. Used `execa` directly in tests (it is a `vi.fn()` mock at runtime) — avoids `vi.mocked()` which doesn't exist in this vitest version.
4. Import order: `vi.mock` first (auto-hoisted), then `import { execa } from 'execa'` followed by the SUT import.

## Verification

| Check | Result |
|-------|--------|
| `bun test` | 447 pass, 0 fail (993 `expect()` calls) |
| `bun run typecheck` | Clean (no errors) |
| `bunx biome check src/` | No fixes applied (clean) |
