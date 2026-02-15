import { configureStore } from '@reduxjs/toolkit';
import personsReducer from './personsSlice';
import authReducer from './authSlice';
import filtersReducer from './filtersSlice';

export const store = configureStore({
  reducer: {
    persons: personsReducer,
    auth: authReducer,
    filters: filtersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
