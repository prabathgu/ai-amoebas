import { AlgaeTile, WorldState, GameConfig } from '../types/game';

export class AlgaeSystem {
  private worldState: WorldState;
  private config: GameConfig;
  private lastUpdate: number;

  constructor(worldState: WorldState, config: GameConfig) {
    this.worldState = worldState;
    this.config = config;
    this.lastUpdate = Date.now();
  }

  update(currentTime: number): void {
    const deltaTime = currentTime - this.lastUpdate;
    
    // Regenerate algae every 30 seconds
    if (deltaTime >= this.config.foodRegenRate) {
      this.regenerateAlgae();
      this.lastUpdate = currentTime;
    }
  }

  private regenerateAlgae(): void {
    // Add new algae tiles randomly
    const numNewAlgae = Math.floor(Math.random() * 5) + 1; // 1-5 new algae
    
    for (let i = 0; i < numNewAlgae; i++) {
      const x = Math.floor(Math.random() * this.config.worldSize);
      const y = Math.floor(Math.random() * this.config.worldSize);
      
      // Check if algae already exists at this location
      const existingAlgae = this.worldState.algaeTiles.find(algae => algae.x === x && algae.y === y);
      
      if (existingAlgae) {
        // Increase existing algae amount
        existingAlgae.amount = Math.min(100, existingAlgae.amount + 20);
      } else {
        // Create new algae tile
        this.worldState.algaeTiles.push({
          x,
          y,
          amount: Math.floor(Math.random() * 50) + 30 // 30-80 algae
        });
      }
    }
  }

  consumeAlgae(x: number, y: number, amount: number): number {
    const algae = this.worldState.algaeTiles.find(a => a.x === x && a.y === y);
    
    if (!algae) {
      return 0;
    }
    
    const consumed = Math.min(algae.amount, amount);
    algae.amount -= consumed;
    
    // Remove depleted algae
    if (algae.amount <= 0) {
      this.worldState.algaeTiles = this.worldState.algaeTiles.filter(a => a !== algae);
    }
    
    return consumed;
  }

  hasAlgae(x: number, y: number): boolean {
    return this.worldState.algaeTiles.some(algae => algae.x === x && algae.y === y && algae.amount > 0);
  }

  findNearbyAlgae(x: number, y: number, radius: number): AlgaeTile | null {
    let closest: AlgaeTile | null = null;
    let minDistance = Infinity;

    for (const algae of this.worldState.algaeTiles) {
      if (algae.amount <= 0) continue;
      
      const distance = Math.sqrt((algae.x - x) ** 2 + (algae.y - y) ** 2);
      if (distance <= radius && distance < minDistance) {
        closest = algae;
        minDistance = distance;
      }
    }

    return closest;
  }

  getTotalAlgae(): number {
    return this.worldState.algaeTiles.reduce((sum, algae) => sum + algae.amount, 0);
  }
}