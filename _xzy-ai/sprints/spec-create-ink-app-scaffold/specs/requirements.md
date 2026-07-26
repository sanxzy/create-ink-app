# Requirements: `@xzy-ai/create-ink-app` — Interactive Ink Project Scaffolding Tool

## Problem Statement

Developers building terminal applications with Ink today face an outdated, rigid, and increasingly broken scaffolding experience. The existing `create-ink-app` (v3.0.2, last updated 2023) has not kept pace with the modern JavaScript ecosystem:

**Outdated stack lock-in.** The old tool scaffolds projects with Ink v4 (React 18), forcing users onto a legacy version combination. It hardcodes npm as the only package manager, Babel for transpilation (10–100x slower than modern alternatives), ava as the test runner, and xo for linting — every one of these choices is stale or deprecated by current standards. Users who want Bun runtime support, esbuild, vitest, Biome, or any modern tool must manually rework the scaffolded output.

**No interactivity or choice.** The old tool accepts at most two arguments (project name + optional `--typescript` flag). There is no interactive wizard, no runtime selection, no tooling selection, and no way to opt out of features. Every project gets the same hardcoded defaults regardless of the user's preferences or environment.

**Single-runtime limitation.** The old tool supports Node.js only. Bun — now a fully viable runtime for Ink applications with confirmed compatibility — is ignored. Developers using Bun must manually create their entire project structure from scratch.

**No CI/CD or automation support.** The old tool has no non-interactive mode, no flag-based configuration, and no AI agent detection. It cannot be used in CI/CD pipelines, Docker builds, or AI agent workflows without complex workarounds.

**No post-scaffold guidance.** After scaffolding, the old tool shows a generic success message with no runtime-aware instructions. Users must already know the correct `npm run dev` or `bun run dev` command for their setup.

**Unmaintained dependency chain.** The old tool depends on libraries like `listr` (last published 2019), `meow`, `xo`, and `cpy` — several of which are unmaintained or deprecated. This creates a security and maintenance burden for any team using the scaffolded output.

The result is that developers who want to build modern Ink terminal applications must either accept a legacy scaffold and spend significant effort upgrading it, or start from scratch — neither option provides a good developer experience.

---

## Solution

`@xzy-ai/create-ink-app` solves these problems by providing a modern, interactive, runtime-agnostic project wizard that generates professional Ink applications with up-to-date tooling and best practices.

The tool is a single npm package (`@xzy-ai/create-ink-app`) that users run via `npx @xzy-ai/create-ink-app`. It presents an interactive wizard (when run in a terminal) or accepts CLI flags (when run non-interactively) to capture the user's preferences across these dimensions:

- **Project name** — validated npm package name
- **Runtime** — Node.js or Bun (Deno is not supported)
- **Package manager** — auto-detected from `npm_config_user_agent`, with user override
- **Language** — TypeScript (default) or JavaScript
- **Linter/Formatter** — Biome, ESLint+Prettier, or none
- **Test framework** — automatically selected based on runtime (vitest for Node, bun:test for Bun)
- **Pre-commit hooks** — Lefthook, Husky, or none
- **Install dependencies** — yes/no confirmation

After collecting preferences, the tool uses a hybrid template architecture: base template files for the core Ink application structure (varying by runtime × language combination) plus programmatic generation of tool configuration files (varying by linter, test framework, pre-commit choice). Template placeholders use `<% VAR %>` EJS-style substitution. The generated project includes:

- A fully functional, runnable Ink terminal application
- Runtime-appropriate build scripts (esbuild for Node, `bun build` for Bun)
- Runtime-appropriate test setup (vitest + ink-testing-library for Node, bun:test + ink-testing-library for Bun)
- Selected linter/formatter configuration (Biome, ESLint+Prettier, or none)
- Selected pre-commit hooks configuration (Lefthook, Husky, or none)
- Ink v6+ with React 19+ (always latest versions — no version choice)
- `compat.json` for version compatibility tracking
- Proper `.gitignore`, `.editorconfig`, and `readme.md`

Post-scaffold, the tool displays a runtime-aware success message with the exact commands the user needs to run (`npm run dev` for Node scaffolds, `bun run dev` for Bun scaffolds). An `--immediate` flag auto-installs dependencies and shows next steps without waiting for a manual install command.

The tool operates in three modes: fully interactive (TTY terminal), fully non-interactive (all flags provided, for CI/CD and AI agents), and mixed mode (some flags provided, wizard prompts for the rest). AI agent environments are auto-detected via `@vercel/detect-agent` with a helpful hint displayed.

This solution replaces the legacy `create-ink-app` v3.0.2 entirely. The old codebase remains as a historical reference but the new tool is a greenfield implementation with no backward compatibility requirements.

---

## User Stories

### Interactive Wizard — Happy Path

1. As a developer, I want to run `npx @xzy-ai/create-ink-app` with no arguments, so that the interactive wizard starts immediately in a TTY terminal.
2. As a developer, I want to enter a project name that follows npm package naming rules, so that the scaffolded project has a valid, publishable package name.
3. As a developer, I want to select between Node.js and Bun as my runtime, so that the scaffolded project uses the appropriate build system (esbuild or bun build) and test framework (vitest or bun:test) for my chosen runtime.
4. As a developer, I want my package manager to be auto-detected from the `npm_config_user_agent` environment variable, so that I don't need to manually select the package manager I'm already using.
5. As a developer, I want to override the auto-detected package manager, so that I can use a different package manager when desired (e.g., pnpm instead of npm).
6. As a developer, I want to select TypeScript or JavaScript as my language, so that the scaffolded project has the type system and configuration files I prefer.
7. As a developer, I want to select a linter/formatter option from Biome (unified), ESLint+Prettier (traditional), or none, so that the scaffolded project has code quality tooling matching my preferences.
8. As a developer, I want the test framework to be automatically selected based on my runtime choice (vitest for Node, bun:test for Bun), so that I don't need to manually choose a test framework.
9. As a developer, I want to select a pre-commit hook framework from Lefthook (recommended), Husky, or none, so that automated code quality checks run before commits if desired.
10. As a developer, I want to confirm whether to install dependencies after scaffolding, so that I can choose to install immediately or defer installation.
11. As a developer, I want to see a progress indicator (spinner) while dependencies are being installed, so that I know the tool is working during potentially long installs.

### Non-Interactive Mode

12. As a developer, I want to run the tool with `--no-interactive` and provide all choices via CLI flags, so that I can scaffold projects in CI/CD pipelines and automated scripts.
13. As a developer, I want the tool to require a project name argument in non-interactive mode but provide sensible defaults for all other options, so that CI/CD usage is concise.
14. As a developer, I want to use individual flags (`--runtime`, `--language`, `--linter`, `--test`, `--precommit`, `--pm`) to control specific options in non-interactive mode, so that I can customize exactly what I need.
15. As a developer, I want the tool to fail with a clear error message when required flags are missing in non-interactive mode, so that I know exactly what I need to provide.
16. As a developer, I want the tool to exit with a non-zero exit code when scaffolding fails in non-interactive mode, so that CI/CD systems can detect the failure.

### Mixed Mode (Partial Flags)

17. As a developer, I want to provide some flags but still receive interactive prompts for the missing options, so that I can pre-fill common choices while still being guided through the rest.
18. As a developer, I want the tool to detect that it is running in a non-TTY environment (e.g., piped output) and automatically fall back to non-interactive mode using flag values or defaults, so that it works correctly without a terminal.

### Directory and Overwrite Handling

19. As a developer, I want to scaffold a project into a new empty directory, so that the process completes without conflicts.
20. As a developer, I want to be prompted before scaffolding into a non-empty directory, so that I can confirm or cancel to prevent data loss.
21. As a developer, I want to use the `--overwrite` flag to automatically overwrite the contents of an existing directory, so that I can re-scaffold a project without being prompted.
22. As a developer, I want to use the `--no-overwrite` flag to explicitly refuse overwriting an existing directory, so that I protect existing files from accidental replacement.
23. As a developer, I want to scaffold a project into the current directory by passing `.` as the project name/path, so that I can initialize an Ink project in my current working directory.

### Post-Scaffold Experience

24. As a developer, I want to see a formatted success message after scaffolding completes, so that I know the project was created successfully.
25. As a developer, I want to see runtime-aware post-scaffold instructions (e.g., `npm run dev` for Node, `bun run dev` for Bun), so that I know the correct command to start my project.
26. As a developer, I want to see a summary of my chosen options in the post-scaffold message, so that I can confirm my selections were applied correctly.
27. As a developer, I want to use the `--immediate` flag to automatically install dependencies and show post-scaffold instructions, so that I can get started immediately without a separate install step.
28. As a developer, I want the post-scaffold message to include the correct package manager-specific install commands, so that I don't need to mentally translate between package managers.

### Cancellation and Error Recovery

29. As a developer, I want to cancel the wizard at any prompt using Ctrl+C or Escape, so that I can abort the scaffolding process cleanly.
30. As a developer, I want to see a clear "Operation cancelled" message when I cancel the wizard, so that I know the process was aborted intentionally (not crashed).
31. As a developer, I want the tool to exit with code 0 after a clean cancellation (user-initiated), so that shell workflows are not disrupted.
32. As a developer, I want to see inline validation errors when I enter an invalid project name, so that I can correct my input before proceeding (npm naming rules: lowercase, no leading dot or underscore, no spaces).
33. As a developer, I want to see an error when the target directory is not writable, so that I can check permissions or choose a different location.
34. As a developer, I want to see an error when dependency installation fails (network error, package manager not found, registry unavailable), so that I can troubleshoot the issue.
35. As a developer, I want the tool to clean up partial output if scaffolding fails mid-process, so that I don't end up with a broken project directory.
36. As a developer, I want the tool to handle SIGINT and SIGTERM signals gracefully during long operations, so that killing the process doesn't leave the terminal in a broken state.

### AI Agent Detection

37. As a developer running the tool inside an AI agent environment, I want the tool to detect that it's running under an agent via `@vercel/detect-agent`, so that it can automatically use non-interactive mode or display helpful usage hints.
38. As a developer running the tool inside an AI agent, I want the tool to display a helpful message showing the non-interactive usage pattern, so that the agent knows how to use the tool correctly.

### Help and Version

39. As a developer, I want to run the tool with `--help` to see usage instructions and all available flags, so that I can learn about the tool's interface.
40. As a developer, I want to run the tool with `--version` to see the current version of `@xzy-ai/create-ink-app`, so that I know what version I'm using.

### Template System — Project Structure

41. As a developer, I want the scaffolded project to include a complete, runnable Ink application entry point, so that I can run it immediately without adding any code.
42. As a developer, I want the scaffolded `package.json` to have my project name, correct dependency versions (Ink v6+, React 19+), and appropriate scripts, so that the project metadata and dependencies are correct for my choices.
43. As a developer, I want the scaffolded project to include a `readme.md` with basic usage instructions, so that users of my CLI tool know how to use it.
44. As a developer, I want the scaffolded project to include a `.gitignore` with Node.js/Bun-appropriate ignore patterns, so that generated files and dependencies are excluded from version control.
45. As a developer, I want the scaffolded project to include a `.editorconfig` with consistent style settings, so that editor behavior is consistent across contributors.
46. As a developer, I want the scaffolded project to include `tsconfig.json` with strict mode when TypeScript is selected, so that type checking is enabled from the start.

### Template System — Runtime Variations

47. As a developer choosing Node.js, I want the scaffolded build script to use esbuild, so that my project builds efficiently with a fast, native binary bundler.
48. As a developer choosing Node.js, I want the scaffolded test configuration to use vitest, so that my project has a modern, fast test runner with Jest-compatible API.
49. As a developer choosing Bun, I want the scaffolded build script to use `bun build`, so that my project builds with Bun's native, zero-dependency bundler.
50. As a developer choosing Bun, I want the scaffolded test configuration to use bun:test, so that my project tests with Bun's built-in test runner.
51. As a developer choosing Bun, I want the post-scaffold instructions to use `bun` commands (e.g., `bun run dev`, `bun test`), so that the instructions match my runtime.
52. As a developer choosing Bun, I want the scaffolded project to include a `bun.lock` lockfile convention in `.gitignore`, so that the lockfile is properly version-controlled.

### Template System — Tooling Variations

53. As a developer choosing Biome, I want the scaffolded project to include a `biome.json` configuration file with recommended defaults, so that I have unified linting and formatting out of the box.
54. As a developer choosing Biome, I want the scaffolded project to include `lint`, `format`, and `check` scripts in `package.json`, so that I can run Biome commands through npm/bun scripts.
55. As a developer choosing ESLint+Prettier, I want the scaffolded project to include an `eslint.config.js` (flat config) and a `.prettierrc` configuration file, so that I have traditional linting and formatting set up.
56. As a developer choosing ESLint+Prettier, I want the scaffolded project to include `lint` and `format` scripts in `package.json`, so that I can run ESLint and Prettier through npm/bun scripts.
57. As a developer choosing no linter/formatter, I want no linting or formatting configuration files generated, so that my project stays minimal and I can add my own tooling later.
58. As a developer choosing Lefthook, I want the scaffolded project to include a `lefthook.yml` configuration file with pre-commit hooks for linting and type-checking, so that code quality is enforced on every commit.
59. As a developer choosing Husky, I want the scaffolded project to include a `.husky/` directory with a `pre-commit` hook script for linting, so that code quality is enforced on every commit.
60. As a developer choosing no pre-commit hooks, I want no git hook configuration files generated, so that my project stays simple.

### Version Compatibility

61. As a developer using the tool, I want the scaffolded project to always use the latest stable versions of Ink (v6+) and React (19+), so that I get the most up-to-date features and fixes without needing to manually upgrade.
62. As a developer examining a scaffolded project, I want the project to include a `compat.json` file mapping the versions of Ink, React, and Node.js/Bun that this scaffold targets, so that I can verify compatibility.

### Edge Case Stories

63. As a developer providing a project name with a leading dot (e.g., `.my-ink-app`), I want the tool to handle it as a valid directory name and scaffold into that hidden directory, so that hidden/named projects work correctly.
64. As a developer providing a project name with uppercase letters or spaces, I want the tool to normalize it to a valid npm package name (lowercase, kebab-case) for the `package.json` `name` field, while preserving the directory name as provided.
65. As a developer running the tool on Windows, I want template paths to resolve correctly with Windows path separators, so that scaffolding works cross-platform.
66. As a developer running the tool from a directory with spaces in its path, I want the project to scaffold correctly, so that paths with spaces are handled robustly.
67. As a developer whose `npm_config_user_agent` is not set (unusual environments), I want the tool to default to npm as the package manager, so that it always has a fallback.
68. As a developer whose selected package manager is not installed on the system PATH, I want the tool to show a clear error during the install step, rather than failing silently.
69. As a developer running the tool in a read-only file system, I want the tool to detect the permission issue and display a clear error, so that I understand why scaffolding failed.
70. As a developer who provides the same project name as an existing npm package, I want the tool to still scaffold successfully (npm does not enforce uniqueness at scaffold time), so that I can create local projects with any name.

### Scaffolding Tool as a Package

71. As a developer wanting to run the scaffolding tool, I want to invoke it via `npx @xzy-ai/create-ink-app`, so that I don't need to globally install the package.
72. As a developer wanting to install the scaffolding tool, I want to install it globally with `npm install -g @xzy-ai/create-ink-app`, so that I can run it as `create-ink-app`.
73. As a developer using the tool via `npx`, I want the package to be small and fast to download, so that running the tool is quick even on first use.

---

## Edge Cases

### Input Validation
1. **Empty project name**: User presses Enter without typing a name. Must re-prompt with validation error.
2. **Whitespace-only project name**: Must be treated as invalid and re-prompted.
3. **Project name exceeding length limits**: npm limits package names to 214 characters. Must enforce this limit.
4. **Project name with invalid characters**: Names with `~)('!*` or starting with `.` or `_` or containing capital letters not normalized for `name` field in package.json.
5. **Project name that is a reserved npm word**: Words like `node_modules`, `favicon.ico`, or built-in module names — should warn but not block (npm accepts them).
6. **Project path resolves to a file, not a directory**: User specifies a path where a file exists. Should error clearly.
7. **Project path contains glob characters**: Paths with `*`, `?`, `[` should be handled literally (not interpreted as globs).

### Directory and Filesystem
8. **Directory exists with read-only files**: Overwrite may fail on individual files. Must handle partial failure and report which files blocked the operation.
9. **Insufficient disk space**: The tool should fail gracefully if disk space is insufficient during file copy or dependency install.
10. **Mount permissions**: Scaffolding to external drives, network mounts, or permission-restricted directories.
11. **Existing directory with overwrite=false and non-empty directory**: Must prompt and abort if user does not consent.
12. **Case-insensitive filesystem collision**: On macOS/Windows, if a directory exists with different casing than the project name, handle accordingly.
13. **Very long path names (>255 characters)**: Windows has a MAX_PATH limitation; scaffold should work for reasonable depths and warn on very long paths.
14. **Symlinks in the target path**: Should resolve symlinks and scaffold to the actual directory.

### Runtime and Environment
15. **Neither Node.js nor Bun detectable**: If the user runs the tool and no target runtime is installed, dependency install will fail. Should provide runtime detection or clear error during install.
16. **`npm_config_user_agent` not set**: Fall back to npm as the default package manager.
17. **`@vercel/detect-agent` fails or is unavailable**: The agent detection should fail gracefully (assume no agent, proceed interactively if TTY).
18. **`process.stdin.isTTY` is undefined in some environments**: Must handle undefined/isTTY detection robustly.
19. **Running inside a restricted shell (no raw mode)**: `@clack/prompts` may not work correctly. Detect and fall back to non-interactive.
20. **Multiple platform runtimes installed**: User has both Node.js and Bun. Runtime detection still requires explicit selection (cannot auto-detect intent).

### Installation
21. **Dependency install fails mid-way**: Package manager may partially install. Should detect failure and advise user to run install manually.
22. **Network is unreliable**: Intermittent failures during `npm install` should surface the error from the package manager.
23. **Private registry / `.npmrc` configuration**: The scaffolded project should inherit the user's npm configuration (via `.npmrc` in home directory or project).
24. **Offline mode**: If `npm install --offline` would be relevant. The tool should surface the package manager's error message if offline install fails.
25. **Package manager takes too long**: No hard timeout, but the user should be able to cancel with Ctrl+C.

### Concurrency and Signal Handling
26. **Multiple concurrent scaffolds in the same directory**: May cause race conditions. The tool should either lock the directory or allow it (last write wins).
27. **SIGINT during template copy**: May leave partial files. Should clean up the target directory on interruption.
28. **SIGTERM during install**: Package manager may leave a stale lockfile. Should warn user to check `node_modules`.
29. **SIGPIPE / stdout closed**: If output is piped to a closed stream, the tool should not crash with EPIPE.

### Template System
30. **Template files with binary content**: Images, fonts, or compiled assets in templates should not undergo `<% VAR %>` substitution (would corrupt them).
31. **Template placeholders in unexpected file formats**: `.svg`, `.png`, `.ico` files should be copied as-is without substitution.
32. **Encoding edge cases**: Template files with UTF-8 BOM, non-UTF-8 encodings, or mixed line endings should be handled correctly.
33. **Templates with literal `<%` text**: If the user's scaffolded app code contains `<%` (e.g., EJS templates), these must be escaped or handled to avoid false substitutions.
34. **Missing template files**: If a required template file is missing from the package (corrupted installation), the tool should error clearly.

### Post-Scaffold
35. **Post-scaffold instructions wrapping**: Terminal width may be narrow; instruction output should not overflow or render poorly.
36. **`--immediate` with Bun and install=false**: Immediate mode should respect the install decision; if user chose not to install, don't auto-install.
37. **Cancelling during dependency install**: If user cancels during install via Ctrl+C, should show partial install message and let them know how to complete it.

### Cross-Platform
38. **Windows line endings (CRLF)**: Template files should output with OS-appropriate line endings, or at minimum not break on Windows.
39. **Windows path separators**: Template paths containing forward slashes must work on Windows (Node.js `path` module handles this).
40. **Windows execution policy**: Husky install may fail on Windows due to execution policy restrictions. Should warn if post-install scripts fail.
41. **Windows terminal emulation**: `@clack/prompts` and picocolors may not render correctly in some Windows terminals (PowerShell, CMD, Git Bash).
42. **Cross-platform binary names**: When scaffolding, the tool should use the correct platform-specific binary name for `package.json` `bin` field (no `.js` extension issues).

### Project Name Normalization
43. **Project name with scoped npm pattern**: If user enters a name like `@scope/my-app`, the tool should handle it correctly (scoped packages require special handling for `name` field and directory structure).
44. **Project name with emoji or Unicode characters**: Should be allowed in directory name but normalized/sanitized for `package.json` `name` field.
45. **Home directory expansion `~`**: The tool should not expand `~` in project paths (the shell does this before our tool runs, but direct invocation without shell may not).

---

## Out of Scope

### Deliberately Excluded
1. **Deno runtime support**: Deno is not supported as a target runtime. Research confirmed `node:tty` incompatibility with Ink's `useInput`/raw mode. This decision is final.
2. **CI/CD configuration scaffolding**: No GitHub Actions, GitLab CI, CircleCI, or other CI configuration files are generated. Users add their own CI setup.
3. **Ink version selection**: The tool always scaffolds the latest stable Ink (v6+) and React (19+). No option to select older versions.
4. **Remote template fetching**: All templates are bundled inside the npm package. No `giget` or remote template repository support.
5. **Component generators**: No `generate component`, `generate hook`, or other project-after-init code generators. This is a project scaffold only.
6. **Built-in project upgrade/migration**: No command to upgrade existing scaffolded projects to newer versions of Ink/React/tooling.
7. **Plugin system for third-party templates**: No plugin architecture for community-contributed templates.
8. **Visual UI builder**: No visual/TUI-based drag-and-drop project configuration.
9. **Multi-project workspace scaffolding**: No monorepo or workspace-level scaffolding (pnpm workspaces, npm workspaces, turborepo, etc.).
10. **Deployment configuration**: No Docker, Vercel, Netlify, or other deployment platform configuration.
11. **The old `create-ink-app` architecture**: The old v3.0.2 codebase is a historical reference only. No backward compatibility, migration path, or shared code with the old tool.
12. **AI agent prompt engineering**: The tool may detect AI agents but will not craft tailored prompts for AI agents beyond showing the non-interactive usage hint.
13. **`stdin.write()` test workaround in scaffolded templates**: The scaffolded project will include a note about the known `stdin.write()` bug but will not include dedicated infrastructure code to work around it beyond the pure-function extraction pattern in test templates.

### Future Considerations (Deferred)
14. **Additional linter/formatter options**: Only Biome, ESLint+Prettier, and none are offered. Future options (e.g., Prettier-only, StandardJS, JSHint) are deferred.
15. **Additional pre-commit hook tools**: Only Lefthook and Husky are offered. Future options (e.g., pre-commit, simple-git-hooks) are deferred.
16. **Windows-native install wizard**: A Windows-specific installer experience is deferred; the tool works cross-platform via Node.js.
17. **Multi-language template base**: Only TypeScript and JavaScript. Other compile-to-JS languages (ReasonML, Rescript, etc.) are deferred.
18. **Custom template registries**: Ability to point to a custom template repository is deferred.

### Out of Scope Entirely
19. **The Ink framework itself**: This tool scaffolds applications that use Ink. It does not modify, extend, or fix the Ink framework.
20. **React/Ink application framework layer**: No additional abstractions on top of Ink (no custom routing, state management, or component libraries).
21. **CLI tool distribution/deployment**: The scaffolded project's distribution strategy (npm publish, binary distribution) is the user's responsibility.

---

## Assumptions

### Environment Assumptions
1. **Node.js ≥20 is the minimum runtime** for the scaffolding tool itself. Ink v6 requires Node.js ≥20, and users scaffolding Node projects must have Node.js ≥20.
2. **Bun latest is fully compatible** with Ink v6+ and React 19+ as confirmed by community reports and compatibility research.
3. **`mri` + `@clack/prompts` + `picocolors`** is the correct CLI stack, validated by create-vite's proven architecture.
4. **`@vercel/detect-agent`** correctly detects AI agent environments (GitHub Copilot, Cursor, etc.) and fails gracefully when it cannot.
5. **`npm_config_user_agent`** is set in all standard npm, pnpm, yarn, and bun invocations. In rare environments where it is not set, npm is the fallback.
6. **`process.stdin.isTTY`** is a reliable indicator of interactive terminal availability, consistent with create-vite behavior.
7. **The user has a writable filesystem** in the target directory location.
8. **The target machine has internet access** for installing npm dependencies via the configured registry.
9. **Package managers (npm, pnpm, yarn, bun) are on the system PATH** and executable when install is requested.
10. **Git is installed** if the user selects Lefthook or Husky for pre-commit hooks, as these tools require git hooks.

### Version Assumptions
11. **Ink v6+ will remain stable** and the recommended version through 2026 and beyond. No breaking changes that would invalidate our templates.
12. **React 19+ is fully compatible** with Ink v6+ as confirmed by the Ink v6.0.0 release notes and peer dependency requirements.
13. **`ink-testing-library` v4 is compatible** with both vitest and bun:test without additional shims or configuration.
14. **esbuild is the fastest and most appropriate** build tool for Node.js scaffolding targets, superior to tsc, Babel, Webpack, or Rollup for this use case.
15. **Biome v1.9+ provides sufficient lint rules** (270+) and Prettier-compatible formatting to replace the ESLint+Prettier combo for most users.

### Behavioral Assumptions
16. **Users want the latest versions** of Ink and React. No version choice is offered, and this is acceptable for the target audience building new projects.
17. **Users prefer TypeScript** as the default language choice. TypeScript is the first option in the language selector and recommended.
18. **The wizard flow ordering is logical** and matches user expectations: project name first (fundamental), then runtime, then tooling choices.
19. **`--no-interactive` with flags is the correct pattern** for CI/CD and AI agent usage. Users in these scenarios understand CLI flags.
20. **E2E testing of 8–10 stack combinations** provides sufficient coverage to validate the scaffolding matrix of 2 runtimes × 2 languages × 3 tooling combos ≈ 12 base combinations.

### Template System Assumptions
21. **Template files use UTF-8 encoding without BOM**, which is standard for Node.js/Bun projects.
22. **Simple `<% VAR %>` substitution is sufficient** for template rendering. No conditional logic or loops are needed in templates (programmatic config generation handles complex cases).
23. **Binary template files** (if any) can be identified by file extension or content inspection and excluded from placeholder substitution.
24. **The hybrid template architecture** (base templates + programmatic config generation) cleanly separates concerns without duplication.
25. **`compat.json` is the correct format** for tracking version compatibility metadata within each scaffolded project.

### Project Assumptions
26. **`@xzy-ai/create-ink-app` is published to npm** as a public, scoped package under the `@xzy-ai` organization.
27. **The tool is ESM-only** (`"type": "module"` in its own package.json), consistent with Ink v6+ being pure ESM.
28. **No backward compatibility** with the old `create-ink-app` v3.0.2 is required. This is a greenfield replacement.
29. **The `.docs/create-ink-app/` directory** remains as a historical reference and will not be modified or removed.
30. **Single-user scenarios** are assumed. No multi-tenant, server-side, or concurrent-access considerations.

---

## Further Notes

### Dependencies Between User Stories
- User story #2 (project name validation) is a prerequisite for stories #41–46 (package.json generation).
- User story #3 (runtime selection) determines the build system (#47 vs #49) and test framework (#48 vs #50).
- User story #7 (linter/formatter) determines which config files are generated (#53–57).
- User story #9 (pre-commit hooks) determines which hook files are generated (#58–60).
- User story #12 (non-interactive mode) requires all stories #13–16 to be implemented together.
- Directory handling stories (#19–23) are prerequisites for the scaffold process itself.

### Version Ambiguity Resolution
The conversation context specifies "Node.js (≥v24, latest LTS)" while the workspace summary sets the minimum at Node.js ≥20. The requirements use the conversation context's latest resolution (≥v24 for the current LTS) but the practical minimum is Node.js ≥20 (required by Ink v6). The scaffolded project's `compat.json` and `package.json` `engines` field should specify the exact minimum based on the target Ink version.

### Node Version: v24 vs v20
The conversation context resolved on "Node.js (≥v24, latest LTS)" as the target Node.js version for scaffolded projects. However, Ink v6 requires only Node.js ≥20. Implementation should target Node.js v24 as the recommended LTS but set the minimum `engines.node` to `>=20` in scaffolded projects for maximum compatibility.

### Ink v6 vs v7
The workspace summary mentions Ink v6+ throughout, while reference materials note Ink v7 exists (released after v6). The tool should target the absolute latest stable Ink version at time of release. The requirements refer to "Ink v6+" as the baseline; if v7 is stable at release time, it should be used instead. The `compat.json` version table should reflect the actual versions used.

### `--immediate` Behavior
The `--immediate` flag should install dependencies if the user selected "yes" for dependency install (or if no choice was made yet). If the user explicitly chose not to install dependencies, `--immediate` should still show the next-step instructions but skip installation. This matches create-vite's behavior.

### Template Structure Convention
Each template directory should follow the convention `templates/<runtime>/<language>/` for base template files. Config file generators should be organized as `src/config-generators/<tool-name>.ts`. This keeps the architecture organized as the number of options grows.

### Known Ink Testing Issues in Scaffolded Projects
The scaffolded test template should include documentation comments about known Ink testing issues:
1. `stdin.write()` does not trigger `useInput` in Ink v5+ — recommend extracting handlers as pure functions.
2. `lastFrame()` strips ANSI — use `frames` array for raw output assertions.
3. Always `unmount()` in `afterEach` to prevent timer pollution.
4. Async rendering requires fake timers or 50ms+ delays.

### Efficiency Note on Template Generation
Generating config files programmatically (as JavaScript/TypeScript objects written to files) is more efficient and maintainable than maintaining a separate template file for every permutation. For example, `biome.json` for Biome can be constructed as a JSON object and written with `JSON.stringify()`, rather than having a `biome.json.template` file with conditionals.

### Questions for the User
1. **Should the tool provide a `--dry-run` flag** that shows what would be scaffolded without writing files? This was not discussed but would be valuable for CI/CD validation.
2. **Should the tool validate that the selected runtime is actually installed** before starting the scaffold? Currently assumed; validation could fail at install time.
3. **What should the default description be** in the scaffolded `package.json`? The old tool used an empty string. A reasonable default might be generated from the project name.
4. **Should `bun build --compile` be offered as an option** for Bun scaffold targets, or only `bun build`? The reference mentions both but the wizard does not expose this choice.
5. **Should the scaffolded project include a license file?** If so, which license (MIT, ISC, Apache 2.0, or ask user)? Currently not in the wizard flow.

---

*Document generated by requirements-agent for the `generate-engineering-specs` skill. Backlog: `spec-create-ink-app-scaffold`.*
