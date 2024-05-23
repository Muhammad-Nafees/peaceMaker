import {StyleSheet, Text, View} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import ScreenTitle from '../../components/shared-components/ScreenTitle';
import {COLORS} from '../../constants/colors';
import {Fragment, useEffect} from 'react';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {TextInput} from 'react-native';
import CustomButton from '../../components/shared-components/CustomButton';
import {useRef, useState} from 'react';
import Toast from 'react-native-toast-message';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../interface/types';
import {Pressable} from 'react-native';
import {Button} from 'react-native-paper';
import {ApiService} from '../../utils/ApiService';
import {useAppSelector, useAppDispatch} from '../../redux/app/hooks';
import { setAccessToken } from '../../redux/features/user/userSlice';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

interface Props {
  route: any;
}

const VerifyScreen = ({route}: Props) => {
  const otpInputs = useRef<Array<TextInput | null>>([]);
  const navigation = useNavigation<NavigationProp>();
  let {code, email} = route.params;

  const [otp, setOtp] = useState<string>('');
  const [timerCount, setTimer] = useState(5);
  const [newCode, setNewCode] = useState(code);
  const [codeResend, setCodeResend] = useState(false);

  const accessToken = useAppSelector(state => state.user.tokens.accessToken);
  const refreshToken = useAppSelector(state => state.user.tokens.refreshToken);
  const dispatch = useAppDispatch();

  const getResetPassRes = async (token: string) => {
    try {
      const handleConfirmReq = new ApiService(
        `reset?token=${token}`,
        accessToken,
      );
      await handleConfirmReq.Get();

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'OTP verified.',
      });

      navigation.navigate('CreateNewPassword', {
        email: email,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unable To Send Request!',
        text2: 'Please Try Again Later.',
      });
    }
  };

  const handleOtpValidationWithApi = async () => {
    try {
      const handleConfirmReq = new ApiService('otp/verify', '');
      const handleConfirmRes = await handleConfirmReq.unsecuredPut({
        // email,
        otp: otp,
      });

      if (handleConfirmRes.status == 200) {

        dispatch(setAccessToken(handleConfirmRes?.data?.token))

        navigation.navigate('CreateNewPassword', {
          email: email,
        });
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'OTP verified.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Invalid OTP!',
          text2: 'Please enter valid otp.',
        });
      }

      // if (!handleConfirmRes?.error) {
      //   getResetPassRes(handleConfirmRes?.token);

      //   setNewCode(handleConfirmRes?.data?.OTP);
      //   setCodeResend(true);
      // } else if (
      //   handleConfirmRes?.status == 406 ||
      //   handleConfirmRes?.statusCode == 404
      // ) {
      //   Toast.show({
      //     type: 'error',
      //     text1: handleConfirmRes?.error,
      //     text2: handleConfirmRes?.message,
      //   });
      // } else {
      //   Toast.show({
      //     type: 'error',
      //     text1: 'Unable To Send Request!',
      //     text2: 'Please Try Again Later.',
      //   });
      // }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unable To Send Request!',
        text2: 'Please Try Again Later.',
      });
    }
  };

  const handleResendOtp = async (email: string) => {
    setTimer(5);
    try {
      const handleResendReq = new ApiService('otp/generate', accessToken);
      const handleResendRes = await handleResendReq.unsecuredPost({email});

      console.log(handleResendRes);

      let interval = setInterval(() => {
        setTimer(lastTimerCount => {
          lastTimerCount <= 1 && clearInterval(interval);
          return lastTimerCount - 1;
        });
      }, 1000);

      if (handleResendRes?.status == 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: handleResendRes?.message,
        });

        setNewCode(handleResendRes?.data?.otp);
        setCodeResend(true);
      } else if (handleResendRes?.status == 406) {
        Toast.show({
          type: 'error',
          text1: handleResendRes?.error,
          text2: handleResendRes?.message,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Unable To Send Request!',
          text2: 'Please Try Again Later.',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unable To Send Request!',
        text2: 'Please Try Again Later.',
      });
    }
  };

  const focusNextInput = (index: number) => {
    if (otpInputs.current[index + 1]) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const focusPreviousInput = (index: number) => {
    if (otpInputs.current[index - 1]) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleBackSpace = (eventName: string, index: number) => {
    if (eventName == 'Backspace') {
      focusPreviousInput(index);
    } else {
      focusNextInput(index);
    }
    console.log(otp);
  };

  const handleOtpChange = (value: string, index: number) => {
    console.log('Inp length', value.length);

    if (value.length === 1) {
      focusNextInput(index);
    } else if (value.length === 0) {
      focusPreviousInput(index);
    }

    const updatedOtp = otp.split('');
    updatedOtp[index] = value;
    setOtp(updatedOtp.join(''));
  };

  useEffect(() => {
    let interval = setInterval(() => {
      setTimer(lastTimerCount => {
        lastTimerCount <= 1 && clearInterval(interval);
        return lastTimerCount - 1;
      });
    }, 1000); //each count lasts for a second
    //cleanup the interval on complete
    return () => clearInterval(interval);
  }, []);

  const isOtpComplete = otp.length === 6;

  return (
    <View style={STYLES.dev1__container}>
      <ScreenTitle
        title="Let’s Verify You"
        description="We’ve sent a 6 digit verification code to"
      />
      <Text
        style={[
          STYLES.dev1__text13,
          {fontWeight: '500', color: COLORS.primary400},
        ]}>
        {email}
        {/* {'    '} Your Code:{newCode} */}
      </Text>
      <View style={[styles.inputContainer, {marginTop: verticalScale(36)}]}>
        {Array.from({length: 6}, (_, index) => (
          <Fragment key={index}>
            <TextInput
              ref={ref => (otpInputs.current[index] = ref)}
              style={[
                styles.input,
                otp.length < 0 ? styles.filledInput : null, // Apply separate style if any input is present
              ]}
              maxLength={1}
              onChangeText={value => handleOtpChange(value, index)}
              value={otp[index] || ''}
              keyboardType="numeric"
              secureTextEntry={true}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => focusNextInput(index)}
              onKeyPress={event =>
                handleBackSpace(event.nativeEvent.key, index)
              }
            />
            {(index + 1) % 3 === 0 && index !== 5 && <View />}
          </Fragment>
        ))}
      </View>
      <Text
        style={[
          STYLES.dev1__text13,
          {
            color: COLORS.primary600,
            textAlign: 'center',
            marginTop: verticalScale(16),
          },
        ]}>
        Didn’t get the code?{' '}
        {timerCount == 0 ? (
          <>
            <Text
              style={{color: COLORS.primary400}}
              onPress={() => handleResendOtp(email)}>
              Resend it.
            </Text>
          </>
        ) : (
          <Text style={{color: COLORS.primary400}}>{timerCount}</Text>
        )}
      </Text>
      <CustomButton
        extraStyles={{marginTop: verticalScale(103)}}
        isDisabled={!isOtpComplete}
        onPress={handleOtpValidationWithApi}>
        Confirm
      </CustomButton>
    </View>
  );
};

export default VerifyScreen;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: horizontalScale(40),
    height: verticalScale(56),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(12),
    backgroundColor: COLORS.neutral200,
    paddingLeft: horizontalScale(16),
    color: COLORS.primary400,
    fontSize: moderateScale(24),
  },
  filledInput: {
    fontSize: 30,
  },
});
