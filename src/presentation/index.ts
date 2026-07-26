/**
 * Presentation barrel — re-exports all presentation modules.
 */

export { runCreateApp } from '@/presentation/commands/create-app';
export {
  formatHelp,
  formatScaffoldError,
  formatScaffoldResult,
  formatScaffoldSuccess,
  formatVersion,
} from '@/presentation/formatters/output-formatter';
export { parseArgs, parsedArgsToScaffoldInput } from '@/presentation/parsers/args-parser';
