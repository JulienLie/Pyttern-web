import { configureStore } from '@reduxjs/toolkit';
import matcherReducer from '../features/matcher/matcherSlice.ts';
import compoundReducer from '../features/compound/compoundSlice.ts';
import appLoaderReducer from '../common/slices/appLoaderSlice.ts';

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

