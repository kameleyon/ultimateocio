"use strict";
// Auto-generated boilerplate for file-watcher
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
exports.GetEventsSchema = exports.ListWatchesSchema = exports.UnwatchPathSchema = exports.WatchPathSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const events_1 = require("events");
// Internal event emitter for file events
const fileEvents = new events_1.EventEmitter();
fileEvents.setMaxListeners(50);
// Track watched directories and files
const watchedPaths = {};
function activate() {
    console.log("[TOOL] file-watcher activated");
}
/**
 * We don't handle file writes directly in the file-watcher
 * as it's the watcher itself
 */
function onFileWrite(event) {
    // Not used in this tool
}
/**
 * Handles session start logic
 */
function onSessionStart(session) {
    console.log(`[File Watcher] Session started: ${session.id}`);
}
/**
 * Handles file-watcher commands
 */
function onCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (command.name) {
            case 'file-watcher:watch':
                console.log('[File Watcher] Setting up watch...');
                return yield handleWatchPath(command.args[0]);
            case 'file-watcher:unwatch':
                console.log('[File Watcher] Removing watch...');
                return yield handleUnwatchPath(command.args[0]);
            case 'file-watcher:list':
                console.log('[File Watcher] Listing watches...');
                return yield handleListWatches(command.args[0]);
            case 'file-watcher:events':
                console.log('[File Watcher] Getting file events...');
                return yield handleGetEvents(command.args[0]);
            default:
                console.warn(`[File Watcher] Unknown command: ${command.name}`);
                return { error: `Unknown command: ${command.name}` };
        }
    });
}
// Define schemas for File Watcher tool
exports.WatchPathSchema = zod_1.z.object({
    path: zod_1.z.string(),
    recursive: zod_1.z.boolean().optional().default(true),
    filter: zod_1.z.string().optional(), // Regex pattern
    ignorePatterns: zod_1.z.array(zod_1.z.string()).optional(),
    debounceMs: zod_1.z.number().optional().default(300),
    persistent: zod_1.z.boolean().optional().default(true),
});
exports.UnwatchPathSchema = zod_1.z.object({
    path: zod_1.z.string(),
});
exports.ListWatchesSchema = zod_1.z.object({
    includeStats: zod_1.z.boolean().optional().default(true),
});
exports.GetEventsSchema = zod_1.z.object({
    path: zod_1.z.string().optional(),
    eventTypes: zod_1.z.array(zod_1.z.enum(['add', 'change', 'unlink'])).optional(),
    limit: zod_1.z.number().optional().default(50),
    since: zod_1.z.number().optional(), // Timestamp
});
const fileEventHistory = [];
const MAX_EVENT_HISTORY = 500;
/**
 * Adds an event to the history
 */
function trackEvent(event) {
    fileEventHistory.unshift(event);
    if (fileEventHistory.length > MAX_EVENT_HISTORY) {
        fileEventHistory.pop();
    }
    // Update watched path stats
    const watchedPath = Object.keys(watchedPaths).find(dir => event.path.startsWith(dir));
    if (watchedPath && watchedPaths[watchedPath]) {
        watchedPaths[watchedPath].lastEvent = new Date();
        watchedPaths[watchedPath].eventCount++;
    }
    // Emit the event
    fileEvents.emit('file-event', event);
    fileEvents.emit(event.type, event);
}
/**
 * Checks if a file matches filters
 */
function matchesFilter(filePath, watch) {
    // Check if file matches the filter
    if (watch.filter && !watch.filter.test(filePath)) {
        return false;
    }
    // Check if file should be ignored
    if (watch.ignorePatterns) {
        for (const pattern of watch.ignorePatterns) {
            if (pattern.test(filePath)) {
                return false;
            }
        }
    }
    return true;
}
/**
 * Sets up a file or directory watch
 */
function handleWatchPath(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const result = exports.WatchPathSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for watching path"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { path: watchPath, recursive, filter, ignorePatterns, debounceMs, persistent } = result.data;
            // Check if the path exists
            try {
                const stats = yield fs.stat(watchPath);
            }
            catch (error) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Path does not exist: ${watchPath}`,
                                message: "Failed to set up watch"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Close existing watcher for this path if any
            if ((_a = watchedPaths[watchPath]) === null || _a === void 0 ? void 0 : _a.watcher) {
                (_b = watchedPaths[watchPath].watcher) === null || _b === void 0 ? void 0 : _b.close();
            }
            // Prepare filters
            const filterRegex = filter ? new RegExp(filter) : undefined;
            const ignoreRegexes = ignorePatterns === null || ignorePatterns === void 0 ? void 0 : ignorePatterns.map(pattern => new RegExp(pattern));
            // Set up the watch
            const options = {
                recursive: recursive,
                persistent: persistent
            };
            // Store in watched paths
            watchedPaths[watchPath] = {
                recursive,
                filter: filterRegex,
                ignorePatterns: ignoreRegexes,
                eventCount: 0
            };
            // In a real implementation, we would use chokidar or fs.watch
            // For now, we'll use a mock watcher setup
            // Simulate a watcher
            const mockWatcher = {
                close: () => {
                    console.log(`[File Watcher] Closed watch on ${watchPath}`);
                    delete watchedPaths[watchPath].watcher;
                }
            };
            watchedPaths[watchPath].watcher = mockWatcher;
            // Simulate an initial scan event that reports existing files
            setTimeout(() => {
                trackEvent({
                    type: 'add',
                    path: path.join(watchPath, 'example-detected-file.txt'),
                    timestamp: Date.now(),
                    size: 1024
                });
            }, 100);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            path: watchPath,
                            recursive,
                            filter: filter || undefined,
                            ignorePatterns: ignorePatterns || undefined,
                            debounceMs,
                            persistent,
                            message: `Watch set up for ${watchPath}`
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
                            message: "Failed to set up watch"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Removes a watch from a path
 */
function handleUnwatchPath(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const result = exports.UnwatchPathSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for unwatching path"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { path: watchPath } = result.data;
            // Check if path is being watched
            if (!watchedPaths[watchPath]) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Path is not being watched: ${watchPath}`,
                                message: "Failed to remove watch"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Close the watcher
            if (watchedPaths[watchPath].watcher) {
                (_a = watchedPaths[watchPath].watcher) === null || _a === void 0 ? void 0 : _a.close();
            }
            // Remove from watched paths
            const stats = Object.assign({}, watchedPaths[watchPath]);
            delete watchedPaths[watchPath];
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            path: watchPath,
                            eventCount: stats.eventCount,
                            message: `Watch removed from ${watchPath}`
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
                            message: "Failed to remove watch"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Lists active watches
 */
function handleListWatches(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.ListWatchesSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for listing watches"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { includeStats } = result.data;
            // Format the watches
            const watches = Object.entries(watchedPaths).map(([path, watch]) => {
                var _a, _b;
                return (Object.assign({ path, recursive: watch.recursive, filter: (_a = watch.filter) === null || _a === void 0 ? void 0 : _a.source, ignorePatterns: (_b = watch.ignorePatterns) === null || _b === void 0 ? void 0 : _b.map(p => p.source), active: !!watch.watcher }, (includeStats ? {
                    eventCount: watch.eventCount,
                    lastEvent: watch.lastEvent ? watch.lastEvent.toISOString() : null
                } : {})));
            });
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            watches,
                            count: watches.length,
                            message: `Found ${watches.length} active watches`
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
                            message: "Failed to list watches"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Gets file events from history
 */
function handleGetEvents(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.GetEventsSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for getting file events"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { path: filterPath, eventTypes, limit, since } = result.data;
            // Filter events
            let events = [...fileEventHistory];
            if (filterPath) {
                events = events.filter(event => event.path.startsWith(filterPath));
            }
            if (eventTypes && eventTypes.length > 0) {
                events = events.filter(event => eventTypes.includes(event.type));
            }
            if (since) {
                events = events.filter(event => event.timestamp >= since);
            }
            // Apply limit
            const limitedEvents = events.slice(0, limit);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            events: limitedEvents,
                            count: limitedEvents.length,
                            totalEvents: events.length,
                            message: `Found ${limitedEvents.length} file events`
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
                            message: "Failed to get file events"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
