// Auto-generated boilerplate for error-logger

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

// Default log directory
const LOG_DIR = path.join(process.cwd(), 'logs');
const DEFAULT_LOG_FILE = path.join(LOG_DIR, 'error.log');
const DEFAULT_MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB

// Log level enum
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

// Log settings
let settings = {
  logDir: LOG_DIR,
  logFile: DEFAULT_LOG_FILE,
  maxLogSize: DEFAULT_MAX_LOG_SIZE,
  console: true,
  level: LogLevel.INFO,
  format: 'json'
};

export function activate() {
  console.log("[TOOL] error-logger activated");
  
  // Create log directory if it doesn't exist
  ensureLogDir();
}

/**
 * Handles file write events to detect errors and log them
 */
export function onFileWrite(event: { path: string; content: string }) {
  // Check if the file appears to contain errors (exceptions, stack traces, etc.)
  if (event.content.includes('Error:') || 
      event.content.includes('Exception:') ||
      event.content.includes('stack trace') || 
      event.content.includes('Uncaught')) {
    
    console.log(`[Error Logger] Detected potential error in file: ${event.path}`);
    
    // Extract error information
    const errorMatch = event.content.match(/Error:([^\n]+)/);
    const errorMessage = errorMatch ? errorMatch[1].trim() : 'Unknown error';
    
    // Log it
    log({
      level: LogLevel.ERROR,
      message: `Error detected in file ${event.path}: ${errorMessage}`,
      source: 'file-watcher',
      file: event.path
    });
  }
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Error Logger] Session started: ${session.id}`);
  
  // Log session start
  log({
    level: LogLevel.INFO,
    message: `Session started: ${session.id}`,
    source: 'session-manager',
    sessionId: session.id
  });
}

/**
 * Handles error-logger commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'error-logger:log':
      return await handleLog(command.args[0]);
    case 'error-logger:configure':
      return await handleConfigure(command.args[0]);
    case 'error-logger:query':
      return await handleQuery(command.args[0]);
    case 'error-logger:rotate':
      return await handleRotate(command.args[0]);
    default:
      console.warn(`[Error Logger] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Error Logger tool
export const LogSchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  message: z.string(),
  error: z.any().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  details: z.record(z.any()).optional(),
  timestamp: z.number().optional(),
  file: z.string().optional(),
  sessionId: z.string().optional(),
});

export const ConfigureSchema = z.object({
  logDir: z.string().optional(),
  logFile: z.string().optional(),
  maxLogSize: z.number().optional(),
  console: z.boolean().optional(),
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']).optional(),
  format: z.enum(['json', 'text', 'csv']).optional(),
});

export const QuerySchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']).optional(),
  source: z.string().optional(),
  tag: z.string().optional(),
  from: z.number().optional(),
  to: z.number().optional(),
  limit: z.number().optional().default(100),
  search: z.string().optional(),
});

export const RotateSchema = z.object({
  maxFiles: z.number().optional().default(5),
  compress: z.boolean().optional().default(true),
});

/**
 * Ensures the log directory exists
 */
async function ensureLogDir() {
  try {
    await fs.mkdir(settings.logDir, { recursive: true });
  } catch (error) {
    console.error(`[Error Logger] Failed to create log directory: ${error}`);
  }
}

/**
 * Logs a message to the log file
 */
export async function log(entry: z.infer<typeof LogSchema>) {
  // Add timestamp if not provided
  const timestamp = entry.timestamp || Date.now();
  
  // Format the log entry
  const formattedEntry = {
    ...entry,
    timestamp,
    datetime: new Date(timestamp).toISOString(),
    hostname: os.hostname(),
    pid: process.pid
  };
  
  // Skip logging if level is below the configured level
  const levels = ['debug', 'info', 'warn', 'error', 'fatal'];
  if (levels.indexOf(entry.level) < levels.indexOf(settings.level)) {
    return;
  }
  
  // Format the log message
  let message: string;
  if (settings.format === 'json') {
    message = JSON.stringify(formattedEntry) + '\n';
  } else if (settings.format === 'csv') {
    // Simple CSV format for basic fields
    message = `${formattedEntry.datetime},${formattedEntry.level},${formattedEntry.message},${formattedEntry.source || ''}\n`;
  } else {
    // Text format
    message = `[${formattedEntry.datetime}] [${formattedEntry.level.toUpperCase()}] ${formattedEntry.message}\n`;
  }
  
  // Log to console if enabled
  if (settings.console) {
    // Use appropriate console method based on level
    switch (entry.level) {
      case 'debug':
        console.debug(message);
        break;
      case 'info':
        console.info(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'error':
      case 'fatal':
        console.error(message);
        break;
    }
  }
  
  try {
    // Check if log file needs rotation
    await rotateIfNeeded();
    
    // Append to log file
    await fs.appendFile(settings.logFile, message);
  } catch (error) {
    console.error(`[Error Logger] Failed to write to log file: ${error}`);
  }
}

/**
 * Rotates log file if it exceeds size limit
 */
async function rotateIfNeeded() {
  try {
    // Check if log file exists
    try {
      await fs.access(settings.logFile);
    } catch {
      // File doesn't exist, no need to rotate
      return;
    }
    
    // Check file size
    const stats = await fs.stat(settings.logFile);
    
    if (stats.size >= settings.maxLogSize) {
      // Get timestamp for new filename
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const rotatedFile = `${settings.logFile}.${timestamp}`;
      
      // Rename current log file
      await fs.rename(settings.logFile, rotatedFile);
      
      // Create new empty log file
      await fs.writeFile(settings.logFile, '');
      
      console.log(`[Error Logger] Log file rotated to ${rotatedFile}`);
    }
  } catch (error) {
    console.error(`[Error Logger] Failed to rotate log file: ${error}`);
  }
}

/**
 * Handles log command
 */
async function handleLog(args: any) {
  try {
    const result = LogSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for logging"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Log the entry
    await log(result.data);
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          level: result.data.level,
          message: result.data.message,
          timestamp: new Date(result.data.timestamp || Date.now()).toISOString(),
          logFile: settings.logFile,
          success: true
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to log error"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles configure command
 */
async function handleConfigure(args: any) {
  try {
    const result = ConfigureSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for configuring logger"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Update settings
    const oldSettings = { ...settings };
    
    if (result.data.logDir) {
      settings.logDir = result.data.logDir;
      settings.logFile = path.join(settings.logDir, path.basename(settings.logFile));
      await ensureLogDir();
    }
    
    if (result.data.logFile) {
      settings.logFile = path.resolve(settings.logDir, path.basename(result.data.logFile));
    }
    
    if (result.data.maxLogSize !== undefined) {
      settings.maxLogSize = result.data.maxLogSize;
    }
    
    if (result.data.console !== undefined) {
      settings.console = result.data.console;
    }
    
    if (result.data.level) {
      settings.level = result.data.level as LogLevel;
    }
    
    if (result.data.format) {
      settings.format = result.data.format;
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          oldSettings,
          newSettings: settings,
          message: "Logger configuration updated"
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to configure logger"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles query command
 */
async function handleQuery(args: any) {
  try {
    const result = QuerySchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for querying logs"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { level, source, tag, from, to, limit, search } = result.data;
    
    // Check if log file exists
    try {
      await fs.access(settings.logFile);
    } catch {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            logs: [],
            count: 0,
            message: "No logs found"
          }, null, 2)
        }]
      };
    }
    
    // Read log file
    const content = await fs.readFile(settings.logFile, 'utf8');
    const lines = content.split('\n').filter(line => !!line.trim());
    
    // Parse and filter logs
    const logs = lines.map(line => {
      try {
        return settings.format === 'json' ? JSON.parse(line) : parseTextLog(line);
      } catch {
        return null;
      }
    }).filter(log => !!log);
    
    // Apply filters
    const filtered = logs.filter(log => {
      if (level && log.level !== level) return false;
      if (source && log.source !== source) return false;
      if (tag && (!log.tags || !log.tags.includes(tag))) return false;
      if (from && log.timestamp < from) return false;
      if (to && log.timestamp > to) return false;
      if (search && !JSON.stringify(log).toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    
    // Apply limit
    const limitedLogs = filtered.slice(-limit);
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          logs: limitedLogs,
          count: limitedLogs.length,
          totalMatched: filtered.length,
          totalLogs: logs.length,
          message: `Found ${limitedLogs.length} matching logs`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to query logs"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Parses text format logs (best effort)
 */
function parseTextLog(line: string): any {
  // Simple regex to extract common text log format [datetime] [level] message
  const match = line.match(/\[([^\]]+)\]\s*\[([^\]]+)\]\s*(.*)/);
  if (match) {
    return {
      datetime: match[1],
      level: match[2].toLowerCase(),
      message: match[3],
      timestamp: new Date(match[1]).getTime()
    };
  }
  return { raw: line };
}

/**
 * Handles rotate command
 */
async function handleRotate(args: any) {
  try {
    const result = RotateSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for rotating logs"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { maxFiles, compress } = result.data;
    
    // Force rotation of current log
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const rotatedFile = `${settings.logFile}.${timestamp}`;
    
    // Check if log file exists
    try {
      await fs.access(settings.logFile);
      
      // Rename current log file
      await fs.rename(settings.logFile, rotatedFile);
      
      // Create new empty log file
      await fs.writeFile(settings.logFile, '');
    } catch (error) {
      // Log file doesn't exist
      console.warn(`[Error Logger] No log file to rotate: ${error}`);
    }
    
    // Cleanup old log files if maxFiles is set
    try {
      const logDir = path.dirname(settings.logFile);
      const baseFile = path.basename(settings.logFile);
      
      // List log files
      const files = await fs.readdir(logDir);
      
      // Filter and sort rotated log files
      const logFiles = files
        .filter(file => file.startsWith(baseFile + '.'))
        .sort()
        .reverse(); // Newest first
      
      // Remove old files
      if (logFiles.length > maxFiles) {
        const filesToRemove = logFiles.slice(maxFiles);
        
        for (const file of filesToRemove) {
          const filePath = path.join(logDir, file);
          await fs.unlink(filePath);
          console.log(`[Error Logger] Removed old log file: ${filePath}`);
        }
      }
    } catch (error) {
      console.error(`[Error Logger] Failed to cleanup old log files: ${error}`);
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          rotatedFile,
          newLogFile: settings.logFile,
          maxFiles,
          compress,
          message: "Log file rotated successfully"
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to rotate log file"
        }, null, 2)
      }],
      isError: true
    };
  }
}