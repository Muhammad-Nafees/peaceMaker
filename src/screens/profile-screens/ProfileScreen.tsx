import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {COLORS} from '../../constants/colors';
import DailyState from '../../components/home/DailyState';
import ProfileHeader from '../../components/profile/Header';
import Icon from 'react-native-vector-icons/Feather';

import Navigation from '../../utils/appNavigation';
import {useAppSelector} from '../../redux/app/hooks';

const ProfileScreen = () => {
  const user = useAppSelector((state: any) => state.user.data);
  const deviceName = useAppSelector(state => state.extra.deviceName);

  return (
    <ScrollView style={{ backgroundColor: '#f9fafa'}} showsVerticalScrollIndicator={false}>
      <View style={[STYLES.dev1__homeContainer, {backgroundColor: '#f9fafa'}]}>
        <ProfileHeader />

        <View style={styles.box1}>
          <View style={styles.box1NameBox}>
            <Text style={styles.box1NameBoxTxt}>
              {user.firstName?.slice(0, 1).toUpperCase()}
              {user.lastName?.slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={styles.box1NameInfo}>
            <Text style={styles.box1NameInfoTitle}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.box1NameInfoSubtitle}>{deviceName}</Text>
          </View>
          <TouchableWithoutFeedback
            onPress={() =>
              Navigation.navigate('DailyStateScreen', {backToProfile: true})
            }>
            <View style={styles.box1ImageBox}>
              <Image
                style={styles.box1Image}
                source={require('../../../assets/images/to-do-list.png')}
              />
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: '700',
                  color: COLORS.mainGreen,
                  marginTop: 2,
                }}>
                DAILY
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>

        <View
          style={{
            height: 103,
            borderRadius: moderateScale(15),
            backgroundColor: '#fdfdfd',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 32,
            marginBottom: 15,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.18,
            shadowRadius: 1.0,

            elevation: 1,
          }}>
          <TouchableWithoutFeedback
            onPress={() => Navigation.navigate('AccountablityNetwork')}>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Image
                style={{width: 55, height: 55}}
                source={require('../../../assets/images/collaborate.png')}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '500',
                  color: '#2791B5',
                  marginTop: 5,
                }}>
                Accountability Network
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>

        <View style={styles.dailyStateContainer}>
          <DailyState isDrpDwn />
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  box1: {
    flexDirection: 'row',
    alignItems: 'center',
    // height: verticalScale(55),
    marginTop: 10,
  },
  box1NameBox: {
    width: 55,
    height: 55,
    borderRadius: 50,
    backgroundColor: '#EAF3E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box1NameBoxTxt: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: '#15141F',
  },
  box1NameInfo: {height: '100%', flex: 1, marginLeft: horizontalScale(16)},
  box1NameInfoTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#15141F',
    textTransform: 'capitalize',
  },
  box1NameInfoSubtitle: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: '#576B74',
    textTransform: 'capitalize',
  },
  box1ImageBox: {
    width: 48,
    height: 48,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAF3E2',
    paddingVertical: 5,
  },
  box1Image: {width: horizontalScale(20), height: verticalScale(20)},
  dailyStateContainer: {
    marginTop: verticalScale(16),
    borderRadius: moderateScale(13),
    paddingVertical: verticalScale(18),
    paddingHorizontal: horizontalScale(8),
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
  },
});
