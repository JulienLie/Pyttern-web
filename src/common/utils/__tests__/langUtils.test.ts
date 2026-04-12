import { describe, it, expect } from 'vitest';
import { getLangFromFileExtension, getExtensionsForLang } from '../langUtils';

describe('getLangFromFileExtension', () => {
  it('returns "python" for .py files', () => {
    expect(getLangFromFileExtension('script.py')).toBe('python');
  });

  it('returns "python" for .pyt files', () => {
    expect(getLangFromFileExtension('pattern.pyt')).toBe('python');
  });

  it('returns "python" for .pyh files', () => {
    expect(getLangFromFileExtension('helper.pyh')).toBe('python');
  });

  it('returns "java" for .java files', () => {
    expect(getLangFromFileExtension('Main.java')).toBe('java');
  });

  it('returns "java" for .jat files', () => {
    expect(getLangFromFileExtension('Pattern.jat')).toBe('java');
  });

  it('returns empty string for unknown extensions', () => {
    expect(getLangFromFileExtension('readme.md')).toBe('');
  });

  it('returns empty string for files with no extension', () => {
    expect(getLangFromFileExtension('noextension')).toBe('');
  });

  it('returns empty string for empty string input', () => {
    expect(getLangFromFileExtension('')).toBe('');
  });

  it('handles files with multiple dots', () => {
    expect(getLangFromFileExtension('my.test.py')).toBe('python');
  });
});

describe('getExtensionsForLang', () => {
  it('returns [".py", ".pyt"] for python', () => {
    expect(getExtensionsForLang('python')).toEqual(['.py', '.pyt']);
  });

  it('returns [".java"] for java', () => {
    expect(getExtensionsForLang('java')).toEqual(['.java']);
  });

  it('returns empty array for unknown language', () => {
    expect(getExtensionsForLang('unknown')).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(getExtensionsForLang('')).toEqual([]);
  });
});
