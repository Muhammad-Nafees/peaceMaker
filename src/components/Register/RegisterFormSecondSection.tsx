import {StyleSheet} from 'react-native';
import {View, Text, TouchableOpacity} from 'react-native';
import {verticalScale, moderateScale} from '../../utils/metrics';
import CustomButton from '../shared-components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import SocialIcons from '../shared-components/SocialIcons';
import {AuthStackParamList, RegisterFormValues} from '../../interface/types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ActivityIndicator} from 'react-native-paper';
import {
  ConfigureParams,
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import Navigation from '../../utils/appNavigation';
import {REGISTERTYPES} from '../../enums/auth';
import appleAuth from '@invertase/react-native-apple-authentication';
import {
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  LoginManager,
} from 'react-native-fbsdk-next';
import {ApiService} from '../../utils/ApiService';
import {useAppDispatch, useAppSelector} from '../../redux/app/hooks';
import {
  setAccessToken,
  setAuthenticated,
  setRefreshToken,
  setUserData,
} from '../../redux/features/user/userSlice';
import Toast from 'react-native-toast-message';

interface Props {
  onSubmitForm: any;
  registerLoading: boolean;
  showIcons?: boolean;
  prevValues: RegisterFormValues;
  setRegisterloading?: (val: boolean) => void;
}

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'LoginScreen'
>;

function RegisterFormSecondSection({
  onSubmitForm,
  registerLoading,
  showIcons = true,
  setRegisterloading = () => null,
  prevValues,
}: Props) {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const fcmToken = useAppSelector(state => state.user.tokens.fcmToken);

  const handleSubmit = async (socialDetail: any) => {
    setRegisterloading(true);

    const values = {
      fcmToken: fcmToken,
      socialId: socialDetail.socialId,
    };

    try {
      const login = new ApiService('auth/login', '');
      const loginRes = await login.unsecuredPost(values);
      console.log('handleSubmit ~ loginRes:', loginRes);

      if (
        loginRes?.message?.toLowerCase() ===
        'Invalid email or password'.toLowerCase()
      ) {
        setRegisterloading(false);
        Navigation.navigate('RegisterScreenUsingSocial', {
          ...socialDetail,
          values: prevValues,
        });
        return;
      }

      if (loginRes?.status !== 200) {
        setRegisterloading(false);
        Toast.show({
          type: 'error',
          text1: 'Something went wrong',
        });
        return;
      }

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

      setRegisterloading(false);

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
    } catch (error) {
      Toast.show({type: 'error', text1: 'Unable To Register!'});
    }
  };

  const handleGoogleSignup = async () => {
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
                email: userInfo.user.email,
                photo: userInfo.user?.photo,
                fName: userInfo.user?.givenName,
                lName: userInfo.user?.familyName,
                socialId: userInfo?.user?.id,
                type: REGISTERTYPES.GOOGLE,
              });
              // Navigation.navigate('RegisterScreenUsingSocial', );
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

  const handleAppleSignup = async function () {
    try {
      let appleId = '';
      let appleToken = '';
      let appleEmail = '';
      // Performs login request requesting user email
      let response = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
      console.log(
        '🚀 ~ file: RegisterFormSecondSection.tsx:76 ~ handleAppleSignup ~ response:',
        response,
      );
      // On iOS, user ID and email are easily retrieved from request
      appleId = response.user;

      // Format authData to provide correctly for Apple linkWith on Parse
      const authData = {
        id: appleId,
        token: appleToken,
      };

      handleSubmit({
        email: response?.email,
        photo: null,
        fName: response?.fullName?.givenName,
        lName: response?.fullName?.familyName,
        socialId: appleId,
        type: REGISTERTYPES.APPLE,
      });

      // Navigation.navigate('RegisterScreenUsingSocial');
    } catch (error) {
      // Error can be caused by wrong parameters or lack of Internet connection
      console.log('Apple Signup Error!', error);
      return false;
    }
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
            email: user?.email,
            photo: null,
            fName: user?.first_name,
            lName: user?.last_name,
            socialId: user?.id,
            type: REGISTERTYPES.FACEBOOK,
          });
          // Navigation.navigate('RegisterScreenUsingSocial', {
          //   email: user?.email,
          //   photo: null,
          //   fName: user?.first_name,
          //   lName: user?.last_name,
          //   socialId: user?.id,
          //   type: REGISTERTYPES.FACEBOOK,
          // });
        }
      },
    );
    new GraphRequestManager().addRequest(profileRequest).start();
  };

  const handleFacebookSignup = async () => {
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

  return (
    <View>
      {showIcons && (
        <SocialIcons
          onFacebookLogin={handleFacebookSignup}
          onGoogleLogin={handleGoogleSignup}
          onAppleLogin={handleAppleSignup}
        />
      )}
      <Text style={styles.termsText}>
        By signing in to you account, you are agree to our{' '}
        <Text
          onPress={() => Navigation.navigate('PrivacyPolicy')}
          style={styles.textLink}>
          Privacy & Policy
        </Text>{' '}
        and <Text></Text>
        <Text
          style={styles.textLink}
          onPress={() => Navigation.navigate('TermAndConditions')}>
          Terms & Conditions
        </Text>
        .
      </Text>

      <View>
        {registerLoading && (
          <ActivityIndicator style={{paddingTop: verticalScale(20)}} />
        )}
        <CustomButton
          onPress={onSubmitForm}
          extraStyles={{textAlign: 'center'}}
          isDisabled={registerLoading}>
          Create Account
        </CustomButton>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: verticalScale(40),
          paddingVertical: verticalScale(20),
        }}>
        <Text style={styles.termsTextTwo}>Have an account? </Text>
        <TouchableOpacity
          style={{
            flexGrow: 0,
            // justifyContent: 'center',
            // backgroundColor: "red",
            marginTop: -3,
          }}
          onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.textLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default RegisterFormSecondSection;

const styles = StyleSheet.create({
  termsText: {
    textAlign: 'center',
    fontSize: moderateScale(13),
    fontWeight: '400',
    lineHeight: verticalScale(19),
    color: '#222222',
    fontFamily: 'GeneralSans-Regular',
  },
  termsTextTwo: {
    textAlign: 'center',
    fontSize: moderateScale(13),
    fontWeight: '600',
    lineHeight: verticalScale(19),
    // paddingBottom: verticalScale(40),
    // paddingVertical: verticalScale(20),
    color: '#265565',
    fontFamily: 'GeneralSans-Semibold',
  },

  textLink: {
    color: '#2791B5',
  },
});
