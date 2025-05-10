// Auto-generated boilerplate for token-refresher

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Supported token types
type TokenType = 'jwt' | 'oauth' | 'apikey' | 'custom';

// JWT header structure
interface JWTHeader {
  alg: string;
  typ: string;
  kid?: string;
}

// JWT payload
interface JWTPayload {
  [key: string]: any;
  iss?: string;  // Issuer
  sub?: string;  // Subject
  aud?: string | string[];  // Audience
  exp?: number;  // Expiration Time
  nbf?: number;  // Not Before
  iat?: number;  // Issued At
  jti?: string;  // JWT ID
}

// Token storage
interface StoredToken {
  id: string;
  type: TokenType;
  value: string;
  decoded?: any;
  metadata: {
    name: string;
    description?: string;
    createdAt: number;
    expiresAt?: number;
    updatedAt?: number;
    lastRefreshedAt?: number;
    issuer?: string;
    audience?: string | string[];
    subject?: string;
    scopes?: string[];
    clientId?: string;
    environment?: string;
  };
  refreshToken?: string;
  refreshUrl?: string;
  refreshHeaders?: Record<string, string>;
  refreshData?: Record<string, any>;
  validationStatus?: 'valid' | 'expired' | 'invalid' | 'unknown';
}

// Token store
interface TokenStore {
  tokens: Record<string, StoredToken>;
  lastUpdated: number;
}

// Default config file path
const CONFIG_FILE_PATH = 'token-store.json';

// Current token store
let tokenStore: TokenStore = {
  tokens: {},
  lastUpdated: Date.now()
};

// JWKS cache for validation
const jwksCache: Record<string, {
  keys: any[];
  timestamp: number;
}> = {};

// Cache expiration time (24 hours)
const JWKS_CACHE_EXPIRY = 24 * 60 * 60 * 1000;

export function activate() {
  console.log("[TOOL] token-refresher activated");
  
  // Load token store
  loadTokenStore();
}

/**
 * Load token store from file
 */
async function loadTokenStore(): Promise<void> {
  try {
    if (fsSync.existsSync(CONFIG_FILE_PATH)) {
      const storeData = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
      tokenStore = JSON.parse(storeData);
      console.log(`[Token Refresher] Loaded ${Object.keys(tokenStore.tokens).length} tokens from store`);
    } else {
      // Create default store file
      await saveTokenStore();
      console.log(`[Token Refresher] Created default token store at ${CONFIG_FILE_PATH}`);
    }
  } catch (error) {
    console.error('[Token Refresher] Error loading token store:', error);
  }
}

/**
 * Save token store to file
 */
async function saveTokenStore(): Promise<void> {
  try {
    tokenStore.lastUpdated = Date.now();
    await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(tokenStore, null, 2), 'utf8');
    console.log(`[Token Refresher] Saved token store to ${CONFIG_FILE_PATH}`);
  } catch (error) {
    console.error('[Token Refresher] Error saving token store:', error);
  }
}

/**
 * Generate a token ID
 */
function generateTokenId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
}

/**
 * Decode a JWT token without verification
 */
function decodeJWT(token: string): { header: JWTHeader; payload: JWTPayload } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    return { header, payload };
  } catch (error) {
    console.error('[Token Refresher] Error decoding JWT:', error);
    return null;
  }
}

/**
 * Check if a token is expired
 */
function isTokenExpired(token: StoredToken): boolean {
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
function extractJWTMetadata(decoded: { header: JWTHeader; payload: JWTPayload }): Partial<StoredToken['metadata']> {
  const { payload } = decoded;
  
  const metadata: Partial<StoredToken['metadata']> = {
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
  } else if (Array.isArray(payload.scopes)) {
    metadata.scopes = payload.scopes;
  } else if (Array.isArray(payload.scp)) {
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
export function onFileWrite(event: { path: string; content: string }) {
  // Check if token store file was modified
  if (path.basename(event.path) === path.basename(CONFIG_FILE_PATH)) {
    console.log(`[Token Refresher] Token store file changed: ${event.path}`);
    loadTokenStore();
  }
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Token Refresher] Session started: ${session.id}`);
  
  // Reload token store on session start
  loadTokenStore();
}

/**
 * Handles token-refresher commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'token-refresher:decode':
      console.log('[Token Refresher] Decoding token...');
      return await handleDecodeToken(command.args[0]);
    case 'token-refresher:refresh':
      console.log('[Token Refresher] Refreshing token...');
      return await handleRefreshToken(command.args[0]);
    case 'token-refresher:store':
      console.log('[Token Refresher] Storing token...');
      return await handleStoreToken(command.args[0]);
    case 'token-refresher:validate':
      console.log('[Token Refresher] Validating token...');
      return await handleValidateToken(command.args[0]);
    case 'token-refresher:list':
      console.log('[Token Refresher] Listing tokens...');
      return await handleListTokens(command.args[0]);
    case 'token-refresher:get':
      console.log('[Token Refresher] Getting token...');
      return await handleGetToken(command.args[0]);
    case 'token-refresher:delete':
      console.log('[Token Refresher] Deleting token...');
      return await handleDeleteToken(command.args[0]);
    default:
      console.warn(`[Token Refresher] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Token Refresher tool
export const DecodeTokenSchema = z.object({
  token: z.string(),
  storeResult: z.boolean().optional().default(false),
  name: z.string().optional(),
  description: z.string().optional(),
});

export const RefreshTokenSchema = z.object({
  tokenId: z.string().optional(),
  token: z.string().optional(),
  refreshToken: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  refreshUrl: z.string().optional(),
  headers: z.record(z.string()).optional(),
  data: z.record(z.any()).optional(),
}).refine(
  data => data.tokenId !== undefined || data.token !== undefined,
  {
    message: 'Either tokenId or token must be provided',
    path: ['tokenId'],
  }
);

export const StoreTokenSchema = z.object({
  token: z.string(),
  name: z.string(),
  type: z.enum(['jwt', 'oauth', 'apikey', 'custom']).default('jwt'),
  description: z.string().optional(),
  refreshToken: z.string().optional(),
  refreshUrl: z.string().optional(),
  refreshHeaders: z.record(z.string()).optional(),
  refreshData: z.record(z.any()).optional(),
  expiresAt: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

export const ValidateTokenSchema = z.object({
  tokenId: z.string().optional(),
  token: z.string().optional(),
  jwksUrl: z.string().optional(),
  issuer: z.string().optional(),
  audience: z.string().optional(),
}).refine(
  data => data.tokenId !== undefined || data.token !== undefined,
  {
    message: 'Either tokenId or token must be provided',
    path: ['tokenId'],
  }
);

export const ListTokensSchema = z.object({
  type: z.enum(['jwt', 'oauth', 'apikey', 'custom', 'all']).optional().default('all'),
  includeDecoded: z.boolean().optional().default(false),
  includeExpired: z.boolean().optional().default(true),
  filter: z.string().optional(),
});

export const GetTokenSchema = z.object({
  tokenId: z.string(),
  includeDecoded: z.boolean().optional().default(true),
  includeRefreshToken: z.boolean().optional().default(false),
});

export const DeleteTokenSchema = z.object({
  tokenId: z.string(),
});

/**
 * Handles decoding a token
 */
async function handleDecodeToken(args: any) {
  try {
    const result = DecodeTokenSchema.safeParse(args);
    
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
      const storedToken: StoredToken = {
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
  } catch (error) {
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
async function handleRefreshToken(args: any) {
  try {
    const result = RefreshTokenSchema.safeParse(args);
    
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
    
    const { 
      tokenId, 
      token, 
      refreshToken, 
      clientId, 
      clientSecret, 
      refreshUrl, 
      headers,
      data
    } = result.data;
    
    // Get token from store if tokenId is provided
    let storedToken: StoredToken | null = null;
    
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
    } else if (token) {
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
    } else {
      // Create a new token entry
      const newTokenId = generateTokenId();
      const newStoredToken: StoredToken = {
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
  } catch (error) {
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
async function handleStoreToken(args: any) {
  try {
    const result = StoreTokenSchema.safeParse(args);
    
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
    
    const { 
      token, 
      name, 
      type, 
      description, 
      refreshToken, 
      refreshUrl, 
      refreshHeaders, 
      refreshData,
      expiresAt,
      metadata
    } = result.data;
    
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
    const storedToken: StoredToken = {
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
  } catch (error) {
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
async function handleValidateToken(args: any) {
  try {
    const result = ValidateTokenSchema.safeParse(args);
    
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
    let storedToken: StoredToken | null = null;
    let tokenToValidate: string;
    
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
    } else if (token) {
      tokenToValidate = token;
      
      // Find token in store by value
      const found = Object.values(tokenStore.tokens).find(t => t.value === token);
      
      if (found) {
        storedToken = found;
      }
    } else {
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
    let validationStatus: StoredToken['validationStatus'] = 'valid';
    const validationResults: any = {};
    
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
      } else {
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
  } catch (error) {
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
async function handleListTokens(args: any) {
  try {
    const result = ListTokensSchema.safeParse(args);
    
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
      tokens = tokens.filter(token => 
        token.metadata.name.toLowerCase().includes(filterLower) ||
        token.metadata.description?.toLowerCase().includes(filterLower) ||
        token.id.toLowerCase().includes(filterLower)
      );
    }
    
    // Format tokens for response
    const formattedTokens = tokens.map(token => {
      const formatted: any = {
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
  } catch (error) {
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
async function handleGetToken(args: any) {
  try {
    const result = GetTokenSchema.safeParse(args);
    
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
    const formattedToken: any = {
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
  } catch (error) {
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
async function handleDeleteToken(args: any) {
  try {
    const result = DeleteTokenSchema.safeParse(args);
    
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
  } catch (error) {
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