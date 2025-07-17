import React, { useState } from 'react';
import { behaviorCompiler } from '../services/behaviorCompiler';
import { BehaviorEditor } from './BehaviorEditor';

export const CompilerTest: React.FC = () => {
  const [code, setCode] = useState(`// Simple Herbivore
IF health < 30 AND food_nearby THEN move_to_food
IF on_food THEN eat
IF energy > 70 AND can_reproduce THEN reproduce
IF predator_nearby THEN move_away_from_predator
IF energy < 20 THEN rest
ELSE move_random`);

  const [result, setResult] = useState<any>(null);
  const [serverResult, setServerResult] = useState<any>(null);

  const testCompiler = () => {
    try {
      const validation = behaviorCompiler.validate(code);
      const compiled = behaviorCompiler.compile(code);
      
      setResult({
        validation,
        compiled,
        error: null
      });
    } catch (error) {
      setResult({
        validation: null,
        compiled: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const testServerCompiler = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/test-compiler');
      const data = await response.json();
      setServerResult(data);
    } catch (error) {
      setServerResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return (
    <div className="compiler-test">
      <h2>AnimalScript Compiler Test</h2>
      
      <div className="editor-section">
        <BehaviorEditor
          code={code}
          onChange={setCode}
          height={300}
        />
      </div>

      <div className="buttons">
        <button onClick={testCompiler}>Test Client Compiler</button>
        <button onClick={testServerCompiler}>Test Server Compiler</button>
      </div>

      {result && (
        <div className="result-section">
          <h3>Client Compiler Result</h3>
          {result.error ? (
            <div className="error">
              <strong>Error:</strong> {result.error}
            </div>
          ) : (
            <div className="success">
              <div className="validation">
                <strong>Validation:</strong> {result.validation.isValid ? '✅ Valid' : '❌ Invalid'}
                {result.validation.errors.length > 0 && (
                  <ul>
                    {result.validation.errors.map((error: string, i: number) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="compiled">
                <strong>Compiled Behavior Tree:</strong>
                <pre>{JSON.stringify(result.compiled, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {serverResult && (
        <div className="result-section">
          <h3>Server Compiler Result</h3>
          {serverResult.error ? (
            <div className="error">
              <strong>Error:</strong> {serverResult.error}
            </div>
          ) : (
            <div className="success">
              <div className="validation">
                <strong>Validation:</strong> {serverResult.validation.isValid ? '✅ Valid' : '❌ Invalid'}
              </div>
              <div className="compiled">
                <strong>Compiled Behavior Tree:</strong>
                <pre>{JSON.stringify(serverResult.compiled, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};