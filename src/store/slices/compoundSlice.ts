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
    selectedPatterns: string[];
}

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

            const updatedSelectedPatterns = selectPatternsRecursively(newCompoundPattern, action.payload, selectedPatterns); 
            state.compoundPattern = newCompoundPattern;
            state.selectedPatterns = updatedSelectedPatterns;
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
                updateCodeFiles(state, action.payload);
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

const selectPatternsRecursively = (element: CompoundPatternElement, selectedPattern: string, selectedPatterns: string[]): string[] => {
    if ('isSelected' in element) {
        if (selectedPattern === element.filename) {
            element.isSelected = !element.isSelected;
            
            if (element.isSelected) {
                if (!selectedPatterns.includes(element.filename)) {
                    selectedPatterns.push(element.filename);
                }
            } else {
                const index = selectedPatterns.indexOf(element.filename);
                if (index > -1) {
                    selectedPatterns.splice(index, 1);
                }
            }
        }

    } else if (element.children && element.children.length > 0) {
        element.children.forEach((child) => selectPatternsRecursively(child, selectedPattern, selectedPatterns));
    }
    
    return selectedPatterns;
};