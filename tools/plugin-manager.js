"use strict";
/**
 * Plugin Manager
 *
 * A centralized system for registering MCP tools and managing their lifecycle.
 * This provides a consistent interface for all tools to be registered with the MCP server.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginManager = exports.PluginManager = void 0;
exports.initializePluginManager = initializePluginManager;
exports.getPluginManager = getPluginManager;
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_to_json_schema_1 = require("zod-to-json-schema");
// Server is typed as any to avoid dependency issues
class PluginManager {
    /**
     * Creates a new PluginManager instance
     *
     * @param server MCP server instance
     * @param logger Optional logger instance
     */
    constructor(server, logger) {
        this.handlersRegistered = false;
        this.server = server;
        this.logger = logger || console;
        this.tools = new Map();
    }
    /**
     * Register a tool with the MCP system
     *
     * @param name Tool name
     * @param tool Tool implementation
     */
    registerTool(name, tool) {
        try {
            // Always store the tool in our internal map
            this.tools.set(name, tool);
            this.logger.log(`[PluginManager] Registered tool: ${name}`);
            // Ensure our request handlers are registered
            this.registerHandlersIfNeeded();
        }
        catch (error) {
            this.logger.error(`[PluginManager] Error registering tool ${name}:`, error);
        }
    }
    /**
     * Register the MCP request handlers for tool listing and execution
     * This only needs to be done once
     */
    registerHandlersIfNeeded() {
        if (this.handlersRegistered || !this.server) {
            return;
        }
        try {
            // Set up the ListToolsRequestSchema handler
            this.setupListToolsHandler();
            // Set up the CallToolRequestSchema handler
            this.setupCallToolHandler();
            this.handlersRegistered = true;
            this.logger.log('[PluginManager] MCP handlers registered successfully');
        }
        catch (error) {
            this.logger.error('[PluginManager] Error registering handlers:', error);
        }
    }
    /**
     * Set up the ListToolsRequestSchema handler
     */
    setupListToolsHandler() {
        // Get the existing handler if it exists
        const originalListHandler = this.server.getRequestHandler
            ? this.server.getRequestHandler(types_js_1.ListToolsRequestSchema)
            : null;
        // Set up a new handler that extends the existing one
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, (request) => __awaiter(this, void 0, void 0, function* () {
            this.logger.log('[PluginManager] Handling ListToolsRequest');
            // First get the original response
            const originalResponse = originalListHandler ? yield originalListHandler(request) : { tools: [] };
            // Make sure the tools array exists
            if (!originalResponse.tools) {
                originalResponse.tools = [];
            }
            // Filter out any existing tools with the same names as our tools
            const filteredTools = originalResponse.tools.filter((existingTool) => !Array.from(this.tools.keys()).includes(existingTool.name));
            // Add our tools to the response
            originalResponse.tools = [
                ...filteredTools,
                ...Array.from(this.tools.entries()).map(([name, tool]) => ({
                    name: name,
                    description: tool.description || `${name} tool`,
                    inputSchema: tool.inputSchema ? (0, zod_to_json_schema_1.zodToJsonSchema)(tool.inputSchema) : {},
                })),
            ];
            return originalResponse;
        }));
    }
    /**
     * Set up the CallToolRequestSchema handler
     */
    setupCallToolHandler() {
        // Get the existing handler if it exists
        const originalCallHandler = this.server.getRequestHandler
            ? this.server.getRequestHandler(types_js_1.CallToolRequestSchema)
            : null;
        // Set up a new handler that extends the existing one
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, (request) => __awaiter(this, void 0, void 0, function* () {
            this.logger.log(`[PluginManager] Handling CallToolRequest for ${request.name}`);
            // Check if we have this tool
            if (this.tools.has(request.name)) {
                const tool = this.tools.get(request.name);
                try {
                    // Execute the tool
                    return yield tool.onCommand(request.arguments);
                }
                catch (error) {
                    const errorMessage = (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error occurred';
                    this.logger.error(`[PluginManager] Error executing tool ${request.name}:`, error);
                    return {
                        content: [{
                                type: "text",
                                text: `Error executing tool "${request.name}": ${errorMessage}`
                            }],
                        isError: true
                    };
                }
            }
            // If we don't have the tool, let the original handler try
            if (originalCallHandler) {
                return yield originalCallHandler(request);
            }
            // No handler found for this tool
            return {
                content: [{
                        type: "text",
                        text: `Tool "${request.name}" not found`
                    }],
                isError: true
            };
        }));
    }
    /**
     * Get a registered tool by name
     *
     * @param name Tool name
     */
    getTool(name) {
        return this.tools.get(name);
    }
    /**
     * Get all registered tools
     */
    getAllTools() {
        return this.tools;
    }
    /**
     * Get tool count
     */
    getToolCount() {
        return this.tools.size;
    }
}
exports.PluginManager = PluginManager;
// Export singleton instance that will be initialized with the server at startup
let _instance = null;
/**
 * Initialize the plugin manager with an MCP server instance
 *
 * @param server MCP server instance
 * @param logger Optional logger instance
 */
function initializePluginManager(server, logger) {
    if (!_instance) {
        _instance = new PluginManager(server, logger);
    }
    else {
        // Update server reference if provided
        if (server) {
            _instance = new PluginManager(server, logger || console);
        }
    }
    return _instance;
}
/**
 * Get the plugin manager instance
 * Will throw an error if not initialized
 */
function getPluginManager() {
    if (!_instance) {
        throw new Error('Plugin manager not initialized. Call initializePluginManager first.');
    }
    return _instance;
}
// Export an unsafe version for internal use only
// This will create a placeholder instance if not initialized
exports.pluginManager = _instance || new PluginManager(null);
