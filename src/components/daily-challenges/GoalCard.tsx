import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {STYLES} from '../../styles/globalStyles';

const GoalCard = ({goal = ""}) => {
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
        Goal:
      </Text>
      <View style={{gap: 4, paddingTop: verticalScale(10)}}>
        <Text
          style={[
            STYLES.dev1__text13,
            {
              fontWeight: '500',
              fontFamily: 'GeneralSans-Medium',
              color: 'rgba(255, 255, 255, 1)',
            },
          ]}>
          {goal}
        </Text>
      </View>
    </View>
  );
};

export default GoalCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: horizontalScale(343),
    // height: verticalScale(100),
    borderRadius: moderateScale(15),
    backgroundColor: 'rgba(76, 89, 128, 1)',
    marginTop: verticalScale(20),
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: 17
  },
});
