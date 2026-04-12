import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { loadCompoundPattern, loadCodeFiles, getAvailablePatternNames } from './helpers/testDataLoader';
import {
  validateCodeFiles,
  validateCompoundPattern,
  startMatch,
  getPatternFilesOfCompound,
} from '../../../src/features/compound/compoundService';
import {
  FileStatus,
} from '../../../src/features/compound/compoundModels';

const BACKEND_URL = process.env.BACKEND_URL!;

const originalFetch = globalThis.fetch;

beforeAll(() => {
  // rewrites /api/... → http://127.0.0.1:5001/api/...
  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string' && input.startsWith('/api')) {
      return originalFetch(`${BACKEND_URL}${input}`, init);
    }
    return originalFetch(input, init);
  };
});

afterAll(() => {
  globalThis.fetch = originalFetch;
});

// --- Tests ---
describe('Compound service pipeline with real backend', () => {
  const allPatterns = getAvailablePatternNames();

  describe('validateCodeFiles', () => {
    describe.each(allPatterns)('%s', (patternName) => {
      it('validates all code files against the real backend', async () => {
        const codeFiles = loadCodeFiles(patternName);

        const result = await validateCodeFiles(codeFiles);

        expect(result).toHaveLength(codeFiles.length);
        for (const file of result) {
          expect(file.status).toBe(FileStatus.VALIDATED);
          expect(file.validationError).toBeNull();
        }
      });
    });
  });

  describe('validateCompoundPattern', () => {
    describe.each(allPatterns)('%s', (patternName) => {
      it('validates all pattern files against the real backend', async () => {
        const pattern = loadCompoundPattern(patternName);
        const patternFiles = getPatternFilesOfCompound(pattern);

        const result = await validateCompoundPattern(pattern);

        expect(result.name).toBe(patternName);

        const resultFiles = getPatternFilesOfCompound(result);
        expect(resultFiles).toHaveLength(patternFiles.length);
        for (const file of resultFiles) {
          expect(file.status).toBe(FileStatus.VALIDATED);
          expect(file.validationError).toBeNull();
        }
      });
    });
  });

  describe('startMatch', () => {
    describe.each(allPatterns)('%s', (patternName) => {
      it('matches code files and classifies them correctly', async () => {
        const pattern = loadCompoundPattern(patternName);

        // Validate pattern first
        const validatedPattern = await validateCompoundPattern(pattern);
        const patternFiles = getPatternFilesOfCompound(validatedPattern);
        expect(patternFiles.every(f => f.status === FileStatus.VALIDATED)).toBe(true);

        // Validate code files
        const codeFiles = loadCodeFiles(patternName);
        const validatedCodeFiles = await validateCodeFiles(codeFiles);
        expect(validatedCodeFiles.every(f => f.status === FileStatus.VALIDATED)).toBe(true);

        // Run match
        const result = await startMatch(validatedPattern, validatedCodeFiles);

        expect(result).toHaveLength(codeFiles.length);

        const matchedFiles = result.filter(f => f.status === FileStatus.MATCHED);
        const notMatchedFiles = result.filter(f => f.status === FileStatus.NOT_MATCHED);

        // All files should be classified (no errors)
        expect(matchedFiles.length + notMatchedFiles.length).toBe(codeFiles.length);

        // Verify results match the filename convention
        for (const file of result) {
          if (file.filename.startsWith('match_')) {
            expect(file.status).toBe(FileStatus.MATCHED);
          } else if (file.filename.startsWith('no_match_')) {
            expect(file.status).toBe(FileStatus.NOT_MATCHED);
          }
        }

        // Verify sort order: MATCHED before NOT_MATCHED
        const firstNotMatchedIdx = result.findIndex(f => f.status === FileStatus.NOT_MATCHED);
        const lastMatchedIdx = result.map(f => f.status).lastIndexOf(FileStatus.MATCHED);
        if (firstNotMatchedIdx >= 0 && lastMatchedIdx >= 0) {
          expect(lastMatchedIdx).toBeLessThan(firstNotMatchedIdx);
        }

        // Verify each file has patternsMatchResults
        const patternFilenames = patternFiles.map(f => f.filename);
        for (const file of result) {
          expect(file.patternsMatchResults).toBeDefined();
          for (const pf of patternFilenames) {
            expect(file.patternsMatchResults![pf]).toBeDefined();
          }
        }
      });
    });
  });
});
