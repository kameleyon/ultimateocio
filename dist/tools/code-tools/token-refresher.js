"use strict";
// Auto-generated boilerplate for token-refresher
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
exports.DeleteTokenSchema = exports.GetTokenSchema = exports.ListTokensSchema = exports.ValidateTokenSchema = exports.StoreTokenSchema = exports.RefreshTokenSchema = exports.DecodeTokenSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const fsSync = __importStar(require("fs"));
const path = __importStar(require("path"));
// Default config file path
const CONFIG_FILE_PATH = 'token-store.json';
// Current token store
let tokenStore = {
    tokens: {},
    lastUpdated: Date.now()
};
// JWKS cache for validation
const jwksCache = {};
// Cache expiration time (24 hours)
const JWKS_CACHE_EXPIRY = 24 * 60 * 60 * 1000;
function activate() {
    console.error("[TOOL] token-refresher activated");
    // Load token store
    loadTokenStore();
}
/**
 * Load token store from file
 */
async function loadTokenStore() {
    try {
        if (fsSync.existsSync(CONFIG_FILE_PATH)) {
            const storeData = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
            tokenStore = JSON.parse(storeData);
            console.error(`[Token Refresher] Loaded ${Object.keys(tokenStore.tokens).length} tokens from store`);
        }
        else {
            // Create default store file
            await saveTokenStore();
            console.error(`[Token Refresher] Created default token store at ${CONFIG_FILE_PATH}`);
        }
    }
    catch (error) {
        console.error('[Token Refresher] Error loading token store:', error);
    }
}
/**
 * Save token store to file
 */
async function saveTokenStore() {
    try {
        tokenStore.lastUpdated = Date.now();
        await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(tokenStore, null, 2), 'utf8');
        console.error(`[Token Refresher] Saved token store to ${CONFIG_FILE_PATH}`);
    }
    catch (error) {
        console.error('[Token Refresher] Error saving token store:', error);
    }
}
/**
 * Generate a token ID
 */
function generateTokenId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
}
/**
 * Decode a JWT token without verification
 */
function decodeJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return { header, payload };
    }
    catch (error) {
        console.error('[Token Refresher] Error decoding JWT:', error);
        return null;
    }
}
/**
 * Check if a token is expired
 */
function isTokenExpired(token) {
    if (token.type === 'jwt' && token.decoded?.payload?.exp) {
        const expiryTime = token.decoded.payload.exp * 1000; // Convert to milliseconds
        return Date.now() > expiryTime;
    }
    if (token.metadata.expiresAt) {
        return Date.now() > token.metadata.expiresAt;
    }
    return false;
}
/**
 * Extract token metadata from decoded JWT
 */
function extractJWTMetadata(decoded) {
    const { payload } = decoded;
    const metadata = {
        issuer: payload.iss,
        subject: payload.sub,
        audience: payload.aud,
    };
    if (payload.exp) {
        metadata.expiresAt = payload.exp * 1000; // Convert to milliseconds
    }
    if (payload.iat) {
        metadata.createdAt = payload.iat * 1000; // Convert to milliseconds
    }
    // Extract scopes if available in common formats
    if (typeof payload.scope === 'string') {
        metadata.scopes = payload.scope.split(' ');
    }
    else if (Array.isArray(payload.scopes)) {
        metadata.scopes = payload.scopes;
    }
    else if (Array.isArray(payload.scp)) {
        metadata.scopes = payload.scp;
    }
    // Extract client ID if available
    if (payload.client_id || payload.azp || payload.clientId) {
        metadata.clientId = payload.client_id || payload.azp || payload.clientId;
    }
    return metadata;
}
/**
 * Handles file write events
 */
function onFileWrite(event) {
    // Check if token store file was modified
    if (path.basename(event.path) === path.basename(CONFIG_FILE_PATH)) {
        console.error(`[Token Refresher] Token store file changed: ${event.path}`);
        loadTokenStore();
    }
}
/**
 * Handles session start logic
 */
function onSessionStart(session) {
    console.error(`[Token Refresher] Session started: ${session.id}`);
    // Reload token store on session start
    loadTokenStore();
}
/**
 * Handles token-refresher commands
 */
async function onCommand(command) {
    switch (command.name) {
        case 'token-refresher:decode':
            console.error('[Token Refresher] Decoding token...');
            return await handleDecodeToken(command.args[0]);
        case 'token-refresher:refresh':
            console.error('[Token Refresher] Refreshing token...');
            return await handleRefreshToken(command.args[0]);
        case 'token-refresher:store':
            console.error('[Token Refresher] Storing token...');
            return await handleStoreToken(command.args[0]);
        case 'token-refresher:validate':
            console.error('[Token Refresher] Validating token...');
            return await handleValidateToken(command.args[0]);
        case 'token-refresher:list':
            console.error('[Token Refresher] Listing tokens...');
            return await handleListTokens(command.args[0]);
        case 'token-refresher:get':
            console.error('[Token Refresher] Getting token...');
            return await handleGetToken(command.args[0]);
        case 'token-refresher:delete':
            console.error('[Token Refresher] Deleting token...');
            return await handleDeleteToken(command.args[0]);
        default:
            console.warn(`[Token Refresher] Unknown command: ${command.name}`);
            return { error: `Unknown command: ${command.name}` };
    }
}
// Define schemas for Token Refresher tool
exports.DecodeTokenSchema = zod_1.z.object({
    token: zod_1.z.string(),
    storeResult: zod_1.z.boolean().optional().default(false),
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
});
exports.RefreshTokenSchema = zod_1.z.object({
    tokenId: zod_1.z.string().optional(),
    token: zod_1.z.string().optional(),
    refreshToken: zod_1.z.string().optional(),
    clientId: zod_1.z.string().optional(),
    clientSecret: zod_1.z.string().optional(),
    refreshUrl: zod_1.z.string().optional(),
    headers: zod_1.z.record(zod_1.z.string()).optional(),
    data: zod_1.z.record(zod_1.z.any()).optional(),
}).refine(data => data.tokenId !== undefined || data.token !== undefined, {
    message: 'Either tokenId or token must be provided',
    path: ['tokenId'],
});
exports.StoreTokenSchema = zod_1.z.object({
    token: zod_1.z.string(),
    name: zod_1.z.string(),
    type: zod_1.z.enum(['jwt', 'oauth', 'apikey', 'custom']).default('jwt'),
    description: zod_1.z.string().optional(),
    refreshToken: zod_1.z.string().optional(),
    refreshUrl: zod_1.z.string().optional(),
    refreshHeaders: zod_1.z.record(zod_1.z.string()).optional(),
    refreshData: zod_1.z.record(zod_1.z.any()).optional(),
    expiresAt: zod_1.z.number().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.ValidateTokenSchema = zod_1.z.object({
    tokenId: zod_1.z.string().optional(),
    token: zod_1.z.string().optional(),
    jwksUrl: zod_1.z.string().optional(),
    issuer: zod_1.z.string().optional(),
    audience: zod_1.z.string().optional(),
}).refine(data => data.tokenId !== undefined || data.token !== undefined, {
    message: 'Either tokenId or token must be provided',
    path: ['tokenId'],
});
exports.ListTokensSchema = zod_1.z.object({
    type: zod_1.z.enum(['jwt', 'oauth', 'apikey', 'custom', 'all']).optional().default('all'),
    includeDecoded: zod_1.z.boolean().optional().default(false),
    includeExpired: zod_1.z.boolean().optional().default(true),
    filter: zod_1.z.string().optional(),
});
exports.GetTokenSchema = zod_1.z.object({
    tokenId: zod_1.z.string(),
    includeDecoded: zod_1.z.boolean().optional().default(true),
    includeRefreshToken: zod_1.z.boolean().optional().default(false),
});
exports.DeleteTokenSchema = zod_1.z.object({
    tokenId: zod_1.z.string(),
});
/**
 * Handles decoding a token
 */
async function handleDecodeToken(args) {
    try {
        const result = exports.DecodeTokenSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for decoding token"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { token, storeResult, name, description } = result.data;
        // Attempt to decode the token
        const decoded = decodeJWT(token);
        if (!decoded) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: "Failed to decode token. Ensure it's a valid JWT token.",
                            message: "Invalid token format"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Store the result if requested
        if (storeResult) {
            const tokenId = generateTokenId();
            const metadata = {
                name: name || `Token ${tokenId.substring(0, 6)}`,
                description: description || 'Decoded from JWT',
                createdAt: Date.now(),
                ...extractJWTMetadata(decoded)
            };
            // Create stored token
            const storedToken = {
                id: tokenId,
                type: 'jwt',
                value: token,
                decoded,
                metadata,
                validationStatus: 'unknown'
            };
            // Add to store
            tokenStore.tokens[tokenId] = storedToken;
            // Save store
            await saveTokenStore();
        }
        // Determine if the token is expired
        const isExpired = decoded.payload.exp ? (Date.now() > decoded.payload.exp * 1000) : false;
        // Calculate key metrics
        const metrics = {
            isExpired,
            timeUntilExpiry: decoded.payload.exp ?
                (decoded.payload.exp * 1000 - Date.now()) / 1000 / 60 : // minutes
                null,
            issuer: decoded.payload.iss || 'Unknown',
            audience: decoded.payload.aud || 'Not specified',
            subject: decoded.payload.sub || 'Not specified',
            algorithm: decoded.header.alg,
            type: decoded.header.typ || 'JWT',
            kid: decoded.header.kid || null,
        };
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        header: decoded.header,
                        payload: decoded.payload,
                        metrics,
                        stored: storeResult,
                        tokenId: storeResult ? tokenStore.tokens[Object.keys(tokenStore.tokens).pop() || ''].id : null,
                        message: `Successfully decoded JWT token${storeResult ? ' and stored it' : ''}`
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
                        message: "Failed to decode token"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles refreshing a token
 */
async function handleRefreshToken(args) {
    try {
        const result = exports.RefreshTokenSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for refreshing token"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { tokenId, token, refreshToken, clientId, clientSecret, refreshUrl, headers, data } = result.data;
        // Get token from store if tokenId is provided
        let storedToken = null;
        if (tokenId) {
            storedToken = tokenStore.tokens[tokenId];
            if (!storedToken) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Token with ID '${tokenId}' not found`,
                                message: "Failed to refresh token"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
        }
        else if (token) {
            // Find token in store by value
            const found = Object.values(tokenStore.tokens).find(t => t.value === token);
            if (found) {
                storedToken = found;
            }
        }
        // For the boilerplate, we'll simulate a token refresh
        // In a real implementation, this would make an HTTP request
        // Generate new token values
        const newToken = `new.jwt.token.${Date.now()}`;
        const newRefreshToken = `new.refresh.token.${Date.now()}`;
        // Update token in store if it was found
        if (storedToken) {
            storedToken.value = newToken;
            storedToken.refreshToken = newRefreshToken;
            storedToken.metadata.lastRefreshedAt = Date.now();
            storedToken.metadata.updatedAt = Date.now();
            // Update expiry (simulate 1 hour from now)
            storedToken.metadata.expiresAt = Date.now() + 60 * 60 * 1000;
            // Update decoded value if it's a JWT
            if (storedToken.type === 'jwt') {
                const decoded = decodeJWT(newToken);
                if (decoded) {
                    storedToken.decoded = decoded;
                }
            }
            // Update store
            await saveTokenStore();
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            tokenId: storedToken.id,
                            name: storedToken.metadata.name,
                            newToken,
                            newRefreshToken,
                            expiresAt: storedToken.metadata.expiresAt,
                            message: `Successfully refreshed token '${storedToken.metadata.name}'`
                        }, null, 2)
                    }]
            };
        }
        else {
            // Create a new token entry
            const newTokenId = generateTokenId();
            const newStoredToken = {
                id: newTokenId,
                type: 'oauth',
                value: newToken,
                refreshToken: newRefreshToken,
                refreshUrl,
                refreshHeaders: headers,
                refreshData: data,
                metadata: {
                    name: `Refreshed Token ${newTokenId.substring(0, 6)}`,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    lastRefreshedAt: Date.now(),
                    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
                    clientId,
                }
            };
            // Add to store
            tokenStore.tokens[newTokenId] = newStoredToken;
            // Save store
            await saveTokenStore();
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            tokenId: newTokenId,
                            name: newStoredToken.metadata.name,
                            newToken,
                            newRefreshToken,
                            expiresAt: newStoredToken.metadata.expiresAt,
                            message: `Successfully created new refreshed token '${newStoredToken.metadata.name}'`
                        }, null, 2)
                    }]
            };
        }
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        error: String(error),
                        message: "Failed to refresh token"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles storing a token
 */
async function handleStoreToken(args) {
    try {
        const result = exports.StoreTokenSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for storing token"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { token, name, type, description, refreshToken, refreshUrl, refreshHeaders, refreshData, expiresAt, metadata } = result.data;
        // Generate token id
        const tokenId = generateTokenId();
        // Create base metadata
        const baseMetadata = {
            name,
            description,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            expiresAt,
            ...metadata
        };
        // If it's a JWT, decode it and extract metadata
        let decoded = null;
        let extractedMetadata = {};
        if (type === 'jwt') {
            decoded = decodeJWT(token);
            if (decoded) {
                extractedMetadata = extractJWTMetadata(decoded);
            }
        }
        // Create the stored token
        const storedToken = {
            id: tokenId,
            type,
            value: token,
            decoded,
            metadata: {
                ...baseMetadata,
                ...extractedMetadata
            },
            refreshToken,
            refreshUrl,
            refreshHeaders,
            refreshData,
            validationStatus: 'unknown'
        };
        // Add to store
        tokenStore.tokens[tokenId] = storedToken;
        // Save store
        await saveTokenStore();
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        tokenId,
                        name,
                        type,
                        decoded: decoded ? {
                            header: decoded.header,
                            expiresAt: decoded.payload.exp ? new Date(decoded.payload.exp * 1000).toISOString() : null,
                            issuer: decoded.payload.iss || null,
                            subject: decoded.payload.sub || null,
                        } : null,
                        message: `Successfully stored ${type} token '${name}'`
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
                        message: "Failed to store token"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles validating a token
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
                            message: "Invalid arguments for validating token"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { tokenId, token, jwksUrl, issuer, audience } = result.data;
        // Get token from store if tokenId is provided
        let storedToken = null;
        let tokenToValidate;
        if (tokenId) {
            storedToken = tokenStore.tokens[tokenId];
            if (!storedToken) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Token with ID '${tokenId}' not found`,
                                message: "Failed to validate token"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            tokenToValidate = storedToken.value;
        }
        else if (token) {
            tokenToValidate = token;
            // Find token in store by value
            const found = Object.values(tokenStore.tokens).find(t => t.value === token);
            if (found) {
                storedToken = found;
            }
        }
        else {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: "Either tokenId or token must be provided",
                            message: "Failed to validate token"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Decode the token
        const decoded = decodeJWT(tokenToValidate);
        if (!decoded) {
            const validationStatus = 'invalid';
            // Update stored token if it exists
            if (storedToken) {
                storedToken.validationStatus = validationStatus;
                await saveTokenStore();
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            valid: false,
                            validationStatus,
                            error: "Failed to decode token. Ensure it's a valid JWT token.",
                            message: "Invalid token format"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Check expiration
        let validationStatus = 'valid';
        const validationResults = {};
        if (decoded.payload.exp) {
            const expiryTime = decoded.payload.exp * 1000; // Convert to milliseconds
            const isExpired = Date.now() > expiryTime;
            validationResults.expired = isExpired;
            if (isExpired) {
                validationStatus = 'expired';
            }
        }
        // Check issuer if provided
        if (issuer && decoded.payload.iss !== issuer) {
            validationResults.issuerMismatch = true;
            validationStatus = 'invalid';
        }
        // Check audience if provided
        if (audience) {
            const tokenAud = decoded.payload.aud;
            let audienceValid = false;
            if (Array.isArray(tokenAud)) {
                audienceValid = tokenAud.includes(audience);
            }
            else {
                audienceValid = tokenAud === audience;
            }
            validationResults.audienceValid = audienceValid;
            if (!audienceValid) {
                validationStatus = 'invalid';
            }
        }
        // In a real implementation, this would verify the token signature
        // using the public key from JWKS if provided
        validationResults.signatureValid = true; // Simulated result
        // Update stored token if it exists
        if (storedToken) {
            storedToken.validationStatus = validationStatus;
            await saveTokenStore();
        }
        // Prepare verification result
        const verificationResult = {
            valid: validationStatus === 'valid',
            validationStatus,
            results: validationResults,
            decoded: {
                header: decoded.header,
                payload: decoded.payload
            }
        };
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        ...verificationResult,
                        storedTokenId: storedToken?.id,
                        message: validationStatus === 'valid'
                            ? 'Token is valid'
                            : validationStatus === 'expired'
                                ? 'Token has expired'
                                : 'Token is invalid'
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
 * Handles listing tokens from the store
 */
async function handleListTokens(args) {
    try {
        const result = exports.ListTokensSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for listing tokens"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { type, includeDecoded, includeExpired, filter } = result.data;
        // Get all tokens
        let tokens = Object.values(tokenStore.tokens);
        // Filter by type
        if (type !== 'all') {
            tokens = tokens.filter(token => token.type === type);
        }
        // Filter by expiration
        if (!includeExpired) {
            tokens = tokens.filter(token => !isTokenExpired(token));
        }
        // Filter by text
        if (filter) {
            const filterLower = filter.toLowerCase();
            tokens = tokens.filter(token => token.metadata.name.toLowerCase().includes(filterLower) ||
                token.metadata.description?.toLowerCase().includes(filterLower) ||
                token.id.toLowerCase().includes(filterLower));
        }
        // Format tokens for response
        const formattedTokens = tokens.map(token => {
            const formatted = {
                id: token.id,
                name: token.metadata.name,
                type: token.type,
                description: token.metadata.description,
                createdAt: token.metadata.createdAt,
                updatedAt: token.metadata.updatedAt,
                expiresAt: token.metadata.expiresAt,
                isExpired: token.metadata.expiresAt ? Date.now() > token.metadata.expiresAt : false,
                lastRefreshedAt: token.metadata.lastRefreshedAt,
                hasRefreshToken: !!token.refreshToken,
                validationStatus: token.validationStatus
            };
            if (includeDecoded && token.decoded) {
                formatted.decoded = {
                    header: token.decoded.header,
                    payload: token.decoded.payload
                };
            }
            return formatted;
        });
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        tokens: formattedTokens,
                        count: formattedTokens.length,
                        filter: type !== 'all' ? type : null,
                        includeExpired,
                        lastUpdated: new Date(tokenStore.lastUpdated).toISOString(),
                        message: `Found ${formattedTokens.length} tokens`
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
                        message: "Failed to list tokens"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles getting a specific token from the store
 */
async function handleGetToken(args) {
    try {
        const result = exports.GetTokenSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for getting token"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { tokenId, includeDecoded, includeRefreshToken } = result.data;
        // Get token from store
        const token = tokenStore.tokens[tokenId];
        if (!token) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Token with ID '${tokenId}' not found`,
                            message: "Failed to get token"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Format token for response
        const formattedToken = {
            id: token.id,
            name: token.metadata.name,
            type: token.type,
            description: token.metadata.description,
            createdAt: token.metadata.createdAt,
            updatedAt: token.metadata.updatedAt,
            expiresAt: token.metadata.expiresAt,
            isExpired: token.metadata.expiresAt ? Date.now() > token.metadata.expiresAt : false,
            lastRefreshedAt: token.metadata.lastRefreshedAt,
            value: token.value,
            hasRefreshToken: !!token.refreshToken,
            validationStatus: token.validationStatus,
            metadata: token.metadata
        };
        if (includeDecoded && token.decoded) {
            formattedToken.decoded = {
                header: token.decoded.header,
                payload: token.decoded.payload
            };
        }
        if (includeRefreshToken && token.refreshToken) {
            formattedToken.refreshToken = token.refreshToken;
            formattedToken.refreshUrl = token.refreshUrl;
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        token: formattedToken,
                        message: `Retrieved token '${token.metadata.name}'`
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
                        message: "Failed to get token"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles deleting a token from the store
 */
async function handleDeleteToken(args) {
    try {
        const result = exports.DeleteTokenSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for deleting token"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { tokenId } = result.data;
        // Check if token exists
        if (!tokenStore.tokens[tokenId]) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Token with ID '${tokenId}' not found`,
                            message: "Failed to delete token"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Store token info for response
        const tokenName = tokenStore.tokens[tokenId].metadata.name;
        // Delete token
        delete tokenStore.tokens[tokenId];
        // Save store
        await saveTokenStore();
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        tokenId,
                        name: tokenName,
                        message: `Successfully deleted token '${tokenName}'`
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
                        message: "Failed to delete token"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
