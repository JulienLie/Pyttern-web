import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import * as _ from 'lodash';
import { validateCodeFiles } from '../../services/compound/compoundService';

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
}

const initialState: CompoundState = {
    codeFiles: [],
    compoundPattern: null,
    isLoading: false,
    matchError: null,
    isFilesReadyToMatch: false,
    isPatternReadyToMatch: false,
};

const compoundSlice = createSlice({
    name: 'compound',
    initialState,
    reducers: {
        setCodeFiles: (state, action: PayloadAction<CodeFile[]>) => {
            updateCodeFiles(state, action);
        },
        setCompoundPattern: (state, action: PayloadAction<CompoundPattern | null>) => {
            state.compoundPattern = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // -- Validate code files --
            .addCase(validateCodeFiles.pending, (state) => {
                state.isLoading = true;
                state.matchError = null;
            })
            .addCase(validateCodeFiles.fulfilled, (state, action) => {
                updateCodeFiles(state, action);
                state.isLoading = false;
                state.matchError = null;
            })
            .addCase(validateCodeFiles.rejected, (state, action) => {
                state.isLoading = false;
                state.matchError = action.error.message ?? 'Unknown error occurred';
            });
    },
})

export const {
    setCodeFiles,
    setCompoundPattern,
} = compoundSlice.actions;

export default compoundSlice.reducer;

const updateCodeFiles = (state: CompoundState, action: PayloadAction<CodeFile[]>) => {
    const codeFiles = action.payload;

    state.codeFiles = codeFiles;
    state.isFilesReadyToMatch =  !_.isEmpty(codeFiles) && codeFiles.every((file) => file.status === FileStatus.READY);
};