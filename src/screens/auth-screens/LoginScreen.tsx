import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ToastAndroid,
} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import {COLORS} from '../../constants/colors';
import CustomInput from '../../components/shared-components/CustomInput';
import CustomButton from '../../components/shared-components/CustomButton';
import CustomDivider from '../../components/shared-components/CustomDivider';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import SocialIcons from '../../components/shared-components/SocialIcons';
import {useState} from 'react';
import {ApiService} from '../../utils/ApiService';
import {Formik} from 'formik';
import Toast from 'react-native-toast-message';
import {storeUserData} from '../../utils/helpers';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../interface/types';
import {useNavigation} from '@react-navigation/native';
import {loginSchema} from '../../validations';
import {ActivityIndicator} from 'react-native-paper';
import {useAppDispatch, useAppSelector} from '../../redux/app/hooks';
import {
  setAccessToken,
  setAuthenticated,
  setFcmToken,
  setRefreshToken,
  setUserData,
} from '../../redux/features/user/userSlice';
import {
  getFirebaseDeviceToken,
  requestUserPermission,
} from '../../utils/pushNotification-helper';
import DeviceInfo from 'react-native-device-info';
import {
  ConfigureParams,
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import {
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  LoginManager,
} from 'react-native-fbsdk-next';
import appleAuth from '@invertase/react-native-apple-authentication';
import Navigation from '../../utils/appNavigation';
import {REGISTERTYPES} from '../../enums/auth';
import AppKeyboardAvoidingView from '../../components/shared-components/KeyboardAvoidingView';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'AccountabilityBuddies',
  'Home'
>;

interface FormValues {
  email?: string;
  password?: string;
  fcmToken: string;
  socialId?: string;
}

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();

  const accessToken = useAppSelector(state => state.user.tokens.accessToken);
  const fcmToken = useAppSelector(state => state.user.tokens.fcmToken);

  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  // email: 'aa@dsf.com',
  // password: '12345678',
  const initialValues: FormValues = {
    email: '',
    password: '',
    fcmToken: fcmToken,
  };
  const storingFcmToken = async () => {
    //goto utils/pushNotification-helper file for notification methods
    const permissionStatus = await requestUserPermission();
    if (permissionStatus && !fcmToken) {
      console.log('working fcm');
      const token = (await getFirebaseDeviceToken()).toString();
      console.log('storingFcmToken ~ token:', token);
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Unable to login',
          text2: 'Failed to get device token.',
        });
      } else {
        dispatch(setFcmToken(token));
      }
    }
  };

  const handleSubmit = async (formValues: FormValues) => {
    let values = formValues;
    const manufacturer = await DeviceInfo.getManufacturer();
    // .then(manufacturer => {
    // console.log(
    //   '🚀 ~ file: LoginScreen.tsx:82 ~ DeviceInfo.getManufacturer ~ manufacturer:',
    //   manufacturer,
    // );
    // return;
    // });

    if (manufacturer === 'HUAWEI' && !fcmToken) {
      // for huawei devices:
      values.fcmToken = '12345';
    } else {
      if (!fcmToken) {
        storingFcmToken();
        return;
      }
      values.fcmToken = fcmToken;
    }

    if (values.socialId)
      values = {fcmToken: values.fcmToken, socialId: values.socialId};

    setLoginLoading(true);

    // setting email to lowercase
    if (!values.socialId) values.email = values.email?.toLowerCase();

    try {
      const login = new ApiService('auth/login', '');
      const loginRes = await login.unsecuredPost(values);
      console.log('handleSubmit ~ loginRes:', loginRes);

      if (loginRes?.status == 200) {
        // storing user data after successfull login
        console.log(loginRes?.data?.user.buddies);

        dispatch(
          setUserData({
            ...loginRes?.data?.user,
            userType: values.socialId ? 'social' : 'manual',
          }),
        );
        dispatch(setAccessToken(loginRes?.data?.accessToken));
        dispatch(setRefreshToken(loginRes?.data?.refreshToken));

        if (loginRes?.data?.user.buddies?.length) {
          dispatch(setAuthenticated(true));
          navigation.navigate('DashboardScreen');
        } else {
          navigation.navigate('AccountabilityBuddies');
        }

        Toast.show({
          type: 'success',
          text1: 'Successfully Logged-In!',
        });
      } else if (loginRes?.message === 'Invalid email or password') {
        if (values.socialId) {
          setLoginLoading(false);
          const defaultValues = {
            day: '',
            email: '',
            firstName: '',
            height: undefined,
            heightUnit: 'in',
            lastName: '',
            location: '',
            month: '',
            password: '',
            photo: '',
            weight: undefined,
            weightUnit: 'lbs',
            year: '',
          };
          ToastAndroid.showWithGravity(
            'Register first',
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
          Navigation.navigate('RegisterScreenUsingSocial', {
            ...formValues,
            values: defaultValues,
          });
          return;
        }
        Toast.show({
          type: 'error',
          text1: 'Unable to login',
          text2: 'Account does not exist',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Un-Successful!',
          text2: loginRes?.message?.replace('[', '').replace(']', ''),
        });
      }
    } catch (error) {
      Toast.show({type: 'error', text1: 'Unable To Login!'});
    }
    setLoginLoading(false);
  };

  const handleGoogleLogin = async () => {
    const params: ConfigureParams = {};

    GoogleSignin.configure(params);
    GoogleSignin.hasPlayServices()
      .then(hasPlayService => {
        if (hasPlayService) {
          GoogleSignin.signIn()
            .then(userInfo => {
              console.log(JSON.stringify(userInfo));
              GoogleSignin.signOut();

              handleSubmit({
                fcmToken: fcmToken,
                password: '12345678',
                email: userInfo.user.email,
                photo: userInfo.user?.photo,
                fName: userInfo.user?.givenName,
                lName: userInfo.user?.familyName,
                socialId: userInfo?.user?.id,
                type: REGISTERTYPES.GOOGLE,
              });
            })
            .catch(e => {
              console.log('ERROR IS: ' + JSON.stringify(e));
            });
        }
      })
      .catch(e => {
        console.log('ERROR IS: ' + JSON.stringify(e));
      });
  };

  const getInfoFromToken = (token: any) => {
    const PROFILE_REQUEST_PARAMS = {
      fields: {
        string: 'id,name,first_name,last_name,email',
      },
    };
    const profileRequest = new GraphRequest(
      '/me',
      {accessToken: token, parameters: PROFILE_REQUEST_PARAMS},
      (error: any, user: any) => {
        if (error) {
          console.log('login info has error: ' + error);
        } else {
          console.log('result:', user);
          handleSubmit({
            fcmToken: fcmToken,
            email: user?.email,
            password: '12345678',
            photo: null,
            fName: user?.first_name,
            lName: user?.last_name,
            socialId: user?.id,
            type: REGISTERTYPES.FACEBOOK,
          });
        }
      },
    );
    new GraphRequestManager().addRequest(profileRequest).start();
  };

  const handleFacebookLogin = async () => {
    LoginManager.logInWithPermissions(['email', 'public_profile']).then(
      (login: any) => {
        if (login.isCancelled) {
          console.log('Login cancelled');
        } else {
          AccessToken.getCurrentAccessToken().then((data: any) => {
            const accessToken = data.accessToken.toString();
            getInfoFromToken(accessToken);
          });
        }
      },
      (error: any) => {
        console.log('Login fail with error: ' + error);
      },
    );
  };

  const handleAppleLogin = async function () {
    try {
      let appleId = '';
      let appleToken = '';
      let appleEmail = '';
      // Performs login request requesting user email
      let response = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
      console.log('~ handleAppleSignup ~ response:', response);
      // On iOS, user ID and email are easily retrieved from request
      appleId = response.user;

      // Format authData to provide correctly for Apple linkWith on Parse
      const authData = {
        id: appleId,
        token: appleToken,
      };

      // Navigation.navigate('RegisterScreenUsingSocial', {
      //   email: response?.email,
      //   photo: null,
      //   fName: response?.fullName?.givenName,
      //   lName: response?.fullName?.familyName,
      //   socialId: appleId,
      //   type: REGISTERTYPES.APPLE,
      // });
      handleSubmit({
        fcmToken: fcmToken,
        email: response?.email,
        password: '12345678',
        socialId: appleId,
        photo: null,
        fName: response?.fullName?.givenName,
        lName: response?.fullName?.familyName,
        type: REGISTERTYPES.APPLE,
      });
    } catch (error) {
      // Error can be caused by wrong parameters or lack of Internet connection
      console.log('Apple Signup Error!', error);
      return false;
    }
  };

  return (
    <AppKeyboardAvoidingView verticalOffset={25}>
      <ScrollView
        style={{flex: 1, backgroundColor: 'white'}}
        contentContainerStyle={[
          {
            paddingHorizontal: horizontalScale(16),

            // paddingBottom: verticalScale(30),
            // paddingTop: verticalScale(70),
            // flex: 1
          },
        ]}
        keyboardShouldPersistTaps="always">
        <View
          style={{
            alignItems: 'center',
            backgroundColor: 'white',
            paddingHorizontal: horizontalScale(16),
            paddingBottom: verticalScale(30),
            paddingTop: verticalScale(70),
          }}>
          <View
            style={{
              flex: 1,
              alignSelf: 'center',
              justifyContent: 'center',
            }}>
            <Image
              source={require('../../../assets/images/logo.png')}
              resizeMode="contain"
              alt="logo"
              style={{
                width: 200,
                height: 175,
              }}
            />
          </View>
          <Text
            style={[
              STYLES.dev1__text28,
              {
                color: COLORS.blue,
                paddingTop: 23.5,
                fontFamily: 'Satoshi-Bold',
              },
            ]}>
            Welcome Back!
          </Text>
        </View>
        <View style={{flex: 1}}>
          <Formik
            initialValues={initialValues}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}>
            {({
              handleChange,
              handleSubmit,
              handleBlur,
              submitForm,
              values,
              errors,
              touched,
              initialTouched,
            }) => (
              <>
                <View style={styles.formContainer}>
                  <CustomInput
                    label="Email"
                    placeholder="Email"
                    value={values.email}
                    error={errors.email}
                    touched={touched.email}
                    initialTouched={true}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChange={handleChange('email')}
                    isCancel={true}
                  />
                  <CustomInput
                    label="Password"
                    placeholder="Password"
                    value={values.password}
                    error={errors.password}
                    touched={touched.password}
                    initialTouched={true}
                    onChange={handleChange('password')}
                    isIcon={true}
                  />
                </View>
                <View>
                  <Text
                    style={[
                      STYLES.dev1__text13,
                      {
                        color: COLORS.primary600,
                        textAlign: 'right',
                        paddingTop: verticalScale(8),
                        fontFamily: 'GeneralSans-Semibold',
                        position: 'absolute',
                        right: horizontalScale(0),
                        bottom: verticalScale(0),
                      },
                    ]}
                    onPress={() => navigation.navigate('ForgetPassword')}>
                    Forgot Password
                  </Text>
                </View>

                <CustomDivider
                  text="or sign in using"
                  extraStyles={{paddingTop: verticalScale(46)}}
                />
                <SocialIcons
                  onGoogleLogin={handleGoogleLogin}
                  onFacebookLogin={handleFacebookLogin}
                  onAppleLogin={handleAppleLogin}
                  extraStyles={{
                    paddingVertical: verticalScale(0),
                    paddingTop: verticalScale(28),
                  }}
                />

                {loginLoading && (
                  <ActivityIndicator style={{paddingTop: verticalScale(20)}} />
                )}
                <CustomButton
                  extraStyles={{marginTop: verticalScale(32)}}
                  onPress={handleSubmit}
                  isDisabled={loginLoading}>
                  Sign in
                </CustomButton>

                <Text
                  style={[
                    STYLES.dev1__text13,
                    {
                      color: COLORS.primary600,
                      textAlign: 'center',
                      marginTop: verticalScale(31),
                      fontFamily: 'GeneralSans-Semibold',
                      paddingBottom: 10,
                    },
                  ]}>
                  Don’t have an account?{' '}
                  <Text
                    style={{
                      color: COLORS.primary400,
                      fontFamily: 'GeneralSans-Semibold',
                    }}
                    onPress={() => navigation.navigate('RegisterScreen')}>
                    Sign Up
                  </Text>
                </Text>
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </AppKeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    gap: 8,
    paddingTop: verticalScale(23.5),
  },
});