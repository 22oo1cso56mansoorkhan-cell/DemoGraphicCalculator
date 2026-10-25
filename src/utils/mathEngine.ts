/**
 * GraphLab Advanced Mathematical Engine
 * Safe Tokenizer, AST/RPN Parser, Variable Resolver, Function Sampler,
 * Implicit Curve Marching Squares, and Linear Regression.
 * Zero eval() / Zero new Function().
 */

export interface Token {
  type: 'NUMBER' | 'IDENTIFIER' | 'OPERATOR' | 'LPAREN' | 'RPAREN' | 'COMMA' | 'RELATION';
  value: string;
}

export type Scope = Record<string, number>;

export type AngleMode = 'radians' | 'degrees';

export interface ParsedExpression {
  raw: string;
  type: 'variable' | 'point' | 'function' | 'implicit' | 'inequality' | 'value' | 'unknown';
  variableName?: string;
  variableValue?: number;
  pointCoord?: { x: number; y: number };
  pointLabel?: string;
  targetVar?: string; // 'y' for standard y = f(x)
  rpn?: Token[];
  // For implicit F(x, y) = 0 or inequality F(x, y) < 0
  implicitRpn?: Token[];
  relation?: '=' | '<' | '<=' | '>' | '>=';
  error?: string;
}

const OPERATOR_PRECEDENCE: Record<string, { precedence: number; associativity: 'LEFT' | 'RIGHT' }> = {
  '+': { precedence: 2, associativity: 'LEFT' },
  '-': { precedence: 2, associativity: 'LEFT' },
  '*': { precedence: 3, associativity: 'LEFT' },
  '/': { precedence: 3, associativity: 'LEFT' },
  '%': { precedence: 3, associativity: 'LEFT' },
  '^': { precedence: 4, associativity: 'RIGHT' },
  'u-': { precedence: 5, associativity: 'RIGHT' }, // Unary minus
};

const MATH_FUNCTIONS = new Set([
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'sqrt',
  'abs',
  'log',
  'log10',
  'ln',
  'exp',
  'floor',
  'ceil',
  'round',
  'min',
  'max',
]);

const BUILTIN_CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  PI: Math.PI,
  e: Math.E,
  E: Math.E,
};

/**
 * Tokenize input string with support for relations, inequalities, and functions.
 */
export function tokenize(str: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const clean = str.trim();

  while (i < clean.length) {
    const char = clean[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Two-character relations (<=, >=, ==, !=, \le, \ge)
    if (char === '<' && i + 1 < clean.length && clean[i + 1] === '=') {
      tokens.push({ type: 'RELATION', value: '<=' });
      i += 2;
      continue;
    }
    if (char === '>' && i + 1 < clean.length && clean[i + 1] === '=') {
      tokens.push({ type: 'RELATION', value: '>=' });
      i += 2;
      continue;
    }
    if (char === '=' && i + 1 < clean.length && clean[i + 1] === '=') {
      tokens.push({ type: 'RELATION', value: '=' });
      i += 2;
      continue;
    }
    if (char === '=' || char === '<' || char === '>') {
      tokens.push({ type: 'RELATION', value: char });
      i++;
      continue;
    }
    // LaTeX style \le, \ge
    if (clean.substring(i).startsWith('\\le')) {
      tokens.push({ type: 'RELATION', value: '<=' });
      i += 3;
      continue;
    }
    if (clean.substring(i).startsWith('\\ge')) {
      tokens.push({ type: 'RELATION', value: '>=' });
      i += 3;
      continue;
    }

    // Number (including decimals, e.g. 3.14, .5)
    if (/[0-9]/.test(char) || (char === '.' && i + 1 < clean.length && /[0-9]/.test(clean[i + 1]))) {
      let numStr = '';
      while (i < clean.length && /[0-9.]/.test(clean[i])) {
        numStr += clean[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    // Identifiers (variable, constant, or function name)
    if (/[a-zA-Z_]/.test(char)) {
      let idStr = '';
      while (i < clean.length && /[a-zA-Z0-9_]/.test(clean[i])) {
        idStr += clean[i];
        i++;
      }
      tokens.push({ type: 'IDENTIFIER', value: idStr });
      continue;
    }

    // Operators
    if (['+', '-', '*', '/', '^', '%'].includes(char)) {
      tokens.push({ type: 'OPERATOR', value: char });
      i++;
      continue;
    }

    // Parentheses & commas
    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }
    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }
    if (char === ',') {
      tokens.push({ type: 'COMMA', value: ',' });
      i++;
      continue;
    }

    throw new Error(`Unexpected character '${char}' at position ${i}`);
  }

  // Insert implicit multiplication: e.g. 2x -> 2 * x, 3(x+1) -> 3 * (x+1), (x+1)(x-1) -> (x+1) * (x-1)
  const result: Token[] = [];
  for (let j = 0; j < tokens.length; j++) {
    const cur = tokens[j];
    result.push(cur);

    if (j < tokens.length - 1) {
      const next = tokens[j + 1];

      // Number followed by Identifier or LPAREN: 2x -> 2 * x, 2(x) -> 2 * (x)
      if (cur.type === 'NUMBER' && (next.type === 'IDENTIFIER' || next.type === 'LPAREN')) {
        result.push({ type: 'OPERATOR', value: '*' });
      }
      // RPAREN followed by Number, Identifier, or LPAREN: (x)(y) -> (x) * (y), (x)2 -> (x) * 2
      else if (cur.type === 'RPAREN' && (next.type === 'NUMBER' || next.type === 'IDENTIFIER' || next.type === 'LPAREN')) {
        result.push({ type: 'OPERATOR', value: '*' });
      }
      // Identifier (not a function) followed by LPAREN: a(x) where a is variable -> a * (x)
      else if (
        cur.type === 'IDENTIFIER' &&
        !MATH_FUNCTIONS.has(cur.value.toLowerCase()) &&
        (next.type === 'LPAREN' || next.type === 'IDENTIFIER')
      ) {
        result.push({ type: 'OPERATOR', value: '*' });
      }
    }
  }

  return result;
}

/**
 * Converts infix tokens into Reverse Polish Notation (RPN).
 */
export function parseToRpn(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const opStack: Token[] = [];
  let prevToken: Token | null = null;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === 'NUMBER') {
      output.push(token);
    } else if (token.type === 'IDENTIFIER') {
      if (MATH_FUNCTIONS.has(token.value.toLowerCase())) {
        opStack.push(token);
      } else {
        output.push(token);
      }
    } else if (token.type === 'OPERATOR') {
      let op = token.value;
      // Detect unary minus
      if (op === '-' && (!prevToken || prevToken.type === 'LPAREN' || prevToken.type === 'OPERATOR' || prevToken.type === 'RELATION')) {
        op = 'u-';
      }

      const opDef = OPERATOR_PRECEDENCE[op];
      if (!opDef) throw new Error(`Unknown operator: ${op}`);

      while (opStack.length > 0) {
        const top = opStack[opStack.length - 1];
        if (top.type === 'IDENTIFIER' && MATH_FUNCTIONS.has(top.value.toLowerCase())) {
          output.push(opStack.pop()!);
          continue;
        }

        if (top.type === 'OPERATOR') {
          const topDef = OPERATOR_PRECEDENCE[top.value];
          if (
            (opDef.associativity === 'LEFT' && opDef.precedence <= topDef.precedence) ||
            (opDef.associativity === 'RIGHT' && opDef.precedence < topDef.precedence)
          ) {
            output.push(opStack.pop()!);
            continue;
          }
        }
        break;
      }
      opStack.push({ type: 'OPERATOR', value: op });
    } else if (token.type === 'LPAREN') {
      opStack.push(token);
    } else if (token.type === 'RPAREN') {
      let foundLparen = false;
      while (opStack.length > 0) {
        const top = opStack.pop()!;
        if (top.type === 'LPAREN') {
          foundLparen = true;
          break;
        }
        output.push(top);
      }
      if (!foundLparen) {
        throw new Error('Mismatched parentheses: unexpected closing bracket');
      }
      // If function was preceding the bracket
      if (opStack.length > 0 && opStack[opStack.length - 1].type === 'IDENTIFIER' && MATH_FUNCTIONS.has(opStack[opStack.length - 1].value.toLowerCase())) {
        output.push(opStack.pop()!);
      }
    }

    prevToken = token;
  }

  while (opStack.length > 0) {
    const top = opStack.pop()!;
    if (top.type === 'LPAREN' || top.type === 'RPAREN') {
      throw new Error('Mismatched parentheses: unclosed bracket');
    }
    output.push(top);
  }

  return output;
}

/**
 * Evaluates an RPN token stream against scope variables and angle mode.
 */
export function evaluateRpn(rpn: Token[], scope: Scope = {}, angleMode: AngleMode = 'radians'): number {
  const stack: number[] = [];

  for (const token of rpn) {
    if (token.type === 'NUMBER') {
      const val = parseFloat(token.value);
      if (Number.isNaN(val)) throw new Error(`Invalid number: ${token.value}`);
      stack.push(val);
    } else if (token.type === 'IDENTIFIER') {
      const name = token.value;
      const lower = name.toLowerCase();

      // Math Functions
      if (MATH_FUNCTIONS.has(lower)) {
        if (stack.length < 1) throw new Error(`Function ${name} requires operand`);
        const arg = stack.pop()!;

        // Handle degrees if applicable
        const toRadians = (deg: number) => (deg * Math.PI) / 180;
        const fromRadians = (rad: number) => (rad * 180) / Math.PI;

        switch (lower) {
          case 'sin':
            stack.push(Math.sin(angleMode === 'degrees' ? toRadians(arg) : arg));
            break;
          case 'cos':
            stack.push(Math.cos(angleMode === 'degrees' ? toRadians(arg) : arg));
            break;
          case 'tan': {
            const rad = angleMode === 'degrees' ? toRadians(arg) : arg;
            // Check asymptote
            if (Math.abs(Math.cos(rad)) < 1e-12) {
              stack.push(NaN);
            } else {
              stack.push(Math.tan(rad));
            }
            break;
          }
          case 'asin': {
            const val = Math.asin(arg);
            stack.push(angleMode === 'degrees' ? fromRadians(val) : val);
            break;
          }
          case 'acos': {
            const val = Math.acos(arg);
            stack.push(angleMode === 'degrees' ? fromRadians(val) : val);
            break;
          }
          case 'atan': {
            const val = Math.atan(arg);
            stack.push(angleMode === 'degrees' ? fromRadians(val) : val);
            break;
          }
          case 'sqrt':
            stack.push(arg < 0 ? NaN : Math.sqrt(arg));
            break;
          case 'abs':
            stack.push(Math.abs(arg));
            break;
          case 'ln':
          case 'log':
            stack.push(arg <= 0 ? NaN : Math.log(arg));
            break;
          case 'log10':
            stack.push(arg <= 0 ? NaN : Math.log10(arg));
            break;
          case 'exp':
            stack.push(Math.exp(arg));
            break;
          case 'floor':
            stack.push(Math.floor(arg));
            break;
          case 'ceil':
            stack.push(Math.ceil(arg));
            break;
          case 'round':
            stack.push(Math.round(arg));
            break;
          default:
            throw new Error(`Unsupported function: ${name}`);
        }
        continue;
      }

      // User Scope Variable
      if (scope[name] !== undefined) {
        stack.push(scope[name]);
        continue;
      }
      if (scope[lower] !== undefined) {
        stack.push(scope[lower]);
        continue;
      }

      // Built-in Constants
      if (BUILTIN_CONSTANTS[name] !== undefined) {
        stack.push(BUILTIN_CONSTANTS[name]);
        continue;
      }

      throw new Error(`Undefined symbol '${name}'`);
    } else if (token.type === 'OPERATOR') {
      if (token.value === 'u-') {
        if (stack.length < 1) throw new Error('Missing operand for negation');
        stack.push(-stack.pop()!);
        continue;
      }

      if (stack.length < 2) throw new Error(`Missing operand for operator ${token.value}`);
      const b = stack.pop()!;
      const a = stack.pop()!;

      switch (token.value) {
        case '+':
          stack.push(a + b);
          break;
        case '-':
          stack.push(a - b);
          break;
        case '*':
          stack.push(a * b);
          break;
        case '/':
          if (b === 0) stack.push(NaN);
          else stack.push(a / b);
          break;
        case '%':
          stack.push(a % b);
          break;
        case '^':
          stack.push(Math.pow(a, b));
          break;
        default:
          throw new Error(`Unknown operator: ${token.value}`);
      }
    }
  }

  if (stack.length !== 1) {
    throw new Error('Incomplete mathematical expression');
  }

  return stack[0];
}

/**
 * Master parser that inspects raw string and classifies into:
 * - Variable assignment: "a = 2"
 * - Point assignment: "A = (2, 3)" or "(2, 3)"
 * - Function definition / explicit curve: "y = 2x + 1", "f(x) = sin(x)", "2x^2 - 3"
 * - Implicit equation: "x^2 + y^2 = 25"
 * - Inequality: "y > x^2", "x^2 + y^2 <= 25"
 */
export function parseExpressionString(raw: string, existingScope: Scope = {}): ParsedExpression {
  const clean = raw.trim();
  if (!clean) {
    return { raw, type: 'unknown' };
  }

  // 1. Check Point: e.g. "A = (2, 3)" or "(2, 3)"
  const pointMatch = clean.match(/^(?:([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*)?\(\s*([^\s,]+)\s*,\s*([^\s)]+)\s*\)$/);
  if (pointMatch) {
    const label = pointMatch[1] || 'P';
    try {
      const xTokens = parseToRpn(tokenize(pointMatch[2]));
      const yTokens = parseToRpn(tokenize(pointMatch[3]));
      const x = evaluateRpn(xTokens, existingScope);
      const y = evaluateRpn(yTokens, existingScope);

      if (Number.isFinite(x) && Number.isFinite(y)) {
        return {
          raw,
          type: 'point',
          pointCoord: { x, y },
          pointLabel: label,
        };
      }
    } catch {
      // Continue normal parsing
    }
  }

  // 2. Check Variable Assignment: e.g. "a = 3.5" or "a = 2 * pi"
  const varMatch = clean.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([^=<>]+)$/);
  if (varMatch && varMatch[1] !== 'y' && varMatch[1] !== 'x') {
    const varName = varMatch[1];
    const exprRhs = varMatch[2].trim();

    // Check if it's not a function definition like f(x)
    if (!varName.includes('(')) {
      try {
        const tokens = tokenize(exprRhs);
        const rpn = parseToRpn(tokens);
        // If RHS does not contain free variable 'x', evaluate it as scalar variable
        const isDependentOnX = tokens.some((t) => t.type === 'IDENTIFIER' && t.value === 'x');
        if (!isDependentOnX) {
          const val = evaluateRpn(rpn, existingScope);
          return {
            raw,
            type: 'variable',
            variableName: varName,
            variableValue: Number.isFinite(val) ? val : 0,
            rpn,
          };
        }
      } catch {
        // Continue parsing
      }
    }
  }

  // 3. Check Inequalities: e.g. "y > x^2", "x^2 + y^2 <= 25"
  const ineqMatch = clean.match(/^(.*?)(<=|>=|<|>)(.*)$/);
  if (ineqMatch) {
    const lhsStr = ineqMatch[1].trim();
    const rel = ineqMatch[2] as '<' | '<=' | '>' | '>=';
    const rhsStr = ineqMatch[3].trim();

    try {
      // Form F(x, y) = LHS - RHS
      const implicitTokens = tokenize(`(${lhsStr}) - (${rhsStr})`);
      const implicitRpn = parseToRpn(implicitTokens);

      // Check if standard y < f(x) or y > f(x)
      if (lhsStr === 'y') {
        const rhsTokens = tokenize(rhsStr);
        const rhsRpn = parseToRpn(rhsTokens);
        return {
          raw,
          type: 'inequality',
          relation: rel,
          rpn: rhsRpn,
          implicitRpn,
        };
      }

      return {
        raw,
        type: 'inequality',
        relation: rel,
        implicitRpn,
      };
    } catch (e: any) {
      return { raw, type: 'unknown', error: e.message };
    }
  }

  // 4. Check Explicit Function: "y = ...", "f(x) = ...", or implicit "x^2 + y^2 = 25"
  if (clean.includes('=')) {
    const parts = clean.split('=');
    if (parts.length === 2) {
      const lhs = parts[0].trim();
      const rhs = parts[1].trim();

      // Standard y = f(x) or f(x) = ...
      if (lhs === 'y' || /^[a-zA-Z_][a-zA-Z0-9_]*\(x\)$/.test(lhs)) {
        try {
          const tokens = tokenize(rhs);
          const rpn = parseToRpn(tokens);
          return {
            raw,
            type: 'function',
            targetVar: 'y',
            rpn,
          };
        } catch (e: any) {
          return { raw, type: 'unknown', error: e.message };
        }
      }

      // Implicit equation: F(x, y) = LHS - RHS = 0
      try {
        const tokens = tokenize(`(${lhs}) - (${rhs})`);
        const implicitRpn = parseToRpn(tokens);
        return {
          raw,
          type: 'implicit',
          relation: '=',
          implicitRpn,
        };
      } catch (e: any) {
        return { raw, type: 'unknown', error: e.message };
      }
    }
  }

  // 5. Default Expression: treat as y = expression (e.g. "sin(x)", "x^2 + 2x")
  try {
    const tokens = tokenize(clean);
    const rpn = parseToRpn(tokens);
    return {
      raw,
      type: 'function',
      targetVar: 'y',
      rpn,
    };
  } catch (e: any) {
    return { raw, type: 'unknown', error: e.message };
  }
}

/**
 * Samples an explicit function y = f(x) across a range [xMin, xMax].
 * Splits at asymptotes / discontinuities (e.g. tan(x), 1/x) so lines don't connect across singularities.
 */
export function sampleFunctionSegments(
  rpn: Token[],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  steps: number = 600,
  scope: Scope = {},
  angleMode: AngleMode = 'radians'
): Array<Array<{ x: number; y: number }>> {
  const segments: Array<Array<{ x: number; y: number }>> = [];
  let currentSegment: Array<{ x: number; y: number }> = [];

  const stepSize = (xMax - xMin) / steps;
  const ySpan = yMax - yMin;
  let prevY: number | null = null;

  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * stepSize;
    let y: number | null = null;

    try {
      const evalScope = { ...scope, x, t: x };
      const val = evaluateRpn(rpn, evalScope, angleMode);
      if (Number.isFinite(val)) {
        y = val;
      }
    } catch {
      y = null;
    }

    if (y === null || Number.isNaN(y)) {
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = [];
      }
      prevY = null;
      continue;
    }

    // Detect asymptote jump: huge delta with opposite signs
    if (prevY !== null && Math.abs(y - prevY) > ySpan * 1.5 && Math.sign(y) !== Math.sign(prevY)) {
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = [];
      }
    }

    currentSegment.push({ x, y });
    prevY = y;
  }

  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  return segments;
}

/**
 * Contour Plotting (Marching Squares) for Implicit Equations F(x, y) = 0
 * Grid resolution: rows x cols across [xMin, xMax] x [yMin, yMax].
 */
export function contourImplicit(
  rpn: Token[],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  gridCols: number = 80,
  gridRows: number = 60,
  scope: Scope = {},
  angleMode: AngleMode = 'radians'
): Array<{ x1: number; y1: number; x2: number; y2: number }> {
  const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  const dx = (xMax - xMin) / gridCols;
  const dy = (yMax - yMin) / gridRows;

  // Evaluate 2D grid
  const grid: number[][] = [];
  for (let r = 0; r <= gridRows; r++) {
    grid[r] = [];
    const y = yMin + r * dy;
    for (let c = 0; c <= gridCols; c++) {
      const x = xMin + c * dx;
      try {
        const val = evaluateRpn(rpn, { ...scope, x, y }, angleMode);
        grid[r][c] = Number.isFinite(val) ? val : NaN;
      } catch {
        grid[r][c] = NaN;
      }
    }
  }

  // Interpolation helper
  const interp = (v1: number, v2: number) => {
    if (Number.isNaN(v1) || Number.isNaN(v2)) return 0.5;
    const diff = v2 - v1;
    if (Math.abs(diff) < 1e-12) return 0.5;
    return Math.max(0, Math.min(1, -v1 / diff));
  };

  // Marching squares cell by cell
  for (let r = 0; r < gridRows; r++) {
    const y0 = yMin + r * dy;
    const y1 = y0 + dy;

    for (let c = 0; c < gridCols; c++) {
      const x0 = xMin + c * dx;
      const x1 = x0 + dx;

      const bl = grid[r][c]; // (x0, y0)
      const br = grid[r][c + 1]; // (x1, y0)
      const tr = grid[r + 1][c + 1]; // (x1, y1)
      const tl = grid[r + 1][c]; // (x0, y1)

      if (Number.isNaN(bl) || Number.isNaN(br) || Number.isNaN(tr) || Number.isNaN(tl)) continue;

      let mask = 0;
      if (bl > 0) mask |= 1;
      if (br > 0) mask |= 2;
      if (tr > 0) mask |= 4;
      if (tl > 0) mask |= 8;

      if (mask === 0 || mask === 15) continue;

      // Edges: bottom, right, top, left
      const bEdge = { x: x0 + interp(bl, br) * dx, y: y0 };
      const rEdge = { x: x1, y: y0 + interp(br, tr) * dy };
      const tEdge = { x: x0 + interp(tl, tr) * dx, y: y1 };
      const lEdge = { x: x0, y: y0 + interp(bl, tl) * dy };

      switch (mask) {
        case 1:
        case 14:
          lines.push({ x1: lEdge.x, y1: lEdge.y, x2: bEdge.x, y2: bEdge.y });
          break;
        case 2:
        case 13:
          lines.push({ x1: bEdge.x, y1: bEdge.y, x2: rEdge.x, y2: rEdge.y });
          break;
        case 3:
        case 12:
          lines.push({ x1: lEdge.x, y1: lEdge.y, x2: rEdge.x, y2: rEdge.y });
          break;
        case 4:
        case 11:
          lines.push({ x1: rEdge.x, y1: rEdge.y, x2: tEdge.x, y2: tEdge.y });
          break;
        case 5:
          lines.push({ x1: lEdge.x, y1: lEdge.y, x2: tEdge.x, y2: tEdge.y });
          lines.push({ x1: bEdge.x, y1: bEdge.y, x2: rEdge.x, y2: rEdge.y });
          break;
        case 6:
        case 9:
          lines.push({ x1: bEdge.x, y1: bEdge.y, x2: tEdge.x, y2: tEdge.y });
          break;
        case 7:
        case 8:
          lines.push({ x1: lEdge.x, y1: lEdge.y, x2: tEdge.x, y2: tEdge.y });
          break;
        case 10:
          lines.push({ x1: lEdge.x, y1: lEdge.y, x2: bEdge.x, y2: bEdge.y });
          lines.push({ x1: tEdge.x, y1: tEdge.y, x2: rEdge.x, y2: rEdge.y });
          break;
      }
    }
  }

  return lines;
}

/**
 * Linear Regression Calculator for Table data: y ~ mx + b
 */
export function calculateLinearRegression(points: Array<{ x: number; y: number }>): {
  slope: number;
  intercept: number;
  rSquared: number;
  correlation: number;
  formula: string;
} | null {
  const valid = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  const n = valid.length;
  if (n < 2) return null;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const p of valid) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (Math.abs(denominator) < 1e-12) return null; // Vertical line or identical x

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Correlation r
  const yDenominator = n * sumY2 - sumY * sumY;
  const correlation =
    yDenominator > 0 ? (n * sumXY - sumX * sumY) / Math.sqrt(denominator * yDenominator) : 1;
  const rSquared = Math.max(0, Math.min(1, correlation * correlation));

  const sign = intercept >= 0 ? '+' : '-';
  const formula = `y = ${slope.toFixed(3)}x ${sign} ${Math.abs(intercept).toFixed(3)}`;

  return {
    slope: Math.round(slope * 1000) / 1000,
    intercept: Math.round(intercept * 1000) / 1000,
    rSquared: Math.round(rSquared * 1000) / 1000,
    correlation: Math.round(correlation * 1000) / 1000,
    formula,
  };
}
