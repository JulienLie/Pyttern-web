import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/store.ts";
import { CodeFile, CompoundPattern } from "./compoundModels.ts";
import { setAppLoaderOff, setAppLoaderOn } from "../../common/slices/appLoaderSlice.ts";
import * as compoundService from './compoundService.ts';

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
            return [];
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
        } finally {
            dispatch(setAppLoaderOff());
        }
    }
);
