import { describe, it, expect } from 'vitest';
import compoundReducer, {
  setCodeFiles,
  setCompoundPattern,
  selectPattern,
  updatePatternFilter,
  resetCompoundPattern,
  resetState,
} from '../compoundSlice';
import {
  CodeFile,
  CompoundPattern,
  CompoundState,
  FileStatus,
  MatchType,
  PatternFile,
} from '../compoundModels';

function makeCodeFile(overrides: Partial<CodeFile> = {}): CodeFile {
  return {
    filename: 'test.py',
    status: FileStatus.PENDING,
    code: 'print("hello")',
    lang: 'python',
    ...overrides,
  };
}

function makePatternFile(overrides: Partial<PatternFile> = {}): PatternFile {
  return {
    filename: 'test.pyt',
    code: 'def ?(?*):\n    pass',
    status: FileStatus.VALIDATED,
    lang: 'python',
    isSelected: false,
    ...overrides,
  };
}

function makeCompoundPattern(
  name: string,
  children: (CompoundPattern | PatternFile)[]
): CompoundPattern {
  return { name, children };
}

function getInitialState(): CompoundState {
  return compoundReducer(undefined, { type: 'unknown' });
}

describe('compoundSlice', () => {
  it('has correct initial state', () => {
    const state = getInitialState();
    expect(state.codeFiles).toEqual([]);
    expect(state.compoundPattern).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.err).toBeNull();
    expect(state.isFilesReadyToMatch).toBe(false);
    expect(state.isPatternReadyToMatch).toBe(false);
    expect(state.isMatchDone).toBe(false);
    expect(state.selectedPatterns).toEqual([]);
    expect(state.patternFilters).toEqual({});
  });

  describe('setCodeFiles', () => {
    it('sets code files and computes isFilesReadyToMatch as true when all validated', () => {
      const files = [
        makeCodeFile({ filename: 'a.py', status: FileStatus.VALIDATED }),
        makeCodeFile({ filename: 'b.py', status: FileStatus.NOT_VALIDATED }),
      ];
      const state = compoundReducer(getInitialState(), setCodeFiles(files));

      expect(state.codeFiles).toEqual(files);
      expect(state.isFilesReadyToMatch).toBe(true);
    });

    it('sets isFilesReadyToMatch to false when some files are PENDING', () => {
      const files = [
        makeCodeFile({ filename: 'a.py', status: FileStatus.VALIDATED }),
        makeCodeFile({ filename: 'b.py', status: FileStatus.PENDING }),
      ];
      const state = compoundReducer(getInitialState(), setCodeFiles(files));

      expect(state.isFilesReadyToMatch).toBe(false);
    });

    it('sets isFilesReadyToMatch to false for empty array', () => {
      const state = compoundReducer(getInitialState(), setCodeFiles([]));
      expect(state.isFilesReadyToMatch).toBe(false);
    });
  });

  describe('setCompoundPattern', () => {
    it('sets pattern and computes isPatternReadyToMatch', () => {
      const pattern = makeCompoundPattern('Root', [
        makeCompoundPattern('and', [
          makePatternFile({ filename: 'print.pyt', status: FileStatus.VALIDATED }),
        ]),
      ]);
      const state = compoundReducer(getInitialState(), setCompoundPattern(pattern));

      expect(state.compoundPattern).not.toBeNull();
      expect(state.isPatternReadyToMatch).toBe(true);
    });

    it('sets isPatternReadyToMatch to false when pattern has validation errors', () => {
      const pattern = makeCompoundPattern('Root', [
        makeCompoundPattern('and', [
          makePatternFile({
            filename: 'bad.pyt',
            status: FileStatus.NOT_VALIDATED,
            validationError: { line: 1, column: 0, symbol: '', msg: 'error' },
          }),
        ]),
      ]);
      const state = compoundReducer(getInitialState(), setCompoundPattern(pattern));

      expect(state.isPatternReadyToMatch).toBe(false);
    });

    it('resets selectedPatterns and patternFilters', () => {
      let state = getInitialState();
      // First set a pattern and select something
      const pattern1 = makeCompoundPattern('Root', [
        makeCompoundPattern('and', [
          makePatternFile({ filename: 'a.pyt' }),
        ]),
      ]);
      state = compoundReducer(state, setCompoundPattern(pattern1));
      state = compoundReducer(state, selectPattern('a.pyt'));
      expect(state.selectedPatterns).toHaveLength(1);

      // Setting a new pattern should reset selections
      const pattern2 = makeCompoundPattern('Root2', [
        makeCompoundPattern('and', [
          makePatternFile({ filename: 'b.pyt' }),
        ]),
      ]);
      state = compoundReducer(state, setCompoundPattern(pattern2));
      expect(state.selectedPatterns).toEqual([]);
      expect(state.patternFilters).toEqual({});
    });
  });

  describe('selectPattern', () => {
    it('does nothing when compoundPattern is null', () => {
      const state = compoundReducer(getInitialState(), selectPattern('any.pyt'));
      expect(state.selectedPatterns).toEqual([]);
    });

    it('selects a pattern and initializes filter with MATCH for normal patterns', () => {
      const pattern = makeCompoundPattern('Root', [
        makeCompoundPattern('and', [
          makePatternFile({ filename: 'print.pyt', isUnderNot: false }),
        ]),
      ]);
      let state = compoundReducer(getInitialState(), setCompoundPattern(pattern));
      state = compoundReducer(state, selectPattern('print.pyt'));

      expect(state.selectedPatterns).toContain('print.pyt');
      expect(state.patternFilters['print.pyt']).toEqual({
        matchType: MatchType.MATCH,
      });
    });

    it('initializes filter with NOT_MATCH for patterns under NOT', () => {
      const pattern = makeCompoundPattern('Root', [
        makeCompoundPattern('and', [
          makeCompoundPattern('not', [
            makePatternFile({ filename: 'return.pyt', isUnderNot: true }),
          ]),
        ]),
      ]);
      let state = compoundReducer(getInitialState(), setCompoundPattern(pattern));
      state = compoundReducer(state, selectPattern('return.pyt'));

      expect(state.patternFilters['return.pyt']).toEqual({
        matchType: MatchType.NOT_MATCH,
      });
    });

    it('deselects a pattern and removes its filter', () => {
      const pattern = makeCompoundPattern('Root', [
        makeCompoundPattern('and', [
          makePatternFile({ filename: 'print.pyt', isUnderNot: false }),
        ]),
      ]);
      let state = compoundReducer(getInitialState(), setCompoundPattern(pattern));
      state = compoundReducer(state, selectPattern('print.pyt'));
      expect(state.selectedPatterns).toContain('print.pyt');

      state = compoundReducer(state, selectPattern('print.pyt'));
      expect(state.selectedPatterns).not.toContain('print.pyt');
      expect(state.patternFilters['print.pyt']).toBeUndefined();
    });
  });

  describe('updatePatternFilter', () => {
    it('updates matchType for an existing filter', () => {
      const pattern = makeCompoundPattern('Root', [
        makeCompoundPattern('and', [
          makePatternFile({ filename: 'print.pyt', isUnderNot: false }),
        ]),
      ]);
      let state = compoundReducer(getInitialState(), setCompoundPattern(pattern));
      state = compoundReducer(state, selectPattern('print.pyt'));
      state = compoundReducer(
        state,
        updatePatternFilter({ patternFilename: 'print.pyt', matchType: MatchType.NOT_MATCH })
      );

      expect(state.patternFilters['print.pyt'].matchType).toBe(MatchType.NOT_MATCH);
    });

    it('does nothing for non-existent filter', () => {
      const state = compoundReducer(
        getInitialState(),
        updatePatternFilter({ patternFilename: 'nonexistent.pyt', matchType: MatchType.MATCH })
      );
      expect(state.patternFilters['nonexistent.pyt']).toBeUndefined();
    });
  });

  describe('resetCompoundPattern', () => {
    it('resets only pattern-related state', () => {
      const pattern = makeCompoundPattern('Root', [
        makeCompoundPattern('and', [makePatternFile()]),
      ]);
      let state = compoundReducer(getInitialState(), setCompoundPattern(pattern));
      state = compoundReducer(state, setCodeFiles([makeCodeFile({ status: FileStatus.VALIDATED })]));
      state = compoundReducer(state, selectPattern('test.pyt'));

      state = compoundReducer(state, resetCompoundPattern());

      expect(state.compoundPattern).toBeNull();
      expect(state.isPatternReadyToMatch).toBe(false);
      expect(state.selectedPatterns).toEqual([]);
      expect(state.patternFilters).toEqual({});
      // Code files should remain
      expect(state.codeFiles).toHaveLength(1);
    });
  });

  describe('resetState', () => {
    it('resets all state to initial values', () => {
      let state = getInitialState();
      const pattern = makeCompoundPattern('Root', [
        makeCompoundPattern('and', [makePatternFile()]),
      ]);
      state = compoundReducer(state, setCompoundPattern(pattern));
      state = compoundReducer(state, setCodeFiles([makeCodeFile({ status: FileStatus.VALIDATED })]));

      state = compoundReducer(state, resetState());

      expect(state.codeFiles).toEqual([]);
      expect(state.compoundPattern).toBeNull();
      expect(state.isMatchDone).toBe(false);
      expect(state.selectedPatterns).toEqual([]);
      expect(state.patternFilters).toEqual({});
      expect(state.isFilesReadyToMatch).toBe(false);
      expect(state.isPatternReadyToMatch).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.err).toBeNull();
    });
  });

  describe('extraReducers', () => {
    it('sets isLoading on validateCodeFiles.pending', () => {
      const state = compoundReducer(getInitialState(), {
        type: 'compound/validateCodeFiles/pending',
      });
      expect(state.isLoading).toBe(true);
      expect(state.err).toBeNull();
    });

    it('sets error on validateCodeFiles.rejected', () => {
      const state = compoundReducer(getInitialState(), {
        type: 'compound/validateCodeFiles/rejected',
        error: { message: 'validation failed' },
      });
      expect(state.isLoading).toBe(false);
      expect(state.err).toBe('validation failed');
    });

    it('sets isLoading on startMatch.pending', () => {
      const state = compoundReducer(getInitialState(), {
        type: 'compound/startMatch/pending',
      });
      expect(state.isLoading).toBe(true);
    });

    it('sets isMatchDone on startMatch.fulfilled', () => {
      const state = compoundReducer(getInitialState(), {
        type: 'compound/startMatch/fulfilled',
        payload: [makeCodeFile({ status: FileStatus.MATCHED })],
      });
      expect(state.isLoading).toBe(false);
      expect(state.isMatchDone).toBe(true);
      expect(state.codeFiles).toHaveLength(1);
    });

    it('sets error on startMatch.rejected', () => {
      const state = compoundReducer(getInitialState(), {
        type: 'compound/startMatch/rejected',
        error: { message: 'match failed' },
      });
      expect(state.isLoading).toBe(false);
      expect(state.err).toBe('match failed');
    });
  });
});
