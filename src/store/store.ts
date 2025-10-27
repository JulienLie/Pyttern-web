import { configureStore } from '@reduxjs/toolkit';
import matcherReducer from './slices/matcherSlice';
import compoundReducer from './slices/compoundSlice';
import appLoaderReducer from './slices/appLoaderSlice';

// Configure the Redux store
export const store = configureStore({
    reducer: {
        matcher: matcherReducer,
        compound: compoundReducer,
        appLoader: appLoaderReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

