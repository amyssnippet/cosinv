type EventCallback = (...args: any[]) => void;

class EventEmitter {
  private events: Map<string, Set<EventCallback>> = new Map();

  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);

    return () => this.off(event, callback);
  }

  off(event: string, callback: EventCallback): void {
    this.events.get(event)?.delete(callback);
  }

  emit(event: string, ...args: any[]): void {
    this.events.get(event)?.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  once(event: string, callback: EventCallback): () => void {
    const wrapper = (...args: any[]) => {
      this.off(event, wrapper);
      callback(...args);
    };
    return this.on(event, wrapper);
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

export const eventBus = new EventEmitter();

// Predefined events
export const Events = {
  AUTH_LOGOUT: 'auth:logout',
  AUTH_TOKEN_EXPIRED: 'auth:token_expired',
  INTERVIEW_STARTED: 'interview:started',
  INTERVIEW_ENDED: 'interview:ended',
  QUESTION_ANSWERED: 'question:answered',
  NETWORK_ERROR: 'network:error',
  NOTIFICATION_SHOW: 'notification:show',
} as const;

export default eventBus;
