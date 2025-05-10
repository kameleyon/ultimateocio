/**
 * Plugin Manager
 *
 * A centralized system for registering MCP tools and managing their lifecycle.
 * This provides a consistent interface for all tools to be registered with the MCP server.
 */
export declare class PluginManager {
    private server;
    private logger;
    private tools;
    private handlersRegistered;
    /**
     * Creates a new PluginManager instance
     *
     * @param server MCP server instance
     * @param logger Optional logger instance
     */
    constructor(server: any, logger?: any);
    /**
     * Register a tool with the MCP system
     *
     * @param name Tool name
     * @param tool Tool implementation
     */
    registerTool(name: string, tool: any): void;
    /**
     * Register the MCP request handlers for tool listing and execution
     * This only needs to be done once
     */
    private registerHandlersIfNeeded;
    /**
     * Set up the ListToolsRequestSchema handler
     */
    private setupListToolsHandler;
    /**
     * Set up the CallToolRequestSchema handler
     */
    private setupCallToolHandler;
    /**
     * Get a registered tool by name
     *
     * @param name Tool name
     */
    getTool(name: string): any;
    /**
     * Get all registered tools
     */
    getAllTools(): Map<string, any>;
    /**
     * Get tool count
     */
    getToolCount(): number;
}
/**
 * Initialize the plugin manager with an MCP server instance
 *
 * @param server MCP server instance
 * @param logger Optional logger instance
 */
export declare function initializePluginManager(server: any, logger?: any): PluginManager;
/**
 * Get the plugin manager instance
 * Will throw an error if not initialized
 */
export declare function getPluginManager(): PluginManager;
export declare const pluginManager: PluginManager;
