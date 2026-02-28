import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import codeReducer from './slices/codeSlice';
import contestCodeReducer from './slices/contestCodeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    code: codeReducer,
    contestCode: contestCodeReducer
  }
});