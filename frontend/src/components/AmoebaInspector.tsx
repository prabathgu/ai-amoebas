import React from 'react';
import type { Amoeba, AmoebaSpecies } from '../types/game';

interface AmoebaInspectorProps {
  amoeba: Amoeba;
  species: AmoebaSpecies;
  onClose: () => void;
}

export const AmoebaInspector: React.FC<AmoebaInspectorProps> = ({ amoeba, species, onClose }) => {
  return (
    <div className="animal-inspector">
      <div className="inspector-header">
        <h3>Amoeba Inspector</h3>
        <button onClick={onClose}>×</button>
      </div>
      
      <div className="inspector-content">
        <div className="animal-info">
          <h4>{species.name}</h4>
          
          <div className="stats-grid">
            <div className="stat">
              <label>Health:</label>
              <div className="stat-bar">
                <div 
                  className="stat-fill health" 
                  style={{ width: `${amoeba.health}%` }}
                ></div>
                <span>{Math.round(amoeba.health)}/100</span>
              </div>
            </div>
            
            <div className="stat">
              <label>Energy:</label>
              <div className="stat-bar">
                <div 
                  className="stat-fill energy" 
                  style={{ width: `${amoeba.energy}%` }}
                ></div>
                <span>{Math.round(amoeba.energy)}/100</span>
              </div>
            </div>
            
            <div className="stat">
              <label>Age:</label>
              <span>{amoeba.age.toFixed(1)} cycles</span>
            </div>
            
            <div className="stat">
              <label>Size:</label>
              <span>{amoeba.size}</span>
            </div>
            
            <div className="stat">
              <label>Position:</label>
              <span>({amoeba.x}, {amoeba.y})</span>
            </div>
            
            <div className="stat">
              <label>Last Action:</label>
              <span>{amoeba.lastAction}</span>
            </div>
            
            <div className="stat">
              <label>Reproduction Cooldown:</label>
              <span>{amoeba.reproductionCooldown > 0 ? `${Math.round(amoeba.reproductionCooldown / 1000)}s` : 'Ready'}</span>
            </div>
          </div>
        </div>
        
        <div className="behavior-info">
          <h4>Behavior Code</h4>
          <div className="behavior-code">
            {species.behaviorCode}
          </div>
        </div>
        
        <div className="species-info" style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
          <div><strong>Species ID:</strong> {species.id}</div>
          <div><strong>Created by:</strong> {species.createdBy}</div>
          <div><strong>Color:</strong> <span style={{ backgroundColor: species.color, padding: '2px 8px', borderRadius: '3px', color: 'white' }}>{species.color}</span></div>
        </div>
      </div>
    </div>
  );
};