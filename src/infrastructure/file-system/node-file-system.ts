/**
 * Node.js file system adapter.
 *
 * Implements the FileSystemPort declared in the domain layer.
 * All methods return Result<T, E> — never throw.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { FileSystemError, FileSystemPort } from '@/domain/repositories/ports';
import type { Result } from '@/shared/errors/result';
import { err, ok } from '@/shared/errors/result';

/** Create a Node.js file system adapter */
export const makeNodeFileSystem = (): FileSystemPort => {
  const readFile = (filePath: string): Result<string, FileSystemError> => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return ok(content);
    } catch (error) {
      return err({
        kind: 'read_error',
        message: `Failed to read file "${filePath}": ${(error as Error).message}`,
      });
    }
  };

  const writeFile = (filePath: string, content: string): Result<void, FileSystemError> => {
    try {
      // Ensure parent directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, content, 'utf-8');
      return ok(undefined);
    } catch (error) {
      return err({
        kind: 'write_error',
        message: `Failed to write file "${filePath}": ${(error as Error).message}`,
      });
    }
  };

  const createDirectory = (dirPath: string): Result<void, FileSystemError> => {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      return ok(undefined);
    } catch (error) {
      return err({
        kind: 'mkdir_error',
        message: `Failed to create directory "${dirPath}": ${(error as Error).message}`,
      });
    }
  };

  const directoryExists = (dirPath: string): boolean => {
    try {
      return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    } catch {
      return false;
    }
  };

  const fileExists = (filePath: string): boolean => {
    try {
      return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    } catch {
      return false;
    }
  };

  const copyFile = (src: string, dest: string): Result<void, FileSystemError> => {
    try {
      fs.copyFileSync(src, dest);
      return ok(undefined);
    } catch (error) {
      return err({
        kind: 'write_error',
        message: `Failed to copy file from "${src}" to "${dest}": ${(error as Error).message}`,
      });
    }
  };

  const readDirectory = (dirPath: string): Result<string[], FileSystemError> => {
    try {
      const entries = fs.readdirSync(dirPath);
      return ok(entries);
    } catch (error) {
      return err({
        kind: 'read_error',
        message: `Failed to read directory "${dirPath}": ${(error as Error).message}`,
      });
    }
  };

  const isWritable = (dirPath: string): boolean => {
    try {
      fs.accessSync(dirPath, fs.constants.W_OK);
      return true;
    } catch {
      // If the directory doesn't exist, check the parent
      try {
        const parent = path.dirname(path.resolve(dirPath));
        fs.accessSync(parent, fs.constants.W_OK);
        return true;
      } catch {
        return false;
      }
    }
  };

  return {
    readFile,
    writeFile,
    createDirectory,
    directoryExists,
    fileExists,
    copyFile,
    readDirectory,
    isWritable,
  };
};
