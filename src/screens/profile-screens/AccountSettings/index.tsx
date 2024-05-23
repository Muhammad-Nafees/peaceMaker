import React, {useState} from 'react';
import {View, Text, Keyboard, ScrollView} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useDispatch} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-root-toast';
import {launchImageLibrary} from 'react-native-image-picker';

import ProfileImg from '../../../components/profile/ProfileImg';
import CustomInput from '../../../components/shared-components/CustomInput';
import CustomButton from '../../../components/shared-components/CustomButton';
import {useAppSelector} from '../../../redux/app/hooks';
import {COLORS} from '../../../constants/colors';
import {ApiService, baseUrl} from '../../../utils/ApiService';
import {setUserData} from '../../../redux/features/user/userSlice';
import Navigation from '../../../utils/appNavigation';
import {User} from '../../../interface/types';
import { EventRegister } from 'react-native-event-listeners';

interface FormValues {
  firstName: string;
  lastName: string;
  dob: string;
  email: string | null;
}

const accountDetailSchema = Yup.object().shape({
  firstName: Yup.string()
    .matches(/^[A-Za-z]+$/, 'Please enter a valid name.')
    .required('First Name is required'),
  lastName: Yup.string()
    .matches(/^[A-Za-z]+$/, 'Please enter a valid name.')
    .required('Last Name is required'),
  dob: Yup.string()
    .matches(
      /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/,
      'Invalid date format. Must be mm-dd-yyyy',
    )
    .required(),
  email: Yup.string()
    // .matches(/^[a-zA-Z0-9]+@[a-zA-Z]+\.[cC][oO][mM]$/, 'Invalid email')
    .required('Email is required'),
});

export default function AccountSettings() {
  const [loading, setLoading] = useState(false);
  const user: User = useAppSelector((state: any) => state.user.data);
  const accessToken = useAppSelector(state => state.user.tokens.accessToken);
  const [image, setImage] = useState<{
    name: string | undefined;
    type: string | undefined;
    uri: string | undefined;
  }>({
    name: undefined,
    type: undefined,
    uri: undefined,
  });

  let dateOfBirth = new Date(user.dob);

  let formattedDate = dateOfBirth.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  const dispatch = useDispatch();

  const initialValues: FormValues = {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    dob: formattedDate,
    email: user.email,
  };

  function convertDateFormat(dateString: string) {
    const parts = dateString.split('/');
    const formattedDate = `${parts[2]}-${parts[0]}-${parts[1]}`;
    return formattedDate;
  }

  const successMessage = (): any => (
    <View
      style={{
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        borderRadius: 8,
        flexDirection: 'row',
        opacity: 1,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,

        elevation: 1,
        alignItems: 'center',
      }}>
      <Icon name="ios-checkmark-circle-outline" size={23} color="#8EB26F" />
      <Text
        style={{
          color: '#576B74',
          fontSize: 15,
          fontWeight: '500',
          marginLeft: 12,
        }}>
        Account details saved changes
      </Text>
    </View>
  );

  const successToast = () => {
    Toast.show(successMessage(), {
      duration: 2000,
      position: Toast.positions.TOP,
      shadow: false,
      animation: false,
      hideOnPress: true,
      delay: 0,
      opacity: 1,
      backgroundColor: 'transparent',
    });
  };

  const handleProfileUpdate = async (formvalues: FormValues) => {
    if (
      formvalues.firstName === user.firstName &&
      formvalues.lastName === user.lastName &&
      formvalues.dob === formattedDate &&
      !image.uri
    )
      return;

    try {
      setLoading(true);
      let reqData = new FormData();
      if (image.uri) {
        reqData.append('photo', image);
      }
      reqData.append('firstName', formvalues.firstName);
      reqData.append('lastName', formvalues.lastName);
      const formatedDOB = convertDateFormat(formvalues.dob);
      reqData.append('dob', formatedDOB);

      const response = await fetch(baseUrl + 'user/update-profile', {
        method: 'PUT',
        headers: {
          accessToken: accessToken,
        },
        body: reqData,
      });
      if (response.status == 401) EventRegister.emit('Logout', 'it works!!!');
      const newProfileRes = await response.json();

      if (response.status === 200) {
        newProfileRes.data.partner = user.partner;
        newProfileRes.data.buddies = user.buddies;

        Navigation.back();
        dispatch(setUserData({...newProfileRes.data, userType: user.userType}));
        successToast();
      }
      setLoading(false);
    } catch (err) {
      console.log('🚀 ~ file: index.tsx:113 ~ handleProfileUpdate ~ err:', err);
      setLoading(false);
    }
  };

  const handleCameraLaunch = async () => {
    const {assets} = await launchImageLibrary({mediaType: 'photo'});
    if (!assets) return;
    setImage({
      name: assets[0].fileName,
      type: assets[0].type,
      uri: assets[0].uri,
    });
  };

  const handleImageDelete = async () => {
    if (image.uri) return;
    try {
      const response = await fetch(baseUrl + 'user/remove-profile-photo', {
        method: 'DELETE',
        headers: {
          accessToken: accessToken,
        },
      });
      if (response.status == 401) EventRegister.emit('Logout', 'it works!!!');
      const newProfileRes = await response.json();

      if (response.status === 200) {
        newProfileRes.data.partner = user.partner;
        newProfileRes.data.buddies = user.buddies;

        dispatch(setUserData({...newProfileRes.data, userType: user.userType}));
      }
    } catch (err) {
      console.log('🚀 ~ file: index.tsx:113 ~ handleProfileUpdate ~ err:', err);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#F9FAFA', paddingHorizontal: 16}}>
      <View style={{alignItems: 'center', marginTop: 5}}>
        <ProfileImg
          imgUri={
            image.uri
              ? image.uri
              : user?.photoUrl && !user?.photo
              ? user?.photoUrl
              : user?.photo
              ? 'https://peacemakers3.s3.us-east-2.amazonaws.com/' + user?.photo
              : ''
          }
          isImg={user?.photo || user?.photoUrl ? true : false}
          handleCameraLaunch={handleCameraLaunch}
          handleImageDelete={handleImageDelete}
          size={80}
          txtSize={32}
          smallBoxSize={28}
          iconSize={11}
        />
      </View>
      <Formik
        initialValues={initialValues}
        validationSchema={accountDetailSchema}
        validateOnChange={false}
        validateOnBlur={true}
        onSubmit={handleProfileUpdate}>
        {({handleChange, submitForm, values, errors, touched}) => (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{marginTop: 37, width: '100%', flex: 1}}>
              <CustomInput
                inActiveColor={
                  values.firstName === user.firstName
                    ? '#94A5AB'
                    : COLORS.neutral900
                }
                showLabelOnFocus
                label={'First name'}
                placeholder="First name"
                value={values.firstName}
                error={errors.firstName}
                touched={touched.firstName}
                initialTouched={false}
                autoCapitalize="none"
                keyboardType="default"
                onChange={handleChange('firstName')}
                isCancel={true}
              />
              <CustomInput
                inActiveColor={
                  values.lastName === user.lastName
                    ? '#94A5AB'
                    : COLORS.neutral900
                }
                showLabelOnFocus
                label={'Last Name'}
                placeholder="Last name"
                value={values.lastName}
                error={errors.lastName}
                touched={touched.lastName}
                initialTouched={false}
                autoCapitalize="none"
                keyboardType="default"
                onChange={handleChange('lastName')}
                isCancel={true}
              />
              <CustomInput
                inActiveColor={
                  values.dob === formattedDate ? '#94A5AB' : COLORS.neutral900
                }
                showLabelOnFocus
                label={'DOB'}
                placeholder="11/02/1990"
                value={values.dob}
                error={errors.dob}
                touched={touched.dob}
                initialTouched={false}
                autoCapitalize="none"
                keyboardType="default"
                onChange={handleChange('dob')}
                isCancel={true}
              />
              <CustomInput
                disabled
                editable={false}
                label=""
                placeholder={user.email}
                value={''}
                error={errors.email}
                touched={touched.email}
                initialTouched={true}
                autoCapitalize="none"
                keyboardType="email-address"
                onChange={handleChange('email')}
                isCancel={true}
              />
            </ScrollView>

            <CustomButton
              isLoading={loading}
              extraStyles={{marginBottom: 20, marginTop: 10}}
              onPress={submitForm}>
              Save Changes
            </CustomButton>
          </>
        )}
      </Formik>
    </View>
  );
}
