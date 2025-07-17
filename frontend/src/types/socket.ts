import type { Amoeba, AmoebaSpecies, WorldState } from './game';

export interface SocketEvents {
  // Client to Server
  'join-world': (worldId: string) => void;
  'create-species': (species: Omit<AmoebaSpecies, 'id' | 'createdAt' | 'lastModified'>) => void;
  'update-species': (speciesId: string, updates: Partial<AmoebaSpecies>) => void;
  'delete-species': (speciesId: string) => void;
  'spawn-amoebas': (speciesId: string, count: number) => void;

  // Server to Client
  'world-state': (worldState: WorldState) => void;
  'amoeba-update': (amoebas: Amoeba[]) => void;
  'species-created': (species: AmoebaSpecies) => void;
  'species-updated': (species: AmoebaSpecies) => void;
  'species-deleted': (speciesId: string) => void;
  'error': (message: string) => void;
  'player-joined': (playerId: string) => void;
  'player-left': (playerId: string) => void;
}