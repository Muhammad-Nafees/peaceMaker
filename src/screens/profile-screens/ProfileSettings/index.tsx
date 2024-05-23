import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useDispatch} from 'react-redux';
import {launchImageLibrary} from 'react-native-image-picker';
import Toast from 'react-native-root-toast';
import {Toast as ToastMessage} from 'react-native-toast-message/lib/src/Toast';
import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../../utils/metrics';
import ProfileItem from '../../../components/profile/ProfileItem';
import ProfileImg from '../../../components/profile/ProfileImg';
import Navigation from '../../../utils/appNavigation';
import AccountDeleteModal from '../../../components/profile/AccountDeleteModal';
import {useAppSelector} from '../../../redux/app/hooks';
import {
  userInitialState,
  setAccessToken,
  setAuthenticated,
  setRefreshToken,
  setUserData,
  setFcmToken,
} from '../../../redux/features/user/userSlice';
import {ApiService, baseUrl} from '../../../utils/ApiService';
import {removeFCMToken} from '../../../utils/helpers';
import {updateBiometric} from '../../../redux/features/extra/extraSlice';
import {EventRegister} from 'react-native-event-listeners';
import socketServcies from '../../../utils/socketServices';
// import FingerprintScanner from 'react-native-fingerprint-scanner';

interface Image {
  name: string | undefined;
  type: string | undefined;
  uri: string | undefined;
}

export default function ProfileSettings() {
  const [showPopup1, setShowPopup1] = React.useState(false);
  const [showPopup2, setShowPopup2] = React.useState(false);
  const [showPopup3, setShowPopup3] = React.useState(false);
  const [imgLoading, setImgLoading] = React.useState(false);
  const [passwordSetted, setPasswordSetted] = React.useState(true);

  const {biometric} = useAppSelector(state => state.extra);

  const [isBiometricEnabled, setIsBiometric] = React.useState(
    biometric?.isEnabled ? true : false,
  );

  // const user = useAppSelector((state: any) => state.user.data);
  // const accessToken = useAppSelector(state => state.user.tokens.accessToken);
  const {data: user, tokens} = useAppSelector(state => state.user);
  const dispatch = useDispatch();

  function convertDateFormat(dateString: string) {
    const parts = dateString.split('/');
    const formattedDate = `${parts[2]}-${parts[0]}-${parts[1]}`;
    return formattedDate;
  }

  const removeFCMTokenFromDB = async (): Promise<boolean> => {
    try {
      const logoutApi = new ApiService('auth/logout', tokens.accessToken);
      const response = await logoutApi.Post({
        fcmToken: tokens.fcmToken,
      });
      console.log('removeFCMTokenFromDB', response);

      if (response?.status !== 200) {
        return false;
      }
      return true;
    } catch (error) {
      console.log('🚀 ~ removeFCMTokenFromDB ~ error:', error);
      return false;
    }
  };

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

  const handleLogout = async (deleteFcmToken = true) => {
    setImgLoading(true);
    if (deleteFcmToken) await removeFCMTokenFromDB();
    removeFCMToken();
    dispatch(setFcmToken(''));
    dispatch(setUserData(userInitialState));
    removeFaceId();
    socketServcies.disconnect();
    setImgLoading(false);
    dispatch(setAuthenticated(false));
    dispatch(setAccessToken(''));
    dispatch(setRefreshToken(''));
  };

  const getFaceIdPermissions = async (): Promise<string> => {
    try {
      if (Platform.OS === 'android') return RESULTS.GRANTED;

      const permission = PERMISSIONS.IOS.FACE_ID;

      const permissionStatus = await check(permission);

      if (permissionStatus === RESULTS.GRANTED) return permissionStatus;

      const requestStatus = await request(permission);

      return requestStatus;
    } catch (er) {
      console.log('getFaceIdPermissions ~ er:', er);
      return '';
    }
  };

  const handleFaceIdToggle = async () => {
    try {
      const faceIdPermissionStatus = await getFaceIdPermissions();

      if (isBiometricEnabled) {
        dispatch(updateBiometric({isEnabled: false, key: null}));
        setIsBiometric(false);
        return;
      }
      const rnBiometrics = new ReactNativeBiometrics({
        allowDeviceCredentials: true,
      });

      // removeFaceId();
      // return;

      const {keysExist} = await rnBiometrics.biometricKeysExist();

      if (keysExist) {
        console.log('Keys exist');
        setIsBiometric(true);
        dispatch(updateBiometric({isEnabled: true, key: null}));
        return;
      }
      console.log('Keys does not exist');

      const {biometryType, available} = await rnBiometrics.isSensorAvailable();
      console.log('~ available:', available);
      console.log('~ biometryType:', biometryType);

      if (!available)
        return ToastMessage.show({
          type: 'info',
          text1: 'Biometric not available.',
        });

      if (
        biometryType === BiometryTypes.FaceID &&
        faceIdPermissionStatus !== RESULTS.GRANTED
      )
        return;
      if (
        biometryType === BiometryTypes.Biometrics ||
        biometryType === BiometryTypes.FaceID ||
        biometryType === BiometryTypes.TouchID
      ) {
        const promptOptions = {promptMessage: 'Use Biometrics'};
        const {success, error} = await rnBiometrics.simplePrompt(promptOptions);
        if (success) {
          setIsBiometric(true);
          dispatch(updateBiometric({isEnabled: true, key: null}));
          console.log('success');

          if (keysExist) {
            console.log('Keys exist');
          } else {
            console.log('Keys do not exist or were deleted');
            const resultObject = await rnBiometrics.createKeys();
            const {publicKey} = resultObject;
            console.log(publicKey);
          }
          // sendPublicKeyToServer(publicKey);

          return;
        }
      }
    } catch (error) {
      console.log('Biometrics error: ' + error);
    }
  };

  const updateUserPhoto = async (userImg: Image) => {
    try {
      setImgLoading(true);
      let reqData: any = new FormData();
      reqData.append('photo', userImg);
      reqData.append('firstName', user.firstName);
      reqData.append('lastName', user.lastName);
      let dateOfBirth = new Date(user.dob!);

      let formattedDate = dateOfBirth.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
      const formatedDOB = convertDateFormat(formattedDate);
      reqData.append('dob', formatedDOB);

      const response = await fetch(baseUrl + 'user/update-profile', {
        method: 'PUT',
        headers: {
          accessToken: tokens.accessToken,
        },
        body: reqData,
      });
      if (response.status == 401) EventRegister.emit('Logout', 'it works!!!');
      const newProfileRes = await response.json();

      if (response.status === 200) {
        newProfileRes.data.partner = user.partner;
        newProfileRes.data.buddies = user.buddies;

        dispatch(setUserData({...newProfileRes.data, userType: user.userType}));
      }

      setImgLoading(false);
    } catch (err) {
      console.log('🚀 ~ file: index.tsx:113 ~ handleProfileUpdate ~ err:', err);
      setImgLoading(false);
    }
  };

  const handleCameraLaunch = async () => {
    const {assets} = await launchImageLibrary({mediaType: 'photo'});
    if (!assets) {
      return;
    }

    updateUserPhoto({
      name: assets[0].fileName,
      type: assets[0].type,
      uri: assets[0].uri,
    });
  };

  const handleImageDelete = async () => {
    try {
      setImgLoading(true);
      const response = await fetch(baseUrl + 'user/remove-profile-photo', {
        method: 'DELETE',
        headers: {
          accessToken: tokens.accessToken,
        },
      });
      if (response.status == 401) EventRegister.emit('Logout', 'it works!!!');
      const newProfileRes = await response.json();

      if (response.status === 200) {
        newProfileRes.data.partner = user.partner;
        newProfileRes.data.buddies = user.buddies;

        dispatch(setUserData({...newProfileRes.data, userType: user.userType}));
      }
      setImgLoading(false);
    } catch (err) {
      console.log('🚀 ~ file: index.tsx:113 ~ handleProfileUpdate ~ err:', err);
      setImgLoading(false);
    }
  };

  const handleAccountDelete = async () => {
    try {
      const response = await fetch(baseUrl + 'user/remove-account', {
        method: 'DELETE',
        headers: {
          accessToken: tokens.accessToken,
        },
      });
      if (response.status == 401) EventRegister.emit('Logout', 'it works!!!');
      const accDelRes = await response.json();

      if (response.status !== 200) {
        ToastMessage.show({
          type: 'error',
          text1: 'Unable to delete account',
          text2: accDelRes?.message,
        });

        setShowPopup2(false);
        return;
      }
      setShowPopup2(false);
      setShowPopup3(true);
    } catch (err) {
      console.log('🚀 ~ file: index.tsx:113 ~ handleProfileUpdate ~ err:', err);
      ToastMessage.show({
        type: 'error',
        text1: 'Unable to delete account',
      });
    }
  };

  const successMessage = (): any => (
    <View
      style={{
        backgroundColor: 'transparent',
        opacity: 1,
      }}>
      <ActivityIndicator color="#8eb26f" size={30} />
    </View>
  );

  const getPasswordStatus = async () => {
    try {
      const statusReq = new ApiService(
        'user/password-status',
        tokens.accessToken,
      );
      const statusRes = await statusReq.Get();
      if (statusRes.status !== 200) return;
      setPasswordSetted(statusRes.data?.isPasswordSet ? true : false);
    } catch (error) {
      console.log('~ getPasswordStatus ~ error:', error);
    }
  };

  useEffect(() => {
    if (user.userType === 'social') getPasswordStatus();
  }, []);

  return (
    <ScrollView style={{flex: 1, backgroundColor: '#f9fafa'}}>
      <Toast
        visible={imgLoading}
        position={Toast.positions.TOP}
        shadow={false}
        animation={true}
        hideOnPress={true}
        delay={0}
        opacity={1}
        backgroundColor="transparent">
        {successMessage()}
      </Toast>
      <View
        style={{flex: 1, backgroundColor: '#F9FAFA', paddingHorizontal: 16}}>
        <View style={styles.box1}>
          <View style={styles.box1NameInfo}>
            <Text style={styles.box1NameInfoTitle}>
              {user.firstName + ' ' + user.lastName}
            </Text>
            <Text style={styles.box1NameInfoSubtitle}>Personal account</Text>
          </View>
          <ProfileImg
            imgUri={
              user?.photoUrl && !user?.photo
                ? user?.photoUrl
                : user?.photo
                ? 'https://peacemakers3.s3.us-east-2.amazonaws.com/' +
                  user?.photo
                : ''
            }
            isImg={user?.photo ? true : false}
            handleCameraLaunch={handleCameraLaunch}
            handleImageDelete={handleImageDelete}
          />
        </View>
        <Text style={styles.sectionLabel}>Profile</Text>
        <ProfileItem
          onPress={() => Navigation.navigate('AccountDetails')}
          imgSize={29}
          img={require('../../../../assets/icons/user.png')}
          text="Account details"
        />
        <View style={{height: 17}} />
        <Text style={styles.sectionLabel}>Security</Text>
        <ProfileItem
          onPress={() =>
            Navigation.navigate('ChangePassword', {
              passwordSetted: passwordSetted,
            })
          }
          img={require('../../../../assets/icons/shield.png')}
          text="Change Password"
        />
        <ProfileItem
          isEffect={false}
          switchValue={isBiometricEnabled}
          setSwitchValue={setIsBiometric}
          onPress={handleFaceIdToggle}
          showToggle
          imgSize={20}
          img={require('../../../../assets/icons/SmilingFace.png')}
          text="Face Id"
        />
        <View style={{height: 17}} />
        <Text style={styles.sectionLabel}>Legal</Text>
        <ProfileItem
          onPress={() => Navigation.navigate('PrivacyPolicy')}
          imgSize={22}
          img={require('../../../../assets/icons/Vector.png')}
          text="Privacy Policy"
        />
        <ProfileItem
          onPress={() => Navigation.navigate('Support')}
          imgSize={23}
          img={require('../../../../assets/icons/question.png')}
          text="Help and Support"
        />
        <ProfileItem
          onPress={() => Navigation.navigate('TermAndConditions')}
          imgSize={20}
          img={require('../../../../assets/icons/bill.png')}
          text="Terms and Conditions"
        />
        <View style={{height: 17}} />
        <ProfileItem
          onPress={handleLogout}
          imgSize={20}
          img={require('../../../../assets/icons/logout.png')}
          text="Log out"
        />
        <ProfileItem
          onPress={() => setShowPopup1(true)}
          imgSize={20}
          img={require('../../../../assets/icons/close.png')}
          text="Delete account"
        />

        {showPopup1 || showPopup2 || showPopup3 ? (
          <BlurView
            style={styles.absolute}
            blurType="light"
            blurAmount={1}
            reducedTransparencyFallbackColor="white"
          />
        ) : null}

        <AccountDeleteModal
          onReqClose={() => setShowPopup1(false)}
          onPressConfirm={() => {
            setShowPopup1(false);
            setShowPopup2(true);
          }}
          showPopup={showPopup1}
          button1="Cancel"
          button2="Confirm"
          title="Are you sure you want to close your account?"
          subtitle="Once you close your account you will not be able to retrieve it anymore."
        />

        <AccountDeleteModal
          showInp
          onReqClose={() => setShowPopup2(false)}
          onPressConfirm={handleAccountDelete}
          showPopup={showPopup2}
          button1="Cancel"
          button2="Confirm"
          title="Confirmation"
          subtitle="Please enter the word “DELETE” before we delete your account."
        />

        <AccountDeleteModal
          onReqClose={() => setShowPopup3(false)}
          onPressConfirm={() => {
            handleLogout(false);
            setShowPopup3(false);
          }}
          showPopup={showPopup3}
          button2="Done"
          title="Account deleted"
          subtitle="Your account has been deleted successfully."
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  box1: {
    flexDirection: 'row',
    alignItems: 'center',
    // height: verticalScale(55),
    marginTop: 10,
    marginBottom: 20,
  },
  box1NameInfo: {height: '100%', flex: 1},
  box1NameInfoTitle: {
    fontSize: moderateScale(28),
    fontWeight: '700',
    color: '#15141F',
    textTransform: 'capitalize',
  },
  box1NameInfoSubtitle: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: '#576B74',
    marginTop: 2,
  },
  box1ImageBox: {
    width: 43,
    height: 43,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAF3E2',
  },
  box1Image: {width: horizontalScale(25), height: verticalScale(25)},
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
  sectionLabel: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#0C212C',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
