# create-ink-app

Scaffold complete, runnable [Ink](https://github.com/vadimdemedes/ink) + React CLI projects. Choose your runtime (Node.js or Bun), language (TypeScript or JavaScript), linter, test framework, pre-commit hooks, and package manager — everything is wired and ready to go.

## Features

- **Interactive & non-interactive modes** — Full wizard in TTY, flag-driven in CI/automation
- **Multiple runtimes** — Node.js 18+ or Bun 1.0+
- **Language choice** — TypeScript (`.tsx`) or JavaScript (`.jsx`)
- **Linter/Formatter** — Biome, ESLint + Prettier, or none
- **Test framework** — Vitest (Node) or Bun test (Bun); Jest supported via `--test jest`
- **Pre-commit hooks** — Lefthook, Husky, or none
- **Package manager** — npm, pnpm, yarn, or bun (auto-detected)
- **Dry-run mode** — Preview all files that would be created without writing
- **Immediate mode** — Auto-install dependencies after scaffolding
- **Scaffolds to `.`** — Use `.` as project name to scaffold into the current directory
- **Signal safety** — SIGINT/SIGTERM during scaffold shows warning, exits cleanly
- **Environment auto-detection** — TTY, CI, and AI agent detection with appropriate hints

## Requirements

| Dependency | Minimum Version |
|-----------|----------------|
| **Node.js** (for Node scaffolds) | 18.0+ |
| **Bun** (for Bun scaffolds) | 1.0+ |
| npm / pnpm / yarn / bun | Any supported version |

Running the tool itself requires either Node.js 18+ or Bun 1.0+.

## Installation

### Via npx (recommended)

```sh
npx @xzy-ai/create-ink-app my-ink-app
```

### Global install

```sh
npm install -g @xzy-ai/create-ink-app
create-ink-app my-ink-app
```

## Quick Start

### Interactive mode (default)

```sh
create-ink-app my-ink-app
```

A wizard prompts you for project name, runtime, language, linter, test framework, pre-commit tool, package manager, and whether to install dependencies.

### Non-interactive mode

```sh
create-ink-app my-ink-app --no-interactive --runtime bun --language typescript --linter biome
```

### Dry-run mode

```sh
create-ink-app my-ink-app --dry-run
```

Shows every file that would be created without writing anything to disk.

## CLI Reference

```
create-ink-app <project-name> [options]
```

### Options

| Option | Type | Description | Valid Values | Default |
|--------|------|-------------|-------------|---------|
| `project-name` | argument | Project name (valid npm package name). Use `.` for current directory | string | — |
| `-h, --help` | boolean | Show help message | — | `false` |
| `-v, --version` | boolean | Show version number | — | `false` |
| `--no-interactive` | boolean | Skip interactive prompts | — | `false` |
| `-o, --overwrite` | boolean | Overwrite existing directory | — | `false` |
| `--no-overwrite` | boolean | Do not overwrite existing directory (takes precedence) | — | `false` |
| `--dry-run` | boolean | Preview files without writing | — | `false` |
| `--immediate` | boolean | Auto-install dependencies after scaffolding | — | `false` |
| `--runtime` | string | Target runtime | `node`, `bun` | `node` |
| `--language` | string | Source language | `typescript`, `javascript` | `typescript` |
| `--linter` | string | Linter / formatter | `biome`, `eslint-prettier`, `none` | `biome` |
| `--test` | string | Test framework | `vitest`, `jest` | `vitest` |
| `--precommit` | string | Pre-commit hook manager | `lefthook`, `husky`, `none` | `lefthook` |
| `--pm` | string | Package manager | `npm`, `pnpm`, `yarn`, `bun` | `npm` |

### Precedence

**CLI flags > interactive prompts > defaults**

Any flag provided on the command line is skipped in the interactive wizard. Unspecified options fall back to defaults.

## Configuration Options

### Runtime

| Value | Details |
|-------|---------|
| `node` | Scaffolds a Node.js project. Uses `tsc` for TypeScript builds, `vitest` for tests. Shebang: `#!/usr/bin/env node` |
| `bun` | Scaffolds a Bun project. Uses `bun build` for compilation, `bun test` natively (no vitest config). `bun.lock` in `.gitignore`. Shebang: `#!/usr/bin/env bun` |

### Language

| Value | Extensions | Details |
|-------|-----------|---------|
| `typescript` | `.tsx` | Generates `tsconfig.json`, `typecheck` script, type annotations in templates |
| `javascript` | `.jsx` | No TypeScript config or type annotations |

### Linter

| Value | Files Generated | Details |
|-------|----------------|---------|
| `biome` | `biome.json` | Single all-in-one linter/formatter. `lint`, `format`, `check` scripts |
| `eslint-prettier` | `eslint.config.js`, `.prettierrc` | Traditional ESLint + Prettier setup |
| `none` | — | No linter configs or related scripts |

### Test Framework

| Value | Details |
|-------|---------|
| `vitest` | Generates `vitest.config.ts` (Node only). Bun uses `bun test` natively. Selected by default |
| `jest` | Supported via `--test jest`. Not offered in interactive wizard |

### Pre-commit Tool

| Value | Files Generated | Details |
|-------|----------------|---------|
| `lefthook` | `lefthook.yml` | Fast Go-based hook manager. Runs typecheck, lint, format in parallel |
| `husky` | `.husky/pre-commit` | Traditional Git hooks via Husky. Runs tests on commit |
| `none` | — | No hook configuration |

### Package Manager

| Value | Install Command |
|-------|----------------|
| `npm` | `npm install` |
| `pnpm` | `pnpm install` |
| `yarn` | `yarn` |
| `bun` | `bun install` |

Auto-detected from `npm_config_user_agent`. Falls back to `npm`.

## Modes

### Interactive mode

Default when a TTY is detected and not in CI/AI agent. Uses `@clack/prompts` for a step-by-step wizard. Each prompt is skipped if a corresponding CLI flag was already provided (mixed mode).

### Non-interactive mode

Activated via `--no-interactive`, or automatically when `CI=true`, `GITHUB_ACTIONS=true`, or non-TTY. Requires `project-name` argument.

### Mixed mode

Provide some flags via CLI and the wizard prompts for the rest. Any provided flag is skipped in the wizard.

### Dry-run mode

`--dry-run` shows the complete file manifest without writing anything. Useful for verifying configuration before real scaffolding.

### Immediate mode

`--immediate` runs dependency installation automatically after scaffolding completes, using the selected package manager.

## Examples

### Basic interactive scaffold

```sh
create-ink-app my-cli
```

### Bun + TypeScript + Biome (CI-friendly)

```sh
create-ink-app my-cli --runtime bun --language typescript --linter biome --no-interactive
```

### JavaScript project with ESLint + Prettier and Husky

```sh
create-ink-app my-cli --language javascript --linter eslint-prettier --precommit husky
```

### Scaffold into current directory

```sh
mkdir my-project && cd my-project
create-ink-app .
```

Uses the basename of the current working directory as the display name.

### Dry-run preview with all options

```sh
create-ink-app my-cli --runtime bun --language javascript --linter none --precommit none --dry-run
```

### Immediate mode (auto-install dependencies)

```sh
create-ink-app my-cli --runtime node --language typescript --immediate
```

### Overwrite existing directory

```sh
create-ink-app existing-project --overwrite
```

## Generated Project

### Structure

```
my-ink-app/
├── source/
│   ├── app.tsx              # Main Ink app component (or .jsx)
│   └── cli.tsx              # CLI entry point with shebang (or .jsx)
├── test.tsx                 # Test file (or .jsx)
├── package.json             # With build, dev, start, test, lint, format, check, typecheck scripts
├── tsconfig.json            # TypeScript configuration (TypeScript only)
├── compat.json              # Generator metadata
├── readme.md                # Project README
├── LICENSE                  # MIT license
├── .gitignore               # Includes bun.lock for Bun runtime
├── .editorconfig            # Editor configuration
├── biome.json               # Biome linter config (if linter=biome)
├── eslint.config.js         # ESLint config (if linter=eslint-prettier)
├── .prettierrc              # Prettier config (if linter=eslint-prettier)
├── lefthook.yml             # Lefthook hooks (if preCommit=lefthook)
├── .husky/pre-commit        # Husky hook (if preCommit=husky)
└── vitest.config.ts         # Vitest config (Node runtime only)
```

### Generated Scripts

#### Build, Dev, Start, Test

| Script | Node + TypeScript | Node + JavaScript | Bun |
|--------|-------------------|-------------------|-----|
| `build` | `tsc` | `bun build --target=node --outdir=dist source/cli.jsx` | `bun build --target=node --outdir=dist source/cli.tsx` |
| `dev` | `tsc --watch` | `bun --watch source/cli.jsx` | `bun --watch source/cli.tsx` |
| `start` | `node dist/cli.js` | `node dist/cli.js` | `bun dist/cli.js` |
| `test` | `vitest run` | `vitest run` | `bun test` |

#### TypeScript Only

| Script | Command |
|--------|---------|
| `typecheck` | `tsc --noEmit` |

#### Lint / Format (vary by linter)

| Linter | `lint` | `format` | `check` |
|--------|--------|----------|---------|
| `biome` | `biome check source/` | `biome format --write source/` | `biome check --write source/` |
| `eslint-prettier` | `eslint source/` | `prettier --write source/` | `eslint source/ --fix` |
| `none` | — | — | — |

### Dependencies

All scaffolded projects include:
- **`ink`** `^7.1.0` — React for CLIs
- **`react`** `^19.0.0` — UI library
- **`@types/react`** — (TypeScript only)

Dev dependencies vary based on linter, test framework, pre-commit, and runtime selections.

## Scaffold Combinations

The scaffold engine supports 8 combinations:

| Runtime | Language | Linter | Pre-commit |
|---------|----------|--------|------------|
| Node / Bun | TypeScript / JavaScript | Biome / ESLint-Prettier / none | Lefthook / Husky / none |

Any combination of the above is valid.

## Error Handling

The CLI returns user-friendly error messages for these scenarios:

| Error | Cause | Solution |
|-------|-------|----------|
| `invalid_name` | Project name has invalid characters or is reserved | Use a valid npm package name |
| `directory_exists` | Target directory already exists | Use `--overwrite` or choose a different name |
| `file_system` | File system error (permissions, disk full) | Check permissions and disk space |
| `template_error` | Template processing failure | Verify the installation is intact |
| `runtime_not_found` | Required runtime (Node/Bun) not installed | Install the required runtime |
| `not_writable` | Target directory is not writable | Check directory permissions |

## License

MIT

---

<details>
<summary><strong>Development</strong> (for contributors to this tool)</summary>

### Setup

```sh
git clone <repo>
cd create-ink-app
bun install
```

### Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Run from source with watch mode |
| `bun run build` | Build to `dist/` |
| `bun run start` | Run from source |
| `bun test` | Run all tests (447 tests across 15 files) |
| `bun run lint` | Lint with Biome |
| `bun run format` | Format with Biome |
| `bun run check` | Apply lint fixes |
| `bun run typecheck` | Type-check without emitting |

### Testing

```sh
bun test              # All tests
bun run test:watch    # Watch mode
bun test --coverage   # With coverage
```

15-second default timeout; e2e tests use `tempy` for isolated temp directories.

### Architecture

The tool follows Clean Architecture with 4 layers: **Domain** (value objects, ports), **Application** (use cases, DTOs), **Interface Adapters** (file system, templates, CLI parser), and **Frameworks & Drivers** (composition root, signal handlers). Dependency direction is inward only. Uses `Result<T, E>` for explicit error handling.

</details>
