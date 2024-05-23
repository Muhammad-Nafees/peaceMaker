import React from 'react';
import {View, Text, ScrollView} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import {COLORS} from '../../constants/colors';
import SummaryDateTime from '../dailystate-screens/SummaryDateTime';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import {JournalEntry} from '../../interface/types';
import {convertTo12HourFormat} from '../../utils/helpers';
import { EventRegister } from 'react-native-event-listeners';

const ViewSummaryScreen = ({route}: any) => {
  const [location, setLocation] = React.useState('');

  const data: JournalEntry = route.params.data;

  console.log(data.tip);
  // const isChart = data.tip === null ? true : false;
  const isFeeling = data.feelings[0];

  const isChart = isFeeling ? data.feelings[0].skeleton !== null : false;

  const type = isFeeling ? data.feelings[0].type.replace('-', ' ') : '';

  const subType = isChart ? '' : data.feelings[0]?.subType?.replace('-', ' ');

  const getCurrentLocation = async () => {
    if (!data.location?.coordinates) return;
    if (!data.location?.coordinates[1]) return;
    const latitude = data.location?.coordinates[1];
    const longitude = data.location?.coordinates[0];

    var method = 'GET';
    var url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'content-type': 'application/json',
        },
      });
      if (response.status == 401) EventRegister.emit('Logout', 'it works!!!');
      const res = await response.json();
      const {display_name, address} = res;
      console.log(
        '🚀 ~ file: ViewSummaryScreen.tsx:32 ~ getCurrentLocation ~ address:',
        address?.city
          ? address?.city
          : '' + ',' + address?.country
          ? address?.country
          : '',
      );

      setLocation(
        address?.city
          ? address?.city
          : '' + ',' + address?.country
          ? address?.country
          : '',
      );
    } catch (err) {
      console.log(err);
    }
  };

  React.useEffect(() => {
    if (data.location && !data?.locationAddress) getCurrentLocation();
  }, []);

  return (
    <View style={[STYLES.dev1__homeContainer, isChart ? {paddingTop: 0} : {}]}>
      <ScrollView>
        {data.shortDescription ? (
          <View style={{gap: 40}}>
            <View style={{gap: 10}}>
              <Text
                style={[
                  STYLES.dev1__text18,
                  {color: COLORS.primary400, fontFamily: 'GeneralSans-Medium'},
                ]}>
                Journal
              </Text>
              <Text
                style={[
                  STYLES.dev1__text15,
                  {
                    fontWeight: '500',
                    color: COLORS.neutral900,
                    fontFamily: 'GeneralSans-Medium',
                  },
                ]}>
                {data.shortDescription}
              </Text>
            </View>
            <View
              style={{
                borderWidth: 2,
                borderColor: 'rgba(237, 237, 237, 1)',
              }}></View>
          </View>
        ) : null}
        <View style={{marginTop: isChart ? -5 : 0}}>
          <SummaryDateTime
            data={{
              location: data?.locationAddress ?? location,
              datetime: data.createdAt,
            }}
            formattedTime={
              data?.manualTime
                ? convertTo12HourFormat(data?.manualTime)
                : undefined
            }
          />
        </View>
        <View style={{gap: 16, marginTop: verticalScale(30)}}>
          <Text
            style={[
              STYLES.dev1__text18,
              {
                color: COLORS.primary400,
                fontFamily: 'GeneralSans-Medium',
                textTransform: 'capitalize',
              },
            ]}>
            {type}
          </Text>
          {!isChart && isFeeling ? (
            <>
              <Text
                style={[
                  STYLES.dev1__text15,
                  {
                    color: '#324C51',
                    fontFamily: 'GeneralSans-Medium',
                    textTransform: 'capitalize',
                  },
                ]}>
                {subType}
              </Text>
              {isFeeling ? (
                data.feelings[0].selectedQuestions[0].answer?.toLowerCase() !==
                'none' ? (
                  <Text
                    style={[
                      STYLES.dev1__text15,
                      {
                        color: '#324C51',
                        fontFamily: 'GeneralSans-Medium',
                        textTransform: 'capitalize',
                      },
                    ]}>
                    {isFeeling
                      ? data.feelings[0].selectedQuestions[0].answer
                      : ''}
                  </Text>
                ) : null
              ) : null}
            </>
          ) : null}

          {isChart ? (
            <View>
              <Text
                style={[
                  STYLES.dev1__text15,
                  {
                    color: '#324C51',
                    fontFamily: 'GeneralSans-Medium',
                    marginTop: -10,
                    marginBottom: 10,
                  },
                ]}>
                {data.feelings[0].skeleton
                  ? data.feelings[0].skeleton.map(
                      (slug, i: number) =>
                        slug.toUpperCase() +
                        (i === data.feelings[0].skeleton.length - 1
                          ? ''
                          : ', '),
                    )
                  : null}
              </Text>
              {isFeeling
                ? data.feelings[0].selectedQuestions.map(elem => (
                    <View
                      key={elem._id}
                      style={{flexDirection: 'row', gap: 20, marginBottom: 10}}>
                      <Text
                        style={[
                          STYLES.dev1__text15,
                          {color: '#324C51', fontFamily: 'GeneralSans-Regular'},
                        ]}>
                        {elem.question}
                        {''}
                        {elem.question[elem.question.length - 1] === '?' ||
                        elem.question[elem.question.length - 1] === ':' ||
                        elem.question[elem.question.length - 1] === '.'
                          ? ''
                          : ':'}
                      </Text>

                      <View style={{gap: 20}}>
                        <Text
                          style={[
                            STYLES.dev1__text15,
                            {
                              color: '#324C51',
                              fontFamily: 'GeneralSans-Medium',
                              width: horizontalScale(200),
                            },
                          ]}>
                          {elem.answer}
                        </Text>
                      </View>
                    </View>
                  ))
                : null}

              {data.description ? (
                <>
                  <Text
                    style={[
                      STYLES.dev1__text15,
                      {
                        color: '#324C51',
                        fontFamily: 'GeneralSans-Regular',
                      },
                    ]}>
                    Description of Journal Entry
                  </Text>
                  <Text
                    style={[
                      STYLES.dev1__text15,
                      {color: '#324C51', fontFamily: 'GeneralSans-Medium'},
                    ]}>
                    “{data.description}”
                  </Text>
                </>
              ) : null}
            </View>
          ) : (
            <View>
              {data.description ? (
                <>
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
                    “{data.description}”
                  </Text>
                </>
              ) : null}
              {data?.tip ? (
                <>
                  <Text
                    style={[
                      STYLES.dev1__text15,
                      {
                        color: '#324C51',
                        fontFamily: 'GeneralSans-Regular',
                        marginTop: 8,
                      },
                    ]}>
                    Tip
                  </Text>
                  <Text
                    style={[
                      STYLES.dev1__text15,
                      {color: '#324C51', fontFamily: 'GeneralSans-Medium'},
                    ]}>
                    “{data.tip}”
                  </Text>
                </>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ViewSummaryScreen;
