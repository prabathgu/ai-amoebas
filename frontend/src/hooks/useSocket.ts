import { useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socketService';
import type { WorldState, AmoebaSpecies, Amoeba } from '../types/game';

interface ConnectionState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

interface SocketHookReturn {
  worldState: WorldState | null;
  connectionState: ConnectionState;
  players: string[];
  
  // Actions
  createSpecies: (speciesData: any) => void;
  updateSpecies: (speciesId: string, updates: Partial<AmoebaSpecies>) => void;
  deleteSpecies: (speciesId: string) => void;
  spawnAnimals: (speciesId: string, count: number) => void;
  
  // Connection control
  connect: () => void;
  disconnect: () => void;
}

export const useSocket = (autoConnect: boolean = true): SocketHookReturn => {
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    connected: false,
    connecting: false,
    error: null,
    reconnectAttempts: 0
  });
  const [players, setPlayers] = useState<string[]>([]);

  // Connection management
  const connect = useCallback(async () => {
    if (connectionState.connected || connectionState.connecting) return;

    setConnectionState(prev => ({ ...prev, connecting: true, error: null }));

    try {
      await socketService.connect();
    } catch (error) {
      setConnectionState(prev => ({
        ...prev,
        connecting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
    }
  }, [connectionState.connected, connectionState.connecting]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setConnectionState({
      connected: false,
      connecting: false,
      error: null,
      reconnectAttempts: 0
    });
    setWorldState(null);
    setPlayers([]);
  }, []);

  // Game actions
  const createSpecies = useCallback((speciesData: any) => {
    socketService.createSpecies(speciesData);
  }, []);

  const updateSpecies = useCallback((speciesId: string, updates: Partial<AmoebaSpecies>) => {
    socketService.updateSpecies(speciesId, updates);
  }, []);

  const deleteSpecies = useCallback((speciesId: string) => {
    socketService.deleteSpecies(speciesId);
  }, []);

  const spawnAnimals = useCallback((speciesId: string, count: number) => {
    socketService.spawnAnimals(speciesId, count);
  }, []);

  // Event handlers
  useEffect(() => {
    // Connection events
    const handleConnectionStatus = ({ connected, reason }: { connected: boolean; reason?: string }) => {
      setConnectionState(prev => ({
        ...prev,
        connected,
        connecting: false,
        error: connected ? null : reason || 'Disconnected'
      }));
    };

    const handleConnectionError = (error: Error) => {
      setConnectionState(prev => ({
        ...prev,
        connecting: false,
        error: error.message
      }));
    };

    const handleConnectionFailed = () => {
      setConnectionState(prev => ({
        ...prev,
        connecting: false,
        error: 'Max reconnection attempts reached'
      }));
    };

    // Game events
    const handleWorldState = (newWorldState: WorldState) => {
      setWorldState(newWorldState);
    };

    const handleAmoebaUpdate = (amoebas: Amoeba[]) => {
      setWorldState(prev => prev ? { ...prev, amoebas } : null);
    };

    const handleSpeciesCreated = (species: AmoebaSpecies) => {
      setWorldState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          species: [...prev.species, species]
        };
      });
    };

    const handleSpeciesUpdated = (updatedSpecies: AmoebaSpecies) => {
      setWorldState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          species: prev.species.map(s => s.id === updatedSpecies.id ? updatedSpecies : s)
        };
      });
    };

    const handleSpeciesDeleted = (speciesId: string) => {
      setWorldState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          species: prev.species.filter(s => s.id !== speciesId),
          amoebas: prev.amoebas.filter(a => a.speciesId !== speciesId)
        };
      });
    };

    const handlePlayerJoined = (playerId: string) => {
      setPlayers(prev => [...prev.filter(id => id !== playerId), playerId]);
    };

    const handlePlayerLeft = (playerId: string) => {
      setPlayers(prev => prev.filter(id => id !== playerId));
    };

    const handleGameError = (message: string) => {
      console.error('Game error:', message);
      setConnectionState(prev => ({ ...prev, error: message }));
    };

    // Register event listeners
    socketService.on('connection-status', handleConnectionStatus);
    socketService.on('connection-error', handleConnectionError);
    socketService.on('connection-failed', handleConnectionFailed);
    socketService.on('world-state', handleWorldState);
    socketService.on('amoeba-update', handleAmoebaUpdate);
    socketService.on('species-created', handleSpeciesCreated);
    socketService.on('species-updated', handleSpeciesUpdated);
    socketService.on('species-deleted', handleSpeciesDeleted);
    socketService.on('player-joined', handlePlayerJoined);
    socketService.on('player-left', handlePlayerLeft);
    socketService.on('game-error', handleGameError);

    // Auto-connect if enabled
    if (autoConnect && !socketService.isConnected()) {
      connect();
    }

    // Cleanup
    return () => {
      socketService.off('connection-status', handleConnectionStatus);
      socketService.off('connection-error', handleConnectionError);
      socketService.off('connection-failed', handleConnectionFailed);
      socketService.off('world-state', handleWorldState);
      socketService.off('amoeba-update', handleAmoebaUpdate);
      socketService.off('species-created', handleSpeciesCreated);
      socketService.off('species-updated', handleSpeciesUpdated);
      socketService.off('species-deleted', handleSpeciesDeleted);
      socketService.off('player-joined', handlePlayerJoined);
      socketService.off('player-left', handlePlayerLeft);
      socketService.off('game-error', handleGameError);
    };
  }, [autoConnect, connect]);

  return {
    worldState,
    connectionState,
    players,
    createSpecies,
    updateSpecies,
    deleteSpecies,
    spawnAnimals,
    connect,
    disconnect
  };
};