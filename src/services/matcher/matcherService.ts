/**
 * Matcher Service Layer
 * Business logic and orchestration using Redux Toolkit async thunks
 * Uses the API layer for HTTP requests
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
    startMatchRequest, 
    startMatchSuccess, 
    startMatchFailure,
    updateStepState,
    setValidationError,
    clearValidationError,
    setIsValidating,
    setPatternCode,
    setCode as setCodeAction,
    setPatternGraph,
    setCodeGraph,
    setIsLoadingGraph,
    State,
    MatchState,
    GraphData
} from '../../store/slices/matcherSlice';
import { RootState } from '../../store/store';
import * as matcherApi from '../../api/matcherApi';

/**
 * Async thunk to start a pattern matching operation
 * Orchestrates the matching process using the API layer
 */
export const startMatch = createAsyncThunk<
    void,
    void,
    { state: RootState }
>(
    'matcher/startMatch',
    async (_, { dispatch, getState }) => {
        const { matcher } = getState();
        const { code, patternCode } = matcher;

        dispatch(startMatchRequest());

        try {
            const data = await matcherApi.matchPattern(code, patternCode);

            const initialState: State = {
                currentState: { 
                    patternNode: data.state[0], 
                    codeNode: data.state[1] 
                },
                matchedNodes: [],
                prevMatchedNodes: [],
                currentStack: "",
                previousStack: "",
                codePos: [0, 0],
            };

            dispatch(startMatchSuccess({
                maxSteps: data.n_steps,
                matchStates: data.match_states,
                initialState,
            }));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            dispatch(startMatchFailure(message));
            throw error;
        }
    }
);

/**
 * Async thunk to fetch step data
 * Updates the match state based on the current step using the API layer
 */
export const fetchStepData = createAsyncThunk<
    void,
    number,
    { state: RootState }
>(
    'matcher/fetchStepData',
    async (step, { dispatch }) => {
        try {
            // Call API layer
            const data = await matcherApi.fetchStep(step);

            // Transform the API response to Redux state format
            const matchedNodes: MatchState[] = data.current_matchings.map(
                (match: [string, string]) => ({
                    patternNode: match[0],
                    codeNode: match[1],
                })
            );

            const prevMatchedNodes: MatchState[] = data.previous_matchings.map(
                (match: [string, string]) => ({
                    patternNode: match[0],
                    codeNode: match[1],
                })
            );

            const codePos: [number, number] = [data.code_pos[0], data.code_pos[1] + 1];

            const newState: State = {
                currentState: {
                    patternNode: data.state[0],
                    codeNode: data.state[1],
                },
                matchedNodes,
                prevMatchedNodes,
                currentStack: data.current_stack,
                previousStack: data.previous_stack,
                codePos,
            };

            dispatch(updateStepState(newState));
        } catch (error) {
            console.error('Error fetching step data:', error);
            throw error;
        }
    }
);

/**
 * Async thunk to validate code
 * Validates pattern or code syntax using the API layer and updates Redux state
 */
export const validateCode = createAsyncThunk<
    void,
    { code: string; lang: string; type: 'pattern' | 'code' },
    { state: RootState }
>(
    'matcher/validateCode',
    async ({ code, lang, type }, { dispatch }) => {
        dispatch(setIsValidating(true));
        
        try {
            // Call API layer
            const data = await matcherApi.validateCode(code, lang);

            if (data.status === 'ok') {
                // Validation successful - clear error and update code in Redux
                dispatch(clearValidationError(type));
                if (type === 'pattern') {
                    dispatch(setPatternCode(code));
                } else {
                    dispatch(setCodeAction(code));
                }
            } else {
                // Validation failed - set error
                const infos = data.message;
                let errorMessage: string;
                
                if (typeof infos === 'string') {
                    errorMessage = infos;
                } else if (infos && typeof infos === 'object') {
                    errorMessage = `Error at line ${infos.line}:${infos.column} - ${infos.msg}`;
                } else {
                    errorMessage = 'Validation failed';
                }
                
                dispatch(setValidationError({ type, error: errorMessage }));
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Validation failed';
            dispatch(setValidationError({ type, error: message }));
        } finally {
            dispatch(setIsValidating(false));
        }
    }
);

/**
 * Async thunk to fetch graph data for Cytoscape visualization
 * Fetches AST/graph representation using the API layer
 */
export const fetchGraphData = createAsyncThunk<
    void,
    { code: string; type: 'pattern' | 'code' },
    { state: RootState }
>(
    'matcher/fetchGraphData',
    async ({ code, type }, { dispatch }) => {
        dispatch(setIsLoadingGraph(true));
        
        try {
            // Call API layer
            const data = await matcherApi.fetchGraph(code, type);

            // Store the graph data in Redux
            const graphData: GraphData = data.graph;
            
            if (type === 'pattern') {
                dispatch(setPatternGraph(graphData));
            } else {
                dispatch(setCodeGraph(graphData));
            }
        } catch (error) {
            console.error(`Error fetching ${type} graph data:`, error);
            throw error;
        } finally {
            dispatch(setIsLoadingGraph(false));
        }
    }
);

