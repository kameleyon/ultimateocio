"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPEventEmitter = void 0;
class MCPEventEmitter {
    constructor() {
        this.listeners = new Map();
    }
    /**
     * Registers an event handler for a specific event type.
     * @param eventType The type of event to listen for.
     * @param handler The function to call when the event is emitted.
     */
    on(eventType, handler) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType)?.push(handler);
    }
    /**
     * Unregisters an event handler for a specific event type.
     * @param eventType The type of event to stop listening for.
     * @param handler The specific handler function to remove.
     */
    off(eventType, handler) {
        const eventHandlers = this.listeners.get(eventType);
        if (eventHandlers) {
            const index = eventHandlers.indexOf(handler);
            if (index > -1) {
                eventHandlers.splice(index, 1);
                if (eventHandlers.length === 0) {
                    this.listeners.delete(eventType);
                }
            }
        }
    }
    /**
     * Emits an event, calling all registered handlers for its type.
     * @param event The event object to emit.
     */
    emit(event) {
        const handlers = this.listeners.get(event.type);
        if (handlers) {
            // Call handlers asynchronously to prevent blocking
            handlers.forEach(handler => setTimeout(() => handler(event), 0));
        }
        // Optionally, emit a wildcard event or log all events
        // if (this.listeners.has('*')) {
        //   this.listeners.get('*')?.forEach(handler => setTimeout(() => handler(event), 0));
        // }
    }
    /**
     * Removes all listeners for a specific event type, or all listeners if no type is specified.
     * @param eventType Optional. The type of event for which to remove all listeners.
     */
    removeAllListeners(eventType) {
        if (eventType) {
            this.listeners.delete(eventType);
        }
        else {
            this.listeners.clear();
        }
    }
}
exports.MCPEventEmitter = MCPEventEmitter;
