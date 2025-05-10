import { MCPTool, RegisteredTool, MCPEvent } from './types';
import { MCPEventEmitter } from './eventHandler'; // Assuming MCPEventEmitter is in the same directory or correctly pathed

// Ensure all console.log calls are redirected to stderr in this file
// This is crucial for MCP as stdout should only contain JSON-RPC messages
const consoleLog = console.log;
console.log = function(...args: any[]) {
  console.error(...args);
};

// Basic UUID generation for tool IDs
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class ToolRegistry {
  private tools: Map<string, RegisteredTool>;
  private eventEmitter: MCPEventEmitter;

  constructor(eventEmitter: MCPEventEmitter) {
    this.tools = new Map<string, RegisteredTool>();
    this.eventEmitter = eventEmitter;
  }

  /**
   * Registers a new tool with the registry.
   * @param tool The tool to register.
   * @returns The registered tool with an assigned ID.
   * @throws Error if a tool with the same name is already registered.
   */
  public registerTool(tool: MCPTool): RegisteredTool {
    // Optional: Check if a tool with the same name already exists to prevent duplicates
    // for (const existingTool of this.tools.values()) {
    //   if (existingTool.name === tool.name) {
    //     const err = new Error(`Tool with name "${tool.name}" is already registered.`);
    //     this.eventEmitter.emit({ type: 'tool_registration_failed', timestamp: new Date(), data: { name: tool.name, error: err } });
    //     throw err;
    //   }
    // }

    const toolId = generateUUID();
    const registeredTool: RegisteredTool = { ...tool, id: toolId };
    this.tools.set(toolId, registeredTool);

    this.eventEmitter.emit({
      type: 'tool_registered',
      timestamp: new Date(),
      data: { toolId: registeredTool.id, name: registeredTool.name }
    });
    console.error(`Tool "${registeredTool.name}" registered with ID: ${registeredTool.id}`);
    return registeredTool;
  }

  /**
   * Unregisters a tool from the registry.
   * @param toolId The ID of the tool to unregister.
   * @returns True if the tool was found and unregistered, false otherwise.
   */
  public unregisterTool(toolId: string): boolean {
    const tool = this.tools.get(toolId);
    if (tool) {
      this.tools.delete(toolId);
      this.eventEmitter.emit({
        type: 'tool_unregistered',
        timestamp: new Date(),
        data: { toolId: tool.id, name: tool.name }
      });
      console.error(`Tool "${tool.name}" (ID: ${toolId}) unregistered.`);
      return true;
    }
    this.eventEmitter.emit({
      type: 'tool_unregistration_failed',
      timestamp: new Date(),
      data: { toolId, error: 'Tool not found' }
    });
    console.warn(`Tool with ID "${toolId}" not found for unregistration.`);
    return false;
  }

  /**
   * Retrieves a tool by its ID.
   * @param toolId The ID of the tool to retrieve.
   * @returns The registered tool, or undefined if not found.
   */
  public getTool(toolId: string): RegisteredTool | undefined {
    const tool = this.tools.get(toolId);
    if (!tool) {
      this.eventEmitter.emit({ type: 'tool_lookup_failed', timestamp: new Date(), data: { toolId } });
    }
    return tool;
  }

  /**
   * Retrieves all registered tools.
   * @returns An array of all registered tools.
   */
  public getAllTools(): RegisteredTool[] {
    return Array.from(this.tools.values());
  }
}