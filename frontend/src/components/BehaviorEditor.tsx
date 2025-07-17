import React, { useState, useRef, useEffect } from 'react';

interface BehaviorEditorProps {
  code: string;
  onChange: (code: string) => void;
  validation?: {
    isValid: boolean;
    errors: string[];
  } | null;
  onValidate?: () => void;
  readOnly?: boolean;
  height?: number;
}

export const BehaviorEditor: React.FC<BehaviorEditorProps> = ({
  code,
  onChange,
  validation,
  onValidate,
  readOnly = false,
  height = 200
}) => {
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    updateLineNumbers();
  }, [code]);

  const updateLineNumbers = () => {
    const lines = code.split('\n');
    setLineNumbers(lines.map((_, index) => index + 1));
  };

  const handleCodeChange = (newCode: string) => {
    onChange(newCode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      handleCodeChange(newCode);
      
      // Restore cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="behavior-editor-container">
      <div className="editor-header">
        <div className="editor-title">
          <h4>Behavior Code</h4>
          {validation && (
            <span className={`validation-indicator ${validation.isValid ? 'valid' : 'invalid'}`}>
              {validation.isValid ? '✓' : '✗'}
            </span>
          )}
        </div>
        <div className="editor-actions">
          {onValidate && (
            <button type="button" onClick={onValidate} className="validate-btn">
              Validate
            </button>
          )}
        </div>
      </div>

      <div className="editor-body">
        <div className="line-numbers">
          {lineNumbers.map((num) => (
            <div key={num} className="line-number">
              {num}
            </div>
          ))}
        </div>
        
        <textarea
          ref={textareaRef}
          className="code-textarea"
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          style={{ height: `${height}px` }}
          placeholder="// Write your amoeba behavior code here..."
          spellCheck={false}
        />
      </div>

      {validation && !validation.isValid && (
        <div className="validation-errors">
          <div className="error-header">Validation Errors:</div>
          <ul>
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="editor-help">
        <div className="help-section">
          <strong>Syntax:</strong> IF condition THEN action | ELSE action
        </div>
      </div>
    </div>
  );
};