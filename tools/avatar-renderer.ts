// Auto-generated boilerplate for avatar-renderer

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Supported avatar types
type AvatarType = 
  'initials' | 
  'gravatar' | 
  'identicon' | 
  'pixelart' | 
  'photo' | 
  'svg' | 
  'emoji' | 
  'custom';

// Avatar size configuration
interface AvatarSize {
  width: number;
  height: number;
}

// Avatar colors configuration
interface AvatarColors {
  background: string;
  foreground: string;
  accent?: string;
}

// Avatar render options
interface AvatarRenderOptions {
  type: AvatarType;
  size: AvatarSize;
  colors: AvatarColors;
  cacheEnabled: boolean;
  roundedCorners: boolean;
  border?: {
    width: number;
    color: string;
  };
  shadow?: {
    blur: number;
    offset: { x: number; y: number };
    color: string;
  };
}

// Avatar cache entry
interface AvatarCacheEntry {
  id: string;
  type: AvatarType;
  path: string;
  dataUrl?: string;
  metadata: {
    createdAt: number;
    userId?: string;
    userName?: string;
    size: AvatarSize;
    colors: AvatarColors;
  };
}

// Avatar cache
interface AvatarCache {
  entries: Record<string, AvatarCacheEntry>;
  lastUpdated: number;
}

// Default avatar settings
const DEFAULT_AVATAR_SETTINGS: AvatarRenderOptions = {
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
let avatarCache: AvatarCache = {
  entries: {},
  lastUpdated: Date.now()
};

// Default avatar cache file path
const CACHE_FILE_PATH = 'avatar-cache.json';

// Default avatars directory
const AVATARS_DIR = 'avatars';

export function activate() {
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
async function loadCache(): Promise<void> {
  try {
    if (fsSync.existsSync(CACHE_FILE_PATH)) {
      const cacheData = await fs.readFile(CACHE_FILE_PATH, 'utf8');
      avatarCache = JSON.parse(cacheData);
      console.log(`[Avatar Renderer] Loaded ${Object.keys(avatarCache.entries).length} avatars from cache`);
    }
  } catch (error) {
    console.error('[Avatar Renderer] Error loading cache:', error);
  }
}

/**
 * Save cache to file
 */
async function saveCache(): Promise<void> {
  try {
    avatarCache.lastUpdated = Date.now();
    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(avatarCache, null, 2), 'utf8');
    console.log(`[Avatar Renderer] Saved ${Object.keys(avatarCache.entries).length} avatars to cache`);
  } catch (error) {
    console.error('[Avatar Renderer] Error saving cache:', error);
  }
}

/**
 * Generate avatar ID from input
 */
function generateAvatarId(input: string, type: AvatarType): string {
  return crypto.createHash('md5').update(`${input}-${type}`).digest('hex');
}

/**
 * Generate initials avatar (simplified mock implementation)
 */
function generateInitialsAvatar(
  text: string,
  size: AvatarSize,
  colors: AvatarColors
): { dataUrl: string; path: string } {
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
function generateIdenticonAvatar(
  seed: string,
  size: AvatarSize,
  colors: AvatarColors
): { dataUrl: string; path: string } {
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
function generatePixelArtAvatar(
  seed: string,
  size: AvatarSize,
  colors: AvatarColors
): { dataUrl: string; path: string } {
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
export function onFileWrite(event: { path: string; content: string }) {
  // Check if cache file was modified
  if (path.basename(event.path) === path.basename(CACHE_FILE_PATH)) {
    console.log(`[Avatar Renderer] Cache file changed: ${event.path}`);
    loadCache();
  }
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Avatar Renderer] Session started: ${session.id}`);
  
  // Reload cache on session start
  loadCache();
}

/**
 * Handles avatar-renderer commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'avatar-renderer:render':
      console.log('[Avatar Renderer] Rendering avatar...');
      return await handleRenderAvatar(command.args[0]);
    case 'avatar-renderer:get':
      console.log('[Avatar Renderer] Getting avatar...');
      return await handleGetAvatar(command.args[0]);
    case 'avatar-renderer:list':
      console.log('[Avatar Renderer] Listing avatars...');
      return await handleListAvatars(command.args[0]);
    case 'avatar-renderer:delete':
      console.log('[Avatar Renderer] Deleting avatar...');
      return await handleDeleteAvatar(command.args[0]);
    case 'avatar-renderer:get-settings':
      console.log('[Avatar Renderer] Getting settings...');
      return await handleGetSettings(command.args[0]);
    default:
      console.warn(`[Avatar Renderer] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Avatar Renderer tool
export const RenderAvatarSchema = z.object({
  type: z.enum([
    'initials', 
    'gravatar', 
    'identicon', 
    'pixelart', 
    'photo',
    'svg',
    'emoji',
    'custom'
  ]),
  input: z.string(),
  size: z.object({
    width: z.number().min(16).max(512),
    height: z.number().min(16).max(512)
  }).optional(),
  colors: z.object({
    background: z.string(),
    foreground: z.string(),
    accent: z.string().optional()
  }).optional(),
  roundedCorners: z.boolean().optional(),
  border: z.object({
    width: z.number().min(0).max(10),
    color: z.string()
  }).optional(),
  shadow: z.object({
    blur: z.number().min(0).max(20),
    offset: z.object({
      x: z.number().min(-20).max(20),
      y: z.number().min(-20).max(20)
    }),
    color: z.string()
  }).optional(),
  cacheEnabled: z.boolean().optional(),
  userId: z.string().optional(),
  userName: z.string().optional()
});

export const GetAvatarSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  userName: z.string().optional(),
  type: z.enum([
    'initials', 
    'gravatar', 
    'identicon', 
    'pixelart', 
    'photo',
    'svg',
    'emoji',
    'custom'
  ]).optional(),
  returnDataUrl: z.boolean().optional().default(true)
}).refine(
  data => data.id !== undefined || data.userId !== undefined || data.userName !== undefined,
  {
    message: 'Either id, userId, or userName must be provided',
    path: ['id'],
  }
);

export const ListAvatarsSchema = z.object({
  type: z.enum([
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
  userId: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(50),
  includeDataUrl: z.boolean().optional().default(false)
});

export const DeleteAvatarSchema = z.object({
  id: z.string(),
  deleteFile: z.boolean().optional().default(true)
});

export const GetSettingsSchema = z.object({
  type: z.enum([
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
async function handleRenderAvatar(args: any) {
  try {
    const result = RenderAvatarSchema.safeParse(args);
    
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
    
    const { 
      type, 
      input, 
      size = DEFAULT_AVATAR_SETTINGS.size, 
      colors = DEFAULT_AVATAR_SETTINGS.colors,
      roundedCorners = DEFAULT_AVATAR_SETTINGS.roundedCorners,
      border,
      shadow,
      cacheEnabled = DEFAULT_AVATAR_SETTINGS.cacheEnabled,
      userId,
      userName
    } = result.data;
    
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
    let avatarData: { dataUrl: string; path: string };
    
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
      const cacheEntry: AvatarCacheEntry = {
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
      await saveCache();
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
  } catch (error) {
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
}

/**
 * Handles getting an avatar
 */
async function handleGetAvatar(args: any) {
  try {
    const result = GetAvatarSchema.safeParse(args);
    
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
        const { dataUrl, ...avatarWithoutDataUrl } = avatar;
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              ...avatarWithoutDataUrl,
              message: `Retrieved avatar with ID '${id}'`
            }, null, 2)
          }]
        };
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            ...avatar,
            message: `Retrieved avatar with ID '${id}'`
          }, null, 2)
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
        const avatar = avatarEntries.sort(
          (a, b) => b.metadata.createdAt - a.metadata.createdAt
        )[0];
        
        // Exclude dataUrl if not requested
        if (!returnDataUrl) {
          const { dataUrl, ...avatarWithoutDataUrl } = avatar;
          
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                ...avatarWithoutDataUrl,
                message: `Retrieved avatar for user ${userId || userName}`
              }, null, 2)
            }]
          };
        }
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              ...avatar,
              message: `Retrieved avatar for user ${userId || userName}`
            }, null, 2)
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
  } catch (error) {
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
}

/**
 * Handles listing avatars
 */
async function handleListAvatars(args: any) {
  try {
    const result = ListAvatarsSchema.safeParse(args);
    
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
      const { dataUrl, ...avatarWithoutDataUrl } = avatar;
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
  } catch (error) {
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
}

/**
 * Handles deleting an avatar
 */
async function handleDeleteAvatar(args: any) {
  try {
    const result = DeleteAvatarSchema.safeParse(args);
    
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
      await fs.unlink(avatarPath);
    }
    
    // Remove from cache
    delete avatarCache.entries[id];
    await saveCache();
    
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
  } catch (error) {
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
}

/**
 * Handles getting avatar settings
 */
async function handleGetSettings(args: any) {
  try {
    const result = GetSettingsSchema.safeParse(args);
    
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
    const defaultSettings = { ...DEFAULT_AVATAR_SETTINGS };
    
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
  } catch (error) {
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
}