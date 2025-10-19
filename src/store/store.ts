import { configureStore } from '@reduxjs/toolkit';
import matcherReducer from './slices/matcherSlice';

// Configure the Redux store
export const store = configureStore({
    reducer: {
        matcher: matcherReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

