import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {STYLES} from '../../styles/globalStyles';

interface Props {
  level: number;
  challenge: string;
  instruction: string;
}

const ChallengeCard = ({level, challenge, instruction}: Props) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardImage}>
        <Image
          style={{ width: "60%", height: "60%"}}
          source={require('../../../assets/images/daily-challenges/flag.png')}
        />
      </View>
      <Text
        style={[
          STYLES.dev1__text18,
          {
            fontWeight: '700',
            fontFamily: 'GeneralSans-Medium',
            color: 'rgba(140, 214, 239, 1)',
          },
        ]}>
        Challenge {level}:
      </Text>
      <Text
        style={[
          STYLES.dev1__text34,
          {
            fontWeight: '700',
            fontFamily: 'GeneralSans-Bold',
            color: 'white',
            textAlign: 'center',
            marginTop: verticalScale(20),
            paddingTop: -5
          },
        ]}>
        {challenge}
      </Text>
      <Text
        style={[
          STYLES.dev1__text15,
          {
            fontWeight: '500',
            fontFamily: 'GeneralSans-Medium',
            color: 'rgba(140, 214, 239, 1)',
            textAlign: 'center',
            marginTop: verticalScale(20),
          },
        ]}>
        {instruction}
      </Text>
    </View>
  );
};

export default ChallengeCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: horizontalScale(343),
    // minHeight: verticalScale(320),
    borderRadius: moderateScale(30),
    backgroundColor: 'rgba(39, 145, 181, 1)',
    position: 'relative',
    marginTop: verticalScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(25),
    paddingTop: 50,
  },
  cardImage: {
    width: 81,
    height: 81,
    borderRadius: 40.5,
    position: 'absolute',
    top: -verticalScale(40),
    left: horizontalScale(130),
    backgroundColor: '#E0EEF2',
    borderWidth: 10,
    borderColor: 'rgba(39, 145, 181, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },
});
