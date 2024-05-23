import React, {useContext} from 'react';
import RtcContext, {DispatchType} from '../../RtcContext';
import styles from '../../Style';
import {LocalContext} from '../../LocalUserContext';
import {Pressable, Text} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

function LocalVideoMute() {
  const {dispatch} = useContext(RtcContext);
  const local = useContext(LocalContext);

  return (
    <Pressable
      onPress={() => {
        (dispatch as DispatchType<'LocalMuteVideo'>)({
          type: 'LocalMuteVideo',
          value: [local.video],
        });
      }}
      style={styles.iconButtonB}>
      <MaterialIcons
        name={!local.video ? 'videocam-off' : 'videocam'}
        size={20}
        color={'white'}
      />
      <Text style={{fontSize: 13, fontWeight: '500', color: 'white'}}>
        Camera {local.video ? 'Off' : 'On'}
      </Text>
    </Pressable>
  );
}

export default LocalVideoMute;
