import { io, Socket } from 'socket.io-client';
import type { WorldState, AmoebaSpecies, Amoeba } from '../types/game';

export class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 2000;
  private eventListeners: Map<string, Function[]> = new Map();

  connect(url: string = 'http://localhost:3001'): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(url, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
        this.reconnectAttempts = 0;
        this.emit('connection-status', { connected: true });
        this.joinWorld('shared_world');
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
        this.emit('connection-status', { connected: false, reason });
        
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          this.handleReconnection();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.emit('connection-error', error);
        reject(error);
      });

      // Game event handlers
      this.socket.on('world-state', (worldState: WorldState) => {
        this.emit('world-state', worldState);
      });

      this.socket.on('amoeba-update', (amoebas: Amoeba[]) => {
        this.emit('amoeba-update', amoebas);
      });

      this.socket.on('species-created', (species: AmoebaSpecies) => {
        this.emit('species-created', species);
      });

      this.socket.on('species-updated', (species: AmoebaSpecies) => {
        this.emit('species-updated', species);
      });

      this.socket.on('species-deleted', (speciesId: string) => {
        this.emit('species-deleted', speciesId);
      });

      this.socket.on('player-joined', (playerId: string) => {
        this.emit('player-joined', playerId);
      });

      this.socket.on('player-left', (playerId: string) => {
        this.emit('player-left', playerId);
      });

      this.socket.on('error', (message: string) => {
        this.emit('game-error', message);
      });
    });
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        }
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('connection-failed', { maxAttemptsReached: true });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
  }

  // Event handling
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      this.eventListeners.delete(event);
      return;
    }

    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Game actions
  joinWorld(worldId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-world', worldId);
    }
  }

  createSpecies(speciesData: Omit<AmoebaSpecies, 'id' | 'createdAt' | 'lastModified'>): void {
    if (this.socket?.connected) {
      this.socket.emit('create-species', speciesData);
    }
  }

  updateSpecies(speciesId: string, updates: Partial<AmoebaSpecies>): void {
    if (this.socket?.connected) {
      this.socket.emit('update-species', speciesId, updates);
    }
  }

  deleteSpecies(speciesId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('delete-species', speciesId);
    }
  }

  spawnAnimals(speciesId: string, count: number): void {
    if (this.socket?.connected) {
      this.socket.emit('spawn-animals', speciesId, count);
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionState(): {
    connected: boolean;
    id?: string;
    transport?: string;
  } {
    if (!this.socket) {
      return { connected: false };
    }

    return {
      connected: this.socket.connected,
      id: this.socket.id,
      transport: this.socket.io.engine?.transport?.name
    };
  }
}

// Singleton instance
export const socketService = new SocketService();