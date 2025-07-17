# 🦠 AI Amoebas

**A real-time multiplayer simulation where you create and program AI-controlled amoebas using a custom behavior scripting language.**
Created using Claude Code

![AI Amoebas Demo](https://img.shields.io/badge/Status-Live%20Demo-brightgreen) ![React](https://img.shields.io/badge/Frontend-React%20+%20TypeScript-blue) ![Node.js](https://img.shields.io/badge/Backend-Node.js%20+%20Socket.io-green) ![Canvas](https://img.shields.io/badge/Rendering-HTML5%20Canvas-orange)

## 🎮 What is AI Amoebas?

AI Amoebas is a 2D cellular-level ecosystem simulation where players create custom amoeba species and program their behavior using **AnimalScript** - a simple but powerful scripting language. Watch as your programmed amoebas:

- 🍃 Search for and consume algae
- 🔄 Reproduce and create offspring  
- ⚡ Manage energy and health
- 🧠 Execute complex behaviors you design
- 🌍 Compete in a shared real-time world

## 🚀 Features

### 🧬 Custom Species Creation
- Create unique amoeba species with custom colors and sizes
- Program behaviors using the intuitive AnimalScript language
- Choose from behavior templates (Basic, Aggressive, Cautious) or write from scratch

### 🎯 AnimalScript Programming Language
Simple syntax for complex behaviors:
```javascript
// Example: Basic Amoeba Behavior
IF health < 30 AND algae_nearby THEN move_to_algae
IF on_algae THEN consume_algae
IF energy > 70 AND can_reproduce THEN reproduce
IF energy < 20 THEN rest
ELSE move_random
```

### 🌐 Real-time Multiplayer
- Shared world where all players' amoebas interact
- Anonymous user system - no registration required
- Live updates via WebSocket connections
- See other players' species in action

### 🎨 Visual Simulation
- HTML5 Canvas rendering with 60 FPS target
- Amoebas rendered as organic circles with health/energy bars
- Algae visualized as green dots with varying intensity
- Real-time action indicators (A=Move to Algae, C=Consume, R=Reproduce)

### 📊 Advanced Ecosystem
- Dynamic algae regeneration system
- Collision detection and spatial awareness
- Energy management and aging mechanics
- Reproduction with genetic inheritance

## 🛠️ Tech Stack

### Frontend
- **React 19** + **TypeScript** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Socket.io Client** - Real-time communication
- **HTML5 Canvas** - High-performance rendering

### Backend  
- **Node.js** + **Express** - Server framework
- **Socket.io** - WebSocket real-time communication
- **TypeScript** - Type-safe development
- **Custom Game Engine** - Built-in behavior compiler and simulation logic

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ai-amoebas.git
cd ai-amoebas
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

3. **Start the development servers**

**Terminal 1 - Backend:**
```bash
cd server
npm run build
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

4. **Open your browser**
- Navigate to `http://localhost:5173`
- Start creating amoeba species and watch them evolve!

## 🎯 How to Play

### 1. Create Your First Species
- Click **"Create Amoeba Species"**
- Choose a name and color for your species
- Select a behavior template or write custom AnimalScript code
- Set initial population (1-10 amoebas)

### 2. Program Behaviors
Use these **conditions** in your scripts:
- `health < 30` - Check health levels
- `energy > 70` - Check energy levels  
- `algae_nearby` - Detect nearby food
- `amoeba_nearby` - Detect other amoebas
- `on_algae` - Standing on food source
- `can_reproduce` - Ready to reproduce

Use these **actions**:
- `move_to_algae` - Move toward nearest algae
- `consume_algae` - Eat algae at current position
- `reproduce` - Create offspring (costs energy)
- `rest` - Reduce energy decay
- `move_random` - Move in random direction
- `move_north/south/east/west` - Directional movement

### 3. Watch and Learn
- Observe how your amoebas behave in the world
- Click on amoebas to inspect their stats and behavior code
- Refine your strategies based on survival rates
- Experiment with different behavioral patterns

## 📝 AnimalScript Language Reference

### Syntax Structure
```
IF condition THEN action
IF condition AND condition THEN action  
IF condition OR condition THEN action
ELSE action
```

### Example Behaviors

**Aggressive Consumer:**
```javascript
IF algae_nearby THEN move_to_algae
IF on_algae THEN consume_algae
IF energy > 60 AND can_reproduce THEN reproduce
ELSE move_random
```

**Cautious Survivor:**
```javascript
IF energy < 40 AND algae_nearby THEN move_to_algae
IF on_algae THEN consume_algae
IF energy > 80 AND can_reproduce THEN reproduce
IF energy < 30 THEN rest
ELSE move_random
```

## 🏗️ Project Structure

```
ai-amoebas/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── services/        # API and socket services
│   │   ├── types/           # TypeScript definitions
│   │   └── utils/           # Helper functions
│   └── package.json
├── server/                   # Node.js backend
│   ├── src/
│   │   ├── services/        # Behavior compiler
│   │   ├── types/           # Game type definitions
│   │   ├── utils/           # Game logic & world generation
│   │   └── server.ts        # Main server file
│   └── package.json
└── README.md
```

## 🎮 Game Mechanics

### Energy System
- Amoebas start with 100 energy
- Energy decays over time (0.1/second)
- Consuming algae restores energy (+25)
- Reproduction costs energy (-30)

### Health System  
- Amoebas start with 100 health
- Health decays when energy reaches 0
- Consuming algae restores some health
- Amoebas die when health reaches 0

### Reproduction
- Requires energy > 50 and age > 10
- Creates offspring near parent
- Offspring inherit species behavior
- Has cooldown period (60 seconds)

### World Dynamics
- 100x100 grid world
- 25% of tiles spawn with algae initially
- Algae regenerates every 30 seconds
- Real-time simulation at 10 FPS

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🎯 Live Demo

🔗 **[Try AI Amoebas Live](http://localhost:5173)** (when running locally)

---

**Ready to dive into the microscopic world of AI-controlled life?** Clone the repo and start creating your amoeba species today! 🦠✨
