import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Ensure all console.log calls are redirected to stderr in this file
// This is crucial for MCP as stdout should only contain JSON-RPC messages
const consoleLog = console.log;
console.log = function(...args: any[]) {
  console.error(...args);
};

// Import tool modules
import * as apiGeneratorModule from './code-tools/api-generator.js';
import * as authCheckerModule from './code-tools/auth-checker.js';
//import * as autoContinueModule from './code-tools/auto-continue.js';
import * as backupCreatorModule from './code-tools/backup-creator.js';
import * as buildRunnerModule from './code-tools/build-runner.js';
import * as cacheCleanerModule from './code-tools/cache-cleaner.js';
import * as cliPrompterModule from './code-tools/cli-prompter.js';
import * as cliToolkitModule from './code-tools/cli-toolkit.js';
import * as codeAnalyzerModule from './code-tools/code-analyzer.js';
import * as codeFixerModule from './code-tools/code-fixer.js';
import * as componentBuilderModule from './code-tools/component-builder.js';
import * as dbMigratorModule from './code-tools/db-migrator.js';
import * as directoryManagerModule from './code-tools/directory-manager.js';
import * as docGeneratorModule from './code-tools/doc-generator.js';
import * as duplicateFinderModule from './code-tools/duplicate-finder.js';
import * as envManagerModule from './code-tools/env-manager.js';
import * as errorLoggerModule from './code-tools/error-logger.js';
import * as eventDispatcherModule from './code-tools/event-dispatcher.js';
import * as fileEditorModule from './code-tools/file-editor.js';
import * as fileInfoModule from './code-tools/file-info.js';
import * as fileMoverModule from './code-tools/file-mover.js';
import * as fileReaderModule from './code-tools/file-reader.js';
import * as fileSearcherModule from './code-tools/file-searcher.js';
import * as fileWatcherModule from './code-tools/file-watcher.js';
import * as fileWriterModule from './code-tools/file-writer.js';
import * as formatterModule from './code-tools/formatter.js';
import * as gitInitializerModule from './code-tools/git-initializer.js';
import * as i18nLoaderModule from './code-tools/i18n-loader.js';
import * as logViewerModule from './code-tools/log-viewer.js';
import * as metadataReaderModule from './code-tools/metadata-reader.js';
import * as mockDataInserterModule from './code-tools/mock-data-inserter.js';
import * as notificationSenderModule from './code-tools/notification-sender.js';
import * as performanceMonitorModule from './code-tools/performance-monitor.js';
import * as pluginLoaderModule from './code-tools/plugin-loader.js';
import * as refactorToolModule from './code-tools/refactor-tool.js';
import * as schemaValidatorModule from './code-tools/schema-validator.js';
import * as testRunnerModule from './code-tools/test-runner.js';
import * as themeSwitcherModule from './code-tools/theme-switcher.js';
import * as tokenRefresherModule from './code-tools/token-refresher.js';
import * as toneAdjusterModule from './code-tools/tone-adjuster.js';
import * as toolSuggesterModule from './code-tools/tool-suggester.js';
import * as avatarRendererModule from './code-tools/avatar-renderer.js';
import * as voiceClonerModule from './code-tools/voice-cloner.js';
import * as assistantRouterModule from './code-tools/assistant-router.js';
import * as chatLoggerModule from './code-tools/chat-logger.js';
import * as personaLoaderModule from './code-tools/persona-loader.js';

interface BaseToolModule {
  toolName?: string;
  toolDescription?: string;
  execute?: (input: any) => Promise<any>; // Preferred
  inputSchema?: z.ZodType<any>;
  outputSchema?: z.ZodType<any>;
  onCommand?: Function; // Generic fallback for varied onCommand signatures
  [key: string]: any;
}

const toolsDefinition: Record<string, { module: BaseToolModule, defaultDescription: string }> = {
  'api-generator': { module: apiGeneratorModule, defaultDescription: 'API generator including individual endpoint creation' },
  'auth-checker': { module: authCheckerModule, defaultDescription: 'Auth checker by validating session tokens' },
  //'auto-continue': { module: autoContinueModule, defaultDescription: 'Auto continue tool' },
  'backup-creator': { module: backupCreatorModule, defaultDescription: 'Backup creator and restores previous states' },
  'build-runner': { module: buildRunnerModule, defaultDescription: 'Build runner and triggers deployment pipelines' },
  'cache-cleaner': { module: cacheCleanerModule, defaultDescription: 'Cache cleaner and optimizes memory usage' },
  'cli-prompter': { module: cliPrompterModule, defaultDescription: 'CLI prompter including full interactive wizards' },
  'cli-toolkit': { module: cliToolkitModule, defaultDescription: 'CLI toolkit' },
  'code-analyzer': { module: codeAnalyzerModule, defaultDescription: 'Code analyzer' },
  'code-fixer': { module: codeFixerModule, defaultDescription: 'Code fixer' },
  'component-builder': { module: componentBuilderModule, defaultDescription: 'Component builder' },
  'db-migrator': { module: dbMigratorModule, defaultDescription: 'DB migrator and updates database schemas' },
  'directory-manager': { module: directoryManagerModule, defaultDescription: 'Manage directories with create, list, and tree operations' },
  'doc-generator': { module: docGeneratorModule, defaultDescription: 'Doc generator including README.md files' },
  'duplicate-finder': { module: duplicateFinderModule, defaultDescription: 'Duplicate finder' },
  'env-manager': { module: envManagerModule, defaultDescription: 'Env manager and loads config settings' },
  'error-logger': { module: errorLoggerModule, defaultDescription: 'Error logger' },
  'event-dispatcher': { module: eventDispatcherModule, defaultDescription: 'Event dispatcher and invokes reactive hooks' },
  'file-editor': { module: fileEditorModule, defaultDescription: 'Edit files with advanced pattern matching and formatting' },
  'file-info': { module: fileInfoModule, defaultDescription: 'Get detailed metadata about files and directories' },
  'file-mover': { module: fileMoverModule, defaultDescription: 'Move or rename files and directories' },
  'file-reader': { module: fileReaderModule, defaultDescription: 'Read file contents with support for single and multiple files' },
  'file-searcher': { module: fileSearcherModule, defaultDescription: 'Search for files and directories with pattern matching' },
  'file-watcher': { module: fileWatcherModule, defaultDescription: 'File watcher' },
  'file-writer': { module: fileWriterModule, defaultDescription: 'Write content to files with support for creating directories' },
  'formatter': { module: formatterModule, defaultDescription: 'Formatter' },
  'git-initializer': { module: gitInitializerModule, defaultDescription: 'Git initializer' },
  'i18n-loader': { module: i18nLoaderModule, defaultDescription: 'I18n loader and switches between languages' },
  'log-viewer': { module: logViewerModule, defaultDescription: 'Log viewer' },
  'metadata-reader': { module: metadataReaderModule, defaultDescription: 'Metadata reader and parses file contents' },
  'mock-data-inserter': { module: mockDataInserterModule, defaultDescription: 'Mock data inserter' },
  'notification-sender': { module: notificationSenderModule, defaultDescription: 'Notification sender and manages alert thresholds' },
  'performance-monitor': { module: performanceMonitorModule, defaultDescription: 'Performance monitor including detailed latency metrics' },
  'plugin-loader': { module: pluginLoaderModule, defaultDescription: 'Plugin loader including extension initialization' },
  'refactor-tool': { module: refactorToolModule, defaultDescription: 'Refactor tool including variable/class renaming' },
  'schema-validator': { module: schemaValidatorModule, defaultDescription: 'Schema validator' },
  'test-runner': { module: testRunnerModule, defaultDescription: 'Test runner' },
  'theme-switcher': { module: themeSwitcherModule, defaultDescription: 'Theme switcher and manages layout configuration' },
  'token-refresher': { module: tokenRefresherModule, defaultDescription: 'Token refresher and decodes JWTs for inspection and validation' },
  'tone-adjuster': { module: toneAdjusterModule, defaultDescription: 'Tone adjuster' },
  'tool-suggester': { module: toolSuggesterModule, defaultDescription: 'Tool suggester by listing available tool capabilities' },
  'avatar-renderer': { module: avatarRendererModule, defaultDescription: 'Avatar renderer' },
  'voice-cloner': { module: voiceClonerModule, defaultDescription: 'Voice cloner' },
  'assistant-router': { module: assistantRouterModule, defaultDescription: 'Assistant router' },
  'chat-logger': { module: chatLoggerModule, defaultDescription: 'Chat logger' },
  'persona-loader': { module: personaLoaderModule, defaultDescription: 'Persona loader' }
};

/**
 * @deprecated This function is deprecated. Tools are now registered directly in main.ts.
 * This file is kept for reference only and should not be used.
 */
export function registerAllTools(server: any): void {
  console.error('[WARNING] The registerAllTools function is deprecated. Tools are now registered directly in main.ts.');
  console.error('[WARNING] This function does nothing and should not be used.');
}

export default registerAllTools;