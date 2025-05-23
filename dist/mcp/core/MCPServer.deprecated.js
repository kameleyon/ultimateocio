"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPServer = void 0;
const types_1 = require("./types");
const filteredStdioTransport_1 = require("./filteredStdioTransport");
const eventHandler_1 = require("./eventHandler");
const toolRegistry_1 = require("./toolRegistry");
const package_json_1 = require("../../../package.json"); // Get version from package.json
// Ensure all console.log calls are redirected to stderr in this file
// This is crucial for MCP as stdout should only contain JSON-RPC messages
const consoleLog = console.log;
console.log = function (...args) {
    console.error(...args);
};
const SERVER_NAME = "ultimateocio-mcp";
const PROTOCOL_VERSION = "2024-11-05"; // The protocol version this server supports
class MCPServer {
    constructor() {
        this.eventEmitter = new eventHandler_1.MCPEventEmitter();
        this.toolRegistry = new toolRegistry_1.ToolRegistry(this.eventEmitter);
        // Pass the handler function reference correctly
        // Use FilteredStdioComms instead of StdioComms to filter out non-JSON messages
        this.comms = new filteredStdioTransport_1.FilteredStdioComms(this.handleIncomingMessage.bind(this));
        console.error(`${SERVER_NAME} instance created and initialized.`);
    }
    registerTool(tool) {
        try {
            const registeredTool = this.toolRegistry.registerTool(tool);
            this.eventEmitter.emit({ type: 'mcp_server_tool_registered', timestamp: new Date(), data: { toolId: registeredTool.id, name: tool.name } });
        }
        catch (error) {
            console.error(`Error registering tool "${tool.name}": ${error.message}`);
            this.eventEmitter.emit({ type: 'mcp_server_tool_registration_error', timestamp: new Date(), data: { name: tool.name, error: error.message } });
        }
    }
    unregisterTool(toolId) {
        if (this.toolRegistry.unregisterTool(toolId)) {
            this.eventEmitter.emit({ type: 'mcp_server_tool_unregistered', timestamp: new Date(), data: { toolId } });
        }
        else {
            console.error(`${SERVER_NAME}: Tool with ID ${toolId} not found for unregistration or already unregistered.`);
        }
    }
    start() {
        this.comms.listen();
        this.eventEmitter.emit({ type: 'mcp_server_started', timestamp: new Date(), data: null });
        console.error(`${SERVER_NAME} started. Listening for messages via StdioComms.`);
    }
    stop() {
        // Don't actually close the comms to keep the process alive
        // this.comms.close();
        this.eventEmitter.emit({ type: 'mcp_server_stopped', timestamp: new Date(), data: null });
        console.error(`${SERVER_NAME} stop requested, but keeping alive.`);
        // Keep the process alive
        setImmediate(() => {
            console.error(`${SERVER_NAME} shutdown prevented to maintain connection.`);
        });
    }
    // Central handler for all incoming messages
    async handleIncomingMessage(message) {
        this.eventEmitter.emit({ type: 'mcp_request_received', timestamp: new Date(), data: message });
        let response = null;
        // Check if it's a valid JSON-RPC request
        if (!message || typeof message !== 'object' || message.jsonrpc !== '2.0' || typeof message.method !== 'string') {
            console.error("Received invalid or non-JSON-RPC message:", message);
            // Cannot determine ID, so cannot send a standard JSON-RPC error
            return;
        }
        // It's a JSON-RPC request, cast it
        const request = message;
        try {
            switch (request.method) {
                case 'initialize':
                    response = this.handleInitializeRequest(request);
                    break;
                case 'tool/execute':
                    response = await this.handleToolExecuteRequest(request);
                    break;
                case 'shutdown':
                    // Handle shutdown request
                    response = {
                        jsonrpc: "2.0",
                        id: request.id,
                        result: null
                    };
                    // Don't actually shut down here, just acknowledge the request
                    console.error(`Received shutdown request, ID: ${request.id}`);
                    break;
                case '$/cancelRequest':
                    // Handle cancel request
                    response = {
                        jsonrpc: "2.0",
                        id: request.id,
                        result: null
                    };
                    console.error(`Received cancel request, ID: ${request.id}`);
                    break;
                case 'tools/list':
                    // Return the list of tools
                    const toolsForResponse = this.toolRegistry.getAllTools().map(tool => ({
                        name: tool.name,
                        description: tool.description,
                        inputSchema: tool.inputSchema,
                        outputSchema: tool.outputSchema,
                    }));
                    response = {
                        jsonrpc: "2.0",
                        id: request.id,
                        result: { tools: toolsForResponse }
                    };
                    console.error(`Received tools/list request, ID: ${request.id}`);
                    break;
                case 'resources/list':
                    // Return an empty list of resources (we don't have any)
                    response = {
                        jsonrpc: "2.0",
                        id: request.id,
                        result: { resources: [] }
                    };
                    console.error(`Received resources/list request, ID: ${request.id}`);
                    break;
                case 'prompts/list':
                    // Return an empty list of prompts (we don't have any)
                    response = {
                        jsonrpc: "2.0",
                        id: request.id,
                        result: { prompts: [] }
                    };
                    console.error(`Received prompts/list request, ID: ${request.id}`);
                    break;
                default:
                    console.error(`Received unsupported method: ${request.method}, ID: ${request.id}`);
                    response = {
                        jsonrpc: "2.0",
                        id: request.id,
                        error: { code: types_1.JsonRpcErrorCode.MethodNotFound, message: `Method not found: ${request.method}` }
                    };
                    break;
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
            console.error(`Error handling JSON-RPC request ${request.id} (${request.method}): ${errorMessage}`, error);
            response = {
                jsonrpc: "2.0",
                id: request.id,
                error: { code: types_1.JsonRpcErrorCode.InternalError, message: errorMessage }
            };
            this.eventEmitter.emit({ type: 'mcp_server_error', timestamp: new Date(), data: { requestId: request.id, error: response.error } });
        }
        // Send the response if one was generated
        if (response) {
            console.error(`>>> Preparing to send response for request ID: ${request.id}, Method: ${request.method}`);
            this.comms.send(response);
            console.error(`<<< Response sent for request ID: ${request.id}, Method: ${request.method}`);
            // Keep the process alive after sending the response
            setImmediate(() => {
                // This empty callback keeps the event loop active
            });
        }
        else {
            console.error(`!!! No response generated for request ID: ${request.id}, Method: ${request.method}`);
        }
    }
    // Handler for 'initialize' method
    handleInitializeRequest(request) {
        if (!request.params || typeof request.params.protocolVersion !== 'string') {
            return {
                jsonrpc: "2.0",
                id: request.id,
                error: { code: types_1.JsonRpcErrorCode.InvalidParams, message: "Invalid initialize parameters: protocolVersion missing or invalid." }
            };
        }
        const params = request.params;
        console.error(`Received initialize request from ${params.clientInfo?.name} v${params.clientInfo?.version} (protocol: ${params.protocolVersion})`);
        // Check protocol version compatibility if needed
        // if (params.protocolVersion !== PROTOCOL_VERSION) { ... }
        const toolsForResponse = this.toolRegistry.getAllTools().map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
            outputSchema: tool.outputSchema,
        }));
        const result = {
            protocolVersion: PROTOCOL_VERSION,
            serverInfo: {
                name: SERVER_NAME,
                version: package_json_1.version
            },
            capabilities: {
                tools: toolsForResponse
                // Add other capabilities here
            }
        };
        return {
            jsonrpc: "2.0",
            id: request.id,
            result: result
        };
    }
    // Handler for 'tool/execute' method
    async handleToolExecuteRequest(request) {
        // Validate params structure - adjust based on actual expected params for tool/execute
        if (!request.params || typeof request.params.toolId !== 'string' || !('arguments' in request.params)) {
            return {
                jsonrpc: "2.0",
                id: request.id,
                error: { code: types_1.JsonRpcErrorCode.InvalidParams, message: 'Invalid tool/execute parameters: toolId and arguments are required.' }
            };
        }
        const { toolId, arguments: input } = request.params; // 'arguments' is standard for JSON-RPC params
        const tool = this.toolRegistry.getTool(toolId);
        if (!tool) {
            return {
                jsonrpc: "2.0",
                id: request.id,
                error: { code: types_1.JsonRpcErrorCode.MethodNotFound, message: `Tool with ID "${toolId}" not found.` } // Or a custom error code
            };
        }
        this.eventEmitter.emit({ type: 'mcp_tool_execution_start', timestamp: new Date(), data: { toolId, name: tool.name, input } });
        try {
            // Execute the tool
            const output = await tool.execute(input);
            this.eventEmitter.emit({ type: 'mcp_tool_execution_complete', timestamp: new Date(), data: { toolId, name: tool.name, output } });
            // Send success response
            return {
                jsonrpc: "2.0",
                id: request.id,
                result: { output }, // Structure the result payload as needed by MCP spec
            };
        }
        catch (executionError) {
            const errorMessage = executionError instanceof Error ? executionError.message : 'Tool execution failed.';
            console.error(`Error executing tool ${tool.name} (ID: ${toolId}): ${errorMessage}`, executionError);
            this.eventEmitter.emit({ type: 'mcp_tool_execution_error', timestamp: new Date(), data: { toolId, name: tool.name, error: errorMessage } });
            // Return a JSON-RPC error response
            return {
                jsonrpc: "2.0",
                id: request.id,
                error: { code: types_1.JsonRpcErrorCode.InternalError, message: `Tool execution failed: ${errorMessage}` } // Or a more specific tool error code
            };
        }
    }
    // --- Event Listener Passthrough ---
    on(eventType, handler) {
        this.eventEmitter.on(eventType, handler);
    }
    off(eventType, handler) {
        this.eventEmitter.off(eventType, handler);
    }
}
exports.MCPServer = MCPServer;
