import { createSlice } from '@reduxjs/toolkit';

interface AppLoaderState {
    isLoading: boolean;
}

const initialState: AppLoaderState = {
    isLoading: false,
};

const appLoaderSlice = createSlice({
    name: 'appLoader',
    initialState,
    reducers: {
        setAppLoaderOn: (state) => {
            state.isLoading = true;
        },
        setAppLoaderOff: (state) => {
            state.isLoading = false;
        },
    },
});

export const { setAppLoaderOn, setAppLoaderOff } = appLoaderSlice.actions;
export default appLoaderSlice.reducer;

