import React from 'react';
import {Text, View} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import {COLORS} from '../../constants/colors';
import {verticalScale} from '../../utils/metrics';

interface Props {
  title: string;
  description?: string;
  extraStyles?: any
}

const ScreenTitle = ({title, description,extraStyles}: Props) => {
  return (
    <View style={extraStyles}>
      <Text style={[STYLES.dev1__text28, {color: COLORS.neutral900,fontFamily:'Satoshi-Bold'}]}>
        {title}
      </Text>
      <Text
        style={[
          STYLES.dev1__text13,
          {
            fontWeight: '500',
            paddingTop: verticalScale(8),
            color: COLORS.neutral700,
            fontFamily: 'GeneralSans-Medium'
          },
        ]}>
        {description}
      </Text>
    </View>
  );
};

export default ScreenTitle;
