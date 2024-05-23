import {useState} from 'react';
import Icon from 'react-native-vector-icons/Octicons';
import AlertIcon from 'react-native-vector-icons/Ionicons';

import {Image, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';
import {Text, TextInput} from 'react-native-paper';
import {COLORS} from '../../constants/colors';
import {horizontalScale, verticalScale} from '../../utils/metrics';

interface Props {
  placeholder: string;
  label?: string;
  isIcon?: boolean;
  isCancel?: boolean;
  value: string | any;
  error?: string;
  editable?: boolean;
  touched: boolean | undefined;
  initialTouched?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'numeric' | 'email-address';
  isSubmitted?: boolean;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  showPlaceHolderWhileTyping?: boolean;
  showLabelOnFocus?: boolean;
  inActiveColor?: string;
}

const CustomInput = ({
  placeholder,
  label,
  value,
  error,
  touched,
  initialTouched,
  keyboardType,
  autoCapitalize,
  onChange,
  isIcon,
  isCancel,
  editable,
  isSubmitted,
  disabled = false,
  showPlaceHolderWhileTyping = false,
  showLabelOnFocus = false,
  inActiveColor = '#94A5AB',
  onFocus = () => null,
}: Props) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const theme = {
    colors: {
      onSurfaceVariant:
        showLabelOnFocus && value && !isFocused
          ? inActiveColor
          : COLORS.neutral900,
      text: COLORS.neutral900,
      placeholder: COLORS.neutral500,
      primary: error && initialTouched ? COLORS.error : COLORS.primary400,
    },
    roundness: 12, // Border radius value
  };

  const handleChangeText = (text: string) => {
    onChange(text);
  };

  const handleInputFocus = () => {
    onFocus();
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
  };

  const inputStyle = {
    ...styles.innerContainer,
    backgroundColor: disabled ? '#eeeeee' : '#ffffff',
    borderWidth: disabled ? 0 : 1,
    borderColor: isFocused
      ? COLORS.neutral200
      : touched && error
      ? COLORS.error
      : COLORS.neutral200,
  };

  return (
    <View style={styles.inputContainer}>
      <View>
        <TextInput
          // disabled={disabled}
          placeholderTextColor={'#94A5AB'}
          style={[inputStyle, isFocused && styles.isFocused]}
          placeholder={
            isFocused && !showPlaceHolderWhileTyping ? '' : placeholder
          }
          label={showLabelOnFocus ? (isFocused ? label : '') : label}
          // label={label}
          value={value}
          autoCapitalize={autoCapitalize}
          secureTextEntry={isIcon && !passwordVisible}
          keyboardType={keyboardType}
          outlineColor={COLORS.primary400}
          underlineColor={'transparent'}
          theme={theme}
          onChangeText={handleChangeText}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          editable={editable}
        />
      </View>

      {error && ((touched && !value) || (error && value) || isFocused) ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
            marginTop: verticalScale(1),
            marginRight: 30,
          }}>
          <AlertIcon name="alert-circle" size={22} color="red" />
          <Text style={{fontFamily: 'Satoshi-Medium'}}>{error}</Text>
        </View>
      ) : (
        <View style={{height: 20}} />
      )}

      {isIcon && (
        <TouchableWithoutFeedback onPress={togglePasswordVisibility}>
          <Image
            source={
              !passwordVisible
                ? require('../../../assets/icons/fa-eye.png')
                : require('../../../assets/icons/eye.png')
            }
            alt="icon"
            resizeMode="contain"
            style={[styles.image]}
          />
        </TouchableWithoutFeedback>
      )}
      {isCancel && value?.length > 0 && isFocused && (
        <TouchableWithoutFeedback onPress={() => onChange('')}>
          <Icon
            name="x-circle-fill"
            size={22}
            color={COLORS.primary500}
            style={{
              opacity: 0.4,
              position: 'absolute',
              right: horizontalScale(16),
              top: verticalScale(22),
            }}></Icon>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
  },
  innerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    // marginRight: 20,
  },
  isFocused: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary400,
  },
  image: {
    position: 'absolute',
    right: horizontalScale(17),
    top: verticalScale(23),
    width: 20,
    height: 18
  },
});
