# Work Unit 06: E2E Matrix & Edge Case Testing

**Backlog:** tix-create-ink-app-scaffold
**Type:** functional
**Status:** dispatched
**Mode:** TDD

## Background

WU-01-05 built the complete `create-ink-app` CLI with all scaffold combinations, interactive wizard, runtime validation, and post-scaffold UX. This final work unit adds comprehensive E2E test infrastructure validating all 8 scaffold combinations end-to-end, plus edge case coverage.

## Previous Progress

WU-01-05 all merged. 325 tests cumulative. Full scaffold engine (Node+Bun, TS+JS, Biome+ESLint+Husky+Lefthook+none), interactive wizard, state resolver, runtime validation, post-scaffold UX all complete.

## What to Build

Complete test infrastructure with full E2E coverage validating all 8 scaffold combinations end-to-end. Test fixtures (`createState()` helper, minimal templates, expected outputs) and edge case coverage for cross-platform behavior, spaces in paths, and special character handling.

## Acceptance Criteria

- [ ] Test fixtures exist: `createState()` helper, minimal template directories, expected output snapshots
- [ ] All 8 E2E matrix combinations pass (scaffold, file verify, install, build, test):
  1. Node+TS+Biome+Lefthook
  2. Node+JS+ESLint+Prettier+none
  3. Node+TS+none+Husky
  4. Bun+TS+Biome+Lefthook
  5. Bun+JS+ESLint+Prettier+none
  6. Bun+TS+none+none
  7. Node+TS+ESLint+Prettier+none
  8. Node+JS+Biome+Lefthook
- [ ] All three operating modes tested: interactive (mocked), non-interactive (flags), mixed (partial flags + prompts)
- [ ] Edge case tests pass: spaces in paths, leading dot, current dir, uppercase normalized
- [ ] Cross-platform path handling: `path` module usage, forward slashes, Windows path documentation
- [ ] E2E tests run in CI only with parallel matrix and 10-minute timeout

## Blocked By

03, 04, 05

## Notes

This is a testing infrastructure work unit. The `createState()` helper should be a factory that creates a complete scaffold state with all options. E2E tests should use `tempy` for temp directories and mock `execa` for install/build steps. CI matrix should be defined in a GitHub Actions workflow.
