"use strict";
// Auto-generated boilerplate for auth-checker
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
exports.SecureEndpointsSchema = exports.AnalyzeAuthFlowSchema = exports.ValidateTokenSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const path = __importStar(require("path"));
function activate() {
    console.error("[TOOL] auth-checker activated");
}
/**
 * Handles file write events to validate security aspects
 */
function onFileWrite(event) {
    console.error(`[Auth Checker] Watching file write: ${event.path}`);
    // Check if it's an auth-related file
    if (path.basename(event.path).includes('auth') ||
        event.content.includes('authentication') ||
        event.content.includes('authorization')) {
        console.error(`[Auth Checker] Detected auth-related file change: ${event.path}`);
        // Could perform automatic security checks here
    }
}
/**
 * Handles session start logic
 */
function onSessionStart(session) {
    console.error(`[Auth Checker] Session started: ${session.id}`);
    // Could initialize security context here
}
/**
 * Handles auth-checker commands
 */
async function onCommand(command) {
    switch (command.name) {
        case 'auth-checker:validate':
            console.error('[Auth Checker] Validating token...');
            return await handleValidateToken(command.args[0]);
        case 'auth-checker:analyze':
            console.error('[Auth Checker] Analyzing auth flow...');
            return await handleAnalyzeAuthFlow(command.args[0]);
        case 'auth-checker:secure':
            console.error('[Auth Checker] Securing endpoints...');
            return await handleSecureEndpoints(command.args[0]);
        default:
            console.warn(`[Auth Checker] Unknown command: ${command.name}`);
            return { error: `Unknown command: ${command.name}` };
    }
}
// Define schemas for Auth Checker tool
exports.ValidateTokenSchema = zod_1.z.object({
    token: zod_1.z.string(),
    type: zod_1.z.enum(['JWT', 'OAuth', 'Basic', 'API_Key', 'Session']).optional().default('JWT'),
    secret: zod_1.z.string().optional(),
    audience: zod_1.z.string().optional(),
    issuer: zod_1.z.string().optional(),
});
exports.AnalyzeAuthFlowSchema = zod_1.z.object({
    directory: zod_1.z.string(),
    recursive: zod_1.z.boolean().optional().default(false),
    framework: zod_1.z.enum(['Express', 'Next.js', 'React', 'Angular', 'Vue', 'Django', 'Flask', 'Rails', 'Spring', 'ASP.NET']).optional(),
});
exports.SecureEndpointsSchema = zod_1.z.object({
    directory: zod_1.z.string(),
    pattern: zod_1.z.string().optional().default('**/*.{js,ts,jsx,tsx}'),
    authType: zod_1.z.enum(['JWT', 'OAuth', 'Basic', 'API_Key', 'Session']).optional().default('JWT'),
    generateMiddleware: zod_1.z.boolean().optional().default(false),
});
/**
 * Validates security tokens
 */
async function handleValidateToken(args) {
    try {
        const result = exports.ValidateTokenSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for token validation"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { token, type, secret, audience, issuer } = result.data;
        // In a real implementation, this would validate the token
        let isValid = false;
        let decodedToken = {};
        let validationMessages = [];
        try {
            // Simple check for JWT structure (header.payload.signature)
            if (type === 'JWT') {
                const parts = token.split('.');
                if (parts.length !== 3) {
                    validationMessages.push("Invalid JWT format: must have three parts");
                }
                else {
                    try {
                        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
                        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                        decodedToken = { header, payload };
                        // Check for token expiration
                        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
                            validationMessages.push("Token has expired");
                        }
                        else {
                            isValid = true;
                        }
                    }
                    catch (e) {
                        validationMessages.push("Could not decode token parts");
                    }
                }
            }
            else {
                // Other token types would have their own validation
                isValid = true; // Mock success for demo
                decodedToken = { type: "Mock decoded token" };
            }
        }
        catch (e) {
            validationMessages.push(`Error during validation: ${e}`);
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        isValid,
                        tokenType: type,
                        decodedToken: isValid ? decodedToken : null,
                        validationMessages,
                        message: isValid ? "Token is valid" : "Token validation failed"
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
                        message: "Failed to validate token"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Analyzes authentication flow in a project
 */
async function handleAnalyzeAuthFlow(args) {
    try {
        const result = exports.AnalyzeAuthFlowSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for auth flow analysis"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { directory, recursive, framework } = result.data;
        // In a real implementation, this would analyze the auth flow in the project
        // For now, we'll just return mock data
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        authFlowDetected: true,
                        framework: framework || "Detected framework",
                        authType: "JWT",
                        securityIssues: [
                            {
                                severity: "high",
                                issue: "JWT secret is hardcoded",
                                file: "config/auth.js",
                                line: 15,
                                recommendation: "Use environment variables for JWT secrets"
                            },
                            {
                                severity: "medium",
                                issue: "Missing CSRF protection",
                                file: "routes/auth.js",
                                line: 27,
                                recommendation: "Add CSRF token validation to login form"
                            }
                        ],
                        message: "Auth flow analysis completed"
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
                        message: "Failed to analyze auth flow"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Secures endpoints by adding auth middleware
 */
async function handleSecureEndpoints(args) {
    try {
        const result = exports.SecureEndpointsSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for securing endpoints"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { directory, pattern, authType, generateMiddleware } = result.data;
        // In a real implementation, this would add auth middleware to the endpoints
        // For now, we'll just return a mock success response
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        modifiedFiles: [
                            {
                                file: "routes/users.js",
                                changes: [{
                                        type: "added",
                                        line: 5,
                                        content: "const { verifyToken } = require('../middleware/auth');"
                                    }, {
                                        type: "modified",
                                        line: 12,
                                        oldContent: "router.get('/profile', async (req, res) => {",
                                        newContent: "router.get('/profile', verifyToken, async (req, res) => {"
                                    }]
                            },
                            {
                                file: "routes/posts.js",
                                changes: [{
                                        type: "added",
                                        line: 4,
                                        content: "const { verifyToken } = require('../middleware/auth');"
                                    }, {
                                        type: "modified",
                                        line: 15,
                                        oldContent: "router.post('/create', async (req, res) => {",
                                        newContent: "router.post('/create', verifyToken, async (req, res) => {"
                                    }]
                            }
                        ],
                        middlewareGenerated: generateMiddleware ? "middleware/auth.js" : null,
                        message: "Successfully secured endpoints with auth middleware"
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
                        message: "Failed to secure endpoints"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
