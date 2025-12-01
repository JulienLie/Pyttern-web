export interface CodeFile {
    filename: string;
    status: FileStatus;
    code: string;
    lang: string;
    patternsMatchResults?: PatternsMatchResult;
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
    MATCHED = 'matched',
    NOT_MATCHED = "not-matched",
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
    matchStatus?: PatternMatchStatus; // only used for pattern trees in code files tab
    isUnderNot?: boolean; // indicates if the pattern file is under a NOT folder
}

export enum MatchType {
    MATCH = 'match',
    NOT_MATCH = 'not_match',
}

export enum ClickPatternType {
    NONE = 'none',
    FILTER = 'filter',
    MATCHER = 'matcher',
}

export enum PatternMatchStatus {
    MATCHED = 'matched',
    NOT_MATCHED = 'not-matched',
    NOT_CHECKED = 'not-checked',
}

export interface PatternFilterConfig {
    matchType: MatchType;
    includeUnchecked: boolean;
}

export interface PatternsMatchResult {
    [patternFilename: string]: {
        matchType: PatternMatchStatus;
    }
}

export interface CompoundState {
    codeFiles: CodeFile[];
    compoundPattern?: CompoundPattern | null;
    isLoading: boolean;
    err: string | null;
    isFilesReadyToMatch: boolean;
    isPatternReadyToMatch: boolean;
    isMatchDone: boolean;
    selectedPatterns: string[];
    patternFilters: Record<string, PatternFilterConfig>;
}

// --- Action Payloads ---
export interface UpdatePatternFilterPayload {
    patternFilename: string;
    matchType?: MatchType;
    includeUnchecked?: boolean;
}


// --- API Models ---
export interface ValidationRequest {
    codes: {
        filename: string;
        code: string;
    }[];
    lang?: string;
}

export interface ValidationResponse {
    [filename: string]: {
        status: ValidationStatus;
        message?: {
            line: number;
            column: number;
            symbol: string;
            msg: string;
        } | null;
    };
}

export enum ValidationStatus {
    OK = 'ok',
    ERROR = 'error',
}

export interface MatchRequest extends ValidationRequest {
    compoundPattern: CompoundPattern;
}

export interface MatchResponse {
    [filename: string]: {
        status: MatchType; // TODO: Check that this will be like this or like ValidationStatus
        patternsMatchResults: PatternsMatchResult;
        message?: {
            line: number;
            column: number;
            symbol: string;
            msg: string;
        } | null;
    };
}
