/**
 * DEPRECATED: This custom MCP implementation is now deprecated.
 * Please use the official SDK implementation in main.ts instead.
 * 
 * This stub file forwards to the deprecated implementation but
 * logs a warning when it's used.
 * 
 * @deprecated Use the official MCP SDK implementation in main.ts
 */

import { MCPServer as DeprecatedMCPServer } from './MCPServer.deprecated';

/**
 * @deprecated This class is deprecated. Use the official MCP SDK implementation in main.ts instead.
 */
export class MCPServer extends DeprecatedMCPServer {
  constructor() {
    super();
    console.error(
      '\n\n[WARNING] The custom MCPServer implementation is deprecated. ' +
      'Use the official MCP SDK implementation in main.ts instead.\n\n'
    );
  }
}
