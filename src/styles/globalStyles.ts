import {StyleSheet} from 'react-native';
import {horizontalScale, moderateScale, verticalScale} from '../utils/metrics';
import { StatusBarHeight } from '../utils/StatusBarHeight';

export const STYLES = StyleSheet.create({
  dev1__container: {
    flex: 1,
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(10),
    paddingBottom: verticalScale(40),
    backgroundColor: '#F9FAFA',
  },
  dev1__homeContainer: {
    flex: 1,
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(10),
    paddingBottom: verticalScale(40),
    backgroundColor: '#F6F7F7',
    // marginTop: StatusBarHeight
  },
  dev1__text48: {
    fontSize: moderateScale(48),
    fontWeight: '600',
    lineHeight: verticalScale(64.9),
  },
  dev1__text34: {
    fontSize: moderateScale(34),
    fontWeight: '700',
    // lineHeight: verticalScale(41),
  },
  dev1__text28: {
    fontSize: moderateScale(28),
    // fontWeight: '700',
    // lineHeight: verticalScale(36),
  },
  dev1__text13: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    lineHeight: verticalScale(18),
  },
  dev1__text14: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    lineHeight: verticalScale(18),
  },
  dev1__text15: {
    fontSize: moderateScale(15),
    // fontWeight: '900',
    lineHeight: verticalScale(21),
  },
  dev1__text16: {
    fontSize: 16,
    fontWeight: '500',
    // lineHeight: verticalScale(18),
    color: 'black',
  },
  dev1__text18: {
    fontSize: moderateScale(18),
    fontWeight: '500',
    lineHeight: verticalScale(25),
  },
});
