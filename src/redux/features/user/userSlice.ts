import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { User } from '../../../interface/types';


type InitialState = {
  isAuthenticated: boolean;
  data: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    fcmToken: string;
  };
};

const initialState: InitialState = {
  isAuthenticated: false,
  data: {
    location: {
      type: null,
      coordinates: [],
    },
    _id: null,
    firstName: null,
    lastName: null,
    dob: null,
    email: null,
    height: null,
    weight: null,
    role: null,
    isActive: false,
    fcmToken: null,
    partner: null,
    buddies: [],
    online: false,
    createdAt: null,
    updatedAt: null,
    __v: null,
    isBuddy: false,
     photo: null,
      goodProgress: false,
       badProgress: false,
        beNotified: false,
    photoUrl: null
  },
  tokens: {
    accessToken: '',
    refreshToken: '',
    fcmToken: '',
  },
};


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setUserData: (state, action: PayloadAction<User>) => {
      state.data = action.payload;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.tokens.accessToken = action.payload;
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      state.tokens.refreshToken = action.payload;
    },
    setFcmToken: (state, action: PayloadAction<string>) => {
      state.tokens.fcmToken = action.payload;
    },
  },
});

export default userSlice.reducer;
export const {
  setAuthenticated,
  setUserData,
  setAccessToken,
  setRefreshToken,
  setFcmToken,
} = userSlice.actions;

export const userInitialState: User = initialState.data;
