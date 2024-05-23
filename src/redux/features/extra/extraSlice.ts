import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type Biometric = { key: string | null; isEnabled: boolean};

type InitialState = {
  groupName: string;
  deviceName: string;
  biometric : Biometric
};

const initialState: InitialState = {
    groupName: '',
    deviceName: '',
    biometric: {
      key: null,
      isEnabled: false
    }
};

const extraSlice = createSlice({
  name: 'extra',
  initialState,
  reducers: {
    changeGroupName: (state, action: PayloadAction<string>) => {
      state.groupName = action.payload;
    },
    setDeviceName: (state, action: PayloadAction<string>) => {
      state.deviceName = action.payload;
    },
    updateBiometric: (state, action: PayloadAction<Biometric>) => {
      state.biometric = action.payload;
    }
  },
});

export default extraSlice.reducer;
export const {changeGroupName, setDeviceName, updateBiometric} = extraSlice.actions;
