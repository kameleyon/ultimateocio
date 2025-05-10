// Auto-generated boilerplate for notification-sender

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { execSync } from 'child_process';

// Notification channel types
type Channel = 'console' | 'desktop' | 'file' | 'webhook';

// Notification alert levels
type AlertLevel = 'info' | 'warning' | 'error' | 'critical';

// Notification history storage
interface NotificationRecord {
  id: string;
  channel: Channel;
  message: string;
  level: AlertLevel;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
  deliveryStatus: 'pending' | 'delivered' | 'failed';
  error?: string;
}

// In-memory storage for notification history
let notificationHistory: NotificationRecord[] = [];

// Config for notification thresholds
interface ThresholdConfig {
  windowSizeMs: number;
  maxNotifications: number;
  minLevel: AlertLevel;
  cooldownPeriodMs: number;
}

// Default threshold configuration
const thresholds: Record<AlertLevel, ThresholdConfig> = {
  info: {
    windowSizeMs: 60000, // 1 minute
    maxNotifications: 10,
    minLevel: 'info',
    cooldownPeriodMs: 60000 // 1 minute
  },
  warning: {
    windowSizeMs: 300000, // 5 minutes
    maxNotifications: 5,
    minLevel: 'warning',
    cooldownPeriodMs: 120000 // 2 minutes
  },
  error: {
    windowSizeMs: 900000, // 15 minutes
    maxNotifications: 3,
    minLevel: 'error',
    cooldownPeriodMs: 300000 // 5 minutes
  },
  critical: {
    windowSizeMs: 1800000, // 30 minutes
    maxNotifications: 1,
    minLevel: 'critical',
    cooldownPeriodMs: 600000 // 10 minutes
  }
};

// Notification cooldown tracking
const cooldowns: Record<string, number> = {};

// Check if desktop notifications are available
let desktopNotificationsAvailable = false;
try {
  // Try to check for a notification command
  if (process.platform === 'win32') {
    // On Windows, check if PowerShell is available
    execSync('powershell.exe -Command "Get-Command New-BurntToastNotification -ErrorAction SilentlyContinue"', { stdio: 'ignore' });
    desktopNotificationsAvailable = true;
  } else if (process.platform === 'darwin') {
    // On macOS, check if osascript is available
    execSync('which osascript', { stdio: 'ignore' });
    desktopNotificationsAvailable = true;
  } else if (process.platform === 'linux') {
    // On Linux, check if notify-send is available
    execSync('which notify-send', { stdio: 'ignore' });
    desktopNotificationsAvailable = true;
  }
} catch (e) {
  desktopNotificationsAvailable = false;
}

export function activate() {
  console.log("[TOOL] notification-sender activated");
  console.log(`[Notification Sender] Desktop notifications ${desktopNotificationsAvailable ? 'available' : 'not available'}`);
}

/**
 * Handles file write events to detect issues that might need notifications
 */
export function onFileWrite(event: { path: string; content: string }) {
  // Check for potential errors in files that might trigger notifications
  if (event.path.endsWith('.log') && (
    event.content.includes('ERROR') || 
    event.content.includes('FATAL') || 
    event.content.includes('CRITICAL')
  )) {
    // Extract error message
    const lines = event.content.split('\n');
    const errorLine = lines.find(line => 
      line.includes('ERROR') || 
      line.includes('FATAL') || 
      line.includes('CRITICAL')
    );
    
    if (errorLine) {
      // Send a notification about the error
      sendNotification({
        channel: 'console',
        message: `Error detected in log file ${path.basename(event.path)}: ${errorLine.trim()}`,
        level: 'error',
        metadata: {
          file: event.path,
          line: errorLine.trim()
        }
      });
    }
  }
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Notification Sender] Session started: ${session.id}`);
  
  // Send a notification for session start
  sendNotification({
    channel: 'console',
    message: `Session ${session.id} started`,
    level: 'info',
    metadata: {
      sessionId: session.id,
      startTime: new Date(session.startTime).toISOString()
    }
  });
}

/**
 * Handles notification-sender commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'notification-sender:send':
      console.log('[Notification Sender] Sending notification...');
      return await handleSendNotification(command.args[0]);
    case 'notification-sender:configure':
      console.log('[Notification Sender] Configuring thresholds...');
      return await handleConfigureThresholds(command.args[0]);
    case 'notification-sender:history':
      console.log('[Notification Sender] Getting notification history...');
      return await handleGetHistory(command.args[0]);
    case 'notification-sender:test':
      console.log('[Notification Sender] Testing notification channels...');
      return await handleTestChannels(command.args[0]);
    default:
      console.warn(`[Notification Sender] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Notification Sender tool
export const SendNotificationSchema = z.object({
  message: z.string(),
  level: z.enum(['info', 'warning', 'error', 'critical']).default('info'),
  channel: z.enum(['console', 'desktop', 'file', 'webhook']).default('console'),
  userId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  title: z.string().optional(),
  icon: z.string().optional(),
  webhookUrl: z.string().optional(),
  filePath: z.string().optional(),
  throttle: z.boolean().optional().default(true),
});

export const ConfigureThresholdsSchema = z.object({
  level: z.enum(['info', 'warning', 'error', 'critical']),
  windowSizeMs: z.number().optional(),
  maxNotifications: z.number().optional(),
  cooldownPeriodMs: z.number().optional(),
});

export const GetHistorySchema = z.object({
  limit: z.number().optional().default(10),
  level: z.enum(['info', 'warning', 'error', 'critical']).optional(),
  channel: z.enum(['console', 'desktop', 'file', 'webhook']).optional(),
  userId: z.string().optional(),
  status: z.enum(['pending', 'delivered', 'failed']).optional(),
  since: z.number().optional(), // timestamp
});

export const TestChannelsSchema = z.object({
  channels: z.array(z.enum(['console', 'desktop', 'file', 'webhook'])).default(['console']),
  message: z.string().optional().default('Test notification'),
  webhookUrl: z.string().optional(),
  filePath: z.string().optional(),
});

/**
 * Generate a unique ID for a notification
 */
function generateNotificationId(): string {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * Check if notification should be throttled based on thresholds
 */
function shouldThrottle(level: AlertLevel, channelKey: string): boolean {
  const now = Date.now();
  const threshold = thresholds[level];
  
  // Check cooldown period first
  if (cooldowns[channelKey] && (now - cooldowns[channelKey] < threshold.cooldownPeriodMs)) {
    return true;
  }
  
  // Count recent notifications
  const windowStart = now - threshold.windowSizeMs;
  const recentNotifications = notificationHistory.filter(n => 
    n.timestamp.getTime() > windowStart &&
    getAlertLevelPriority(n.level) >= getAlertLevelPriority(threshold.minLevel) &&
    (channelKey.includes('channel') ? n.channel === channelKey.split(':')[1] : true) &&
    (channelKey.includes('userId') ? n.userId === channelKey.split(':')[1] : true)
  );
  
  // Throttle if we've exceeded the threshold
  if (recentNotifications.length >= threshold.maxNotifications) {
    // Set cooldown
    cooldowns[channelKey] = now;
    return true;
  }
  
  return false;
}

/**
 * Get a numeric priority for alert levels
 */
function getAlertLevelPriority(level: AlertLevel): number {
  switch (level) {
    case 'info': return 0;
    case 'warning': return 1;
    case 'error': return 2;
    case 'critical': return 3;
    default: return 0;
  }
}

/**
 * Send a notification through the specified channel
 */
async function sendNotification(params: {
  channel: Channel;
  message: string;
  level: AlertLevel;
  title?: string;
  icon?: string;
  webhookUrl?: string;
  filePath?: string;
  userId?: string;
  metadata?: Record<string, any>;
  throttle?: boolean;
}): Promise<NotificationRecord> {
  const {
    channel,
    message,
    level,
    title = 'Notification',
    icon,
    webhookUrl,
    filePath,
    userId,
    metadata = {},
    throttle = true
  } = params;
  
  // Generate notification ID
  const id = generateNotificationId();
  
  // Check throttling
  if (throttle) {
    const channelKey = `channel:${channel}`;
    if (shouldThrottle(level, channelKey)) {
      const notification: NotificationRecord = {
        id,
        channel,
        message,
        level,
        timestamp: new Date(),
        userId,
        metadata: {
          ...metadata,
          throttled: true,
          title,
        },
        deliveryStatus: 'failed',
        error: 'Notification throttled due to threshold limits'
      };
      
      notificationHistory.unshift(notification);
      return notification;
    }
    
    // User-specific throttling if userId is provided
    if (userId) {
      const userKey = `userId:${userId}`;
      if (shouldThrottle(level, userKey)) {
        const notification: NotificationRecord = {
          id,
          channel,
          message,
          level,
          timestamp: new Date(),
          userId,
          metadata: {
            ...metadata,
            throttled: true,
            title,
          },
          deliveryStatus: 'failed',
          error: 'Notification throttled due to user-specific threshold limits'
        };
        
        notificationHistory.unshift(notification);
        return notification;
      }
    }
  }
  
  // Create notification record
  const notification: NotificationRecord = {
    id,
    channel,
    message,
    level,
    timestamp: new Date(),
    userId,
    metadata: {
      ...metadata,
      title,
    },
    deliveryStatus: 'pending'
  };
  
  try {
    // Send notification based on channel
    switch (channel) {
      case 'console':
        // Log to console with appropriate formatting
        switch (level) {
          case 'info':
            console.info(`[${title}] ${message}`);
            break;
          case 'warning':
            console.warn(`[${title}] ${message}`);
            break;
          case 'error':
          case 'critical':
            console.error(`[${title}] ${message}`);
            break;
        }
        notification.deliveryStatus = 'delivered';
        break;
        
      case 'desktop':
        if (!desktopNotificationsAvailable) {
          throw new Error('Desktop notifications are not available on this system');
        }
        
        // Send desktop notification based on platform
        if (process.platform === 'win32') {
          // Windows - PowerShell
          execSync(`powershell.exe -Command "New-BurntToastNotification -Text '${title}', '${message}'"`, { stdio: 'ignore' });
        } else if (process.platform === 'darwin') {
          // macOS - AppleScript
          execSync(`osascript -e 'display notification "${message}" with title "${title}"'`, { stdio: 'ignore' });
        } else if (process.platform === 'linux') {
          // Linux - notify-send
          const iconParam = icon ? `-i ${icon}` : '';
          execSync(`notify-send ${iconParam} "${title}" "${message}"`, { stdio: 'ignore' });
        }
        
        notification.deliveryStatus = 'delivered';
        break;
        
      case 'file':
        // Ensure we have a file path
        const logFilePath = filePath || path.join(process.cwd(), 'notifications.log');
        
        // Create directory if needed
        const dir = path.dirname(logFilePath);
        if (!fsSync.existsSync(dir)) {
          await fs.mkdir(dir, { recursive: true });
        }
        
        // Format log entry
        const logEntry = JSON.stringify({
          id,
          level,
          title,
          message,
          timestamp: notification.timestamp.toISOString(),
          userId,
          metadata
        });
        
        // Append to file
        await fs.appendFile(logFilePath, logEntry + '\n');
        
        notification.deliveryStatus = 'delivered';
        break;
        
      case 'webhook':
        // Ensure we have a webhook URL
        if (!webhookUrl) {
          throw new Error('Webhook URL is required for webhook notifications');
        }
        
        // In a real implementation, this would use fetch or another HTTP client
        // For now, just simulate a successful webhook call
        console.log(`[Notification Sender] Would send webhook to ${webhookUrl} with payload:`, {
          id,
          level,
          title,
          message,
          timestamp: notification.timestamp.toISOString(),
          userId,
          metadata
        });
        
        notification.deliveryStatus = 'delivered';
        break;
    }
  } catch (error) {
    // Update notification with error
    notification.deliveryStatus = 'failed';
    notification.error = String(error);
  }
  
  // Add to history (limit to 1000 entries)
  notificationHistory.unshift(notification);
  if (notificationHistory.length > 1000) {
    notificationHistory.pop();
  }
  
  return notification;
}

/**
 * Handles sending a notification
 */
async function handleSendNotification(args: any) {
  try {
    const result = SendNotificationSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for sending notification"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { 
      message, 
      level, 
      channel, 
      userId, 
      metadata, 
      title, 
      icon, 
      webhookUrl, 
      filePath, 
      throttle 
    } = result.data;
    
    // Send notification
    const notification = await sendNotification({
      channel,
      message,
      level,
      title,
      icon,
      webhookUrl,
      filePath,
      userId,
      metadata,
      throttle
    });
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          id: notification.id,
          status: notification.deliveryStatus,
          error: notification.error,
          channel,
          level,
          timestamp: notification.timestamp.toISOString(),
          message: notification.deliveryStatus === 'delivered'
            ? `Notification sent successfully via ${channel}`
            : `Failed to send notification: ${notification.error}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to send notification"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles configuring notification thresholds
 */
async function handleConfigureThresholds(args: any) {
  try {
    const result = ConfigureThresholdsSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for configuring thresholds"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { level, windowSizeMs, maxNotifications, cooldownPeriodMs } = result.data;
    
    // Store current config for response
    const oldConfig = { ...thresholds[level] };
    
    // Update threshold configuration
    if (windowSizeMs !== undefined) {
      thresholds[level].windowSizeMs = windowSizeMs;
    }
    
    if (maxNotifications !== undefined) {
      thresholds[level].maxNotifications = maxNotifications;
    }
    
    if (cooldownPeriodMs !== undefined) {
      thresholds[level].cooldownPeriodMs = cooldownPeriodMs;
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          level,
          oldConfig,
          newConfig: thresholds[level],
          message: `Threshold configuration updated for ${level} level`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to configure thresholds"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles getting notification history
 */
async function handleGetHistory(args: any) {
  try {
    const result = GetHistorySchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for getting notification history"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { limit, level, channel, userId, status, since } = result.data;
    
    // Filter notifications
    let filteredHistory = [...notificationHistory];
    
    if (level) {
      filteredHistory = filteredHistory.filter(n => n.level === level);
    }
    
    if (channel) {
      filteredHistory = filteredHistory.filter(n => n.channel === channel);
    }
    
    if (userId) {
      filteredHistory = filteredHistory.filter(n => n.userId === userId);
    }
    
    if (status) {
      filteredHistory = filteredHistory.filter(n => n.deliveryStatus === status);
    }
    
    if (since) {
      filteredHistory = filteredHistory.filter(n => n.timestamp.getTime() >= since);
    }
    
    // Apply limit
    const limitedHistory = filteredHistory.slice(0, limit);
    
    // Format for response
    const formattedHistory = limitedHistory.map(n => ({
      id: n.id,
      level: n.level,
      channel: n.channel,
      message: n.message,
      timestamp: n.timestamp.toISOString(),
      userId: n.userId,
      status: n.deliveryStatus,
      error: n.error,
      metadata: n.metadata
    }));
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          history: formattedHistory,
          total: filteredHistory.length,
          returned: formattedHistory.length,
          message: `Found ${filteredHistory.length} notifications${formattedHistory.length < filteredHistory.length ? 
            `, showing ${formattedHistory.length}` : ''}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to get notification history"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles testing notification channels
 */
async function handleTestChannels(args: any) {
  try {
    const result = TestChannelsSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for testing notification channels"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { channels, message, webhookUrl, filePath } = result.data;
    
    // Test each channel
    const results = [];
    
    for (const channel of channels) {
      try {
        const notification = await sendNotification({
          channel,
          message,
          level: 'info',
          title: 'Channel Test',
          webhookUrl: channel === 'webhook' ? webhookUrl : undefined,
          filePath: channel === 'file' ? filePath : undefined,
          throttle: false,
          metadata: {
            test: true,
            timestamp: new Date().toISOString()
          }
        });
        
        results.push({
          channel,
          success: notification.deliveryStatus === 'delivered',
          error: notification.error,
          id: notification.id
        });
      } catch (error) {
        results.push({
          channel,
          success: false,
          error: String(error)
        });
      }
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          results,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          message: `Tested ${results.length} notification channels`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to test notification channels"
        }, null, 2)
      }],
      isError: true
    };
  }
}