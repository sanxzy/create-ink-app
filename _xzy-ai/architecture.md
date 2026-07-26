---
generated_by: generate-architecture v0.1.0
generated_at: 2026-07-26T00:00:00Z
paradigm: fp
project_type: cli
language: typescript
framework: null
toolchain: null
---

# Architecture Reference

## 1. Overview & Purpose

This document defines the architectural principles and structural conventions for this TypeScript CLI project. It prescribes Clean Architecture layered design with a Functional Programming paradigm, guiding how code should be organized, how layers should relate, and how dependencies should flow.

**Who should read this:** All developers contributing to this codebase. Read before writing new code, and reference during code reviews.

**How to use it:** This is an advisory reference — it describes architectural principles and patterns, not a file-by-file implementation plan. The directory trees and layer descriptions remain valid as the codebase evolves. When in doubt about where code belongs or how to structure a new feature, consult the layer responsibilities and dependency direction rules below.

**Relationship to other docs:** This document complements `design.md` (UI/UX design tokens and visual patterns) and engineering specifications (`_xzy-ai/sprints/*/ticket.md`). Architecture decisions here are stable; feature-level decisions live in specs.

---

## 2. Clean Architecture Principles

Clean Architecture separates software into layers with a strict inward dependency direction. The outer layers are implementation details; the inner layers are business rules.

### The Four Layers

| Layer | Purpose | Contains | Depends On |
|-------|---------|----------|------------|
| **Entities (Domain)** | Enterprise/business rules | Value objects, domain predicates, port interfaces, pure domain services | Nothing |
| **Use Cases (Application)** | Application-specific orchestration | Use case functions, DTOs, application services | Domain only |
| **Interface Adapters** | Data conversion between layers | Mappers, repository implementations, CLI argument adapters | Domain + Application |
| **Frameworks & Drivers** | External glue code | Entry point, DI wiring, framework configuration | All inner layers |

### The Dependency Rule

```
Frameworks → Interface Adapters → Use Cases → Entities
```

- **Domain** imports from nothing — no frameworks, no databases, no IO.
- **Application** imports from domain only.
- **Adapters** import from domain and application.
- **Frameworks** import from everything.

### Relevant Anti-Patterns for CLI Projects

- **Anemic domain model** — Configuration types are just data bags with no validation logic. Domain value objects should enforce invariants (e.g., valid project name, valid runtime selection) inline.
- **Leaky abstraction** — CLI argument parser types (e.g., `mri` output) leak into use case functions. Parse at the boundary, pass clean DTOs inward.
- **Service layer obesity** — A single CLI handler that parses arguments, validates, scaffolds, and formats output. Split into individual use case functions.

---

## 3. Architectural Paradigm

**Functional Programming (FP)** — Immutability by default, pure functions for business logic, explicit effects, function composition, and Algebraic Data Types (ADTs) for domain modeling.

### Core Principles

- **Immutability by default** — All data structures are immutable. Instead of mutating, create new values with the desired changes. This eliminates bugs from shared mutable state.
- **Pure functions for business logic** — Business rules are pure functions: same input → same output, no side effects. Testable, composable, and isolated.
- **Explicit effects** — Side effects (file system IO, process execution, network calls) are explicit in type signatures and isolated at the boundaries. Never hide IO inside domain logic.
- **Function composition over inheritance** — Build complex behavior by composing small, focused functions. Prefer `pipe`/`compose` patterns.
- **Algebraic Data Types for domain modeling** — Model domain concepts using discriminated unions (sum types) and records/structs (product types). ADTs make invalid states unrepresentable.

### Result / Either Pattern

Return `Result<T, E>` instead of throwing exceptions. Makes error paths explicit and forces callers to handle them.

```typescript
// Use case functions return Result — error paths are explicit
type ScaffoldProject = (deps: Deps) => (input: Input) => Result<Project, ScaffoldError>;
```

### Dependency Injection via Function Parameters

Pass dependencies as parameters rather than using a DI container.

```typescript
// Factory pattern: dependencies injected as function parameters
const makeScaffoldProject = (
  fs: FileSystem,
  templates: TemplateProvider,
  logger: Logger
) => (input: Input): Result<Project, ScaffoldError> => {
  // use fs, templates, logger here
};
```

---

## 4. Layering & Boundaries

### Domain Layer (Entities)

- **Owns:** Immutable value objects with inline validation, domain predicates (pure functions that return booleans), port interfaces declared as function types or protocol interfaces, and pure domain services.
- **Must NOT contain:** IO operations, file system access, CLI argument parsing, framework imports, or console output.
- **Communication:** Declares what it needs via port interfaces. The domain never imports from outer layers.

### Application Layer (Use Cases)

- **Owns:** Use case functions that orchestrate domain logic and interact with ports. Each use case is a single function that performs one operation. DTOs that cross layer boundaries.
- **Must NOT contain:** Framework-specific code, direct file system calls, or CLI parsing logic.
- **Communication:** Imports from domain only. Receives port implementations from the composition root.

### Interface Adapters Layer

- **Owns:** Functions that translate between domain types and external types. Repository implementations that satisfy domain-declared ports. CLI argument adapters that convert raw parser output into clean DTOs.
- **Must NOT contain:** Business logic — only data transformation and delegation.
- **Communication:** Implements interfaces from domain and application. Calls use case functions and passes results to presenters.

### Frameworks & Drivers Layer

- **Owns:** The composition root (single entry point where all dependencies are wired). CLI framework setup, process signal handling, and bootstrap logic.
- **Must NOT contain:** Business logic — only wiring and bootstrapping.
- **Communication:** Imports from all inner layers. Creates concrete implementations and passes them to use case factories.

---

## 5. Dependency Direction

The dependency rule in practice for this CLI project:

```
CLI framework → Adapters → Use Cases → Domain
```

- **Domain** imports from nothing. It declares port interfaces as function types or TypeScript interfaces.
- **Application** imports from domain only — never from adapters or frameworks.
- **Adapters** import from domain and application. They implement domain-declared ports and call application use case functions.
- **Frameworks** import from everything. This is where the composition root lives.

**Pattern-level rule:** When a use case needs a capability (e.g., file system access), the domain declares a port interface. The adapter layer provides a concrete implementation. The composition root wires the implementation into the use case factory.

**Violation consequence:** If domain code imports a framework type (e.g., `mri` or `execa`), the domain becomes untestable in isolation and the architecture is broken. Enforce this with import linters (see Section 9).

---

## 6. Module Responsibilities

### Domain Layer

The domain layer owns the immutable domain model for this CLI's configuration and scaffolding concepts. It contains value objects with built-in validation (e.g., a valid project name that rejects reserved names and invalid characters), domain predicates that express business rules (e.g., "is this runtime valid for this language"), and port interfaces declared as function types or TypeScript interfaces that describe what capabilities the domain needs (e.g., a file system port, a template rendering port). The domain layer is pure — no IO, no framework imports, no console output.

### Application Layer

The application layer owns use case functions — each performing a single, well-defined operation such as validating a project name, resolving a configuration state from flags and defaults, or scaffolding a project from a resolved configuration. Use case functions receive their dependencies (ports) as parameters and return `Result<T, E>` to make error paths explicit. DTOs are defined here to carry data across layer boundaries, ensuring domain entities never leak into outer layers.

### Interface Adapters Layer

The adapters layer owns the translation between domain/application types and external representations. File system adapters implement the domain-declared file system port using the actual file system API. Template adapters handle template substitution and file generation. CLI argument adapters convert raw parser output into clean DTOs that the application layer can consume. Output formatters translate `Result` types into human-readable console output. This layer contains no business logic — only data transformation and delegation.

### Frameworks & Drivers Layer

The frameworks layer owns the composition root — the single entry point where all concrete implementations are created and wired into use case factories. It sets up the CLI framework, registers signal handlers, and bootstraps the application. This layer is thin: it creates dependencies, passes them to use case factories, and invokes the resulting functions. No business logic lives here.

---

## 7. Project Directory Structure

```text
src/
├── domain/                    # Entities, value objects, domain rules
│   ├── entities/              # # Domain entities with identity and invariants
│   ├── value-objects/         # # Immutable validated value objects
│   ├── repositories/          # # Port interfaces (function types)
│   └── services/              # # Pure domain services and predicates
│
├── application/               # Use cases, DTOs
│   ├── commands/              # # Use case functions (one operation each)
│   ├── dtos/                  # # Data transfer objects across boundaries
│   └── services/              # # Application-level orchestration services
│
├── infrastructure/            # Adapters: file system, templates, CLI parsing
│   ├── cli/                   # # CLI argument parser adapters
│   ├── file-system/           # # File system port implementations
│   ├── templates/             # # Template rendering port implementations
│   └── index.ts               # # Barrel: re-exports all infrastructure
│
├── presentation/              # CLI command definitions, formatters
│   ├── commands/              # # CLI command handlers (thin entry points)
│   ├── parsers/               # # Argument parsing and resolution logic
│   ├── formatters/            # # Output formatting (success, errors, hints)
│   └── index.ts               # # Barrel: re-exports all presentation
│
├── shared/                    # Cross-cutting: errors, types, utils
│   ├── errors/                # # Shared error types and Result helpers
│   ├── types/                 # # Shared type definitions
│   └── utils/                 # # Pure utility functions
│
├── tests/                     # # All tests (unit + integration)
│
└── index.ts                   # # Entry point: composition root (wiring)
```

### Directory Annotations

- **domain/** — The innermost layer. Contains no imports from any other layer. All code here is pure and framework-free.
- **application/** — Imports from `domain/` only. Each function in `commands/` is a single use case.
- **infrastructure/** — Imports from `domain/` and `application/`. Implements port interfaces declared in `domain/repositories/`.
- **presentation/** — Imports from `domain/`, `application/`, and `infrastructure/`. Contains CLI command handlers that are thin — parse, call use case, format output.
- **shared/** — Cross-cutting concerns. `errors/` contains the `Result` type and shared error definitions. Must not import from domain, application, or infrastructure.
- **tests/** — All test files. Tests import from `src/` modules.
- **index.ts** (entry point) — The composition root. Creates concrete implementations, wires them into use case factories, and invokes the entry use case.

---

## 8. Reference Layout

The canonical CLI layout adapted for TypeScript with FP conventions:

```text
src/
├── domain/                    # # Pure business rules, no dependencies
│   ├── entities/
│   ├── value-objects/
│   ├── repositories/          # # Port interfaces as function types
│   └── services/
│
├── application/               # # Use case functions, DTOs
│   ├── commands/
│   ├── dtos/
│   └── services/
│
├── infrastructure/            # # Adapters implementing domain ports
│   ├── cli/                   # # Argument parsing adapters
│   ├── file-system/           # # File system implementations
│   ├── templates/             # # Template processing implementations
│   └── index.ts
│
├── presentation/              # # CLI command handlers, formatters
│   ├── commands/
│   ├── parsers/
│   ├── formatters/
│   └── index.ts
│
├── shared/                    # # Cross-cutting: errors, types, utils
│   ├── errors/
│   ├── types/
│   └── utils/
│
├── tests/                     # # Unit and integration tests
│
└── index.ts                   # # Composition root: dependency wiring
```

### TypeScript-Specific Conventions

- **Module system:** ESM (`import`/`export`) — the 2026 default.
- **Path aliases:** `@/` prefix via `tsconfig.json` `paths` for clean cross-layer imports.
- **File extensions:** `.ts` for logic, `.test.ts` for tests, `.json` for config.
- **Build output:** `dist/` directory.
- **Repository interfaces:** Declared in `domain/repositories/` as TypeScript interfaces or function types.
- **Barrel files:** `index.ts` in each layer directory re-exports module contents.

### Tooling Recommendations

| Concern | Tool |
|---------|------|
| Architecture enforcement | `dependency-cruiser` |
| Import ordering | `eslint-plugin-import` |
| Layer boundary enforcement | `eslint-plugin-boundaries` |
| Formatting | `biome` (formatter) |
| Type checking | `tsc` (TypeScript compiler) |
| Testing | `vitest` |

---

## 9. Code Organization Rules

### Naming Conventions

- **Value objects** use PascalCase and describe a concept (e.g., a validated project name, a runtime selection combination).
- **Use case functions** follow verb-noun camelCase and return `Result<T, E>`.
- **Port interfaces** use descriptive names that communicate the capability they provide (e.g., a file system abstraction, a template rendering interface).
- **DTOs** use PascalCase and describe the data they carry across layer boundaries.
- **Error types** use PascalCase with an `Error` suffix.

### File Organization

- One function or type per file for domain and application layers.
- Co-locate tests with source files using `.test.ts` suffix, or group in `tests/` mirroring source structure.
- Barrel files (`index.ts`) re-export module contents at each layer boundary.

### Import Rules

- No relative imports crossing layer boundaries — use path aliases (`@/domain/...`, `@/application/...`).
- Domain layer must not import from any other layer (enforced by `dependency-cruiser`).
- Application layer imports from `domain/` only.
- Adapters import from `domain/` and `application/` only.
- Frameworks layer imports from all inner layers.

### Cross-Boundary Rules

- Always map across boundaries — never pass domain entities directly to CLI output or file system operations.
- Domain entities ≠ CLI argument types ≠ file system representations.
- Use DTOs at every boundary. The composition root maps between layers.

### Tooling Enforcement

- Configure `dependency-cruiser` with rules enforcing the dependency direction (domain imports nothing, application imports domain only).
- Configure `eslint-plugin-boundaries` to enforce layer separation.
- Run type checking (`tsc --noEmit`) and linting in CI on every commit.

---

## 10. Adoption Checklist

- [ ] Verify source code follows the directory structure — layers are respected, no business logic in the composition root
- [ ] Confirm dependency direction — domain imports nothing, application imports domain only, adapters import domain + application, frameworks import all
- [ ] Add `dependency-cruiser` rules enforcing architectural boundaries (domain → nothing, application → domain only)
- [ ] Add `eslint-plugin-boundaries` to enforce layer separation at lint time
- [ ] Review existing code for layer violations — IO leaking into domain, framework types in use cases
- [ ] Verify all use case functions return `Result<T, E>` — no unhandled exceptions for expected error paths
- [ ] Confirm domain value objects enforce invariants inline — no anemic data bags without validation
- [ ] Ensure the composition root is in one place — single entry point wires all dependencies
- [ ] Verify no CLI argument parser types leak into application or domain layers — parse at the boundary, pass clean DTOs inward
- [ ] Confirm all cross-boundary data transfer uses DTOs — domain entities never appear in CLI output or file system operations
