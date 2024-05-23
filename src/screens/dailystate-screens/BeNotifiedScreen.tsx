import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import {COLORS} from '../../constants/colors';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import NotifyCard from '../../components/daily-state/NotifyCard';
import ManualSetCard from '../../components/daily-state/ManualSetCard';
import {useNavigation, useRoute} from '@react-navigation/native';
import JournalEntryDetails from '../../components/journal-entry/JournalEntryDetails';
import CustomButton from '../../components/shared-components/CustomButton';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  AuthStackParamList,
  DailyStateBeNotified,
  DailyStateEntry,
  StartedChallenge,
} from '../../interface/types';
import {ApiService} from '../../utils/ApiService';
import {useAppSelector} from '../../redux/app/hooks';
import {IFeeling} from '../../../data/data';
import {format} from 'date-fns';
import {formatDate, formatTime} from '../../utils/helpers';
import moment from 'moment-timezone';
import Toast from 'react-native-toast-message';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import Toast1 from 'react-native-root-toast';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'JournalSubEntry'
>;

type DefaultTime = {
  enabled: boolean;
  value: string;
};

const BeNotifiedScreen = ({route}: any) => {
  const navigation = useNavigation<NavigationProp>();
  const {name} = useRoute();
  const [switchValue1, setSwitchValue1] = useState<DefaultTime>({
    enabled: false,
    value: '7:00 AM',
  });
  const [switchValue2, setSwitchValue2] = useState<DefaultTime>({
    enabled: false,
    value: '12:00 AM',
  });
  const [switchValue3, setSwitchValue3] = useState<DefaultTime>({
    enabled: false,
    value: Platform.OS === 'android' ? '8:00 AM' : '08:00 AM',
  });
  const [switchValue4, setSwitchValue4] = useState<boolean>(false);
  const [selectedFeeling, setSelectedFeeling] = useState({
    name: '',
    _id: '',
  });
  const [userLocation, setUserLocation] = useState('');
  const [journalEntryData, setJournalEntryData] = useState<DailyStateEntry[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [manualDate, setManualDate] = useState<Date>();
  const [manualTime, setManualTime] = useState<Date>();
  const [showClock, setShowClock] = useState<DefaultTime>({
    value: '',
    enabled: false,
  });
  const [iosTime, setIosTime] = useState<Date>();
  const [locationSwitch, setLocationSwitch] = useState(false);

  const [journalEntryCategories, setJournalEntryCategories] = useState<
    IFeeling[]
  >([]);
  const [isDailyStateData, setIsDailyStateData] = useState<{
    avaible: boolean;
    data: null | DailyStateBeNotified;
  }>({
    avaible: false,
    data: null,
  });
  const [manualTimeReq, setManualTimeReq] = useState(false);

  const fromChallenges = route.params?.fromChallenges;
  const dailyState = route.params?.dailyState;
  const enableSaveBtn = !fromChallenges
    ? true
    : switchValue1.enabled ||
      switchValue2.enabled ||
      switchValue3.enabled ||
      switchValue4 ||
      userLocation !== '';

  const {tokens, data: user} = useAppSelector(state => state.user);
  const startedChallenge: StartedChallenge | undefined =
    route.params?.startedChallenge;

  const handleSelect = (feeling: {name: string; _id: string}) => {
    // setSelectedFeeling(feeling);
    handleSaveEntry(feeling);
    // if (feelingName == 'Event Oriented') {
    //   setSelectedFeeling(feelingName);
    // } else if (feelingName == 'Trauma') {
    //   setSelectedFeeling(feelingName);
    // } else {
    //   setSelectedFeeling(feelingName);
    // }
  };

  const createCommonDailyState = async (): Promise<boolean | string> => {
    try {
      const dailyState = new ApiService(
        `daily-state/create`,
        tokens.accessToken,
      );
      const todayDate = formatDate(new Date());
      const reqObj = {
        userId: user._id,
        dailyStateType: 'common',
        value: '0',
        dateTime: new Date(),
        date: todayDate,
      };
      const dailyStateRes = await dailyState.Post(reqObj);

      if (dailyStateRes.status === 200) return dailyStateRes.data._id;
      return false;
    } catch (error) {
      console.log('🚀 ~ handleUpdate ~ error:', error);
      return false;
    }
  };

  const saveEmptyEntry = async () => {
    try {
      const commonDailyStateID = await createCommonDailyState();

      if (!commonDailyStateID) {
        Toast.show({type: 'error', text1: 'Failed to save journal entry.'});
        return;
      }

      const entry = new ApiService(
        `daily-state/journal-entry`,
        tokens.accessToken,
      );

      const formattedManualDate = manualDate ? formatDate(manualDate) : null;

      const formattedManualTime = manualTime
        ? format(new Date(manualTime), 'HH:mm')
        : null;
      const userTimeZone = moment.tz.guess();

      const reqObj = {
        userId: user._id,
        dailyStateId: commonDailyStateID,
        journalEntry: {
          locationAddress: userLocation,
          manualDate: formattedManualDate,
          manualTime: formattedManualTime,
          defaultTime: [
            {
              time: switchValue1.value,
              isEnable: switchValue1.enabled,
            },
            {
              time: switchValue2.value,
              isEnable: switchValue2.enabled,
            },
            {
              time: switchValue3.value,
              isEnable: switchValue3.enabled,
            },
          ],
          description: null,
          shortDescription: route.params?.journal,
          tip: null,
          timezone: userTimeZone,
          location: {
            coordinates: [0, 0],
          },
        },
      };
      console.log(
        '🚀 ~ file: BeNotifiedScreen.tsx:173 ~ saveEmptyEntry ~ reqObj:',
        reqObj,
      );
      console.log(
        '🚀 ~ file: BeNotifiedScreen.tsx:173 ~ saveEmptyEntry ~ reqObj:',
        reqObj.journalEntry.defaultTime,
      );
      const entryRes = await entry.Post(reqObj);
      console.log(
        '🚀 ~ file: BeNotifiedScreen.tsx:175 ~ saveEmptyEntry ~ entryRes:',
        entryRes,
      );

      if (entryRes?.status === 200)
        navigation.navigate('Journal', {goToSpecific: 'JournalEntryRecords'});
    } catch (error) {
      console.log('🚀  saveDataAndNavigate ~ error:', error);
      Toast.show({type: 'error', text1: 'Failed to save journal entry.'});
    }
  };

  const handleSaveEntry = (f: {name: string; _id: string}) => {
    const optionalFeeling = f ? f : selectedFeeling;
    if (optionalFeeling.name.toLowerCase() === 'pain chart') {
      navigation.navigate('PainChartScreen', {
        state: {
          dailyStateType: 'PHYSICAL',
          value: 25,
        },
        journalEntryId: optionalFeeling._id,
        timers: {
          sevenAM: switchValue1.enabled,
          twelveAM: switchValue2.enabled,
          eightAM: switchValue3.enabled,
          value1: switchValue1.value,
          value2: switchValue2.value,
          value3: switchValue3.value,
        },
      location:locationSwitch? userLocation:'',
      manual: {
          date: manualDate,
          time: manualTime,
        },
        journal: route.params?.journal,
      });
      return;
    }
    const journalEnt = journalEntryData.find(
      elem => elem._id === optionalFeeling._id,
    );
    navigation.navigate('JournalSubEntry', {
      name: optionalFeeling.name,
      journal: route.params?.journal,
      location:locationSwitch? userLocation:'',
      journalEntryData: journalEnt,
      timers: {
        sevenAM: switchValue1.enabled,
        twelveAM: switchValue2.enabled,
        eightAM: switchValue3.enabled,
        value1: switchValue1.value,
        value2: switchValue2.value,
        value3: switchValue3.value,
      },
      manual: {
        date: manualDate,
        time: manualTime,
      },
      journalEntryId: optionalFeeling._id,
    });
    // if (optionalFeeling.name.toLowerCase() !== 'pain chart') {
    // } else {
    //   navigation.navigate('PainChartScreen');
    // }
  };

  const getJournalEntryData = async () => {
    try {
      setLoading(true);
      const url = 'daily-state/admin?mainType=daily-state';
      const journalEntry = new ApiService(url, tokens.accessToken);
      const response = await journalEntry.Get();

      if (response?.status === 200) {
        const data: DailyStateEntry[] = response.data;
        setJournalEntryData(data);

        let arr: IFeeling[] = [];
        data.forEach(entry => {
          arr.push({
            _id: entry._id,
            name: entry.journalEntryType
              ? entry.journalEntryType.replace('-', ' ').toLowerCase()
              : '',
          });
        });

        const customSort = (a: any, b: any) => {
          if (a.name === 'event oriented') {
            return -1; // 'Event Oriented' comes first
          } else if (a.name === 'trauma' && b.name !== 'event oriented') {
            return -1; // 'Trauma' comes second
          } else if (
            a.name === 'pain chart' &&
            b.name !== 'event oriented' &&
            b.name !== 'trauma'
          ) {
            return -1; // 'Pain Chart' comes third
          } else {
            return 1; // All other elements follow in their original order
          }
        };

        const sortedData = arr.sort(customSort);

        setJournalEntryCategories(sortedData);
      }
      setLoading(false);
    } catch (err) {
      console.log('🚀~ getUserDailyState ~ err:', err);
      setLoading(false);
    }
  };

  function convertTo24Hour(time12Hour: string) {
    if (!time12Hour) return '';

    // Split the input time into hours, minutes, and AM/PM
    var timeParts = time12Hour.split(/:| /);

    // Extract hours and minutes
    var hours = parseInt(timeParts[0], 10);
    var minutes = parseInt(timeParts[1], 10);

    // Convert to 24-hour format
    if (timeParts[2] === 'PM' && hours !== 12) {
      hours += 12;
    } else if (timeParts[2] === 'AM' && hours === 12) {
      hours = 0;
    }

    // Format the hours and minutes with leading zeros
    var time24Hour = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;

    console.log(time24Hour);

    return time24Hour;
  }

  const handleBeNotifiedSave = async () => {
    try {
      const beNotified = new ApiService(
        `challenge/be-notified/${route.params.id}`,
        tokens.accessToken,
      );

      const userTimeZone = moment.tz.guess();
      const isCustomReminder = switchValue4;
      const customReminderTime = manualTime ? formatTime(manualTime) : '';
      const customReminderTime24Hour = convertTo24Hour(customReminderTime);
      const customReminderDate = manualDate ? formatDate(manualDate) : '';
      const reqCustomDate = customReminderDate + ' ' + customReminderTime24Hour;

      const reqObj: any = {
        reminders: [
          {isActive: switchValue1.enabled, time: switchValue1.value},
          {isActive: switchValue2.enabled, time: switchValue2.value},
          {isActive: switchValue3.enabled, time: switchValue3.value},
        ],
        customReminder: {
          isActive: isCustomReminder,
          date:
            reqCustomDate.trim().length && isCustomReminder
              ? reqCustomDate
              : '2023-09-10 11:05 AM',
        },
        location: {
          type: 'Point',
          coordinates: [64.052, 25.022],
        },
        timeZone: userTimeZone,
      };
      console.log('~ handleBeNotifiedSave ~ reqObj:', reqObj);
      if (userLocation.trim().length) reqObj.address = userLocation;
      else reqObj.address = 'null';

      const res = await beNotified.Put(reqObj);
      console.log(
        '🚀 ~ file: BeNotifiedScreen.tsx:194 ~ handleBeNotifiedSave ~ res:',
        res,
      );

      if (res.status === 200) {
        route.params.handleSetBeNotified(enableSaveBtn);
        navigation.goBack();
      }

      // route.params.handleSetBeNotified(enableSaveBtn);
      // route.params.handleSetBeNotified(enableSaveBtn);
      // navigation.goBack();
    } catch (error) {
      console.log('🚀 ~ completeChallenge ~ error:', error);
    }
    console.log(enableSaveBtn);
  };

  const handleDailyStateBeNotified = async () => {
    try {
      setLoading(true);

      const beNotified = new ApiService('be-notified', tokens.accessToken);

      const reqDate = manualDate ? formatDate(manualDate) : null;
      const reqTime = manualTime ? formatTime(manualTime, true, false) : null;
      const userTimeZone = moment.tz.guess();

      const reqData = {
        timezone: userTimeZone,
        userId: user._id,
        defaultTime: [
          {
            time: switchValue1.value,
            isEnable: switchValue1.enabled,
          },
          {
            time: switchValue2.value,
            isEnable: switchValue2.enabled,
          },
          {
            time: switchValue3.value,
            isEnable: switchValue3.enabled,
          },
        ],
        manualDate: reqDate,
        manualTime: reqTime,
        locationAddress: userLocation === '' ? null : userLocation,
        location: {
          coordinates: [67.22, 97.222],
        },
      };

      let res: any;

      if (isDailyStateData.avaible) {
        reqData._id = isDailyStateData.data?._id;
        res = await beNotified.Put(reqData);
      } else {
        res = await beNotified.Post(reqData);
        console.log('first');
      }
      console.log('🚀~ reqData:', reqData);

      console.log(
        '🚀 ~ file: BeNotifiedScreen.tsx:244 ~ handleDailyStateBeNotified ~ res:',
        res,
      );
      setLoading(false);

      if (res.status === 200) navigation.goBack();
    } catch (error) {
      console.log('🚀 ~ handleDailyStateBeNotified ~ error:', error);
      setLoading(false);
    }
  };

  const getDailyStateBeNotified = async () => {
    try {
      const url = `be-notified?userId=${user._id}`;
      const beNotified = new ApiService(url, tokens.accessToken);
      const response = await beNotified.Get();
      console.log(
        '🚀 ~ file: BeNotifiedScreen.tsx:217 ~ getDailyStateBeNotified ~ response:',
        response,
      );

      if (response?.status === 200) {
        setIsDailyStateData({
          avaible: response.data.length > 0,
          data: response.data[0] ?? null,
        });
      }
    } catch (err) {
      console.log('🚀~ getDailyStateBeNotified ~ err:', err);
    }
  };

  const convertTimezone = (date: string) => {
    const isoDate = date;
    const targetTimezone = 'UTC'; // Change this to your desired timezone

    // Parse the ISO date string and set the timezone
    const dateInUTC = moment(isoDate).tz(targetTimezone);

    // Format the date in the specified timezone
    const formattedDate = dateInUTC.format('YYYY-MM-DD HH:mm:ss');

    return formattedDate;
  };

  const formatTimeFromTimeZone = (date: string) => {
    const inputTime = convertTimezone(date).split(' ')[1];
    const timeParts = inputTime.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    let formattedTime;
    if (hours === 0) {
      formattedTime = `12:${minutes.toString().padStart(2, '0')}`;
    } else if (hours < 12) {
      formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;
    } else if (hours === 12) {
      formattedTime = `12:${minutes.toString().padStart(2, '0')}`;
    } else {
      formattedTime = `${(hours - 12).toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;
    }

    console.log(formattedTime);

    return formattedTime;
  };

  function parseTimeStringToDateTime(timeString: string) {
    const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3].toUpperCase();

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      const parsedTime = new Date();
      parsedTime.setHours(hours, minutes, 0, 0);

      return parsedTime;
    } else {
      console.log('Invalid time format');
      return new Date();
    }
  }

  const getChallengesBenotifiedData = async () => {
    if (startedChallenge) {
      const challengeManualDate = startedChallenge.customReminder?.isActive
        ? convertTimezone(startedChallenge.customReminder.date).split(' ')[0]
        : null;
      console.log(
        '🚀 ~ file: BeNotifiedScreen.tsx:471 ~ getChallengesBenotifiedData ~ convertTimezone(startedChallenge.customReminder.date):',
        convertTimezone(startedChallenge.customReminder.date).split(' ')[1],
      );
      // const challengeManualTime = startedChallenge.customReminder?.isActive
      //   ? formatTime(startedChallenge.customReminder.date, true, false)
      //   : null;
      const challengeManualTime = startedChallenge.customReminder?.isActive
        ? formatTimeFromTimeZone(startedChallenge.customReminder.date)
        : null;
      console.log(
        '🚀 ~ file: BeNotifiedScreen.tsx:452 ~ getChallengesBenotifiedData ~ challengeManualTime:',
        challengeManualTime,
      );
      const challengeDefaultTime = startedChallenge.reminders.map(
        (el, index) => ({
          time: el.time,
          isEnable: el.isActive,
          _id: index,
        }),
      );

      const isAddress =
        startedChallenge.address === 'null' ? null : startedChallenge.address;

      let challengeBenotified: DailyStateBeNotified | null = {
        location: {
          type: 'Point',
          coordinates: [0, 0],
        },
        _id: startedChallenge._id,
        userId: startedChallenge.user,
        createdAt: startedChallenge.createdAt,
        defaultTime: challengeDefaultTime,
        locationAddress: isAddress,
        manualDate: challengeManualDate,
        manualTime: challengeManualTime,
        type: null,
      };

      setIsDailyStateData({
        avaible: true,
        data: challengeBenotified,
      });
    }
  };

  useEffect(() => {
    if (fromChallenges) {
      const options = {
        headerTitle: 'Be Notified',
        headerRight: () => (
          <TouchableOpacity
            onPress={
              dailyState ? handleDailyStateBeNotified : handleBeNotifiedSave
            }>
            <Text
              style={{
                color: COLORS.mainGreen,
              }}>
              {dailyState ? 'Save' : 'Done'}
            </Text>
          </TouchableOpacity>
        ),
      };
      if (dailyState) options.headerTitle = '';
      navigation.setOptions(options);
    }
  }, [
    manualDate,
    manualTime,
    switchValue3.enabled,
    switchValue1.enabled,
    switchValue2.enabled,
    switchValue3.value,
    switchValue1.value,
    switchValue2.value,
    userLocation,
    switchValue4,
  ]);

  useEffect(() => {
    if (fromChallenges && !dailyState) {
      getChallengesBenotifiedData();
      setManualTimeReq(true);
    }
    if (dailyState) getDailyStateBeNotified();
    getJournalEntryData();
  }, []);

  function formatDefaultTime(timestampString: Date) {
    const timestamp = new Date(timestampString);

    // Extract the hours and minutes from the timestamp
    const hours = timestamp.getHours();
    const minutes = timestamp.getMinutes();

    // Convert the hours to AM/PM format
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Ensure 12-hour format

    // Format the time string as "h:mm AM/PM"
    const formattedTime = `${formattedHours}:${minutes
      .toString()
      .padStart(2, '0')} ${ampm}`;

    console.log(formattedTime); // Output: "5:41 AM"
    return formattedTime;
  }

  const selectTimeHandler = (event: any, selected?: Date | undefined) => {
    if (event.type === 'dismissed') {
      setShowClock({enabled: false, value: ''});
    } else if (selected) {
      const newDefaultTime = formatDefaultTime(selected);
      setShowClock({enabled: false, value: ''});

      // setSelectedTime(selected);
      if (showClock.value === switchValue1.value) {
        setSwitchValue1({
          value: newDefaultTime,
          enabled: true,
        });
      }

      if (showClock.value === switchValue2.value) {
        setSwitchValue2({
          value: newDefaultTime,
          enabled: true,
        });
      }

      if (showClock.value === switchValue3.value) {
        setSwitchValue3({
          value: newDefaultTime,
          enabled: true,
        });
      }
    }
  };

  useEffect(() => {
    if (isDailyStateData?.avaible) {
      // const sevenAm = isDailyStateData.data?.defaultTime.find(
      //   ({time}) => time === switchValue1.value,
      // );
      // const twelveAm = isDailyStateData.data?.defaultTime.find(
      //   ({time}) => time === switchValue2.value,
      // );
      const sevenAm = isDailyStateData.data?.defaultTime[0];
      const twelveAm = isDailyStateData.data?.defaultTime[1];
      const eightAm = isDailyStateData.data?.defaultTime[2];
      if (sevenAm)
        setSwitchValue1(prevState =>
          sevenAm?.isEnable
            ? {value: sevenAm.time, enabled: sevenAm.isEnable}
            : {value: sevenAm.time, enabled: false},
        );
      if (twelveAm)
        setSwitchValue2(prevState =>
          twelveAm?.isEnable
            ? {enabled: twelveAm?.isEnable, value: twelveAm.time}
            : {enabled: prevState.enabled, value: twelveAm.time},
        );
      if (eightAm)
        setSwitchValue3(prevState =>
          eightAm?.isEnable
            ? {enabled: eightAm?.isEnable, value: eightAm.time}
            : {enabled: prevState.enabled, value: eightAm.time},
        );
    }
  }, [isDailyStateData]);

  return (
    <ScrollView style={{flex: 1, backgroundColor: '#F6F7F7'}}>
      {loading && (
        <Toast1
          visible={loading}
          position={Toast1.positions.TOP}
          shadow={false}
          animation={true}
          // hideOnPress={true}
          delay={0}
          opacity={1}
          backgroundColor="transparent">
          <View
            style={{
              backgroundColor: 'transparent',
              opacity: 1,
            }}>
            <ActivityIndicator color={COLORS.mainGreen} size={30} />
          </View>
        </Toast1>
      )}
      <View
        style={[
          STYLES.dev1__homeContainer,
          {borderTopWidth: 1, borderTopColor: COLORS.inActive},
        ]}>
        {name != 'JournalEntry' && (
          <Text
            style={[
              STYLES.dev1__text28,
              {fontFamily: 'Satoshi-Black', color: COLORS.neutral900},
            ]}>
            Be Notified
          </Text>
        )}
        <View style={{paddingTop: verticalScale(19)}}>
          <Text
            style={[
              STYLES.dev1__text16,
              {
                color: COLORS.neutral900,
                opacity: 0.5,
                fontFamily: 'Satoshi-Medium',
              },
            ]}>
            Default
          </Text>
          <View style={styles.notifyContainer}>
            <NotifyCard
              onPress={() =>
                setShowClock({enabled: true, value: switchValue1.value})
              }
              switchValue={switchValue1.enabled}
              setSwitchValue={(val: boolean) =>
                setSwitchValue1(prevState => ({
                  value: prevState.value,
                  enabled: val,
                }))
              }
              content={switchValue1.value}
              iconName="alarm-outline"
            />
            <NotifyCard
              onPress={() =>
                setShowClock({enabled: true, value: switchValue2.value})
              }
              switchValue={switchValue2.enabled}
              setSwitchValue={(val: boolean) =>
                setSwitchValue2(prevState => ({
                  value: prevState.value,
                  enabled: val,
                }))
              }
              content={switchValue2.value}
              iconName="alarm-outline"
            />
            <NotifyCard
              onPress={() =>
                setShowClock({enabled: true, value: switchValue3.value})
              }
              switchValue={switchValue3.enabled}
              setSwitchValue={(val: boolean) =>
                setSwitchValue3(prevState => ({
                  value: prevState.value,
                  enabled: val,
                }))
              }
              content={switchValue3.value}
              iconName="alarm-outline"
              extraStyles={{borderBottomWidth: 0}}
            />
          </View>
          <View>
            <ManualSetCard
              switchValue3={locationSwitch}
              setSwitchValue3={setLocationSwitch}
              setSwitchValue4={setSwitchValue4}
              manualTimeReq={manualTimeReq}
              isDSData={isDailyStateData.data}
              setManualDate={setManualDate}
              setManualTime={setManualTime}
              setUserLocation={setUserLocation}
            />
          </View>
          {name == 'JournalEntry' && !fromChallenges && (
            <>
              {!fromChallenges && (
                <View style={{paddingTop: verticalScale(19)}}>
                  <JournalEntryDetails
                    data={journalEntryCategories}
                    selectedFeeling={selectedFeeling}
                    onSelectFeeling={handleSelect}
                  />
                </View>
              )}
              <CustomButton
                // isDisabled={selectedFeeling._id == '' ? true : false}
                onPress={fromChallenges ? handleSaveEntry : saveEmptyEntry}>
                {fromChallenges ? 'Save' : 'Save Entry'}
              </CustomButton>
            </>
          )}
        </View>
      </View>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showClock.enabled}
          transparent
          statusBarTranslucent
          animationType="fade"
          onRequestClose={() => selectTimeHandler({type: 'dismissed'})}>
          <TouchableWithoutFeedback
            onPress={() => selectTimeHandler({type: 'dismissed'})}>
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                // on
              }}>
              <TouchableOpacity
                onPress={() => selectTimeHandler({type: 'selected'}, iosTime)}
                style={{
                  position: 'absolute',
                  top: 30,
                  right: 10,
                  backgroundColor: 'white',
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  borderRadius: 5,
                }}>
                <Text style={{color: COLORS.mainGreen}}>Edit</Text>
              </TouchableOpacity>
              <RNDateTimePicker
                value={
                  iosTime ? iosTime : parseTimeStringToDateTime(showClock.value)
                }
                mode="time"
                // is24Hour={true}
                // display="clock"
                display="spinner"
                onChange={(e, time) => setIosTime(time)}
                style={{backgroundColor: 'white', paddingRight: 5}}
                textColor="white"
              />
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      ) : (
        showClock.enabled && (
          <RNDateTimePicker
            value={
              showClock.value
                ? parseTimeStringToDateTime(showClock.value)
                : new Date()
            }
            mode="time"
            is24Hour={true}
            display="clock"
            // display="compact"
            onChange={selectTimeHandler}
            style={{backgroundColor: 'red'}}
          />
        )
      )}
    </ScrollView>
  );
};

export default BeNotifiedScreen;

const styles = StyleSheet.create({
  notifyContainer: {
    marginTop: verticalScale(15),
    width: horizontalScale(343),
    borderRadius: moderateScale(15),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    elevation: 1,
  },
});
