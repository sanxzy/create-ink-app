import { describe, expect, it } from 'vitest';
import { makeNodeFileSystem } from '@/infrastructure/file-system/node-file-system';
import { makeTemplateEngine } from '@/infrastructure/templates/template-engine';

// Create a real file system adapter for the template engine
const fs = makeNodeFileSystem();
const engine = makeTemplateEngine(fs);

describe('TemplateEngine', () => {
  describe('processTemplate', () => {
    it('should substitute simple variables', () => {
      const result = engine.processTemplate('Hello <% NAME %>!', { NAME: 'World' });
      expect(result).toBe('Hello World!');
    });

    it('should substitute multiple variables', () => {
      const result = engine.processTemplate('<% GREETING %>, <% NAME %>!', {
        GREETING: 'Hello',
        NAME: 'World',
      });
      expect(result).toBe('Hello, World!');
    });

    it('should handle whitespace inside markers', () => {
      const result = engine.processTemplate('Hello <%  NAME  %>!', { NAME: 'World' });
      expect(result).toBe('Hello World!');
    });

    it('should use default value when variable is missing', () => {
      const result = engine.processTemplate('Hello <% NAME|World %>!', {});
      expect(result).toBe('Hello World!');
    });

    it('should leave unreplaced placeholders intact', () => {
      const result = engine.processTemplate('Hello <% MISSING %>!', {});
      expect(result).toBe('Hello <% MISSING %>!');
    });

    it('should handle empty template', () => {
      const result = engine.processTemplate('', { NAME: 'World' });
      expect(result).toBe('');
    });

    it('should handle template with no placeholders', () => {
      const result = engine.processTemplate('Hello World!', { NAME: 'Test' });
      expect(result).toBe('Hello World!');
    });

    it('should replace all occurrences of the same variable', () => {
      const result = engine.processTemplate('<% NAME %><% NAME %><% NAME %>', { NAME: 'A' });
      expect(result).toBe('AAA');
    });
  });

  describe('getOutputFilename', () => {
    it('should strip .template suffix', () => {
      expect(engine.getOutputFilename('readme.md.template')).toBe('readme.md');
    });

    it('should handle path with template suffix', () => {
      expect(engine.getOutputFilename('src/app.tsx.template')).toBe('src/app.tsx');
    });

    it('should return unchanged if no .template suffix', () => {
      expect(engine.getOutputFilename('readme.md')).toBe('readme.md');
    });

    it('should handle multiple dots', () => {
      expect(engine.getOutputFilename('test.tsx.template')).toBe('test.tsx');
    });
  });
});
