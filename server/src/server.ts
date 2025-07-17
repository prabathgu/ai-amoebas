import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { WorldState, Amoeba } from './types/game';
import { WorldGenerator, defaultGameConfig } from './utils/worldGenerator';
import { behaviorCompiler } from './services/behaviorCompiler';
import { GameLogic } from './utils/gameLogic';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Initialize world
const worldGenerator = new WorldGenerator(defaultGameConfig);
let worldState: WorldState = worldGenerator.generateWorld();
let gameLogic: GameLogic | null = null;

// Test routes
app.get('/api/world', (req, res) => {
  res.json(worldState);
});

app.get('/api/test-compiler', (req, res) => {
  const sampleCode = `
    // Simple Herbivore
    IF health < 30 AND food_nearby THEN move_to_food
    IF on_food THEN eat
    IF energy > 70 AND can_reproduce THEN reproduce
    IF predator_nearby THEN move_away_from_predator
    IF energy < 20 THEN rest
    ELSE move_random
  `;
  
  try {
    const compiledBehavior = behaviorCompiler.compile(sampleCode);
    const validation = behaviorCompiler.validate(sampleCode);
    
    res.json({
      code: sampleCode,
      compiled: compiledBehavior,
      validation
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      code: sampleCode
    });
  }
});

app.post('/api/spawn-test-amoebas', (req, res) => {
  try {
    // Create simple amoeba species
    const basicAmoebaBehavior = `
      IF health < 30 AND algae_nearby THEN move_to_algae
      IF on_algae THEN consume_algae
      IF energy > 70 AND can_reproduce THEN reproduce
      IF energy < 20 THEN rest
      ELSE move_random
    `;
    
    const basicAmoebaSpecies = {
      id: 'basic_amoeba_test',
      name: 'Basic Amoeba',
      createdBy: 'system',
      size: 1,
      color: '#00BCD4',
      behaviorCode: basicAmoebaBehavior,
      compiledBehavior: behaviorCompiler.compile(basicAmoebaBehavior),
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    
    // Create aggressive amoeba species
    const aggressiveAmoebaBehavior = `
      IF algae_nearby THEN move_to_algae
      IF on_algae THEN consume_algae
      IF energy > 60 AND can_reproduce THEN reproduce
      ELSE move_random
    `;
    
    const aggressiveAmoebaSpecies = {
      id: 'aggressive_amoeba_test',
      name: 'Aggressive Amoeba',
      createdBy: 'system',
      size: 1,
      color: '#FF9800',
      behaviorCode: aggressiveAmoebaBehavior,
      compiledBehavior: behaviorCompiler.compile(aggressiveAmoebaBehavior),
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    
    // Add species to world
    worldState.species.push(basicAmoebaSpecies, aggressiveAmoebaSpecies);
    
    // Spawn basic amoebas
    for (let i = 0; i < 5; i++) {
      const x = Math.floor(Math.random() * 100);
      const y = Math.floor(Math.random() * 100);
      
      const amoeba: Amoeba = {
        id: `basic_amoeba_${i}`,
        speciesId: 'basic_amoeba_test',
        x,
        y,
        size: 1,
        health: 100,
        energy: 100,
        age: 0,
        lastAction: 'spawned',
        reproductionCooldown: 0
      };
      
      worldState.amoebas.push(amoeba);
    }
    
    // Spawn aggressive amoebas
    for (let i = 0; i < 3; i++) {
      const x = Math.floor(Math.random() * 100);
      const y = Math.floor(Math.random() * 100);
      
      const amoeba: Amoeba = {
        id: `aggressive_amoeba_${i}`,
        speciesId: 'aggressive_amoeba_test',
        x,
        y,
        size: 1,
        health: 100,
        energy: 100,
        age: 0,
        lastAction: 'spawned',
        reproductionCooldown: 0
      };
      
      worldState.amoebas.push(amoeba);
    }
    
    // Initialize game logic
    gameLogic = new GameLogic(worldState);
    
    res.json({
      success: true,
      message: 'Test amoebas spawned',
      basicAmoebas: 5,
      aggressiveAmoebas: 3,
      totalAmoebas: worldState.amoebas.length
    });
    
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/create-species', (req, res) => {
  try {
    const { name, size, color, behaviorCode, spawnCount } = req.body;
    
    // Validate input
    if (!name || !size || !color || !behaviorCode || !spawnCount) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }
    
    // Compile behavior code
    const compiledBehavior = behaviorCompiler.compile(behaviorCode);
    
    // Create species
    const newSpecies = {
      id: `species_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      createdBy: req.body.createdBy || 'anonymous',
      size: parseInt(size),
      color,
      behaviorCode: behaviorCode.trim(),
      compiledBehavior,
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    
    // Add species to world
    worldState.species.push(newSpecies);
    
    // Spawn amoebas
    const spawnedAmoebas = [];
    for (let i = 0; i < parseInt(spawnCount); i++) {
      // Find a suitable spawn location
      let attempts = 0;
      let x, y;
      
      do {
        x = Math.floor(Math.random() * (100 - size));
        y = Math.floor(Math.random() * (100 - size));
        attempts++;
      } while (attempts < 50 && isLocationOccupied(x, y, size));
      
      if (attempts < 50) {
        const amoeba: Amoeba = {
          id: `${newSpecies.id}_amoeba_${i}`,
          speciesId: newSpecies.id,
          x,
          y,
          size: parseInt(size),
          health: 100,
          energy: 100,
          age: 0,
          lastAction: 'spawned',
          reproductionCooldown: 0
        };
        
        worldState.amoebas.push(amoeba);
        spawnedAmoebas.push(amoeba);
      }
    }
    
    // Initialize or update game logic
    if (!gameLogic) {
      gameLogic = new GameLogic(worldState);
    }
    
    // Broadcast to all connected clients
    io.emit('species-created', newSpecies);
    io.emit('world-state', worldState);
    
    res.json({
      success: true,
      species: newSpecies,
      amoebasSpawned: spawnedAmoebas.length,
      message: `Created "${name}" with ${spawnedAmoebas.length} amoebas`
    });
    
    console.log(`Species created: ${name} (${spawnedAmoebas.length} amoebas)`);
    
  } catch (error) {
    console.error('Error creating species:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to check if location is occupied
function isLocationOccupied(x: number, y: number, size: number): boolean {
  return worldState.amoebas.some(amoeba => {
    const amoebaSize = amoeba.size;
    return !(x + size <= amoeba.x || 
             x >= amoeba.x + amoebaSize || 
             y + size <= amoeba.y || 
             y >= amoeba.y + amoebaSize);
  });
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  
  // Send current world state to new player
  socket.emit('world-state', worldState);
  
  // Handle player joining world
  socket.on('join-world', (data: { worldId: string; userId?: string; userName?: string }) => {
    const { worldId, userId, userName } = data;
    const playerId = userId || socket.id;
    const playerName = userName || `Guest_${socket.id.substring(0, 6)}`;
    
    socket.join(worldId);
    
    // Store user info in socket
    (socket as any).userId = playerId;
    (socket as any).userName = playerName;
    
    // Add player to world state
    const existingPlayerIndex = worldState.connectedPlayers.findIndex(p => p.userId === playerId);
    if (existingPlayerIndex >= 0) {
      // Update existing player
      worldState.connectedPlayers[existingPlayerIndex].lastSeen = Date.now();
    } else {
      // Add new player
      worldState.connectedPlayers.push({
        userId: playerId,
        lastSeen: Date.now()
      });
    }
    
    // Broadcast player joined
    socket.broadcast.emit('player-joined', { userId: playerId, userName: playerName });
    
    console.log(`Player ${playerName} (${playerId}) joined world ${worldId}`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    const userId = (socket as any).userId || socket.id;
    const userName = (socket as any).userName || 'Unknown';
    
    console.log(`Player ${userName} (${userId}) disconnected`);
    
    // Remove player from world state
    worldState.connectedPlayers = worldState.connectedPlayers.filter(
      player => player.userId !== userId
    );
    
    // Broadcast player left
    socket.broadcast.emit('player-left', { userId, userName });
  });
  
  // Handle species creation
  socket.on('create-species', (speciesData) => {
    try {
      const compiledBehavior = behaviorCompiler.compile(speciesData.behaviorCode);
      
      const newSpecies = {
        id: `species_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...speciesData,
        compiledBehavior,
        createdAt: Date.now(),
        lastModified: Date.now()
      };
      
      worldState.species.push(newSpecies);
      
      // Broadcast to all players
      io.emit('species-created', newSpecies);
      
      console.log(`Species created: ${newSpecies.name}`);
    } catch (error) {
      socket.emit('error', `Failed to create species: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
});

// Game loop
let lastUpdate = Date.now();
const gameLoop = () => {
  const currentTime = Date.now();
  const deltaTime = currentTime - lastUpdate;
  lastUpdate = currentTime;
  
  if (gameLogic && worldState.amoebas.length > 0) {
    gameLogic.updateAmoebas(deltaTime);
    
    // Broadcast world state to all connected clients
    io.emit('world-state', worldState);
  }
};

// Start game loop at 10 FPS (100ms intervals)
setInterval(gameLoop, 100);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`World generated with ${worldState.algaeTiles.length} algae tiles`);
  console.log(`Game loop started at 10 FPS`);
});