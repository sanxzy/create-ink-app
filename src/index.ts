#!/usr/bin/env node

/**
 * Composition root — entry point for the create-ink-app CLI.
 *
 * Wires all dependencies:
 *   - Creates concrete implementations (file system, template engine)
 *   - Passes them to use case factories
 *   - Invokes the CLI handler
 */

import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeScaffoldProject } from '@/application/commands/scaffold-project';
import {
  makeBunRuntimeChecker,
  makeNodeRuntimeChecker,
} from '@/infrastructure/cli/runtime-checker';
import { makeNodeFileSystem } from '@/infrastructure/file-system/node-file-system';
import { makeTemplateEngine } from '@/infrastructure/templates/template-engine';
import { runCreateApp } from '@/presentation/commands/create-app';
import type { Runtime } from '@/shared/types';

import pkg from '../package.json' with { type: 'json' };

// Resolve the package root directory to find templates/
// When running from source (via bun), import.meta.url points to src/index.ts
// When running compiled output, it points to dist/index.js
const __filename = fileURLToPath(import.meta.url);
const packageRoot = path.resolve(path.dirname(__filename), '..');

// Create infrastructure implementations
const fs = makeNodeFileSystem();
const templates = makeTemplateEngine(fs);

// Create runtime checkers for both Node.js and Bun
const checkNodeRuntime = makeNodeRuntimeChecker();
const checkBunRuntime = makeBunRuntimeChecker();

// Combined runtime checker — selects the right checker based on runtime
const checkRuntime = (runtime: Runtime) => {
  if (runtime === 'bun') return checkBunRuntime();
  return checkNodeRuntime();
};

// Create the use case with injected dependencies
const scaffoldProject = makeScaffoldProject({
  fs,
  templates,
  templatesDir: path.join(packageRoot, 'templates'),
  checkRuntime,
});

// Run the CLI — now async to support the interactive wizard
runCreateApp(scaffoldProject, { version: pkg.version });
