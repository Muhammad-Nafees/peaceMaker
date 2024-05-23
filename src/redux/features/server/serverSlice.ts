import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type InitialState = {
  isLocalServer: boolean;
};

const initialState: InitialState = {
  isLocalServer: false,
};

const serverSlice = createSlice({
  name: 'server',
  initialState,
  reducers: {
    localServer: (state, action: PayloadAction<boolean>) => {
      state.isLocalServer = action.payload;
    },
  },
});

export default serverSlice.reducer;
export const {localServer} = serverSlice.actions;