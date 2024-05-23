import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAppSelector} from '../redux/app/hooks';
import {ApiService} from './ApiService';
import messaging, {firebase} from '@react-native-firebase/messaging';
import {format} from 'date-fns';

interface Props {
  data: object;
}

export const storeUserData = async (data: Props) => {
  // converting object to string
  const userObjectString = JSON.stringify(data);

  await AsyncStorage.setItem('@session', userObjectString);
};

export const refreshMyToken = async (refreshToken: string) => {
  try {
    const newTokenReq = new ApiService('auth/refresh-token', '');
    const newTokenRes = await newTokenReq.Put({refreshToken});

    return newTokenRes;
  } catch (error) {
    console.log(error);
  }
};

export const getUpdatedUserData = async (userid: string | null) => {
  console.log('userID:' + userid);
  if (!userid) return;

  try {
    const userDataReq = new ApiService('user', '');
    const response = await userDataReq.GetByBody(userid);
    console.log('userDataGet3', response);

    if (response?.status !== 200 && !response?.data) return null;

    const userData = response?.data;
    const userBuddies = response?.data?.buddies?.map(b => ({
      ...b?.buddy,
      goodProgress: b.goodProgress,
      badProgress: b.badProgress,
      beNotified: b.beNotified,
    }));
    userData.buddies = userBuddies;

    return userData;
  } catch (error) {
    console.log('🚀 ~ getUserData ~ error:', error);
  }
};

export const removeFCMToken = async () => {
  try {
    const defaultAppMessaging = firebase.messaging();
    await defaultAppMessaging.deleteToken();
    console.log('FCM Token deleted successfully');
  } catch (error) {
    console.log('Error deleting token: ' + error);
  }
};

export function convertTo12HourFormat(time24Hour: string) {
  if(!time24Hour) return;
  let [hours, minutes] = time24Hour.split(':').map(Number);
  let period = 'AM';

  if (hours === 0) {
    hours = 12;
  } else if (hours >= 12) {
    period = 'PM';
    if (hours > 12) {
      hours -= 12;
    }
  }

  return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export const calculateCurrentValue = (
  scrollPosition: number,
  stepWidth: number,
  gapBetweenItems: number,
  min: number,
  max: number,
  step: number,
  fractionDigits: number,
) => {
  const index = Math.round(scrollPosition / (stepWidth + gapBetweenItems));
  return Math.min(Math.max(index * step + min, min), max).toFixed(
    fractionDigits,
  );
};

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime(
  time: string | Date,
  twentyFourHours: boolean = false,
  daytime: boolean = true,
) {
  return format(
    new Date(time),
    `${twentyFourHours ? 'HH' : 'h'}:mm ${daytime ? 'aa' : ''}`,
  );
}

export const dummyUserId = '6490b19fc9d65debea703d4c';
export const dummyUserToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YzFhMmJlODNkYmIzYmNjZTRjYjczMSIsImVtYWlsIjoidXNlcjJAdGVzdC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTY5MDQxNjQ1MiwiZXhwIjoxNjkzMDA4NDUyfQ.QhJZnQGAF4foc5gaCpZRxC2vldqEigpemNunJnQwbFc';
