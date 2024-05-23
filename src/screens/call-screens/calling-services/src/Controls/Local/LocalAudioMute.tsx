import  {useContext} from 'react';
import {Pressable} from 'react-native';
import RtcContext, {DispatchType} from '../../RtcContext';
import styles from '../../Style';
import {LocalContext} from '../../LocalUserContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

function LocalAudioMute() {
  const {dispatch} = useContext(RtcContext);
  const local = useContext(LocalContext);

  return (
    <Pressable
      onPress={() => {
        (dispatch as DispatchType<'LocalMuteAudio'>)({
          type: 'LocalMuteAudio',
          value: [local.audio],
        });
      }}
      style={styles.iconButtonA}>
      <MaterialCommunityIcons
        name={!local.audio ? 'microphone-off' : 'microphone'}
        size={27}
        color={'white'}
      />
    </Pressable>
  );

}

export default LocalAudioMute;
