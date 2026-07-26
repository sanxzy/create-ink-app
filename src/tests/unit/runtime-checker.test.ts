/**
 * Unit tests for runtime checker implementations.
 */

import { describe, expect, it } from 'vitest';
import {
  makeBunRuntimeChecker,
  makeNodeRuntimeChecker,
} from '@/infrastructure/cli/runtime-checker';

describe('runtime checker', () => {
  describe('makeNodeRuntimeChecker', () => {
    it('should return a function', () => {
      const checker = makeNodeRuntimeChecker();
      expect(typeof checker).toBe('function');
    });

    it('should return a Result type', () => {
      const checker = makeNodeRuntimeChecker();
      const result = checker();
      expect(result).toHaveProperty('ok');
    });
  });

  describe('makeBunRuntimeChecker', () => {
    it('should return a function', () => {
      const checker = makeBunRuntimeChecker();
      expect(typeof checker).toBe('function');
    });

    it('should return a Result type', () => {
      const checker = makeBunRuntimeChecker();
      const result = checker();
      expect(result).toHaveProperty('ok');
    });
  });
});
