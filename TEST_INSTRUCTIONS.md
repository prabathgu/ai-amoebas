# AI Animal World Game - Test Instructions

## 🚀 How to Run the Test

### Quick Start
```bash
./start-test.sh
```

### Manual Start
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd frontend  
npm run dev
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## 🧪 Test Scenarios

### 1. Basic World Visualization
- Open the frontend in your browser
- You should see a 100x100 grid world with:
  - **Dark Green**: Forest terrain (slow movement)
  - **Light Green**: Grassland terrain (normal movement)  
  - **Brown**: Barren terrain (fast movement)
  - **Green Squares**: Plant food scattered throughout

### 2. Spawn Test Animals
- Click **"Spawn Test Animals"** button
- This creates:
  - **5 Herbivores** (green squares)
  - **2 Carnivores** (red squares)
  - Each with compiled behavior code

### 3. Watch the Simulation
- Animals should start moving and executing behaviors:
  - **Health bars** (red/green) above each animal
  - **Energy bars** (blue/cyan) above each animal
  - **Action indicators** (letters in animal centers)

### 4. Test Animal Inspector
- **Click any animal** to open the Animal Inspector
- View detailed stats:
  - Health, Energy, Age, Position
  - Diet type, reproduction status
  - Current behavior code
- Close with the "×" button

### 5. Test Behavior Compiler
- Switch to **"Compiler Test"** tab
- Edit the sample AnimalScript code
- Click **"Test Client Compiler"** or **"Test Server Compiler"**
- See the compiled behavior tree

## 🔍 What to Look For

### Expected Behaviors

#### Herbivores (Green)
- Move toward **green food squares**
- **Eat** when on food (health/energy increase)
- **Rest** when low energy
- **Reproduce** when energy > 70 and age > 10
- **Flee** from carnivores when nearby
- **Random movement** otherwise

#### Carnivores (Red)
- Hunt **herbivores** when nearby
- **Eat meat** (brown circles from dead animals)
- **Rest** when low energy
- **Reproduce** when energy > 80 and age > 10
- **Random movement** otherwise

#### Food System
- **Plant food regenerates** every 30 seconds
- **Meat appears** when animals die
- **Food intensity** varies by amount

#### Real-time Features
- Animals move and act every 100ms
- World state broadcasts to all clients
- Socket.io connection status indicator

## 🐛 Debugging

### Check Browser Console
- Open Developer Tools (F12)
- Look for connection status logs
- Any errors will appear here

### Check Server Logs
- Server terminal shows:
  - Player connections/disconnections
  - Animal spawning events
  - Game loop status

### API Endpoints for Testing
- `GET /api/world` - Get current world state
- `GET /api/test-compiler` - Test behavior compiler
- `POST /api/spawn-test-animals` - Spawn test animals

## 🎮 Interactive Testing

1. **Population Dynamics**: Watch herbivore vs carnivore balance
2. **Food Scarcity**: See what happens when food runs low
3. **Reproduction**: Wait for animals to age and reproduce
4. **Death and Decay**: Low energy animals should die and become meat
5. **Behavior Modification**: Edit behavior code and test changes

## ⚡ Performance Notes

- **Target**: 60 FPS rendering, 10 FPS simulation
- **Optimized for**: 100+ animals simultaneously
- **Memory efficient**: Spatial partitioning for collisions
- **Real-time**: Sub-100ms behavior execution

The system should demonstrate a fully functional ecosystem with emergent behaviors from simple rules!