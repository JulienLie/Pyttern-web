import { describe, it, expect } from 'vitest';
import { getApiErrorMessage } from '../compoundThunks';

describe('getApiErrorMessage', () => {
  it('returns message from Error instance', () => {
    expect(getApiErrorMessage(new Error('Something broke'))).toBe('Something broke');
  });

  it('returns network error message for "Failed to fetch"', () => {
    expect(getApiErrorMessage(new Error('Failed to fetch'))).toBe(
      'Network error. Please check your connection.'
    );
  });

  it('returns network error message for TypeError', () => {
    expect(getApiErrorMessage(new TypeError('some type error'))).toBe(
      'Network error. Please check your connection.'
    );
  });

  it('returns the string directly for string errors', () => {
    expect(getApiErrorMessage('raw error')).toBe('raw error');
  });

  it('returns default message for number', () => {
    expect(getApiErrorMessage(42)).toBe('An error occurred. Please try again.');
  });

  it('returns default message for null', () => {
    expect(getApiErrorMessage(null)).toBe('An error occurred. Please try again.');
  });

  it('returns default message for undefined', () => {
    expect(getApiErrorMessage(undefined)).toBe('An error occurred. Please try again.');
  });

  it('returns default message for object', () => {
    expect(getApiErrorMessage({ code: 500 })).toBe('An error occurred. Please try again.');
  });
});
