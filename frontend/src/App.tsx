import React, { useState, useEffect } from 'react';
import type { WorldState } from './types/game';
import { WorldCanvas } from './components/WorldCanvas';
import { CompilerTest } from './components/CompilerTest';
import { CreateSpecies } from './components/CreateSpecies';
import { io, type Socket } from 'socket.io-client';
import { getUserId, getUserName, getSessionInfo } from './utils/userIdentity';
import './App.css';

const App: React.FC = () => {
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'world' | 'compiler'>('world');
  const [showCreateSpecies, setShowCreateSpecies] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userName] = useState(getUserName());
  const [sessionInfo] = useState(getSessionInfo());

  useEffect(() => {
    // Connect to server
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      newSocket.emit('join-world', {
        worldId: 'shared_world',
        userId: getUserId(),
        userName: getUserName()
      });
      
      // Fetch initial world state
      fetchWorldState();
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('world-state', (state: WorldState) => {
      console.log('Received world state:', state);
      setWorldState(state);
    });

    newSocket.on('error', (message: string) => {
      console.error('Server error:', message);
      alert(`Server error: ${message}`);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchWorldState = async () => {
    setIsRefreshing(true);
    try {
      console.log('Fetching world state...');
      const response = await fetch('http://localhost:3001/api/world');
      const data = await response.json();
      console.log('World state fetched:', { amoebas: data.amoebas?.length, algae: data.algaeTiles?.length, species: data.species?.length });
      setWorldState(data);
      
      // Force a re-render by updating the state with a new object reference
      setWorldState({...data, lastUpdate: Date.now()});
      
      alert(`World refreshed! Amoebas: ${data.amoebas?.length || 0}, Algae: ${data.algaeTiles?.length || 0}, Species: ${data.species?.length || 0}`);
    } catch (error) {
      console.error('Failed to fetch world state:', error);
      alert('Failed to refresh world state. Check console for details.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const spawnTestAmoebas = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/spawn-test-amoebas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Test amoebas spawned:', data);
      alert(`Spawned ${data.basicAmoebas} basic amoebas and ${data.aggressiveAmoebas} aggressive amoebas!`);
    } catch (error) {
      console.error('Failed to spawn test amoebas:', error);
      alert('Failed to spawn test amoebas. Check console for details.');
    }
  };

  const handleCreateSpecies = async (speciesData: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/create-species', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...speciesData,
          createdBy: getUserId()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Species created:', result);
      alert(`Successfully created "${speciesData.name}" with ${speciesData.spawnCount} amoebas!`);
      
      // Refresh world state to show new animals
      fetchWorldState();
    } catch (error) {
      console.error('Failed to create species:', error);
      throw error;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Amoebas - Test Interface</h1>
        <div className="header-info">
          <div className="user-info">
            <span>👤 {userName}</span>
            {sessionInfo.isNewUser && <span className="new-user-badge">New!</span>}
            <span className="session-info">Session #{sessionInfo.sessionCount}</span>
          </div>
          <div className="status">
            Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            {worldState && (
              <span> | Algae: {worldState.algaeTiles.length} | Species: {worldState.species.length} | Amoebas: {worldState.amoebas.length}</span>
            )}
          </div>
        </div>
      </header>

      <nav className="tabs">
        <button 
          className={activeTab === 'world' ? 'active' : ''}
          onClick={() => setActiveTab('world')}
        >
          World View
        </button>
        <button 
          className={activeTab === 'compiler' ? 'active' : ''}
          onClick={() => setActiveTab('compiler')}
        >
          Compiler Test
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'world' && (
          <div className="world-tab">
            <div className="controls">
              <button onClick={fetchWorldState} disabled={isRefreshing}>
                {isRefreshing ? 'Refreshing...' : 'Refresh World'}
              </button>
              <button onClick={spawnTestAmoebas}>Spawn Test Amoebas</button>
              <button onClick={() => setShowCreateSpecies(true)}>Create Amoeba Species</button>
            </div>
            {worldState ? (
              <WorldCanvas worldState={worldState} />
            ) : (
              <div className="loading">Loading world...</div>
            )}
          </div>
        )}
        
        {activeTab === 'compiler' && (
          <CompilerTest />
        )}
      </main>

      {showCreateSpecies && (
        <CreateSpecies
          onSpeciesCreated={handleCreateSpecies}
          onClose={() => setShowCreateSpecies(false)}
        />
      )}
    </div>
  );
};

export default App
