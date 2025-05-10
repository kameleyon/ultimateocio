"use strict";
/**
 * DEPRECATED: This custom MCP implementation is now deprecated.
 * Please use the official SDK implementation in main.ts instead.
 *
 * This stub file forwards to the deprecated implementation but
 * logs a warning when it's used.
 *
 * @deprecated Use the official MCP SDK implementation in main.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPServer = void 0;
const MCPServer_deprecated_1 = require("./MCPServer.deprecated");
/**
 * @deprecated This class is deprecated. Use the official MCP SDK implementation in main.ts instead.
 */
class MCPServer extends MCPServer_deprecated_1.MCPServer {
    constructor() {
        super();
        console.error('\n\n[WARNING] The custom MCPServer implementation is deprecated. ' +
            'Use the official MCP SDK implementation in main.ts instead.\n\n');
    }
}
exports.MCPServer = MCPServer;
