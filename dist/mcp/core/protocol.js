"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StdioComms = void 0;
const readline = __importStar(require("readline"));
const types_1 = require("./types"); // Updated imports
// import { MCPEventEmitter } from './eventHandler'; // To be created/integrated if needed
// Ensure all console.log calls are redirected to stderr in this file
// This is crucial for MCP as stdout should only contain JSON-RPC messages
const consoleLog = console.log;
console.log = function (...args) {
    console.error(...args);
};
// Prefix for MCP messages to distinguish them from other stdout/stdin lines.
// Note: Claude Desktop might not use this prefix and expects raw JSON-RPC.
// We will keep sending with the prefix for now, but parsing will handle raw JSON too.
const MCP_MESSAGE_PREFIX = "MCP_MESSAGE::";
class StdioComms {
    // private eventEmitter: MCPEventEmitter; // To be uncommented when MCPEventEmitter is implemented
    constructor(messageHandler // Updated type
    // eventEmitter: MCPEventEmitter // To be uncommented
    ) {
        this.messageHandler = messageHandler;
        // this.eventEmitter = eventEmitter; // To be uncommented
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout, // We only write MCP messages here
            terminal: false // Important for non-interactive stdio
        });
    }
    listen() {
        // Keep the process alive by preventing it from exiting
        process.stdin.resume();
        // Handle stdin end event
        process.stdin.on('end', () => {
            console.error('stdin ended, but keeping process alive');
            // Don't close the readline interface
        });
        // Handle stdin error event
        process.stdin.on('error', (err) => {
            console.error('stdin error:', err);
            // Don't close the readline interface
        });
        // Handle stdout close event
        process.stdout.on('close', () => {
            console.error('stdout closed, but keeping process alive');
            // Don't close the readline interface
        });
        // Handle stdout error event
        process.stdout.on('error', (err) => {
            console.error('stdout error:', err);
            // Don't close the readline interface
        });
        this.rl.on('line', (line) => {
            let messageJson = line;
            // Check if our prefix is present and remove it
            if (line.startsWith(MCP_MESSAGE_PREFIX)) {
                messageJson = line.substring(MCP_MESSAGE_PREFIX.length);
            }
            // Attempt to parse the line as JSON
            try {
                const message = JSON.parse(messageJson); // Assume it fits IncomingMessage structure
                // Basic validation for JSON-RPC structure (can be enhanced)
                if (typeof message !== 'object' || message === null || !message.jsonrpc || message.jsonrpc !== '2.0') {
                    console.error('Received message is not a valid JSON-RPC 2.0 object:', line);
                    // Cannot reliably send error back without a valid request ID
                    return;
                }
                console.error(`Received valid JSON-RPC message: ID=${message.id}, Method=${message.method}`);
                // Process the valid message and ensure we handle the promise properly
                this.messageHandler(message).catch(err => {
                    console.error("Error processing MCP message:", err);
                    // Try to send a JSON-RPC error response if possible
                    const errorResponse = {
                        jsonrpc: "2.0",
                        id: (message && typeof message.id !== 'undefined') ? message.id : null, // Use ID from parsed message if available
                        error: {
                            code: types_1.JsonRpcErrorCode.InternalError,
                            message: 'Failed to process incoming message: ' + (err instanceof Error ? err.message : String(err)),
                        }
                    };
                    this.send(errorResponse);
                });
                // Keep the event loop active
                setImmediate(() => { });
            }
            catch (error) {
                // Log the raw line that caused the parse error using the requested format
                console.error('[FATAL JSON PARSE]', error, line);
                // Cannot send error back as we couldn't parse the request ID
                // this.eventEmitter.emit({ // To be uncommented
                //   type: 'mcp_message_parse_error',
                //   timestamp: new Date(),
                //   data: { error, rawLine: line }
                // });
            }
        });
        console.error("StdioComms listening on stdin."); // Log to stderr
        // this.eventEmitter.emit({ type: 'stdio_listener_started', timestamp: new Date(), data: null }); // To be uncommented
    }
    // Sends messages (JSON-RPC responses or our internal format) to stdout
    send(message) {
        try {
            const serializedMessage = JSON.stringify(message);
            // Send raw JSON-RPC, as expected by Claude Desktop
            // Use write with callback to ensure message is fully sent
            process.stdout.write(`${serializedMessage}\n`, (err) => {
                if (err) {
                    console.error('Error writing to stdout:', err);
                }
            });
            // Log the message for debugging
            if ('jsonrpc' in message) {
                console.error(`Message sent to client: JSON-RPC ID: ${message.id}`);
            }
            else {
                console.error(`Message sent to client: Internal ID: ${message.id}`);
            }
            // Keep the process alive after sending
            setImmediate(() => {
                // This empty callback keeps the event loop active
            });
        }
        catch (error) {
            console.error('Failed to serialize message for sending:', error, 'Message:', message); // Log to stderr
        }
    }
    close() {
        // Don't actually close the readline interface to keep the process alive
        // this.rl.close();
        // Log the closure
        console.error("StdioComms close requested, but keeping alive."); // Log to stderr
        // Allow any pending operations to complete before potentially exiting
        setImmediate(() => {
            console.error("StdioComms shutdown prevented to maintain connection.");
        });
    }
}
exports.StdioComms = StdioComms;
