import React, { useRef, useEffect, useState } from 'react';
import type { WorldState, Amoeba, AmoebaSpecies } from '../types/game';
import { AmoebaInspector } from './AmoebaInspector';

interface WorldCanvasProps {
  worldState: WorldState;
}

export const WorldCanvas: React.FC<WorldCanvasProps> = ({ worldState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedAmoeba, setSelectedAmoeba] = useState<Amoeba | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<AmoebaSpecies | null>(null);
  const canvasSize = 800; // Fixed canvas size
  const worldSize = 100; // World grid size

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with light gray background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw algae
    drawAlgae(ctx, worldState.algaeTiles);

    // Draw amoebas
    drawAmoebas(ctx, worldState.amoebas);

  }, [worldState]);

  const drawAlgae = (ctx: CanvasRenderingContext2D, algaeTiles: any[]) => {
    const scaledTileSize = canvasSize / worldSize;

    algaeTiles.forEach(algae => {
      // Draw algae as green circles with intensity based on amount
      const intensity = Math.min(algae.amount / 100, 1);
      const alpha = 0.3 + intensity * 0.5;
      
      ctx.fillStyle = `rgba(76, 175, 80, ${alpha})`;
      ctx.beginPath();
      ctx.arc(
        algae.x * scaledTileSize + scaledTileSize * 0.5,
        algae.y * scaledTileSize + scaledTileSize * 0.5,
        scaledTileSize * 0.4 * intensity,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Add small center dot for visibility
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.arc(
        algae.x * scaledTileSize + scaledTileSize * 0.5,
        algae.y * scaledTileSize + scaledTileSize * 0.5,
        Math.max(1, scaledTileSize * 0.1),
        0,
        2 * Math.PI
      );
      ctx.fill();
    });
  };

  const drawAmoebas = (ctx: CanvasRenderingContext2D, amoebas: any[]) => {
    const scaledTileSize = canvasSize / worldSize;

    amoebas.forEach(amoeba => {
      const species = worldState.species.find(s => s.id === amoeba.speciesId);
      if (!species) return;

      // Use species color
      const color = species.color || '#00BCD4';

      // Calculate size based on amoeba size
      const amoebaSize = scaledTileSize * 0.7 * amoeba.size;
      const x = amoeba.x * scaledTileSize + (scaledTileSize - amoebaSize) / 2;
      const y = amoeba.y * scaledTileSize + (scaledTileSize - amoebaSize) / 2;

      // Draw amoeba as a circle (more organic than squares)
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(
        x + amoebaSize / 2,
        y + amoebaSize / 2,
        amoebaSize / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Add a slight border for visibility
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw health bar
      const healthBarWidth = amoebaSize;
      const healthBarHeight = 2;
      const healthPercent = amoeba.health / 100;
      
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(x, y - 6, healthBarWidth, healthBarHeight);
      
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(x, y - 6, healthBarWidth * healthPercent, healthBarHeight);

      // Draw energy bar
      const energyPercent = amoeba.energy / 100;
      
      ctx.fillStyle = '#0000FF';
      ctx.fillRect(x, y - 3, healthBarWidth, healthBarHeight);
      
      ctx.fillStyle = '#00FFFF';
      ctx.fillRect(x, y - 3, healthBarWidth * energyPercent, healthBarHeight);

      // Draw action indicator
      if (amoeba.lastAction) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `${Math.max(8, scaledTileSize * 0.3)}px Arial`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        
        const actionChar = getActionChar(amoeba.lastAction);
        const textX = x + amoebaSize / 2;
        const textY = y + amoebaSize / 2 + 3;
        
        ctx.strokeText(actionChar, textX, textY);
        ctx.fillText(actionChar, textX, textY);
      }
    });
  };

  const getActionChar = (action: string): string => {
    switch (action) {
      case 'move_to_algae': return 'A';
      case 'consume_algae': return 'C';
      case 'reproduce': return 'R';
      case 'rest': return 'Z';
      case 'move_random': return '?';
      case 'move_north': return '↑';
      case 'move_south': return '↓';
      case 'move_east': return '→';
      case 'move_west': return '←';
      default: return '•';
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const scaledTileSize = canvasSize / worldSize;
    
    const gridX = Math.floor(x / scaledTileSize);
    const gridY = Math.floor(y / scaledTileSize);

    // Find amoeba at clicked position
    const clickedAmoeba = worldState.amoebas.find(amoeba => {
      const amoebaSize = amoeba.size;
      return gridX >= amoeba.x && gridX < amoeba.x + amoebaSize &&
             gridY >= amoeba.y && gridY < amoeba.y + amoebaSize;
    });

    if (clickedAmoeba) {
      const species = worldState.species.find(s => s.id === clickedAmoeba.speciesId);
      setSelectedAmoeba(clickedAmoeba);
      setSelectedSpecies(species || null);
    }
  };

  return (
    <div className="world-canvas-container">
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{ border: '1px solid #ccc', maxWidth: '100%', height: 'auto', cursor: 'crosshair' }}
        onClick={handleCanvasClick}
      />
      <div className="legend">
        <h3>Legend</h3>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#4CAF50', borderRadius: '50%' }}></div>
          <span>Algae (food source)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#00BCD4', borderRadius: '50%' }}></div>
          <span>Amoeba</span>
        </div>
        <div className="legend-item">
          <div style={{ fontSize: '12px', marginTop: '10px' }}>
            <strong>Action Indicators:</strong><br/>
            A=Move to Algae, C=Consume, R=Reproduce<br/>
            Z=Rest, ?=Random Move, ↑↓←→=Directional
          </div>
        </div>
        <div className="legend-item">
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            <span style={{ color: '#00FF00' }}>Green bar</span> = Health<br/>
            <span style={{ color: '#00FFFF' }}>Cyan bar</span> = Energy
          </div>
        </div>
      </div>
      
      {selectedAmoeba && selectedSpecies && (
        <AmoebaInspector
          amoeba={selectedAmoeba}
          species={selectedSpecies}
          onClose={() => {
            setSelectedAmoeba(null);
            setSelectedSpecies(null);
          }}
        />
      )}
    </div>
  );
};