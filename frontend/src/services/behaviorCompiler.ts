import type { BehaviorTree, BehaviorRule, BehaviorCondition, BehaviorAction, ConditionCheck } from '../types/game';

export class BehaviorCompiler {
  private keywords = {
    conditions: ['health', 'energy', 'age', 'can_reproduce', 'algae_nearby', 'amoeba_nearby', 'on_algae'],
    actions: ['move_to_algae', 'move_random', 'consume_algae', 'reproduce', 'rest', 'move_north', 'move_south', 'move_east', 'move_west'],
    operators: ['<', '>', '='],
    logicalOperators: ['AND', 'OR'],
    keywords: ['IF', 'THEN', 'ELSE']
  };

  compile(code: string): BehaviorTree {
    const lines = this.preprocessCode(code);
    const rules: BehaviorRule[] = [];

    for (const line of lines) {
      if (line.trim() === '') continue;
      
      try {
        const rule = this.parseLine(line);
        if (rule) {
          rules.push(rule);
        }
      } catch (error) {
        throw new Error(`Error parsing line "${line}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { rules };
  }

  private preprocessCode(code: string): string[] {
    // Remove comments
    const withoutComments = code.replace(/\/\/.*$/gm, '');
    
    // Split into lines and clean up
    return withoutComments
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  private parseLine(line: string): BehaviorRule | null {
    const tokens = this.tokenize(line);
    
    if (tokens.length === 0) return null;
    
    // Handle IF-THEN statements
    if (tokens[0].toUpperCase() === 'IF') {
      return this.parseIfThen(tokens);
    }
    
    // Handle ELSE statements
    if (tokens[0].toUpperCase() === 'ELSE') {
      return this.parseElse(tokens);
    }
    
    throw new Error(`Unknown statement type: ${tokens[0]}`);
  }

  private tokenize(line: string): string[] {
    return line.split(/\s+/).filter(token => token.length > 0);
  }

  private parseIfThen(tokens: string[]): BehaviorRule {
    const thenIndex = tokens.findIndex(token => token.toUpperCase() === 'THEN');
    
    if (thenIndex === -1) {
      throw new Error('Missing THEN keyword');
    }
    
    const conditionTokens = tokens.slice(1, thenIndex);
    const actionTokens = tokens.slice(thenIndex + 1);
    
    const condition = this.parseCondition(conditionTokens);
    const action = this.parseAction(actionTokens);
    
    return { condition, action };
  }

  private parseElse(tokens: string[]): BehaviorRule {
    const actionTokens = tokens.slice(1);
    const action = this.parseAction(actionTokens);
    
    // ELSE is equivalent to IF true THEN action
    const condition: BehaviorCondition = {
      type: 'simple',
      left: { type: 'energy', operator: '>', value: -1 } // Always true
    };
    
    return { condition, action };
  }

  private parseCondition(tokens: string[]): BehaviorCondition {
    // Find logical operators
    const andIndex = tokens.findIndex(token => token.toUpperCase() === 'AND');
    const orIndex = tokens.findIndex(token => token.toUpperCase() === 'OR');
    
    if (andIndex !== -1) {
      const leftTokens = tokens.slice(0, andIndex);
      const rightTokens = tokens.slice(andIndex + 1);
      
      return {
        type: 'and',
        left: this.parseSimpleCondition(leftTokens),
        right: this.parseSimpleCondition(rightTokens),
        operator: 'and'
      };
    }
    
    if (orIndex !== -1) {
      const leftTokens = tokens.slice(0, orIndex);
      const rightTokens = tokens.slice(orIndex + 1);
      
      return {
        type: 'or',
        left: this.parseSimpleCondition(leftTokens),
        right: this.parseSimpleCondition(rightTokens),
        operator: 'or'
      };
    }
    
    // Simple condition
    return {
      type: 'simple',
      left: this.parseSimpleCondition(tokens)
    };
  }

  private parseSimpleCondition(tokens: string[]): ConditionCheck {
    if (tokens.length === 1) {
      // Boolean conditions like can_reproduce, food_nearby
      const conditionType = tokens[0].toLowerCase();
      if (this.keywords.conditions.includes(conditionType)) {
        return { type: conditionType as any };
      }
      throw new Error(`Unknown condition: ${conditionType}`);
    }
    
    if (tokens.length === 3) {
      // Comparison conditions like health < 30
      const [conditionType, operator, valueStr] = tokens;
      
      if (!this.keywords.conditions.includes(conditionType.toLowerCase())) {
        throw new Error(`Unknown condition: ${conditionType}`);
      }
      
      if (!this.keywords.operators.includes(operator)) {
        throw new Error(`Unknown operator: ${operator}`);
      }
      
      const value = parseFloat(valueStr);
      if (isNaN(value)) {
        throw new Error(`Invalid number: ${valueStr}`);
      }
      
      return {
        type: conditionType.toLowerCase() as any,
        operator: operator as any,
        value: value
      };
    }
    
    throw new Error(`Invalid condition format: ${tokens.join(' ')}`);
  }

  private parseAction(tokens: string[]): BehaviorAction {
    if (tokens.length !== 1) {
      throw new Error(`Invalid action format: ${tokens.join(' ')}`);
    }
    
    const actionType = tokens[0].toLowerCase();
    if (!this.keywords.actions.includes(actionType)) {
      throw new Error(`Unknown action: ${actionType}`);
    }
    
    return { type: actionType as any };
  }

  validate(code: string): { isValid: boolean; errors: string[] } {
    try {
      this.compile(code);
      return { isValid: true, errors: [] };
    } catch (error) {
      return { isValid: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }
}

export const behaviorCompiler = new BehaviorCompiler();