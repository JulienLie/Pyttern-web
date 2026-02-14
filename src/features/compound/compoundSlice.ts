import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as _ from 'lodash';
import { startMatch, validateCodeFiles, validatePatterns } from './compoundThunks.ts';
import { CodeFile, CompoundPattern, CompoundState, FileStatus, MatchType, UpdatePatternFilterPayload } from './compoundModels.ts';
import * as compoundService from './compoundService.ts';

const initialState: CompoundState = {
    codeFiles: [],
    compoundPattern: null,
    isLoading: false,
    err: null,
    isFilesReadyToMatch: false,
    isPatternReadyToMatch: false,
    isMatchDone: false,
    selectedPatterns: [],
    patternFilters: {},
};

const compoundSlice = createSlice({
    name: 'compound',
    initialState,
    reducers: {
        resetCompoundPattern: (state) => {
            state.compoundPattern = null;
            state.isPatternReadyToMatch = false;
            state.selectedPatterns = [];
            state.patternFilters = {};
        },
        setCodeFiles: (state, action: PayloadAction<CodeFile[]>) => {
            updateCodeFiles(state, action.payload);
        },
        setCompoundPattern: (state, action: PayloadAction<CompoundPattern>) => {
            updatePatternFiles(state, action.payload);
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

            // Initialize filter config for newly selected pattern if it doesn't exist
            const patternFilename = action.payload;
            if (updatedSelectedPatterns.includes(patternFilename) && !state.patternFilters[patternFilename]) {
                // Find the pattern file to check if it's under a NOT folder
                const patternFile = state.compoundPattern
                    ? compoundService.findPatternFileByFilename(state.compoundPattern, patternFilename)
                    : null;

                const defaultMatchType = patternFile?.isUnderNot ? MatchType.NOT_MATCH : MatchType.MATCH;

                state.patternFilters[patternFilename] = {
                    matchType: defaultMatchType,
                    includeUnchecked: false,
                };
            } else if (!updatedSelectedPatterns.includes(patternFilename)) {
                delete state.patternFilters[patternFilename];
            }

        },
        updatePatternFilter: (state, action: PayloadAction<UpdatePatternFilterPayload>) => {
            const { patternFilename, matchType, includeUnchecked } = action.payload;
            if (state.patternFilters[patternFilename]) {
                if (matchType !== undefined) {
                    state.patternFilters[patternFilename].matchType = matchType;
                }
                if (includeUnchecked !== undefined) {
                    state.patternFilters[patternFilename].includeUnchecked = includeUnchecked;
                }
            }
        },
        resetState: (state) => {
            state.codeFiles = [];
            state.compoundPattern = null;
            state.isMatchDone = false;
            state.selectedPatterns = [];
            state.patternFilters = {};
            state.isFilesReadyToMatch = false;
            state.isPatternReadyToMatch = false;
            state.isLoading = false;
            state.err = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // -- Validate code files --
            .addCase(validateCodeFiles.pending, (state: CompoundState) => {
                state.isLoading = true;
                state.err = null;
            })
            .addCase(validateCodeFiles.fulfilled, (state: CompoundState, action) => {
                updateCodeFiles(state, action.payload);
                state.isLoading = false;
                state.err = null;
            })
            .addCase(validateCodeFiles.rejected, (state: CompoundState, action) => {
                state.isLoading = false;
                state.err = action.error.message ?? 'Unknown error occurred';
            })

            // -- Validate patterns --
            .addCase(validatePatterns.pending, (state: CompoundState) => {
                state.isLoading = true;
                state.err = null;
            })
            .addCase(validatePatterns.fulfilled, (state: CompoundState, action) => {
                updatePatternFiles(state, action.payload);
                state.isLoading = false;
            })
            .addCase(validatePatterns.rejected, (state: CompoundState, action) => {
                state.isLoading = false;
                state.err = action.error.message ?? 'Unknown error occurred';
            })

            // -- Start match --
            .addCase(startMatch.pending, (state: CompoundState) => {
                state.isLoading = true;
                state.err = null;
            })
            .addCase(startMatch.fulfilled, (state: CompoundState, action) => {
                state.codeFiles = action.payload;
                state.isLoading = false;
                state.isMatchDone = true;
            })
            .addCase(startMatch.rejected, (state: CompoundState, action) => {
                state.isLoading = false;
                state.err = action.error.message ?? 'Unknown error occurred';
            });
    },
})

export const {
    resetCompoundPattern,
    setCodeFiles,
    setCompoundPattern,
    selectPattern,
    updatePatternFilter,
    resetState,
} = compoundSlice.actions;

export default compoundSlice.reducer;

const updateCodeFiles = (state: CompoundState, codeFiles: CodeFile[]) => {
    state.codeFiles = codeFiles;
    state.isFilesReadyToMatch = !_.isEmpty(codeFiles) && codeFiles.every((file) => file.status === FileStatus.VALIDATED || file.status === FileStatus.NOT_VALIDATED);
};

const updatePatternFiles = (state: CompoundState, compoundPattern: CompoundPattern) => {
    state.compoundPattern = compoundPattern;
    state.patternFilters = {};
    state.selectedPatterns = [];
    state.isPatternReadyToMatch = !_.isEmpty(compoundPattern) && recursivelyCheckPatternFiles(compoundPattern);
};

const recursivelyCheckPatternFiles = (compoundPattern: CompoundPattern): boolean => {
    return compoundPattern.children.every((child) => {
        if ('code' in child) {
            return _.isNil(child.validationError);
        } else {
            return recursivelyCheckPatternFiles(child);
        }
    });
};