/**
 * Node.js file system adapter.
 *
 * Implements the FileSystemPort declared in the domain layer.
 * All methods return Result<T, E> — never throw.
 */
import fs from 'node:fs';
import path from 'node:path';
import { err, ok } from '@/shared/errors/result';
/** Create a Node.js file system adapter */
export const makeNodeFileSystem = () => {
    const readFile = (filePath) => {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            return ok(content);
        }
        catch (error) {
            return err({
                kind: 'read_error',
                message: `Failed to read file "${filePath}": ${error.message}`,
            });
        }
    };
    const writeFile = (filePath, content) => {
        try {
            // Ensure parent directory exists
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(filePath, content, 'utf-8');
            return ok(undefined);
        }
        catch (error) {
            return err({
                kind: 'write_error',
                message: `Failed to write file "${filePath}": ${error.message}`,
            });
        }
    };
    const createDirectory = (dirPath) => {
        try {
            fs.mkdirSync(dirPath, { recursive: true });
            return ok(undefined);
        }
        catch (error) {
            return err({
                kind: 'mkdir_error',
                message: `Failed to create directory "${dirPath}": ${error.message}`,
            });
        }
    };
    const directoryExists = (dirPath) => {
        try {
            return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
        }
        catch {
            return false;
        }
    };
    const fileExists = (filePath) => {
        try {
            return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
        }
        catch {
            return false;
        }
    };
    const copyFile = (src, dest) => {
        try {
            fs.copyFileSync(src, dest);
            return ok(undefined);
        }
        catch (error) {
            return err({
                kind: 'write_error',
                message: `Failed to copy file from "${src}" to "${dest}": ${error.message}`,
            });
        }
    };
    const readDirectory = (dirPath) => {
        try {
            const entries = fs.readdirSync(dirPath);
            return ok(entries);
        }
        catch (error) {
            return err({
                kind: 'read_error',
                message: `Failed to read directory "${dirPath}": ${error.message}`,
            });
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
    };
};
//# sourceMappingURL=node-file-system.js.map