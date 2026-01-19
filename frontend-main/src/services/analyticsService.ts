class AnalyticsService {
  private events: any[] = [];

  track(event: string, data?: any) {
    const eventData = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };
    this.events.push(eventData);
    console.log('Analytics event:', eventData);
    // In production, send to analytics provider
  }

  getEvents() {
    return this.events;
  }

  clearEvents() {
    this.events = [];
  }
}

export const analyticsService = new AnalyticsService();