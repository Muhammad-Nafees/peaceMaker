//Firebase-@SAM
import messaging, {firebase} from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';

async function requestUserPermission(): Promise<boolean> {
  const authStatus = await messaging().requestPermission();
  const status =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  return status;
}

async function getFirebaseDeviceToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'ios') return await messaging().getAPNSToken();
    else return await messaging().getToken();

    // return messagingToken;
  } catch (e) {
    console.log('getToken', e);
    return null;
  }
}

const notificationListener = () => {
  requestUserPermission();
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('app opened from notification', remoteMessage.notification);
  });

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'notification opened app from quit state',
          remoteMessage.notification,
        );
      }
    });

  messaging().onMessage(async remoteMessage => {
    console.log('notification on foreground state', remoteMessage);
  });
};

export {requestUserPermission, notificationListener, getFirebaseDeviceToken};
