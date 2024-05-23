import { useRef, useEffect } from 'react';
import { Animated, Keyboard } from 'react-native';

export const useKeyboardHeight = () => {
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardWillShow = (e) => {
      Animated.timing(keyboardHeight, {
        duration: e.duration,
        toValue: e.endCoordinates.height,
        useNativeDriver: true,
      }).start();
    };

    const keyboardWillHide = (e) => {
      Animated.timing(keyboardHeight, {
        duration: e.duration,
        toValue: 0,
        useNativeDriver: true,
      }).start();
    };

    const keyboardWillShowSub = Keyboard.addListener(
      'keyboardWillShow',
      keyboardWillShow
    );
    const keyboardWillHideSub = Keyboard.addListener(
      'keyboardWillHide',
      keyboardWillHide
    );

    return () => {
      keyboardWillHideSub.remove();
      keyboardWillShowSub.remove();
    };
  }, [keyboardHeight]);

  return keyboardHeight;
};