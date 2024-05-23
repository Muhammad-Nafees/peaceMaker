import {useState, useEffect} from 'react';
import {Text, View, ScrollView, Platform} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import CustomButton from '../../components/shared-components/CustomButton';
import CustomModal from '../../components/shared-components/CustomModal';
import {useRoute} from '@react-navigation/native';
import SummaryDateTime from './SummaryDateTime';
import {ApiService} from '../../utils/ApiService';
import {useAppSelector} from '../../redux/app/hooks';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import {convertTo12HourFormat, formatDate} from '../../utils/helpers';
import {PermissionsAndroid} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {format} from 'date-fns';
import moment from 'moment-timezone';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';

const imageUrl = require('../../../assets/images/daily-state-images/reception-bell.png');

const SummaryScreen = ({route, navigation}: any) => {
  const {name} = useRoute();
  const [isSaveData, setIsSaveData] = useState<boolean>(false);
  const [userCoordinates, setUserCoordinates] = useState({
    longitude: 0,
    latitude: 0,
  });
  const [saveBtnDisabled, setSaveBtnDisabled] = useState(false);
  const [location, setLocation] = useState<string>(route.params?.location);

  const fromChart = route.params?.fromChart;
  const selectedTip: undefined | string = route.params?.tip;

  const {tokens, data: user} = useAppSelector(state => state.user);
  const answer: any = !fromChart
    ? Object.values(route.params?.subCategory)[0]
    : null;

  const checkCommonDailyStateExists = async (): Promise<boolean | string> => {
    try {
      const url = `daily-state?userId=${user._id}&page=1&pageSize=100`;
      const dailyState = new ApiService(url, tokens.accessToken);
      const response = await dailyState.Get();

      if (response?.status === 200) {
        const commonDailyState = response.data?.find(
          ({dailyStateType}: {dailyStateType: string}) =>
            dailyStateType.toLowerCase() === 'common',
        );
        if (commonDailyState) return commonDailyState._id;
      }
      return false;
    } catch (err) {
      console.log('🚀~ getUserDailyState ~ err:', err);
      return false;
    }
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
        dailyStateType: fromChart ? route.params.dailyStateName : 'common',
        value: fromChart ? route.params.dailyStateValue.toString() : '0',
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

  const getCoordinates = async () => {
    try {
      let granted;
      if (Platform.OS === 'ios') {
        const permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

        const permissionStatus = await check(permission);

        if (permissionStatus === RESULTS.GRANTED) {
          granted = permissionStatus;
        }

        const requestStatus = await request(permission);

        granted = requestStatus;
      } else {
        granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app requires access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
      }
      if (
        granted === PermissionsAndroid.RESULTS.GRANTED ||
        granted === RESULTS.GRANTED
      ) {
        Geolocation.getCurrentPosition(
          position => {
            setUserCoordinates({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          error => {
            console.warn(error.message);
          },
          {enableHighAccuracy: true, timeout: 20000, maximumAge: 2000},
        );
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // const setLocation = (v: string) => {
  //   if (route.params?.location) {
  //     route.params.location = v;
  //   }
  // };

  const saveDataAndNavigate = async () => {
    if (saveBtnDisabled) return;
    setSaveBtnDisabled(true);
    try {
      // const commonDailyStateID = await checkCommonDailyStateExists();
      // let newCommonDailyStateID;
      // if (!commonDailyStateID)

      // navigation.navigate('Journal', {goToRecords: true});
      // // navigation.navigate('JournalEntryRecords');
      // return;

      const commonDailyStateID = await createCommonDailyState();

      if (!commonDailyStateID) {
        setSaveBtnDisabled(false);
        Toast.show({type: 'error', text1: 'Failed to save journal entry.'});
        return;
      }

      const entry = new ApiService(
        `daily-state/journal-entry`,
        tokens.accessToken,
      );
      let selectedQuestions = fromChart
        ? route.params.allData.map((d: any) => ({
            question: d.text,
            answer: d.selectedText,
          }))
        : [
            {
              question: route.params?.category.name,
              answer: answer,
            },
          ];

      const skeleton = !fromChart
        ? []
        : route.params.chartdata.map(({slug}: {slug: string}) => slug);

      const feelingData = {
        type: fromChart ? route.params?.journalEntryName : route.params?.name,
        subType: fromChart ? null : route.params?.category.name,
        selectedQuestions,
        skeleton: fromChart ? skeleton : null,
      };

      const manualDate = route.params?.manual?.date
        ? formatDate(route.params.manual.date)
        : null;

      const manualTime = route.params?.manual?.time
        ? format(new Date(route.params?.manual.time), 'HH:mm')
        : null;
      const userTimeZone = moment.tz.guess();

      const reqObj = {
        userId: user._id,
        dailyStateId: commonDailyStateID,
        journalEntry: {
          adminJournalEntryId: route.params?.journalEntryId,
          locationAddress: location,
          manualDate: manualDate,
          manualTime: manualTime,
          defaultTime: [
            {
              time: route.params?.timers?.value1
                ? route.params?.timers?.value1
                : '7:00 AM',
              isEnable: route.params?.timers?.sevenAM ? true : false,
            },
            {
              time: route.params?.timers?.value2
                ? route.params?.timers?.value2
                : '12:00 AM',
              isEnable: route.params?.timers?.twelveAM ? true : false,
            },
            {
              time: route.params?.timers?.value3
                ? route.params?.timers?.value3
                : '8:00 AM',
              isEnable: route.params?.timers?.eightAM ? true : false,
            },
          ],
          description: route.params?.description ?? '',
          shortDescription: route.params?.journal ?? '',
          tip: fromChart
            ? null
            : selectedTip
            ? selectedTip?.trim()
            : route.params?.tips[0],
          timezone: userTimeZone,
          location: {
            coordinates: [userCoordinates.longitude, userCoordinates.latitude],
          },
          feelings: [feelingData],
        },
      };
      const entryRes = await entry.Post(reqObj);
     
      setSaveBtnDisabled(false);

      if (entryRes.status === 200)
        navigation.navigate('Journal', {goToSpecific: 'JournalEntryRecords'});
    } catch (error) {
      console.log('🚀  saveDataAndNavigate ~ error:', error);
      Toast.show({type: 'error', text1: 'Failed to save journal entry.'});
      setSaveBtnDisabled(false);
    }
  };

  useEffect(() => {
    if (route.params?.location && !fromChart) getCoordinates();
    if (fromChart) setUserCoordinates(route.params.coordinates);
  }, []);

  return (
    <ScrollView style={{backgroundColor: '#F6F7F7'}}>
      <View
        style={[
          STYLES.dev1__homeContainer,
          {justifyContent: 'space-between', flex: 1},
        ]}>
        <View>
          {fromChart && (
            <>
              <Text
                style={[
                  STYLES.dev1__text15,
                  {color: '#324C51', fontFamily: 'GeneralSans-Medium'},
                ]}>
                {route.params.chartdata.map(
                  ({slug}: {slug: string}, i: number) =>
                    slug.toUpperCase() +
                    (i === route.params.chartdata.length - 1 ? '' : ', '),
                )}
              </Text>
              {route.params.allData.map((elem: any) => {
                return (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 10,
                    }}>
                    <Text
                      style={[
                        STYLES.dev1__text15,
                        {color: '#324C51', fontFamily: 'GeneralSans-Regular'},
                      ]}>
                      {elem.text}
                      {''}
                      {elem.text[elem.text.length - 1] === '?' ||
                      elem.text[elem.text.length - 1] === ':' ||
                      elem.text[elem.text.length - 1] === '.'
                        ? ''
                        : ':'}
                    </Text>
                    <Text
                      style={[
                        STYLES.dev1__text15,
                        {
                          color: '#324C51',
                          fontFamily: 'GeneralSans-Medium',
                          paddingLeft: horizontalScale(25),
                          width: horizontalScale(210),
                        },
                      ]}>
                      {elem.selectedText}
                    </Text>
                  </View>
                );
              })}
            </>
          )}
          <View style={{gap: 16}}>
            {!fromChart && (
              <>
                <View style={{flexDirection: 'row', gap: 20}}>
                  {name == 'SummaryScreen' && (
                    <Text
                      style={[
                        STYLES.dev1__text15,
                        {color: '#324C51', fontFamily: 'GeneralSans-Regular'},
                      ]}>
                      What you feel:{' '}
                    </Text>
                  )}
                  <View style={{gap: 20}}>
                    {!fromChart ? (
                      <Text
                        style={[
                          STYLES.dev1__text15,
                          {
                            color: '#324C51',
                            fontFamily: 'GeneralSans-Medium',
                            width: horizontalScale(200),
                            textTransform: 'capitalize',
                          },
                        ]}>
                        {name == 'SummaryScreen'
                          ? route?.params?.problem
                          : route.params?.name}
                      </Text>
                    ) : null}
                    {name == 'JournalEntrySummary' && (
                      <Text
                        style={[
                          STYLES.dev1__text15,
                          {
                            color: '#324C51',
                            fontFamily: 'GeneralSans-Medium',
                            width: horizontalScale(200),
                            textTransform: 'capitalize',
                          },
                        ]}>
                        {route.params?.category.name}
                      </Text>
                    )}
                  </View>
                </View>
                {name == 'SummaryScreen' && !fromChart && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 50,
                    }}>
                    <Text
                      style={[
                        STYLES.dev1__text15,
                        {color: '#324C51', fontFamily: 'GeneralSans-Regular'},
                      ]}>
                      How long:{' '}
                    </Text>
                    <Text
                      style={[
                        STYLES.dev1__text15,
                        {color: '#324C51', fontFamily: 'GeneralSans-Medium'},
                      ]}>
                      {route?.params?.time}
                    </Text>
                  </View>
                )}

                {answer.toLowerCase() !== 'none' ? (
                  <Text
                    style={[
                      STYLES.dev1__text15,
                      {
                        color: '#324C51',
                        fontFamily: 'GeneralSans-Medium',
                        textTransform: 'capitalize',
                      },
                    ]}>
                    {answer}
                  </Text>
                ) : null}
              </>
            )}

            {name == 'JournalEntrySummary' && (
              <View>
                <View style={{gap: 10}}>
                  <Text
                    style={[
                      STYLES.dev1__text15,
                      {color: '#324C51', fontFamily: 'GeneralSans-Regular'},
                    ]}>
                    Description of Journal Entry
                  </Text>
                  <Text
                    style={[
                      STYLES.dev1__text15,
                      {color: '#324C51', fontFamily: 'GeneralSans-Medium'},
                    ]}>
                    “{route.params?.description}”
                  </Text>
                </View>
                {route.params?.tips[0] ? (
                  <View style={{marginTop: verticalScale(20), gap: 10}}>
                    <Text
                      style={[
                        STYLES.dev1__text15,
                        {color: '#324C51', fontFamily: 'GeneralSans-Regular'},
                      ]}>
                      Tip
                    </Text>
                    <Text
                      style={[
                        STYLES.dev1__text15,
                        {color: '#324C51', fontFamily: 'GeneralSans-Medium'},
                      ]}>
                      “{selectedTip?.trim() || route.params?.tips[0].trim()}”
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>
          <SummaryDateTime
            setLocation={setLocation}
            time={route.params?.manual?.time}
            data={route.params}
          />
        </View>
        <CustomButton onPress={() => setIsSaveData(true)}>Save</CustomButton>
        <CustomModal
          isLoading={saveBtnDisabled}
          visible={isSaveData}
          close={() => setIsSaveData(false)}
          title="Save to Journal Entry"
          description="Would you like to save this record to your journal entry? You would be able to access it later on."
          icon="x"
          color="#000"
          btnBgColor="#8EB26F"
          // onConfirm={() => navigation.navigate('JournalEntryRecords')}
          onConfirm={() => saveDataAndNavigate()}
          imageUrl={imageUrl}
        />
      </View>
    </ScrollView>
  );
};

export default SummaryScreen;
