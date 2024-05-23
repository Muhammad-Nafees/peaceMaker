import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import userReducer from '../features/user/userSlice';
import extraReducer from '../features/extra/extraSlice';
import serverReducer from '../features/server/serverSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';



const persistConfig = {
  key: 'root',
  version: 1,
  storage:AsyncStorage,
}

const rootReducer =  combineReducers({
  user: userReducer,
  server: serverReducer,
  extra: extraReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
