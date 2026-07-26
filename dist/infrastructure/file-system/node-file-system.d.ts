/**
 * Node.js file system adapter.
 *
 * Implements the FileSystemPort declared in the domain layer.
 * All methods return Result<T, E> — never throw.
 */
import type { FileSystemPort } from '@/domain/repositories/ports';
/** Create a Node.js file system adapter */
export declare const makeNodeFileSystem: () => FileSystemPort;
//# sourceMappingURL=node-file-system.d.ts.map