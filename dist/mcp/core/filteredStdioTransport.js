"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilteredStdioComms = void 0;
const protocol_1 = require("./protocol");
/**
 * Extended StdioComms that filters out non-JSON messages.
 * This prevents potential errors from crashing the server.
 */
class FilteredStdioComms extends protocol_1.StdioComms {
    constructor(messageHandler) {
        // Create a proxy for stdout that only allows valid JSON to pass through
        const originalStdoutWrite = process.stdout.write;
        process.stdout.write = function (buffer, ...args) {
            // Only intercept string output that doesn't look like JSON
            if (typeof buffer === 'string' && !buffer.trim().startsWith('{')) {
                console.error(`[Filtered non-JSON output]: ${buffer}`);
                return true; // Silently discard non-JSON output
            }
            // Pass through valid JSON messages
            // TypeScript is strict about the arguments for process.stdout.write
            // We need to handle the arguments correctly based on their types
            if (args.length === 0) {
                return originalStdoutWrite.call(process.stdout, buffer);
            }
            else if (args.length === 1) {
                return originalStdoutWrite.call(process.stdout, buffer, args[0]);
            }
            else {
                return originalStdoutWrite.call(process.stdout, buffer, args[0], args[1]);
            }
        };
        super(messageHandler);
        // Log initialization to stderr to avoid polluting the JSON stream
        console.error(`[ultimateocio-mcp] Initialized FilteredStdioComms`);
    }
}
exports.FilteredStdioComms = FilteredStdioComms;
