import {Formik} from 'formik';
import {View, Image, TouchableWithoutFeedback} from 'react-native';
import {parse, isAfter} from 'date-fns';
import {verticalScale, horizontalScale} from '../../utils/metrics';
import CustomDivider from '../shared-components/CustomDivider';
import CustomInput from '../shared-components/CustomInput';
import {ApiService} from '../../utils/ApiService';
import Toast from 'react-native-toast-message';
import {signupSchema} from '../../validations';
import {useEffect, useState} from 'react';

import Geocoder from 'react-native-geocoding';
import {
  setAccessToken,
  setFcmToken,
  setRefreshToken,
  setUserData,
} from '../../redux/features/user/userSlice';
import {useAppDispatch, useAppSelector} from '../../redux/app/hooks';
import {
  getFirebaseDeviceToken,
  requestUserPermission,
} from '../../utils/pushNotification-helper';
import navigation from '../../utils/appNavigation';
import CustomMetric from '../shared-components/CustomMetric';
import {CustomSelect} from '../shared-components/CustomSelect';
import {
  DAYS,
  MONTHS,
  YEARS,
  heightsInCm,
  // heightsInInches,
  weightArrayKg,
  weightArrayLbs,
} from '../../../data/data';
import RegisterFormSecondSection from './RegisterFormSecondSection';
import {REGISTERTYPES} from '../../enums/auth';
import {RegisterFormValues} from '../../interface/types';

interface Props {
  userLocation: any;
  navigation: any;
}

// type Location = {
//   type: string;
//   coordinates: number[];
// };

let heightsInInches: string[] = [];
Array.from({length: 11}, (feet, index) => {
  if (index > 12) return;
  Array.from({length: 12}, (e, indx) => {
    if (index + 2 === 12 && indx > 0) return;
    heightsInInches.push(`${index + 2}'${indx}`);
  });
});

type MonthName =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December';

type MonthNameToNumber = {
  [key in MonthName]: number;
};

const monthNameToNumber: MonthNameToNumber = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

function RegisterForm({userLocation}: Props) {

  const dispatch = useAppDispatch();
  const fcmToken = useAppSelector(state => state.user.tokens.fcmToken);
  const [registerLoading, setRegisterLoading] = useState<boolean>(false);
  const [weight, setWeight] = useState<'lbs' | 'kg'>('lbs');
  const [height, setHeight] = useState<'in' | 'cm'>('in');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [heightData, setHeightData] = useState(heightsInCm);

  useEffect(() => {
    if (height == 'cm') {
      setHeightData(heightsInCm as any);
    } else {
      setHeightData(heightsInInches as any);
    }
  }, [height]);

  const initialValues: RegisterFormValues = {
    firstName: '',
    lastName: '',
    month: '',
    day: '',
    year: '',
    height: undefined,
    weight: undefined,
    email: '',
    password: '',
    photo: '',
    fcmToken: fcmToken,
    location: '',
  };

  const locationCoordinates = async (readableLocation: string) => {
    try {
      const locCoordinates = await Geocoder.from(readableLocation);
      return [
        locCoordinates.results[0].geometry.location.lng,
        locCoordinates.results[0].geometry.location.lat,
      ];
    } catch (error) {
      console.log(error);
    }
  };

  const storingFcmToken = async () => {
    //goto utils/pushNotification-helper file for notification methods
    const permissionStatus = await requestUserPermission();
    if (permissionStatus && !fcmToken) {
      console.log('working fcm');
      const token = (await getFirebaseDeviceToken()).toString();
      console.log('storingFcmToken ~ token:', token);
      if (!token) {
        Toast.show({type: 'error', text1: 'Unable to get device token.'});
      } else {
        dispatch(setFcmToken(token));
      }
    }
  };

  const handleSubmit = async (values: RegisterFormValues) => {
    if (!fcmToken) {
      storingFcmToken();
      return;
    };

    values.email = values.email.toLowerCase();
    values.height = Number(values?.height);
    values.weight = Number(values?.weight);
    const selectedMonthName: string = values.month;
    const selectedMonthNumber =
      monthNameToNumber[selectedMonthName as MonthName];
    const selectedDay: string = values.day;
    const selectedYear: string = values.year;

    const selectedDate = parse(
`${selectedYear}-${selectedMonthNumber}-${selectedDay}`,
      'yyyy-MM-dd',
      new Date(),
    );

    const today = new Date();
    if (isAfter(selectedDate, today)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Birthdate',
        text2: 'Selected birthdate is in the future.',
      });
      return;
    }
    setRegisterLoading(true);

    const locData = await locationCoordinates(values.location);

    const data = {
      firstName: values.firstName,
      lastName: values.lastName,
      dob: `${values.year}-${selectedMonthNumber}-${values.day}`,
      height: values.height,
      weight: values.weight,
      email: values.email,
      password: values.password,
      fcmToken: fcmToken,
      heightUnit: height,
      weightUnit: weight,
      // fcmToken: 'asdfsdfsdfsd2',
      location: {type: 'Point', coordinates: locData},
      registerType: REGISTERTYPES.MANUAL,
      locationAddress: values.location,
      photoUrl: null,
      socialId: null,
    };

    console.log('🚀 ~ file: RegisterForm.tsx:212 ~ handleSubmit ~ data:', data);
    // setRegisterLoading(false);
    // return;

    try {
      const register = new ApiService('auth/register', '');
      const response = await register.unsecuredPost(data);
      console.log('registerRes', response);

      if (response?.status == 201 || response?.status == 200) {
        dispatch(setUserData({...response?.data.user, userType: 'manual'}));
        // dispatch(setAuthenticated(true));
        dispatch(setAccessToken(response?.data.accessToken));
        dispatch(setRefreshToken(response?.data.refreshToken));
        Toast.show({
          type: 'success',
          text1: 'Successfully Registered!',
          text2: 'Your Account Has Been Created !',
        });
        navigation.navigate('AccountabilityBuddies');
      } else if (response?.status == 409) {
        Toast.show({type: 'info', text1: 'User Already Registered!'});
      } else {
        Toast.show({
          type: 'error',
          text1: 'Server Error!',
          text2: response?.message,
        });
      }
    } catch (error) {
      console.log(error);
      Toast.show({type: 'error', text1: 'Server Error!'});
    }
    setRegisterLoading(false);
  };

  const setLocation = (loc: string) => {
    setSelectedLocation(loc);
  };
  console.log(selectedLocation);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={signupSchema}
      onSubmit={handleSubmit}>
      {({
        handleChange,
        handleBlur,
        submitForm,
        setFieldValue,
        values,
        errors,
        touched,
        initialTouched,
        isSubmitting,
        setFieldError,
      }) => (
        <View style={{gap: 8}}>
          <CustomInput
            placeholder="First Name"
            label="First Name"
            value={values.firstName}
            error={errors.firstName}
            touched={touched.firstName}
            initialTouched={true}
            onChange={handleChange('firstName')}
            isSubmitted={isSubmitting}
            isCancel={true}
          />
          <CustomInput
            placeholder="Last Name"
            label="Last Name"
            value={values.lastName}
            error={errors.lastName}
            touched={touched.lastName}
            initialTouched={true}
            onChange={handleChange('lastName')}
            isSubmitted={isSubmitting}
            isCancel={true}
          />
          <View style={{flexDirection: 'row', gap: 2}}>
            <View style={{flex: 1}}>
              <CustomSelect
                label="Month"
                values={MONTHS as any}
                selectedValue={values.month as any}
                error={errors.month}
                initialTouched={true}
                defaultValue="Month"
                touched={touched.month}
                setFieldValue={setFieldValue}
                setFieldError={setFieldError as any}
                fieldName="month"
              />
            </View>
            <View style={{flex: 1}}>
              <CustomSelect
                label="Day"
                values={DAYS as any}
                selectedValue={values.day as any}
                error={errors.day}
                initialTouched={true}
                touched={touched.day}
                defaultValue="Day"
                setFieldValue={setFieldValue}
                setFieldError={setFieldError as any}
                fieldName="day"
              />
            </View>
            <View style={{flex: 1}}>
              <CustomSelect
                defaultScrolledPosition={102}
                label="Year"
                values={YEARS as any}
                selectedValue={values.year as any}
                error={errors.year}
                initialTouched={true}
                defaultValue="Year"
                touched={touched.weight}
                setFieldValue={setFieldValue}
                setFieldError={setFieldError as any}
                fieldName="year"
              />
            </View>
          </View>
          <View style={{position: 'relative'}}>
            <CustomInput
              placeholder="Location"
              label="Location"
              value={values.location}
              error={errors.location}
              touched={touched.location}
              initialTouched={true}
              onChange={handleChange('location')}
              isSubmitted={isSubmitting}
            />
            <TouchableWithoutFeedback
              onPress={() =>
                // navigation.navigate('MapScreen', {setFieldValue: setFieldValue})
                {
                  navigation.navigate('DailyStateAuthMap', {
                    location: selectedLocation,
                    setLocation: setLocation,
                    setFieldValue,
                  });
                }
              }>
              <Image
                source={require('../../../assets/icons/location.png')}
                alt="icon"
                resizeMode="contain"
                style={{
                  height: 20,
                  width: 17,
                  position: 'absolute',
                  right: horizontalScale(18),
                  top: verticalScale(20),
                }}
              />
            </TouchableWithoutFeedback>
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <CustomSelect
              defaultScrolledPosition={height == 'in' ? 45 : 179}
              label="Height"
              values={heightData as any}
              selectedValue={values.height as any}
              error={errors.height}
              initialTouched={true}
              touched={touched.height}
              defaultValue="Height"
              setFieldValue={setFieldValue}
              setFieldError={setFieldError as any}
              fieldName="height"
              width={180}
            />
            <CustomMetric
              firstValue="in"
              secondValue="cm"
              resetForValue={() => {
                setFieldValue('height', undefined);
              }}
              value={height}
              setValue={setHeight}
            />
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <CustomSelect
              defaultScrolledPosition={weight == 'lbs' ? 158 : 30}
              label="Weight"
              values={
                (weight === 'lbs' ? weightArrayLbs : weightArrayKg) as any
              }
              selectedValue={values.weight as any}
              error={errors.weight}
              initialTouched={true}
              defaultValue="Weight"
              touched={touched.weight}
              setFieldValue={setFieldValue}
              setFieldError={setFieldError as any}
              fieldName="weight"
              width={180}
            />
            <CustomMetric
              resetForValue={() => {
                setFieldValue('weight', undefined);
              }}
              firstValue="lbs"
              secondValue="kg"
              value={weight}
              setValue={setWeight}
            />
          </View>
          <CustomInput
            placeholder="Email"
            label="Email"
            value={values.email}
            error={errors.email}
            touched={touched.email}
            keyboardType="email-address"
            autoCapitalize="none"
            initialTouched={true}
            onChange={handleChange('email')}
            isSubmitted={isSubmitting}
            isCancel={true}
          />
          <CustomInput
            placeholder="Password"
            label="Password"
            isIcon={true}
            value={values.password}
            error={errors.password}
            touched={touched.password}
            initialTouched={true}
            onChange={handleChange('password')}
            isSubmitted={isSubmitting}
          />

          <CustomDivider
            text="or create using"
            extraStyles={{paddingTop: verticalScale(24)}}
          />
          <RegisterFormSecondSection
            prevValues={{...values, heightUnit: height, weightUnit: weight}}
            setRegisterloading={setRegisterLoading}
            registerLoading={registerLoading}
            onSubmitForm={submitForm}
          />
        </View>
      )}
    </Formik>
  );
}

export default RegisterForm;
