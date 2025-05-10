// Auto-generated boilerplate for event-dispatcher

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { EventEmitter } from 'events';

// Global event emitter for the application
const eventEmitter = new EventEmitter();

// Increase max listeners to prevent memory leak warnings
eventEmitter.setMaxListeners(100);

// Event registry to track registered events
const eventRegistry: Record<string, {
  description: string;
  schema?: z.ZodType<any>;
  listeners: number;
  lastTriggered?: Date;
  overwrite?: boolean;
}> = {};

// Event history for debugging purposes (limited size)
const MAX_HISTORY_SIZE = 100;
const eventHistory: Array<{
  event: string;
  timestamp: Date;
  data: any;
}> = [];

export function activate() {
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
export function onFileWrite(event: { path: string; content: string }) {
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
export function onSessionStart(session: { id: string; startTime: number }) {
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
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'event-dispatcher:dispatch':
      console.log('[Event Dispatcher] Dispatching event...');
      return await handleDispatchEvent(command.args[0]);
    case 'event-dispatcher:subscribe':
      console.log('[Event Dispatcher] Subscribing to event...');
      return await handleSubscribeEvent(command.args[0]);
    case 'event-dispatcher:register':
      console.log('[Event Dispatcher] Registering event...');
      return await handleRegisterEvent(command.args[0]);
    case 'event-dispatcher:list':
      console.log('[Event Dispatcher] Listing events...');
      return await handleListEvents(command.args[0]);
    default:
      console.warn(`[Event Dispatcher] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Event Dispatcher tool
export const DispatchEventSchema = z.object({
  event: z.string(),
  data: z.any(),
  sync: z.boolean().optional().default(false),
  delay: z.number().optional(),
});

export const SubscribeEventSchema = z.object({
  event: z.string(),
  callback: z.string().optional(), // Command or function name to execute
  once: z.boolean().optional().default(false),
  filter: z.record(z.any()).optional(),
});

export const RegisterEventSchema = z.object({
  event: z.string(),
  description: z.string(),
  schema: z.any().optional(), // Zod schema definition
  overwrite: z.boolean().optional().default(false),
});

export const ListEventsSchema = z.object({
  includeHistory: z.boolean().optional().default(true),
  filter: z.string().optional(),
  limit: z.number().optional().default(50),
});

/**
 * Registers a new event type in the system
 */
function registerEvent(event: string, description: string, schema?: z.ZodType<any>): boolean {
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
function dispatchEvent(event: string, data: any, sync: boolean = false): boolean {
  // Update event registry
  if (eventRegistry[event]) {
    eventRegistry[event].lastTriggered = new Date();
    
    // Validate data against schema if provided
    if (eventRegistry[event].schema) {
      try {
        const schema = eventRegistry[event].schema;
        schema.parse(data);
      } catch (error) {
        console.error(`[Event Dispatcher] Event data validation failed for '${event}':`, error);
        return false;
      }
    }
  } else {
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
  } else {
    setImmediate(() => {
      eventEmitter.emit(event, data);
    });
  }
  
  return true;
}

/**
 * Handles dispatching an event
 */
async function handleDispatchEvent(args: any) {
  try {
    const result = DispatchEventSchema.safeParse(args);
    
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
  } catch (error) {
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
}

/**
 * Handles subscribing to an event
 */
async function handleSubscribeEvent(args: any) {
  try {
    const result = SubscribeEventSchema.safeParse(args);
    
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
    const listener = (data: any) => {
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
    } else {
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
  } catch (error) {
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
}

/**
 * Handles registering an event definition
 */
async function handleRegisterEvent(args: any) {
  try {
    const result = RegisterEventSchema.safeParse(args);
    
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
    let zodSchema: z.ZodType<any> | undefined;
    if (schema) {
      try {
        // Convert schema definition to Zod schema if it's not already
        zodSchema = schema instanceof z.ZodType ? schema : z.object(schema);
      } catch (error) {
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
  } catch (error) {
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
}

/**
 * Handles listing registered events
 */
async function handleListEvents(args: any) {
  try {
    const result = ListEventsSchema.safeParse(args);
    
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
      .map(([key, value]) => ({
        name: key,
        ...value,
        lastTriggered: value.lastTriggered ? value.lastTriggered.toISOString() : null
      }));
    
    // Get event history if requested
    let history: Array<{
      event: string;
      timestamp: string;
      data: any;
    }> = [];
    if (includeHistory) {
      history = eventHistory
        .filter(item => !filter || item.event.includes(filter))
        .slice(0, limit)
        .map(item => ({
          ...item,
          timestamp: item.timestamp.toISOString()
        }));
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
  } catch (error) {
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
}