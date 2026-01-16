import { io, Socket } from 'socket.io-client';
import { config } from '../config/environment';

interface InterviewEvent {
  type: 'candidate_joined' | 'candidate_left' | 'answer_submitted' | 'interview_ended';
  candidateId: string;
  data?: any;
  timestamp: Date;
}

/**
 * Service for managing WebSocket connections for HR interview sessions.
 */
class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(config.wsUrl, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('HR Socket connected:', this.socket?.id);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('HR Socket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('HR Socket disconnected:', reason);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  reconnect(token: string): Promise<void> {
    this.disconnect();
    return this.connect(token);
  }

  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      console.warn('HR Socket not connected:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    this.socket?.on(event, callback as any);

    return () => {
      this.listeners.get(event)?.delete(callback);
      this.socket?.off(event, callback as any);
    };
  }

  // HR-specific methods
  monitorInterview(interviewId: string): void {
    this.emit('monitor-interview', { interviewId });
  }

  stopMonitoring(interviewId: string): void {
    this.emit('stop-monitoring', { interviewId });
  }

  onInterviewEvent(callback: (event: InterviewEvent) => void): () => void {
    return this.on('interview-event', callback);
  }

  endInterview(interviewId: string): void {
    this.emit('end-interview', { interviewId });
  }

  reconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket?.connect();

      const onConnect = () => {
        this.socket?.off('connect', onConnect);
        this.socket?.off('connect_error', onError);
        resolve();
      };

      const onError = (error: any) => {
        this.socket?.off('connect', onConnect);
        this.socket?.off('connect_error', onError);
        reject(error);
      };

      this.socket?.on('connect', onConnect);
      this.socket?.on('connect_error', onError);
    });
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
