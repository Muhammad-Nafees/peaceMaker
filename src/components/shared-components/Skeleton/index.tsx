import React, {useEffect, useRef} from 'react';
import {Animated, StyleProp, StyleSheet, ViewStyle} from 'react-native';

interface Props {
  width: string | number;
  height: string | number;
  radius: number;
  style?: StyleProp<ViewStyle>;
}

export default function Skeleton({width, height, radius, style}: Props) {
  const opacity = useRef(new Animated.Value(0.3));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity.current, {
          toValue: 1,
          useNativeDriver: true,
          duration: 500,
        }),
        Animated.timing(opacity.current, {
          toValue: 0.3,
          useNativeDriver: true,
          duration: 800,
        }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          opacity: opacity.current,
          width,
          height,
          borderRadius: radius,
        },
        styles.skeleton,
        style,
      ]}></Animated.View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'lightgray',
  },
});
