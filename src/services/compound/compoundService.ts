import {createAsyncThunk} from "@reduxjs/toolkit";
import {RootState} from "../../store/store.ts";

export const validateCodeFiles = createAsyncThunk<
    void,
    void,
    { state: RootState }
>(
    'compound/validateCodeFiles',
    async (_, { dispatch, getState }) => {
        const { compound } = getState();
        const { codeFiles } = compound;


    }
);