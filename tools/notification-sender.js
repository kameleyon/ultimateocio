"use strict";
// Auto-generated boilerplate for notification-sender
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
exports.TestChannelsSchema = exports.GetHistorySchema = exports.ConfigureThresholdsSchema = exports.SendNotificationSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const fsSync = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const child_process_1 = require("child_process");
// In-memory storage for notification history
let notificationHistory = [];
// Default threshold configuration
const thresholds = {
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
const cooldowns = {};
// Check if desktop notifications are available
let desktopNotificationsAvailable = false;
try {
    // Try to check for a notification command
    if (process.platform === 'win32') {
        // On Windows, check if PowerShell is available
        (0, child_process_1.execSync)('powershell.exe -Command "Get-Command New-BurntToastNotification -ErrorAction SilentlyContinue"', { stdio: 'ignore' });
        desktopNotificationsAvailable = true;
    }
    else if (process.platform === 'darwin') {
        // On macOS, check if osascript is available
        (0, child_process_1.execSync)('which osascript', { stdio: 'ignore' });
        desktopNotificationsAvailable = true;
    }
    else if (process.platform === 'linux') {
        // On Linux, check if notify-send is available
        (0, child_process_1.execSync)('which notify-send', { stdio: 'ignore' });
        desktopNotificationsAvailable = true;
    }
}
catch (e) {
    desktopNotificationsAvailable = false;
}
function activate() {
    console.log("[TOOL] notification-sender activated");
    console.log(`[Notification Sender] Desktop notifications ${desktopNotificationsAvailable ? 'available' : 'not available'}`);
}
/**
 * Handles file write events to detect issues that might need notifications
 */
function onFileWrite(event) {
    // Check for potential errors in files that might trigger notifications
    if (event.path.endsWith('.log') && (event.content.includes('ERROR') ||
        event.content.includes('FATAL') ||
        event.content.includes('CRITICAL'))) {
        // Extract error message
        const lines = event.content.split('\n');
        const errorLine = lines.find(line => line.includes('ERROR') ||
            line.includes('FATAL') ||
            line.includes('CRITICAL'));
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
function onSessionStart(session) {
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
function onCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (command.name) {
            case 'notification-sender:send':
                console.log('[Notification Sender] Sending notification...');
                return yield handleSendNotification(command.args[0]);
            case 'notification-sender:configure':
                console.log('[Notification Sender] Configuring thresholds...');
                return yield handleConfigureThresholds(command.args[0]);
            case 'notification-sender:history':
                console.log('[Notification Sender] Getting notification history...');
                return yield handleGetHistory(command.args[0]);
            case 'notification-sender:test':
                console.log('[Notification Sender] Testing notification channels...');
                return yield handleTestChannels(command.args[0]);
            default:
                console.warn(`[Notification Sender] Unknown command: ${command.name}`);
                return { error: `Unknown command: ${command.name}` };
        }
    });
}
// Define schemas for Notification Sender tool
exports.SendNotificationSchema = zod_1.z.object({
    message: zod_1.z.string(),
    level: zod_1.z.enum(['info', 'warning', 'error', 'critical']).default('info'),
    channel: zod_1.z.enum(['console', 'desktop', 'file', 'webhook']).default('console'),
    userId: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    title: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
    webhookUrl: zod_1.z.string().optional(),
    filePath: zod_1.z.string().optional(),
    throttle: zod_1.z.boolean().optional().default(true),
});
exports.ConfigureThresholdsSchema = zod_1.z.object({
    level: zod_1.z.enum(['info', 'warning', 'error', 'critical']),
    windowSizeMs: zod_1.z.number().optional(),
    maxNotifications: zod_1.z.number().optional(),
    cooldownPeriodMs: zod_1.z.number().optional(),
});
exports.GetHistorySchema = zod_1.z.object({
    limit: zod_1.z.number().optional().default(10),
    level: zod_1.z.enum(['info', 'warning', 'error', 'critical']).optional(),
    channel: zod_1.z.enum(['console', 'desktop', 'file', 'webhook']).optional(),
    userId: zod_1.z.string().optional(),
    status: zod_1.z.enum(['pending', 'delivered', 'failed']).optional(),
    since: zod_1.z.number().optional(), // timestamp
});
exports.TestChannelsSchema = zod_1.z.object({
    channels: zod_1.z.array(zod_1.z.enum(['console', 'desktop', 'file', 'webhook'])).default(['console']),
    message: zod_1.z.string().optional().default('Test notification'),
    webhookUrl: zod_1.z.string().optional(),
    filePath: zod_1.z.string().optional(),
});
/**
 * Generate a unique ID for a notification
 */
function generateNotificationId() {
    return crypto.randomBytes(8).toString('hex');
}
/**
 * Check if notification should be throttled based on thresholds
 */
function shouldThrottle(level, channelKey) {
    const now = Date.now();
    const threshold = thresholds[level];
    // Check cooldown period first
    if (cooldowns[channelKey] && (now - cooldowns[channelKey] < threshold.cooldownPeriodMs)) {
        return true;
    }
    // Count recent notifications
    const windowStart = now - threshold.windowSizeMs;
    const recentNotifications = notificationHistory.filter(n => n.timestamp.getTime() > windowStart &&
        getAlertLevelPriority(n.level) >= getAlertLevelPriority(threshold.minLevel) &&
        (channelKey.includes('channel') ? n.channel === channelKey.split(':')[1] : true) &&
        (channelKey.includes('userId') ? n.userId === channelKey.split(':')[1] : true));
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
function getAlertLevelPriority(level) {
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
function sendNotification(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { channel, message, level, title = 'Notification', icon, webhookUrl, filePath, userId, metadata = {}, throttle = true } = params;
        // Generate notification ID
        const id = generateNotificationId();
        // Check throttling
        if (throttle) {
            const channelKey = `channel:${channel}`;
            if (shouldThrottle(level, channelKey)) {
                const notification = {
                    id,
                    channel,
                    message,
                    level,
                    timestamp: new Date(),
                    userId,
                    metadata: Object.assign(Object.assign({}, metadata), { throttled: true, title }),
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
                    const notification = {
                        id,
                        channel,
                        message,
                        level,
                        timestamp: new Date(),
                        userId,
                        metadata: Object.assign(Object.assign({}, metadata), { throttled: true, title }),
                        deliveryStatus: 'failed',
                        error: 'Notification throttled due to user-specific threshold limits'
                    };
                    notificationHistory.unshift(notification);
                    return notification;
                }
            }
        }
        // Create notification record
        const notification = {
            id,
            channel,
            message,
            level,
            timestamp: new Date(),
            userId,
            metadata: Object.assign(Object.assign({}, metadata), { title }),
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
                        (0, child_process_1.execSync)(`powershell.exe -Command "New-BurntToastNotification -Text '${title}', '${message}'"`, { stdio: 'ignore' });
                    }
                    else if (process.platform === 'darwin') {
                        // macOS - AppleScript
                        (0, child_process_1.execSync)(`osascript -e 'display notification "${message}" with title "${title}"'`, { stdio: 'ignore' });
                    }
                    else if (process.platform === 'linux') {
                        // Linux - notify-send
                        const iconParam = icon ? `-i ${icon}` : '';
                        (0, child_process_1.execSync)(`notify-send ${iconParam} "${title}" "${message}"`, { stdio: 'ignore' });
                    }
                    notification.deliveryStatus = 'delivered';
                    break;
                case 'file':
                    // Ensure we have a file path
                    const logFilePath = filePath || path.join(process.cwd(), 'notifications.log');
                    // Create directory if needed
                    const dir = path.dirname(logFilePath);
                    if (!fsSync.existsSync(dir)) {
                        yield fs.mkdir(dir, { recursive: true });
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
                    yield fs.appendFile(logFilePath, logEntry + '\n');
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
        }
        catch (error) {
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
    });
}
/**
 * Handles sending a notification
 */
function handleSendNotification(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.SendNotificationSchema.safeParse(args);
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
            const { message, level, channel, userId, metadata, title, icon, webhookUrl, filePath, throttle } = result.data;
            // Send notification
            const notification = yield sendNotification({
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
        }
        catch (error) {
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
    });
}
/**
 * Handles configuring notification thresholds
 */
function handleConfigureThresholds(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.ConfigureThresholdsSchema.safeParse(args);
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
            const oldConfig = Object.assign({}, thresholds[level]);
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
        }
        catch (error) {
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
    });
}
/**
 * Handles getting notification history
 */
function handleGetHistory(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.GetHistorySchema.safeParse(args);
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
        }
        catch (error) {
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
    });
}
/**
 * Handles testing notification channels
 */
function handleTestChannels(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.TestChannelsSchema.safeParse(args);
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
                    const notification = yield sendNotification({
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
                }
                catch (error) {
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
        }
        catch (error) {
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
    });
}
