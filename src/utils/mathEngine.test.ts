import { describe, it, expect } from 'vitest';
import {
  tokenize,
  parseToRpn,
  evaluateRpn,
  parseExpressionString,
  sampleFunctionSegments,
  calculateLinearRegression,
} from './mathEngine';

describe('GraphLab Mathematical Engine', () => {
  describe('Tokenization & Implicit Multiplication', () => {
    it('handles standard arithmetic expressions', () => {
      const tokens = tokenize('2 + 3 * 4');
      expect(tokens.map((t) => t.value)).toEqual(['2', '+', '3', '*', '4']);
    });

    it('inserts implicit multiplication for 2x and 3(x+1)', () => {
      const tokens1 = tokenize('2x');
      expect(tokens1.map((t) => t.value)).toEqual(['2', '*', 'x']);

      const tokens2 = tokenize('3(x+1)');
      expect(tokens2.map((t) => t.value)).toEqual(['3', '*', '(', 'x', '+', '1', ')']);
    });

    it('handles relations and inequalities', () => {
      const tokens1 = tokenize('y <= 2x + 1');
      expect(tokens1.some((t) => t.type === 'RELATION' && t.value === '<=')).toBe(true);
    });
  });

  describe('RPN Parsing and Evaluation', () => {
    it('evaluates precedence and parentheses correctly', () => {
      const rpn1 = parseToRpn(tokenize('2 + 3 * 4'));
      expect(evaluateRpn(rpn1)).toBe(14);

      const rpn2 = parseToRpn(tokenize('(2 + 3) * 4'));
      expect(evaluateRpn(rpn2)).toBe(20);

      const rpn3 = parseToRpn(tokenize('2^3 + 1'));
      expect(evaluateRpn(rpn3)).toBe(9);
    });

    it('supports trigonometry and angle modes', () => {
      const rpnRad = parseToRpn(tokenize('sin(pi / 2)'));
      expect(evaluateRpn(rpnRad)).toBeCloseTo(1, 4);

      const rpnDeg = parseToRpn(tokenize('sin(90)'));
      expect(evaluateRpn(rpnDeg, {}, 'degrees')).toBeCloseTo(1, 4);
    });

    it('supports math functions: sqrt, abs, exp, ln', () => {
      expect(evaluateRpn(parseToRpn(tokenize('sqrt(16)')))).toBe(4);
      expect(evaluateRpn(parseToRpn(tokenize('abs(-42)')))).toBe(42);
      expect(evaluateRpn(parseToRpn(tokenize('exp(0)')))).toBe(1);
      expect(evaluateRpn(parseToRpn(tokenize('ln(e)')))).toBeCloseTo(1, 4);
    });

    it('evaluates scope variables', () => {
      const scope = { a: 2, b: 3, x: 5 };
      const rpn = parseToRpn(tokenize('a * x + b'));
      expect(evaluateRpn(rpn, scope)).toBe(13);
    });
  });

  describe('Expression String Classification', () => {
    it('classifies variable assignment: a = 5', () => {
      const parsed = parseExpressionString('a = 5');
      expect(parsed.type).toBe('variable');
      expect(parsed.variableName).toBe('a');
      expect(parsed.variableValue).toBe(5);
    });

    it('classifies point assignment: A = (2, 3)', () => {
      const parsed = parseExpressionString('A = (2, 3)');
      expect(parsed.type).toBe('point');
      expect(parsed.pointLabel).toBe('A');
      expect(parsed.pointCoord).toEqual({ x: 2, y: 3 });
    });

    it('classifies standard explicit functions', () => {
      const parsed1 = parseExpressionString('y = x^2 - 4');
      expect(parsed1.type).toBe('function');

      const parsed2 = parseExpressionString('f(x) = sin(x)');
      expect(parsed2.type).toBe('function');
    });

    it('classifies implicit equations: x^2 + y^2 = 25', () => {
      const parsed = parseExpressionString('x^2 + y^2 = 25');
      expect(parsed.type).toBe('implicit');
    });

    it('classifies inequalities: y > 2x', () => {
      const parsed = parseExpressionString('y > 2x');
      expect(parsed.type).toBe('inequality');
      expect(parsed.relation).toBe('>');
    });
  });

  describe('Function Sampling and Discontinuity', () => {
    it('splits segments around asymptotes for 1/x', () => {
      const rpn = parseToRpn(tokenize('1 / x'));
      const segments = sampleFunctionSegments(rpn, -2, 2, -10, 10, 100);
      // Should produce at least 2 distinct segments around x = 0
      expect(segments.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Linear Regression', () => {
    it('fits line y = 2x + 1 with high R^2', () => {
      const points = [
        { x: 1, y: 3 },
        { x: 2, y: 5 },
        { x: 3, y: 7 },
        { x: 4, y: 9 },
      ];
      const fit = calculateLinearRegression(points);
      expect(fit).not.toBeNull();
      expect(fit!.slope).toBeCloseTo(2, 2);
      expect(fit!.intercept).toBeCloseTo(1, 2);
      expect(fit!.rSquared).toBeCloseTo(1, 2);
    });
  });
});
