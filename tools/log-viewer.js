"use strict";
// Auto-generated boilerplate for log-viewer
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TailLogSchema = exports.SearchLogsSchema = exports.ListLogsSchema = exports.ViewLogSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const readline = __importStar(require("readline"));
const fs_1 = require("fs");
const child_process_1 = require("child_process");
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
const logCache = new Map();
function activate() {
    console.log("[TOOL] log-viewer activated");
}
/**
 * Handles file write events to detect log updates
 */
function onFileWrite(event) {
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
function onSessionStart(session) {
    console.log(`[Log Viewer] Session started: ${session.id}`);
    // Create session log
    const sessionLog = {
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
function onCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (command.name) {
            case 'log-viewer:view':
                console.log('[Log Viewer] Viewing log file...');
                return yield handleViewLog(command.args[0]);
            case 'log-viewer:list':
                console.log('[Log Viewer] Listing available logs...');
                return yield handleListLogs(command.args[0]);
            case 'log-viewer:search':
                console.log('[Log Viewer] Searching logs...');
                return yield handleSearchLogs(command.args[0]);
            case 'log-viewer:tail':
                console.log('[Log Viewer] Tailing log file...');
                return yield handleTailLog(command.args[0]);
            default:
                console.warn(`[Log Viewer] Unknown command: ${command.name}`);
                return { error: `Unknown command: ${command.name}` };
        }
    });
}
// Define schemas for Log Viewer tool
exports.ViewLogSchema = zod_1.z.object({
    path: zod_1.z.string(),
    lines: zod_1.z.number().optional().default(100),
    startLine: zod_1.z.number().optional(),
    endLine: zod_1.z.number().optional(),
    parseJson: zod_1.z.boolean().optional().default(true),
    filterLevel: zod_1.z.string().optional(),
    filterText: zod_1.z.string().optional(),
});
exports.ListLogsSchema = zod_1.z.object({
    directory: zod_1.z.string().optional(),
    recursive: zod_1.z.boolean().optional().default(false),
    includeMetadata: zod_1.z.boolean().optional().default(true),
    sortBy: zod_1.z.enum(['name', 'size', 'modified']).optional().default('modified'),
    sortDirection: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
});
exports.SearchLogsSchema = zod_1.z.object({
    paths: zod_1.z.array(zod_1.z.string()).or(zod_1.z.string()),
    query: zod_1.z.string(),
    caseSensitive: zod_1.z.boolean().optional().default(false),
    limit: zod_1.z.number().optional().default(100),
    includeContext: zod_1.z.boolean().optional().default(false),
    contextLines: zod_1.z.number().optional().default(2),
});
exports.TailLogSchema = zod_1.z.object({
    path: zod_1.z.string(),
    lines: zod_1.z.number().optional().default(10),
    parseJson: zod_1.z.boolean().optional().default(true),
});
/**
 * Try to parse a log line as JSON
 */
function tryParseLogJson(line) {
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
            return parsed;
        }
    }
    catch (e) {
        // Not JSON, that's okay
    }
    return null;
}
/**
 * Try to parse a plain text log line
 */
function tryParseLogText(line) {
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
    }
    else if ((match = line.match(standardDatePattern))) {
        return {
            timestamp: match[1],
            level: match[2],
            message: match[3]
        };
    }
    else if ((match = line.match(levelPrefixPattern))) {
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
function readLogFile(logPath_1) {
    return __awaiter(this, arguments, void 0, function* (logPath, options = {}) {
        var _a, e_1, _b, _c;
        // Check if file exists
        try {
            yield fs.access(logPath);
        }
        catch (error) {
            throw new Error(`Log file not found: ${logPath}`);
        }
        // Get file stats
        const stats = yield fs.stat(logPath);
        if (stats.size > config.maxLogSize) {
            console.warn(`[Log Viewer] Log file is large (${stats.size} bytes), reading may be slow`);
        }
        const entries = [];
        let lineCount = 0;
        let filteredOut = 0;
        // Create readline interface
        const fileStream = (0, fs_1.createReadStream)(logPath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        try {
            // Process each line
            for (var _d = true, rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = yield rl_1.next(), _a = rl_1_1.done, !_a; _d = true) {
                _c = rl_1_1.value;
                _d = false;
                const line = _c;
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
                let entry = null;
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
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = rl_1.return)) yield _b.call(rl_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return {
            entries,
            fileSize: stats.size,
            lineCount,
            filteredOut
        };
    });
}
/**
 * Finds log files in a directory
 */
function findLogFiles(directory_1) {
    return __awaiter(this, arguments, void 0, function* (directory, recursive = false) {
        const result = [];
        try {
            // Check if directory exists
            yield fs.access(directory);
            // Get directory contents
            const entries = yield fs.readdir(directory, { withFileTypes: true });
            // Process each entry
            for (const entry of entries) {
                const entryPath = path.join(directory, entry.name);
                if (entry.isDirectory() && recursive) {
                    // Recursively search subdirectory
                    const subEntries = yield findLogFiles(entryPath, recursive);
                    result.push(...subEntries);
                }
                else if (entry.isFile()) {
                    // Check if it's a log file (by extension or name)
                    if (entryPath.endsWith('.log') ||
                        entry.name.includes('log') ||
                        entry.name.includes('logs')) {
                        const stats = yield fs.stat(entryPath);
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
        }
        catch (error) {
            console.error(`[Log Viewer] Error reading directory ${directory}:`, error);
        }
        return result;
    });
}
/**
 * Handles viewing a log file
 */
function handleViewLog(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.ViewLogSchema.safeParse(args);
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
            const { path: logPath, lines, startLine, endLine, parseJson, filterLevel, filterText } = result.data;
            // Read log file
            const { entries, fileSize, lineCount, filteredOut } = yield readLogFile(logPath, {
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
        }
        catch (error) {
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
    });
}
/**
 * Handles listing available log files
 */
function handleListLogs(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.ListLogsSchema.safeParse(args);
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
            let logFiles = [];
            if (directory) {
                // Look in the specified directory
                logFiles = yield findLogFiles(directory, recursive);
            }
            else {
                // Look in default locations
                for (const defaultPath of config.defaultLogPaths) {
                    const searchPath = path.join(process.cwd(), defaultPath);
                    try {
                        yield fs.access(searchPath);
                        const files = yield findLogFiles(searchPath, recursive);
                        logFiles = [...logFiles, ...files];
                    }
                    catch (error) {
                        // Path doesn't exist, that's fine
                    }
                }
                // Also check directly in the current directory
                const moreFiles = yield findLogFiles(process.cwd(), false);
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
                const result = {
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
        }
        catch (error) {
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
    });
}
/**
 * Formats bytes to a human-readable string
 */
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
/**
 * Handles searching log files
 */
function handleSearchLogs(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.SearchLogsSchema.safeParse(args);
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
            const { paths, query, caseSensitive, limit, includeContext, contextLines } = result.data;
            // Convert single path to array
            const logPaths = Array.isArray(paths) ? paths : [paths];
            const matches = [];
            let filesSearched = 0;
            let totalLinesSearched = 0;
            // Process each log file
            for (const logPath of logPaths) {
                try {
                    // Read the entire file to provide context if needed
                    const { entries, lineCount } = yield readLogFile(logPath, {
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
                            const match = {
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
                }
                catch (error) {
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
        }
        catch (error) {
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
    });
}
/**
 * Handles tailing a log file (showing the last few lines)
 */
function handleTailLog(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.TailLogSchema.safeParse(args);
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
            let tailOutput = null;
            try {
                tailOutput = (0, child_process_1.execSync)(`tail -n ${lines} "${logPath}"`, { encoding: 'utf8' });
            }
            catch (error) {
                console.log(`[Log Viewer] System tail command failed, falling back to file reading: ${error}`);
                tailOutput = null;
            }
            let entries = [];
            let fileSize = 0;
            if (tailOutput) {
                // Parse the tail output
                const lines = tailOutput.split('\n');
                fileSize = (yield fs.stat(logPath)).size;
                for (const line of lines) {
                    if (!line.trim())
                        continue;
                    let entry = null;
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
            }
            else {
                // Fall back to our own implementation
                const result = yield readLogFile(logPath, {
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
        }
        catch (error) {
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
    });
}
