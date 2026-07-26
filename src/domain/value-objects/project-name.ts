/**
 * ProjectName value object.
 *
 * Immutable value object that enforces valid npm package name rules inline.
 * - Must not be empty
 * - Must be a valid npm package name (lowercase, no spaces, no special chars except - and _)
 * - Must not be a reserved npm package name
 * - Must not contain leading dots or underscores (except scoped packages starting with @)
 */

import type { Result } from '@/shared/errors/result';
import { err, ok } from '@/shared/errors/result';

/** Reserved package names that cannot be used as project names */
const RESERVED_NAMES = new Set([
  'node_modules',
  'favicon.ico',
  'create-ink-app',
  'ink',
  'react',
  'npm',
  'node',
  'bun',
]);

export interface ProjectName {
  readonly value: string;
}

export type ProjectNameError =
  | { kind: 'empty'; message: string }
  | { kind: 'invalid_character'; message: string }
  | { kind: 'reserved'; message: string }
  | { kind: 'too_long'; message: string };

const MAX_LENGTH = 214;

/** Create a ProjectName after validating the input */
export const createProjectName = (input: string): Result<ProjectName, ProjectNameError> => {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return err({
      kind: 'empty',
      message: 'Project name cannot be empty.',
    });
  }

  if (trimmed.length > MAX_LENGTH) {
    return err({
      kind: 'too_long',
      message: `Project name must be ${MAX_LENGTH} characters or fewer.`,
    });
  }

  // Scoped packages start with @
  if (trimmed.startsWith('@')) {
    const scopeAndName = trimmed.slice(1);
    const parts = scopeAndName.split('/');
    if (parts.length !== 2 || parts[0].length === 0 || parts[1].length === 0) {
      return err({
        kind: 'invalid_character',
        message: `"${trimmed}" is not a valid scoped package name. Use format @scope/name.`,
      });
    }
  }

  // Must be lowercase
  if (trimmed !== trimmed.toLowerCase()) {
    return err({
      kind: 'invalid_character',
      message: `"${trimmed}" is not a valid project name. Use lowercase characters only.`,
    });
  }

  // Must not start with a dot or underscore (except scoped packages)
  if (!trimmed.startsWith('@')) {
    if (trimmed.startsWith('.') || trimmed.startsWith('_')) {
      return err({
        kind: 'invalid_character',
        message: `"${trimmed}" is not a valid project name. Project name cannot start with a dot or underscore.`,
      });
    }
  }

  // Validate characters: only allow [a-z0-9_-.~/] after @scope/ prefix
  const validPattern = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
  if (!validPattern.test(trimmed)) {
    return err({
      kind: 'invalid_character',
      message: `"${trimmed}" is not a valid project name. Use only lowercase letters, numbers, hyphens, underscores, and dots.`,
    });
  }

  // Check reserved names (for unscoped packages, check the name part; for scoped, check the name after @scope/)
  const namePart = trimmed.startsWith('@') ? trimmed.split('/')[1] : trimmed;
  if (RESERVED_NAMES.has(namePart)) {
    return err({
      kind: 'reserved',
      message: `"${namePart}" is a reserved package name and cannot be used as a project name.`,
    });
  }

  return ok({ value: trimmed });
};

/**
 * Normalize a project name for use in templates (lowercase, replace spaces with hyphens).
 *
 * WARNING: This function is NOT safe for file path construction. The output preserves
 * dots (`.`) and underscores (`_`), which could permit path traversal sequences (`..`)
 * if used in file system operations. Use `createProjectName()` for validated names
 * suitable for directory creation.
 */
export const normalizeProjectName = (input: string): string => {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_.]/g, '');
};
