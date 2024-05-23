/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Text} from 'react-native';
import {View} from 'react-native';

export type RulerPickerItemProps = {
  /**
   * Gap between steps
   *
   * @default 10
   */
  gapBetweenSteps: number;
  /**
   * Height of the short step
   *
   * @default 20
   */
  shortStepHeight: number;
  /**
   * Height of the long step
   *
   * @default 40
   */
  longStepHeight: number;
  /**
   * Width of the steps
   *
   * @default 2
   */
  stepWidth: number;
  /**
   * Color of the short steps
   *
   * @default 'lightgray'
   */
  shortStepColor: string;
  /**
   * Color of the long steps
   *
   * @default 'gray'
   */
  longStepColor: string;
};

type Props = {
  index: number;
  isLast: boolean;
} & RulerPickerItemProps;

export const RulerPickerItem = React.memo(
  ({
    isLast,
    index,
    gapBetweenSteps,
    shortStepHeight,
    longStepHeight,
    stepWidth,
    shortStepColor,
    longStepColor,
  }: Props) => {
    const isLong = index % 10 === 0;
    const isMedium = index % 5 === 0;
    const height = isLong || isMedium ? longStepHeight : shortStepHeight;

    return (
      <View >
        <View
          style={[
            {
              width: stepWidth,
              height: '100%',
              justifyContent: 'center',
              marginRight: isLast ? 0 : gapBetweenSteps,
            },
          ]}>
          <View
            style={[
              {
                width: '100%',
                height: height,
                backgroundColor: isLong ? longStepColor : shortStepColor,
                marginTop: isLong ? -0 : 0,
              },
            ]}
          />
        </View>
        {isMedium && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 40,
              alignItems: 'center',
              // backgroundColor: "red",
              // width: "100%",
              marginRight: -10
            }}>
            <Text
              style={{
                color: '#9C9EB9',
                fontSize: isLong ? 16 : 12,
                fontWeight: '500',
                marginBottom: isLong ? 0: 2
              }}>
              {index}
            </Text>
          </View>
        )}
      </View>
    );
  },
);
