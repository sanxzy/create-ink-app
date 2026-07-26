/**
 * Test fixtures for the create-ink-app E2E tests.
 *
 * Provides a `createState()` helper that creates a complete ScaffoldInput
 * with sensible defaults, allowing tests to override only the fields they care about.
 */

import type { ScaffoldInput } from '@/application/dtos/scaffold-input';
import { DEFAULT_SCAFFOLD_INPUT } from '@/application/dtos/scaffold-input';

/**
 * Create a complete scaffold state by merging overrides on top of defaults.
 * Use this in tests to avoid repeating all required fields.
 *
 * @example
 * const state = createState({ runtime: 'bun', language: 'javascript' });
 */
export const createState = (overrides?: Partial<ScaffoldInput>): ScaffoldInput => ({
  ...DEFAULT_SCAFFOLD_INPUT,
  projectName: 'test-app',
  ...overrides,
});

/** Default project name used by createState when not overridden */
export const DEFAULT_PROJECT_NAME = 'test-app';
