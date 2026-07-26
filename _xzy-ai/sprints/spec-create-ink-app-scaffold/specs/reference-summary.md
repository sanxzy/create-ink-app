# Reference Summary — `@xzy-ai/create-ink-app`

> **Backlog:** `spec-create-ink-app-scaffold`
> **Date:** 2026-07-26
> **Agent:** discovery-agent v0.0.1

---

## 1. Tech Stack Best Practices

### 1.1 TypeScript (Scaffolding Tool Language)

**Official recommendations:**
- Target Node.js ≥20 (ES2022+ support)
- Use `"type": "module"` in package.json for ESM throughout
- Enable `strict: true` in tsconfig
- Use `tsx` file extensions for JSX (React/Ink components)
- Consider `@sindresorhus/tsconfig` as a base (used by Ink itself)

**Key configuration:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"]
}
```

### 1.2 mri (CLI Flag Parsing)

**Official docs:** [npmjs.com/package/mri](https://www.npmjs.com/package/mri) | [github.com/lukeed/mri](https://github.com/lukeed/mri)

**Best practices:**
- Lightweight (5x faster than minimist, 40x faster than yargs-parser)
- Zero dependencies
- Parses `process.argv.slice(2)` into `{ _: [positional], ...flags }`
- Use `boolean: ['flag']` to ensure flags parse as booleans
- Use `default: { flag: value }` to provide defaults; type of default determines cast
- Use `alias: { b: 'bar', f: ['foo'] }` for flag aliases
- Numbers auto-cast when possible
- Short flag groups (e.g., `-abc`) are treated as booleans by default

**Example pattern (create-vite style):**
```typescript
import mri from 'mri';

const argv = mri(process.argv.slice(2), {
  boolean: ['typescript', 'overwrite', 'immediate', 'interactive'],
  string: ['template', 'runtime', 'pm', 'linter', 'test', 'precommit'],
  default: {
    interactive: undefined, // will be resolved from isTTY
    template: undefined,
  },
  alias: {
    'no-interactive': 'interactive', // handled as negation
  },
});

// Access parsed values
const targetDir = argv._[0];
const typescript = argv.typescript;
```

### 1.3 @clack/prompts (Interactive Prompts)

**Official docs:** [npmjs.com/package/@clack/prompts](https://www.npmjs.com/package/@clack/prompts) | [bomb.sh/docs/clack](https://bomb.sh/docs/clack/basics/getting-started/)

**Available prompt types:**
- `text()` — Single-line text input with validation
- `multiline()` — Multi-line text input
- `password()` — Masked password input
- `select()` — Single-select from list
- `selectKey()` — Select by pressing a key
- `confirm()` — Yes/no confirmation
- `multiselect()` — Multi-select from list
- `groupMultiselect()` — Grouped multi-select
- `autocomplete()` — Searchable select
- `path()` — File/directory path with autocomplete
- `date()` — Structured date entry
- `note()` — Display information (non-interactive)
- `box()` — Boxed text display
- `spinner()` — Loading state indicator
- `progress()` — Progress bar
- `tasks()` — Sequential task execution with individual spinners

**Best practices (from create-vite pattern):**
1. **Always check `prompts.isCancel()`** after every prompt:
   ```typescript
   const result = await prompts.text({ message: 'Project name:' });
   if (prompts.isCancel(result)) {
     prompts.cancel('Operation cancelled');
     process.exit(0);
   }
   ```
2. **Use `log.step()`** for informational messages during scaffolding
3. **Use `log.success()`** for completion messages
4. **Use `log.warning()`** for warnings
5. **Use `outro()`** for final output (creates nice boxed summary)
6. **Validate inputs** with the `validate` callback returning a string error message
7. **Use `initialValue`** for default values
8. **Use `showInstructions: false`** for compact prompts (v1.7.0+)

**Spinner pattern for long operations:**
```typescript
import { spinner } from '@clack/prompts';
const s = spinner();
s.start('Installing dependencies');
await execa('npm', ['install']);
s.stop('Dependencies installed');
```

**Tasks pattern (replaces Listr):**
```typescript
import { tasks } from '@clack/prompts';
await tasks([
  {
    title: 'Copy files',
    task: async () => { /* copy files */ },
  },
  {
    title: 'Install dependencies',
    task: async () => { /* install */ },
  },
]);
```

### 1.4 picocolors (Terminal Colors)

**Best practices:**
- Tiny (zero dependencies) — preferred over chalk (larger, dep-heavy)
- Used by create-vite
- Pattern: `picocolors.green(text)`, `picocolors.bold(text)`, `picocolors.cyan(text)`
- Supports chainable API: `picocolors.bold(picocolors.green(text))`

### 1.5 Ink v6+ (Terminal UI Framework)

**Official docs:** [github.com/vadimdemedes/ink](https://github.com/vadimdemedes/ink)

**Key facts from Ink v6 release:**
- **Requires Node.js ≥20** (dropped Node 16/18)
- **Requires React 19+** (peer dependency `"react": ">=19.0.0"`)
- **Requires `@types/react` ≥19**
- Uses `LegacyRoot` from `react-reconciler/constants.js`
- Uses `updateContainerSync()` + `flushSyncWork()` for synchronous rendering
- React DevTools must be v5+ for React 19 compatibility

**Ink v7 key changes (additional to v6):**
- Requires React 19.2+
- Uses `useEffectEvent` internally (avoids re-subscribing input handlers on every render)
- **`key.backspace`** — Backspace correctly sets `key.backspace` (was `key.delete` in v5 and earlier)
- **`key.delete`** — Now reserved for actual Delete key (e.g., Fn+Backspace)
- **`key.meta`** — No longer set on plain Escape; only set for actual Alt/Meta modifier combos
- **`key.escape`** — Now correctly identifies plain Escape presses

**Provider tree (Ink internal architecture):**
```
render(<UserApp />)
  └─ Ink class
       └─ <InternalApp>
            ├─ AppContext.Provider      (exit, waitUntilRenderFlush, suspendTerminal)
            ├─ StdinContext.Provider    (stdin, setRawMode, isRawModeSupported)
            ├─ StdoutContext.Provider   (stdout, write)
            ├─ StderrContext.Provider   (stderr, write)
            ├─ FocusContext.Provider    (activeId, focusNext, focusPrevious, ...)
            ├─ AnimationContext.Provider (shared setTimeout scheduler)
            ├─ CursorContext.Provider   (setCursorPosition for IME)
            │    └─ <ErrorBoundary>
            │         └─ <UserApp />
```

**Key hooks for scaffolded apps:**
- `useInput((input, key) => { ... })` — Keyboard input
- `useApp().exit()` — Graceful exit
- `useFocus({ autoFocus: true })` — Focus management
- `useStdout().write()` — Out-of-tree stdout
- `useStderr().write()` — Out-of-tree stderr

### 1.6 ink-testing-library v4

**Official docs:** [npmjs.com/package/ink-testing-library](https://www.npmjs.com/package/ink-testing-library) | [github.com/vadimdemedes/ink-testing-library](https://github.com/vadimdemedes/ink-testing-library)

**Key facts:**
- v4.0.0 released 2024-05-22
- Pure ESM
- API: `render(tree)` returns `{ lastFrame, frames, rerender, unmount, stdin, stdout, stderr }`
- `cleanup()` function for afterEach hooks
- Works with vitest, Jest, ava

**Best practices (from wiki + research):**

1. **Cleanup in afterEach:**
   ```typescript
   import { render, cleanup } from 'ink-testing-library';
   import { afterEach, test, expect } from 'vitest';
   afterEach(() => cleanup());
   ```

2. **Known `stdin.write()` bug in Ink v5+**: `stdin.write()` does NOT trigger `useInput` callbacks. Workaround — extract input handler logic into pure functions and test those directly:
   ```typescript
   // Instead of testing useInput via stdin.write():
   export function handleInput(input: string, key: Key, state: AppState): AppState {
     // pure logic here
     return newState;
   }
   // Test handleInput as a pure function
   test('handleInput processes arrow keys', () => {
     expect(handleInput('', { upArrow: true }, initialState)).toEqual(expectedState);
   });
   ```

3. **Timing handling:** Use `vi.useFakeTimers()` + `vi.advanceTimersByTime(50)` for async rendering delays.

4. **Frame assertions:** Use `frames` array rather than `lastFrame()` if `exit()` may write an empty frame after unmount. Helper: `getLastContentFrame(frames)`.

5. **ANSI stripping:** `lastFrame()` returns plain text (ANSI stripped). For color assertions, use `frames` raw output.

6. **Virtual terminal:** Tests use 80-column virtual terminal; `useStdoutDimensions` returns this.

7. **Unmount always:** Always call `unmount()` in cleanup to prevent timer pollution across tests.

### 1.7 vitest (Node Test Framework)

**Best practices:**
- Use `vitest` config in `vitest.config.ts`
- Glob patterns for test files: `["**/*.test.ts", "**/*.test.tsx"]`
- Use `vi.fn()` for mocking, `vi.mock()` for module mocking
- Use `vi.useFakeTimers()` for timer-dependent tests
- Compatible with `ink-testing-library` out of the box
- Add `@vitest/ui` for the vitest UI dashboard
- Configure coverage with `@vitest/coverage-v8` or `@vitest/coverage-istanbul`

**Example vitest.config.ts for scaffolded Ink apps:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.test.ts', '**/*.test.tsx'],
    setupFiles: ['./test/setup.ts'],
  },
});
```

### 1.8 bun:test (Bun Test Framework)

**Documentation:** [bun.sh/docs/cli/test](https://bun.sh/docs/cli/test)

**Best practices:**
- Built-in, no config needed
- Jest-compatible API (`describe`, `test`, `expect`)
- Use `Bun.mock()` for mocking
- Compatible with `ink-testing-library` (Bun's Node.js compat covers it)
- Run with `bun test` (no `--watch` benefit over vitest's watch mode)
- Coverage with `bun test --coverage`

### 1.9 esbuild (Node Build System)

**Documentation:** [esbuild.github.io](https://esbuild.github.io/)

**Best practices:**
- Use `--platform=node` for Node.js bundles (marks `fs`, `path`, etc. as external)
- Use `--bundle` for bundling dependencies
- Use `--target=node20` for Node 20+ target
- Use `--format=esm` for ESM output
- Use `--outdir=dist` for output directory
- Use `--minify` for production (optional for CLI tools)
- Use JS API for complex configs: `await esbuild.build({...})`

**Simple build script (for scaffolded Node apps):**
```json
{
  "scripts": {
    "build": "esbuild --bundle --platform=node --target=node20 --format=esm source/cli.tsx --outdir=dist --external:react --external:ink",
    "dev": "esbuild --bundle --platform=node --target=node20 --format=esm source/cli.tsx --outdir=dist --external:react --external:ink --watch"
  }
}
```

**Note:** For Ink CLI apps, React and Ink should be marked as external (they're runtime dependencies, not bundled).

### 1.10 Bun build/compile (Bun Build System)

**Documentation:** [bun.sh/docs/bundler](https://bun.sh/docs/bundler) | [bun.sh/docs/bundler/executables](https://bun.sh/docs/bundler/executables)

**Best practices:**
- `bun build ./source/cli.tsx --outdir=dist` for simple build
- `bun build --compile ./source/cli.tsx --outfile=myapp` for single-file executable
- Cross-compile with `--target=bun-linux-x64`, `bun-windows-x64`, `bun-darwin-arm64`, etc.
- Use `--minify --sourcemap` for production
- `--compile` bundles everything (React, Ink, and app code) into a single binary

**For scaffolded Bun apps (development build):**
```json
{
  "scripts": {
    "build": "bun build ./source/cli.tsx --outdir=dist",
    "dev": "bun --watch ./source/cli.tsx",
    "start": "bun ./source/cli.tsx"
  }
}
```

### 1.11 Biome (Unified Linter + Formatter)

**Documentation:** [biomejs.dev](https://biomejs.dev/)

**Best practices:**
- Single `biome.json` configuration file
- `biome init` to create config
- `biome migrate eslint --write` and `biome migrate prettier --write` for migration
- `biome check .` runs lint + format + import sorting
- `biome ci` for CI (optimized for exit codes)
- `biome check --write .` to auto-fix

**Recommended config for Ink apps:**
```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "indentWidth": 2,
    "lineWidth": 80
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error"
      },
      "style": {
        "useConst": "error",
        "noNonNullAssertion": "warn"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "all",
      "semicolons": "always",
      "arrowParentheses": "always"
    }
  },
  "files": {
    "ignore": ["node_modules", "dist", "coverage"]
  }
}
```

### 1.12 Lefthook (Pre-commit Hooks)

**Documentation:** [github.com/evilmartians/lefthook](https://github.com/evilmartians/lefthook)

**Best practices:**
- `lefthook install` to install git hooks
- Configuration in `lefthook.yml` or `lefthook.json`
- Cross-platform (Go binary, no Node dependency)
- Parallel and serial execution support

**Recommended config:**
```yml
pre-commit:
  parallel: true
  commands:
    lint:
      run: npx @biomejs/biome check --write {staged_files}
    typecheck:
      run: npx tsc --noEmit
```

---

## 2. Similar Implementations & Reference Architectures

### 2.1 create-vite (Gold Standard)

**Repository:** [github.com/vitejs/vite/tree/main/packages/create-vite](https://github.com/vitejs/vite/tree/main/packages/create-vite)

**Architecture patterns:**
- **Single `src/index.ts` file** — All logic in one file (~400 lines) with a single `init()` async function
- **mri for flag parsing** — Lightweight, no dependencies
- **@clack/prompts for interactive prompts** — `text()`, `select()`, `confirm()`
- **picocolors for colors** — Tiny, fast
- **@vercel/detect-agent for AI agent detection** — Shows helpful hint when agent detected
- **Framework → Variant two-tier selection** — First select framework, then variant (e.g., React → TypeScript / TypeScript + SWC)
- **Template-based** — Copies template files from bundled package to target directory
- **Package manager detection** — Via `process.env.npm_config_user_agent`
- **Flag support:** `--template`, `--overwrite`, `--immediate`, `--no-interactive`
- **Graceful cancellation** — `prompts.isCancel()` check after every prompt

**Key code patterns to adopt:**
```typescript
// Agent detection
const { isAgent } = await determineAgent();
if (isAgent && interactive) {
  console.log('To create in one go, run: create-ink-app --no-interactive ...');
}

// Package manager detection
const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
const pkgManager = pkgInfo ? pkgInfo.name : 'npm';

// Interactive determination
const interactive = argInteractive ?? process.stdin.isTTY;

// Cancel helper
const cancel = () => prompts.cancel('Operation cancelled');
```

### 2.2 create-next-app

**Repository:** [github.com/vercel/next.js/tree/canary/packages/create-next-app](https://github.com/vercel/next.js/tree/canary/packages/create-next-app)

**Relevant patterns:**
- Use of `giget` for remote template fetching (from GitHub)
- Pre-configured tooling out of the box
- TypeScript as default

### 2.3 Ink's Internal Architecture (Professional TUI Wiki)

**Source:** `professional-tui/pages/architecture/anatomy-of-ink-app.md`

**Key architectural insights:**
- 8 nested React context providers in a specific order (App → Stdin → Stdout → Stderr → Focus → Animation → Cursor → ErrorBoundary)
- Ref-counted raw mode (first component to call `setRawMode(true)` enables it; last to disable tears it down)
- Single-timer animation scheduler (all `useAnimation` subscribers share one `setTimeout`)
- Context values all wrapped in `useMemo` to prevent unnecessary re-renders
- `<ErrorBoundary>` is a class component (required for `getDerivedStateFromError`)
- The `<MemoryRouter>` pattern recommended for TUI routing

---

## 3. Testing Best Practices

### 3.1 Scaffolding Tool Tests

| Test Type | What to Test | How |
|-----------|-------------|-----|
| Unit | Flag parsing (mri) | Mock argv, test flag extraction |
| Unit | Template substitution | Test `<% VAR %>` replacement with various inputs |
| Unit | Config file generation | Test programmatic generation of biome.json, vitest.config |
| Unit | Non-interactive mode | Test all defaults without prompts |
| Integration | Directory creation | Mock fs, verify correct files created |
| Integration | Package manager detection | Set `npm_config_user_agent`, test detection |
| E2E | Full scaffold flow | Scaffold to temp dir, verify files, check content |
| E2E | Stack combination matrix | Scaffold top 8-10 combos, build + run each |

### 3.2 Scaffolded App Tests (Template Tests)

| Test Type | What to Test | Tool |
|-----------|-------------|------|
| Unit | Pure component rendering | vitest + ink-testing-library |
| Unit | Input handler logic | Pure function extraction (avoid stdin.write bug) |
| Integration | App lifecycle | render() → assert lastFrame() → unmount() |
| Integration | Focus management | Multiple focusable components, Tab navigation |
| E2E | Binary execution | Spawn built binary, assert stdout output |

### 3.3 E2E Testing Strategy

- **Tool**: vitest (for the scaffolding tool itself) + bash `execa` for subprocess calls
- **Scope**: Scaffold → `cd` to dir → install deps → build → run tests
- **Combinations**: Top 8-10 most common stacks:
  1. Node + TS + Biome + Lefthook
  2. Node + TS + ESLint+Prettier + Husky
  3. Node + TS + none + none
  4. Node + JS + Biome + Lefthook
  5. Node + JS + ESLint+Prettier + none
  6. Bun + TS + Biome + Lefthook
  7. Bun + TS + none + none
  8. Bun + JS + ESLint+Prettier + none
- **CI**: GitHub Actions; parallel matrix strategy
- **Timeout**: 5 minutes per combination
- **Cleanup**: Always delete temp directories

### 3.4 Known Ink Testing Issues

1. **`stdin.write()` bug** (Ink v5+): Does not trigger `useInput` callbacks. **Workaround**: Extract input handler into pure functions and test directly.
2. **ANSI color stripping**: `lastFrame()` strips ANSI. Use `frames` array for raw output.
3. **Empty frame on exit**: After `exit()`, the last frame may be empty. Use `getLastContentFrame(frames)` helper.
4. **Timer pollution**: Always `unmount()` in `afterEach` to prevent interval leakage between tests.
5. **Async rendering**: `useEffect` + `setState` is async. Use fake timers or `waitForRender()` helper with 50ms+ delays.

---

## 4. Performance, Security & Scalability Considerations

### 4.1 Performance

- **esbuild**: 10-100x faster than tsc/Babel for Node builds
- **bun build**: Native, zero-dependency, faster than esbuild for Bun targets
- **Biome**: Written in Rust, significantly faster than ESLint + Prettier
- **Template substitution**: Simple string replacement (<% VAR %>) is faster than full template engine
- **Single binary executables**: `bun build --compile` creates portable, self-contained executables

### 4.2 Security

- **No remote template fetching**: Templates bundled in package (follows create-vite pattern)
- **No post-install scripts**: The scaffolding tool should not run arbitrary code after install
- **Input validation**: Validate project names (npm naming rules), directory paths, and user inputs
- **`--overwrite` safety**: Confirm before overwriting non-empty directories
- **Package integrity**: Use `--save-exact` or lockfile for scaffolded dependencies
- **No elevated permissions**: Scaffolding should work without sudo/admin

### 4.3 Scalability

- **Reduced matrix**: 2 runtimes × 2 languages × 3 tooling combos = 12 combinations (manageable)
- **Version compat table**: `compat.json` maps runtime × Ink × React versions
- **CI automation**: Automated validation of top combinations on every release
- **Deprecation policy**: Drop old Ink versions when upstream support ends; patch bump for compat updates

---

## 5. Migration & Upgrade Guidance

### 5.1 From Old `create-ink-app` v3.0.2 to `@xzy-ai/create-ink-app`

| Aspect | Old (v3.0.2) | New | Rationale |
|--------|-------------|-----|-----------|
| Package Name | `create-ink-app` | `@xzy-ai/create-ink-app` | Scoped, organization-branded |
| Node Version | ≥16 | ≥20 | Ink v6 requires Node 20+ |
| Ink Version | v4 (React 18) | v6+ (React 19+) | Latest stable, React 19 required |
| CLI Parsing | meow | mri | Lighter, create-vite pattern |
| Prompts | None (arg-based) | @clack/prompts | Interactive wizard |
| Build (JS) | Babel | esbuild (Node) / bun build (Bun) | 10-100x faster |
| Build (TS) | tsc | esbuild (Node) / bun build (Bun) | Much faster |
| Test Framework | ava | vitest (Node) / bun:test (Bun) | Modern, faster, wider adoption |
| Linter | xo | Biome / ESLint | xo deprecated; Biome modern |
| Formatter | Prettier | Biome / Prettier | Biome unifies lint+format |
| Pre-commit | None | Lefthook / Husky | Modern cross-platform hooks |
| Template Engine | replace-string (%NAME%) | <% VAR %> + programmatic config | More flexible |
| Task Runner | Listr (unmaintained) | @clack/prompts tasks() | Maintained, integrated |
| Runtime Support | Node only | Node + Bun | Bun fully compatible with Ink |
| Non-interactive | No | Yes (--no-interactive) | CI/CD and AI agent support |

### 5.2 Ink Version Compatibility

| Ink Version | React Version | Node.js | Status |
|-------------|--------------|---------|--------|
| v4.x | 18.x | ≥16 | Legacy (old reference) |
| v5.x | 18.x, 19.x | ≥18 | Prior gen |
| **v6.x** | **19.x** (19.1+) | **≥20** | **✅ Current target** |
| v7.x | 19.2+ | ≥20 | Latest (2026) |

---

## 6. Sources Consulted

### Package Documentation
- **mri**: [npmjs.com/package/mri](https://www.npmjs.com/package/mri) | [github.com/lukeed/mri](https://github.com/lukeed/mri)
- **@clack/prompts**: [npmjs.com/package/@clack/prompts](https://www.npmjs.com/package/@clack/prompts) | [bomb.sh/docs/clack](https://bomb.sh/docs/clack/basics/getting-started/)
- **picocolors**: [npmjs.com/package/picocolors](https://www.npmjs.com/package/picocolors)
- **ink-testing-library**: [npmjs.com/package/ink-testing-library](https://www.npmjs.com/package/ink-testing-library)
- **esbuild**: [esbuild.github.io](https://esbuild.github.io/)
- **Biome**: [biomejs.dev](https://biomejs.dev/)
- **Lefthook**: [github.com/evilmartians/lefthook](https://github.com/evilmartians/lefthook)
- **vitest**: [vitest.dev](https://vitest.dev/)

### Framework Documentation
- **Ink Releases (v6.0.0)**: [github.com/vadimdemedes/ink/releases/tag/v6.0.0](https://github.com/vadimdemedes/ink/releases/tag/v6.0.0)
- **Ink React 19 Support PR**: [github.com/vadimdemedes/ink/pull/719](https://github.com/vadimdemedes/ink/pull/719)
- **Ink v6→v7 Compare**: [github.com/vadimdemedes/ink/compare/v5.2.1...v6.8.0](https://github.com/vadimdemedes/ink/compare/v5.2.1...v6.8.0)
- **Bun Executables**: [bun.sh/docs/bundler/executables](https://bun.sh/docs/bundler/executables)
- **Bun Build API**: [bun.sh/reference/bun/build](https://bun.sh/reference/bun/build)

### Reference Implementations
- **create-vite source**: [github.com/vitejs/vite/blob/main/packages/create-vite/src/index.ts](https://github.com/vitejs/vite/blob/main/packages/create-vite/src/index.ts)
- **create-vite @clack/prompts PR**: [github.com/vitejs/vite/pull/19445](https://github.com/vitejs/vite/pull/19445)
- **ink-testing-library basics**: [wiki.r-that.com/snippets/ink-testing-library-basics/](https://wiki.r-that.com/snippets/ink-testing-library-basics/)

### Project-Internal Sources
- **Discussion Transcript**: `_xzy-ai/discussion/rebuild-create-ink-app-docs/transcript.md`
- **Brainstorming Gap Analysis**: `_xzy-ai/discussion/rebuild-create-ink-app-docs/storming/round-001.md`
- **Professional TUI Wiki**: `/Users/budisantoso/Documents/Personal/LLM-Wikipedia/wikis/professional-tui/`
  - Anatomy of an Ink App (architecture)
  - Ink Examples Catalog (28 examples reference)
- **Old Reference Implementation**: `.docs/create-ink-app/` (all source files)

### Articles & Blog Posts
- "3 cool things about the create-vite CLI you might not have known" — [dev.to/bhuynhdev](https://dev.to/bhuynhdev/3-cool-things-about-the-create-vite-cli-you-might-not-have-known-13ij)
- "Bun Now Supports Cross-Compiling Executable Binaries" — [developer.mamezou-tech.com](https://developer.mamezou-tech.com/en/blogs/2024/05/20/bun-cross-compile/)
- "Biome: The All-in-One Linter and Formatter" — [hyperwebenable.com](https://hyperwebenable.com/reviews/biome-linter-formatter-review/)
- "Setting Up a Modern TypeScript Project with esbuild" — [medium.com/@robinviktorsson](https://medium.com/@robinviktorsson/setting-up-a-modern-typescript-project-with-esbuild-no-framework-fe04f6d72f9e)
