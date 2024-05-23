import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Modal,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import moment from 'moment';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList, DailyStateBeNotified} from '../../interface/types';
import RNDateTimePicker from '@react-native-community/datetimepicker';

import NotifyCard from './NotifyCard';
import {moderateScale, verticalScale} from '../../utils/metrics';
import {COLORS} from '../../constants/colors';
import {STYLES} from '../../styles/globalStyles';
import {format} from 'date-fns';
import {convertTo12HourFormat} from '../../utils/helpers';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'DailyStateMap'
>;

const ManualSetCard = ({
  setUserLocation,
  setManualDate,
  setManualTime,
  isDSData,
  manualTimeReq,
  setSwitchValue4,
  switchValue3,
  setSwitchValue3,
}: any) => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [switchValue1, setSwitchValue1] = useState<boolean>(false);
  const [switchValue2, setSwitchValue2] = useState<boolean>(false);
  // const [switchValue3, setSwitchValue3] = useState<boolean>(false);
  const [isShowCalender, setIsShowCalender] = useState<boolean>(false);
  const [isShowClock, setIsShowClock] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [iosTime, setIosTime] = useState<Date>();

  const isDailyStateData: null | DailyStateBeNotified = isDSData;

  const isFocused = useIsFocused();

  const handleDayPress = (day: any) => {
    const date = new Date(day.timestamp);
    setManualDate(date);

    const dayOfMonth = date.getDate();
    const month = date.toLocaleString('default', {month: 'short'});
    const year = date.getFullYear();

    const formattedDate = `${dayOfMonth} ${month} ${year}`;
    setSelectedDate(formattedDate);
    setIsShowCalender(false);

    if (manualTimeReq && !selectedTime) setIsShowClock(true);
    else setSwitchValue1(true);

    if (manualTimeReq && selectedTime) setSwitchValue2(true);
  };

  const today = moment().format('DD-MM-YYYY');
  const markedDates = selectedDate
    ? {[selectedDate]: {selected: true, selectedColor: COLORS.mainGreen}}
    : {[today]: {selected: true, selectedColor: COLORS.mainGreen}};

  const selectTimeHandler = (event: any, selected?: Date | undefined) => {
    if (event.type === 'dismissed') {
      setSelectedTime(prev => prev);
      setIsShowClock(false);
      if (!manualTimeReq) {
        if (selectedTime == null) {
          setSwitchValue2(false);
        }
      } else {
        // if()
      }
    } else if (selected) {
      setIsShowClock(false);
      setSelectedTime(selected);
      if (manualTimeReq && !selectedDate) setIsShowCalender(true);
      else if (manualTimeReq && selectedDate) {
        setSwitchValue1(true);
        setSwitchValue2(true);
      }

      if (!manualTimeReq) setSwitchValue2(true);
      // if (!val && manualTimeReq) setSwitchValue1(val);

      setManualTime(selected);
    }
  };

  const setLocation = (loc: string) => {
    setSelectedLocation(loc);
    setUserLocation(loc);
    setSwitchValue3(true);
  };

  const navigationHandler = () => {
    // setSwitchValue3(!switchValue3);
    navigation.navigate('DailyStateMap', {
      location: selectedLocation,
      setLocation: setLocation,
      setSwitchValue3,
    });
  };

  useEffect(() => {
    if (isFocused) {
      if (!selectedLocation) {
        setSwitchValue3(false);
      }
    }
  }, [isFocused]);

  useEffect(() => {
    if (manualTimeReq) {
      if (switchValue1 && switchValue2) setSwitchValue4(true);
      else setSwitchValue4(false);
    }
  }, [switchValue1, switchValue2]);

  useEffect(() => {
    if (isDailyStateData) {
      if (isDailyStateData.manualTime) {
        const timeString = convertTo12HourFormat(isDailyStateData.manualTime);
        const [time, period] = timeString.split(' ');
        const [hours, minutes] = time.split(':');

        let hours24 = parseInt(hours);
        if (period === 'PM' && hours24 !== 12) {
          hours24 += 12;
        } else if (period === 'AM' && hours24 === 12) {
          hours24 = 0;
        }

        const dateObj = new Date();
        dateObj.setHours(hours24, parseInt(minutes), 0, 0);

        setSelectedTime(dateObj);
        setIsShowClock(false);
        setSwitchValue2(true);
        setManualTime(dateObj);
      }
    }

    if (isDailyStateData?.manualDate) {
      const dateString = isDailyStateData.manualDate;
      const dateObj = new Date(dateString + 'T00:00:00');
      setManualDate(dateObj);

      const dayOfMonth = dateObj.getDate();
      const month = dateObj.toLocaleString('default', {month: 'short'});
      const year = dateObj.getFullYear();

      const formattedDate = `${dayOfMonth} ${month} ${year}`;
      setSelectedDate(formattedDate);
      setIsShowCalender(false);
      setSwitchValue1(true);
    }

    if (isDailyStateData?.locationAddress) {
      setSelectedLocation(isDailyStateData?.locationAddress);
      setUserLocation(isDailyStateData?.locationAddress);
      setSwitchValue3(true);
    }
  }, [isDailyStateData]);

  return (
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
        Set Manually
      </Text>
      <TouchableOpacity
        style={[
          styles.container,
          {borderBottomRightRadius: 0, borderBottomLeftRadius: 0},
        ]}
        onPress={() => {
          setIsShowCalender(!isShowCalender);
          if (selectedDate == '' && switchValue1) setSwitchValue1(false);
          else setSwitchValue1(true);
        }}>
        <NotifyCard
          switchValue={switchValue1}
          onPress={() => setIsShowCalender(!isShowCalender)}
          setSwitchValue={(val: boolean) => {
            if (!val) setManualDate(undefined);
            if (val && !selectedDate) {
              setIsShowCalender(true);
              return;
            }
            if (val && selectedDate && manualTimeReq) {
              if (selectedTime) {
                setSwitchValue1(true);
                setSwitchValue2(true);
              } else setIsShowClock(true);
            }
            // if (val && selectedDate && !selectedTime && manualTimeReq) {
            //   if (selectedTime) setSwitchValue2(true);
            //   else setIsShowClock(true);
            // }
            if (!val && manualTimeReq) {
              setSwitchValue1(val);
              setSwitchValue2(val);
            }
            if (!manualTimeReq) setSwitchValue1(val);
          }}
          content={'Date'}
          iconName="calendar"
          value={selectedDate}
        />
      </TouchableOpacity>
      {isShowCalender && (
        <Calendar
          minDate={new Date().toString()}
          style={styles.calendar}
          onDayPress={handleDayPress}
          markedDates={markedDates}
        />
      )}
      <TouchableOpacity
        style={[
          styles.container,
          {marginTop: 0, borderTopRightRadius: 0, borderTopLeftRadius: 0},
        ]}
        onPress={() => {
          setIsShowClock(true),
            selectedTime == null && switchValue2
              ? setSwitchValue2(false)
              : setSwitchValue2(true);
        }}>
        <NotifyCard
          onPress={() => setIsShowClock(true)}
          switchValue={switchValue2}
          // setSwitchValue={
          //   !selectedTime && !switchValue2 ? setIsShowClock : setSwitchValue2
          // }
          setSwitchValue={(val: boolean) => {
            if (!val) setManualTime(undefined);
            if (val && !selectedTime) {
              setIsShowClock(true);
              return;
            }
            if (val && selectedTime && manualTimeReq) {
              if (selectedDate) setSwitchValue1(true);
              else setIsShowCalender(true);
            }
            if (!val && manualTimeReq) setSwitchValue1(val);
            setSwitchValue2(val);
          }}
          content={'Time'}
          iconName="alarm-outline"
          // value={selectedTime && selectedTime.toLocaleTimeString()}
          value={selectedTime && format(new Date(selectedTime), 'h:mm a')}
        />
      </TouchableOpacity>
      {Platform.OS === 'ios' ? (
        <Modal
          visible={isShowClock}
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
                <Text style={{color: COLORS.mainGreen}}>Done</Text>
              </TouchableOpacity>
              <RNDateTimePicker
                value={iosTime ? iosTime : new Date()}
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
        isShowClock && (
          <RNDateTimePicker
            value={selectedTime || new Date()}
            mode="time"
            is24Hour={true}
            display="clock"
            onChange={selectTimeHandler}
          />
        )
      )}
      {/* {isShowClock && (
        <RNDateTimePicker
          value={selectedTime || new Date()}
          mode="time"
          is24Hour={true}
          display="clock"
          onChange={selectTimeHandler}
        />
      )} */}
      <TouchableOpacity style={[styles.container]} onPress={navigationHandler}>
        <NotifyCard
          onPress={navigationHandler}
          // switchValue={switchValue3}
          switchValue={switchValue3}
          setSwitchValue={
            selectedLocation === ''
              ? navigationHandler
              : (val: boolean) => {
                  setSwitchValue3(val);
                  setUserLocation(!val ? '' : selectedLocation);
                }
          }
          content={'Location'}
          iconName="navigate-outline"
          value={selectedLocation}
        />
      </TouchableOpacity>
    </View>
  );
};

export default ManualSetCard;

const styles = StyleSheet.create({
  container: {
    marginTop: verticalScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
    borderRadius: 16,
  },
  calendar: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
    color: COLORS.mainGreen,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inActive,
  },
});
