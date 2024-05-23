import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  BackHandler,
  AppState,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {COLORS} from '../../constants/colors';
import Header from '../../components/home/Header';
import CustomCard from '../../components/home/CustomCard';
import CustomRoundCard from '../../components/home/CustomRoundCard';
import MySchedule from '../../components/home/MySchedule';
import {CHALLENGES} from '../../../data/data';
import DailyState from '../../components/home/DailyState';
import messaging from '@react-native-firebase/messaging';
import Incomingvideocall from '../../utils/incoming-video-call';
import Navigation from '../../utils/appNavigation';
import DeviceInfo from 'react-native-device-info';
import {useDispatch} from 'react-redux';
import {
  setDeviceName,
  updateBiometric,
} from '../../redux/features/extra/extraSlice';
import socketServcies from '../../utils/socketServices';
import CustomModal from '../../components/shared-components/CustomModal';
import {useIsFocused} from '@react-navigation/native';
import {createChat} from '../../utils/chat';
import {useAppSelector} from '../../redux/app/hooks';
import {Challenge, User} from '../../interface/types';
import {ApiService} from '../../utils/ApiService';
import ReactNativeBiometrics from 'react-native-biometrics';
import FinalThoughtModal from '../../components/daily-state/FinalThoughtModal';
const imageUrl = require('../../../assets/images/daily-state-images/reception-bell.png');
import VoipPushNotification from 'react-native-voip-push-notification';
import {requestPermissions} from '../../utils/permissions';
import {getFirebaseDeviceToken} from '../../utils/pushNotification-helper';
import RNDisableBatteryOptimizationsAndroid from 'react-native-disable-battery-optimizations-android';
import {EventRegister} from 'react-native-event-listeners';
import {removeFCMToken} from '../../utils/helpers';
import {
  setAccessToken,
  setAuthenticated,
  setFcmToken,
  setRefreshToken,
  setUserData,
  userInitialState,
} from '../../redux/features/user/userSlice';

const SCREEN_WIDTH = Dimensions.get('screen').width;

const HomeScreen = ({navigation, route}: any) => {
  const dispatch = useDispatch();
  const [accountabilityUpdateModal, setAccountabilityUpdateModal] =
    useState(false);
  const [schedule, setSchedule] = useState<Challenge[] | null>([]);
  const [entriesCount, setEntriesCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [biometricCount, setBiometricCount] = useState(0);
  const [finalThought, setFinalThought] = useState(false);
  const appState = React.useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [requirebiometric, setrequirebiometric] = useState(true);
  const requirebiometricRef = React.useRef(requirebiometric);
  requirebiometricRef.current = requirebiometric;

  const isFocused = useIsFocused();
  const {biometric} = useAppSelector(state => state.extra);
  const biometricRef = React.useRef(biometric);
  biometricRef.current = biometric;

  const biometricCountRef = React.useRef(biometricCount);
  biometricCountRef.current = biometricCount;

  const {data: user, tokens} = useAppSelector(state => state.user);

  useEffect(() => {
    if (Platform.OS === 'ios') return;
    const unsubscribe = messaging().onMessage((remoteMessage: any) => {
      console.log('🚀~ remoteMessage:', remoteMessage);
      const data = remoteMessage;
      let callerInfo: any;
      let type: string = 'unknown';
      if (remoteMessage?.data?.info) {
        const dataInfo = JSON.parse(data?.data?.info);
        callerInfo = dataInfo.callerInfo;
        type = dataInfo.type;
      }

      switch (type) {
        case 'CALL_INITIATED':
          console.log('🚀 ~ CALL_INITIATED');
          const incomingCallAnswer = () => {
            Incomingvideocall.endIncomingcallAnswer();
            // updateCallStatus({
            //   callerInfo,
            //   type: 'ACCEPTED',
            // });
            Navigation.navigate('CallingScreen', {
              isGroup: callerInfo.isGroup ? 1 : 0,
              recentparams: {
                chatId: callerInfo.chatId,
                title: callerInfo.title,
                fromHome: true,
                participants: callerInfo?.participants,
              },
              handleNotificationClickGoto: 'NotificationScreen',
            });
          };

          const endIncomingCall = () => {
            socketServcies.emit('declineCall', callerInfo);
            console.log('Ending incoming call');

            Incomingvideocall.endIncomingcallAnswer();
          };

          Incomingvideocall.endAllCall();
          Incomingvideocall.configure(incomingCallAnswer, endIncomingCall);
          Incomingvideocall.displayIncomingCall(callerInfo.title);

          break;

        case 'CALL_DECLINED':
          console.log('🚀 ~ CALL_DECLINED');
          Incomingvideocall.endAllCall();
          break;
        default:
          console.log('Other Notifications: Unknown');
      }
    });

    return () => {
      if (Platform.OS === 'android') {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') return;

    VoipPushNotification.addEventListener('register', token => {
      console.log('~ apn token:', token);
      alert(token);

      // setAPN(token);
    });

    VoipPushNotification.addEventListener(
      'notification',
      (remoteMessage: any) => {
        console.log('🚀~ remoteMessage:', remoteMessage);
        const data = remoteMessage;
        let callerInfo: any;
        let type: string = 'unknown';
        if (remoteMessage?.data?.info) {
          const dataInfo = JSON.parse(data?.data?.info);
          callerInfo = dataInfo.callerInfo;
          type = dataInfo.type;
        }

        switch (type) {
          case 'CALL_INITIATED':
            console.log('🚀 ~ CALL_INITIATED');
            const incomingCallAnswer = () => {
              Incomingvideocall.endIncomingcallAnswer();
              // updateCallStatus({
              //   callerInfo,
              //   type: 'ACCEPTED',
              // });
              Navigation.navigate('CallingScreen', {
                isGroup: callerInfo.isGroup ? 1 : 0,
                recentparams: {
                  chatId: callerInfo.chatId,
                  title: callerInfo.title,
                  fromHome: true,
                  participants: callerInfo?.participants,
                },
              });
            };

            const endIncomingCall = () => {
              socketServcies.emit('declineCall', callerInfo);
              console.log('Ending incoming call');

              Incomingvideocall.endIncomingcallAnswer();
            };

            Incomingvideocall.endAllCall();
            Incomingvideocall.configure(incomingCallAnswer, endIncomingCall);
            Incomingvideocall.displayIncomingCall(callerInfo.title);

            break;

          case 'CALL_DECLINED':
            console.log('🚀 ~ CALL_DECLINED');
            Incomingvideocall.endAllCall();
            break;
          default:
            console.log('Other Notifications: Unknown');
        }
        VoipPushNotification.onVoipNotificationCompleted(notification.uuid);
      },
    );

    VoipPushNotification.addEventListener('didLoadWithEvents', events => {
      if (!events || !Array.isArray(events) || events.length < 1) {
        return;
      }

      const {callerInfo, videoSDKInfo, type} =
        events.length > 1 && events[1].data?.info;

      if (type === 'CALL_INITIATED') {
        console.log('🚀 ~ CALL_INITIATED');
        const incomingCallAnswer = () => {
          Incomingvideocall.endIncomingcallAnswer();
          // updateCallStatus({
          //   callerInfo,
          //   type: 'ACCEPTED',
          // });
          Navigation.navigate('CallingScreen', {
            isGroup: callerInfo.isGroup ? 1 : 0,
            recentparams: {
              chatId: callerInfo.chatId,
              title: callerInfo.title,
              fromHome: true,
              participants: callerInfo?.participants,
            },
          });
        };

        const endIncomingCall = () => {
          socketServcies.emit('declineCall', callerInfo);
          console.log('Ending incoming call');

          Incomingvideocall.endIncomingcallAnswer();
        };

        Incomingvideocall.endAllCall();
        Incomingvideocall.configure(incomingCallAnswer, endIncomingCall);
        Incomingvideocall.displayIncomingCall(callerInfo.title);
      }
    });

    VoipPushNotification.registerVoipToken();

    return () => {
      if (Platform.OS === 'ios') {
        VoipPushNotification.removeEventListener('didLoadWithEvents');
        VoipPushNotification.removeEventListener('register');
        VoipPushNotification.removeEventListener('notification');
      }
    };
  }, []);

  const handleCreateChat = (data: any) => {
    console.log('handleCreateChat ~ data:', data.data.participants);
    const participantName: User = data.data?.participants?.find(
      ({userId}: any) => userId !== user._id,
    );
    setAccountabilityUpdateModal(false);

    const isGroup =
      data.data.participants && data.data.participants.length > 2
        ? true
        : false;
    const chatTitle =
      participantName?.firstName + ' ' + participantName?.lastName;

    Navigation.navigate('ChatMessagesScreen', {
      group: isGroup ? 1 : 0,
      title: chatTitle,
      provider: 0,
      chatId: data.data._id,
      participants: data.data.participants,
      messages: undefined,
      goBack: true,
      profilePic: participantName?.photo
        ? participantName?.photo
        : participantName?.photoUrl,
    });
  };

  const getUserSchedules = async () => {
    try {
      const userSchedules = new ApiService(
        'challenge/upcoming',
        tokens.accessToken,
      );
      const userSchedulesRes = await userSchedules.Get();
      // console.log('🚀 ~ userSchedulesRes:', userSchedulesRes);

      if (userSchedulesRes.status === 200) {
        setSchedule(userSchedulesRes?.data);
      }
    } catch (error) {
      console.log('🚀 ~ getUserSchedules ~ error:', error);
    }
  };

  useEffect(() => {
    if (isFocused) getUserSchedules();
    if (isFocused && route.params?.accountabilityUpdate) {
      if (!route.params?.isDSBenotifiedNotif)
        socketServcies.on(`createChat/${user._id}`, handleCreateChat);

      setAccountabilityUpdateModal(true);
      navigation.setParams({
        ...route.params,
        accountabilityUpdate: false,
      });
    }
    if (!isFocused)
      socketServcies.removeListener(`createChat/${user._id}`, handleCreateChat);
  }, [isFocused, route.params?.accountabilityUpdate]);

  const getEntriesCount = async () => {
    try {
      const endpoint = `daily-state/journal-entry-count?userId=${user._id}`;
      const req = new ApiService(endpoint, tokens.accessToken);
      const res = await req.Get();

      console.log(res);
      if (res?.status !== 200) return;

      setEntriesCount(res?.data?.count);
    } catch (err) {
      console.log('getEntries ~ err:', err);
    }
  };

  const getUserTotalPoints = async () => {
    try {
      const points = new ApiService(
        `challenge/points/?userId=${user._id}`,
        tokens.accessToken,
      );
      const pointsRes = await points.Get();
      if (pointsRes.status === 200) setTotalPoints(pointsRes.data.totalPoints);
    } catch (error) {}
  };

  useEffect(() => {
    if (isFocused) {
      getEntriesCount();
      getUserTotalPoints();
    }
  }, [isFocused]);

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e: any) => {
        e.preventDefault();
      }),
    [navigation],
  );

  const removeFaceId = async () => {
    try {
      const rnBiometrics = new ReactNativeBiometrics({
        allowDeviceCredentials: true,
      });
      const {keysDeleted} = await rnBiometrics.deleteKeys();

      if (keysDeleted) {
        console.log('Successful deletion');
      } else {
        console.log(
          'Unsuccessful deletion because there were no keys to delete',
        );
      }

      dispatch(updateBiometric({isEnabled: false, key: null}));
    } catch (error) {
      console.log('Error deleting: ' + error);
    }
  };

  useEffect(() => {
    const logoutListener: any = EventRegister.addEventListener('Logout', () => {
      removeFCMToken();
      dispatch(setFcmToken(''));
      dispatch(setUserData(userInitialState));
      removeFaceId();
      dispatch(setAuthenticated(false));
      dispatch(setAccessToken(''));
      dispatch(setRefreshToken(''));

      EventRegister.removeEventListener(logoutListener);
    });

    Platform.OS === 'android' &&
      RNDisableBatteryOptimizationsAndroid.isBatteryOptimizationEnabled().then(
        (isBatteryOptimizationEnabled: any) => {
          if (isBatteryOptimizationEnabled)
            Alert.alert(
              'Info',
              "Disable battery optimization to ensure you don't miss any calls.",
              [{text: 'OK', onPress: () => requestPermissions()}],
            );
          else requestPermissions();
        },
      );

    DeviceInfo.getDeviceName().then(deviceName => {
      DeviceInfo.getManufacturer().then(manufacturer => {
        console.log('Device name: ' + manufacturer + ' ' + deviceName);

        dispatch(setDeviceName(manufacturer + ' ' + deviceName));
      });
    });
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={STYLES.dev1__homeContainer}>
        {/* <View style={{ height: 19}} /> */}
        <Header />
        <View style={styles.cardContainer}>
          <CustomCard
            content={`${totalPoints} Daily Points`}
            imageUrl={require('../../../assets/images/points.png')}
          />
          <CustomCard
            content={`${entriesCount} Entries`}
            imageUrl={require('../../../assets/images/entries.png')}
          />
        </View>
        
        <View style={styles.roundCardContainer}>
          <CustomRoundCard
            onPress={() => {
              Navigation.navigate('DailyChallenges');
            }}
            content="Daily Challenge"
            imageUrl={require('../../../assets/images/challenge.png')}
            backgroundColor={COLORS.green}
            extraStyles={{
              flex: 0,
              height: SCREEN_WIDTH / 4 - 15,
              width: SCREEN_WIDTH / 4 - 15,
            }}
          />
          <CustomRoundCard
            onPress={() => {
              Navigation.navigate('Journal');
            }}
            content="Journal"
            imageUrl={require('../../../assets/images/journal.png')}
            extraStyles={{
              flex: 0,
              height: SCREEN_WIDTH / 4 - 15,
              width: SCREEN_WIDTH / 4 - 15,
            }}
            backgroundColor="#6B9EA6"
          />
          <CustomRoundCard
            onPress={() => {
              Navigation.navigate('AccountablityNetwork');
            }}
            content="Accountability"
            imageUrl={require('../../../assets/images/accountability.png')}
            extraStyles={{
              flex: 0,
              height: SCREEN_WIDTH / 4 - 15,
              width: SCREEN_WIDTH / 4 - 15,
            }}
            backgroundColor="#A4DAD2"
          />
          <CustomRoundCard
            content="Intervention"
            imageUrl={require('../../../assets/images/intervention.png')}
            extraStyles={{
              flex: 0,
              height: SCREEN_WIDTH / 4 - 15,
              width: SCREEN_WIDTH / 4 - 15,
            }}
            backgroundColor="#4C5980"
          />
        </View>
        <MySchedule
          title="MY SCHEDULE"
          isButton={true}
          isSeeAll={true}
          onPressSeeMore={() =>
            navigation.navigate('MyScheduleScreen', {data: schedule})
          }
          schedule={schedule?.map((elem, i) => ({
            color: i === 0 ? COLORS.red : COLORS.neutral300,
            content: `Daily Challenge ${elem.challenge}`,
            id: elem._id,
          }))}
        />
        <TouchableOpacity
          style={styles.dailyStateContainer}
          onPress={() => navigation.navigate('DailyStateScreen')}>
          <DailyState />
        </TouchableOpacity>
      </View>

      <CustomModal
        visible={accountabilityUpdateModal}
        close={() => setAccountabilityUpdateModal(false)}
        title={route.params?.title}
        description={
          route.params?.isDSBenotifiedNotif
            ? 'Have you updated your Daily State for today?'
            : route.params?.isIntervenNotif
            ? ''
            : 'His daily state is below 25% today, would you like to start comforting him?'
        }
        icon="x"
        color={route.params?.isDSBenotifiedNotif ? COLORS.mainGreen : '#000'}
        btnBgColor={route.params?.isDSBenotifiedNotif ? '#CCF593' : '#8EB26F'}
        btnTxtColor={route.params?.isDSBenotifiedNotif ? '#134555' : 'white'}
        leftButton={route.params?.isDSBenotifiedNotif ? 'Yes' : 'Chat'}
        rightButton={route.params?.isDSBenotifiedNotif ? 'No' : 'Later'}
        onConfirm={() =>
          route.params?.isDSBenotifiedNotif
            ? (setAccountabilityUpdateModal(false), setFinalThought(true))
            : createChat(user._id ?? '', route.params?.userId)
        }
        closeFn={() => (
          setAccountabilityUpdateModal(false),
          Navigation.navigate('DailyStateScreen')
        )}
        imageUrl={imageUrl}
      />
      <FinalThoughtModal
        accessToken={tokens.accessToken}
        visible={finalThought}
        close={() => setFinalThought(!finalThought)}
        title="Wait! before you go."
        description="It is a great way to share with your friend know how you are feeling. "
        color="#8EB26F"
        icon="x"
        btnBgColor="#8EB26F"
        onConfirm={() => {
          setFinalThought(!finalThought);
          // navigation.navigate('PainChartScreen');
        }}
        imageUrl={require('../../../assets/images/daily-state-images/reception-bell.png')}
      />
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  cardContainer: {
    marginTop: verticalScale(14),
    flexDirection: 'row',
    gap: horizontalScale(13),
  },
  card: {
    width: horizontalScale(165),
    height: verticalScale(57),
    backgroundColor: '#FDFDFD',
    borderWidth: horizontalScale(1),
    borderColor: '#F4F4F4',
    borderRadius: moderateScale(10),
    paddingHorizontal: horizontalScale(16),
    alignItems: 'center',
    flexDirection: 'row',
    gap: horizontalScale(4),
    flex: 1,
  },
  roundCardContainer: {
    flexDirection: 'row',
    gap: horizontalScale(9),
  },
  dailyStateContainer: {
    marginTop: verticalScale(16),
    borderRadius: moderateScale(13),
    paddingVertical: verticalScale(18),
    paddingHorizontal: horizontalScale(8),
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
  },
});
