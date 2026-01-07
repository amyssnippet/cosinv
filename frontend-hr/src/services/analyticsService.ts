/**
 * Service for tracking analytics events in HR portal.
 * In development, events are stored locally. In production, they should be sent to an analytics provider.
 */
class AnalyticsService {
  private events: any[] = [];

  /**
   * Track an analytics event.
   * @param event - The event name
   * @param data - Optional event data
   */
  track(event: string, data?: any) {
    const eventData = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };
    this.events.push(eventData);
    console.log('HR Analytics event:', eventData);
    // In production, send to analytics provider
  }

  /**
   * Get all tracked events.
   * @returns Array of tracked events
   */
  getEvents() {
    return this.events;
  }

  /**
   * Clear all tracked events.
   */
  clearEvents() {
    this.events = [];
  }
}

export const analyticsService = new AnalyticsService();