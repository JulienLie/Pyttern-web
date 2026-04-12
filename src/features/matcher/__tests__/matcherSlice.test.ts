import { describe, it, expect } from 'vitest';
import matcherReducer, {
  setPatternCode,
  setCode,
  setValidationError,
  clearValidationError,
  resetMatcher,
  startMatchRequest,
  startMatchSuccess,
  startMatchFailure,
  setStep,
  setMatchState,
} from '../matcherSlice';
import { MatcherState, State } from '../matcherModels';

const defaultMatchState: State = {
  currentState: { patternNode: '', codeNode: '-1' },
  matchedNodes: [],
  prevMatchedNodes: [],
  currentStack: '',
  previousStack: '',
  codePos: [0, 0],
};

function getInitialState(): MatcherState {
  return matcherReducer(undefined, { type: 'unknown' });
}

describe('matcherSlice', () => {
  it('has correct initial state', () => {
    const state = getInitialState();
    expect(state.patternCode).toBe('');
    expect(state.code).toBe('');
    expect(state.hasStarted).toBe(false);
    expect(state.step).toBe(0);
    expect(state.maxStep).toBe(0);
    expect(state.matchStates).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.validationErrors).toEqual({ code: '', pattern: '' });
  });

  describe('setPatternCode', () => {
    it('sets pattern code and resets match state', () => {
      let state = getInitialState();
      state = matcherReducer(state, startMatchSuccess({
        maxSteps: 10,
        matchStates: [1, 2],
        initialState: defaultMatchState,
      }));
      state = matcherReducer(state, setPatternCode('def ?(?*):'));

      expect(state.patternCode).toBe('def ?(?*):');
      expect(state.hasStarted).toBe(false);
      expect(state.step).toBe(0);
    });
  });

  describe('setCode', () => {
    it('sets code and resets match state', () => {
      let state = getInitialState();
      state = matcherReducer(state, startMatchSuccess({
        maxSteps: 10,
        matchStates: [1, 2],
        initialState: defaultMatchState,
      }));
      state = matcherReducer(state, setCode('print("hello")'));

      expect(state.code).toBe('print("hello")');
      expect(state.hasStarted).toBe(false);
      expect(state.step).toBe(0);
    });
  });

  describe('setValidationError', () => {
    it('sets code validation error', () => {
      const state = matcherReducer(
        getInitialState(),
        setValidationError({ type: 'code', error: 'syntax error' })
      );
      expect(state.validationErrors.code).toBe('syntax error');
      expect(state.validationErrors.pattern).toBe('');
    });

    it('sets pattern validation error', () => {
      const state = matcherReducer(
        getInitialState(),
        setValidationError({ type: 'pattern', error: 'invalid pattern' })
      );
      expect(state.validationErrors.pattern).toBe('invalid pattern');
      expect(state.validationErrors.code).toBe('');
    });
  });

  describe('clearValidationError', () => {
    it('clears code validation error', () => {
      let state = matcherReducer(
        getInitialState(),
        setValidationError({ type: 'code', error: 'error' })
      );
      state = matcherReducer(state, clearValidationError('code'));
      expect(state.validationErrors.code).toBe('');
    });

    it('clears pattern validation error', () => {
      let state = matcherReducer(
        getInitialState(),
        setValidationError({ type: 'pattern', error: 'error' })
      );
      state = matcherReducer(state, clearValidationError('pattern'));
      expect(state.validationErrors.pattern).toBe('');
    });
  });

  describe('startMatchRequest', () => {
    it('sets loading and clears error', () => {
      const state = matcherReducer(getInitialState(), startMatchRequest());
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('startMatchSuccess', () => {
    it('sets match data and started flag', () => {
      const state = matcherReducer(
        getInitialState(),
        startMatchSuccess({
          maxSteps: 15,
          matchStates: [1, 5, 10],
          initialState: defaultMatchState,
        })
      );
      expect(state.isLoading).toBe(false);
      expect(state.hasStarted).toBe(true);
      expect(state.maxStep).toBe(15);
      expect(state.matchStates).toEqual([1, 5, 10]);
      expect(state.step).toBe(0);
    });
  });

  describe('startMatchFailure', () => {
    it('sets error and clears loading/started', () => {
      let state = matcherReducer(getInitialState(), startMatchRequest());
      state = matcherReducer(state, startMatchFailure('match failed'));
      expect(state.isLoading).toBe(false);
      expect(state.hasStarted).toBe(false);
      expect(state.error).toBe('match failed');
    });
  });

  describe('setStep', () => {
    it('updates step number', () => {
      const state = matcherReducer(getInitialState(), setStep(5));
      expect(state.step).toBe(5);
    });
  });

  describe('setMatchState', () => {
    it('updates match state', () => {
      const newState: State = {
        ...defaultMatchState,
        currentState: { patternNode: '1', codeNode: '2' },
      };
      const state = matcherReducer(getInitialState(), setMatchState(newState));
      expect(state.matchState.currentState.patternNode).toBe('1');
      expect(state.matchState.currentState.codeNode).toBe('2');
    });
  });

  describe('resetMatcher', () => {
    it('resets all state to initial values', () => {
      let state = getInitialState();
      state = matcherReducer(state, setPatternCode('some pattern'));
      state = matcherReducer(state, setCode('some code'));
      state = matcherReducer(state, setValidationError({ type: 'code', error: 'err' }));
      state = matcherReducer(state, startMatchSuccess({
        maxSteps: 10,
        matchStates: [1],
        initialState: defaultMatchState,
      }));

      state = matcherReducer(state, resetMatcher());

      expect(state.patternCode).toBe('');
      expect(state.code).toBe('');
      expect(state.hasStarted).toBe(false);
      expect(state.step).toBe(0);
      expect(state.maxStep).toBe(0);
      expect(state.matchStates).toEqual([]);
      expect(state.error).toBeNull();
      expect(state.validationErrors).toEqual({ code: '', pattern: '' });
      expect(state.patternGraph).toBeNull();
      expect(state.codeGraph).toBeNull();
    });
  });
});
