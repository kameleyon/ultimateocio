// Auto-generated boilerplate for log-viewer

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { createReadStream } from 'fs';
import { execSync } from 'child_process';

// Configuration for log viewer
const config = {
  defaultLogPaths: [
    'logs',
    'log',
    '.logs',
    'var/log',
    'tmp/logs',
    'data/logs',
  ],
  maxLogSize: 10 * 1024 * 1024, // 10MB
  defaultLineLimit: 1000,
};

// Log cache for recently viewed logs
interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  source?: string;
  [key: string]: any;
}

interface CachedLog {
  path: string;
  lastRead: Date;
  entries: LogEntry[];
}

const logCache = new Map<string, CachedLog>();

export function activate() {
  console.log("[TOOL] log-viewer activated");
}

/**
 * Handles file write events to detect log updates
 */
export function onFileWrite(event: { path: string; content: string }) {
  // Check if it's a log file
  if (event.path.endsWith('.log') || path.basename(event.path).includes('log')) {
    console.log(`[Log Viewer] Log file updated: ${event.path}`);
    
    // Clear cache for this file to force re-read on next access
    logCache.delete(event.path);
  }
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Log Viewer] Session started: ${session.id}`);
  
  // Create session log
  const sessionLog: LogEntry = {
    timestamp: new Date(session.startTime).toISOString(),
    level: 'INFO',
    message: `Session ${session.id} started`,
    sessionId: session.id
  };
  
  // Could log this to a file or add to in-memory logs
}

/**
 * Handles log-viewer commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'log-viewer:view':
      console.log('[Log Viewer] Viewing log file...');
      return await handleViewLog(command.args[0]);
    case 'log-viewer:list':
      console.log('[Log Viewer] Listing available logs...');
      return await handleListLogs(command.args[0]);
    case 'log-viewer:search':
      console.log('[Log Viewer] Searching logs...');
      return await handleSearchLogs(command.args[0]);
    case 'log-viewer:tail':
      console.log('[Log Viewer] Tailing log file...');
      return await handleTailLog(command.args[0]);
    default:
      console.warn(`[Log Viewer] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Log Viewer tool
export const ViewLogSchema = z.object({
  path: z.string(),
  lines: z.number().optional().default(100),
  startLine: z.number().optional(),
  endLine: z.number().optional(),
  parseJson: z.boolean().optional().default(true),
  filterLevel: z.string().optional(),
  filterText: z.string().optional(),
});

export const ListLogsSchema = z.object({
  directory: z.string().optional(),
  recursive: z.boolean().optional().default(false),
  includeMetadata: z.boolean().optional().default(true),
  sortBy: z.enum(['name', 'size', 'modified']).optional().default('modified'),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const SearchLogsSchema = z.object({
  paths: z.array(z.string()).or(z.string()),
  query: z.string(),
  caseSensitive: z.boolean().optional().default(false),
  limit: z.number().optional().default(100),
  includeContext: z.boolean().optional().default(false),
  contextLines: z.number().optional().default(2),
});

export const TailLogSchema = z.object({
  path: z.string(),
  lines: z.number().optional().default(10),
  parseJson: z.boolean().optional().default(true),
});

/**
 * Try to parse a log line as JSON
 */
function tryParseLogJson(line: string): LogEntry | null {
  try {
    const parsed = JSON.parse(line);
    
    // Check if it has common log fields
    if (parsed && typeof parsed === 'object') {
      // Standardize timestamp field
      if (parsed.timestamp || parsed.time || parsed.date) {
        parsed.timestamp = parsed.timestamp || parsed.time || parsed.date;
      }
      
      // Standardize level field
      if (parsed.level || parsed.severity || parsed.type) {
        parsed.level = parsed.level || parsed.severity || parsed.type;
      }
      
      // Standardize message field
      if (parsed.message || parsed.msg || parsed.text) {
        parsed.message = parsed.message || parsed.msg || parsed.text;
      }
      
      return parsed as LogEntry;
    }
  } catch (e) {
    // Not JSON, that's okay
  }
  
  return null;
}

/**
 * Try to parse a plain text log line
 */
function tryParseLogText(line: string): LogEntry | null {
  // Common log formats:
  
  // ISO timestamp with level: 2023-04-15T14:30:25Z [INFO] Message here
  const isoPattern = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))\s+\[([^\]]+)\]\s+(.+)$/;
  
  // Standard date with level: [2023-04-15 14:30:25] [INFO] Message here
  const standardDatePattern = /^\[?(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\]?\s+\[([^\]]+)\]\s+(.+)$/;
  
  // Level prefix: INFO: Message here
  const levelPrefixPattern = /^([A-Z]+):\s+(.+)$/;
  
  let match;
  
  if ((match = line.match(isoPattern))) {
    return {
      timestamp: match[1],
      level: match[2],
      message: match[3]
    };
  } else if ((match = line.match(standardDatePattern))) {
    return {
      timestamp: match[1],
      level: match[2],
      message: match[3]
    };
  } else if ((match = line.match(levelPrefixPattern))) {
    return {
      timestamp: new Date().toISOString(), // No timestamp in log, use current
      level: match[1],
      message: match[2]
    };
  }
  
  // If no patterns match but line is not empty, treat as plain message
  if (line.trim()) {
    return {
      timestamp: new Date().toISOString(),
      level: "INFO",
      message: line.trim()
    };
  }
  
  return null;
}

/**
 * Reads lines from a file with various options
 */
async function readLogFile(
  logPath: string, 
  options: {
    lines?: number;
    startLine?: number;
    endLine?: number;
    filterLevel?: string;
    filterText?: string;
    parseFormat?: boolean; 
  } = {}
): Promise<{
  entries: LogEntry[];
  fileSize: number;
  lineCount: number;
  filteredOut: number;
}> {
  // Check if file exists
  try {
    await fs.access(logPath);
  } catch (error) {
    throw new Error(`Log file not found: ${logPath}`);
  }
  
  // Get file stats
  const stats = await fs.stat(logPath);
  
  if (stats.size > config.maxLogSize) {
    console.warn(`[Log Viewer] Log file is large (${stats.size} bytes), reading may be slow`);
  }
  
  const entries: LogEntry[] = [];
  let lineCount = 0;
  let filteredOut = 0;
  
  // Create readline interface
  const fileStream = createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  // Process each line
  for await (const line of rl) {
    lineCount++;
    
    // Skip lines before startLine if specified
    if (options.startLine !== undefined && lineCount < options.startLine) {
      continue;
    }
    
    // Stop after endLine if specified
    if (options.endLine !== undefined && lineCount > options.endLine) {
      break;
    }
    
    // Parse line
    let entry: LogEntry | null = null;
    
    if (options.parseFormat !== false) {
      // Try to parse as JSON first
      entry = tryParseLogJson(line);
      
      // If not JSON, try other formats
      if (!entry) {
        entry = tryParseLogText(line);
      }
    }
    
    // If parsing failed or was disabled, treat as plain text
    if (!entry && line.trim()) {
      entry = {
        timestamp: new Date().toISOString(),
        level: "INFO",
        message: line.trim()
      };
    }
    
    if (entry) {
      // Apply filters if specified
      if (options.filterLevel && entry.level && 
          !entry.level.toLowerCase().includes(options.filterLevel.toLowerCase())) {
        filteredOut++;
        continue;
      }
      
      if (options.filterText && 
          !JSON.stringify(entry).toLowerCase().includes(options.filterText.toLowerCase())) {
        filteredOut++;
        continue;
      }
      
      entries.push(entry);
      
      // Stop after collecting enough entries if limit is specified
      if (options.lines !== undefined && entries.length >= options.lines) {
        break;
      }
    }
  }
  
  return {
    entries,
    fileSize: stats.size,
    lineCount,
    filteredOut
  };
}

/**
 * Finds log files in a directory
 */
async function findLogFiles(
  directory: string, 
  recursive: boolean = false
): Promise<{
  path: string;
  name: string;
  size: number;
  modified: Date;
  type: 'file' | 'directory';
}[]> {
  const result: {
    path: string;
    name: string;
    size: number;
    modified: Date;
    type: 'file' | 'directory';
  }[] = [];
  
  try {
    // Check if directory exists
    await fs.access(directory);
    
    // Get directory contents
    const entries = await fs.readdir(directory, { withFileTypes: true });
    
    // Process each entry
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      
      if (entry.isDirectory() && recursive) {
        // Recursively search subdirectory
        const subEntries = await findLogFiles(entryPath, recursive);
        result.push(...subEntries);
      } else if (entry.isFile()) {
        // Check if it's a log file (by extension or name)
        if (entryPath.endsWith('.log') || 
            entry.name.includes('log') ||
            entry.name.includes('logs')) {
          
          const stats = await fs.stat(entryPath);
          
          result.push({
            path: entryPath,
            name: entry.name,
            size: stats.size,
            modified: new Date(stats.mtime),
            type: 'file'
          });
        }
      }
    }
  } catch (error) {
    console.error(`[Log Viewer] Error reading directory ${directory}:`, error);
  }
  
  return result;
}

/**
 * Handles viewing a log file
 */
async function handleViewLog(args: any) {
  try {
    const result = ViewLogSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for viewing log"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { 
      path: logPath, 
      lines, 
      startLine, 
      endLine, 
      parseJson, 
      filterLevel,
      filterText
    } = result.data;
    
    // Read log file
    const { entries, fileSize, lineCount, filteredOut } = await readLogFile(logPath, {
      lines,
      startLine,
      endLine,
      filterLevel,
      filterText,
      parseFormat: parseJson
    });
    
    // Update cache
    logCache.set(logPath, {
      path: logPath,
      lastRead: new Date(),
      entries
    });
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          path: logPath,
          fileSize,
          totalLines: lineCount,
          entriesReturned: entries.length,
          entriesFiltered: filteredOut,
          entries,
          message: `Retrieved ${entries.length} log entries from ${path.basename(logPath)}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to view log file"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles listing available log files
 */
async function handleListLogs(args: any) {
  try {
    const result = ListLogsSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for listing logs"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { directory, recursive, includeMetadata, sortBy, sortDirection } = result.data;
    
    // Find log files
    let logFiles: {
      path: string;
      name: string;
      size: number;
      modified: Date;
      type: 'file' | 'directory';
    }[] = [];
    
    if (directory) {
      // Look in the specified directory
      logFiles = await findLogFiles(directory, recursive);
    } else {
      // Look in default locations
      for (const defaultPath of config.defaultLogPaths) {
        const searchPath = path.join(process.cwd(), defaultPath);
        
        try {
          await fs.access(searchPath);
          const files = await findLogFiles(searchPath, recursive);
          logFiles = [...logFiles, ...files];
        } catch (error) {
          // Path doesn't exist, that's fine
        }
      }
      
      // Also check directly in the current directory
      const moreFiles = await findLogFiles(process.cwd(), false);
      logFiles = [...logFiles, ...moreFiles];
    }
    
    // Sort log files
    logFiles.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'modified':
        default:
          comparison = a.modified.getTime() - b.modified.getTime();
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    // Format result
    const formattedLogs = logFiles.map(file => {
      const result: any = {
        path: file.path,
        name: file.name
      };
      
      if (includeMetadata) {
        result.size = file.size;
        result.sizeFormatted = formatBytes(file.size);
        result.modified = file.modified.toISOString();
        result.type = file.type;
      }
      
      return result;
    });
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          logs: formattedLogs,
          count: formattedLogs.length,
          sortedBy: sortBy,
          sortDirection,
          message: `Found ${formattedLogs.length} log files`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to list log files"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Formats bytes to a human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Handles searching log files
 */
async function handleSearchLogs(args: any) {
  try {
    const result = SearchLogsSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for searching logs"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { 
      paths, 
      query, 
      caseSensitive, 
      limit, 
      includeContext, 
      contextLines 
    } = result.data;
    
    // Convert single path to array
    const logPaths = Array.isArray(paths) ? paths : [paths];
    
    // Prepare search results
    type SearchMatch = {
      path: string;
      line: number;
      entry: LogEntry;
      context?: LogEntry[];
    };
    
    const matches: SearchMatch[] = [];
    let filesSearched = 0;
    let totalLinesSearched = 0;
    
    // Process each log file
    for (const logPath of logPaths) {
      try {
        // Read the entire file to provide context if needed
        const { entries, lineCount } = await readLogFile(logPath, {
          parseFormat: true
        });
        
        filesSearched++;
        totalLinesSearched += lineCount;
        
        // Search each entry
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          const entryJson = JSON.stringify(entry).toLowerCase();
          const searchQuery = caseSensitive ? query : query.toLowerCase();
          
          if ((caseSensitive && JSON.stringify(entry).includes(searchQuery)) ||
              (!caseSensitive && entryJson.includes(searchQuery))) {
            
            const match: SearchMatch = {
              path: logPath,
              line: i + 1,
              entry
            };
            
            // Add context lines if requested
            if (includeContext) {
              match.context = [];
              
              // Add lines before
              for (let j = Math.max(0, i - contextLines); j < i; j++) {
                match.context.push(entries[j]);
              }
              
              // Add lines after
              for (let j = i + 1; j <= Math.min(entries.length - 1, i + contextLines); j++) {
                match.context.push(entries[j]);
              }
            }
            
            matches.push(match);
            
            // Stop after reaching limit
            if (matches.length >= limit) {
              break;
            }
          }
        }
        
        // Stop processing files if limit reached
        if (matches.length >= limit) {
          break;
        }
      } catch (error) {
        console.error(`[Log Viewer] Error searching log file ${logPath}:`, error);
      }
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          query,
          filesSearched,
          linesSearched: totalLinesSearched,
          matchCount: matches.length,
          matches,
          message: `Found ${matches.length} matches for "${query}" in ${filesSearched} files`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to search logs"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles tailing a log file (showing the last few lines)
 */
async function handleTailLog(args: any) {
  try {
    const result = TailLogSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for tailing log"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { path: logPath, lines, parseJson } = result.data;
    
    // Use system tail command if available for efficiency
    let tailOutput: string | null = null;
    try {
      tailOutput = execSync(`tail -n ${lines} "${logPath}"`, { encoding: 'utf8' });
    } catch (error) {
      console.log(`[Log Viewer] System tail command failed, falling back to file reading: ${error}`);
      tailOutput = null;
    }
    
    let entries: LogEntry[] = [];
    let fileSize = 0;
    
    if (tailOutput) {
      // Parse the tail output
      const lines = tailOutput.split('\n');
      fileSize = (await fs.stat(logPath)).size;
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        let entry: LogEntry | null = null;
        
        if (parseJson) {
          // Try to parse as structured log
          entry = tryParseLogJson(line);
          
          if (!entry) {
            entry = tryParseLogText(line);
          }
        }
        
        // Default to raw text if parsing failed or was disabled
        if (!entry) {
          entry = {
            timestamp: new Date().toISOString(),
            level: "INFO",
            message: line.trim()
          };
        }
        
        entries.push(entry);
      }
    } else {
      // Fall back to our own implementation
      const result = await readLogFile(logPath, {
        lines,
        parseFormat: parseJson
      });
      
      entries = result.entries;
      fileSize = result.fileSize;
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          path: logPath,
          fileSize,
          lines: entries.length,
          entries,
          message: `Tailed last ${entries.length} entries from ${path.basename(logPath)}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to tail log file"
        }, null, 2)
      }],
      isError: true
    };
  }
}