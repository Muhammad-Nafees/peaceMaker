import React from 'react';
import {Keyboard} from 'react-native';

export const useIsKeyboardShowing = () => {
    const [isKeyboardShowing, setIsKeyboardShowing] = React.useState(false);
  
    React.useEffect(() => {
      const keyboardDidShow = e => {
        setIsKeyboardShowing(true);
      };
  
      const keyboardDidHide = () => {
        setIsKeyboardShowing(false);
      };
  
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        keyboardDidShow,
      );
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        keyboardDidHide,
      );
  
      return () => {
        keyboardDidHideListener.remove();
        keyboardDidShowListener.remove();
      };
    }, []);
  
    return isKeyboardShowing;
  };