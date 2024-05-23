//setParameters()
import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useRef,
} from 'react';
import RtcEngine, {ChannelProfile, ClientRole} from 'react-native-agora';
import {Platform} from 'react-native';
import {requestCameraAndAudioPermission} from './permission';
import {
  RtcProvider,
  UidInterface,
  UidStateInterface,
  DispatchType,
  ActionInterface,
  ActionType,
} from './RtcContext';
import PropsContext, {
  RtcPropsInterface,
  CallbacksInterface,
  layout,
  mode,
  role,
} from './PropsContext';
import {MinUidProvider} from './MinUidContext';
import {MaxUidProvider} from './MaxUidContext';
import {useAppSelector} from '../../../../redux/app/hooks';
// useeffect -> if audience enablelocalvideo(false);

/**
 * The RtcConfigre component handles the logic for the video experience.
 * It's a collection of providers to wrap your components that need access to user data or engine dispatch
 */
const RtcConfigure: React.FC<Partial<RtcPropsInterface>> = props => {
  const {callbacks, rtcProps, participants, setIsRemoteUserJoined, sound} =
    useContext(PropsContext);
  const [ready, setReady] = useState<boolean>(false);
  let joinRes: ((arg0: boolean) => void) | null = null;
  let canJoin = useRef(new Promise<boolean | void>(res => (joinRes = res)));
  let engine = useRef<RtcEngine | null>(null);
  let {callActive} = props;
  callActive === undefined ? (callActive = true) : {};
  const user = useAppSelector((state: any) => state.user.data);

  const initialState: UidStateInterface = {
    min: [],
    max: [
      {
        uid: 'local',
        audio: rtcProps.enableAudio === false ? false : true,
        video: rtcProps.enableVideo === false ? false : true,
        name: user.firstName + ' ' + user.lastName,
      },
    ],
  };

  const reducer = (
    state: UidStateInterface,
    action: ActionInterface<keyof CallbacksInterface, CallbacksInterface>,
  ) => {
    let stateUpdate = {},
      uids = [...state.max, ...state.min].map((u: UidInterface) => u.uid);

    switch (action.type) {
      case 'UserJoined':
        if (
          uids.indexOf((action as ActionType<'UserJoined'>).value[0]) === -1
        ) {
          // console.log("new user joined-------------------------------------");
          sound?.stop();
          //If new user has joined
          setIsRemoteUserJoined(true);

          let minUpdate = [
            ...state.min,
            {
              uid: (action as ActionType<'UserJoined'>).value[0],
              audio: true,
              video: true,
              name: action?.name ? action?.name : 'Participant Participant',
            },
          ]; //By default add to minimized

          if (minUpdate.length === 1 && state.max[0].uid === 'local') {
            //Only one remote and local is maximized
            //Swap max and min
            stateUpdate = {
              max: minUpdate,
              min: state.max,
            };
          } else {
            //More than one remote
            stateUpdate = {
              min: minUpdate,
            };
          }
          console.log('new user joined!\n', action.value[0]);
        }
        break;
      case 'UserOffline':
        if (
          state.max[0].uid === (action as ActionType<'UserOffline'>).value[0]
        ) {
          // if layout is pin, meaning its not group
          if (callbacks && rtcProps.layout === layout.pin) {
            callbacks['EndCall']?.apply(null, []);
            console.log('callback executed');
          }
          //If max has the remote video
          let minUpdate = [...state.min];
          stateUpdate = {
            max: [minUpdate.pop()],
            min: minUpdate,
          };
        } else {
          stateUpdate = {
            min: state.min.filter(
              user =>
                user.uid !== (action as ActionType<'UserOffline'>).value[0],
            ),
          };
        }
        break;
      case 'SwapVideo':
        console.log('swap: ', state, action.value[0]);
        stateUpdate = swapVideo(state, action.value[0] as UidInterface);
        break;
      case 'TokenPrivilegeWillExpire':
        const UID = rtcProps.uid || '';
        console.log('TokenPrivilegeWillExpire: ', action.value[0], UID);
        fetch(
          rtcProps.tokenUrl +
            '/rtc/' +
            rtcProps.channel +
            '/publisher/uid/' +
            UID,
        )
          .then(response => {
            response.json().then(data => {
              engine.current?.renewToken(data.rtcToken);
            });
          })
          .catch(function (err) {
            console.log('Fetch Error', err);
          });
        break;
      case 'ActiveSpeaker':
        console.log('speak: ', action.value[0]);
        if (state.max[0].uid !== action.value[0]) {
          let users = [...state.max, ...state.min];
          let swapUid = action.value[0] as number;
          users.forEach(user => {
            if (user.uid === swapUid) {
              stateUpdate = swapVideo(state, user);
            }
          });
        }
        break;
      case 'UserMuteRemoteAudio':
        const audioMute = (user: UidInterface) => {
          if (user.uid === (action.value[0] as UidInterface).uid) {
            user.audio = !action.value[1];
          }
          return user;
        };
        stateUpdate = {
          min: state.min.map(audioMute),
          max: state.max.map(audioMute),
        };
        break;
      case 'UserMuteRemoteVideo':
        const videoMute = (user: UidInterface) => {
          if (user.uid === (action.value[0] as UidInterface).uid) {
            user.video = !action.value[1];
          }
          return user;
        };
        stateUpdate = {
          min: state.min.map(videoMute),
          max: state.max.map(videoMute),
        };
        break;
      case 'LocalMuteAudio':
        (engine.current as RtcEngine).muteLocalAudioStream(
          (action as ActionType<'LocalMuteAudio'>).value[0],
        );
        const LocalAudioMute = (user: UidInterface) => {
          if (user.uid === 'local') {
            user.audio = !(action as ActionType<'LocalMuteAudio'>).value[0];
          }
          return user;
        };
        stateUpdate = {
          min: state.min.map(LocalAudioMute),
          max: state.max.map(LocalAudioMute),
        };
        break;
      case 'LocalMuteVideo':
        (engine.current as RtcEngine).muteLocalVideoStream(
          (action as ActionType<'LocalMuteAudio'>).value[0],
        );

        (engine.current as RtcEngine).enableLocalVideo(
          !(action as ActionType<'LocalMuteAudio'>).value[0],
        );
        const LocalVideoMute = (user: UidInterface) => {
          if (user.uid === 'local') {
            user.video = !(action as ActionType<'LocalMuteVideo'>).value[0];
          }
          return user;
        };
        stateUpdate = {
          min: state.min.map(LocalVideoMute),
          max: state.max.map(LocalVideoMute),
        };
        break;
      case 'SwitchCamera':
        (engine.current as RtcEngine).switchCamera();
        break;
      case 'AudioRouteChanged':
        (engine.current as RtcEngine).setEnableSpeakerphone(
          (action as ActionType<'LocalMuteAudio'>).value[0],
        );
        break;
      case 'LeaveChannel':
        stateUpdate = {
          min: [],
          max: [
            {
              uid: 'local',
              audio: rtcProps.enableAudio === false ? false : true,
              video: rtcProps.enableVideo === false ? false : true,
            },
          ],
        };
    }

    // Handle event listeners
    if (callbacks && callbacks[action.type]) {
      // @ts-ignore
      callbacks[action.type].apply(null, action.value);
      console.log('callback executed');
    } else {
      // console.log('callback not found', action);
    }

    return {
      ...state,
      ...stateUpdate,
    };
  };

  const swapVideo = (state: UidStateInterface, ele: UidInterface) => {
    let newState: UidStateInterface = {
      min: [],
      max: [],
    };
    newState.min = state.min.filter(e => e !== ele);
    if (state.max[0].uid === 'local') {
      newState.min.unshift(state.max[0]);
    } else {
      newState.min.push(state.max[0]);
    }
    newState.max = [ele];
    return newState;
  };

  const [uidState, dispatch] = useReducer(reducer, initialState); //update third variable -> pass props

  useEffect(() => {
    async function init() {
      //Request required permissions from Android And IOS
      await requestCameraAndAudioPermission();

      try {
        engine.current = await RtcEngine.create(rtcProps.appId);
        console.log(engine.current);
        await engine.current.enableVideo();

        /* Listeners */
        engine.current.addListener('UserJoined', (...args) => {
          const useruid = args[0];

          engine.current?.getUserInfoByUid(useruid).then(userAccountID => {
            console.log(
              '🚀 ~ file: RTCConfigure.tsx:268 ~ engine.current?.getUserInfoByUid ~ userAccountID:',
              userAccountID,
            );

            const joinedUser = participants?.find(
              e => e._id == userAccountID?.userAccount,
            );

            const username =
              (joinedUser?.firstName ?? 'Participant') +
              ' ' +
              (joinedUser?.lastName ?? 'Participant');

            //Get current peer IDs
            (dispatch as DispatchType<'UserJoined'>)({
              type: 'UserJoined',
              value: args,
              name: username ? username : 'No Name',
            });
          });
        });

        engine.current.addListener('Error', (args: any) => {
          console.log('event error: ', args);
        });

        engine.current.addListener('UserOffline', (...args) => {
          //If remote user leaves
          (dispatch as DispatchType<'UserOffline'>)({
            type: 'UserOffline',
            value: args,
          });
        });

        engine.current.addListener('LeaveChannel', (...args) => {
          //If local user leaves channel
          (dispatch as DispatchType<'LeaveChannel'>)({
            type: 'LeaveChannel',
            value: args,
          });
        });

        engine.current.addListener('UserMuteVideo', (...args) => {
          const e = [...args];
          // If remote user mutes video
          (dispatch as DispatchType<'UserMuteRemoteVideo'>)({
            type: 'UserMuteRemoteVideo',
            value: [{uid: e[0]}, e[1]],
          });
        });

        /* ActiveSpeaker */
        if (rtcProps.activeSpeaker && rtcProps.layout !== layout.grid) {
          console.log('ActiveSpeaker enabled');
          await engine.current.enableAudioVolumeIndication(1000, 3, false);
          engine.current.addListener('ActiveSpeaker', (...args) => {
            (dispatch as DispatchType<'ActiveSpeaker'>)({
              type: 'ActiveSpeaker',
              value: args,
            });
          });
        }

        /* Token URL */
        if (rtcProps.tokenUrl) {
          engine.current.addListener('TokenPrivilegeWillExpire', (...args) => {
            (dispatch as DispatchType<'TokenPrivilegeWillExpire'>)({
              type: 'TokenPrivilegeWillExpire',
              value: args,
            });
          });
        }

        (joinRes as (arg0: boolean) => void)(true);
        setReady(true);
      } catch (e) {
        console.log(e);
      }
    }

    if (joinRes) {
      init();
      return () => {
        (engine.current as RtcEngine).destroy();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rtcProps.appId]);

  // Dynamically switches channel when channel prop changes
  useEffect(() => {
    async function join() {
      await canJoin.current;
      if (engine.current) {
        /* Live Streaming */
        if (rtcProps.mode === mode.LiveBroadcasting) {
          await engine.current.setChannelProfile(
            ChannelProfile.LiveBroadcasting,
          );
          await engine.current.setClientRole(
            rtcProps.role === role.Audience
              ? ClientRole.Audience
              : ClientRole.Broadcaster,
          );
        } else {
          await engine.current.setChannelProfile(ChannelProfile.Communication);
        }
        /* enableVideo */
        if (rtcProps.enableVideo === false) {
          engine.current?.muteLocalVideoStream(true);
        } else {
          engine.current?.muteLocalVideoStream(false);
        }
        /* enableAudio */
        if (rtcProps.enableAudio === false) {
          engine.current?.muteLocalAudioStream(true);
        } else {
          engine.current?.muteLocalAudioStream(false);
        }
        engine.current.joinChannelWithUserAccount(
          rtcProps.token || null,
          rtcProps.channel,
          rtcProps.uid || '',
          {
            clientRoleType: ClientRole.Broadcaster,
          },
        );
      } else {
        console.error('trying to join before RTC Engine was initialized');
      }
    }
    if (callActive) {
      join();
      console.log('Attempted join: ', rtcProps.channel);
    } else {
      console.log('In precall - waiting to join');
    }
    return () => {
      if (callActive) {
        console.log('Leaving channel');
        canJoin.current = (engine.current as RtcEngine)
          .leaveChannel()
          .catch((err: any) => console.log(err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rtcProps.channel,
    rtcProps.uid,
    rtcProps.token,
    callActive,
    rtcProps.tokenUrl,
    // rtcProps.role, (don't rejoin channel, uses toggleRole function to switch role)
    rtcProps.mode,
    // rtcProps.enableVideo, (don't rejoin channel, only used for initialization)
    // rtcProps.enableAudio, (don't rejoin channel, only used for initialization)
  ]);

  /* Dual Stream */
  useEffect(() => {
    const toggleDualStream = async () => {
      if (rtcProps.dualStreamMode) {
        await engine.current?.enableDualStreamMode(true);
        await engine.current?.setRemoteSubscribeFallbackOption(
          rtcProps.dualStreamMode,
        );
        await engine.current?.setLocalPublishFallbackOption(
          rtcProps.dualStreamMode,
        );
      } else {
        await engine.current?.enableDualStreamMode(false);
      }
    };
    toggleDualStream();
  }, [rtcProps.dualStreamMode]);

  /* Live Stream Role */
  useEffect(() => {
    const toggleRole = async () => {
      if (rtcProps.mode === mode.LiveBroadcasting) {
        await engine.current?.setChannelProfile(
          ChannelProfile.LiveBroadcasting,
        );
        await engine.current?.setClientRole(
          rtcProps.role === role.Audience
            ? ClientRole.Audience
            : ClientRole.Broadcaster,
        );
      }
    };
    toggleRole();
  }, [rtcProps.mode, rtcProps.role]);

  return (
    <RtcProvider value={{RtcEngine: engine.current as RtcEngine, dispatch}}>
      <MaxUidProvider value={uidState.max}>
        <MinUidProvider value={uidState.min}>
          {
            // Render children once RTCEngine has been initialized
            ready ? props.children : <></>
          }
        </MinUidProvider>
      </MaxUidProvider>
    </RtcProvider>
  );
};

export default RtcConfigure;
