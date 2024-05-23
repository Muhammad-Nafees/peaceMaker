import {PermissionsAndroid, Platform} from 'react-native';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';
/**
 * @name requestCameraAndAudioPermission
 * @description Function to request permission for Audio and Camera
 */
export async function requestCameraAndAudioPermission() {
  // PERMISSIONS.IOS.CAMERA
  // PERMISSIONS.IOS.MICROPHONE
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
      if (
        granted['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.CAMERA'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('You can use the cameras & mic');
      } else {
        console.log('Permission denied');
      }
      return;
    }

    const permission = PERMISSIONS.IOS.CAMERA;

    const permissionStatus = await check(permission);

    if (permissionStatus !== RESULTS.GRANTED) {
      const requestStatus = await request(permission);

      if (requestStatus === RESULTS.GRANTED)
        console.log('You can use the cameras');
    } else {
      console.log('You can use the cameras');
    }

    const permission2 = PERMISSIONS.IOS.MICROPHONE;

    const permissionStatus2 = await check(permission2);

    if (permissionStatus2 !== RESULTS.GRANTED) {
      const requestStatus2 = await request(permission2);

      if (requestStatus2 === RESULTS.GRANTED)
        console.log('You can use the mic');
    } else {
      console.log('You can use the mic');
    }
  } catch (err) {
    console.warn(err);
  }
}
