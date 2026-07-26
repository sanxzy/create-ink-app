/**
 * Presentation barrel — re-exports all presentation modules.
 */

export { runCreateApp } from '@/presentation/commands/create-app';
export {
  formatAIAgentHint,
  formatHelp,
  formatNonInteractiveHint,
  formatScaffoldError,
  formatScaffoldResult,
  formatScaffoldSuccess,
  formatVersion,
} from '@/presentation/formatters/output-formatter';
export { parseArgs, parsedArgsToScaffoldInput } from '@/presentation/parsers/args-parser';
export { runInteractiveWizard } from '@/presentation/wizard/interactive-wizard';
