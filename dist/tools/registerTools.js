"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAllTools = registerAllTools;
// Ensure all console.log calls are redirected to stderr in this file
// This is crucial for MCP as stdout should only contain JSON-RPC messages
const consoleLog = console.log;
console.log = function (...args) {
    console.error(...args);
};
// Import tool modules
const apiGeneratorModule = __importStar(require("./code-tools/api-generator.js"));
const authCheckerModule = __importStar(require("./code-tools/auth-checker.js"));
//import * as autoContinueModule from './code-tools/auto-continue.js';
const backupCreatorModule = __importStar(require("./code-tools/backup-creator.js"));
const buildRunnerModule = __importStar(require("./code-tools/build-runner.js"));
const cacheCleanerModule = __importStar(require("./code-tools/cache-cleaner.js"));
const cliPrompterModule = __importStar(require("./code-tools/cli-prompter.js"));
const cliToolkitModule = __importStar(require("./code-tools/cli-toolkit.js"));
const codeAnalyzerModule = __importStar(require("./code-tools/code-analyzer.js"));
const codeFixerModule = __importStar(require("./code-tools/code-fixer.js"));
const componentBuilderModule = __importStar(require("./code-tools/component-builder.js"));
const dbMigratorModule = __importStar(require("./code-tools/db-migrator.js"));
const directoryManagerModule = __importStar(require("./code-tools/directory-manager.js"));
const docGeneratorModule = __importStar(require("./code-tools/doc-generator.js"));
const duplicateFinderModule = __importStar(require("./code-tools/duplicate-finder.js"));
const envManagerModule = __importStar(require("./code-tools/env-manager.js"));
const errorLoggerModule = __importStar(require("./code-tools/error-logger.js"));
const eventDispatcherModule = __importStar(require("./code-tools/event-dispatcher.js"));
const fileEditorModule = __importStar(require("./code-tools/file-editor.js"));
const fileInfoModule = __importStar(require("./code-tools/file-info.js"));
const fileMoverModule = __importStar(require("./code-tools/file-mover.js"));
const fileReaderModule = __importStar(require("./code-tools/file-reader.js"));
const fileSearcherModule = __importStar(require("./code-tools/file-searcher.js"));
const fileWatcherModule = __importStar(require("./code-tools/file-watcher.js"));
const fileWriterModule = __importStar(require("./code-tools/file-writer.js"));
const formatterModule = __importStar(require("./code-tools/formatter.js"));
const gitInitializerModule = __importStar(require("./code-tools/git-initializer.js"));
const i18nLoaderModule = __importStar(require("./code-tools/i18n-loader.js"));
const logViewerModule = __importStar(require("./code-tools/log-viewer.js"));
const metadataReaderModule = __importStar(require("./code-tools/metadata-reader.js"));
const mockDataInserterModule = __importStar(require("./code-tools/mock-data-inserter.js"));
const notificationSenderModule = __importStar(require("./code-tools/notification-sender.js"));
const performanceMonitorModule = __importStar(require("./code-tools/performance-monitor.js"));
const pluginLoaderModule = __importStar(require("./code-tools/plugin-loader.js"));
const refactorToolModule = __importStar(require("./code-tools/refactor-tool.js"));
const schemaValidatorModule = __importStar(require("./code-tools/schema-validator.js"));
const testRunnerModule = __importStar(require("./code-tools/test-runner.js"));
const themeSwitcherModule = __importStar(require("./code-tools/theme-switcher.js"));
const tokenRefresherModule = __importStar(require("./code-tools/token-refresher.js"));
const toneAdjusterModule = __importStar(require("./code-tools/tone-adjuster.js"));
const toolSuggesterModule = __importStar(require("./code-tools/tool-suggester.js"));
const avatarRendererModule = __importStar(require("./code-tools/avatar-renderer.js"));
const voiceClonerModule = __importStar(require("./code-tools/voice-cloner.js"));
const assistantRouterModule = __importStar(require("./code-tools/assistant-router.js"));
const chatLoggerModule = __importStar(require("./code-tools/chat-logger.js"));
const personaLoaderModule = __importStar(require("./code-tools/persona-loader.js"));
const toolsDefinition = {
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
function registerAllTools(server) {
    console.error('[WARNING] The registerAllTools function is deprecated. Tools are now registered directly in main.ts.');
    console.error('[WARNING] This function does nothing and should not be used.');
}
exports.default = registerAllTools;
