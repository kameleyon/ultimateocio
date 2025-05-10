import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ListPromptsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ExecuteCommandArgsSchema, ReadOutputArgsSchema, ForceTerminateArgsSchema, ListSessionsArgsSchema, KillProcessArgsSchema, ReadFileArgsSchema, ReadMultipleFilesArgsSchema, WriteFileArgsSchema, CreateDirectoryArgsSchema, ListDirectoryArgsSchema, MoveFileArgsSchema, SearchFilesArgsSchema, GetFileInfoArgsSchema, EditBlockArgsSchema, SearchCodeArgsSchema, GetConfigArgsSchema, SetConfigValueArgsSchema, ListProcessesArgsSchema, } from './tools/schemas.js';
import { getConfig, setConfigValue } from './tools/config.js';
import { VERSION } from './version.js';
import { capture } from "./utils.js";
// Do not import custom tools directly to avoid module format compatibility issues
// We'll use dynamic imports when needed instead
import { initializeAutomation } from './integrations/tool-automation.js';

console.error("Loading server.ts with custom tools");
export const server = new Server({
    name: "desktop-commander",
    version: VERSION,
}, {
    capabilities: {
        tools: {},
        resources: {}, // Add empty resources capability
        prompts: {}, // Add empty prompts capability
    },
});
// Add handler for resources/list method
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    // Return an empty list of resources
    return {
        resources: [],
    };
});
// Add handler for prompts/list method
server.setRequestHandler(ListPromptsRequestSchema, async () => {
    // Return an empty list of prompts
    return {
        prompts: [],
    };
});
console.error("Setting up request handlers...");
server.setRequestHandler(ListToolsRequestSchema, async () => {
    try {
        console.error("Generating tools list...");
        return {
            tools: [
                // Custom tools from tools folder
                {
                    name: "api_generator",
                    description: "Generates API endpoints, controllers and documentation",
                    inputSchema: { type: "object", properties: { apiSpec: { type: "string" } } },
                },
                {
                    name: "assistant_router",
                    description: "Routes requests to appropriate AI assistants",
                    inputSchema: { type: "object", properties: { query: { type: "string" } } },
                },
                {
                    name: "auth_checker",
                    description: "Validates authentication tokens and permissions",
                    inputSchema: { type: "object", properties: { token: { type: "string" } } },
                },
                {
                    name: "auto_continue",
                    description: "Automatically continues the session based on context",
                    inputSchema: { type: "object", properties: { enabled: { type: "boolean" }, threshold: { type: "number" } } },
                },
                {
                    name: "avatar_renderer",
                    description: "Renders user and system avatars",
                    inputSchema: { type: "object", properties: { userId: { type: "string" }, size: { type: "string" } } },
                },
                {
                    name: "backup_creator",
                    description: "Creates backups of project files and configurations",
                    inputSchema: { type: "object", properties: { path: { type: "string" }, includeNodeModules: { type: "boolean" } } },
                },
                {
                    name: "build_runner",
                    description: "Executes build processes for various project types",
                    inputSchema: { type: "object", properties: { project: { type: "string" }, configuration: { type: "string" } } },
                },
                {
                    name: "cache_cleaner",
                    description: "Clears cached data and temporary files",
                    inputSchema: { type: "object", properties: { scope: { type: "string" }, older: { type: "number" } } },
                },
                {
                    name: "chat_logger",
                    description: "Logs chat conversations and interactions",
                    inputSchema: { type: "object", properties: { session: { type: "string" }, message: { type: "string" } } },
                },
                {
                    name: "cli_prompter",
                    description: "Provides interactive command-line prompts",
                    inputSchema: { type: "object", properties: { type: { type: "string" }, message: { type: "string" } } },
                },
                {
                    name: "cli_toolkit",
                    description: "Collection of CLI utilities and helpers",
                    inputSchema: { type: "object", properties: { command: { type: "string" }, args: { type: "array" } } },
                },
                {
                    name: "code_analyzer",
                    description: "Analyzes code for quality, complexity, and issues",
                    inputSchema: { type: "object", properties: { path: { type: "string" }, language: { type: "string" } } },
                },
                {
                    name: "code_fixer",
                    description: "Automatically fixes common code issues",
                    inputSchema: { type: "object", properties: { path: { type: "string" }, fixTypes: { type: "array" } } },
                },
                {
                    name: "component_builder",
                    description: "Builds UI components from specifications",
                    inputSchema: { type: "object", properties: { componentType: { type: "string" }, specs: { type: "object" } } },
                },
                {
                    name: "db_migrator",
                    description: "Manages database migrations and schema changes",
                    inputSchema: { type: "object", properties: { direction: { type: "string" }, steps: { type: "number" } } },
                },
                {
                    name: "doc_generator",
                    description: "Generates documentation from code and comments",
                    inputSchema: { type: "object", properties: { source: { type: "string" }, format: { type: "string" } } },
                },
                {
                    name: "duplicate_finder",
                    description: "Finds duplicate code and files in projects",
                    inputSchema: { type: "object", properties: { directory: { type: "string" }, threshold: { type: "number" } } },
                },
                {
                    name: "env_manager",
                    description: "Manages environment variables and configurations",
                    inputSchema: { type: "object", properties: { action: { type: "string" }, key: { type: "string" }, value: { type: "string" } } },
                },
                {
                    name: "error_logger",
                    description: "Logs and analyzes application errors",
                    inputSchema: { type: "object", properties: { error: { type: "string" }, level: { type: "string" } } },
                },
                {
                    name: "event_dispatcher",
                    description: "Dispatches events to registered listeners",
                    inputSchema: { type: "object", properties: { event: { type: "string" }, payload: { type: "object" } } },
                },
                {
                    name: "file_watcher",
                    description: "Watches files for changes and triggers actions",
                    inputSchema: { type: "object", properties: { path: { type: "string" }, patterns: { type: "array" } } },
                },
                {
                    name: "formatter",
                    description: "Formats code according to style guidelines",
                    inputSchema: { type: "object", properties: { path: { type: "string" }, language: { type: "string" } } },
                },
                {
                    name: "git_initializer",
                    description: "Initializes Git repositories with templates",
                    inputSchema: { type: "object", properties: { path: { type: "string" }, template: { type: "string" } } },
                },
                {
                    name: "i18n_loader",
                    description: "Loads internationalization resources",
                    inputSchema: { type: "object", properties: { locale: { type: "string" }, namespace: { type: "string" } } },
                },
                {
                    name: "log_viewer",
                    description: "Views and analyzes log files",
                    inputSchema: { type: "object", properties: { path: { type: "string" }, filter: { type: "string" } } },
                },
                {
                    name: "metadata_reader",
                    description: "Reads and processes file metadata",
                    inputSchema: { type: "object", properties: { file: { type: "string" }, type: { type: "string" } } },
                },
                {
                    name: "mock_data_inserter",
                    description: "Inserts mock data for testing",
                    inputSchema: { type: "object", properties: { target: { type: "string" }, count: { type: "number" } } },
                },
                {
                    name: "notification_sender",
                    description: "Sends notifications to users",
                    inputSchema: { type: "object", properties: { user: { type: "string" }, message: { type: "string" } } },
                },
                {
                    name: "performance_monitor",
                    description: "Monitors application performance metrics",
                    inputSchema: { type: "object", properties: { target: { type: "string" }, duration: { type: "number" } } },
                },
                {
                    name: "persona_loader",
                    description: "Loads persona profiles for AI assistants",
                    inputSchema: { type: "object", properties: { personaId: { type: "string" } } },
                },
                {
                    name: "plugin_loader",
                    description: "Loads and manages plugins",
                    inputSchema: { type: "object", properties: { plugin: { type: "string" }, config: { type: "object" } } },
                },
                {
                    name: "plugin_manager",
                    description: "Manages plugin lifecycle and configuration",
                    inputSchema: { type: "object", properties: { action: { type: "string" }, pluginId: { type: "string" } } },
                },
                {
                    name: "refactor_tool",
                    description: "Refactors code to improve structure and readability",
                    inputSchema: { type: "object", properties: { path: { type: "string" }, operations: { type: "array" } } },
                },
                {
                    name: "schema_validator",
                    description: "Validates data against defined schemas",
                    inputSchema: { type: "object", properties: { data: { type: "object" }, schema: { type: "string" } } },
                },
                {
                    name: "test_runner",
                    description: "Runs automated tests",
                    inputSchema: { type: "object", properties: { suite: { type: "string" }, pattern: { type: "string" } } },
                },
                {
                    name: "theme_switcher",
                    description: "Switches between UI themes",
                    inputSchema: { type: "object", properties: { theme: { type: "string" } } },
                },
                {
                    name: "token_refresher",
                    description: "Refreshes authentication tokens",
                    inputSchema: { type: "object", properties: { token: { type: "string" } } },
                },
                {
                    name: "tone_adjuster",
                    description: "Adjusts the tone of AI responses",
                    inputSchema: { type: "object", properties: { content: { type: "string" }, tone: { type: "string" } } },
                },
                {
                    name: "tool_suggester",
                    description: "Suggests tools based on user needs",
                    inputSchema: { type: "object", properties: { query: { type: "string" } } },
                },
                {
                    name: "voice_cloner",
                    description: "Creates voice clones from samples",
                    inputSchema: { type: "object", properties: { source: { type: "string" }, text: { type: "string" } } },
                },
                
                // Built-in configuration tools
                {
                    name: "get_config",
                    description: "Get the complete server configuration as JSON. Config includes fields for: blockedCommands (array of blocked shell commands), defaultShell (shell to use for commands), allowedDirectories (paths the server can access).",
                    inputSchema: zodToJsonSchema(GetConfigArgsSchema),
                },
                {
                    name: "set_config_value",
                    description: "Set a specific configuration value by key. WARNING: Should be used in a separate chat from file operations and command execution to prevent security issues. Config keys include: blockedCommands (array), defaultShell (string), allowedDirectories (array of paths). IMPORTANT: Setting allowedDirectories to an empty array ([]) allows full access to the entire file system, regardless of the operating system.",
                    inputSchema: zodToJsonSchema(SetConfigValueArgsSchema),
                },
                // Terminal tools
                {
                    name: "execute_command",
                    description: "Execute a terminal command with timeout. Command will continue running in background if it doesn't complete within timeout.",
                    inputSchema: zodToJsonSchema(ExecuteCommandArgsSchema),
                },
                {
                    name: "read_output",
                    description: "Read new output from a running terminal session.",
                    inputSchema: zodToJsonSchema(ReadOutputArgsSchema),
                },
                {
                    name: "force_terminate",
                    description: "Force terminate a running terminal session.",
                    inputSchema: zodToJsonSchema(ForceTerminateArgsSchema),
                },
                {
                    name: "list_sessions",
                    description: "List all active terminal sessions.",
                    inputSchema: zodToJsonSchema(ListSessionsArgsSchema),
                },
                {
                    name: "list_processes",
                    description: "List all running processes. Returns process information including PID, command name, CPU usage, and memory usage.",
                    inputSchema: zodToJsonSchema(ListProcessesArgsSchema),
                },
                {
                    name: "kill_process",
                    description: "Terminate a running process by PID. Use with caution as this will forcefully terminate the specified process.",
                    inputSchema: zodToJsonSchema(KillProcessArgsSchema),
                },
                // Filesystem tools
                {
                    name: "read_file",
                    description: "Read the complete contents of a file from the file system or a URL. When reading from the file system, only works within allowed directories. Can fetch content from URLs when isUrl parameter is set to true. Handles text files normally and image files are returned as viewable images. Recognized image types: PNG, JPEG, GIF, WebP.",
                    inputSchema: zodToJsonSchema(ReadFileArgsSchema),
                },
                {
                    name: "read_multiple_files",
                    description: "Read the contents of multiple files simultaneously. Each file's content is returned with its path as a reference. Handles text files normally and renders images as viewable content. Recognized image types: PNG, JPEG, GIF, WebP. Failed reads for individual files won't stop the entire operation. Only works within allowed directories.",
                    inputSchema: zodToJsonSchema(ReadMultipleFilesArgsSchema),
                },
                {
                    name: "write_file",
                    description: "Completely replace file contents. Best for large changes (>20% of file) or when edit_block fails. Use with caution as it will overwrite existing files. Only works within allowed directories.",
                    inputSchema: zodToJsonSchema(WriteFileArgsSchema),
                },
                {
                    name: "create_directory",
                    description: "Create a new directory or ensure a directory exists. Can create multiple nested directories in one operation. Only works within allowed directories.",
                    inputSchema: zodToJsonSchema(CreateDirectoryArgsSchema),
                },
                {
                    name: "list_directory",
                    description: "Get a detailed listing of all files and directories in a specified path. Results distinguish between files and directories with [FILE] and [DIR] prefixes. Only works within allowed directories.",
                    inputSchema: zodToJsonSchema(ListDirectoryArgsSchema),
                },
                {
                    name: "move_file",
                    description: "Move or rename files and directories. Can move files between directories and rename them in a single operation. Both source and destination must be within allowed directories.",
                    inputSchema: zodToJsonSchema(MoveFileArgsSchema),
                },
                {
                    name: "search_files",
                    description: "Finds files by name using a case-insensitive substring matching. Searches through all subdirectories from the starting path. Has a default timeout of 30 seconds which can be customized using the timeoutMs parameter. Only searches within allowed directories.",
                    inputSchema: zodToJsonSchema(SearchFilesArgsSchema),
                },
                {
                    name: "search_code",
                    description: "Search for text/code patterns within file contents using ripgrep. Fast and powerful search similar to VS Code search functionality. Supports regular expressions, file pattern filtering, and context lines. Has a default timeout of 30 seconds which can be customized. Only searches within allowed directories.",
                    inputSchema: zodToJsonSchema(SearchCodeArgsSchema),
                },
                {
                    name: "get_file_info",
                    description: "Retrieve detailed metadata about a file or directory including size, creation time, last modified time, permissions, and type. Only works within allowed directories.",
                    inputSchema: zodToJsonSchema(GetFileInfoArgsSchema),
                },
                // Note: list_allowed_directories removed - use get_config to check allowedDirectories
                // Text editing tools
                {
                    name: "edit_block",
                    description: "Apply surgical text replacements to files. Best for small changes (<20% of file size). Call repeatedly to change multiple blocks. Will verify changes after application. Format:\nfilepath\n<<<<<<< SEARCH\ncontent to find\n=======\nnew content\n>>>>>>> REPLACE",
                    inputSchema: zodToJsonSchema(EditBlockArgsSchema),
                },
            ],
        };
    }
    catch (error) {
        console.error("Error in list_tools request handler:", error);
        throw error;
    }
});
import * as handlers from './handlers/index.js';
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;
        capture('server_call_tool', {
            name
        });
        
        // Check if the requested tool is a custom tool
        if (handlers.isCustomTool(name)) {
            return await handlers.handleCustomTool(name, args);
        }
        
        // Using a more structured approach with dedicated handlers for built-in tools
        switch (name) {
            // Config tools
            case "get_config":
                try {
                    return await getConfig();
                }
                catch (error) {
                    capture('server_request_error', { message: `Error in get_config handler: ${error}` });
                    return {
                        content: [{ type: "text", text: `Error: Failed to get configuration` }],
                        isError: true,
                    };
                }
            case "set_config_value":
                try {
                    return await setConfigValue(args);
                }
                catch (error) {
                    capture('server_request_error', { message: `Error in set_config_value handler: ${error}` });
                    return {
                        content: [{ type: "text", text: `Error: Failed to set configuration value` }],
                        isError: true,
                    };
                }
            // Terminal tools
            case "execute_command":
                return await handlers.handleExecuteCommand(args);
            case "read_output":
                return await handlers.handleReadOutput(args);
            case "force_terminate":
                return await handlers.handleForceTerminate(args);
            case "list_sessions":
                return await handlers.handleListSessions();
            // Process tools
            case "list_processes":
                return await handlers.handleListProcesses();
            case "kill_process":
                return await handlers.handleKillProcess(args);
            // Filesystem tools
            case "read_file":
                return await handlers.handleReadFile(args);
            case "read_multiple_files":
                return await handlers.handleReadMultipleFiles(args);
            case "write_file":
                return await handlers.handleWriteFile(args);
            case "create_directory":
                return await handlers.handleCreateDirectory(args);
            case "list_directory":
                return await handlers.handleListDirectory(args);
            case "move_file":
                return await handlers.handleMoveFile(args);
            case "search_files":
                return await handlers.handleSearchFiles(args);
            case "search_code":
                return await handlers.handleSearchCode(args);
            case "get_file_info":
                return await handlers.handleGetFileInfo(args);
            case "edit_block":
                return await handlers.handleEditBlock(args);
            default:
                capture('server_unknown_tool', { name });
                return {
                    content: [{ type: "text", text: `Error: Unknown tool: ${name}` }],
                    isError: true,
                };
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        capture('server_request_error', {
            error: errorMessage
        });
        return {
            content: [{ type: "text", text: `Error: ${errorMessage}` }],
            isError: true,
        };
    }
});

// Initialize tool automation
// Use a custom oninitialized handler instead of event listener
server.oninitialized = async () => {
    try {
        console.error('Server initialized, starting tool automation...');
        await initializeAutomation(server);
        console.error('Tool automation initialized successfully');
    } catch (error) {
        console.error('Failed to initialize tool automation:', error);
        capture('server_startup_error', { message: `Failed to initialize tool automation: ${error.message}` });
    }
};
