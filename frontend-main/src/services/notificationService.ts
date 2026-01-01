import { eventBus, Events } from '../utils/eventBus';

interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

class NotificationService {
  show(notification: Omit<NotificationData, 'id'>) {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    eventBus.emit(Events.NOTIFICATION_SHOW, { ...notification, id });
  }

  success(title: string, message?: string, duration?: number) {
    this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message?: string, duration?: number) {
    this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message?: string, duration?: number) {
    this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message?: string, duration?: number) {
    this.show({ type: 'info', title, message, duration });
  }
}

export const notificationService = new NotificationService();