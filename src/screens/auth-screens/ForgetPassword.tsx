import {View} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import ScreenTitle from '../../components/shared-components/ScreenTitle';
import CustomInput from '../../components/shared-components/CustomInput';
import CustomButton from '../../components/shared-components/CustomButton';
import {verticalScale} from '../../utils/metrics';
import {useState} from 'react';
import {ApiService} from '../../utils/ApiService';
import {Formik} from 'formik';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../interface/types';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {forgetPasswordSchema} from '../../validations';
import {useAppSelector, useAppDispatch} from '../../redux/app/hooks';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

interface FormValues {
  email: string;
}

const ForgetPassword = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);
  const accessToken = useAppSelector(state => state.user.tokens.accessToken);
  const refreshToken = useAppSelector(state => state.user.tokens.refreshToken);
  const dispatch = useAppDispatch();
  const initialValues: FormValues = {
    email: '',
  };

  const handleForgetPassword = async (values: FormValues) => {
    // setting email to lowercase
    values.email = values.email.toLowerCase();
    setLoading(true);

    try {
      const handlePasswordReq = new ApiService('otp/generate', '');
      const handlePasswordRes = await handlePasswordReq.unsecuredPost(values);
      console.log(handlePasswordRes);
      setLoading(false);

      if (handlePasswordRes?.status == 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: handlePasswordRes?.message,
        });

        navigation.navigate('VerifyScreen', {
          // code: handlePasswordRes?.data?.OTP,
          code: handlePasswordRes?.data?.otp,
          email: values.email,
        });
      } else if (handlePasswordRes?.status == 404) {
        Toast.show({
          type: 'error',
          text1: "Account doesn't exist.",
        });
      } else if (
        handlePasswordRes?.status == 406 ||
        handlePasswordRes?.status == 404 ||
        handlePasswordRes?.status == 422
      ) {
        Toast.show({
          type: 'error',
          text1: 'Incorrect Email.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Server Error!',
          text2: 'Please Try Again Later.',
        });
      }
    } catch (error) {
      setLoading(false);
      console.log('~ handleForgetPassword ~ error:', error);
      Toast.show({
        type: 'error',
        text1: 'Server Error!',
        text2: 'Please Try Again Later.',
      });
    }
  };

  return (
    <View style={STYLES.dev1__container}>
      <ScreenTitle
        title="Forgot Password"
        description="Kindly enter your email so we can send you a verification."
      />
      <Formik
        initialValues={initialValues}
        validationSchema={forgetPasswordSchema}
        onSubmit={handleForgetPassword}>
        {({
          handleChange,
          submitForm,
          values,
          errors,
          touched,
          initialTouched,
        }) => (
          <View style={{marginTop: verticalScale(36)}}>
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
            <CustomButton
              isLoading={loading}
              extraStyles={{marginTop: verticalScale(152)}}
              onPress={submitForm}>
              Send Verification
            </CustomButton>
          </View>
        )}
      </Formik>
    </View>
  );
};

export default ForgetPassword;
