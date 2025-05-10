"use strict";
// Auto-generated boilerplate for event-dispatcher
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
exports.ListEventsSchema = exports.RegisterEventSchema = exports.SubscribeEventSchema = exports.DispatchEventSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const events_1 = require("events");
// Global event emitter for the application
const eventEmitter = new events_1.EventEmitter();
// Increase max listeners to prevent memory leak warnings
eventEmitter.setMaxListeners(100);
// Event registry to track registered events
const eventRegistry = {};
// Event history for debugging purposes (limited size)
const MAX_HISTORY_SIZE = 100;
const eventHistory = [];
function activate() {
    console.log("[TOOL] event-dispatcher activated");
    // Register built-in events
    registerEvent('system:startup', 'System startup event');
    registerEvent('system:shutdown', 'System shutdown event');
    registerEvent('file:changed', 'File change event');
    registerEvent('user:action', 'User action event');
}
/**
 * Handles file write events to dispatch file change events
 */
function onFileWrite(event) {
    console.log(`[Event Dispatcher] File write detected: ${event.path}`);
    // Dispatch file change event
    dispatchEvent('file:changed', {
        path: event.path,
        size: event.content.length,
        timestamp: new Date()
    });
}
/**
 * Handles session start logic
 */
function onSessionStart(session) {
    console.log(`[Event Dispatcher] Session started: ${session.id}`);
    // Dispatch system startup event
    dispatchEvent('system:startup', {
        sessionId: session.id,
        startTime: new Date(session.startTime),
        environment: process.env.NODE_ENV || 'development'
    });
}
/**
 * Handles event-dispatcher commands
 */
function onCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (command.name) {
            case 'event-dispatcher:dispatch':
                console.log('[Event Dispatcher] Dispatching event...');
                return yield handleDispatchEvent(command.args[0]);
            case 'event-dispatcher:subscribe':
                console.log('[Event Dispatcher] Subscribing to event...');
                return yield handleSubscribeEvent(command.args[0]);
            case 'event-dispatcher:register':
                console.log('[Event Dispatcher] Registering event...');
                return yield handleRegisterEvent(command.args[0]);
            case 'event-dispatcher:list':
                console.log('[Event Dispatcher] Listing events...');
                return yield handleListEvents(command.args[0]);
            default:
                console.warn(`[Event Dispatcher] Unknown command: ${command.name}`);
                return { error: `Unknown command: ${command.name}` };
        }
    });
}
// Define schemas for Event Dispatcher tool
exports.DispatchEventSchema = zod_1.z.object({
    event: zod_1.z.string(),
    data: zod_1.z.any(),
    sync: zod_1.z.boolean().optional().default(false),
    delay: zod_1.z.number().optional(),
});
exports.SubscribeEventSchema = zod_1.z.object({
    event: zod_1.z.string(),
    callback: zod_1.z.string().optional(), // Command or function name to execute
    once: zod_1.z.boolean().optional().default(false),
    filter: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.RegisterEventSchema = zod_1.z.object({
    event: zod_1.z.string(),
    description: zod_1.z.string(),
    schema: zod_1.z.any().optional(), // Zod schema definition
    overwrite: zod_1.z.boolean().optional().default(false),
});
exports.ListEventsSchema = zod_1.z.object({
    includeHistory: zod_1.z.boolean().optional().default(true),
    filter: zod_1.z.string().optional(),
    limit: zod_1.z.number().optional().default(50),
});
/**
 * Registers a new event type in the system
 */
function registerEvent(event, description, schema) {
    if (eventRegistry[event] && !eventRegistry[event].overwrite) {
        console.warn(`[Event Dispatcher] Event '${event}' already registered`);
        return false;
    }
    eventRegistry[event] = {
        description,
        schema,
        listeners: eventEmitter.listenerCount(event),
        lastTriggered: undefined
    };
    return true;
}
/**
 * Dispatches an event with data
 */
function dispatchEvent(event, data, sync = false) {
    // Update event registry
    if (eventRegistry[event]) {
        eventRegistry[event].lastTriggered = new Date();
        // Validate data against schema if provided
        if (eventRegistry[event].schema) {
            try {
                const schema = eventRegistry[event].schema;
                schema.parse(data);
            }
            catch (error) {
                console.error(`[Event Dispatcher] Event data validation failed for '${event}':`, error);
                return false;
            }
        }
    }
    else {
        console.warn(`[Event Dispatcher] Unregistered event '${event}' being dispatched`);
    }
    // Add to history
    eventHistory.unshift({
        event,
        timestamp: new Date(),
        data
    });
    // Limit history size
    if (eventHistory.length > MAX_HISTORY_SIZE) {
        eventHistory.pop();
    }
    // Dispatch the event
    if (sync) {
        eventEmitter.emit(event, data);
    }
    else {
        setImmediate(() => {
            eventEmitter.emit(event, data);
        });
    }
    return true;
}
/**
 * Handles dispatching an event
 */
function handleDispatchEvent(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.DispatchEventSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for dispatching event"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { event, data, sync, delay } = result.data;
            // Handle delayed dispatch
            if (delay && delay > 0) {
                setTimeout(() => {
                    dispatchEvent(event, data, sync);
                }, delay);
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                event,
                                scheduled: true,
                                delay,
                                scheduledFor: new Date(Date.now() + delay).toISOString(),
                                listenerCount: eventEmitter.listenerCount(event),
                                message: `Event '${event}' scheduled for dispatch in ${delay}ms`
                            }, null, 2)
                        }]
                };
            }
            // Immediate dispatch
            const dispatched = dispatchEvent(event, data, sync);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            event,
                            dispatched,
                            sync,
                            timestamp: new Date().toISOString(),
                            listenerCount: eventEmitter.listenerCount(event),
                            message: dispatched ? `Event '${event}' dispatched successfully` : `Failed to dispatch event '${event}'`
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
                            message: "Failed to dispatch event"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles subscribing to an event
 */
function handleSubscribeEvent(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.SubscribeEventSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for subscribing to event"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { event, callback, once, filter } = result.data;
            // Define listener function
            const listener = (data) => {
                // Apply filter if provided
                if (filter) {
                    for (const [key, value] of Object.entries(filter)) {
                        if (data[key] !== value) {
                            return; // Skip if doesn't match filter
                        }
                    }
                }
                // Execute callback
                if (callback) {
                    console.log(`[Event Dispatcher] Executing callback for event '${event}': ${callback}`);
                    // In a real implementation, this would execute the callback
                    // For our mock implementation, just log it
                }
            };
            // Register the listener
            if (once) {
                eventEmitter.once(event, listener);
            }
            else {
                eventEmitter.on(event, listener);
            }
            // Update listener count in registry
            if (eventRegistry[event]) {
                eventRegistry[event].listeners = eventEmitter.listenerCount(event);
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            event,
                            once,
                            listenerCount: eventEmitter.listenerCount(event),
                            hasFilter: !!filter,
                            message: `Successfully subscribed to event '${event}'`
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
                            message: "Failed to subscribe to event"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles registering an event definition
 */
function handleRegisterEvent(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.RegisterEventSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for registering event"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { event, description, schema, overwrite } = result.data;
            // Check for existing event
            const exists = !!eventRegistry[event];
            if (exists && !overwrite) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Event '${event}' already exists`,
                                message: "Failed to register event"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Register the event
            let zodSchema;
            if (schema) {
                try {
                    // Convert schema definition to Zod schema if it's not already
                    zodSchema = schema instanceof zod_1.z.ZodType ? schema : zod_1.z.object(schema);
                }
                catch (error) {
                    return {
                        content: [{
                                type: "text",
                                text: JSON.stringify({
                                    error: `Invalid schema definition: ${error}`,
                                    message: "Failed to register event"
                                }, null, 2)
                            }],
                        isError: true
                    };
                }
            }
            const registered = registerEvent(event, description, zodSchema);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            event,
                            registered,
                            overwritten: exists && overwrite,
                            hasSchema: !!zodSchema,
                            message: registered
                                ? exists
                                    ? `Event '${event}' definition updated`
                                    : `Event '${event}' registered successfully`
                                : `Failed to register event '${event}'`
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
                            message: "Failed to register event"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles listing registered events
 */
function handleListEvents(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.ListEventsSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for listing events"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { includeHistory, filter, limit } = result.data;
            // Filter events if a filter is provided
            const events = Object.entries(eventRegistry)
                .filter(([key]) => !filter || key.includes(filter))
                .map(([key, value]) => (Object.assign(Object.assign({ name: key }, value), { lastTriggered: value.lastTriggered ? value.lastTriggered.toISOString() : null })));
            // Get event history if requested
            let history = [];
            if (includeHistory) {
                history = eventHistory
                    .filter(item => !filter || item.event.includes(filter))
                    .slice(0, limit)
                    .map(item => (Object.assign(Object.assign({}, item), { timestamp: item.timestamp.toISOString() })));
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            events,
                            totalEvents: events.length,
                            history: includeHistory ? history : undefined,
                            historyCount: includeHistory ? history.length : undefined,
                            message: `Found ${events.length} registered events${includeHistory ? ` and ${history.length} history entries` : ''}`
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
                            message: "Failed to list events"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
