import { describe, expect, it } from 'vitest';
import { createProjectName, normalizeProjectName } from '@/domain/value-objects/project-name';

describe('createProjectName', () => {
  it('should accept a valid lowercase project name', () => {
    const result = createProjectName('my-app');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe('my-app');
    }
  });

  it('should accept a project name with dots', () => {
    const result = createProjectName('my.app');
    expect(result.ok).toBe(true);
  });

  it('should accept a scoped package name', () => {
    const result = createProjectName('@scope/my-app');
    expect(result.ok).toBe(true);
  });

  it('should accept a project name with numbers', () => {
    const result = createProjectName('my-app-2');
    expect(result.ok).toBe(true);
  });

  it('should reject an empty name', () => {
    const result = createProjectName('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('empty');
    }
  });

  it('should reject a name with only whitespace', () => {
    const result = createProjectName('   ');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('empty');
    }
  });

  it('should reject uppercase characters', () => {
    const result = createProjectName('My-App');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('invalid_character');
    }
  });

  it('should reject names starting with a dot', () => {
    const result = createProjectName('.my-app');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('invalid_character');
    }
  });

  it('should reject names starting with an underscore', () => {
    const result = createProjectName('_my-app');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('invalid_character');
    }
  });

  it('should reject reserved names', () => {
    const result = createProjectName('ink');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('reserved');
    }
  });

  it('should reject node_modules reserved name', () => {
    const result = createProjectName('node_modules');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('reserved');
    }
  });

  it('should reject names with spaces', () => {
    const result = createProjectName('my app');
    expect(result.ok).toBe(false);
  });

  it('should reject names with special characters', () => {
    const result = createProjectName('my@app!');
    expect(result.ok).toBe(false);
  });

  it('should reject names that are too long', () => {
    const longName = 'a'.repeat(215);
    const result = createProjectName(longName);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('too_long');
    }
  });
});

describe('normalizeProjectName', () => {
  it('should lowercase the name', () => {
    expect(normalizeProjectName('MyApp')).toBe('myapp');
  });

  it('should replace spaces with hyphens', () => {
    expect(normalizeProjectName('my app')).toBe('my-app');
  });

  it('should remove special characters', () => {
    expect(normalizeProjectName('my@#$app!')).toBe('myapp');
  });

  it('should handle mixed input', () => {
    expect(normalizeProjectName('  My Cool App!  ')).toBe('my-cool-app');
  });
});
