import {View, Text} from 'react-native';
import React from 'react';
import {StyleSheet} from 'react-native';
import {verticalScale, horizontalScale} from '../../utils/metrics';

interface Props {
  text: string;
  extraStyles?: any;
}

const CustomDivider = ({text, extraStyles}: Props) => {
  return (
    <View style={[styles.divider, extraStyles]}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{text}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
};

export default CustomDivider;

const styles = StyleSheet.create({
  divider: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dividerLine: {
    borderBottomColor: '#CCCCCC',
    width: horizontalScale(90),
    borderBottomWidth: horizontalScale(1),
  },
  dividerText: {
    paddingHorizontal: horizontalScale(20),
    color: '#cccccc',
    fontFamily: 'GeneralSans-Medium'
  },
});
