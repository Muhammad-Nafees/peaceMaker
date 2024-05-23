import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import MySchedule from '../../components/home/MySchedule';
import {Calendar} from 'react-native-calendars';
import {moderateScale} from '../../utils/metrics';
import {COLORS} from '../../constants/colors';
import moment from 'moment';
import {Challenge, StartedChallenge} from '../../interface/types';
import {ApiService} from '../../utils/ApiService';
import {useAppSelector} from '../../redux/app/hooks';
import {MarkedDates} from 'react-native-calendars/src/types';

const MyScheduleScreen: React.FC = ({route}: any) => {
  // const [selectedDate, setSelectedDate] = useState<string>('');
  const [markedDates, setMarkedDates] = useState<any>({});
  const data: Challenge[] | null = route.params?.data;
  const {tokens} = useAppSelector(state => state.user);

  // const handleDayPress = (day: any) => {
  //   const formattedDate = day.dateString;
  //   setSelectedDate(formattedDate);
  // };

  const today = moment().format('YYYY-MM-DD');
  
  // selectedDate
  // ? {[selectedDate]: {selected: true, selectedColor: COLORS.mainGreen}}
  // :
  // const markedDates = {
  //   [today]: {selected: true, selectedColor: COLORS.mainGreen},
  // };

  const getStartedChallenge = async () => {
    try {
      const lastChallenge = new ApiService(
        'challenge/last',
        tokens.accessToken,
      );
      const lastChallengeRes = await lastChallenge.Get();
      const resData: StartedChallenge | null = lastChallengeRes?.data;

      if (lastChallengeRes.status === 200 || lastChallengeRes.status === 404)
        if (!resData) {
          console.log('No Last Challenge: ', resData);
        } else {
          console.log('Last Challenge Found: ', resData);
          const lastChallengeStatus = resData.status;
          const isStarted = lastChallengeStatus === 'started';

          if (isStarted) {
            const challengesDatesTemp: Date[] = [];

            data?.forEach((_, index) => {
              if (index === 0) {
                challengesDatesTemp?.push(new Date(resData.createdAt));
              } else {
                const prevChallengeDate = new Date(
                  challengesDatesTemp[index - 1],
                );
                // Add duration in hours to the prevChallengeDate date
                prevChallengeDate.setHours(
                  prevChallengeDate.getHours() + data[index - 1].duration,
                );
                const nextChallengeDate = prevChallengeDate;
                challengesDatesTemp?.push(nextChallengeDate);
              }
            });
            const markedDatesTemp: MarkedDates = {
              [today]: {selected: true, selectedColor: COLORS.mainGreen},
            };
            console.log(
              '🚀 ~ file: MyScheduleScreen.tsx:70 ~ getStartedChallenge ~ today:',
              today,
            );

            challengesDatesTemp.forEach(el => {
              const challengeDate = moment(el).format('YYYY-MM-DD');
              if (markedDatesTemp.hasOwnProperty(challengeDate)) {
                markedDatesTemp[challengeDate] = {
                  selected: true,
                  selectedColor: COLORS.mainGreen,
                  marked: true,
                  dotColor: '#FD003A',
                };
                return;
              }
              markedDatesTemp[challengeDate] = {
                marked: true,
                dotColor: '#FD003A',
              };
            });
            setMarkedDates(markedDatesTemp);
          }
        }
    } catch (error) {
      console.log('🚀 ~ getStartedChallenge ~ error:', error);
    }
  };

  useEffect(() => {
    getStartedChallenge();
  }, []);

  return (
    <ScrollView style={{backgroundColor: '#F9FAFA'}}>
      <View style={STYLES.dev1__container}>
        <Calendar
          style={styles.calendar}
          // onDayPress={handleDayPress}
          markedDates={markedDates}
        />
        <MySchedule
          title="Today"
          schedule={[
            {
              color: COLORS.red,
              content: `Daily Challenge ${data[0]?.challenge}`,
              id: data[0]?._id,
            },
          ]}
        />
        <MySchedule
          title="Upcoming"
          schedule={data?.slice(1, data.length)?.map(elem => ({
            color: COLORS.neutral300,
            content: `Daily Challenge ${elem.challenge}`,
            id: elem._id,
          }))}
          titleColor="#d6d6d6"
        />
      </View>
    </ScrollView>
  );
};

export default MyScheduleScreen;

const styles = StyleSheet.create({
  calendar: {
    borderRadius: moderateScale(13),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
    color: COLORS.mainGreen,
  },
});
