import { describe, it, expect } from 'vitest';
import { formatValidationErrorMessage } from '../matcherService';

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

  it('formats object message with zero line/column', () => {
    const message = { line: 0, column: 0, msg: 'parse error' };
    expect(formatValidationErrorMessage(message)).toBe(
      'Error at line 0:0 - parse error'
    );
  });
});
