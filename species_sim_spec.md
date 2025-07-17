# AI Animal World Game Specification

## Project Overview
A 2D web-based simulation game where players create and manage AI-controlled animal species using a simple behavior programming language. Each species follows custom behavior code that determines how they move, eat, and reproduce in a dynamic ecosystem.

## Core Game Mechanics

### Game World
- **Grid System**: 100x100 tile grid
- **Tile Size**: 10x10 pixels (adjustable later)
- **Terrain Types**:
  - Forest (slow movement, herbivore food)
  - Grassland (normal movement, herbivore food)
  - Barren (fast movement, no food)
- **Food Regeneration**: Food tiles regrow over time (configurable rate)

### Animal Species System
- **Size Range**: 1x1 to 3x3 tiles (square shapes only)
- **Diet Types**: Herbivore, Carnivore, Omnivore
- **Population**: Multiple animals per species
- **Spawning**: New animals spawn when species is created

### Animal Stats
Each animal has the following stats:
- **Health**: 0-100 (death at 0)
- **Energy**: 0-100 (affects movement speed, reproduction ability)
- **Age**: Increases over time, affects reproduction
- **Size**: Determines tile occupation (1x1, 2x2, or 3x3)
- **Diet Type**: Determines valid food sources

## Behavior Programming Language: "AnimalScript"

### Language Overview
A simple, declarative language using if/then conditions for animal behavior.

### Basic Syntax
```
IF condition THEN action
IF condition AND condition THEN action
IF condition OR condition THEN action
```

### Built-in Conditions
- `health < X` / `health > X` - Health level checks
- `energy < X` / `energy > X` - Energy level checks
- `age < X` / `age > X` - Age checks
- `can_reproduce` - True if energy > 50 and age > 10
- `food_nearby` - Food within 3 tiles
- `animal_nearby` - Any animal within 3 tiles
- `predator_nearby` - Carnivore/omnivore within 5 tiles (for herbivores)
- `prey_nearby` - Herbivore within 5 tiles (for carnivores/omnivores)
- `on_food` - Standing on food tile
- `in_forest` / `in_grassland` / `in_barren` - Terrain type checks

### Built-in Actions
- `move_to_food` - Move toward nearest food
- `move_to_prey` - Move toward nearest prey (carnivores/omnivores only)
- `move_away_from_predator` - Move away from nearest threat
- `move_random` - Move in random direction
- `eat` - Consume food if on food tile
- `reproduce` - Create offspring (costs energy)
- `rest` - Stay still, slowly recover energy
- `move_north` / `move_south` / `move_east` / `move_west` - Directional movement

### Built-in Functions
- `distance_to_food` - Returns distance to nearest food
- `distance_to_prey` - Returns distance to nearest prey
- `distance_to_predator` - Returns distance to nearest predator
- `terrain_type` - Returns current terrain type

### Sample Behavior Code
```
// Simple Herbivore
IF health < 30 AND food_nearby THEN move_to_food
IF on_food THEN eat
IF energy > 70 AND can_reproduce THEN reproduce
IF predator_nearby THEN move_away_from_predator
IF energy < 20 THEN rest
ELSE move_random

// Simple Carnivore
IF health < 40 AND prey_nearby THEN move_to_prey
IF on_prey THEN eat
IF energy > 80 AND can_reproduce THEN reproduce
IF energy < 30 THEN rest
ELSE move_random
```

## Technical Implementation Requirements

### Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + Socket.io
- **Database**: MongoDB Atlas (free tier)
- **Hosting**: 
  - Frontend: Vercel (free tier)
  - Backend: Railway (free tier)
  - Database: MongoDB Atlas (free tier)

### Frontend Framework
- **Technology**: HTML5 Canvas for rendering, React for UI
- **Rendering**: 60 FPS target, optimized for 100+ animals
- **UI Framework**: React with TypeScript

### Multiplayer Architecture (Phase 1)

#### Anonymous User System
- **User Identification**: Anonymous UUID stored in localStorage
- **Session Management**: Persistent identity across browser sessions
- **No Registration**: Players can join immediately without accounts

```javascript
// Generate persistent anonymous ID
const getUserId = () => {
  let userId = localStorage.getItem('animalworld_user_id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('animalworld_user_id', userId);
  }
  return userId;
};
```

#### Single Shared World
- **World State**: One global world shared by all players
- **Species Ownership**: Players can edit any species (simple permissions)
- **Real-time Updates**: All changes broadcast to connected players

### Game Loop
1. **Update Phase**: Process all animal behaviors
2. **Render Phase**: Draw world, animals, UI
3. **Input Phase**: Handle user interactions
4. **Simulation Phase**: Update stats, spawn food, handle reproduction

### Data Structures

#### World State (Server & Client)
```javascript
{
  worldId: "shared_world",
  grid: Array<Array<TerrainType>>, // 100x100 grid
  animals: Array<Animal>,
  species: Array<Species>,
  foodTiles: Array<{x: number, y: number, amount: number}>,
  connectedPlayers: Array<{userId: string, lastSeen: timestamp}>
}
```

#### Animal Object
```javascript
{
  id: string,
  speciesId: string,
  x: number,
  y: number,
  size: number, // 1, 2, or 3
  health: number,
  energy: number,
  age: number,
  lastAction: string
}
```

#### Species Object
```javascript
{
  id: string,
  name: string,
  createdBy: string, // Anonymous UUID
  dietType: 'herbivore' | 'carnivore' | 'omnivore',
  size: number,
  color: string,
  behaviorCode: string,
  compiledBehavior: BehaviorTree,
  createdAt: timestamp,
  lastModified: timestamp
}
```

### Movement System
- **Speed Calculation**: Base speed × terrain modifier × energy modifier
- **Terrain Modifiers**:
  - Forest: 0.5x speed
  - Grassland: 1.0x speed
  - Barren: 1.5x speed
- **Energy Modifier**: (energy / 100) × 0.5 + 0.5 (50% to 100% speed)
- **Collision Detection**: Animals cannot overlap, must find alternate routes

### Food System
- **Food Types**:
  - Plant food (forest/grassland tiles)
  - Meat food (from dead animals)
- **Regeneration**: Plant food regrows every 30 seconds
- **Consumption**: Eating restores 20-30 health/energy

### Reproduction System
- **Requirements**: Energy > 50, Age > 10
- **Cost**: 30 energy to parent
- **Offspring**: Spawns near parent with 50 health, 50 energy, 0 age
- **Cooldown**: 60 seconds between reproductions

## User Interface Requirements

### Main Game View
- **Canvas**: 1000x1000 pixel main viewport
- **Zoom/Pan**: Mouse controls for navigation
- **Info Panel**: Shows selected animal stats
- **Species List**: Sidebar with all species and population counts

### Code Editor
- **Trigger**: Click any animal to edit its species behavior
- **Editor**: Syntax-highlighted text editor
- **Validation**: Real-time syntax checking
- **Apply**: Button to update behavior (affects all animals of that species)
- **Templates**: Pre-made behavior examples

### Species Creation
- **Form Fields**:
  - Species name
  - Diet type selection
  - Size selection (1x1, 2x2, 3x3)
  - Color picker
  - Initial behavior code
- **Spawn Count**: Number of initial animals (1-10)

### Debug Tools
- **Animal Inspector**: Shows current action, target, internal state
- **Behavior Tracer**: Step-by-step execution of behavior code
- **Performance Monitor**: FPS, animal count, update times

## Performance Considerations

### Optimization Targets
- **Animal Count**: Support 200+ animals simultaneously
- **Frame Rate**: Maintain 60 FPS with 100 animals
- **Memory**: Efficient data structures for large populations

### Optimization Strategies
- **Spatial Partitioning**: Grid-based lookup for nearby animals/food
- **Behavior Caching**: Compile behavior code once, reuse execution
- **Rendering Optimization**: Only draw visible tiles, sprite batching
- **Update Throttling**: Stagger behavior updates across frames

## File Structure Recommendations

### Frontend (React + TypeScript)
```
src/
├── components/
│   ├── Game/
│   │   ├── GameCanvas.tsx (main game rendering)
│   │   ├── AnimalInspector.tsx (selected animal info)
│   │   └── WorldStats.tsx (world statistics)
│   ├── UI/
│   │   ├── SpeciesList.tsx (species sidebar)
│   │   ├── CodeEditor.tsx (behavior editor)
│   │   └── CreateSpecies.tsx (species creation form)
│   └── shared/
│       ├── Button.tsx
│       └── Modal.tsx
├── hooks/
│   ├── useSocket.ts (Socket.io connection)
│   ├── useGameLoop.ts (animation frame loop)
│   └── useAnimalBehavior.ts (behavior execution)
├── services/
│   ├── socketService.ts (Socket.io client)
│   ├── gameEngine.ts (core game logic)
│   └── behaviorCompiler.ts (AnimalScript parser)
├── types/
│   ├── game.ts (game state types)
│   ├── animal.ts (animal types)
│   └── socket.ts (socket event types)
├── utils/
│   ├── spatialGrid.ts (spatial partitioning)
│   ├── userIdentity.ts (anonymous UUID management)
│   └── gameLogic.ts (movement, reproduction, etc.)
└── App.tsx
```

### Backend (Node.js + Express)
```
server/
├── src/
│   ├── routes/
│   │   ├── world.ts (world state endpoints)
│   │   └── species.ts (species CRUD endpoints)
│   ├── services/
│   │   ├── gameSimulation.ts (server-side game loop)
│   │   ├── worldManager.ts (world state management)
│   │   └── behaviorEngine.ts (behavior execution)
│   ├── models/
│   │   ├── World.ts (MongoDB world schema)
│   │   ├── Species.ts (MongoDB species schema)
│   │   └── Animal.ts (MongoDB animal schema)
│   ├── middleware/
│   │   └── auth.ts (anonymous user validation)
│   ├── socket/
│   │   └── gameEvents.ts (Socket.io event handlers)
│   └── utils/
│       ├── database.ts (MongoDB connection)
│       └── gameLogic.ts (shared game logic)
├── package.json
└── server.ts
```

## Deployment Guide

### Prerequisites
- Node.js 18+ installed
- Git repository created
- MongoDB Atlas account (free tier)

### Step 1: MongoDB Atlas Setup
1. Create free MongoDB Atlas cluster
2. Create database user with read/write permissions
3. Add IP address 0.0.0.0/0 to network access (for Railway)
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/animalworld`

### Step 2: Backend Deployment (Railway)
1. Connect Railway to your Git repository
2. Deploy from `/server` folder
3. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `PORT`: 3001 (Railway will override)
   - `NODE_ENV`: production
   - `CORS_ORIGIN`: Your Vercel frontend URL
4. Railway will auto-deploy on git push

### Step 3: Frontend Deployment (Vercel)
1. Connect Vercel to your Git repository
2. Set build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variables:
   - `VITE_API_URL`: Your Railway backend URL
   - `VITE_SOCKET_URL`: Your Railway backend URL
4. Vercel will auto-deploy on git push

### Step 4: Environment Variables

#### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/animalworld
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-game.vercel.app
```

#### Frontend (.env)
```
VITE_API_URL=https://your-backend.railway.app
VITE_SOCKET_URL=https://your-backend.railway.app
```

### Step 5: Domain Setup (Optional)
- Configure custom domain in Vercel
- Update CORS_ORIGIN environment variable
- SSL certificates handled automatically

## Extension Points for Future Phases

### Phase 2: Multiple Worlds
- World creation/joining interface
- World-specific permissions
- URL-based world access

### Phase 3: Enhanced Multiplayer
- Proper user accounts (optional)
- Species sharing/trading
- Advanced collaboration tools

### Phase 4: Advanced Features
- Save/load world states
- World templates
- Mobile responsive design

## Testing Requirements

### Unit Tests
- Behavior compiler and executor
- Movement and collision systems
- Food and reproduction systems

### Integration Tests
- Full game loop with multiple species
- UI interactions and state updates
- Performance benchmarks

### User Testing
- Behavior language usability
- UI/UX for species creation and editing
- Performance with realistic animal counts

## Success Metrics

### Technical Metrics
- Stable 60 FPS with 100+ animals
- Behavior compilation time < 100ms
- Memory usage < 100MB

### User Experience Metrics
- Time to create first functional species < 5 minutes
- Behavior language learning curve
- Engagement with ecosystem dynamics

This specification provides a solid foundation for implementation while maintaining flexibility for future enhancements.