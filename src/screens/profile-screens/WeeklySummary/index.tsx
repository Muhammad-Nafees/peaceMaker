import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Modal} from 'react-native';
import WeeklyState from '../../../components/profile/WeeklyStats';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../../utils/metrics';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import DateRangePicker from 'rn-select-date-range';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CloseIcon from 'react-native-vector-icons/Ionicons';

import {useRoute} from '@react-navigation/native';
import Navigation from '../../../utils/appNavigation';

export default function WeeklySummary({route}: any) {
  const [viewWidth, setViewWidth] = React.useState(0);
  const [selectedRange, setRange] = React.useState({});
  const [dateModal, setDateModal] = React.useState(false);
  const [dayNames, setDayNames] = React.useState<string[]>([]);
  const [fetchCharts, setFetchCharts] = React.useState(0);
  const navgation = useNavigation();
  const currentRoute = useRoute();

  const userID = route.params.userid;

  const errMessage = (message = 'Please select minimum 7 days.') =>
    Toast.show({
      type: 'info',
      text1: message,
    });

  const differenceInDaysBwTwoDates = (
    date1String: string,
    date2String: string,
  ) => {
    // Parse the date strings into Date objects
    const date1 = new Date(date1String);
    const date2 = new Date(date2String);

    // Calculate the difference in milliseconds
    const differenceInMilliseconds = date2.valueOf() - date1.valueOf();

    // Convert the difference to days
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

    return differenceInDays + 1;
  };

  function getDayNamesBetweenDates(startDateStr: string, endDateStr: string) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const dayNamesInRange = [];

    // Ensure the end date is greater than or equal to the start date
    if (startDate <= endDate) {
      let currentDate = startDate;

      while (currentDate <= endDate) {
        dayNamesInRange.push(dayNames[currentDate.getUTCDay()]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return dayNamesInRange;
  }

  const handleCalenderClose = () => {
    console.log(selectedRange);

    const selectedDates: string[] = Object.values(selectedRange);
    if (!selectedDates.length) return errMessage();

    const numberOfSelectedDates = differenceInDaysBwTwoDates(
      selectedDates[0],
      selectedDates[1],
    );

    if (numberOfSelectedDates < 7) return errMessage();
    if (numberOfSelectedDates > 7) return errMessage('Maximum 7 days allowed.');

    setFetchCharts(prevState => prevState + 1);
    const dayNamesBetweenDates = getDayNamesBetweenDates(
      selectedDates[0],
      selectedDates[1],
    );
    setDayNames(dayNamesBetweenDates);
    setDateModal(false);
  };

  // React.useEffect(() => {
  //   navgation.setOptions({
  //     headerRight: () => (
  //       <TouchableOpacity onPress={() => setDateModal(true)}>
  //         <Icon name="calendar" size={24} color="#2791B5" />
  //       </TouchableOpacity>
  //     ),
  //   });
  // }, []);

  const calenderModal = () => {
    return (
      <Modal
        hardwareAccelerated
        animationType="slide"
        transparent={true}
        visible={dateModal}
        statusBarTranslucent
        onRequestClose={() => setDateModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.centeredView}>
            <View
              style={{
                width: '100%',
                padding: 15,
                backgroundColor: 'white',
                borderRadius: 15,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,

                elevation: 5,
              }}>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: -5,
                  marginBottom: 10,
                }}>
                <TouchableOpacity onPress={() => setDateModal(false)}>
                  <AntDesign name="closecircle" color={'lightgray'} size={20} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCalenderClose}>
                  <Text style={{color: 'black'}}>DONE</Text>
                </TouchableOpacity>
              </View>
              <DateRangePicker
                confirmBtnTitle=" "
                onSelectDateRange={range => {
                  setRange(range);
                }}
                blockSingleDateSelection={true}
                responseFormat="YYYY-MM-DD"
                maxDate={moment()}
                // minDate={moment().subtract(100, 'days')}
                selectedDateContainerStyle={styles.selectedDateContainerStyle}
                selectedDateStyle={styles.selectedDateStyle}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const headerTitle = 'Daily State of ' + route.params?.name;

  return (
    <View style={{flex: 1, backgroundColor: '#F9FAFA'}}>
     {
      currentRoute.name !== "ProfileDSDetailedView" && 
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 10,
          paddingHorizontal: 20,
        }}>
        <TouchableOpacity onPress={() => Navigation.back()}>
          <CloseIcon name="ios-arrow-back-sharp" size={24} color="#2791B5" />
        </TouchableOpacity>

        <View style={{flex: 1, paddingHorizontal: 5, alignItems: 'center'}}>
          <Text
            style={{
              color: 'black',
              fontWeight: '500',
              fontSize: 20,
              overflow: 'hidden',
              // textOverflow: 'ellipsis',
            }}
            numberOfLines={1}
            ellipsizeMode="tail">
            {headerTitle}
          </Text>
        </View>

        <TouchableOpacity onPress={() => setDateModal(true)}>
          <Icon name="calendar" size={24} color="#2791B5" />
        </TouchableOpacity>
      </View>
     }
     

      {calenderModal()}

      <View style={styles.dailyStateContainer}>
        <WeeklyState
          dayNames={dayNames}
          fetchCharts={fetchCharts}
          selectedRange={Object.values(selectedRange)}
          userId={userID}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            paddingLeft: 10,
          }}>
          <View
            onLayout={event =>
              setViewWidth((event.nativeEvent.layout.width / 100) * 5)
            }
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              //  marginLeft: 50,
              maxWidth: 80 * 3 + viewWidth * 3 + 5,
            }}>
            {[
              {name: 'Spiritual', color: '#569099'},
              {name: 'Mental', color: '#4C5980'},
              {name: 'Emotional', color: '#93C572'},
              {name: 'Social', color: '#A4DAD2'},
              {name: 'Physical', color: '#559177'},
            ].map((_, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                  marginRight: '5%',
                  width: 80,
                }}>
                <View
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: 50,
                    backgroundColor: _.color,
                  }}
                />
                <Text style={{fontSize: 13, fontWeight: '500', color: _.color}}>
                  {_.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dailyStateContainer: {
    marginTop: verticalScale(10),
    borderRadius: moderateScale(13),
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(0),
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
    marginHorizontal: 16,
  },
  selectedDateContainerStyle: {
    height: 35,
    width: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8EB26F',
    borderRadius: 50,
  },
  selectedDateStyle: {
    fontWeight: 'bold',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: '100%',
    paddingHorizontal: 15,
    // height: Dimensions.get("window").height,
    // height: Dimensions.get("window").height,
  },
});
