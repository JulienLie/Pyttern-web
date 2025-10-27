import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../store/store.ts";
import { CodeFile, FileStatus, CompoundPattern, PatternFile, CompoundPatternElement } from "../../store/slices/compoundSlice.ts";
import { ValidationStatus } from "../../api/compoundApi.ts";
import * as compoundApi from '../../api/compoundApi';
import { isNil } from 'lodash';
import { setAppLoaderOff, setAppLoaderOn } from "../../store/slices/appLoaderSlice.ts";

export const validateCodeFiles = createAsyncThunk<
    CodeFile[], // Return type
    void,
    { state: RootState }
>(
    'compound/validateCodeFiles',
    async (_, { dispatch, getState }) => {
        dispatch(setAppLoaderOn());

        try {
            const { codeFiles } = getState().compound;

            const filesToValidate = codeFiles.filter(
                file => file.status === FileStatus.PENDING
            );
            const filesToNotValidate = codeFiles.filter(
                file => file.status !== FileStatus.PENDING
            );

            const data = await compoundApi.validateCodeFiles(filesToValidate);

            const unknownError = {
                line: 0,
                column: 0,
                symbol: '',
                msg: 'Unknown error occurred',
            };

            const updatedCodeFiles = filesToValidate.map((file) => {
                const result = data[file.filename];

                if (isNil(result)) {
                    return {
                        ...file,
                        status: FileStatus.ERROR,
                        validationError: unknownError
                    };
                }

                if (result.status === ValidationStatus.OK) {
                    return {
                        ...file,
                        status: FileStatus.READY,
                        validationError: null
                    };
                } else {
                    return {
                        ...file,
                        status: FileStatus.ERROR,
                        validationError: result.message ?? unknownError
                    };
                }
            });

            return [...filesToNotValidate, ...updatedCodeFiles];
        } finally {
            dispatch(setAppLoaderOff());
        }
    }
);


/*
export const validatePatterns = createAsyncThunk<
    CompoundPattern,
    void,
    { state: RootState }
>(
    'compound/validatePatterns',
    async (_, { dispatch, getState }) => {
        const { compoundPattern } = getState().compound;

        if (!compoundPattern) {
            return null;
        }

        const getPatternFiles = (pattern: CompoundPattern): PatternFile[] => {
            const files: PatternFile[] = [];
            
            const traverse = (element: CompoundPatternElement) => {
                if ('pattern' in element) {
                    files.push(element);
                } else {
                    element.children.forEach(child => traverse(child));
                }
            };

            pattern.children.forEach(child => traverse(child));
            return files;
        };

        const patternFiles = getPatternFiles(compoundPattern);

        const validationError = validateCompoundPattern(compoundPattern);

        if (validationError) {
            return null;
        }
        dispatch(setAppLoaderOn());
    }
);
*/