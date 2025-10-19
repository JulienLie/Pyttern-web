import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface CodeFile {
    id: string;
    name: string;
    status: 'ready' | 'pending';
    code?: string;
    validationError?: string;
}

export interface CompoundPattern {
    name: string;
    children: CompoundPatternElement[];
    validationError?: string;
}

export type CompoundPatternElement = CompoundPattern | PatternFile;

export interface PatternFile {
    id: string;
    name: string;
    pattern: string;
    isSelected: boolean;
}

export interface CompoundState {
    codeFiles: CodeFile[];
    compoundPattern: CompoundPattern | null;
    isLoading: boolean;
}

const initialState: CompoundState = {
    codeFiles: [],
    compoundPattern: null,
    isLoading: false,
};

const compoundSlice = createSlice({
    name: 'compound',
    initialState,
    reducers: {
        setCodaFiles: (state, action: PayloadAction<CodeFile[]>) => {
            state.codeFiles = action.payload;
        },
        setCompoundPattern: (state, action: PayloadAction<CompoundPattern | null>) => {
            state.compoundPattern = action.payload;
        },
        startMatch: (state) => {
            state.isLoading = true;
        },

    },
})