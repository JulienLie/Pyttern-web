import { describe, it, expect } from 'vitest';
import { buildMatchResultsCsv } from '../csvUtils';
import { CodeFile, FileStatus, PatternMatchStatus } from '../compoundModels';

function makeCodeFile(overrides: Partial<CodeFile> = {}): CodeFile {
  return {
    filename: 'test.py',
    status: FileStatus.MATCHED,
    code: 'print("hello")',
    lang: 'python',
    ...overrides,
  };
}

describe('buildMatchResultsCsv', () => {
  it('produces header-only CSV for empty codeFiles', () => {
    const csv = buildMatchResultsCsv([], 'TestPattern');
    expect(csv).toBe('Code File Name,TestPattern');
  });

  it('produces correct CSV for a single file with match results', () => {
    const file = makeCodeFile({
      filename: 'code.py',
      status: FileStatus.MATCHED,
      patternsMatchResults: {
        'print.pyt': { matchType: PatternMatchStatus.MATCHED },
        'return.pyt': { matchType: PatternMatchStatus.NOT_MATCHED },
      },
    });
    const csv = buildMatchResultsCsv([file], 'PrintReturn');
    const lines = csv.split('\n');

    expect(lines[0]).toBe('Code File Name,PrintReturn,print.pyt,return.pyt');
    expect(lines[1]).toBe('code.py,matched,matched,not-matched');
  });

  it('sorts pattern columns alphabetically', () => {
    const file = makeCodeFile({
      patternsMatchResults: {
        'z_pattern.pyt': { matchType: PatternMatchStatus.MATCHED },
        'a_pattern.pyt': { matchType: PatternMatchStatus.NOT_MATCHED },
      },
    });
    const csv = buildMatchResultsCsv([file], 'Test');
    const header = csv.split('\n')[0];

    expect(header).toBe('Code File Name,Test,a_pattern.pyt,z_pattern.pyt');
  });

  it('shows "not-validated" for files with validationError', () => {
    const file = makeCodeFile({
      filename: 'bad.py',
      status: FileStatus.NOT_VALIDATED,
      validationError: { line: 1, column: 0, symbol: '', msg: 'syntax error' },
      patternsMatchResults: {
        'print.pyt': { matchType: PatternMatchStatus.MATCHED },
      },
    });
    const csv = buildMatchResultsCsv([file], 'Test');
    const dataRow = csv.split('\n')[1];

    expect(dataRow).toBe('bad.py,not-validated,not-validated');
  });

  it('shows empty string for missing pattern result', () => {
    const file1 = makeCodeFile({
      filename: 'a.py',
      patternsMatchResults: {
        'p1.pyt': { matchType: PatternMatchStatus.MATCHED },
      },
    });
    const file2 = makeCodeFile({
      filename: 'b.py',
      patternsMatchResults: {
        'p2.pyt': { matchType: PatternMatchStatus.NOT_MATCHED },
      },
    });
    const csv = buildMatchResultsCsv([file1, file2], 'Test');
    const lines = csv.split('\n');

    // Header should have both pattern columns
    expect(lines[0]).toBe('Code File Name,Test,p1.pyt,p2.pyt');
    // file1 has p1 but not p2
    expect(lines[1]).toBe('a.py,matched,matched,');
    // file2 has p2 but not p1
    expect(lines[2]).toBe('b.py,matched,,not-matched');
  });

  it('escapes filenames containing commas', () => {
    const file = makeCodeFile({
      filename: 'file,with,commas.py',
      status: FileStatus.MATCHED,
    });
    const csv = buildMatchResultsCsv([file], 'Test');
    const dataRow = csv.split('\n')[1];

    expect(dataRow).toContain('"file,with,commas.py"');
  });

  it('escapes filenames containing double quotes', () => {
    const file = makeCodeFile({
      filename: 'file"name.py',
      status: FileStatus.MATCHED,
    });
    const csv = buildMatchResultsCsv([file], 'Test');
    const dataRow = csv.split('\n')[1];

    expect(dataRow).toContain('"file""name.py"');
  });

  it('handles multiple files with varying statuses', () => {
    const files = [
      makeCodeFile({ filename: 'matched.py', status: FileStatus.MATCHED }),
      makeCodeFile({ filename: 'not_matched.py', status: FileStatus.NOT_MATCHED }),
    ];
    const csv = buildMatchResultsCsv(files, 'Test');
    const lines = csv.split('\n');

    expect(lines).toHaveLength(3); // header + 2 data rows
    expect(lines[1]).toContain('matched.py,matched');
    expect(lines[2]).toContain('not_matched.py,not-matched');
  });
});
