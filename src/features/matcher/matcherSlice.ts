import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { State, MatcherState, GraphData } from './matcherModels.ts';

// Initial state
const defaultMatchState: State = {
    currentState: { patternNode: "", codeNode: "-1" },
    matchedNodes: [],
    prevMatchedNodes: [],
    currentStack: "",
    previousStack: "",
    codePos: [0, 0],
    variables: [],
    previousVariables: [],
};

const initialState: MatcherState = {
    patternCode: "",
    code: "",
    matchState: defaultMatchState,
    hasStarted: false,
    step: 0,
    maxStep: 0,
    matchStates: [],
    isLoading: false,
    error: null,
    validationErrors: {
        code: "",
        pattern: ""
    },
    isValidating: false,
    patternGraph: null,
    codeGraph: null,
    isLoadingGraph: false,
    selectedNodeId: null,
};

// Create the slice
const matcherSlice = createSlice({
    name: 'matcher',
    initialState,
    reducers: {
        setSelectedNodeId: (state, action: PayloadAction<{ id: string, type: 'pattern' | 'code' } | null>) => {
            state.selectedNodeId = action.payload;
        },
        // Set pattern code
        setPatternCode: (state, action: PayloadAction<string>) => {
            state.patternCode = action.payload;
            state.matchState = defaultMatchState;
            state.hasStarted = false;
            state.step = 0;
        },
        
        // Set code
        setCode: (state, action: PayloadAction<string>) => {
            state.code = action.payload;
            state.matchState = defaultMatchState;
            state.hasStarted = false;
            state.step = 0;
        },
        
        // Set match state
        setMatchState: (state, action: PayloadAction<State>) => {
            state.matchState = action.payload;
        },
        
        // Start match
        startMatchRequest: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        
        startMatchSuccess: (state, action: PayloadAction<{
            maxSteps: number;
            matchStates: number[];
            initialState: State;
        }>) => {
            state.isLoading = false;
            state.hasStarted = true;
            state.maxStep = action.payload.maxSteps;
            state.matchStates = action.payload.matchStates;
            state.matchState = action.payload.initialState;
            state.step = 0;
        },
        
        startMatchFailure: (state, action: PayloadAction<string>) => {
            state.isLoading = false;
            state.hasStarted = false;
            state.error = action.payload;
        },
        
        // Set step
        setStep: (state, action: PayloadAction<number>) => {
            state.step = action.payload;
        },
        
        // Update step state from API
        updateStepState: (state, action: PayloadAction<State>) => {
            // Take the previous variables from the state if the API doesn't provide them
            // or if the API provides an empty set but the current state has one (which suggests the API isn't tracking them)
            let previousVariables = action.payload.previousVariables;
            
            const isPayloadPrevEmpty = !previousVariables || 
                (Array.isArray(previousVariables) && previousVariables.length === 0) ||
                (typeof previousVariables === 'string' && (previousVariables === "[]" || previousVariables === ""));
            
            if (isPayloadPrevEmpty && state.matchState.variables && 
                ((Array.isArray(state.matchState.variables) && state.matchState.variables.length > 0) ||
                 (typeof state.matchState.variables === 'string' && state.matchState.variables.length > 2))) {
                previousVariables = state.matchState.variables;
            }
            
            state.matchState = {
                ...action.payload,
                previousVariables: previousVariables || []
            };
        },
        
        // Reset matcher
        resetMatcher: (state) => {
            state.patternCode = "";
            state.code = "";
            state.matchState = defaultMatchState;
            state.hasStarted = false;
            state.step = 0;
            state.maxStep = 0;
            state.matchStates = [];
            state.error = null;
            state.validationErrors = { code: "", pattern: "" };
            state.isValidating = false;
            state.patternGraph = null;
            state.codeGraph = null;
            state.isLoadingGraph = false;
        },
        
        // Validation actions
        setValidationError: (state, action: PayloadAction<{ type: 'code' | 'pattern'; error: string }>) => {
            if (action.payload.type === 'code') {
                state.validationErrors.code = action.payload.error;
            } else {
                state.validationErrors.pattern = action.payload.error;
            }
        },
        
        clearValidationError: (state, action: PayloadAction<'code' | 'pattern'>) => {
            if (action.payload === 'code') {
                state.validationErrors.code = "";
            } else {
                state.validationErrors.pattern = "";
            }
        },
        
        setIsValidating: (state, action: PayloadAction<boolean>) => {
            state.isValidating = action.payload;
        },
        
        // Graph data actions
        setPatternGraph: (state, action: PayloadAction<GraphData>) => {
            state.patternGraph = action.payload;
        },
        
        setCodeGraph: (state, action: PayloadAction<GraphData>) => {
            state.codeGraph = action.payload;
        },
        
        setIsLoadingGraph: (state, action: PayloadAction<boolean>) => {
            state.isLoadingGraph = action.payload;
        },
    },
});

// Export actions
export const {
    setPatternCode,
    setCode,
    setMatchState,
    startMatchRequest,
    startMatchSuccess,
    startMatchFailure,
    setStep,
    updateStepState,
    resetMatcher,
    setValidationError,
    clearValidationError,
    setIsValidating,
    setPatternGraph,
    setCodeGraph,
    setIsLoadingGraph,
    setSelectedNodeId,
} = matcherSlice.actions;

// Export reducer
export default matcherSlice.reducer;

