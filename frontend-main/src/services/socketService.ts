import { io, Socket } from 'socket.io-client';
import { config } from '../config/environment';

/**
 * Service for managing WebSocket connections and real-time communication.
 */
class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Establishes a WebSocket connection with authentication.
   * @param token - Authentication token
   * @returns Promise that resolves when connected
   */
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
        console.log('Socket connected:', this.socket?.id);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });
    });
  }

  /**
   * Disconnects the WebSocket connection and clears listeners.
   */
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
      console.warn('Socket not connected, cannot emit:', event);
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

  joinRoom(roomId: string): void {
    this.emit('join-room', { roomId });
  }

  leaveRoom(roomId: string): void {
    this.emit('leave-room', { roomId });
  }

  sendMessage(roomId: string, message: string): void {
    this.emit('chat-message', { roomId, message });
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

  getConnectionStatus(): string {
    if (!this.socket) return 'disconnected';
    return this.socket.connected ? 'connected' : 'connecting';
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
