// State Types
export interface MatchState {
    patternNode: string;
    codeNode: string;
}

export interface State {
    currentState: MatchState;
    matchedNodes: MatchState[];
    prevMatchedNodes: MatchState[];
    currentStack: string;
    previousStack: string;
    codePos: [number, number];
}

export interface GraphData {
    [key: string]: any; // Cytoscape graph data
}

export interface ValidationError {
    code: string;
    pattern: string;
}

export interface StartMatchResult {
    maxSteps: number;
    matchStates: number[];
    patternNode: string;
    codeNode: string;
}

export interface FetchStepDataResult {
    patternNode: string;
    codeNode: string;
    matchedNodes: MatchState[];
    prevMatchedNodes: MatchState[];
    currentStack: string;
    previousStack: string;
    codePos: [number, number];
}

export interface MatcherState {
    patternCode: string;
    code: string;
    matchState: State;
    // Match controller state
    hasStarted: boolean;
    step: number;
    maxStep: number;
    matchStates: number[];
    isLoading: boolean;
    error: string | null;
    // Validation state
    validationErrors: ValidationError;
    isValidating: boolean;
    // Graph data
    patternGraph: GraphData | null;
    codeGraph: GraphData | null;
    isLoadingGraph: boolean;
}