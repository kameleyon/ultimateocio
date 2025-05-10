"use strict";
// Auto-generated boilerplate for avatar-renderer
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSettingsSchema = exports.DeleteAvatarSchema = exports.ListAvatarsSchema = exports.GetAvatarSchema = exports.RenderAvatarSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const fsSync = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
// Default avatar settings
const DEFAULT_AVATAR_SETTINGS = {
    type: 'initials',
    size: {
        width: 128,
        height: 128
    },
    colors: {
        background: '#0070f3',
        foreground: '#ffffff'
    },
    cacheEnabled: true,
    roundedCorners: true
};
// Cache storage
let avatarCache = {
    entries: {},
    lastUpdated: Date.now()
};
// Default avatar cache file path
const CACHE_FILE_PATH = 'avatar-cache.json';
// Default avatars directory
const AVATARS_DIR = 'avatars';
function activate() {
    console.log("[TOOL] avatar-renderer activated");
    // Ensure avatars directory exists
    if (!fsSync.existsSync(AVATARS_DIR)) {
        fsSync.mkdirSync(AVATARS_DIR, { recursive: true });
    }
    // Load cache if available
    loadCache();
}
/**
 * Load cache from file
 */
function loadCache() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (fsSync.existsSync(CACHE_FILE_PATH)) {
                const cacheData = yield fs.readFile(CACHE_FILE_PATH, 'utf8');
                avatarCache = JSON.parse(cacheData);
                console.log(`[Avatar Renderer] Loaded ${Object.keys(avatarCache.entries).length} avatars from cache`);
            }
        }
        catch (error) {
            console.error('[Avatar Renderer] Error loading cache:', error);
        }
    });
}
/**
 * Save cache to file
 */
function saveCache() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            avatarCache.lastUpdated = Date.now();
            yield fs.writeFile(CACHE_FILE_PATH, JSON.stringify(avatarCache, null, 2), 'utf8');
            console.log(`[Avatar Renderer] Saved ${Object.keys(avatarCache.entries).length} avatars to cache`);
        }
        catch (error) {
            console.error('[Avatar Renderer] Error saving cache:', error);
        }
    });
}
/**
 * Generate avatar ID from input
 */
function generateAvatarId(input, type) {
    return crypto.createHash('md5').update(`${input}-${type}`).digest('hex');
}
/**
 * Generate initials avatar (simplified mock implementation)
 */
function generateInitialsAvatar(text, size, colors) {
    // In a real implementation, this would generate an actual image
    // For the boilerplate, we'll simulate the process
    const initials = text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    // Generate a unique filename
    const filename = `${Date.now()}-${initials}.png`;
    const filePath = path.join(AVATARS_DIR, filename);
    // Create a mock data URL (this would be actual image data in real implementation)
    const dataUrl = `data:image/png;base64,${Buffer.from('mock-avatar-data').toString('base64')}`;
    return {
        dataUrl,
        path: filePath
    };
}
/**
 * Generate identicon avatar (simplified mock implementation)
 */
function generateIdenticonAvatar(seed, size, colors) {
    // In a real implementation, this would generate an actual identicon
    // For the boilerplate, we'll simulate the process
    // Generate a unique filename
    const hash = crypto.createHash('md5').update(seed).digest('hex');
    const filename = `${Date.now()}-${hash.substring(0, 8)}.png`;
    const filePath = path.join(AVATARS_DIR, filename);
    // Create a mock data URL (this would be actual image data in real implementation)
    const dataUrl = `data:image/png;base64,${Buffer.from('mock-identicon-data').toString('base64')}`;
    return {
        dataUrl,
        path: filePath
    };
}
/**
 * Generate pixel art avatar (simplified mock implementation)
 */
function generatePixelArtAvatar(seed, size, colors) {
    // In a real implementation, this would generate pixel art
    // For the boilerplate, we'll simulate the process
    // Generate a unique filename
    const hash = crypto.createHash('md5').update(seed).digest('hex');
    const filename = `${Date.now()}-${hash.substring(0, 8)}.png`;
    const filePath = path.join(AVATARS_DIR, filename);
    // Create a mock data URL (this would be actual image data in real implementation)
    const dataUrl = `data:image/png;base64,${Buffer.from('mock-pixelart-data').toString('base64')}`;
    return {
        dataUrl,
        path: filePath
    };
}
/**
 * Handles file write events
 */
function onFileWrite(event) {
    // Check if cache file was modified
    if (path.basename(event.path) === path.basename(CACHE_FILE_PATH)) {
        console.log(`[Avatar Renderer] Cache file changed: ${event.path}`);
        loadCache();
    }
}
/**
 * Handles session start logic
 */
function onSessionStart(session) {
    console.log(`[Avatar Renderer] Session started: ${session.id}`);
    // Reload cache on session start
    loadCache();
}
/**
 * Handles avatar-renderer commands
 */
function onCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (command.name) {
            case 'avatar-renderer:render':
                console.log('[Avatar Renderer] Rendering avatar...');
                return yield handleRenderAvatar(command.args[0]);
            case 'avatar-renderer:get':
                console.log('[Avatar Renderer] Getting avatar...');
                return yield handleGetAvatar(command.args[0]);
            case 'avatar-renderer:list':
                console.log('[Avatar Renderer] Listing avatars...');
                return yield handleListAvatars(command.args[0]);
            case 'avatar-renderer:delete':
                console.log('[Avatar Renderer] Deleting avatar...');
                return yield handleDeleteAvatar(command.args[0]);
            case 'avatar-renderer:get-settings':
                console.log('[Avatar Renderer] Getting settings...');
                return yield handleGetSettings(command.args[0]);
            default:
                console.warn(`[Avatar Renderer] Unknown command: ${command.name}`);
                return { error: `Unknown command: ${command.name}` };
        }
    });
}
// Define schemas for Avatar Renderer tool
exports.RenderAvatarSchema = zod_1.z.object({
    type: zod_1.z.enum([
        'initials',
        'gravatar',
        'identicon',
        'pixelart',
        'photo',
        'svg',
        'emoji',
        'custom'
    ]),
    input: zod_1.z.string(),
    size: zod_1.z.object({
        width: zod_1.z.number().min(16).max(512),
        height: zod_1.z.number().min(16).max(512)
    }).optional(),
    colors: zod_1.z.object({
        background: zod_1.z.string(),
        foreground: zod_1.z.string(),
        accent: zod_1.z.string().optional()
    }).optional(),
    roundedCorners: zod_1.z.boolean().optional(),
    border: zod_1.z.object({
        width: zod_1.z.number().min(0).max(10),
        color: zod_1.z.string()
    }).optional(),
    shadow: zod_1.z.object({
        blur: zod_1.z.number().min(0).max(20),
        offset: zod_1.z.object({
            x: zod_1.z.number().min(-20).max(20),
            y: zod_1.z.number().min(-20).max(20)
        }),
        color: zod_1.z.string()
    }).optional(),
    cacheEnabled: zod_1.z.boolean().optional(),
    userId: zod_1.z.string().optional(),
    userName: zod_1.z.string().optional()
});
exports.GetAvatarSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    userId: zod_1.z.string().optional(),
    userName: zod_1.z.string().optional(),
    type: zod_1.z.enum([
        'initials',
        'gravatar',
        'identicon',
        'pixelart',
        'photo',
        'svg',
        'emoji',
        'custom'
    ]).optional(),
    returnDataUrl: zod_1.z.boolean().optional().default(true)
}).refine(data => data.id !== undefined || data.userId !== undefined || data.userName !== undefined, {
    message: 'Either id, userId, or userName must be provided',
    path: ['id'],
});
exports.ListAvatarsSchema = zod_1.z.object({
    type: zod_1.z.enum([
        'initials',
        'gravatar',
        'identicon',
        'pixelart',
        'photo',
        'svg',
        'emoji',
        'custom',
        'all'
    ]).optional().default('all'),
    userId: zod_1.z.string().optional(),
    limit: zod_1.z.number().min(1).max(100).optional().default(50),
    includeDataUrl: zod_1.z.boolean().optional().default(false)
});
exports.DeleteAvatarSchema = zod_1.z.object({
    id: zod_1.z.string(),
    deleteFile: zod_1.z.boolean().optional().default(true)
});
exports.GetSettingsSchema = zod_1.z.object({
    type: zod_1.z.enum([
        'initials',
        'gravatar',
        'identicon',
        'pixelart',
        'photo',
        'svg',
        'emoji',
        'custom',
        'all'
    ]).optional().default('all')
});
/**
 * Handles rendering an avatar
 */
function handleRenderAvatar(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.RenderAvatarSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for rendering avatar"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { type, input, size = DEFAULT_AVATAR_SETTINGS.size, colors = DEFAULT_AVATAR_SETTINGS.colors, roundedCorners = DEFAULT_AVATAR_SETTINGS.roundedCorners, border, shadow, cacheEnabled = DEFAULT_AVATAR_SETTINGS.cacheEnabled, userId, userName } = result.data;
            // Generate avatar ID
            const avatarId = generateAvatarId(input, type);
            // Check cache if enabled
            if (cacheEnabled && avatarCache.entries[avatarId]) {
                const cachedAvatar = avatarCache.entries[avatarId];
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                id: cachedAvatar.id,
                                type: cachedAvatar.type,
                                path: cachedAvatar.path,
                                dataUrl: cachedAvatar.dataUrl,
                                metadata: cachedAvatar.metadata,
                                cached: true,
                                message: `Retrieved cached avatar for '${input}'`
                            }, null, 2)
                        }]
                };
            }
            // Generate avatar based on type
            let avatarData;
            switch (type) {
                case 'initials':
                    avatarData = generateInitialsAvatar(input, size, colors);
                    break;
                case 'identicon':
                    avatarData = generateIdenticonAvatar(input, size, colors);
                    break;
                case 'pixelart':
                    avatarData = generatePixelArtAvatar(input, size, colors);
                    break;
                default:
                    // In a real implementation, we'd handle all types
                    // For the boilerplate, we'll default to initials
                    avatarData = generateInitialsAvatar(input, size, colors);
            }
            // Create cache entry if caching is enabled
            if (cacheEnabled) {
                const cacheEntry = {
                    id: avatarId,
                    type,
                    path: avatarData.path,
                    dataUrl: avatarData.dataUrl,
                    metadata: {
                        createdAt: Date.now(),
                        userId,
                        userName,
                        size,
                        colors
                    }
                };
                avatarCache.entries[avatarId] = cacheEntry;
                yield saveCache();
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            id: avatarId,
                            type,
                            path: avatarData.path,
                            dataUrl: avatarData.dataUrl,
                            metadata: {
                                createdAt: Date.now(),
                                userId,
                                userName,
                                size,
                                colors
                            },
                            cached: false,
                            message: `Successfully rendered ${type} avatar for '${input}'`
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
                            message: "Failed to render avatar"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles getting an avatar
 */
function handleGetAvatar(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.GetAvatarSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for getting avatar"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { id, userId, userName, type, returnDataUrl } = result.data;
            // If ID is provided, look up directly
            if (id && avatarCache.entries[id]) {
                const avatar = avatarCache.entries[id];
                // Exclude dataUrl if not requested
                if (!returnDataUrl) {
                    const { dataUrl } = avatar, avatarWithoutDataUrl = __rest(avatar, ["dataUrl"]);
                    return {
                        content: [{
                                type: "text",
                                text: JSON.stringify(Object.assign(Object.assign({}, avatarWithoutDataUrl), { message: `Retrieved avatar with ID '${id}'` }), null, 2)
                            }]
                    };
                }
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify(Object.assign(Object.assign({}, avatar), { message: `Retrieved avatar with ID '${id}'` }), null, 2)
                        }]
                };
            }
            // If userId or userName is provided, look up by those attributes
            if (userId || userName) {
                const avatarEntries = Object.values(avatarCache.entries).filter(avatar => {
                    let match = true;
                    if (userId) {
                        match = match && avatar.metadata.userId === userId;
                    }
                    if (userName) {
                        match = match && avatar.metadata.userName === userName;
                    }
                    if (type) {
                        match = match && avatar.type === type;
                    }
                    return match;
                });
                if (avatarEntries.length > 0) {
                    // Get the most recent avatar
                    const avatar = avatarEntries.sort((a, b) => b.metadata.createdAt - a.metadata.createdAt)[0];
                    // Exclude dataUrl if not requested
                    if (!returnDataUrl) {
                        const { dataUrl } = avatar, avatarWithoutDataUrl = __rest(avatar, ["dataUrl"]);
                        return {
                            content: [{
                                    type: "text",
                                    text: JSON.stringify(Object.assign(Object.assign({}, avatarWithoutDataUrl), { message: `Retrieved avatar for user ${userId || userName}` }), null, 2)
                                }]
                        };
                    }
                    return {
                        content: [{
                                type: "text",
                                text: JSON.stringify(Object.assign(Object.assign({}, avatar), { message: `Retrieved avatar for user ${userId || userName}` }), null, 2)
                            }]
                    };
                }
            }
            // Avatar not found
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: "Avatar not found",
                            message: "No matching avatar found in cache"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: String(error),
                            message: "Failed to get avatar"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles listing avatars
 */
function handleListAvatars(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.ListAvatarsSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for listing avatars"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { type, userId, limit, includeDataUrl } = result.data;
            // Filter avatars based on type and userId
            let filteredAvatars = Object.values(avatarCache.entries);
            if (type !== 'all') {
                filteredAvatars = filteredAvatars.filter(avatar => avatar.type === type);
            }
            if (userId) {
                filteredAvatars = filteredAvatars.filter(avatar => avatar.metadata.userId === userId);
            }
            // Sort by creation date (newest first)
            filteredAvatars.sort((a, b) => b.metadata.createdAt - a.metadata.createdAt);
            // Apply limit
            const limitedAvatars = filteredAvatars.slice(0, limit);
            // Format avatars for response
            const formattedAvatars = limitedAvatars.map(avatar => {
                if (includeDataUrl) {
                    return avatar;
                }
                // Exclude dataUrl if not requested
                const { dataUrl } = avatar, avatarWithoutDataUrl = __rest(avatar, ["dataUrl"]);
                return avatarWithoutDataUrl;
            });
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            avatars: formattedAvatars,
                            count: formattedAvatars.length,
                            total: filteredAvatars.length,
                            type,
                            userId,
                            includeDataUrl,
                            message: `Retrieved ${formattedAvatars.length} avatars`
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
                            message: "Failed to list avatars"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles deleting an avatar
 */
function handleDeleteAvatar(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.DeleteAvatarSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for deleting avatar"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { id, deleteFile } = result.data;
            // Check if avatar exists
            if (!avatarCache.entries[id]) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Avatar with ID '${id}' not found`,
                                message: "Failed to delete avatar"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Get avatar path
            const avatarPath = avatarCache.entries[id].path;
            // Delete file if requested
            if (deleteFile && fsSync.existsSync(avatarPath)) {
                yield fs.unlink(avatarPath);
            }
            // Remove from cache
            delete avatarCache.entries[id];
            yield saveCache();
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            id,
                            fileDeleted: deleteFile,
                            message: `Successfully deleted avatar with ID '${id}'`
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
                            message: "Failed to delete avatar"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles getting avatar settings
 */
function handleGetSettings(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.GetSettingsSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for getting settings"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { type } = result.data;
            // Return default settings
            const defaultSettings = Object.assign({}, DEFAULT_AVATAR_SETTINGS);
            // Return type-specific settings if requested
            if (type !== 'all') {
                // In a real implementation, there might be specific settings for each type
                // For the boilerplate, we'll return the default settings for all types
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                type,
                                settings: defaultSettings,
                                message: `Retrieved settings for ${type} avatars`
                            }, null, 2)
                        }]
                };
            }
            // Return all settings
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            defaultSettings,
                            cacheEntries: Object.keys(avatarCache.entries).length,
                            avatarsDirectory: AVATARS_DIR,
                            cacheFile: CACHE_FILE_PATH,
                            message: "Retrieved all avatar settings"
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
                            message: "Failed to get avatar settings"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
