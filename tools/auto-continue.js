"use strict";
// Auto-generated boilerplate for auto-continue
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelContinuationSchema = exports.ResumeContinuationSchema = exports.CheckContinuationSchema = exports.RegisterContinuationSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const path = __importStar(require("path"));
const events_1 = require("events");
// Create an event emitter for managing continuation events
const continuationEmitter = new events_1.EventEmitter();
function activate() {
    console.log("[TOOL] auto-continue activated");
}
/**
 * Handles file write events for continuation management
 */
function onFileWrite(event) {
    console.log(`[Auto Continue] Watching file write: ${event.path}`);
    // Check if it's a continuation marker file or contains continuation markers
    if (path.basename(event.path).includes('continue') || event.content.includes('// CONTINUE_MARKER')) {
        console.log(`[Auto Continue] Detected continuation file: ${event.path}`);
        // Could trigger continuation of a process
    }
}
/**
 * Handles session start logic
 */
function onSessionStart(session) {
    console.log(`[Auto Continue] Session started: ${session.id}`);
    // Initialize continuation tracking for this session
    continuationStore[session.id] = {
        activeOperations: {},
        history: [],
        startTime: session.startTime
    };
}
/**
 * Handles auto-continue commands
 */
function onCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (command.name) {
            case 'auto-continue:register':
                console.log('[Auto Continue] Registering operation for auto-continuation...');
                return yield handleRegisterContinuation(command.args[0]);
            case 'auto-continue:check':
                console.log('[Auto Continue] Checking continuation status...');
                return yield handleCheckContinuation(command.args[0]);
            case 'auto-continue:resume':
                console.log('[Auto Continue] Resuming operation...');
                return yield handleResumeContinuation(command.args[0]);
            case 'auto-continue:cancel':
                console.log('[Auto Continue] Cancelling operation...');
                return yield handleCancelContinuation(command.args[0]);
            default:
                console.warn(`[Auto Continue] Unknown command: ${command.name}`);
                return { error: `Unknown command: ${command.name}` };
        }
    });
}
// In-memory store for continuation data
const continuationStore = {};
// Define schemas for Auto Continue tool
exports.RegisterContinuationSchema = zod_1.z.object({
    operationId: zod_1.z.string().optional(),
    type: zod_1.z.string(),
    data: zod_1.z.any(),
    autoResume: zod_1.z.boolean().optional().default(true),
    checkpointInterval: zod_1.z.number().optional().default(60000), // 1 minute in ms
    sessionId: zod_1.z.string().optional(),
});
exports.CheckContinuationSchema = zod_1.z.object({
    operationId: zod_1.z.string(),
    sessionId: zod_1.z.string().optional(),
});
exports.ResumeContinuationSchema = zod_1.z.object({
    operationId: zod_1.z.string(),
    sessionId: zod_1.z.string().optional(),
    customData: zod_1.z.any().optional(),
});
exports.CancelContinuationSchema = zod_1.z.object({
    operationId: zod_1.z.string(),
    sessionId: zod_1.z.string().optional(),
    reason: zod_1.z.string().optional(),
});
/**
 * Registers an operation for auto-continuation
 */
function handleRegisterContinuation(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.RegisterContinuationSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for registering continuation"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, type, data, autoResume, checkpointInterval, sessionId } = result.data;
            // Get the current active session or use the provided one
            const currentSessionId = sessionId || Object.keys(continuationStore)[0] || 'default';
            // Ensure the session exists in the store
            if (!continuationStore[currentSessionId]) {
                continuationStore[currentSessionId] = {
                    activeOperations: {},
                    history: [],
                    startTime: Date.now()
                };
            }
            // Create a new operation record
            const operation = {
                id: operationId,
                type,
                status: 'pending',
                data,
                startTime: Date.now(),
                lastUpdateTime: Date.now(),
                checkpointData: { initialState: true }
            };
            // Store the operation
            continuationStore[currentSessionId].activeOperations[operationId] = operation;
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            operationId,
                            type,
                            status: 'pending',
                            autoResume,
                            checkpointInterval,
                            message: `Operation ${operationId} registered for auto-continuation`
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: String(error),
                            message: "Failed to register continuation"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Checks the status of a continuation operation
 */
function handleCheckContinuation(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.CheckContinuationSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for checking continuation"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { operationId, sessionId } = result.data;
            // Get the current active session or use the provided one
            const currentSessionId = sessionId || Object.keys(continuationStore)[0] || 'default';
            // Ensure the session exists in the store
            if (!continuationStore[currentSessionId]) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Session ${currentSessionId} not found`,
                                message: "Failed to find session"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Find the operation
            const operation = continuationStore[currentSessionId].activeOperations[operationId];
            if (!operation) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Operation ${operationId} not found in session ${currentSessionId}`,
                                message: "Failed to find operation"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            operationId,
                            type: operation.type,
                            status: operation.status,
                            startTime: operation.startTime,
                            lastUpdateTime: operation.lastUpdateTime,
                            elapsedTime: Date.now() - operation.startTime,
                            message: `Operation ${operationId} status: ${operation.status}`
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: String(error),
                            message: "Failed to check continuation"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Resumes a paused continuation operation
 */
function handleResumeContinuation(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.ResumeContinuationSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for resuming continuation"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { operationId, sessionId, customData } = result.data;
            // Get the current active session or use the provided one
            const currentSessionId = sessionId || Object.keys(continuationStore)[0] || 'default';
            // Ensure the session exists in the store
            if (!continuationStore[currentSessionId]) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Session ${currentSessionId} not found`,
                                message: "Failed to find session"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Find the operation
            const operation = continuationStore[currentSessionId].activeOperations[operationId];
            if (!operation) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Operation ${operationId} not found in session ${currentSessionId}`,
                                message: "Failed to find operation"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Only paused operations can be resumed
            if (operation.status !== 'paused') {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Operation ${operationId} is not paused (current status: ${operation.status})`,
                                message: "Failed to resume operation"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Update operation status
            operation.status = 'running';
            operation.lastUpdateTime = Date.now();
            // Merge custom data if provided
            if (customData) {
                operation.data = Object.assign(Object.assign({}, operation.data), customData);
            }
            // Emit a continuation event
            continuationEmitter.emit('operation:resume', {
                operationId,
                sessionId: currentSessionId,
                operation
            });
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            operationId,
                            status: 'running',
                            lastUpdateTime: operation.lastUpdateTime,
                            message: `Operation ${operationId} resumed successfully`
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: String(error),
                            message: "Failed to resume continuation"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Cancels an ongoing continuation operation
 */
function handleCancelContinuation(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.CancelContinuationSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for cancelling continuation"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { operationId, sessionId, reason } = result.data;
            // Get the current active session or use the provided one
            const currentSessionId = sessionId || Object.keys(continuationStore)[0] || 'default';
            // Ensure the session exists in the store
            if (!continuationStore[currentSessionId]) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Session ${currentSessionId} not found`,
                                message: "Failed to find session"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Find the operation
            const operation = continuationStore[currentSessionId].activeOperations[operationId];
            if (!operation) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Operation ${operationId} not found in session ${currentSessionId}`,
                                message: "Failed to find operation"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Only running or paused operations can be cancelled
            if (operation.status !== 'running' && operation.status !== 'paused' && operation.status !== 'pending') {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Operation ${operationId} cannot be cancelled (current status: ${operation.status})`,
                                message: "Failed to cancel operation"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Update operation status
            const endTime = Date.now();
            // Move to history
            continuationStore[currentSessionId].history.push({
                id: operationId,
                type: operation.type,
                status: 'cancelled',
                startTime: operation.startTime,
                endTime
            });
            // Remove from active operations
            delete continuationStore[currentSessionId].activeOperations[operationId];
            // Emit a cancellation event
            continuationEmitter.emit('operation:cancel', {
                operationId,
                sessionId: currentSessionId,
                reason
            });
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            operationId,
                            status: 'cancelled',
                            reason: reason || 'User request',
                            duration: endTime - operation.startTime,
                            message: `Operation ${operationId} cancelled successfully`
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: String(error),
                            message: "Failed to cancel continuation"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
