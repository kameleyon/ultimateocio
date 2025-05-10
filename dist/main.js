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
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const http = __importStar(require("http"));
// Import tool modules
const apiGeneratorModule = __importStar(require("./tools/code-tools/api-generator.js"));
const authCheckerModule = __importStar(require("./tools/code-tools/auth-checker.js"));
const backupCreatorModule = __importStar(require("./tools/code-tools/backup-creator.js"));
const buildRunnerModule = __importStar(require("./tools/code-tools/build-runner.js"));
const cacheCleanerModule = __importStar(require("./tools/code-tools/cache-cleaner.js"));
const cliPrompterModule = __importStar(require("./tools/code-tools/cli-prompter.js"));
const cliToolkitModule = __importStar(require("./tools/code-tools/cli-toolkit.js"));
const codeAnalyzerModule = __importStar(require("./tools/code-tools/code-analyzer.js"));
const codeFixerModule = __importStar(require("./tools/code-tools/code-fixer.js"));
const componentBuilderModule = __importStar(require("./tools/code-tools/component-builder.js"));
const dbMigratorModule = __importStar(require("./tools/code-tools/db-migrator.js"));
const docGeneratorModule = __importStar(require("./tools/code-tools/doc-generator.js"));
const duplicateFinderModule = __importStar(require("./tools/code-tools/duplicate-finder.js"));
const envManagerModule = __importStar(require("./tools/code-tools/env-manager.js"));
const errorLoggerModule = __importStar(require("./tools/code-tools/error-logger.js"));
const eventDispatcherModule = __importStar(require("./tools/code-tools/event-dispatcher.js"));
const fileWatcherModule = __importStar(require("./tools/code-tools/file-watcher.js"));
const formatterModule = __importStar(require("./tools/code-tools/formatter.js"));
const gitInitializerModule = __importStar(require("./tools/code-tools/git-initializer.js"));
const i18nLoaderModule = __importStar(require("./tools/code-tools/i18n-loader.js"));
const logViewerModule = __importStar(require("./tools/code-tools/log-viewer.js"));
const metadataReaderModule = __importStar(require("./tools/code-tools/metadata-reader.js"));
const mockDataInserterModule = __importStar(require("./tools/code-tools/mock-data-inserter.js"));
const notificationSenderModule = __importStar(require("./tools/code-tools/notification-sender.js"));
const performanceMonitorModule = __importStar(require("./tools/code-tools/performance-monitor.js"));
const pluginLoaderModule = __importStar(require("./tools/code-tools/plugin-loader.js"));
const refactorToolModule = __importStar(require("./tools/code-tools/refactor-tool.js"));
const schemaValidatorModule = __importStar(require("./tools/code-tools/schema-validator.js"));
const testRunnerModule = __importStar(require("./tools/code-tools/test-runner.js"));
const themeSwitcherModule = __importStar(require("./tools/code-tools/theme-switcher.js"));
const tokenRefresherModule = __importStar(require("./tools/code-tools/token-refresher.js"));
const toneAdjusterModule = __importStar(require("./tools/code-tools/tone-adjuster.js"));
const toolSuggesterModule = __importStar(require("./tools/code-tools/tool-suggester.js"));
const avatarRendererModule = __importStar(require("./tools/code-tools/avatar-renderer.js"));
const voiceClonerModule = __importStar(require("./tools/code-tools/voice-cloner.js"));
const assistantRouterModule = __importStar(require("./tools/code-tools/assistant-router.js"));
const chatLoggerModule = __importStar(require("./tools/code-tools/chat-logger.js"));
const personaLoaderModule = __importStar(require("./tools/code-tools/persona-loader.js"));
// Import file system tools
const directoryManagerModule = __importStar(require("./tools/code-tools/directory-manager.js"));
const fileReaderModule = __importStar(require("./tools/code-tools/file-reader.js"));
const fileWriterModule = __importStar(require("./tools/code-tools/file-writer.js"));
const fileInfoModule = __importStar(require("./tools/code-tools/file-info.js"));
const fileMoverModule = __importStar(require("./tools/code-tools/file-mover.js"));
const fileSearcherModule = __importStar(require("./tools/code-tools/file-searcher.js"));
const fileEditorModule = __importStar(require("./tools/code-tools/file-editor.js"));
// Redirect console.log to stderr to avoid interfering with JSON-RPC communication
const originalConsoleLog = console.log;
console.log = function (...args) {
    console.error(...args);
};
console.error("MCP Server Booting...");
// --- Global Error Handlers ---
process.on('uncaughtException', (error) => {
    console.error('[MCP CRASH]', error.stack || error);
    // Don't exit the process, just log the error
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('!!! Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process, just log the error
});
// Prevent the process from exiting when stdin ends
process.stdin.on('end', () => {
    console.error('stdin ended, but keeping process alive');
    // Don't exit the process
});
// Prevent the process from exiting when stdout closes
process.stdout.on('close', () => {
    console.error('stdout closed, but keeping process alive');
    // Don't exit the process
});
// Keep the process alive even if there are no active handles
setInterval(() => {
    // This empty interval keeps the event loop active
}, 1000);
const toolsDefinition = {
    'api-generator': { module: apiGeneratorModule, defaultDescription: 'API generator including individual endpoint creation' },
    'auth-checker': { module: authCheckerModule, defaultDescription: 'Auth checker by validating session tokens' },
    'backup-creator': { module: backupCreatorModule, defaultDescription: 'Backup creator and restores previous states' },
    'build-runner': { module: buildRunnerModule, defaultDescription: 'Build runner and triggers deployment pipelines' },
    'cache-cleaner': { module: cacheCleanerModule, defaultDescription: 'Cache cleaner and optimizes memory usage' },
    'cli-prompter': { module: cliPrompterModule, defaultDescription: 'CLI prompter including full interactive wizards' },
    'cli-toolkit': { module: cliToolkitModule, defaultDescription: 'CLI toolkit' },
    'code-analyzer': { module: codeAnalyzerModule, defaultDescription: 'Code analyzer' },
    'code-fixer': { module: codeFixerModule, defaultDescription: 'Code fixer' },
    'component-builder': { module: componentBuilderModule, defaultDescription: 'Component builder' },
    'db-migrator': { module: dbMigratorModule, defaultDescription: 'DB migrator and updates database schemas' },
    'doc-generator': { module: docGeneratorModule, defaultDescription: 'Doc generator including README.md files' },
    'duplicate-finder': { module: duplicateFinderModule, defaultDescription: 'Duplicate finder' },
    'env-manager': { module: envManagerModule, defaultDescription: 'Env manager and loads config settings' },
    'error-logger': { module: errorLoggerModule, defaultDescription: 'Error logger' },
    'event-dispatcher': { module: eventDispatcherModule, defaultDescription: 'Event dispatcher and invokes reactive hooks' },
    'file-watcher': { module: fileWatcherModule, defaultDescription: 'File watcher' },
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
    'persona-loader': { module: personaLoaderModule, defaultDescription: 'Persona loader' },
    // Add file system tools
    'directory-manager': { module: directoryManagerModule, defaultDescription: 'Manage directories with create, list, and tree operations' },
    'file-reader': { module: fileReaderModule, defaultDescription: 'Read file contents with support for single and multiple files' },
    'file-writer': { module: fileWriterModule, defaultDescription: 'Write content to files with support for creating directories' },
    'file-info': { module: fileInfoModule, defaultDescription: 'Get detailed metadata about files and directories' },
    'file-mover': { module: fileMoverModule, defaultDescription: 'Move or rename files and directories' },
    'file-searcher': { module: fileSearcherModule, defaultDescription: 'Search for files and directories with pattern matching' },
    'file-editor': { module: fileEditorModule, defaultDescription: 'Edit files with advanced pattern matching and formatting' }
};
// Configure debug mode
const DEBUG_MODE = true; // Set to false in production
// Configure structured logging
function logError(context, message, error) {
    console.error(`[ERROR][${context}] ${message}`, error ? error : '');
}
function logInfo(context, message) {
    console.error(`[INFO][${context}] ${message}`);
}
function logDebug(context, message, data) {
    if (DEBUG_MODE) {
        console.error(`[DEBUG][${context}] ${message}`, data ? data : '');
    }
}
async function main() {
    logInfo("MAIN", "Initializing McpServer...");
    // Create an MCP server using the official SDK
    const server = new mcp_js_1.McpServer({
        name: "ultimateocio-mcp",
        version: "1.0.0"
    });
    logInfo("TOOLS", "Registering tools...");
    // Register all tools
    let registeredCount = 0;
    for (const toolKey in toolsDefinition) {
        if (Object.prototype.hasOwnProperty.call(toolsDefinition, toolKey)) {
            const toolEntry = toolsDefinition[toolKey];
            if (!toolEntry || !toolEntry.module) {
                console.warn(`[TOOLS] Invalid or missing module for tool key "${toolKey}". Skipping.`);
                continue;
            }
            const { module, defaultDescription } = toolEntry;
            try {
                const toolName = module.toolName || toolKey;
                const toolDescription = module.toolDescription || defaultDescription;
                // Use the simplest form of tool registration
                server.tool(toolName, toolDescription, async (args) => {
                    try {
                        let result;
                        if (typeof module.execute === 'function') {
                            // Use execute function if available
                            // Use type assertion to work around TypeScript errors
                            const params = args;
                            // Handle the case where the operation is missing for directory-manager
                            if (params && !params.operation && module === directoryManagerModule) {
                                logDebug("TOOL_EXECUTION", "Adding default operation for directory-manager", params);
                                params.operation = 'list_directory';
                                if (params.path) {
                                    params.params = { path: params.path };
                                }
                            }
                            logDebug("TOOL_EXECUTION", `Executing ${toolName} with params:`, params);
                            result = await module.execute(params);
                        }
                        else if (typeof module.onCommand === 'function') {
                            // Special handling for code-analyzer's onCommand(command: string, args: any)
                            // Use type assertion to work around TypeScript errors
                            const params = args;
                            if (module === codeAnalyzerModule && params.command && params.arguments) {
                                result = await Promise.resolve(module.onCommand(params.command, params.arguments));
                            }
                            else {
                                // General assumption for other onCommand tools: onCommand(input: any)
                                // Use type assertion to work around TypeScript errors
                                result = await Promise.resolve(module.onCommand(params));
                            }
                        }
                        else {
                            throw new Error(`Module for "${toolName}" does not have a valid 'execute' or 'onCommand' function.`);
                        }
                        return result;
                    }
                    catch (error) {
                        // Enhanced error logging with more context
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        const errorStack = error instanceof Error ? error.stack : '';
                        logError("TOOL_EXECUTION", `Failed to execute ${toolName}: ${errorMessage}`, { error, args, toolName, stack: errorStack });
                        // More detailed error message for the client
                        let detailedMessage = `Error executing ${toolName}: ${errorMessage}`;
                        // Add specific guidance for directory access errors
                        if (errorMessage.includes('Access to path') ||
                            errorMessage.includes('does not exist') ||
                            errorMessage.includes('ENOENT')) {
                            // Safely extract path and operation from args
                            let pathInfo = 'No path provided';
                            let operationInfo = 'No operation specified';
                            try {
                                const argsObj = args;
                                if (typeof argsObj === 'object' && argsObj !== null) {
                                    if (argsObj.path) {
                                        pathInfo = argsObj.path;
                                    }
                                    else if (argsObj.params && argsObj.params.path) {
                                        pathInfo = argsObj.params.path;
                                    }
                                    if (argsObj.operation) {
                                        operationInfo = argsObj.operation;
                                    }
                                }
                            }
                            catch (e) {
                                // Ignore extraction errors
                            }
                            detailedMessage += `\n\nThis appears to be a directory access issue. Please check:
1. The path exists: ${pathInfo}
2. The path is within allowed directories
3. The correct operation is being used: ${operationInfo}`;
                        }
                        return {
                            content: [{
                                    type: "text",
                                    text: detailedMessage
                                }],
                            isError: true
                        };
                    }
                });
                console.error(`Tool "${toolName}" registered with ID: ${toolName}`);
                registeredCount++;
            }
            catch (error) {
                const toolNameForError = module.toolName || toolKey;
                console.error(`[TOOLS] Failed to prepare or register tool "${toolNameForError}": ${error.message}`, error);
            }
        }
    }
    console.error(`[TOOLS] Successfully prepared and attempted to register ${registeredCount} tools.`);
    // Create a minimal server just to keep the Node.js process alive.
    const keepAliveServer = http.createServer((req, res) => {
        res.writeHead(501); // Not Implemented
        res.end();
    });
    keepAliveServer.listen(0, '127.0.0.1', () => {
        const port = keepAliveServer.address().port;
        console.error(`--- Keep-alive server running on http://127.0.0.1:${port} (internal use only) ---`);
    });
    // Prevent this server from keeping the process alive if it's the *only* thing left.
    keepAliveServer.unref();
    // Start receiving messages on stdin and sending messages on stdout
    console.error("Starting MCPServer...");
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("MCPServer is running. Waiting for messages from Claude Desktop via stdin.");
    // Graceful shutdown handling without actually exiting
    process.on('SIGINT', () => {
        console.error("SIGINT received. Logging but not shutting down MCPServer...");
        console.error("Ignoring SIGINT to keep MCP server alive");
    });
    process.on('SIGTERM', () => {
        console.error("SIGTERM received. Logging but not shutting down MCPServer...");
        console.error("Ignoring SIGTERM to keep MCP server alive");
    });
}
main().catch(error => {
    console.error("Error in main:", error);
});
