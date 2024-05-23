import React, {useState} from 'react';
import {Image, Modal, StyleSheet, Touchable, View} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import ScreenTitle from '../../components/shared-components/ScreenTitle';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import CustomInput from '../../components/shared-components/CustomInput';
import CustomButton from '../../components/shared-components/CustomButton';
import {Text} from 'react-native-paper';
import {COLORS} from '../../constants/colors';
import {Formik} from 'formik';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import {AuthStackParamList} from '../../interface/types';
import {ApiService} from '../../utils/ApiService';
import {BlurView} from '@react-native-community/blur';
import {newPasswordSchema} from '../../validations';
import AlertIcon from 'react-native-vector-icons/Ionicons';
import {useAppSelector, useAppDispatch} from '../../redux/app/hooks';
import {setAccessToken} from '../../redux/features/user/userSlice';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

interface FormValues {
  newPassword: string;
  confirmPassword: string;
  email: string;
}

interface Props {
  route: any;
}

const CreateNewPassword = ({route}: Props) => {
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp>();
  const {email} = route?.params;

  const accessToken = useAppSelector(state => state.user.tokens.accessToken);
  const refreshToken = useAppSelector(state => state.user.tokens.refreshToken);
  const dispatch = useAppDispatch();

  const initialValues: FormValues = {
    newPassword: '',
    confirmPassword: '',
    email: email,
  };

  const handleNewPassword = async (values: FormValues) => {
    console.log("🚀 ~ file: CreateNewPassword.tsx:55 ~ handleNewPassword ~ accessToken:", accessToken)

    try {
      const newPassword = new ApiService('user/reset-password', accessToken);
      const newPasswordRes = await newPassword.Put({
        password: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      console.log(
        '🚀 ~ file: CreateNewPassword.tsx:62 ~ handleNewPassword ~ newPasswordRes:',
        newPasswordRes,
      );

      //removing resetPass accessToken
      dispatch(setAccessToken(''));

      if (newPasswordRes?.status == 500) {
        Toast.show({type: 'error', text1: 'Unable To Change Password!'});
      } else if (newPasswordRes?.status == 200) {
        setShowPopup(true);

        setTimeout(() => {
          navigation.navigate('LoginScreen');
        }, 3000);
      } else if (newPasswordRes?.status == 422) {
        Toast.show({
          type: 'error',
          text1: 'Unable To Create New Password!',
          text2: newPasswordRes?.message,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Unable To Create New Password!',
          text2: 'Please Try Again Later.',
        });
      }
    } catch (error) {
      console.log(
        '🚀 ~ file: CreateNewPassword.tsx:95 ~ handleNewPassword ~ error:',
        error,
      );
      Toast.show({type: 'error', text1: 'Unable To Change Password!'});
    }
  };

  const togglePopup = () => {
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  return (
    <View style={[STYLES.dev1__container, styles.container]}>
      <View>
        <ScreenTitle
          title="Create New Password"
          description="Make a new password that’s different with your old password."
        />
        <Formik
          initialValues={initialValues}
          validationSchema={newPasswordSchema}
          onSubmit={handleNewPassword}>
          {({handleChange, submitForm, values, errors, touched}) => (
            <>
              <View style={styles.formContainer}>
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
              </View>

              {values.confirmPassword != '' && values.newPassword != '' && (
                <>
                  {values.confirmPassword == values.newPassword && (
                    <>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 2,
                          marginTop: verticalScale(1),
                        }}>
                        <AlertIcon
                          name="checkmark-circle-outline"
                          size={22}
                          color="green"
                        />
                        <Text> Password Matched !</Text>
                      </View>
                    </>
                  )}
                </>
              )}

              <CustomButton onPress={submitForm}>
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
        animationType="fade"
        onRequestClose={togglePopup}>
        <View style={styles.modalContainer}>
          <View style={styles.modalInnerContainer}>
            <Image
              source={require('../../../assets/images/passchange.png')}
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
        </View>
      </Modal>
    </View>
  );
};

export default CreateNewPassword;

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  container: {
    justifyContent: 'space-between',
    paddingBottom: verticalScale(50),
  },
  formContainer: {
    marginTop: verticalScale(36),
    gap: verticalScale(8),
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
