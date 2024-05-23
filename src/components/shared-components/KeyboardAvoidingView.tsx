import React from 'react';
import {KeyboardAvoidingView, Platform} from 'react-native';

export default function AppKeyboardAvoidingView({
  children,
  verticalOffset = 40, bg = "white"}: { children: any; verticalOffset?: number;bg?: string;}) {
  return Platform.OS === 'android' ? (
    <>{children}</>
  ) : (
    <KeyboardAvoidingView
      keyboardVerticalOffset={verticalOffset}
      behavior={'padding'}
      style={{flex: 1, backgroundColor: bg}}>
      {children}
    </KeyboardAvoidingView>
  );
};
