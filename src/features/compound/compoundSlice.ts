import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import * as _ from 'lodash';
import { validateCodeFiles, validatePatterns } from './compoundThunks.ts';
import { CodeFile, CompoundPattern, CompoundState, FileStatus } from './compoundModels.ts';
import * as compoundService from './compoundService.ts';

const initialState: CompoundState = {
    codeFiles: [],
    compoundPattern: null,
    isLoading: false,
    matchError: null,
    isFilesReadyToMatch: false,
    isPatternReadyToMatch: false,
    selectedPatterns: [],
};

const compoundSlice = createSlice({
    name: 'compound',
    initialState,
    reducers: {
        resetCompoundPattern: (state) => {
            state.compoundPattern = null;
            state.isPatternReadyToMatch = false;
            state.selectedPatterns = [];
        },
        setCodeFiles: (state, action: PayloadAction<CodeFile[]>) => {
            updateCodeFiles(state, action.payload);
        },
        setCompoundPattern: (state, action: PayloadAction<CompoundPattern | null>) => {
            state.compoundPattern = action.payload;
        },
        selectPattern: (state, action: PayloadAction<string>) => {
            if (state.compoundPattern == null) {
                return;
            }

            let newCompoundPattern: CompoundPattern = {
                ...state.compoundPattern,
            };
            const selectedPatterns = [...state.selectedPatterns];

            const updatedSelectedPatterns = compoundService.selectPatternsRecursively(newCompoundPattern, action.payload, selectedPatterns); 
            state.compoundPattern = newCompoundPattern;
            state.selectedPatterns = updatedSelectedPatterns;
        },
    },
    extraReducers: (builder) => {
        builder
            // -- Validate code files --
            .addCase(validateCodeFiles.pending, (state: CompoundState) => {
                state.isLoading = true;
                state.matchError = null;
            })
            .addCase(validateCodeFiles.fulfilled, (state: CompoundState, action) => {
                updateCodeFiles(state, action.payload);
                state.isLoading = false;
                state.matchError = null;
            })
            .addCase(validateCodeFiles.rejected, (state: CompoundState, action) => {
                state.isLoading = false;
                state.matchError = action.error.message ?? 'Unknown error occurred';
            })

            // -- Validate patterns --
            .addCase(validatePatterns.pending, (state: CompoundState) => {
                state.isLoading = true;
                state.matchError = null;
            })
            .addCase(validatePatterns.fulfilled, (state: CompoundState, action) => {
                state.compoundPattern = action.payload;
                state.isLoading = false;
            })
            .addCase(validatePatterns.rejected, (state: CompoundState, action) => {
                state.isLoading = false;
                state.matchError = action.error.message ?? 'Unknown error occurred';
            });
    },
})

export const {
    resetCompoundPattern,
    setCodeFiles,
    setCompoundPattern,
    selectPattern,
} = compoundSlice.actions;

export default compoundSlice.reducer;

const updateCodeFiles = (state: CompoundState, codeFiles: CodeFile[]) => {
    state.codeFiles = codeFiles;
    state.isFilesReadyToMatch =  !_.isEmpty(codeFiles) && codeFiles.every((file) => file.status === FileStatus.READY);
};
