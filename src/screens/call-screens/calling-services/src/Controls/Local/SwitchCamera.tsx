import React, {useContext} from 'react';
import {Pressable} from 'react-native';
import RtcContext, {DispatchType} from '../../RtcContext';
import styles from '../../Style';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

function SwitchCamera() {
  const {dispatch} = useContext(RtcContext);

  return (
    <Pressable
      onPress={() => {
        // RtcEngine.switchCamera();
        (dispatch as DispatchType<'SwitchCamera'>)({
          type: 'SwitchCamera',
          value: [],
        });
      }}
      style={styles.iconButtonA}>
      <MaterialIcons name={'flip-camera-ios'} size={27} color={'white'} />
    </Pressable>
  );

}

export default SwitchCamera;
