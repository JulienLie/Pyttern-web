export interface CodeFile {
    filename: string;
    status: FileStatus;
    code: string;
    lang: string;
    validationError?: ValidationError | null;
}

export interface ValidationError {
    line: number;
    column: number;
    symbol: string;
    msg: string;
}

export enum FileStatus {
    READY = 'ready',
    PENDING = 'pending',
    ERROR = 'error',
}

export interface CompoundPattern {
    name: string;
    children: CompoundPatternElement[];
    validationError?: ValidationError | null;
}

export type CompoundPatternElement = CompoundPattern | PatternFile;

export interface PatternFile extends CodeFile {
    isSelected: boolean;
}

export interface CompoundState {
    codeFiles: CodeFile[];
    compoundPattern?: CompoundPattern | null;
    isLoading: boolean;
    matchError: string | null;
    isFilesReadyToMatch: boolean;
    isPatternReadyToMatch: boolean;
    selectedPatterns: string[];
}