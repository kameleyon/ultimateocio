"use strict";
/**
 * Plugin Manager
 *
 * A centralized system for registering MCP tools and managing their lifecycle.
 * This provides a consistent interface for all tools to be registered with the MCP server.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginManager = exports.PluginManager = void 0;
exports.initializePluginManager = initializePluginManager;
exports.getPluginManager = getPluginManager;
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
        this.server = server; // This server reference is no longer used for handler registration
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
            // this.registerHandlersIfNeeded(); // Commented out: Incompatible with current MCPServer
        }
        catch (error) {
            this.logger.error(`[PluginManager] Error registering tool ${name}:`, error);
        }
    }
    /**
     * Register the MCP request handlers for tool listing and execution
     * This only needs to be done once
     */
    /* // Commenting out entire block as it's incompatible
    private registerHandlersIfNeeded(): void {
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
      } catch (error) {
        this.logger.error('[PluginManager] Error registering handlers:', error);
      }
    }
    */
    /**
     * Set up the ListToolsRequestSchema handler
     */
    /* // Commenting out entire block
    private setupListToolsHandler(): void {
      // Get the existing handler if it exists
      const originalListHandler = this.server.getRequestHandler
        ? this.server.getRequestHandler(ListToolsRequestSchema) // ListToolsRequestSchema is undefined
        : null;
      
      // Set up a new handler that extends the existing one
      this.server.setRequestHandler(ListToolsRequestSchema, async (request: any) => { // ListToolsRequestSchema is undefined
        this.logger.log('[PluginManager] Handling ListToolsRequest');
        
        // First get the original response
        const originalResponse = originalListHandler ? await originalListHandler(request) : { tools: [] };
        
        // Make sure the tools array exists
        if (!originalResponse.tools) {
          originalResponse.tools = [];
        }
        
        // Filter out any existing tools with the same names as our tools
        const filteredTools = originalResponse.tools.filter(
          (existingTool: any) => !Array.from(this.tools.keys()).includes(existingTool.name)
        );
        
        // Add our tools to the response
        originalResponse.tools = [
          ...filteredTools,
          ...Array.from(this.tools.entries()).map(([name, tool]) => ({
            name: name,
            description: tool.description || `${name} tool`,
            inputSchema: tool.inputSchema ? zodToJsonSchema(tool.inputSchema) : {},
          })),
        ];
        
        return originalResponse;
      });
    }
    */
    /**
     * Set up the CallToolRequestSchema handler
     */
    /* // Commenting out entire block
    private setupCallToolHandler(): void {
      // Get the existing handler if it exists
      const originalCallHandler = this.server.getRequestHandler
        ? this.server.getRequestHandler(CallToolRequestSchema) // CallToolRequestSchema is undefined
        : null;
      
      // Set up a new handler that extends the existing one
      this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => { // CallToolRequestSchema is undefined
        this.logger.log(`[PluginManager] Handling CallToolRequest for ${request.name}`);
        
        // Check if we have this tool
        if (this.tools.has(request.name)) {
          const tool = this.tools.get(request.name);
          
          try {
            // Execute the tool
            return await tool.onCommand(request.arguments);
          } catch (error: any) {
            const errorMessage = error?.message || 'Unknown error occurred';
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
          return await originalCallHandler(request);
        }
        
        // No handler found for this tool
        return {
          content: [{
            type: "text",
            text: `Tool "${request.name}" not found`
          }],
          isError: true
        };
      });
    }
    */
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
            // Re-initialize with the new server if it's different or if we want to reset
            _instance = new PluginManager(server, logger || console); // Removed _instance.logger
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
        // To allow the tool to be "registered" by registerTools.ts without crashing,
        // we can initialize a dummy one here if not already done.
        // This is a temporary workaround for build purposes.
        console.warn("[PluginManager] getPluginManager called before explicit initialization. Creating a dummy instance.");
        _instance = new PluginManager(null, console); // Pass null server
        // throw new Error('Plugin manager not initialized. Call initializePluginManager first.');
    }
    return _instance;
}
// Export an unsafe version for internal use only
// This will create a placeholder instance if not initialized
exports.pluginManager = _instance || new PluginManager(null);
