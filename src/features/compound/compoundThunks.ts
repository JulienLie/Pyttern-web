import { createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { RootState } from "../../app/store.ts";
import { CodeFile, CompoundPattern } from "./compoundModels.ts";
import { setAppLoaderOff, setAppLoaderOn } from "../../common/slices/appLoaderSlice.ts";
import * as compoundService from './compoundService.ts';

function getApiErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            return 'Network error. Please check your connection.';
        }
        return error.message;
    }
    if (typeof error === 'string') return error;
    return 'An error occurred. Please try again.';
}

export const validateCodeFiles = createAsyncThunk<
    CodeFile[],
    void,
    { state: RootState }
>(
    'compound/validateCodeFiles',
    async (_, { dispatch, getState }) => {
        dispatch(setAppLoaderOn());

        try {
            const { compound } = getState();
            const codeFiles: CodeFile[] = compound.codeFiles;
            return await compoundService.validateCodeFiles(codeFiles);
        } catch (error) {
            console.error("Error validating code files:", error);
            toast.error(getApiErrorMessage(error));
            throw error;
        }
        finally {
            dispatch(setAppLoaderOff());
        }
    }
);



export const validatePatterns = createAsyncThunk<
    CompoundPattern,
    void,
    { state: RootState }
>(
    'compound/validatePatterns',
    async (_, { dispatch, getState }) => {
        dispatch(setAppLoaderOn());

        try {
            const { compound } = getState();
            const compoundPattern = compound.compoundPattern;
            
            if (!compoundPattern) {
                throw new Error('No compound pattern provided');
            }

            return await compoundService.validateCompoundPattern(compoundPattern);
        } catch (error) {
            console.error("Error validating patterns:", error);
            toast.error(getApiErrorMessage(error));
            throw error;
        } finally {
            dispatch(setAppLoaderOff());
        }
    }
);


export const startMatch = createAsyncThunk<
    CodeFile[],
    void,
    { state: RootState }
>(
    'compound/startMatch',
    async (_, { dispatch, getState }) => {
        dispatch(setAppLoaderOn());
        const { compound } = getState();

        try {
            const codeFiles: CodeFile[] = compound.codeFiles;
            const compoundPattern = compound.compoundPattern;

            if (!compoundPattern) {
                throw new Error('No compound pattern provided for match');
            }

            return await compoundService.startMatch(compoundPattern, codeFiles);
        } catch (error) {
            console.error("Error starting match:", error);
            toast.error(getApiErrorMessage(error));
            throw error;
        }
        finally {
            dispatch(setAppLoaderOff());
        }
    }
);