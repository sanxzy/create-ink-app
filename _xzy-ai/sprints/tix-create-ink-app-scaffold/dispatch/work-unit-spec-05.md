# Work Unit 05: Post-Scaffold UX, Package Install, Cleanup & Polish

**Backlog:** tix-create-ink-app-scaffold
**Type:** functional
**Status:** dispatched
**Mode:** TDD

## Background

WU-01-04 built the full scaffold engine (Node+Bun, TS+JS, all linter/precommit combos, dry-run, runtime validation) with interactive wizard. This adds the post-scaffold UX layer: beautiful success messages, `--immediate` auto-install, signal handling, overwrite modes, and edge case handling.

## Previous Progress

WU-01-04 all merged. 292 tests cumulative. Clean Architecture layers complete. Interactive wizard working. Templates for all 4 runtime×language combos. All config generators working.

## What to Build

After scaffolding, a beautiful runtime-aware success message shows the correct dev command. `--immediate` auto-installs with a spinner. Ctrl+C cleanly cancels with code 0. Directory conflicts, permission errors, and signal handling handled gracefully.

## Acceptance Criteria

- [ ] Post-scaffold `outro()` shows runtime-aware dev command and option summary
- [ ] `--immediate` with install=yes runs `execa` install with spinner and shows next steps
- [ ] `--immediate` with install=no skips install but shows next-step instructions
- [ ] Install command uses the detected/selected package manager
- [ ] Failed install shows clear error and exits code 1
- [ ] SIGINT/SIGTERM during scaffold cleans up partial output, exits code 0
- [ ] Cancel at prompt shows formatted message, exits code 0, no files written
- [ ] Overwrite modes (ask, yes, no) work correctly
- [ ] `.` as project name scaffolds into current directory
- [ ] Directory not writable detected early with clear error

## Blocked By

01, 02, 03, 04

## Notes

This is primarily UX/presentation-layer work. The `execa` dependency is needed for package install spawning. Signal handling: `process.on('SIGINT', ...)` and `process.on('SIGTERM', ...)`. Overwrite mode: 'ask' prompts, 'yes' overwrites, 'no' errors. `@clack/prompts` spinner for install progress.
