/**
 * Plugin Manager
 * 
 * A centralized system for registering MCP tools and managing their lifecycle.
 * This provides a consistent interface for all tools to be registered with the MCP server.
 */

import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from 'zod-to-json-schema';

// Server is typed as any to avoid dependency issues
export class PluginManager {
  private server: any;
  private logger: any;
  private tools: Map<string, any>;
  private handlersRegistered: boolean = false;

  /**
   * Creates a new PluginManager instance
   * 
   * @param server MCP server instance
   * @param logger Optional logger instance
   */
  constructor(server: any, logger?: any) {
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
  registerTool(name: string, tool: any): void {
    try {
      // Always store the tool in our internal map
      this.tools.set(name, tool);
      this.logger.log(`[PluginManager] Registered tool: ${name}`);
      
      // Ensure our request handlers are registered
      this.registerHandlersIfNeeded();
    } catch (error) {
      this.logger.error(`[PluginManager] Error registering tool ${name}:`, error);
    }
  }

  /**
   * Register the MCP request handlers for tool listing and execution
   * This only needs to be done once
   */
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

  /**
   * Set up the ListToolsRequestSchema handler
   */
  private setupListToolsHandler(): void {
    // Get the existing handler if it exists
    const originalListHandler = this.server.getRequestHandler 
      ? this.server.getRequestHandler(ListToolsRequestSchema) 
      : null;
    
    // Set up a new handler that extends the existing one
    this.server.setRequestHandler(ListToolsRequestSchema, async (request: any) => {
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

  /**
   * Set up the CallToolRequestSchema handler
   */
  private setupCallToolHandler(): void {
    // Get the existing handler if it exists
    const originalCallHandler = this.server.getRequestHandler 
      ? this.server.getRequestHandler(CallToolRequestSchema) 
      : null;
    
    // Set up a new handler that extends the existing one
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
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

  /**
   * Get a registered tool by name
   * 
   * @param name Tool name
   */
  getTool(name: string): any {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools
   */
  getAllTools(): Map<string, any> {
    return this.tools;
  }

  /**
   * Get tool count
   */
  getToolCount(): number {
    return this.tools.size;
  }
}

// Export singleton instance that will be initialized with the server at startup
let _instance: PluginManager | null = null;

/**
 * Initialize the plugin manager with an MCP server instance
 * 
 * @param server MCP server instance
 * @param logger Optional logger instance
 */
export function initializePluginManager(server: any, logger?: any): PluginManager {
  if (!_instance) {
    _instance = new PluginManager(server, logger);
  } else {
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
export function getPluginManager(): PluginManager {
  if (!_instance) {
    throw new Error('Plugin manager not initialized. Call initializePluginManager first.');
  }
  return _instance;
}

// Export an unsafe version for internal use only
// This will create a placeholder instance if not initialized
export const pluginManager = _instance || new PluginManager(null);