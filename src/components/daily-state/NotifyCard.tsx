import React, {useState} from 'react';
import {StyleSheet, View, Text, Switch} from 'react-native';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {COLORS} from '../../constants/colors';
import {STYLES} from '../../styles/globalStyles';
import Icon from 'react-native-vector-icons/Ionicons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import ToggleSwitch from '../profile/IOSToggle';
import {TouchableWithoutFeedback} from 'react-native';

interface Props {
  extraStyles?: any;
  content: any;
  switchValue: boolean;
  setSwitchValue: any;
  iconName?: string;
  value?: any;
  onPress?: () => void;
}

const NotifyCard = ({
  extraStyles = {},
  content,
  iconName,
  switchValue,
  setSwitchValue,
  value,
  onPress,
}: Props) => {
  return (
    <TouchableWithoutFeedback style={{width: '100%'}} onPress={onPress}>
      <View style={[styles.notifyInnerContainer, extraStyles]}>
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
            maxWidth: "70%"
          }}>
          {iconName && (
            <View
              style={{
                padding: 5,
                backgroundColor: '#EAF3E2',
                borderRadius: moderateScale(10),
              }}>
              {iconName == 'calendar' ? (
                <FeatherIcon
                  name={iconName}
                  size={24}
                  color={COLORS.mainGreen}
                />
              ) : (
                <Icon name={iconName} size={24} color={COLORS.mainGreen} />
              )}
            </View>
          )}
          <View>
            <Text
              style={[
                STYLES.dev1__text13,
                {
                  fontWeight: '500',
                  fontFamily: 'GeneralSans-Medium',
                  color: '#7B8D95',
                },
              ]}>
              {' '}
              {content}
            </Text>
            {value && (
              <Text
                style={[
                  STYLES.dev1__text13,
                  {
                    fontWeight: '500',
                    fontFamily: 'GeneralSans-Medium',
                    color: COLORS.primary400,
                    width: horizontalScale(200),
                    paddingLeft: horizontalScale(3),
                  },
                ]}>
                {value}
              </Text>
            )}
          </View>
        </View>
        <ToggleSwitch
          isOn={switchValue}
          onColor="#8eb26f"
          offColor="#e7eaeb"
          size="medium"
          onToggle={(isOn: boolean) => setSwitchValue(isOn)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default NotifyCard;

const styles = StyleSheet.create({
  notifyInnerContainer: {
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
});
