import React, {ReactNode} from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {COLORS} from '../../constants/colors';
import {moderateScale, verticalScale} from '../../utils/metrics';

interface Props {
  children: ReactNode;
  isDisabled?: boolean;
  extraStyles?: any;
  buttonTextStyle?: any;
  onPress?: () => void;
  disabledTxtOpacity?: number;
  isLoading?: boolean;
}

const CustomButton = ({
  children,
  extraStyles,
  buttonTextStyle,
  isDisabled,
  onPress,
  disabledTxtOpacity = 0.3,
  isLoading,
}: Props) => {
  return (
    <Pressable
      style={({pressed}) => pressed && styles.pressed}
      onPress={isDisabled ? () => null : onPress}
      disabled={isDisabled}>
      <View
        style={[
          isDisabled ? styles.disabledButton : styles.button,
          extraStyles,
        ]}>
        <Text
          style={[
            styles.buttonText,
            buttonTextStyle,
            isDisabled && {
              ...styles.disabledButtonText,
              opacity: disabledTxtOpacity,
            },
          ]}>
          {isLoading ? (
            <ActivityIndicator color="#8eb26f" size={22} />
          ) : (
            children
          )}
        </Text>
      </View>
    </Pressable>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    marginTop: verticalScale(40),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
    backgroundColor: '#CCF593',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    marginTop: verticalScale(40),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
    backgroundColor: COLORS.neutral200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#134555',
    fontSize: moderateScale(16),
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'GeneralSans-Semibold',
  },
  disabledButtonText: {
    opacity: 0.3,
  },
  pressed: {
    opacity: 0.75,
  },
});
