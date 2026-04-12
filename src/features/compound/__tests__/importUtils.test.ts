import { describe, it, expect } from 'vitest';
import { isLogicalOperator, validateCompoundPatternStructure } from '../importUtils';
import { CompoundPattern, PatternFile, FileStatus } from '../compoundModels';

function makePatternFile(overrides: Partial<PatternFile> = {}): PatternFile {
  return {
    filename: 'test.pyt',
    code: 'def ?(?*):\n    pass',
    status: FileStatus.PENDING,
    lang: 'python',
    isSelected: false,
    ...overrides,
  };
}

function makeCompoundPattern(name: string, children: (CompoundPattern | PatternFile)[]): CompoundPattern {
  return { name, children };
}

describe('isLogicalOperator', () => {
  it('returns true for "and"', () => {
    expect(isLogicalOperator('and')).toBe(true);
  });

  it('returns true for "or"', () => {
    expect(isLogicalOperator('or')).toBe(true);
  });

  it('returns true for "not"', () => {
    expect(isLogicalOperator('not')).toBe(true);
  });

  it('is case insensitive', () => {
    expect(isLogicalOperator('AND')).toBe(true);
    expect(isLogicalOperator('Or')).toBe(true);
    expect(isLogicalOperator('NOT')).toBe(true);
  });

  it('returns false for non-operators', () => {
    expect(isLogicalOperator('xor')).toBe(false);
    expect(isLogicalOperator('')).toBe(false);
    expect(isLogicalOperator('pattern.pyt')).toBe(false);
    expect(isLogicalOperator('anda')).toBe(false);
  });
});

describe('validateCompoundPatternStructure', () => {
  it('returns error for null pattern', () => {
    expect(validateCompoundPatternStructure(null)).toBe('No pattern provided');
  });

  it('returns error for pattern with empty children', () => {
    const pattern = makeCompoundPattern('Root', []);
    expect(validateCompoundPatternStructure(pattern)).toBe(
      'Pattern must contain at least one child element'
    );
  });

  it('returns null for valid pattern with one pattern file child inside and', () => {
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('and', [makePatternFile()]),
    ]);
    expect(validateCompoundPatternStructure(pattern)).toBeNull();
  });

  it('returns error for invalid operator name', () => {
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('xor', [makePatternFile()]),
    ]);
    const result = validateCompoundPatternStructure(pattern);
    expect(result).toContain('Invalid operator');
    expect(result).toContain('xor');
  });

  it('returns error for operator with empty children', () => {
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('and', []),
    ]);
    const result = validateCompoundPatternStructure(pattern);
    expect(result).toContain('must contain at least one child');
  });

  it('returns error for NOT operator with more than one child', () => {
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('not', [
        makePatternFile({ filename: 'a.pyt' }),
        makePatternFile({ filename: 'b.pyt' }),
      ]),
    ]);
    const result = validateCompoundPatternStructure(pattern);
    expect(result).toContain('exactly one child');
  });

  it('returns null for NOT operator with exactly one child', () => {
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('not', [makePatternFile()]),
    ]);
    expect(validateCompoundPatternStructure(pattern)).toBeNull();
  });

  it('returns error for empty pattern file (no code)', () => {
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('and', [
        makePatternFile({ code: '' }),
      ]),
    ]);
    const result = validateCompoundPatternStructure(pattern);
    expect(result).toContain('is empty');
  });

  it('returns error for pattern file with only whitespace code', () => {
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('and', [
        makePatternFile({ code: '   \n  ' }),
      ]),
    ]);
    const result = validateCompoundPatternStructure(pattern);
    expect(result).toContain('is empty');
  });

  it('validates deeply nested valid structure', () => {
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('and', [
        makePatternFile({ filename: 'print.pyt' }),
        makeCompoundPattern('not', [
          makePatternFile({ filename: 'return.pyt' }),
        ]),
      ]),
    ]);
    expect(validateCompoundPatternStructure(pattern)).toBeNull();
  });

  it('catches error deep in nested structure', () => {
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('and', [
        makePatternFile({ filename: 'good.pyt' }),
        makeCompoundPattern('not', [
          makePatternFile({ filename: 'bad.pyt', code: '' }),
        ]),
      ]),
    ]);
    const result = validateCompoundPatternStructure(pattern);
    expect(result).toContain('bad.pyt');
    expect(result).toContain('is empty');
  });

  it('validates or operator with multiple children', () => {
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('or', [
        makePatternFile({ filename: 'a.pyt' }),
        makePatternFile({ filename: 'b.pyt' }),
      ]),
    ]);
    expect(validateCompoundPatternStructure(pattern)).toBeNull();
  });
});
