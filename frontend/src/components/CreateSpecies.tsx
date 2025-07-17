import React, { useState } from 'react';
import { behaviorCompiler } from '../services/behaviorCompiler';
import { BehaviorEditor } from './BehaviorEditor';

interface CreateSpeciesProps {
  onSpeciesCreated: (speciesData: any) => void;
  onClose: () => void;
}

export const CreateSpecies: React.FC<CreateSpeciesProps> = ({ onSpeciesCreated, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    size: 1,
    color: '#00BCD4',
    behaviorCode: `// Simple amoeba behavior template
IF health < 30 AND algae_nearby THEN move_to_algae
IF on_algae THEN consume_algae
IF energy > 70 AND can_reproduce THEN reproduce
IF energy < 20 THEN rest
ELSE move_random`,
    spawnCount: 3
  });

  const [validation, setValidation] = useState<{
    isValid: boolean;
    errors: string[];
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultBehaviors = {
    basic: `// Basic amoeba behavior
IF health < 30 AND algae_nearby THEN move_to_algae
IF on_algae THEN consume_algae
IF energy > 70 AND can_reproduce THEN reproduce
IF energy < 20 THEN rest
ELSE move_random`,
    
    aggressive: `// Aggressive amoeba behavior
IF algae_nearby THEN move_to_algae
IF on_algae THEN consume_algae
IF energy > 60 AND can_reproduce THEN reproduce
ELSE move_random`,
    
    cautious: `// Cautious amoeba behavior
IF energy < 40 AND algae_nearby THEN move_to_algae
IF on_algae THEN consume_algae
IF energy > 80 AND can_reproduce THEN reproduce
IF energy < 30 THEN rest
ELSE move_random`
  };

  const validateBehavior = (): boolean => {
    try {
      const result = behaviorCompiler.validate(formData.behaviorCode);
      setValidation(result);
      return result.isValid;
    } catch (error) {
      setValidation({
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown validation error']
      });
      return false;
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation when behavior code changes
    if (field === 'behaviorCode') {
      setValidation(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBehavior()) {
      alert('Please fix behavior code errors before creating species');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSpeciesCreated(formData);
      onClose();
    } catch (error) {
      console.error('Error creating species:', error);
      alert('Failed to create species. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadTemplate = (template: keyof typeof defaultBehaviors) => {
    handleInputChange('behaviorCode', defaultBehaviors[template]);
  };

  return (
    <div className="create-species-overlay">
      <div className="create-species-modal">
        <div className="modal-header">
          <h2>Create Amoeba Species</h2>
          <button onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="species-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Species Name:</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Explorer Amoeba"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="color">Color:</label>
              <input
                type="color"
                id="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="size">Size:</label>
              <select
                id="size"
                value={formData.size}
                onChange={(e) => handleInputChange('size', parseInt(e.target.value))}
              >
                <option value={1}>Small (1x1)</option>
                <option value={2}>Medium (2x2)</option>
                <option value={3}>Large (3x3)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="spawnCount">Initial Population:</label>
              <input
                type="number"
                id="spawnCount"
                value={formData.spawnCount}
                onChange={(e) => handleInputChange('spawnCount', parseInt(e.target.value))}
                min="1"
                max="10"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Behavior Templates:</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button type="button" onClick={() => loadTemplate('basic')}>Basic</button>
              <button type="button" onClick={() => loadTemplate('aggressive')}>Aggressive</button>
              <button type="button" onClick={() => loadTemplate('cautious')}>Cautious</button>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="behaviorCode">Behavior Code:</label>
            <BehaviorEditor
              code={formData.behaviorCode}
              onChange={(code) => handleInputChange('behaviorCode', code)}
              validation={validation}
              onValidate={validateBehavior}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button 
              type="submit" 
              className="create-btn"
              disabled={isSubmitting || (validation !== null && !validation.isValid)}
            >
              {isSubmitting ? 'Creating...' : 'Create Species'}
            </button>
          </div>
        </form>
        
        <div className="behavior-help">
          <h3>Amoeba Behavior Language</h3>
          <div className="help-content">
            <div className="help-column">
              <h5>Conditions:</h5>
              <p><code>health &lt; 30</code> - Health level check</p>
              <p><code>energy &gt; 70</code> - Energy level check</p>
              <p><code>age = 100</code> - Age check</p>
              <p><code>algae_nearby</code> - Algae within search radius</p>
              <p><code>amoeba_nearby</code> - Other amoebas nearby</p>
              <p><code>on_algae</code> - Standing on algae</p>
              <p><code>can_reproduce</code> - Ready to reproduce</p>
            </div>
            <div className="help-column">
              <h5>Actions:</h5>
              <p><code>move_to_algae</code> - Move towards nearest algae</p>
              <p><code>consume_algae</code> - Consume algae at current position</p>
              <p><code>reproduce</code> - Create offspring</p>
              <p><code>rest</code> - Slow energy decay</p>
              <p><code>move_random</code> - Move in random direction</p>
              <p><code>move_north/south/east/west</code> - Directional movement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};