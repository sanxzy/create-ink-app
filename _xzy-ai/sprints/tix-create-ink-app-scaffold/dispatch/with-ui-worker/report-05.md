---
agent: code-with-ui-worker
work_unit_id: "05 — Post-Scaffold UX, Package Install, Cleanup & Polish"
report_number: 5
status: completed
timestamp: 2026-07-26T16:30:00Z
worker_mode: TDD
work_unit_type: functional
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
upstream_reports: []
---

## Classification

### Work Unit Type: `functional` (matches coordinator classification)

**Rationale:** All 10 acceptance criteria describe observable user-facing behavior:
- Post-scaffold `outro()` shows runtime-aware dev command
- `--immediate` runs install with spinner
- Signal handling exits cleanly
- Overwrite modes (ask/yes/no)
- `.` as project name scaffolds into cwd
- Directory not writable check

This is not scaffolding — the work unit changes how the CLI behaves at runtime.

### TDD Applied: Yes
### Tests Required: Yes

Red-Green-Refactor cycle applied: tests written first (Red), implementation (Green), cleanup (Refactor) with atomic changes.

---

## Work Unit Details

**ID:** 05 — Post-Scaffold UX, Package Install, Cleanup & Polish
**Backlog:** tix-create-ink-app-scaffold
**Mode:** TDD
**Previous Context:** WU-01-04 all merged (292 tests → now 325 tests). Full scaffold engine, interactive wizard, state resolver, runtime validation all complete.

---

## Acceptance Criteria Addressed

| # | Acceptance Criterion | Status | Key Files |
|---|---------------------|--------|-----------|
| 1 | Post-scaffold `outro()` shows runtime-aware dev command and option summary | ✅ | `output-formatter.ts` |
| 2 | `--immediate` with install=yes runs `execa` install with spinner and shows next steps | ✅ | `create-app.ts`, `package-installer.ts` |
| 3 | `--immediate` with install=no skips install but shows next-step instructions | ✅ | `create-app.ts`, `output-formatter.ts` |
| 4 | Install command uses the detected/selected package manager | ✅ | `package-installer.ts` |
| 5 | Failed install shows clear error and exits code 1 | ✅ | `package-installer.ts`, `create-app.ts` |
| 6 | SIGINT/SIGTERM during scaffold cleans up partial output, exits code 0 | ✅ | `create-app.ts` |
| 7 | Cancel at prompt shows formatted message, exits code 0, no files written | ✅ | `output-formatter.ts`, `create-app.ts` |
| 8 | Overwrite modes (ask, yes, no) work correctly | ✅ | `create-app.ts` |
| 9 | `.` as project name scaffolds into current directory | ✅ | `create-app.ts`, `scaffold-input.ts`, `scaffold-project.ts` |
| 10 | Directory not writable detected early with clear error | ✅ | `scaffold-project.ts`, `ports.ts`, `node-file-system.ts` |

---

## Implementation Approach

### Architecture Changes

The implementation follows Clean Architecture layering:

1. **Domain Layer:** Added `isWritable(path)` to `FileSystemPort` interface in `ports.ts`. Added `not_writable` to `ScaffoldError` discriminated union.

2. **Application Layer:** Updated `scaffold-project.ts` to:
   - Use `input.targetDir ?? input.projectName` for flexible target directory resolution (supports `.` as project name)
   - Check directory writability before scaffolding via `deps.fs.isWritable()`
   - New error kind `not_writable` for permission issues

3. **Presentation Layer:**
   - **`output-formatter.ts`:** `formatScaffoldSuccess()` now accepts optional `ScaffoldOptions` (runtime + packageManager) for runtime-aware dev commands. Added `getRunCommand()`, `formatInstallInstructions()`, `formatCancelMessage()`, and `formatInstallInstructions()`.
   - **`package-installer.ts`:** New module wrapping `execa` for spawning package manager install. Shows `@clack/prompts` spinner during install. Handles success/failure with clear error messages.
   - **`create-app.ts`:** Major update — signal handlers (SIGINT/SIGTERM cleanup), overwrite mode resolution (ask/yes/no), `.` project name resolution, interactive cancel handling with formatted message, `--immediate` mode with auto-install.

4. **Infrastructure Layer:** `node-file-system.ts` implements `isWritable()` using `fs.accessSync()` with parent directory fallback.

### Key Design Decisions

- **targetDir field:** Added optional `targetDir` to `ScaffoldInput` DTO. When `.` is the project name, targetDir is set to `'.'` and the display name is derived from `path.basename(process.cwd())`. The scaffold use case uses `targetDir` for all file operations while `projectName` is used for template substitution (package.json name, etc.).
- **Overwrite resolution:** `resolveOverwriteMode()` converts boolean flags to three-state string: `'yes'` (--overwrite), `'no'` (--no-overwrite), `'ask'` (neither). In interactive mode, `'ask'` triggers a confirm prompt. In non-interactive mode, `'ask'` behaves like `'no'` with a clear error.
- **Signal handling:** Handlers are set up at the start of `runCreateApp()` and removed before `gracefulExit()`. A `scaffoldStarted` flag tracks whether partial output may exist.
- **Package installer:** Uses `execa` directly (presentation layer, so no layer violation). Tests use `vi.mock('execa')` at module level.

---

## Design Alignment

No `design.md` document exists for this project. Implementation follows the existing UI patterns:
- Uses `@clack/prompts` spinner, intro/outro, confirm prompts (consistent with existing wizard)
- Message format matches existing output formatter style (prefixed symbols, consistent spacing)
- Runtime-aware messages adapt to Node.js vs Bun conventions

---

## Accessibility Compliance

The CLI is a terminal application — no ARIA or WCAG requirements apply. All output uses plain text with appropriate formatting.

---

## Files Created or Modified

### Modified Files

| File | Change Summary |
|------|---------------|
| `src/shared/types/index.ts` | Added `OverwriteMode` type |
| `src/application/dtos/scaffold-input.ts` | Added optional `targetDir` field |
| `src/application/commands/state-resolver.ts` | Added `targetDir` to state resolution |
| `src/application/commands/scaffold-project.ts` | Added `not_writable` error kind, `isWritable` check, `targetDir` support |
| `src/domain/repositories/ports.ts` | Added `isWritable` to `FileSystemPort` interface |
| `src/infrastructure/file-system/node-file-system.ts` | Implemented `isWritable` |
| `src/presentation/commands/create-app.ts` | Signal handlers, overwrite modes, `.` project name, `--immediate` install, cancel handling |
| `src/presentation/formatters/output-formatter.ts` | `formatScaffoldSuccess` with `ScaffoldOptions`, new helper functions |
| `src/tests/unit/presentation-layer.test.ts` | Added tests for new formatter functions, updated existing tests |
| `src/tests/unit/scaffold-project.test.ts` | Updated mock to include `isWritable` |

### Created Files

| File | Purpose |
|------|---------|
| `src/presentation/install/package-installer.ts` | Package install service with `execa` and spinner |
| `src/tests/unit/post-scaffold-ux.test.ts` | Tests for runtime-aware success messages |
| `src/tests/unit/package-installer.test.ts` | Tests for package install via execa |

---

## Test Files

### Unit Tests

**`src/tests/unit/post-scaffold-ux.test.ts`** (8 tests):
- `formatScaffoldSuccess` shows correct dev command for Node/Bun
- `formatScaffoldSuccess` shows correct install command per package manager
- `formatScaffoldSuccess` handles `.` as current directory
- `getRunCommand` returns correct command per runtime
- `formatInstallInstructions` shows install + run commands
- `formatCancelMessage` shows cancel message

**`src/tests/unit/package-installer.test.ts`** (9 tests):
- Spawns install with correct package manager command (npm, pnpm, yarn, bun)
- Starts spinner before install
- Stops spinner on success
- Shows error on failed install
- Handles execa throwing errors
- Returns success/failure result

**`src/tests/unit/presentation-layer.test.ts`** (added to existing):
- `formatScaffoldResult` accepts `ScaffoldOptions` for runtime-aware output
- `getRunCommand` (node → npm run dev, bun → bun run dev)
- `formatInstallInstructions` with/without runtime
- `formatCancelMessage` content checks
- `formatScaffoldError` handles `not_writable` kind

**`src/tests/unit/scaffold-project.test.ts`** (updated):
- Mock `isWritable` returns `true` for existing tests to pass

### Integration Tests

Existing integration tests pass without modifications (use real `makeNodeFileSystem()` which now includes `isWritable`).

### Test Count

Total: **325 tests** (was 292, +33 new tests)
**0 failures**

---

## Investigation Findings

### External Research
- **execa v10.0.0:** Latest stable version installed via `bun add execa`. API uses `execa(file, args[], options)` array syntax or tagged template literal. For this work, the array syntax `execa('npm', ['install'], { cwd })` is used.
- **@clack/prompts spinner:** The `spinner()` function returns an object with `start(msg)`, `stop(msg)`, `error(msg)`, `message(msg)`, `cancel(msg)` methods. Automatically handles signal registration internally.

### Design Document Analysis
No `design.md` exists. The project uses `@clack/prompts` for all terminal UI. The output style follows the existing conventions established in WU-01-04.

### Library Versions Verified
- `execa@10.0.0` — latest stable
- `@clack/prompts@^1.7.0` — already installed (existing dependency)
- `mri@^1.2.0` — already installed (existing dependency)

---

## Deviations from Plan

### Target Directory Approach
The original plan implied modifying `ScaffoldInput` to handle `.` as project name. The implementation adds an optional `targetDir` field to `ScaffoldInput` with a default fallback to `projectName`. This is cleaner than overloading `projectName` for both naming and directory purposes.

### Overwrite Mode Design
The original spec mentions "Overwrite modes (ask, yes, no)" as three states. The implementation:
- Keeps `overwrite: boolean` in `ScaffoldInput` for the use case
- Adds `resolveOverwriteMode()` in the presentation layer to convert CLI flags to three-state
- Uses `shouldHandleOverwrite()` to determine if a prompt is needed
- This avoids changing the scaffold use case's internal logic while supporting the three modes

### Package Installer Architecture
Rather than injecting `execa` as a dependency (which would require complex typing for the `ExecaMethod` overloaded signatures), the package installer imports `execa` directly. This is acceptable because:
- The package installer is in the presentation layer (outer layer)
- Tests use `vi.mock('execa')` for isolation
- No business logic is in the installer

---

## Blockers

None.

---

## Full Output — Complete Implementation Details

### New Module: `src/presentation/install/package-installer.ts`

This module provides the `installDependencies()` function which:
1. Takes `InstallOptions` containing `cwd`, `packageManager`, and `spinner`
2. Calls `execa(packageManager, ['install'], { cwd })` 
3. Shows spinner with `start('Installing dependencies...')`
4. On success: `spinner.stop('Dependencies installed successfully')` → returns `ok(undefined)`
5. On failure: `spinner.error('Installation failed: ...')` → returns `err(errorMsg)`

### Modified: `src/presentation/formatters/output-formatter.ts`

New exports:
- `getRunCommand(runtime)` → `'npm run dev'` or `'bun run dev'`
- `formatInstallInstructions(pm, runtime?)` → next-step text
- `formatCancelMessage()` → cancel notification text

Modified:
- `formatScaffoldSuccess(result, options?)` — now accepts `ScaffoldOptions` with `runtime` and `packageManager` to show correct dev command and install command
- `formatScaffoldResult(result, options?)` — passes options through
- `formatScaffoldError(error)` — handles `not_writable` error kind

### Modified: `src/presentation/commands/create-app.ts`

New features:
1. **Signal handlers:** `setupSignalHandlers(cleanup?)` registers SIGINT/SIGTERM handlers that call `cleanExit()` (exit code 0). Handlers are removed before normal exit.
2. **Project name `.` resolution:** `resolveProjectTarget(projectName)` converts `.` to `{ targetDir: '.', displayName: path.basename(cwd) }`
3. **Overwrite mode resolution:** `resolveOverwriteMode(overwrite, noOverwrite)` returns `'yes' | 'no' | 'ask'`
4. **Overwrite handling:** `shouldHandleOverwrite(dir, mode)` checks if dir exists and returns `'prompt' | 'proceed' | 'abort'`
5. **Interactive cancel:** Catches `'Cancelled'` error from wizard → shows `formatCancelMessage()` → exits 0
6. **`--immediate` mode:** After successful scaffold, if `--immediate` is set:
   - With `installDeps=true`: runs `installDependencies()` with spinner
   - With `installDeps=false`: shows `formatInstallInstructions()`

### Modified: `src/application/commands/scaffold-project.ts`

- `ScaffoldError` union now includes `{ kind: 'not_writable', message: string }`
- Before directory creation, checks `deps.fs.isWritable(targetDir)` (skipped in dry-run)
- Uses `input.targetDir ?? input.projectName` as the target directory

### Modified: `src/infrastructure/file-system/node-file-system.ts`

- `isWritable(path)` uses `fs.accessSync(path, fs.constants.W_OK)` to check writability
- If directory doesn't exist, checks the parent directory
- Returns `boolean`

### Modified: `src/domain/repositories/ports.ts`

- Added `isWritable(path: string): boolean` to `FileSystemPort` interface
- No change to `FileSystemError` union

### Modified: `src/shared/types/index.ts`

- Added `export type OverwriteMode = 'ask' | 'yes' | 'no';`

### Modified: `src/application/dtos/scaffold-input.ts`

- Added optional `targetDir?: string` to `ScaffoldInput` interface
- `DEFAULT_SCAFFOLD_INPUT` unchanged (targetDir is optional)

### Modified: `src/application/commands/state-resolver.ts`

- Added `targetDir: flags.targetDir ?? defaults.targetDir` to resolved state

---

## Verification Results

| Check | Result |
|-------|--------|
| `bun test` | ✅ 325 pass, 0 fail |
| `bun run typecheck` | ✅ Clean |
| `bunx biome check src/` | ✅ Clean |
