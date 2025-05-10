import { MCPEvent, MCPEventHandler } from './types';

export class MCPEventEmitter {
  private listeners: Map<string, MCPEventHandler[]>;

  constructor() {
    this.listeners = new Map<string, MCPEventHandler[]>();
  }

  /**
   * Registers an event handler for a specific event type.
   * @param eventType The type of event to listen for.
   * @param handler The function to call when the event is emitted.
   */
  public on(eventType: string, handler: MCPEventHandler): void {
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
  public off(eventType: string, handler: MCPEventHandler): void {
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
  public emit(event: MCPEvent): void {
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
  public removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }
}