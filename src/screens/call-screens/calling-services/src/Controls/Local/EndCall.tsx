import React, {useContext} from 'react';
import {Pressable} from 'react-native';
import RtcContext, {DispatchType} from '../../RtcContext';
import styles from '../../Style';
import Feather from 'react-native-vector-icons/Feather';
import PropsContext from '../../PropsContext';

function EndCall() {
  const {dispatch} = useContext(RtcContext);
  const {sound} = useContext(PropsContext);
  return (
    <Pressable
      onPress={() => {
        sound?.stop();
        (dispatch as DispatchType<'EndCall'>)({
          type: 'EndCall',
          value: [],
        });
      }}
      style={[styles.iconButtonA, {backgroundColor: '#eb5545'}]}>
      <Feather name="x" size={27} color={'white'} />
    </Pressable>
  );
}

export default EndCall;
