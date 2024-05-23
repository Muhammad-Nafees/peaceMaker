import React, {useContext} from 'react';
import {View} from 'react-native';
import styles from '../Style';
import EndCall from './Local/EndCall';
import LocalAudioMute from './Local/LocalAudioMute';
import LocalVideoMute from './Local/LocalVideoMute';
import SwitchCamera from './Local/SwitchCamera';
import RemoteControls from './RemoteControls';
import {MaxUidConsumer} from '../MaxUidContext';
import PropsContext, {role} from '../PropsContext';
import LocalUserContextComponent from '../LocalUserContext';
import CallActionBox from '../../../../../components/Call/CallActionBox';
import SwitchSpeaker from './Local/SwitchSpeaker';

function Controls(props: {showButton: Boolean}) {
  const {styleProps, rtcProps} = useContext(PropsContext);
  const {localBtnContainer, maxViewRemoteBtnContainer} = styleProps || {};
  const showButton = props.showButton !== undefined ? props.showButton : true;
  return (
    <LocalUserContextComponent>
      <View
        style={{
          ...styles.Controls,
          height: 'auto',
          zIndex: 0,
          bottom: 0,
          justifyContent: 'flex-start',
        }}>
        <CallActionBox
          changeSpeakerInput={() => null}
          isSpeakerAudio={() => null}
          isMyVid={true}
          switchCamera={() => null}
          mute={() => null}
          isMuted={false}
          onVideo={() => null}
          speakerSwitch={() => <SwitchSpeaker />}
          videoMuteBtn={() => <LocalVideoMute />}
          audioMuteBtn={() => <LocalAudioMute />}
          flipBtn={() => <SwitchCamera />}
          endCallBtn={() => <EndCall />}
          onHangupPress={() => {}}
        />
      </View>
    </LocalUserContextComponent>
  );
}

export default Controls;
