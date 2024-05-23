import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const LocationPinIcon = () => {
  return (
    <View>
      <Svg width={22} height={21} viewBox="0 0 22 21" fill="none">
        <Path
          d="M15 11.3744C18.5318 12.0688 21 13.6547 21 15.5C21 17.9853 16.5228 20 11 20C5.47715 20 1 17.9853 1 15.5C1 13.6547 3.46819 12.0688 7 11.3744M11 15V7M11 7C12.6569 7 14 5.65685 14 4C14 2.34315 12.6569 1 11 1C9.34315 1 8 2.34315 8 4C8 5.65685 9.34315 7 11 7Z"
          stroke="#8EB26F"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

export default LocationPinIcon;
