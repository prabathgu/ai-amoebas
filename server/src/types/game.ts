export interface AlgaeTile {
  x: number;
  y: number;
  amount: number;
}

export interface Amoeba {
  id: string;
  speciesId: string;
  x: number;
  y: number;
  size: number; // 1, 2, or 3
  health: number;
  energy: number;
  age: number;
  lastAction: string;
  reproductionCooldown: number;
}

export interface AmoebaSpecies {
  id: string;
  name: string;
  createdBy: string;
  size: number;
  color: string;
  behaviorCode: string;
  compiledBehavior: BehaviorTree | null;
  createdAt: number;
  lastModified: number;
}

export interface BehaviorTree {
  rules: BehaviorRule[];
}

export interface BehaviorRule {
  condition: BehaviorCondition;
  action: BehaviorAction;
}

export interface BehaviorCondition {
  type: 'simple' | 'and' | 'or';
  left?: ConditionCheck;
  right?: ConditionCheck;
  operator?: 'and' | 'or';
}

export interface ConditionCheck {
  type: 'health' | 'energy' | 'age' | 'can_reproduce' | 'algae_nearby' | 'amoeba_nearby' | 'on_algae';
  operator?: '<' | '>' | '=';
  value?: number;
}

export interface BehaviorAction {
  type: 'move_to_algae' | 'move_random' | 'consume_algae' | 'reproduce' | 'rest' | 'move_north' | 'move_south' | 'move_east' | 'move_west';
}

export interface WorldState {
  worldId: string;
  amoebas: Amoeba[];
  species: AmoebaSpecies[];
  algaeTiles: AlgaeTile[];
  connectedPlayers: Player[];
  lastUpdate: number;
}

export interface Player {
  userId: string;
  lastSeen: number;
}

export interface GameConfig {
  worldSize: number;
  tileSize: number;
  maxAnimals: number;
  foodRegenRate: number;
  simulationSpeed: number;
}