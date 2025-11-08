import { CodeFile, FileStatus, CompoundPattern, CompoundPatternElement, PatternFile } from './compoundModels.ts';
import { ValidationStatus } from './compoundApi.ts';
import * as compoundApi from './compoundApi.ts';
import { isNil } from 'lodash';

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
    
    const traverse = (element: CompoundPatternElement) => {
        if ('code' in element) {
            patternFiles.push(element as PatternFile);
        } else if ('children' in element && element.children) {
            element.children.forEach(child => traverse(child));
        }
    };

    compoundPattern.children.forEach(child => traverse(child));
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
