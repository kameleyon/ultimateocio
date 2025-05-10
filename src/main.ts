import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as http from 'http';
import { z } from 'zod';

// Import tool modules
import * as apiGeneratorModule from './tools/code-tools/api-generator.js';
import * as authCheckerModule from './tools/code-tools/auth-checker.js';
import * as backupCreatorModule from './tools/code-tools/backup-creator.js';
import * as buildRunnerModule from './tools/code-tools/build-runner.js';
import * as cacheCleanerModule from './tools/code-tools/cache-cleaner.js';
import * as cliPrompterModule from './tools/code-tools/cli-prompter.js';
import * as cliToolkitModule from './tools/code-tools/cli-toolkit.js';
import * as codeAnalyzerModule from './tools/code-tools/code-analyzer.js';
import * as codeFixerModule from './tools/code-tools/code-fixer.js';
import * as componentBuilderModule from './tools/code-tools/component-builder.js';
import * as dbMigratorModule from './tools/code-tools/db-migrator.js';
import * as docGeneratorModule from './tools/code-tools/doc-generator.js';
import * as duplicateFinderModule from './tools/code-tools/duplicate-finder.js';
import * as envManagerModule from './tools/code-tools/env-manager.js';
import * as errorLoggerModule from './tools/code-tools/error-logger.js';
import * as eventDispatcherModule from './tools/code-tools/event-dispatcher.js';
import * as fileWatcherModule from './tools/code-tools/file-watcher.js';
import * as formatterModule from './tools/code-tools/formatter.js';
import * as gitInitializerModule from './tools/code-tools/git-initializer.js';
import * as i18nLoaderModule from './tools/code-tools/i18n-loader.js';
import * as logViewerModule from './tools/code-tools/log-viewer.js';
import * as metadataReaderModule from './tools/code-tools/metadata-reader.js';
import * as mockDataInserterModule from './tools/code-tools/mock-data-inserter.js';
import * as notificationSenderModule from './tools/code-tools/notification-sender.js';
import * as performanceMonitorModule from './tools/code-tools/performance-monitor.js';
import * as pluginLoaderModule from './tools/code-tools/plugin-loader.js';
import * as refactorToolModule from './tools/code-tools/refactor-tool.js';
import * as schemaValidatorModule from './tools/code-tools/schema-validator.js';
import * as testRunnerModule from './tools/code-tools/test-runner.js';
import * as themeSwitcherModule from './tools/code-tools/theme-switcher.js';
import * as tokenRefresherModule from './tools/code-tools/token-refresher.js';
import * as toneAdjusterModule from './tools/code-tools/tone-adjuster.js';
import * as toolSuggesterModule from './tools/code-tools/tool-suggester.js';
import * as avatarRendererModule from './tools/code-tools/avatar-renderer.js';
import * as voiceClonerModule from './tools/code-tools/voice-cloner.js';
import * as assistantRouterModule from './tools/code-tools/assistant-router.js';
import * as chatLoggerModule from './tools/code-tools/chat-logger.js';
import * as personaLoaderModule from './tools/code-tools/persona-loader.js';

// Import file system tools
import * as directoryManagerModule from './tools/code-tools/directory-manager.js';
import * as fileReaderModule from './tools/code-tools/file-reader.js';
import * as fileWriterModule from './tools/code-tools/file-writer.js';
import * as fileInfoModule from './tools/code-tools/file-info.js';
import * as fileMoverModule from './tools/code-tools/file-mover.js';
import * as fileSearcherModule from './tools/code-tools/file-searcher.js';
import * as fileEditorModule from './tools/code-tools/file-editor.js';

// Redirect console.log to stderr to avoid interfering with JSON-RPC communication
const originalConsoleLog = console.log;
console.log = function(...args: any[]) {
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
// --- End Global Error Handlers ---

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
function logError(context: string, message: string, error?: any) {
  console.error(`[ERROR][${context}] ${message}`, error ? error : '');
}

function logInfo(context: string, message: string) {
  console.error(`[INFO][${context}] ${message}`);
}

function logDebug(context: string, message: string, data?: any) {
  if (DEBUG_MODE) {
    console.error(`[DEBUG][${context}] ${message}`, data ? data : '');
  }
}

async function main() {
  logInfo("MAIN", "Initializing McpServer...");
  
  // Create an MCP server using the official SDK
  const server = new McpServer({
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
        server.tool(
          toolName,
          toolDescription,
          async (args) => {
            try {
              let result;
              
              if (typeof module.execute === 'function') {
                // Use execute function if available
                // Use type assertion to work around TypeScript errors
                const params = args as any;
                
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
              } else if (typeof module.onCommand === 'function') {
                // Special handling for code-analyzer's onCommand(command: string, args: any)
                // Use type assertion to work around TypeScript errors
                const params = args as any;
                if (module === codeAnalyzerModule && params.command && params.arguments) {
                  result = await Promise.resolve((module.onCommand as (command: string, args: any) => any)(params.command, params.arguments));
                } else {
                  // General assumption for other onCommand tools: onCommand(input: any)
                  // Use type assertion to work around TypeScript errors
                  result = await Promise.resolve((module.onCommand as (input: any) => any)(params));
                }
              } else {
                throw new Error(`Module for "${toolName}" does not have a valid 'execute' or 'onCommand' function.`);
              }
              
              return result;
            } catch (error: any) {
              logError("TOOL_EXECUTION", `Failed to execute ${toolName}: ${error.message}`, error);
              return {
                content: [{
                  type: "text",
                  text: `Error executing ${toolName}: ${error.message}\nPlease check if the path exists and is accessible.`
                }],
                isError: true
              };
            }
          }
        );
        
        console.error(`Tool "${toolName}" registered with ID: ${toolName}`);
        registeredCount++;
      } catch (error: any) {
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
  
  keepAliveServer.listen(0, '127.0.0.1', () => { // Listen on a random available port on localhost
    const port = (keepAliveServer.address() as import('net').AddressInfo).port;
    console.error(`--- Keep-alive server running on http://127.0.0.1:${port} (internal use only) ---`);
  });
  
  // Prevent this server from keeping the process alive if it's the *only* thing left.
  keepAliveServer.unref();

  // Start receiving messages on stdin and sending messages on stdout
  console.error("Starting MCPServer...");
  const transport = new StdioServerTransport();
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