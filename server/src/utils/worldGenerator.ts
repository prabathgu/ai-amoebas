import { AlgaeTile, WorldState, GameConfig } from '../types/game';

export class WorldGenerator {
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  generateWorld(): WorldState {
    const algaeTiles = this.generateInitialAlgae();

    return {
      worldId: 'shared_world',
      amoebas: [],
      species: [],
      algaeTiles,
      connectedPlayers: [],
      lastUpdate: Date.now()
    };
  }

  private generateInitialAlgae(): AlgaeTile[] {
    const algaeTiles: AlgaeTile[] = [];
    const { worldSize } = this.config;

    for (let x = 0; x < worldSize; x++) {
      for (let y = 0; y < worldSize; y++) {
        // 25% chance of initial algae on any tile
        if (Math.random() < 0.25) {
          algaeTiles.push({
            x,
            y,
            amount: Math.floor(Math.random() * 80) + 20 // 20-100 algae
          });
        }
      }
    }

    return algaeTiles;
  }
}

export const defaultGameConfig: GameConfig = {
  worldSize: 100,
  tileSize: 10,
  maxAnimals: 200,
  foodRegenRate: 30000, // 30 seconds
  simulationSpeed: 1000 / 60 // 60 FPS
};