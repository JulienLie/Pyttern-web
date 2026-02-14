import { CodeFile, FileStatus, CompoundPattern, CompoundPatternElement, PatternFile, ValidationStatus, MatchRequest, MatchResponse, MatchType } from './compoundModels.ts';
import * as compoundApi from './compoundApi.ts';
import { isNil } from 'lodash';
import * as _ from 'lodash';

export async function validateCodeFiles(codeFiles: CodeFile[]): Promise<CodeFile[]> {
    const filesToValidate = codeFiles.filter(
        file => file.status === FileStatus.PENDING
    );
    const filesToNotValidate = codeFiles.filter(
        file => file.status !== FileStatus.PENDING
    );

    const data = await compoundApi.validateCodeFiles(filesToValidate);

    const unknownError = {
        line: 0,
        column: 0,
        symbol: '',
        msg: 'Unknown error occurred',
    };

    const updatedCodeFiles = filesToValidate.map((file) => {
        const result = data[file.filename];

        if (isNil(result)) {
            return {
                ...file,
                status: FileStatus.ERROR,
                validationError: unknownError
            };
        }

        if (result.status === ValidationStatus.OK) {
            return {
                ...file,
                status: FileStatus.READY,
                validationError: null
            };
        } else {
            return {
                ...file,
                status: FileStatus.ERROR,
                validationError: result.message ?? unknownError
            };
        }
    });

    return [...filesToNotValidate, ...updatedCodeFiles];
}

export function findPatternFileByFilename(
    compoundPattern: CompoundPattern,
    filename: string
): PatternFile | null {
    const traverse = (element: CompoundPatternElement): PatternFile | null => {
        if ('code' in element) {
            if (element.filename === filename) {
                return element as PatternFile;
            }
            return null;
        } else if ('children' in element && element.children) {
            for (const child of element.children) {
                const result = traverse(child);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    };

    for (const child of compoundPattern.children) {
        const result = traverse(child);
        if (result) {
            return result;
        }
    }
    return null;
}

export function selectPatternsRecursively(
    element: CompoundPatternElement,
    selectedPattern: string,
    selectedPatterns: string[]
): string[] {
    if ('isSelected' in element) {
        if (selectedPattern === element.filename) {
            element.isSelected = !element.isSelected;
            
            if (element.isSelected) {
                if (!selectedPatterns.includes(element.filename)) {
                    selectedPatterns.push(element.filename);
                }
            } else {
                const index = selectedPatterns.indexOf(element.filename);
                if (index > -1) {
                    selectedPatterns.splice(index, 1);
                }
            }
        }
    } else if (element.children && element.children.length > 0) {
        element.children.forEach((child) => selectPatternsRecursively(child, selectedPattern, selectedPatterns));
    }
    
    return selectedPatterns;
}

export function getPatternFilesOfCompound(compoundPattern: CompoundPattern): PatternFile[] {
    const patternFiles: PatternFile[] = [];
    
    const traverse = (element: CompoundPatternElement, isUnderNot: boolean = false) => {
        if ('code' in element) {
            // This is a PatternFile - set isUnderNot property
            const patternFile: PatternFile = {
                ...element,
                isUnderNot: isUnderNot
            };
            patternFiles.push(patternFile);
        } else if ('children' in element && element.children) {
            // This is a CompoundPattern - check if it's a NOT operator
            const isNotOperator = element.name.toLowerCase() === 'not';
            const newIsUnderNot = isUnderNot || isNotOperator;
            element.children.forEach(child => traverse(child, newIsUnderNot));
        }
    };

    compoundPattern.children.forEach(child => traverse(child, false));
    return patternFiles;
}

export async function validateCompoundPattern(compoundPattern: CompoundPattern): Promise<CompoundPattern> {
    const patternFiles = getPatternFilesOfCompound(compoundPattern);
    const validatedPatternFiles = await validatePatterns(patternFiles);

    // Create a map of validated pattern files by filename for quick lookup
    const validatedPatternMap = new Map<string, PatternFile>();
    validatedPatternFiles.forEach(file => {
        validatedPatternMap.set(file.filename, file);
    });

    // Recursively update pattern files in the compound pattern structure
    const updatePatternFiles = (element: CompoundPatternElement): CompoundPatternElement => {
        if ('code' in element) {
            // This is a PatternFile
            const validatedFile = validatedPatternMap.get(element.filename);
            return validatedFile || element;
        } else {
            // This is a CompoundPattern
            return {
                ...element,
                children: element.children.map(child => updatePatternFiles(child))
            };
        }
    };

    const updatedCompoundPattern: CompoundPattern = {
        ...compoundPattern,
        children: compoundPattern.children.map(child => updatePatternFiles(child))
    };

    return updatedCompoundPattern
}


export async function validatePatterns(patternFiles: PatternFile[]): Promise<PatternFile[]> {
    const data = await compoundApi.validateCodeFiles(patternFiles);

    const unknownError = {
        line: 0,
        column: 0,
        symbol: '',
        msg: 'Unknown error occurred',
    };

    const updatedPatternFiles = patternFiles.map((file) => {
        const result = data[file.filename];

        if (isNil(result)) {
            return {
                ...file,
                status: FileStatus.ERROR,
                validationError: unknownError
            };
        }

        if (result.status === ValidationStatus.OK) {
            return {
                ...file,
                status: FileStatus.READY,
                validationError: null
            };
        } else {
            return {
                ...file,
                status: FileStatus.ERROR,
                validationError: result.message ?? unknownError
            };
        }
    });

    return updatedPatternFiles;
}

export async function startMatch(compoundPattern: CompoundPattern, codeFiles: CodeFile[]): Promise<CodeFile[]> {
    const matchResponse = await compoundApi.match(compoundPattern, codeFiles);

    const updatedCodeFiles = codeFiles.map((file) => {
        const matchResult = matchResponse[file.filename];

        if (isNil(matchResult)) {
            return {
                ...file,
                status: FileStatus.ERROR,
            };
        }

        return {
            ...file,
            patternsMatchResults: matchResult.patternsMatchResults,
            status: matchResult.status === MatchType.MATCH ? FileStatus.MATCHED : FileStatus.NOT_MATCHED,
        };
    });

    const sortedCodeFiles = _.sortBy(updatedCodeFiles, file => {
        if (file.status === FileStatus.MATCHED) return 0;
        if (file.status === FileStatus.NOT_MATCHED) return 1;
        return 2;
    });

    return sortedCodeFiles;
}