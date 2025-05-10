// --- Existing MCPTool Definition ---
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: object; // JSON schema for input parameters
  outputSchema: object; // JSON schema for output
  execute: (input: any) => Promise<any>; // Function to execute the tool
}

// --- Internal Event Definitions ---
export interface MCPEvent {
  type: string; // e.g., 'mcp_request_received', 'tool_execution_start', 'tool_execution_complete'
  timestamp: Date;
  data: any;
}
export type MCPEventHandler = (event: MCPEvent) => void;

// --- Registered Tool Definition ---
export interface RegisteredTool extends MCPTool {
  id: string; // Unique ID assigned upon registration
}

// --- Message Format Definitions ---

// Our internal format for tool/resource operations (mostly used for responses now)
export interface InternalMCPMessage {
  id: string | number | null; // Align with JSON-RPC ID
  type: 'tool_response' | 'resource_response' | 'error_response' | 'ack_message'; // Types we might send back
  payload: any;
  error?: {
    code: string | number; // Allow numeric codes too
    message: string;
  };
}

// Generic JSON-RPC Request structure
export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number | string | null;
  method: string;
  params?: any;
}

// Generic JSON-RPC Response structure
export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: any;
  error?: {
    code: number; // JSON-RPC uses numeric codes
    message: string;
    data?: any;
  };
}

// Union type for any incoming message
export type IncomingMessage = JsonRpcRequest; // Assume all incoming are JSON-RPC for now

// Union type for any outgoing message
export type OutgoingMessage = InternalMCPMessage | JsonRpcResponse;

// --- Specific Method Parameters/Results ---

// Params for the 'initialize' method
export interface InitializeParams {
  protocolVersion: string;
  capabilities?: object;
  clientInfo?: {
    name: string;
    version: string;
  };
}

// Result for the 'initialize' method response
export interface InitializeResult {
  protocolVersion: string;
  serverInfo: {
    name: string;
    version: string;
  };
  capabilities: {
    tools: {
      name: string;
      description: string;
      inputSchema: object;
      outputSchema: object;
    }[];
    // Define other server capabilities here if needed
  };
}

// --- Standard JSON-RPC Error Codes (subset) ---
export enum JsonRpcErrorCode {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  ServerError = -32000 // -32000 to -32099 reserved for implementation-defined server-errors
}