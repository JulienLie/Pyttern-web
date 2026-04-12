import { describe, it, expect } from 'vitest';
import appLoaderReducer, { setAppLoaderOn, setAppLoaderOff } from '../appLoaderSlice';

describe('appLoaderSlice', () => {
  it('has initial state with isLoading false', () => {
    const state = appLoaderReducer(undefined, { type: 'unknown' });
    expect(state.isLoading).toBe(false);
  });

  it('sets isLoading to true on setAppLoaderOn', () => {
    const state = appLoaderReducer(undefined, setAppLoaderOn());
    expect(state.isLoading).toBe(true);
  });

  it('sets isLoading to false on setAppLoaderOff', () => {
    const prev = appLoaderReducer(undefined, setAppLoaderOn());
    const state = appLoaderReducer(prev, setAppLoaderOff());
    expect(state.isLoading).toBe(false);
  });

  it('toggles correctly in sequence', () => {
    let state = appLoaderReducer(undefined, setAppLoaderOn());
    expect(state.isLoading).toBe(true);

    state = appLoaderReducer(state, setAppLoaderOff());
    expect(state.isLoading).toBe(false);

    state = appLoaderReducer(state, setAppLoaderOn());
    expect(state.isLoading).toBe(true);
  });
});
