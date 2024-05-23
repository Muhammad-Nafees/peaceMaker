import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import {Formik} from 'formik';
import {BlurView} from '@react-native-community/blur';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';

import CustomInput from '../../../components/shared-components/CustomInput';
import CustomButton from '../../../components/shared-components/CustomButton';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../../utils/metrics';
import {STYLES} from '../../../styles/globalStyles';
import {COLORS} from '../../../constants/colors';
import {ApiService} from '../../../utils/ApiService';
import {useAppSelector} from '../../../redux/app/hooks';
import Navigation from '../../../utils/appNavigation';

const newPasswordSchema = Yup.object().shape({
  oldPassword: Yup.string().required('Old Password is required'),
  newPassword: Yup.string()
    .min(8, 'New password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])/,
      'New password must contain at least one uppercase and one lowercase letter',
    )
    .required('New Password is required'),
  confirmPassword: Yup.string()
    .min(8, 'Confirm password must be at least 8 characters')
    .required('Confirm Password is required')
    .oneOf([Yup.ref('newPassword')], 'Password not the same with new password'),
});

interface FormValues {
  oldPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AccountSettings({route}: any) {
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const accessToken = useAppSelector(state => state.user.tokens.accessToken);

  const isPasswordSetted = route.params?.passwordSetted;

  const initialValues: FormValues = {
    oldPassword: !isPasswordSetted ? '111111111' : '',
    newPassword: '',
    confirmPassword: '',
  };

  let timeoutInterval: any;

  const handleNewPassword = async (values: FormValues) => {
    try {
      if (!isPasswordSetted)
        values = {
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        };

      setLoading(true);
      const newPassword = new ApiService('user/change-password', accessToken);

      const newPasswordRes = await newPassword.Put(values);
      console.log(' ~ newPasswordRes:', newPasswordRes);

      if (newPasswordRes.status === 200) {
        setShowPopup(true);
        timeoutInterval = setTimeout(() => {
          Navigation.back();
          setShowPopup(false);
        }, 1000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: newPasswordRes?.message,
        });
      }
      setLoading(false);
    } catch (err) {
      console.log('🚀 ~ file: index.tsx:64 ~ handleNewPassword ~ err:', err);
      setLoading(false);
    }
  };
  return (
    <View style={{flex: 1, backgroundColor: '#F9FAFA', paddingHorizontal: 16}}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '400',
          color: '#576B74',
          letterSpacing: -0.5,
          marginTop: 5,
        }}>
        Make a new password that’s different with your old password.
      </Text>
      <View style={{marginTop: 37, width: '100%', flex: 1}}>
        <Formik
          initialValues={initialValues}
          validationSchema={newPasswordSchema}
          onSubmit={handleNewPassword}
          validateOnChange={false}
          validateOnBlur={true}>
          {({handleChange, submitForm, values, errors, touched}) => (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{flex: 1}}>
                {isPasswordSetted && (
                  <CustomInput
                    label="Old Password"
                    placeholder="Old Password"
                    value={values.oldPassword}
                    isIcon={true}
                    onChange={handleChange('oldPassword')}
                    touched={touched.oldPassword}
                    error={errors.oldPassword}
                    initialTouched={true}
                  />
                )}
                <CustomInput
                  label="Create New Password"
                  placeholder="Create New Password"
                  value={values.newPassword}
                  isIcon={true}
                  onChange={handleChange('newPassword')}
                  touched={touched.newPassword}
                  error={errors.newPassword}
                  initialTouched={true}
                />
                <CustomInput
                  label="Confirm New Password"
                  placeholder="Confirm New Password"
                  value={values.confirmPassword}
                  isIcon={true}
                  onChange={handleChange('confirmPassword')}
                  touched={touched.confirmPassword}
                  error={errors.confirmPassword}
                  initialTouched={true}
                />
              </ScrollView>
              <CustomButton
                isLoading={loading}
                extraStyles={{marginTop: 10, marginBottom: 32}}
                onPress={submitForm}>
                Create New Password
              </CustomButton>
            </>
          )}
        </Formik>
      </View>
      {showPopup && (
        <BlurView
          style={styles.absolute}
          blurType="light"
          blurAmount={1}
          reducedTransparencyFallbackColor="white"
        />
      )}
      <Modal
        visible={showPopup}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => {
          clearInterval(timeoutInterval);
          setShowPopup(false);
          Navigation.back();
        }}>
        <TouchableWithoutFeedback onPress={() => setShowPopup(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback
              onPress={() => console.log('Inner view pressed')}>
              <View style={styles.modalInnerContainer}>
                <Image
                  source={require('../../../../assets/images/passchange.png')}
                  alt="img"
                />
                <Text
                  style={[
                    STYLES.dev1__text18,
                    {
                      color: COLORS.primary500,
                      textAlign: 'center',
                      marginTop: verticalScale(24),
                    },
                  ]}>
                  {' '}
                  Password has been successfully changed!
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalInnerContainer: {
    marginHorizontal: horizontalScale(16),
    position: 'absolute',
    bottom: verticalScale(55),
    backgroundColor: '#ffffff',
    width: horizontalScale(343),
    height: verticalScale(210),
    borderRadius: moderateScale(16),
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
