"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonRpcErrorCode = void 0;
// --- Standard JSON-RPC Error Codes (subset) ---
var JsonRpcErrorCode;
(function (JsonRpcErrorCode) {
    JsonRpcErrorCode[JsonRpcErrorCode["ParseError"] = -32700] = "ParseError";
    JsonRpcErrorCode[JsonRpcErrorCode["InvalidRequest"] = -32600] = "InvalidRequest";
    JsonRpcErrorCode[JsonRpcErrorCode["MethodNotFound"] = -32601] = "MethodNotFound";
    JsonRpcErrorCode[JsonRpcErrorCode["InvalidParams"] = -32602] = "InvalidParams";
    JsonRpcErrorCode[JsonRpcErrorCode["InternalError"] = -32603] = "InternalError";
    JsonRpcErrorCode[JsonRpcErrorCode["ServerError"] = -32000] = "ServerError"; // -32000 to -32099 reserved for implementation-defined server-errors
})(JsonRpcErrorCode || (exports.JsonRpcErrorCode = JsonRpcErrorCode = {}));
