// Auto-generated boilerplate for chat-logger

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Chat message types
type MessageRole = 'user' | 'assistant' | 'system' | 'function' | 'tool' | 'data';

// Chat message
interface ChatMessage {
  id: string;
  conversationId: string;
  timestamp: number;
  role: MessageRole;
  content: string;
  metadata?: {
    userId?: string;
    userName?: string;
    modelId?: string;
    tokens?: number;
    promptTokens?: number;
    completionTokens?: number;
    tools?: string[];
    duration?: number;
    sessionId?: string;
    ip?: string;
    userAgent?: string;
    custom?: Record<string, any>;
  };
}

// Chat conversation
interface ChatConversation {
  id: string;
  title?: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  metadata?: {
    userId?: string;
    userName?: string;
    modelId?: string;
    tags?: string[];
    category?: string;
    summary?: string;
    archived?: boolean;
    custom?: Record<string, any>;
  };
}

// Chat logger state
interface ChatLoggerState {
  conversations: Record<string, ChatConversation>;
  lastUpdated: number;
  retentionPolicy: {
    maxConversationAge: number; // In days, 0 = no limit
    maxMessagesPerConversation: number; // 0 = no limit
    maxConversations: number; // 0 = no limit
  };
  anonymizationEnabled: boolean;
  exportEnabled: boolean;
  searchEnabled: boolean;
  analyticsEnabled: boolean;
  encryptionEnabled: boolean;
  encryptionKey?: string;
}

// Default state
const DEFAULT_CHAT_LOGGER_STATE: ChatLoggerState = {
  conversations: {},
  lastUpdated: Date.now(),
  retentionPolicy: {
    maxConversationAge: 30, // 30 days
    maxMessagesPerConversation: 1000,
    maxConversations: 100
  },
  anonymizationEnabled: false,
  exportEnabled: true,
  searchEnabled: true,
  analyticsEnabled: true,
  encryptionEnabled: false
};

// Data file paths
const DATA_DIR = 'chat-logs';
const CONFIG_FILE = path.join(DATA_DIR, 'chat-logger-config.json');
const CONVERSATION_DIR = path.join(DATA_DIR, 'conversations');

// Current state
let chatLoggerState: ChatLoggerState = { ...DEFAULT_CHAT_LOGGER_STATE };

export function activate() {
  console.log("[TOOL] chat-logger activated");
  
  // Ensure directories exist
  if (!fsSync.existsSync(DATA_DIR)) {
    fsSync.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  if (!fsSync.existsSync(CONVERSATION_DIR)) {
    fsSync.mkdirSync(CONVERSATION_DIR, { recursive: true });
  }
  
  // Load configuration
  loadConfig();
  
  // Apply retention policy on startup
  doApplyRetentionPolicy();
}

/**
 * Load configuration from file
 */
async function loadConfig(): Promise<void> {
  try {
    if (fsSync.existsSync(CONFIG_FILE)) {
      const configData = await fs.readFile(CONFIG_FILE, 'utf8');
      chatLoggerState = JSON.parse(configData);
      console.log(`[Chat Logger] Loaded configuration`);
    } else {
      // Create default config
      await saveConfig();
      console.log(`[Chat Logger] Created default configuration`);
    }
  } catch (error) {
    console.error('[Chat Logger] Error loading configuration:', error);
  }
}

/**
 * Save configuration to file
 */
async function saveConfig(): Promise<void> {
  try {
    chatLoggerState.lastUpdated = Date.now();
    await fs.writeFile(CONFIG_FILE, JSON.stringify(chatLoggerState, null, 2), 'utf8');
    console.log(`[Chat Logger] Saved configuration`);
  } catch (error) {
    console.error('[Chat Logger] Error saving configuration:', error);
  }
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Apply retention policy to conversations
 */
function doApplyRetentionPolicy(): void {
  const { maxConversationAge, maxMessagesPerConversation, maxConversations } = chatLoggerState.retentionPolicy;
  const now = Date.now();
  
  // Apply age-based retention
  if (maxConversationAge > 0) {
    const maxAgeMs = maxConversationAge * 24 * 60 * 60 * 1000;
    const oldestAllowedTimestamp = now - maxAgeMs;
    
    Object.keys(chatLoggerState.conversations).forEach(conversationId => {
      const conversation = chatLoggerState.conversations[conversationId];
      if (conversation.createdAt < oldestAllowedTimestamp) {
        delete chatLoggerState.conversations[conversationId];
        // Delete conversation file if it exists
        const filePath = path.join(CONVERSATION_DIR, `${conversationId}.json`);
        if (fsSync.existsSync(filePath)) {
          fs.unlink(filePath).catch(err => 
            console.error(`[Chat Logger] Error deleting conversation file ${filePath}:`, err)
          );
        }
      }
    });
  }
  
  // Apply message count limit
  if (maxMessagesPerConversation > 0) {
    Object.keys(chatLoggerState.conversations).forEach(conversationId => {
      const conversation = chatLoggerState.conversations[conversationId];
      if (conversation.messages.length > maxMessagesPerConversation) {
        // Keep the newest messages, discard oldest
        conversation.messages = conversation.messages.slice(-maxMessagesPerConversation);
      }
    });
  }
  
  // Apply conversation count limit
  if (maxConversations > 0 && Object.keys(chatLoggerState.conversations).length > maxConversations) {
    // Sort conversations by updatedAt (oldest first)
    const sortedConversations = Object.entries(chatLoggerState.conversations)
      .sort(([, a], [, b]) => a.updatedAt - b.updatedAt);
    
    // Calculate how many to remove
    const removeCount = sortedConversations.length - maxConversations;
    
    // Remove oldest conversations
    for (let i = 0; i < removeCount; i++) {
      const [conversationId] = sortedConversations[i];
      delete chatLoggerState.conversations[conversationId];
      
      // Delete conversation file if it exists
      const filePath = path.join(CONVERSATION_DIR, `${conversationId}.json`);
      if (fsSync.existsSync(filePath)) {
        fs.unlink(filePath).catch(err => 
          console.error(`[Chat Logger] Error deleting conversation file ${filePath}:`, err)
        );
      }
    }
  }
  
  // Save updated configuration
  saveConfig();
}

/**
 * Load a conversation from file
 */
async function loadConversation(conversationId: string): Promise<ChatConversation | null> {
  try {
    const filePath = path.join(CONVERSATION_DIR, `${conversationId}.json`);
    if (fsSync.existsSync(filePath)) {
      const conversationData = await fs.readFile(filePath, 'utf8');
      return JSON.parse(conversationData);
    }
    return null;
  } catch (error) {
    console.error(`[Chat Logger] Error loading conversation ${conversationId}:`, error);
    return null;
  }
}

/**
 * Save a conversation to file
 */
async function saveConversation(conversation: ChatConversation): Promise<void> {
  try {
    const filePath = path.join(CONVERSATION_DIR, `${conversation.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(conversation, null, 2), 'utf8');
  } catch (error) {
    console.error(`[Chat Logger] Error saving conversation ${conversation.id}:`, error);
  }
}

/**
 * Anonymize sensitive data in a message or conversation
 */
function anonymizeData(data: any, fields: string[] = ['userId', 'userName', 'ip', 'userAgent']): any {
  if (!chatLoggerState.anonymizationEnabled) {
    return data;
  }
  
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  // Deep clone to avoid modifying original
  const result = Array.isArray(data) ? [...data] : { ...data };
  
  // Handle arrays
  if (Array.isArray(result)) {
    return result.map(item => anonymizeData(item, fields));
  }
  
  // Handle objects
  for (const key in result) {
    if (fields.includes(key)) {
      // Hash sensitive fields
      if (typeof result[key] === 'string') {
        result[key] = crypto.createHash('sha256').update(result[key]).digest('hex').substring(0, 8);
      } else {
        result[key] = '[REDACTED]';
      }
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      // Recursively process nested objects
      result[key] = anonymizeData(result[key], fields);
    }
  }
  
  return result;
}

/**
 * Handles file write events
 */
export function onFileWrite(event: { path: string; content: string }) {
  // Check if config file was modified
  if (path.basename(event.path) === path.basename(CONFIG_FILE)) {
    console.log(`[Chat Logger] Configuration file changed: ${event.path}`);
    loadConfig();
  }
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Chat Logger] Session started: ${session.id}`);
  
  // Reload configuration on session start
  loadConfig();
  
  // Apply retention policy on session start
  doApplyRetentionPolicy();
}

/**
 * Handles chat-logger commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'chat-logger:log-message':
      console.log('[Chat Logger] Logging message...');
      return await handleLogMessage(command.args[0]);
    case 'chat-logger:create-conversation':
      console.log('[Chat Logger] Creating conversation...');
      return await handleCreateConversation(command.args[0]);
    case 'chat-logger:get-conversation':
      console.log('[Chat Logger] Getting conversation...');
      return await handleGetConversation(command.args[0]);
    case 'chat-logger:list-conversations':
      console.log('[Chat Logger] Listing conversations...');
      return await handleListConversations(command.args[0]);
    case 'chat-logger:search-messages':
      console.log('[Chat Logger] Searching messages...');
      return await handleSearchMessages(command.args[0]);
    case 'chat-logger:export-conversation':
      console.log('[Chat Logger] Exporting conversation...');
      return await handleExportConversation(command.args[0]);
    case 'chat-logger:update-settings':
      console.log('[Chat Logger] Updating settings...');
      return await handleUpdateSettings(command.args[0]);
    default:
      console.warn(`[Chat Logger] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Chat Logger tool
export const LogMessageSchema = z.object({
  conversationId: z.string(),
  role: z.enum(['user', 'assistant', 'system', 'function', 'tool', 'data']),
  content: z.string(),
  metadata: z.object({
    userId: z.string().optional(),
    userName: z.string().optional(),
    modelId: z.string().optional(),
    tokens: z.number().optional(),
    promptTokens: z.number().optional(),
    completionTokens: z.number().optional(),
    tools: z.array(z.string()).optional(),
    duration: z.number().optional(),
    sessionId: z.string().optional(),
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    custom: z.record(z.any()).optional()
  }).optional()
});

export const CreateConversationSchema = z.object({
  title: z.string().optional(),
  metadata: z.object({
    userId: z.string().optional(),
    userName: z.string().optional(),
    modelId: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    summary: z.string().optional(),
    custom: z.record(z.any()).optional()
  }).optional(),
  initialMessages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system', 'function', 'tool', 'data']),
      content: z.string(),
      metadata: z.record(z.any()).optional()
    })
  ).optional()
});

export const GetConversationSchema = z.object({
  conversationId: z.string(),
  anonymize: z.boolean().optional().default(false)
});

export const ListConversationsSchema = z.object({
  limit: z.number().optional().default(20),
  offset: z.number().optional().default(0),
  sortBy: z.enum(['createdAt', 'updatedAt']).optional().default('updatedAt'),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
  userId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  includeMesages: z.boolean().optional().default(false),
  anonymize: z.boolean().optional().default(false)
});

export const SearchMessagesSchema = z.object({
  query: z.string(),
  conversationId: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.number().optional(),
  endDate: z.number().optional(),
  role: z.enum(['user', 'assistant', 'system', 'function', 'tool', 'data']).optional(),
  limit: z.number().optional().default(20),
  offset: z.number().optional().default(0),
  includeMetadata: z.boolean().optional().default(true),
  anonymize: z.boolean().optional().default(false)
});

export const ExportConversationSchema = z.object({
  conversationId: z.string(),
  format: z.enum(['json', 'text', 'html', 'csv', 'markdown']).default('json'),
  anonymize: z.boolean().optional().default(false),
  includeMetadata: z.boolean().optional().default(true),
  outputPath: z.string().optional()
});

export const UpdateSettingsSchema = z.object({
  retentionPolicy: z.object({
    maxConversationAge: z.number().optional(),
    maxMessagesPerConversation: z.number().optional(),
    maxConversations: z.number().optional()
  }).optional(),
  anonymizationEnabled: z.boolean().optional(),
  exportEnabled: z.boolean().optional(),
  searchEnabled: z.boolean().optional(),
  analyticsEnabled: z.boolean().optional(),
  encryptionEnabled: z.boolean().optional(),
  encryptionKey: z.string().optional(),
  applyRetentionPolicy: z.boolean().optional().default(false)
});

/**
 * Handles logging a message
 */
async function handleLogMessage(args: any) {
  try {
    const result = LogMessageSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for logging message"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { conversationId, role, content, metadata } = result.data;
    
    // Load conversation from file if not in memory
    if (!chatLoggerState.conversations[conversationId]) {
      const loadedConversation = await loadConversation(conversationId);
      if (loadedConversation) {
        chatLoggerState.conversations[conversationId] = loadedConversation;
      } else {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Conversation with ID '${conversationId}' not found`,
              message: "Failed to log message"
            }, null, 2)
          }],
          isError: true
        };
      }
    }
    
    // Add message to conversation
    const messageId = generateId();
    const timestamp = Date.now();
    
    const newMessage: ChatMessage = {
      id: messageId,
      conversationId,
      timestamp,
      role,
      content,
      metadata
    };
    
    // Add message to conversation
    const conversation = chatLoggerState.conversations[conversationId];
    conversation.messages.push(newMessage);
    conversation.updatedAt = timestamp;
    
    // Save the updated conversation
    await saveConversation(conversation);
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          messageId,
          conversationId,
          timestamp,
          role,
          contentLength: content.length,
          message: "Successfully logged message"
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to log message"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles creating a new conversation
 */
async function handleCreateConversation(args: any) {
  try {
    const result = CreateConversationSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for creating conversation"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { title, metadata, initialMessages } = result.data;
    
    // Create a new conversation
    const conversationId = generateId();
    const timestamp = Date.now();
    
    const messages: ChatMessage[] = [];
    
    // Add initial messages if provided
    if (initialMessages && initialMessages.length > 0) {
      initialMessages.forEach(msg => {
        messages.push({
          id: generateId(),
          conversationId,
          timestamp,
          role: msg.role,
          content: msg.content,
          metadata: msg.metadata
        });
      });
    }
    
    const conversation: ChatConversation = {
      id: conversationId,
      title,
      createdAt: timestamp,
      updatedAt: timestamp,
      messages,
      metadata
    };
    
    // Add to state
    chatLoggerState.conversations[conversationId] = conversation;
    
    // Save to file
    await saveConversation(conversation);
    
    // Apply retention policy if we've exceeded limits
    doApplyRetentionPolicy();
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          conversationId,
          title,
          createdAt: timestamp,
          messageCount: messages.length,
          message: "Successfully created conversation"
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to create conversation"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles getting a conversation
 */
async function handleGetConversation(args: any) {
  try {
    const result = GetConversationSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for getting conversation"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { conversationId, anonymize } = result.data;
    
    // Load conversation from file if not in memory
    if (!chatLoggerState.conversations[conversationId]) {
      const loadedConversation = await loadConversation(conversationId);
      if (loadedConversation) {
        chatLoggerState.conversations[conversationId] = loadedConversation;
      } else {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Conversation with ID '${conversationId}' not found`,
              message: "Failed to get conversation"
            }, null, 2)
          }],
          isError: true
        };
      }
    }
    
    const conversation = chatLoggerState.conversations[conversationId];
    
    // Anonymize if requested
    const responseData = anonymize || chatLoggerState.anonymizationEnabled 
      ? anonymizeData(conversation) 
      : conversation;
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          conversation: responseData,
          message: `Successfully retrieved conversation '${conversationId}'`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to get conversation"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles listing conversations
 */
async function handleListConversations(args: any) {
  try {
    const result = ListConversationsSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for listing conversations"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { 
      limit, 
      offset, 
      sortBy, 
      sortDirection, 
      userId,
      tags,
      category,
      includeMesages,
      anonymize
    } = result.data;
    
    // Get all conversations from disk if needed
    // For large datasets, we would use a database with pagination
    // This is simplified for the boilerplate
    const conversationDir = path.join(DATA_DIR, 'conversations');
    const files = await fs.readdir(conversationDir);
    
    // Load all conversations from files that aren't already in memory
    for (const file of files) {
      if (path.extname(file) === '.json') {
        const conversationId = path.basename(file, '.json');
        if (!chatLoggerState.conversations[conversationId]) {
          const conversation = await loadConversation(conversationId);
          if (conversation) {
            chatLoggerState.conversations[conversationId] = conversation;
          }
        }
      }
    }
    
    // Filter conversations
    let filteredConversations = Object.values(chatLoggerState.conversations);
    
    if (userId) {
      filteredConversations = filteredConversations.filter(
        c => c.metadata?.userId === userId
      );
    }
    
    if (tags && tags.length > 0) {
      filteredConversations = filteredConversations.filter(
        c => c.metadata?.tags && tags.every(tag => c.metadata?.tags?.includes(tag))
      );
    }
    
    if (category) {
      filteredConversations = filteredConversations.filter(
        c => c.metadata?.category === category
      );
    }
    
    // Sort conversations
    filteredConversations.sort((a, b) => {
      const valueA = sortBy === 'createdAt' ? a.createdAt : a.updatedAt;
      const valueB = sortBy === 'createdAt' ? b.createdAt : b.updatedAt;
      
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    });
    
    // Apply pagination
    const paginatedConversations = filteredConversations.slice(offset, offset + limit);
    
    // Format for response
    const formattedConversations = paginatedConversations.map(conversation => {
      // Create a copy to avoid modifying the original
      const formatted: any = {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messageCount: conversation.messages.length,
        metadata: conversation.metadata
      };
      
      // Include messages if requested
      if (includeMesages) {
        formatted.messages = conversation.messages;
      }
      
      return formatted;
    });
    
    // Anonymize if requested
    const responseData = anonymize || chatLoggerState.anonymizationEnabled
      ? anonymizeData(formattedConversations)
      : formattedConversations;
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          conversations: responseData,
          total: filteredConversations.length,
          count: responseData.length,
          hasMore: offset + limit < filteredConversations.length,
          message: `Retrieved ${responseData.length} conversations`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to list conversations"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles searching messages
 */
async function handleSearchMessages(args: any) {
  try {
    const result = SearchMessagesSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for searching messages"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    if (!chatLoggerState.searchEnabled) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: "Search is disabled in the current configuration",
            message: "Failed to search messages"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const {
      query,
      conversationId,
      userId,
      startDate,
      endDate,
      role,
      limit,
      offset,
      includeMetadata,
      anonymize
    } = result.data;
    
    // Get all conversations from disk if needed
    // For large datasets, we would use a database with text search
    // This is simplified for the boilerplate
    if (!conversationId) {
      const conversationDir = path.join(DATA_DIR, 'conversations');
      const files = await fs.readdir(conversationDir);
      
      // Load all conversations from files that aren't already in memory
      for (const file of files) {
        if (path.extname(file) === '.json') {
          const id = path.basename(file, '.json');
          if (!chatLoggerState.conversations[id]) {
            const conversation = await loadConversation(id);
            if (conversation) {
              chatLoggerState.conversations[id] = conversation;
            }
          }
        }
      }
    }
    
    // Get relevant conversations
    let relevantConversations = Object.values(chatLoggerState.conversations);
    
    if (conversationId) {
      relevantConversations = relevantConversations.filter(c => c.id === conversationId);
    }
    
    if (userId) {
      relevantConversations = relevantConversations.filter(c => 
        c.metadata?.userId === userId
      );
    }
    
    // Get all messages from relevant conversations
    let allMessages: (ChatMessage & { conversationTitle?: string })[] = [];
    
    relevantConversations.forEach(conversation => {
      const messagesWithTitle = conversation.messages.map(message => ({
        ...message,
        conversationTitle: conversation.title
      }));
      allMessages = allMessages.concat(messagesWithTitle);
    });
    
    // Apply message filters
    let filteredMessages = allMessages;
    
    // Filter by date range
    if (startDate) {
      filteredMessages = filteredMessages.filter(m => m.timestamp >= startDate);
    }
    
    if (endDate) {
      filteredMessages = filteredMessages.filter(m => m.timestamp <= endDate);
    }
    
    // Filter by role
    if (role) {
      filteredMessages = filteredMessages.filter(m => m.role === role);
    }
    
    // Search for query in message content
    // Simple string matching (case-insensitive)
    // In a real implementation, we'd use a proper text search engine
    const lowerQuery = query.toLowerCase();
    filteredMessages = filteredMessages.filter(m => 
      m.content.toLowerCase().includes(lowerQuery)
    );
    
    // Sort by timestamp (newest first)
    filteredMessages.sort((a, b) => b.timestamp - a.timestamp);
    
    // Apply pagination
    const paginatedMessages = filteredMessages.slice(offset, offset + limit);
    
    // Format for response
    const formattedMessages = paginatedMessages.map(message => {
      if (!includeMetadata) {
        // Exclude metadata
        const { metadata, ...messageWithoutMetadata } = message;
        return messageWithoutMetadata;
      }
      
      return message;
    });
    
    // Anonymize if requested
    const responseData = anonymize || chatLoggerState.anonymizationEnabled
      ? anonymizeData(formattedMessages)
      : formattedMessages;
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          messages: responseData,
          total: filteredMessages.length,
          count: responseData.length,
          hasMore: offset + limit < filteredMessages.length,
          query,
          message: `Found ${responseData.length} messages matching '${query}'`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to search messages"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles exporting a conversation
 */
async function handleExportConversation(args: any) {
  try {
    const result = ExportConversationSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for exporting conversation"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    if (!chatLoggerState.exportEnabled) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: "Export is disabled in the current configuration",
            message: "Failed to export conversation"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { conversationId, format, anonymize, includeMetadata, outputPath } = result.data;
    
    // Load conversation from file if not in memory
    if (!chatLoggerState.conversations[conversationId]) {
      const loadedConversation = await loadConversation(conversationId);
      if (loadedConversation) {
        chatLoggerState.conversations[conversationId] = loadedConversation;
      } else {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Conversation with ID '${conversationId}' not found`,
              message: "Failed to export conversation"
            }, null, 2)
          }],
          isError: true
        };
      }
    }
    
    const conversation = chatLoggerState.conversations[conversationId];
    
    // Anonymize if requested
    const dataToExport = anonymize || chatLoggerState.anonymizationEnabled
      ? anonymizeData(conversation)
      : conversation;
    
    // Remove metadata if requested
    if (!includeMetadata) {
      // Remove metadata from messages
      dataToExport.messages = dataToExport.messages.map((message: ChatMessage) => {
        const { metadata, ...messageWithoutMetadata } = message;
        return messageWithoutMetadata;
      });
      
      // Remove metadata from conversation
      if (dataToExport.metadata) {
        delete dataToExport.metadata;
      }
    }
    
    // Format the conversation
    let formattedContent = '';
    
    switch (format) {
      case 'json':
        formattedContent = JSON.stringify(dataToExport, null, 2);
        break;
        
      case 'text':
        const title = dataToExport.title || `Conversation ${dataToExport.id}`;
        formattedContent = `${title}\n${'='.repeat(title.length)}\n\n`;
        
        dataToExport.messages.forEach((message: ChatMessage) => {
          const timestamp = new Date(message.timestamp).toLocaleString();
          formattedContent += `[${message.role}] (${timestamp}):\n${message.content}\n\n`;
        });
        break;
        
      case 'html':
        formattedContent = `<!DOCTYPE html>
<html>
<head>
  <title>${dataToExport.title || `Conversation ${dataToExport.id}`}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 1rem; }
    .message { margin-bottom: 1rem; padding: 0.5rem; border-radius: 4px; }
    .user { background-color: #f0f0f0; }
    .assistant { background-color: #e0f0ff; }
    .system { background-color: #fff0e0; }
    .metadata { font-size: 0.8rem; color: #666; }
    .timestamp { color: #999; font-size: 0.8rem; }
  </style>
</head>
<body>
  <h1>${dataToExport.title || `Conversation ${dataToExport.id}`}</h1>
  <div class="metadata">
    <p>Created: ${new Date(dataToExport.createdAt).toLocaleString()}</p>
    <p>Updated: ${new Date(dataToExport.updatedAt).toLocaleString()}</p>
    ${dataToExport.metadata?.tags ? `<p>Tags: ${dataToExport.metadata.tags.join(', ')}</p>` : ''}
  </div>
  <div class="messages">
${dataToExport.messages.map((message: ChatMessage) => `
  <div class="message ${message.role}">
    <div class="header">
      <strong>${message.role}</strong>
      <span class="timestamp">${new Date(message.timestamp).toLocaleString()}</span>
    </div>
    <div class="content">${message.content.replace(/\n/g, '<br>')}</div>
  </div>
`).join('')}
  </div>
</body>
</html>`;
        break;
        
      case 'csv':
        // CSV header
        formattedContent = 'id,timestamp,role,content\n';
        
        // Add each message as a row
        dataToExport.messages.forEach((message: ChatMessage) => {
          // Escape content for CSV
          const escapedContent = message.content
            .replace(/"/g, '""') // Escape quotes
            .replace(/\n/g, ' '); // Replace newlines
          
          formattedContent += `"${message.id}","${message.timestamp}","${message.role}","${escapedContent}"\n`;
        });
        break;
        
      case 'markdown':
        const mdTitle = dataToExport.title || `Conversation ${dataToExport.id}`;
        formattedContent = `# ${mdTitle}\n\n`;
        
        if (dataToExport.metadata) {
          formattedContent += '## Metadata\n\n';
          formattedContent += `- Created: ${new Date(dataToExport.createdAt).toLocaleString()}\n`;
          formattedContent += `- Updated: ${new Date(dataToExport.updatedAt).toLocaleString()}\n`;
          
          if (dataToExport.metadata.tags) {
            formattedContent += `- Tags: ${dataToExport.metadata.tags.join(', ')}\n`;
          }
          
          formattedContent += '\n';
        }
        
        formattedContent += '## Messages\n\n';
        
        dataToExport.messages.forEach((message: ChatMessage) => {
          const timestamp = new Date(message.timestamp).toLocaleString();
          formattedContent += `### ${message.role} (${timestamp})\n\n`;
          formattedContent += `${message.content}\n\n`;
        });
        break;
    }
    
    // Save to file if output path is provided
    if (outputPath) {
      // Create directory if it doesn't exist
      const outputDir = path.dirname(outputPath);
      if (!fsSync.existsSync(outputDir)) {
        fsSync.mkdirSync(outputDir, { recursive: true });
      }
      
      await fs.writeFile(outputPath, formattedContent, 'utf8');
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          conversationId,
          title: dataToExport.title,
          format,
          messageCount: dataToExport.messages.length,
          contentLength: formattedContent.length,
          outputPath,
          content: outputPath ? undefined : formattedContent,
          message: `Successfully exported conversation in ${format} format`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to export conversation"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles updating settings
 */
async function handleUpdateSettings(args: any) {
  try {
    const result = UpdateSettingsSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for updating settings"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const {
      retentionPolicy,
      anonymizationEnabled,
      exportEnabled,
      searchEnabled,
      analyticsEnabled,
      encryptionEnabled,
      encryptionKey,
      applyRetentionPolicy
    } = result.data;
    
    // Update retention policy
    if (retentionPolicy) {
      if (retentionPolicy.maxConversationAge !== undefined) {
        chatLoggerState.retentionPolicy.maxConversationAge = retentionPolicy.maxConversationAge;
      }
      
      if (retentionPolicy.maxMessagesPerConversation !== undefined) {
        chatLoggerState.retentionPolicy.maxMessagesPerConversation = retentionPolicy.maxMessagesPerConversation;
      }
      
      if (retentionPolicy.maxConversations !== undefined) {
        chatLoggerState.retentionPolicy.maxConversations = retentionPolicy.maxConversations;
      }
    }
    
    // Update other settings
    if (anonymizationEnabled !== undefined) {
      chatLoggerState.anonymizationEnabled = anonymizationEnabled;
    }
    
    if (exportEnabled !== undefined) {
      chatLoggerState.exportEnabled = exportEnabled;
    }
    
    if (searchEnabled !== undefined) {
      chatLoggerState.searchEnabled = searchEnabled;
    }
    
    if (analyticsEnabled !== undefined) {
      chatLoggerState.analyticsEnabled = analyticsEnabled;
    }
    
    if (encryptionEnabled !== undefined) {
      chatLoggerState.encryptionEnabled = encryptionEnabled;
    }
    
    if (encryptionKey !== undefined && encryptionEnabled) {
      chatLoggerState.encryptionKey = encryptionKey;
    }
    
    // Save updated settings
    await saveConfig();
    
    // Apply retention policy if requested
    if (applyRetentionPolicy) {
      doApplyRetentionPolicy();
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          settings: {
            retentionPolicy: chatLoggerState.retentionPolicy,
            anonymizationEnabled: chatLoggerState.anonymizationEnabled,
            exportEnabled: chatLoggerState.exportEnabled,
            searchEnabled: chatLoggerState.searchEnabled,
            analyticsEnabled: chatLoggerState.analyticsEnabled,
            encryptionEnabled: chatLoggerState.encryptionEnabled,
            encryptionKeySet: Boolean(chatLoggerState.encryptionKey)
          },
          message: "Successfully updated settings"
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to update settings"
        }, null, 2)
      }],
      isError: true
    };
  }
}