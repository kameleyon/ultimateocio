"use strict";
// Auto-generated boilerplate for api-generator
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
exports.DocumentAPISchema = exports.ListAPIsSchema = exports.CreateAPISchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const path = __importStar(require("path"));
function activate() {
    console.error("[TOOL] api-generator activated");
}
/**
 * Handles file write events to trigger API generation
 */
function onFileWrite(event) {
    console.error(`[API Generator] Watching file write: ${event.path}`);
    // Analyze if the file is API related (e.g., route definitions, controllers)
    if (path.basename(event.path).includes('api') || path.basename(event.path).includes('route')) {
        console.error(`[API Generator] Detected API-related file change: ${event.path}`);
        // Could auto-generate related API components here
    }
}
/**
 * Handles session start logic
 */
function onSessionStart(session) {
    console.error(`[API Generator] Session started: ${session.id}`);
    // Could load settings or prepare API templates here
}
/**
 * Handles api-generator commands
 */
async function onCommand(command) {
    switch (command.name) {
        case 'api-generator:create':
            console.error('[API Generator] Creating API endpoint...');
            return await handleCreateAPI(command.args[0]);
        case 'api-generator:list':
            console.error('[API Generator] Listing available endpoints...');
            return await handleListAPIs(command.args[0]);
        case 'api-generator:document':
            console.error('[API Generator] Generating API documentation...');
            return await handleDocumentAPI(command.args[0]);
        default:
            console.warn(`[API Generator] Unknown command: ${command.name}`);
            return { error: `Unknown command: ${command.name}` };
    }
}
// Define schemas for the API Generator tool
exports.CreateAPISchema = zod_1.z.object({
    name: zod_1.z.string(),
    method: zod_1.z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    path: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    requestSchema: zod_1.z.any().optional(),
    responseSchema: zod_1.z.any().optional(),
    authRequired: zod_1.z.boolean().optional().default(false),
    directory: zod_1.z.string().optional(),
});
exports.ListAPIsSchema = zod_1.z.object({
    directory: zod_1.z.string().optional(),
    includeSchema: zod_1.z.boolean().optional().default(false),
});
exports.DocumentAPISchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    directory: zod_1.z.string().optional(),
    format: zod_1.z.enum(['json', 'markdown', 'html', 'openapi']).optional().default('markdown'),
    outputPath: zod_1.z.string().optional(),
});
/**
 * Creates a new API endpoint
 */
async function handleCreateAPI(args) {
    try {
        const result = exports.CreateAPISchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for creating API endpoint"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { name, method, path: endpointPath, description, requestSchema, responseSchema, authRequired, directory } = result.data;
        // In a real implementation, this would create the necessary files for the API endpoint
        // For now, we'll just return a mock success response
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        name,
                        method,
                        path: endpointPath,
                        description,
                        message: `API endpoint ${method} ${endpointPath} created successfully`
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
                        message: "Failed to create API endpoint"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Lists available API endpoints
 */
async function handleListAPIs(args) {
    try {
        const result = exports.ListAPIsSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for listing API endpoints"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { directory, includeSchema } = result.data;
        // In a real implementation, this would scan the directory for API endpoints
        // For now, we'll just return mock data
        const mockEndpoints = [
            {
                name: "getUserProfile",
                method: "GET",
                path: "/api/users/:id",
                description: "Get user profile by ID",
                authRequired: true
            },
            {
                name: "createUser",
                method: "POST",
                path: "/api/users",
                description: "Create a new user",
                authRequired: false
            }
        ];
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        endpoints: mockEndpoints,
                        count: mockEndpoints.length,
                        message: `Found ${mockEndpoints.length} API endpoints`
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
                        message: "Failed to list API endpoints"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Generates documentation for API endpoints
 */
async function handleDocumentAPI(args) {
    try {
        const result = exports.DocumentAPISchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for generating API documentation"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { name, directory, format, outputPath } = result.data;
        // In a real implementation, this would generate documentation for the API
        // For now, we'll just return a mock success response
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        format,
                        outputPath: outputPath || 'api-docs.' + format,
                        message: `API documentation generated successfully in ${format} format`
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
                        message: "Failed to generate API documentation"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
