/**
 * Infrastructure barrel — re-exports all infrastructure modules.
 */

export {
  detectPackageManager,
  isAIAgent,
  isInteractive,
} from '@/infrastructure/cli/environment-detector';
export { makeNodeFileSystem } from '@/infrastructure/file-system/node-file-system';
export { makeTemplateEngine } from '@/infrastructure/templates/template-engine';
