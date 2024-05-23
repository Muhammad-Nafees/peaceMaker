import React, {useState, useEffect} from 'react';
import {Animated} from 'react-native';

const AnimatedMarginView = ({style, marginBottom, children}) => {
  const [marginBottomValue] = useState(new Animated.Value(marginBottom));

  useEffect(() => {
    animateMarginBottom(marginBottom);
  }, [marginBottom]);

  const animateMarginBottom = toValue => {
    Animated.spring(marginBottomValue, {
      toValue,
      useNativeDriver: false, // <- fix this, this causes animation to be run on js thread instead of ui thread
    }).start();
  };

  const animatedStyle = {
    marginBottom: marginBottomValue,
  };

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
};

export default AnimatedMarginView;
