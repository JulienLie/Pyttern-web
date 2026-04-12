import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatValidationErrorMessage,
  startMatch,
  fetchStepData,
  fetchGraphData,
} from '../matcherService';
import * as matcherApi from '../matcherApi';

vi.mock('../matcherApi');

describe('formatValidationErrorMessage', () => {
  it('returns the string directly when message is a string', () => {
    expect(formatValidationErrorMessage('syntax error')).toBe('syntax error');
  });

  it('formats object message with line, column, and msg', () => {
    const message = { line: 5, column: 10, msg: 'unexpected token' };
    expect(formatValidationErrorMessage(message)).toBe(
      'Error at line 5:10 - unexpected token'
    );
  });

  it('returns default message when message is undefined', () => {
    expect(formatValidationErrorMessage(undefined)).toBe('Validation failed');
  });

  it('returns default message when message is null', () => {
    expect(formatValidationErrorMessage(null as unknown as undefined)).toBe(
      'Validation failed'
    );
  });

  it('formats object message with zero line/column', () => {
    const message = { line: 0, column: 0, msg: 'parse error' };
    expect(formatValidationErrorMessage(message)).toBe(
      'Error at line 0:0 - parse error'
    );
  });
});

describe('startMatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps the API response into a StartMatchResult', async () => {
    vi.mocked(matcherApi.matchPattern).mockResolvedValue({
      status: 'ok',
      state: ['p0', 'c0'],
      n_steps: 7,
      match_states: [0, 2, 5],
    });

    const result = await startMatch('print(x)', 'print(?)');

    expect(matcherApi.matchPattern).toHaveBeenCalledWith('print(x)', 'print(?)');
    expect(result).toEqual({
      maxSteps: 7,
      matchStates: [0, 2, 5],
      patternNode: 'p0',
      codeNode: 'c0',
    });
  });

  it('propagates errors from the API layer', async () => {
    vi.mocked(matcherApi.matchPattern).mockRejectedValue(new Error('boom'));
    await expect(startMatch('code', 'pattern')).rejects.toThrow('boom');
  });
});

describe('fetchStepData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles empty matching arrays', async () => {
    vi.mocked(matcherApi.fetchStep).mockResolvedValue({
      status: 'ok',
      state: ['p0', 'c0'],
      current_matchings: [],
      previous_matchings: [],
      current_stack: '',
      previous_stack: '',
      code_pos: [0, 0],
    });

    const result = await fetchStepData(0);

    expect(result.matchedNodes).toEqual([]);
    expect(result.prevMatchedNodes).toEqual([]);
    expect(result.codePos).toEqual([0, 1]);
  });
});

describe('fetchGraphData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the graph payload from the API for pattern graphs', async () => {
    const graph = { nodes: [{ id: 'n1' }], edges: [] };
    vi.mocked(matcherApi.fetchGraph).mockResolvedValue({
      status: 'ok',
      graph,
    });

    const result = await fetchGraphData('print(x)', 'pattern');

    expect(matcherApi.fetchGraph).toHaveBeenCalledWith('print(x)', 'pattern');
    expect(result).toBe(graph);
  });
});