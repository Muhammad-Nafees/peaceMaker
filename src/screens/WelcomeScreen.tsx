import {View, Text, ScrollView} from 'react-native';
import React from 'react';
import {Image, Alert} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {horizontalScale, moderateScale, verticalScale} from '../utils/metrics';
import CustomButton from '../components/shared-components/CustomButton';
import {requestPermissions} from '../utils/permissions';
import {useAppDispatch, useAppSelector} from '../redux/app/hooks';
import {
  getFirebaseDeviceToken,
  requestUserPermission,
} from '../utils/pushNotification-helper';
import {setFcmToken} from '../redux/features/user/userSlice';
import {useIsFocused} from '@react-navigation/native';

interface Props {
  navigation: any;
}
const SplashScreen = ({navigation}: Props) => {
  const dispatch = useAppDispatch();
  const fcmToken = useAppSelector(state => state.user.tokens.fcmToken);

  const storingFcmToken = async () => {
    //goto utils/pushNotification-helper file for notification methods
    const permissionStatus = await requestUserPermission();
    if (permissionStatus && !fcmToken) {
      console.log('working fcm');
      const token = (await getFirebaseDeviceToken()).toString();
      console.log('~ storingFcmToken ~ token:', token);
      dispatch(setFcmToken(token));
    }
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused)
      setTimeout(() => {
        requestPermissions();
      }, 1000);
  }, [isFocused]);

  useEffect(() => {
    requestPermissions();
    storingFcmToken();
    return () => {};
  }, []);

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e: any) => {
        e.preventDefault();
      }),
    [navigation],
  );
  
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{backgroundColor: '#265565'}}>
      <LinearGradient
        colors={['#265565', '#288FB1', '#265565']}
        locations={[0, 0.4792, 1]}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={styles.SplashView}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/welcomeLogo.png')}
            style={{width: horizontalScale(343), height: verticalScale(530)}}
          />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.content}>
            <Text style={styles.heading}>Welcome to Peace Maker</Text>
            <Text style={styles.description}>
              Track you everyday routine, get free assessment with professionals
              and have your life together.
            </Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            onPress={() => {
              navigation.navigate('RegisterScreen');
              // navigation.navigate('AccountabilityPartner');
            }}>
            Get Started
          </CustomButton>
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  SplashView: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: horizontalScale(20),
    paddingBottom: horizontalScale(30),
  },
  logoContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    // flex: 2,
  },
  buttonContainer: {
    flex: 2,
  },
  heading: {
    fontFamily: 'Satoshi-Bold',
    color: 'white',
    fontSize: moderateScale(34),
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: horizontalScale(0.6),
    paddingBottom: 5,
    // lineHeight: verticalScale(41),
    // width: horizontalScale(243),
  },
  description: {
    fontFamily: 'GeneralSans-Semibold',
    opacity: 0.7,
    fontWeight: '600',
    // lineHeight: verticalScale(18),
    letterSpacing: horizontalScale(-0.08),
    color: 'white',
    fontSize: moderateScale(13),
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
  },
});
