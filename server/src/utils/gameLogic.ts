import { Amoeba, WorldState, BehaviorTree, BehaviorRule, BehaviorCondition, ConditionCheck, AlgaeTile, AmoebaSpecies } from '../types/game';
import { AlgaeSystem } from './algaeSystem';

export class GameLogic {
  private worldState: WorldState;
  private algaeSystem: AlgaeSystem;
  private config = {
    worldSize: 100,
    baseSpeed: 1,
    maxHealth: 100,
    maxEnergy: 100,
    reproductionCooldown: 60000, // 1 minute
    energyDecayRate: 0.1, // per second
    healthDecayRate: 0.05, // per second when energy is 0
    algaeSearchRadius: 3,
    amoebaDetectionRadius: 3,
    reproductionEnergyThreshold: 50,
    reproductionAgeThreshold: 10,
    reproductionEnergyCost: 30,
    algaeConsumptionRate: 25, // algae consumed per eat action
    foodRegenRate: 30000 // 30 seconds
  };

  constructor(worldState: WorldState) {
    this.worldState = worldState;
    this.algaeSystem = new AlgaeSystem(worldState, {
      worldSize: this.config.worldSize,
      tileSize: 10,
      maxAnimals: 200,
      foodRegenRate: this.config.foodRegenRate,
      simulationSpeed: 1000 / 60
    });
  }

  updateAmoebas(deltaTime: number): void {
    const amoebas = [...this.worldState.amoebas];
    
    for (const amoeba of amoebas) {
      // Update amoeba stats
      this.updateAmoebaStats(amoeba, deltaTime);
      
      // Execute behavior
      this.executeAmoebaBehavior(amoeba);
      
      // Remove dead amoebas
      if (amoeba.health <= 0) {
        this.handleAmoebaDeath(amoeba);
        this.removeAmoeba(amoeba.id);
      }
    }
    
    // Update algae system
    this.algaeSystem.update(Date.now());
  }

  private updateAmoebaStats(amoeba: Amoeba, deltaTime: number): void {
    const deltaSeconds = deltaTime / 1000;
    
    // Age the amoeba
    amoeba.age += deltaSeconds;
    
    // Decay energy over time
    amoeba.energy -= this.config.energyDecayRate * deltaSeconds;
    amoeba.energy = Math.max(0, amoeba.energy);
    
    // If energy is 0, start losing health
    if (amoeba.energy <= 0) {
      amoeba.health -= this.config.healthDecayRate * deltaSeconds;
      amoeba.health = Math.max(0, amoeba.health);
    }
    
    // Reduce reproduction cooldown
    if (amoeba.reproductionCooldown > 0) {
      amoeba.reproductionCooldown -= deltaTime;
      amoeba.reproductionCooldown = Math.max(0, amoeba.reproductionCooldown);
    }
  }

  private executeAmoebaBehavior(amoeba: Amoeba): void {
    const species = this.getAmoebaSpecies(amoeba.speciesId);
    if (!species || !species.compiledBehavior) {
      amoeba.lastAction = 'no_behavior';
      return;
    }

    const behavior = species.compiledBehavior;
    
    for (const rule of behavior.rules) {
      if (this.evaluateCondition(rule.condition, amoeba)) {
        this.executeAction(rule.action, amoeba);
        return;
      }
    }
    
    amoeba.lastAction = 'no_action';
  }

  private evaluateCondition(condition: BehaviorCondition, amoeba: Amoeba): boolean {
    switch (condition.type) {
      case 'simple':
        return this.evaluateSimpleCondition(condition.left!, amoeba);
      case 'and':
        return this.evaluateSimpleCondition(condition.left!, amoeba) && 
               this.evaluateSimpleCondition(condition.right!, amoeba);
      case 'or':
        return this.evaluateSimpleCondition(condition.left!, amoeba) || 
               this.evaluateSimpleCondition(condition.right!, amoeba);
      default:
        return false;
    }
  }

  private evaluateSimpleCondition(condition: ConditionCheck, amoeba: Amoeba): boolean {
    switch (condition.type) {
      case 'health':
        return this.compareValue(amoeba.health, condition.operator!, condition.value!);
      case 'energy':
        return this.compareValue(amoeba.energy, condition.operator!, condition.value!);
      case 'age':
        return this.compareValue(amoeba.age, condition.operator!, condition.value!);
      case 'can_reproduce':
        return this.canReproduce(amoeba);
      case 'algae_nearby':
        return this.hasAlgaeNearby(amoeba);
      case 'amoeba_nearby':
        return this.hasAmoebaNearby(amoeba);
      case 'on_algae':
        return this.isOnAlgae(amoeba);
      default:
        return false;
    }
  }

  private compareValue(value: number, operator: string, target: number): boolean {
    switch (operator) {
      case '<': return value < target;
      case '>': return value > target;
      case '=': return Math.abs(value - target) < 0.1;
      default: return false;
    }
  }

  private executeAction(action: { type: string }, amoeba: Amoeba): void {
    switch (action.type) {
      case 'move_to_algae':
        this.moveToAlgae(amoeba);
        break;
      case 'consume_algae':
        this.consumeAlgae(amoeba);
        break;
      case 'reproduce':
        this.reproduce(amoeba);
        break;
      case 'rest':
        this.rest(amoeba);
        break;
      case 'move_random':
        this.moveRandom(amoeba);
        break;
      case 'move_north':
        this.moveDirection(amoeba, 0, -1);
        break;
      case 'move_south':
        this.moveDirection(amoeba, 0, 1);
        break;
      case 'move_east':
        this.moveDirection(amoeba, 1, 0);
        break;
      case 'move_west':
        this.moveDirection(amoeba, -1, 0);
        break;
      default:
        amoeba.lastAction = 'unknown_action';
    }
  }

  // Action implementations
  private moveToAlgae(amoeba: Amoeba): void {
    const nearbyAlgae = this.algaeSystem.findNearbyAlgae(amoeba.x, amoeba.y, this.config.algaeSearchRadius);
    
    if (nearbyAlgae) {
      const dx = nearbyAlgae.x - amoeba.x;
      const dy = nearbyAlgae.y - amoeba.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        const moveX = Math.sign(dx) * Math.min(this.config.baseSpeed, Math.abs(dx));
        const moveY = Math.sign(dy) * Math.min(this.config.baseSpeed, Math.abs(dy));
        
        this.moveAmoeba(amoeba, moveX, moveY);
        amoeba.lastAction = 'move_to_algae';
      }
    } else {
      this.moveRandom(amoeba);
    }
  }

  private consumeAlgae(amoeba: Amoeba): void {
    if (this.isOnAlgae(amoeba)) {
      const consumed = this.algaeSystem.consumeAlgae(amoeba.x, amoeba.y, this.config.algaeConsumptionRate);
      
      if (consumed > 0) {
        amoeba.energy = Math.min(this.config.maxEnergy, amoeba.energy + consumed);
        amoeba.health = Math.min(this.config.maxHealth, amoeba.health + consumed * 0.3);
        amoeba.lastAction = 'consume_algae';
      } else {
        amoeba.lastAction = 'no_algae_to_consume';
      }
    } else {
      amoeba.lastAction = 'not_on_algae';
    }
  }

  private reproduce(amoeba: Amoeba): void {
    if (this.canReproduce(amoeba)) {
      // Find empty space nearby for offspring
      const offspring = this.createOffspring(amoeba);
      
      if (offspring) {
        this.worldState.amoebas.push(offspring);
        
        // Cost reproduction energy
        amoeba.energy -= this.config.reproductionEnergyCost;
        amoeba.reproductionCooldown = this.config.reproductionCooldown;
        
        amoeba.lastAction = 'reproduce';
      } else {
        amoeba.lastAction = 'reproduction_failed';
      }
    } else {
      amoeba.lastAction = 'cannot_reproduce';
    }
  }

  private rest(amoeba: Amoeba): void {
    // Slow energy decay while resting
    const restingBonus = 0.5;
    amoeba.energy = Math.min(this.config.maxEnergy, amoeba.energy + restingBonus);
    amoeba.lastAction = 'rest';
  }

  private moveRandom(amoeba: Amoeba): void {
    const directions = [
      { x: 0, y: -1 },  // North
      { x: 1, y: 0 },   // East
      { x: 0, y: 1 },   // South
      { x: -1, y: 0 }   // West
    ];
    
    const direction = directions[Math.floor(Math.random() * directions.length)];
    this.moveDirection(amoeba, direction.x, direction.y);
    amoeba.lastAction = 'move_random';
  }

  private moveDirection(amoeba: Amoeba, dx: number, dy: number): void {
    this.moveAmoeba(amoeba, dx * this.config.baseSpeed, dy * this.config.baseSpeed);
  }

  private moveAmoeba(amoeba: Amoeba, dx: number, dy: number): void {
    const newX = Math.max(0, Math.min(this.config.worldSize - amoeba.size, amoeba.x + dx));
    const newY = Math.max(0, Math.min(this.config.worldSize - amoeba.size, amoeba.y + dy));
    
    // Check for collisions with other amoebas
    if (!this.isPositionOccupied(newX, newY, amoeba.size, amoeba.id)) {
      amoeba.x = newX;
      amoeba.y = newY;
    }
  }

  // Helper methods
  private canReproduce(amoeba: Amoeba): boolean {
    return amoeba.energy >= this.config.reproductionEnergyThreshold &&
           amoeba.age >= this.config.reproductionAgeThreshold &&
           amoeba.reproductionCooldown <= 0;
  }

  private hasAlgaeNearby(amoeba: Amoeba): boolean {
    return this.algaeSystem.findNearbyAlgae(amoeba.x, amoeba.y, this.config.algaeSearchRadius) !== null;
  }

  private hasAmoebaNearby(amoeba: Amoeba): boolean {
    return this.worldState.amoebas.some(other => 
      other.id !== amoeba.id &&
      Math.sqrt((other.x - amoeba.x) ** 2 + (other.y - amoeba.y) ** 2) <= this.config.amoebaDetectionRadius
    );
  }

  private isOnAlgae(amoeba: Amoeba): boolean {
    return this.algaeSystem.hasAlgae(amoeba.x, amoeba.y);
  }

  private isPositionOccupied(x: number, y: number, size: number, excludeId?: string): boolean {
    return this.worldState.amoebas.some(amoeba => {
      if (excludeId && amoeba.id === excludeId) return false;
      
      return !(x + size <= amoeba.x || 
               x >= amoeba.x + amoeba.size || 
               y + size <= amoeba.y || 
               y >= amoeba.y + amoeba.size);
    });
  }

  private createOffspring(parent: Amoeba): Amoeba | null {
    const species = this.getAmoebaSpecies(parent.speciesId);
    if (!species) return null;

    // Try to find empty space around parent
    for (let attempts = 0; attempts < 8; attempts++) {
      const angle = (attempts * Math.PI * 2) / 8;
      const distance = parent.size + 1;
      const x = Math.round(parent.x + Math.cos(angle) * distance);
      const y = Math.round(parent.y + Math.sin(angle) * distance);

      if (x >= 0 && x < this.config.worldSize - parent.size &&
          y >= 0 && y < this.config.worldSize - parent.size &&
          !this.isPositionOccupied(x, y, parent.size)) {
        
        return {
          id: `offspring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          speciesId: parent.speciesId,
          x,
          y,
          size: parent.size,
          health: this.config.maxHealth * 0.8, // Start with 80% health
          energy: this.config.maxEnergy * 0.6, // Start with 60% energy
          age: 0,
          lastAction: 'born',
          reproductionCooldown: this.config.reproductionCooldown * 0.5 // Half cooldown for offspring
        };
      }
    }

    return null; // No space found
  }

  private getAmoebaSpecies(speciesId: string): AmoebaSpecies | undefined {
    return this.worldState.species.find(s => s.id === speciesId);
  }

  private handleAmoebaDeath(amoeba: Amoeba): void {
    // Amoebas don't leave food when they die (simplified)
    console.log(`Amoeba ${amoeba.id} died at age ${amoeba.age.toFixed(1)} with ${amoeba.energy.toFixed(1)} energy`);
  }

  removeAmoeba(amoebaId: string): void {
    this.worldState.amoebas = this.worldState.amoebas.filter(amoeba => amoeba.id !== amoebaId);
  }
}