import React, {useEffect, useRef, useState} from 'react';
import {View, Text} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import {STYLES} from '../../styles/globalStyles';
import Icon from 'react-native-vector-icons/Ionicons';
import {verticalScale} from '../../utils/metrics';
import {COLORS} from '../../constants/colors';

interface Props {
  defaultValue?: string;
  selectedValue?: string;
  values: string[];
  label: string;
  error?: string;
  styles?: object;
  backgroundColor?: string;
  width?: string | number;
  height?: number;
  initialTouched?: boolean;
  touched?: boolean;
  isIcon?: boolean;
  setCountry?: any;
  setFieldValue: (field: string, value: string) => void;
  fontColor?: string;
  fieldName: string;
  defaultScrolledPosition?: number;
  setFieldError: (field: string, value: string) => void;
}

export const CustomSelect: React.FC<Props> = ({
  defaultValue,
  label,
  selectedValue,
  values,
  error,
  backgroundColor,
  width,
  height,
  isIcon = true,
  setFieldValue,
  touched,
  setCountry,
  styles,
  fontColor,
  fieldName,
  setFieldError,
  defaultScrolledPosition = 0,
}) => {
  const field = label.toLowerCase().replace(/\s/g, '');
  const [item, setItem] = useState('');

  const drpDwnRef: any = useRef({});

  const handleFocus = () => {
    if (touched && error) {
      setFieldError(fieldName, '');
    }
  };

  useEffect(() => {
    // drpDwnRef.current.selectIndex(30);
    if (selectedValue === undefined) {
      drpDwnRef.current.reset();
      setItem('');
    }
  }, [selectedValue]);

  return (
    <View style={[{gap: 8}, styles]}>
      {item != '' && (
        <Text
          style={{
            position: 'absolute',
            top: 6,
            fontSize: 11,
            left: 17,
            zIndex: 2,
            color: '#000',
          }}>
          {label}
        </Text>
      )}
      <SelectDropdown
        defaultScrolledPosition={
          defaultScrolledPosition > 3 ? defaultScrolledPosition - 3 : 0
        }
        data={values ? values : ['Loading...']}
        ref={drpDwnRef}
        onSelect={(selectedItem, index) => {
          if (typeof selectedItem === 'string' && fieldName === 'height') {
            selectedItem = parseFloat(selectedItem.replace("'", '.'));
          }
          setFieldValue(field, selectedItem);
          setCountry && setCountry(selectedItem);
          setItem(selectedItem);
        }}
        renderDropdownIcon={() =>
          isIcon && <Icon name="chevron-down-outline" color="grey" size={24} />
        }
        dropdownStyle={{borderRadius: 12}}
        // search
        // searchPlaceHolder={'Search here'}
        // searchPlaceHolderColor={'#000'}
        defaultButtonText={defaultValue ? defaultValue : 'Select'}
        rowTextStyle={{color: '#9B9B9B', position: 'absolute', left: 0}}
        selectedRowTextStyle={{color: 'black', position: 'absolute', left: 0}}
        selectedRowStyle={{
          backgroundColor: '#F3F3F3',
          borderRadius: 4,
          marginVertical: 2,
          borderWidth: 0,
        }}
        rowStyle={{borderBottomWidth: 0, backgroundColor: '#FBFBFB'}}
        buttonTextStyle={{
          fontSize: 14,
          color: fontColor ? fontColor : '#000000',
          textAlign: 'left',
        }}
        onFocus={handleFocus}
        buttonStyle={{
          height: 57,
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderRadius: 12,
          borderColor:
            (error && !values) || (error && touched)
              ? COLORS.error
              : COLORS.neutral200,
          width: width ? width : 108,
        }}
      />
      {(error && !values) || (error && touched) ? (
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 2}}>
          <Icon name="alert-circle" size={22} color="red" />
          <Text
            style={[STYLES.dev1__text13, {fontWeight: '400', color: '#000'}]}>
            {error}
          </Text>
        </View>
      ) : (
        <View style={{height: 25}} />
      )}
    </View>
  );
};
