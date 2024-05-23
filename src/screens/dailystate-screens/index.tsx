import React, {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useEffect, useState} from 'react';

import {STYLES} from '../../styles/globalStyles';
import StateCard from '../../components/daily-state/StateCard';
import {COLORS} from '../../constants/colors';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import {ApiService} from '../../utils/ApiService';
import {useAppSelector} from '../../redux/app/hooks';
import {DailyState} from '../../interface/types';
import {formatDate} from '../../utils/helpers';
import {useIsFocused} from '@react-navigation/native';
import FinalThoughtModal from '../../components/daily-state/FinalThoughtModal';
import CustomModal from '../../components/shared-components/CustomModal';

const spiritual = require('../../../assets/images/daily-state-images/amico5.png');
const spiritualUri = Image.resolveAssetSource(spiritual).uri;
const mental = require('../../../assets/images/daily-state-images/amico3.png');
const mentalUri = Image.resolveAssetSource(mental).uri;
const social = require('../../../assets/images/daily-state-images/amico4.png');
const socialUri = Image.resolveAssetSource(social).uri;
const emotional = require('../../../assets/images/daily-state-images/amico2.png');
const emotionalUri = Image.resolveAssetSource(emotional).uri;
const physical = require('../../../assets/images/daily-state-images/amico.png');
const physicalUri = Image.resolveAssetSource(physical).uri;

const dailyStateImages = {
  spiritual: spiritualUri,
  mental: mentalUri,
  social: socialUri,
  emotional: emotionalUri,
  physical: physicalUri,
};

const todayDate = formatDate(new Date());

const DailyStateScreen = ({navigation, route}: any) => {
  const defaultDailyState: DailyState[] = [
    {
      dailyStateType: 'spiritual',
      value: 25,
      date: todayDate,
      dateTime: null,
    },
    {
      dailyStateType: 'mental',
      value: 25,
      date: todayDate,
      dateTime: null,
    },
    {
      dailyStateType: 'social',
      value: 25,
      date: todayDate,
      dateTime: null,
    },
    {
      dailyStateType: 'emotional',
      value: 25,
      date: todayDate,
      dateTime: null,
    },
    {
      dailyStateType: 'physical',
      value: 25,
      date: todayDate,
      dateTime: null,
    },
  ];
  const [dailyState, setDailyState] = useState<DailyState[]>(defaultDailyState);
  const [finalThought, setFinalThought] = useState(false);
  const [physicalChart, setPhysicalChart] = useState<boolean>(false);

  const {tokens, data: user} = useAppSelector(state => state.user);
  const isFocused = useIsFocused();

  const getTimeDifferenceinMins = (eDate: Date) => {
    const now = new Date(); // Current date and time
    const earlierDate = new Date(eDate); // 30 minutes earlier

    const timeDifferenceInMilliseconds = now.getTime() - earlierDate.getTime();
    const timeDifferenceInMinutes = timeDifferenceInMilliseconds / (60 * 1000);
    // return Math.floor(timeDifferenceInMinutes);
    return timeDifferenceInMinutes;
  };

  function formatTime(minutes: number | null): string {
    if (!minutes) return '0 min';
    const minutesFloored = Math.floor(minutes);
    if (minutes < 1) {
      const seconds = Math.round(minutes * 60);
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    } else if (minutes < 60) {
      return `${minutesFloored} min`;
    } else if (minutes < 1440) {
      // 60 minutes in an hour
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hr${hours !== 1 ? 's' : ''}${
        remainingMinutes > 0 ? ` ${Math.floor(remainingMinutes)} min` : ''
      }`;
    } else if (minutes < 10080) {
      // 1440 minutes in a day (24 hours)
      const days = Math.floor(minutes / 1440);
      const remainingHours = Math.floor((minutes % 1440) / 60);
      return `${days} day${days !== 1 ? 's' : ''}${
        remainingHours > 0
          ? ` ${remainingHours} hr${remainingHours !== 1 ? 's' : ''}`
          : ''
      }`;
    } else if (minutes < 43829) {
      // Roughly 30 days in a month
      const weeks = Math.floor(minutes / 10080);
      const remainingDays = Math.floor((minutes % 10080) / 1440);
      return `${weeks} week${weeks !== 1 ? 's' : ''}${
        remainingDays > 0
          ? ` ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`
          : ''
      }`;
    } else {
      const months = Math.floor(minutes / 43829);
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
  }

  const getUserDailyState = async () => {
    try {
      const url = `daily-state/chart?userId=${user._id}&page=1&pageSize=2`;
      const dailyStateReq = new ApiService(url, tokens.accessToken);
      const response = await dailyStateReq.Get();

      if (response?.status === 200) {
        let arr: DailyState[] = [...defaultDailyState];
        response.data?.forEach((elem: DailyState) => {
          if (elem.dailyStateType === 'common') return;
          const elemIndex = arr.findIndex(
            e => e.dailyStateType === elem.dailyStateType.toLowerCase(),
          );

          if (elemIndex >= 0) arr[elemIndex] = elem;
        });

        setDailyState([...arr]);
      }
    } catch (err) {
      console.log('🚀~ getUserDailyState ~ err:', err);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getUserDailyState();
      console.log('🚀 ~ useEffect ~ route.params:', route.params);
      if (route.params?.showPhysicalPrompt) {
        setPhysicalChart(true);
        navigation.setParams({
          ...route.params,
          showFinalThought: false,
          showPhysicalPrompt: false,
        });
      } else if (route.params?.showFinalThought) {
        setFinalThought(true);
        navigation.setParams({...route.params, showFinalThought: false});
      }
    }
  }, [isFocused]);

  useEffect(() => {
    const backAction = () => {
      if (route.params?.backToProfile) {
        navigation.navigate('Profile');
        navigation.setParams({showFinalThought: false, backToProfile: false});
        return true;
      }

      navigation.goBack();
      return true;
    };

    let backHandler: any;

    if (route.name === 'DailyStateScreen' && isFocused) {
      backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );
    }

    return () => backHandler?.remove();
  }, [isFocused]);

  useEffect(() => {
    console.log('its working');

    navigation.setOptions({tabBarStyle: {display: 'none'}});
  }, []);

  return (
    <View>
        <View
          style={{
            height: verticalScale(60),
            flexDirection: 'row',
            paddingHorizontal: horizontalScale(20),
            justifyContent: 'space-between',
            alignItems: 'center',
            // position: 'absolute',
            // top: 0,
            // left: 0,
            // right: 0,
            zIndex: 9999,
            backgroundColor: '#f9fafa',
            // elevation: 1,
          }}>
          <TouchableOpacity
            onPress={() => {
              if (route.params?.backToProfile) {
                navigation.navigate('Profile');
                navigation.setParams({
                  showFinalThought: true,
                  backToProfile: false,
                });
              } else navigation.goBack();
            }}>
            <Icon
              name="arrow-back-outline"
              size={24}
              color={COLORS.primary400}
            />
          </TouchableOpacity>
          <Text
            style={[
              STYLES.dev1__text16,
              {color: COLORS.neutral900, fontFamily: 'GeneraLSans-Regular'},
            ]}>
            Daily State{' '}
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('BeNotifiedScreen', {
                fromChallenges: true,
                dailyState: true,
              })
            }>
            <Icon name="alarm-outline" size={24} color="#2791B5" />
          </TouchableOpacity>
        </View>
      <ScrollView style={{ backgroundColor: "#F9FAFA"}} showsVerticalScrollIndicator={false}>
        <View
          style={[
            STYLES.dev1__homeContainer,
            {
              flexDirection: 'row',
              gap: 10,
              flexWrap: 'wrap',
              marginBottom: verticalScale(70),
              backgroundColor: '#f9fafa',
            },
          ]}>
          {dailyState.map((item, index) => {
            const timeDiff =
              item.dateTime && getTimeDifferenceinMins(item.dateTime);
            const lastUpdate = formatTime(timeDiff);
            const stateType = item.dailyStateType.toLowerCase();
            return (
              <StateCard
                key={index}
                bgColor={COLORS[stateType as keyof typeof COLORS]}
                name={item.dailyStateType.toUpperCase()}
                imageurl={
                  dailyStateImages[stateType as keyof typeof dailyStateImages]
                }
                percentage={item.value}
                lastUpdateTime={lastUpdate}
                // lastUpdateTime={'1 hr 57 min'}
              />
            );
          })}
        </View>
      </ScrollView>
      <CustomModal
        visible={physicalChart}
        close={() => setPhysicalChart(!physicalChart)}
        title="Physical is less than 25%"
        description="Would you like to record and tell us what’s hurting you?"
        color="#000"
        icon="x"
        btnBgColor="#8EB26F"
        onConfirm={() => {
          const physicalState = dailyState.find(
            state => state.dailyStateType.toLowerCase() === 'physical',
          );
          setPhysicalChart(!physicalChart),
            navigation.navigate('PainChartScreen', {state: physicalState});
        }}
        imageUrl={require('../../../assets/images/daily-state-images/reception-bell.png')}
      />

      <FinalThoughtModal
        accessToken={tokens.accessToken}
        visible={finalThought}
        close={() => setFinalThought(!finalThought)}
        title="Wait! before you go."
        description="It is a great way to share with your friend know how you are feeling. "
        color="#8EB26F"
        icon="x"
        btnBgColor="#8EB26F"
        onConfirm={() => {
          setFinalThought(!finalThought);
          // navigation.navigate('PainChartScreen');
        }}
        imageUrl={require('../../../assets/images/daily-state-images/reception-bell.png')}
      />
    </View>
  );
};

export default DailyStateScreen;
