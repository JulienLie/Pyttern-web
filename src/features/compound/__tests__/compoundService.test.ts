import { describe, it, expect } from 'vitest';
import { findPatternFileByFilename, selectPatternsRecursively, getPatternFilesOfCompound } from '../compoundService';
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

describe('findPatternFileByFilename', () => {
  it('finds a file at the top level', () => {
    const file = makePatternFile({ filename: 'print.pyt' });
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('and', [file]),
    ]);

    const result = findPatternFileByFilename(pattern, 'print.pyt');
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('print.pyt');
  });

  it('finds a file nested inside not operator', () => {
    const file = makePatternFile({ filename: 'return.pyt' });
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('and', [
        makePatternFile({ filename: 'print.pyt' }),
        makeCompoundPattern('not', [file]),
      ]),
    ]);

    const result = findPatternFileByFilename(pattern, 'return.pyt');
    expect(result).not.toBeNull();
    expect(result!.filename).toBe('return.pyt');
  });

  it('returns null when file is not found', () => {
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('and', [
        makePatternFile({ filename: 'print.pyt' }),
      ]),
    ]);

    expect(findPatternFileByFilename(pattern, 'nonexistent.pyt')).toBeNull();
  });

  it('returns null for empty children', () => {
    const pattern = makeCompoundPattern('Root', []);
    expect(findPatternFileByFilename(pattern, 'any.pyt')).toBeNull();
  });

  it('finds the first match when duplicate filenames exist', () => {
    const file1 = makePatternFile({ filename: 'dup.pyt', code: 'first' });
    const file2 = makePatternFile({ filename: 'dup.pyt', code: 'second' });
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('and', [file1]),
      makeCompoundPattern('or', [file2]),
    ]);

    const result = findPatternFileByFilename(pattern, 'dup.pyt');
    expect(result).not.toBeNull();
    expect(result!.code).toBe('first');
  });
});

describe('selectPatternsRecursively', () => {
  it('selects a pattern by toggling isSelected to true', () => {
    const file = makePatternFile({ filename: 'print.pyt', isSelected: false });
    const element = makeCompoundPattern('and', [file]);
    const selected: string[] = [];

    selectPatternsRecursively(element, 'print.pyt', selected);

    expect(file.isSelected).toBe(true);
    expect(selected).toContain('print.pyt');
  });

  it('deselects a pattern by toggling isSelected to false', () => {
    const file = makePatternFile({ filename: 'print.pyt', isSelected: true });
    const element = makeCompoundPattern('and', [file]);
    const selected = ['print.pyt'];

    selectPatternsRecursively(element, 'print.pyt', selected);

    expect(file.isSelected).toBe(false);
    expect(selected).not.toContain('print.pyt');
  });

  it('does not affect other patterns', () => {
    const file1 = makePatternFile({ filename: 'a.pyt', isSelected: false });
    const file2 = makePatternFile({ filename: 'b.pyt', isSelected: false });
    const element = makeCompoundPattern('and', [file1, file2]);
    const selected: string[] = [];

    selectPatternsRecursively(element, 'a.pyt', selected);

    expect(file1.isSelected).toBe(true);
    expect(file2.isSelected).toBe(false);
    expect(selected).toEqual(['a.pyt']);
  });

  it('handles nested structures', () => {
    const file = makePatternFile({ filename: 'return.pyt', isSelected: false });
    const element = makeCompoundPattern('and', [
      makePatternFile({ filename: 'print.pyt', isSelected: false }),
      makeCompoundPattern('not', [file]),
    ]);
    const selected: string[] = [];

    selectPatternsRecursively(element, 'return.pyt', selected);

    expect(file.isSelected).toBe(true);
    expect(selected).toEqual(['return.pyt']);
  });

  it('does nothing for non-existent pattern', () => {
    const file = makePatternFile({ filename: 'print.pyt', isSelected: false });
    const element = makeCompoundPattern('and', [file]);
    const selected: string[] = [];

    selectPatternsRecursively(element, 'nonexistent.pyt', selected);

    expect(file.isSelected).toBe(false);
    expect(selected).toEqual([]);
  });

  it('does not add duplicates when already in selected array', () => {
    const file = makePatternFile({ filename: 'print.pyt', isSelected: false });
    const element = makeCompoundPattern('and', [file]);
    const selected = ['print.pyt']; // already present

    selectPatternsRecursively(element, 'print.pyt', selected);

    expect(file.isSelected).toBe(true);
    // Should not duplicate
    expect(selected.filter(s => s === 'print.pyt')).toHaveLength(1);
  });
});

describe('getPatternFilesOfCompound', () => {
  it('extracts all pattern files from a flat tree', () => {
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('and', [
        makePatternFile({ filename: 'a.pyt' }),
        makePatternFile({ filename: 'b.pyt' }),
      ]),
    ]);

    const files = getPatternFilesOfCompound(pattern);
    expect(files).toHaveLength(2);
    expect(files.map(f => f.filename)).toEqual(['a.pyt', 'b.pyt']);
  });

  it('sets isUnderNot true for files under NOT operator', () => {
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('and', [
        makePatternFile({ filename: 'print.pyt' }),
        makeCompoundPattern('not', [
          makePatternFile({ filename: 'return.pyt' }),
        ]),
      ]),
    ]);

    const files = getPatternFilesOfCompound(pattern);
    const printFile = files.find(f => f.filename === 'print.pyt');
    const returnFile = files.find(f => f.filename === 'return.pyt');

    expect(printFile!.isUnderNot).toBe(false);
    expect(returnFile!.isUnderNot).toBe(true);
  });

  it('propagates isUnderNot through nested operators', () => {
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('not', [
        makeCompoundPattern('and', [
          makePatternFile({ filename: 'deep.pyt' }),
        ]),
      ]),
    ]);

    const files = getPatternFilesOfCompound(pattern);
    expect(files).toHaveLength(1);
    expect(files[0].isUnderNot).toBe(true);
  });

  it('returns empty array for pattern with no files', () => {
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('and', []),
    ]);

    expect(getPatternFilesOfCompound(pattern)).toEqual([]);
  });

  it('handles OR operator correctly', () => {
    const pattern = makeCompoundPattern('Root', [
      makeCompoundPattern('or', [
        makePatternFile({ filename: 'a.pyt' }),
        makePatternFile({ filename: 'b.pyt' }),
      ]),
    ]);

    const files = getPatternFilesOfCompound(pattern);
    expect(files).toHaveLength(2);
    expect(files.every(f => f.isUnderNot === false)).toBe(true);
  });
});
