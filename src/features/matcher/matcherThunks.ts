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
} from './matcherSlice.ts';
import { RootState } from '../../app/store.ts';
import * as matcherApi from './matcherApi.ts';
import * as matcherService from './matcherService.ts';
import { State } from './matcherModels.ts';

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
            const result = await matcherService.startMatch(code, patternCode);
            
            // Create initialState from service result
            const initialState: State = {
                currentState: { 
                    patternNode: result.patternNode, 
                    codeNode: result.codeNode 
                },
                matchedNodes: [],
                prevMatchedNodes: [],
                currentStack: "",
                previousStack: "",
                codePos: [0, 0],
            };

            dispatch(startMatchSuccess({
                maxSteps: result.maxSteps,
                matchStates: result.matchStates,
                initialState,
            }));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            dispatch(startMatchFailure(message));
            throw error;
        }
    }
);

export const fetchStepData = createAsyncThunk<
    void,
    number,
    { state: RootState }
>(
    'matcher/fetchStepData',
    async (step, { dispatch }) => {
        try {
            const result = await matcherService.fetchStepData(step);
            
            // Create State from service result
            const newState: State = {
                currentState: {
                    patternNode: result.patternNode,
                    codeNode: result.codeNode,
                },
                matchedNodes: result.matchedNodes,
                prevMatchedNodes: result.prevMatchedNodes,
                currentStack: result.currentStack,
                previousStack: result.previousStack,
                codePos: result.codePos,
            };

            dispatch(updateStepState(newState));
        } catch (error) {
            console.error('Error fetching step data:', error);
            throw error;
        }
    }
);

export const validateCode = createAsyncThunk<
    void,
    { code: string; lang: string; type: 'pattern' | 'code' },
    { state: RootState }
>(
    'matcher/validateCode',
    async ({ code, lang, type }, { dispatch }) => {
        dispatch(setIsValidating(true));
        
        try {
            const data = await matcherApi.validateCode(code, lang);

            if (data.status === 'ok') {
                dispatch(clearValidationError(type));
                if (type === 'pattern') {
                    dispatch(setPatternCode(code));
                } else {
                    dispatch(setCodeAction(code));
                }
            } else {
                const errorMessage = matcherService.formatValidationErrorMessage(data.message);
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

export const fetchGraphData = createAsyncThunk<
    void,
    { code: string; type: 'pattern' | 'code' },
    { state: RootState }
>(
    'matcher/fetchGraphData',
    async ({ code, type }, { dispatch }) => {
        dispatch(setIsLoadingGraph(true));
        
        try {
            const graphData = await matcherService.fetchGraphData(code, type);
            
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

