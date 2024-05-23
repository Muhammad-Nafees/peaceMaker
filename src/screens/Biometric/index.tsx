import {
  CommonActions,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Text, Image, AppState, Platform, BackHandler} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import Icon from 'react-native-vector-icons/Fontisto';
import {COLORS} from '../../constants/colors';
import messaging from '@react-native-firebase/messaging';

import Navigation from '../../utils/appNavigation';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Incomingvideocall from '../../utils/incoming-video-call';
import socketServcies from '../../utils/socketServices';

export default function Biometrics({route}: any) {
  const isFocused = useIsFocused();
  const shouldHandleBackground = useRef(true);

  const routeRef = useRef(route);
  routeRef.current = route;

  const navigation: any = useNavigation();

  const notificationClickNavigate = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          {
            name: 'DashboardScreen',
          },
          {
            name: routeRef.current.params?.handleNotificationClickGoto,
            params: {
              ...routeRef.current.params,
            },
          },
        ],
      }),
    );
  };

  const handleFaceId = async (returnStatus = false) => {
    console.log('Authenticating user...');

    try {
      const rnBiometrics = new ReactNativeBiometrics({
        allowDeviceCredentials: true,
      });

      const {available} = await rnBiometrics.isSensorAvailable();

      if (!available) return false;

      const promptOptions = {promptMessage: 'Use Biometrics'};
      const {success, error} = await rnBiometrics.simplePrompt(promptOptions);
      console.log('success');
      if (success) {
        console.log('Biometrics was successfully');

        if (returnStatus) return true;

        if (routeRef.current.params?.handleNotificationClickGoto)
          return notificationClickNavigate();

        Navigation.replace('DashboardScreen', {});

        return;
      }

      shouldHandleBackground.current = false;
      if (error) {
        console.log(error);
      }

      if (returnStatus) return false;
    } catch (err) {
      console.log('handleFaceId ~ err:', err);
    }
  };


  
  useEffect(() => {
    if (isFocused) routeRef.current = route;
  }, [isFocused, route?.params]);

  useEffect(() => {
    if (isFocused) handleFaceId();
  }, [isFocused]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', appState => {
      if (appState === 'active' && shouldHandleBackground.current)
        handleFaceId();
      shouldHandleBackground.current = true;
    });

    return () => {
      subscription.remove();
    };
  }, []);

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


          const incomingCallAnswer = async () => {
            Incomingvideocall.endIncomingcallAnswer();
    
            Navigation.navigate('Biometric', {
              isGroup: callerInfo.isGroup ? 1 : 0,
              recentparams: {
                chatId: callerInfo.chatId,
                title: callerInfo.title,
                fromHome: true,
                participants: callerInfo?.participants,
              },
              handleNotificationClickGoto: 'CallingScreen',
            });
          };

          const endIncomingCall = async () => {
           
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
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => backHandler.remove()
  }, [])

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Icon name="locked" size={28} color={COLORS.mainGreen} />
        <Text style={{color: 'black', fontSize: 22, marginTop: 20}}>
          Peacemaker Locked
        </Text>
      </View>
      <View
        style={{
          paddingHorizontal: 30,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity onPress={handleFaceId} style={{marginBottom: 5}}>
          <Text style={{color: 'black'}}>Press here</Text>
        </TouchableOpacity>

        <Text style={{color: 'grey', textAlign: 'center'}}>
          To use Fingerprint sensor or Face id to unlock.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    alignItems: 'center',
    paddingTop: 50,
  },
  map: {
    flex: 1,
  },
});
