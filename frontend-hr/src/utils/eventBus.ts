type EventCallback = (...args: string[]) => void;

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

  emit(event: string, ...args: string[]): void {
    this.events.get(event)?.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`HR EventBus error for ${event}:`, error);
      }
    });
  }

  once(event: string, callback: EventCallback): () => void {
    const wrapper = (...args: string[]) => {
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

// HR Portal Events
export const Events = {
  AUTH_LOGOUT: 'auth:logout',
  AUTH_SESSION_EXPIRED: 'auth:session_expired',
  CANDIDATE_STATUS_CHANGED: 'candidate:status_changed',
  INTERVIEW_LIVE_UPDATE: 'interview:live_update',
  JOB_CREATED: 'job:created',
  JOB_UPDATED: 'job:updated',
  REPORT_GENERATED: 'report:generated',
  NOTIFICATION_SHOW: 'notification:show',
} as const;

export default eventBus;
