import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {STYLES} from '../../styles/globalStyles';

const RemindersCard = ({time, points}: {time: string; points: number}) => {
  return (
    <View style={styles.cardContainer}>
      <Text
        style={[
          STYLES.dev1__text13,
          {
            fontWeight: '500',
            fontFamily: 'GeneralSans-Medium',
            color: 'rgba(74, 157, 145, 1)',
          },
        ]}>
        Reminders:
      </Text>
      <View style={{gap: 4, paddingTop: verticalScale(10)}}>
        <Text
          style={[
            STYLES.dev1__text13,
            {
              fontWeight: '500',
              fontFamily: 'GeneralSans-Bold',
              color: 'rgba(255, 255, 255, 1)',
            },
          ]}>
          Challenge only valid for
          <Text style={[STYLES.dev1__text15, {color: 'rgba(39, 145, 181, 1)'}]}>
            {' '}
            {/* 23h:10m:02s{' '} */}
            {time}
          </Text>
        </Text>
        <Text
          style={[
            STYLES.dev1__text13,
            {
              fontWeight: '500',
              fontFamily: 'GeneralSans-Bold',
              color: 'rgba(255, 255, 255, 1)',
            },
          ]}>
          Gain <Text style={{ fontWeight: '700'}}>{points} point</Text> once you accomplish this
        </Text>
      </View>
    </View>
  );
};

export default RemindersCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: horizontalScale(343),
    // height: verticalScale(100),
    borderRadius: moderateScale(15),
    backgroundColor: 'rrgba(164, 218, 210, 1)',
    marginTop: verticalScale(20),
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(15)
  },
});
