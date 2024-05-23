import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import {COLORS} from '../../constants/colors';
import {Value} from 'react-native-reanimated';

interface Props {
  firstValue: string;
  secondValue: string;
  value: string;
  setValue: any;
  resetForValue?: () => void;
}

const CustomMetric = ({
  firstValue,
  secondValue,
  value,
  setValue,
  resetForValue,
}: Props) => {
  return (
    <View
      // activeOpacity={1}
      style={{
        height: 40,
        borderRadius: 200,
        width: 110,
        marginTop: 10,
        backgroundColor: COLORS.mainGreen,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
      }}>
      <TouchableOpacity
        style={{
          backgroundColor: value == firstValue ? 'white' : 'transparent',
          borderRadius: 100,
          width: 50,
          height: 30,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => {
          if (resetForValue) resetForValue();
          setValue(firstValue);
        }}>
        <Text
          style={{
            color: value == firstValue ? '#A8D283' : '#7B8D95',
            fontSize: 13,
            textAlign: 'center',
            textAlignVertical: 'center',
          }}>
          {firstValue}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          backgroundColor: value == secondValue ? 'white' : 'transparent',
          borderRadius: 100,
          width: 50,
          height: 30,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => {
          if (resetForValue) resetForValue();
          setValue(secondValue);
        }}>
        <Text
          style={{
            color: value == secondValue ? '#A8D283' : '#7B8D95',
            fontSize: 13,
            textAlign: 'center',
            textAlignVertical: 'center',
          }}>
          {secondValue}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomMetric;
