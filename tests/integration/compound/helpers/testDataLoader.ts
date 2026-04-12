import * as fs from 'fs';
import * as path from 'path';
import { CompoundPattern, CompoundPatternElement, PatternFile, CodeFile, FileStatus } from '../../../../src/features/compound/compoundModels';
import {getLangFromFileExtension} from "../../../../src/common/utils/langUtils";


const TEST_DATA_DIR = path.resolve(__dirname, '../../../../Test-Data');
export const COMPOUND_PATTERNS_DIR = path.join(TEST_DATA_DIR, 'CompoundPatterns');
export const CODES_DIR = path.join(TEST_DATA_DIR, 'Codes');


export function loadCompoundPattern(patternName: string): CompoundPattern {
  const patternDir = path.join(COMPOUND_PATTERNS_DIR, patternName);
  if (!fs.existsSync(patternDir)) {
    throw new Error(`Pattern directory not found: ${patternDir}`);
  }

  return buildTree(patternDir, patternName, false);
}

function buildTree(dirPath: string, name: string, isUnderNot: boolean): CompoundPattern {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    .filter(e => e.name !== '.DS_Store');

  const children: CompoundPatternElement[] = [];
  const isNotOperator = name.toLowerCase() === 'not';
  const newIsUnderNot = isUnderNot || isNotOperator;

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      children.push(buildTree(fullPath, entry.name, newIsUnderNot));
    } else if (entry.isFile() && (entry.name.endsWith('.pyt') || entry.name.endsWith('.py'))) {
      const code = fs.readFileSync(fullPath, 'utf-8').trim();
      const patternFile: PatternFile = {
        filename: entry.name,
        code,
        status: FileStatus.PENDING,
        lang: getLangFromFileExtension(entry.name),
        isSelected: false,
        isUnderNot: newIsUnderNot,
      };
      children.push(patternFile);
    }
  }

  return { name, children };
}

export function loadCodeFiles(patternName: string): CodeFile[] {
  const codesDir = path.join(CODES_DIR, patternName);
  if (!fs.existsSync(codesDir)) {
    throw new Error(`Codes directory not found: ${codesDir}`);
  }

  const files = fs.readdirSync(codesDir)
    .filter(f => f.endsWith('.py'))
    .sort();

  return files.map(filename => {
    const code = fs.readFileSync(path.join(codesDir, filename), 'utf-8');
    return {
      filename,
      status: FileStatus.PENDING,
      code,
      lang: getLangFromFileExtension(filename),
    };
  });
}

export function getAvailablePatternNames(): string[] {
  return fs.readdirSync(COMPOUND_PATTERNS_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory() && e.name !== '.DS_Store')
    .map(e => e.name)
    .sort();
}
