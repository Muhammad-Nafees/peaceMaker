import React, {useState, useEffect} from 'react';
import VideoCalling, {layout} from './calling-services';
import {baseUrl} from '../../utils/ApiService';
import {useAppSelector} from '../../redux/app/hooks';
import {User} from '../../interface/types';
import navigation from '../../utils/appNavigation';
import IdleTimerManager from 'react-native-idle-timer';
import socketServcies from '../../utils/socketServices';
import Sound from 'react-native-sound';

const CallingScreen = ({route}: {route: any}) => {
  const [videoCall, setVideoCall] = useState(false);
  const [isRemoteUserJoined, setIsRemoteUserJoined] = useState(false);
  const [sound, setSound] = useState<Sound>();
  const soundRef = React.useRef(sound);
  soundRef.current = sound;

  const [token, setToken] = useState('');

  const chatID = route.params.recentparams.chatId;
  const channelName = chatID;
  const fromHome = route.params?.recentparams?.fromHome;
  const isGroup = route.params.isGroup === 1;

  const groupName = useAppSelector(state => state.extra.groupName);
  const user = useAppSelector((state: any) => state.user.data);
  const uid = user._id;

  const participants: User[] = route.params?.recentparams?.participants;
  console.log(
    '🚀 ~ file: index.tsx:30 ~ CallingScreen ~ participants:',
    participants,
  );
  let participantID: string[] = [];
  if (participants) {
    participants.forEach(p => {
      if (p?._id !== user._id) participantID.push(p?._id!);
    });
  }

  const rtcProps = {
    appId: '937dd943128844d9b02508afc411d0e5',
    channel: channelName,
    token: token,
    uid: uid,
    layout: isGroup ? layout.grid : layout.pin,
  };

  const callbacks = {
    EndCall: () => setVideoCall(false),
  };

  const updateCallStatus = async () => {
    if (isGroup) return;
    if (fromHome) return;

    console.log('Updating call status');

    const url = `${baseUrl}video/endcall`;
    console.log('end call url', url);
    try {
      const otherParticipant = participantID.find(p => p !== uid);
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          callee: otherParticipant,
          user: uid,
          chatId: chatID,
        }),
        headers: {
          'content-type': 'application/json',
          accessToken: '',
        },
      });
      await response.json();
    } catch (err) {
      console.log(err);
    }
  };

  const getToken = async () => {
    const url = `${baseUrl}video/get-agora-token?channelName=${channelName}&uid=${uid}&${
      fromHome ? '' : 'notifyOther=true'
    }`;
    console.log('get token url', url);
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          calleeID: participantID,
          user: uid,
          isGroup: isGroup,
          groupName: groupName ? groupName : '',
          participants: participants,
        }),
        headers: {
          'content-type': 'application/json',
          accessToken: '',
        },
      });
      const {data} = await response.json();
      console.log('Token: ', data);

      setToken(data);
      setVideoCall(true);
    } catch (err) {
      console.log(err);
    }
  };

  const playSound = () => {
    const ringingSound = new Sound(
      require('../../../assets/audios/ringing.mp3'),
      error => {
        if (error) {
          console.log('Failed to load the sound', error);
          return;
        }
        // Set the number of loops to -1 for continuous looping
        ringingSound?.setNumberOfLoops(-1);

        // Play the sound
        ringingSound?.play(success => {
          if (success) {
            console.log('Sound played successfully');
          } else {
            console.log('Sound did not play');
          }
        });
      },
    );

    setSound(ringingSound);
  };

  const stopSound = () => {
    soundRef.current?.stop();
  };

  const onCallDecline = () => {
    console.log('--------------------------------');
    console.log('call rejected');

    if (isGroup) return;
    callbacks.EndCall();
  };

  useEffect(() => {
    getToken();
    if (!fromHome) playSound();

    socketServcies.on(`declineCall/${chatID}`, onCallDecline);

    // keeping screen on
    IdleTimerManager.setIdleTimerDisabled(true);

    return () => {
      socketServcies.removeListener(`declineCall/${chatID}`, onCallDecline);
      IdleTimerManager.setIdleTimerDisabled(false);
      stopSound();
    };
  }, []);

  useEffect(() => {
    if (!videoCall && token) {
      console.log('🚀~ isRemoteUserJoined:', isRemoteUserJoined);
      if (!isRemoteUserJoined) updateCallStatus();
      navigation.back();
    }
  }, [videoCall]);

  return videoCall ? (
    <VideoCalling
      route={route}
      sound={sound}
      setIsRemoteUserJoined={setIsRemoteUserJoined}
      participants={participants}
      rtcProps={rtcProps}
      callbacks={callbacks}
    />
  ) : (
    <></>
  );
};

export default CallingScreen;
