import React, {useEffect} from 'react';
import {Image, Text, View, StyleSheet} from 'react-native';
import {COLORS} from '../../constants/colors';
import {STYLES} from '../../styles/globalStyles';
import CustomButton from '../../components/shared-components/CustomButton';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import FastImage from 'react-native-fast-image';
import {ApiService} from '../../utils/ApiService';
import {useAppSelector} from '../../redux/app/hooks';
import moment from 'moment-timezone';

interface Props {
  navigation: any;
}

const CompleteProfileScreen = ({navigation}: Props) => {
  const {tokens} = useAppSelector(state => state.user);
  const user = useAppSelector((state: any) => state.user.data);

  useEffect(() => {
    const initialNotifiedPost = async () => {
      try {
        const beNotified = new ApiService(`be-notified`, tokens.accessToken);

        const userTimeZone = moment.tz.guess();
        const reqData = {
          timezone: userTimeZone,
          userId: user._id,
          defaultTime: [
            {
              time: '7:00 AM',
              isEnable: true,
            },
            {
              time: '12:00 PM',
              isEnable: true,
            },
            {
              time: '08:00 PM',
              isEnable: true,
            },
          ],
          manualDate: null,
          manualTime: null,
          locationAddress: user.userLocation === '' ? null : user.userLocation,
          location: {
            coordinates: [67.22, 97.222],
          },
        };
        console.log(reqData, 'ss');

        const res = await beNotified.Post(reqData);

        console.log('🚀~ reqData:', reqData);

        console.log(
          '🚀 ~ file: BeNotifiedScreen.tsx:244 ~ handleDailyStateBeNotified ~ res:',
          res,
        );
      } catch (error) {
        console.log('🚀 ~ handleDailyStateBeNotified ~ error:', error);
      }
    };
    initialNotifiedPost();
  }, []);
  return (
    <View style={[STYLES.dev1__container, {justifyContent: 'space-between'}]}>
      <View>
        <Text
          style={[
            STYLES.dev1__text28,
            {
              color: COLORS.neutral900,
              textAlign: 'center',
              fontFamily: 'GeneralSans-Semibold',
            },
          ]}>
          Profile Completed!
        </Text>
        <Text
          style={[
            STYLES.dev1__text13,
            {
              color: COLORS.neutral700,
              fontWeight: '500',
              marginTop: verticalScale(8),
              textAlign: 'center',
            },
          ]}>
          You’ve successfully completed your onboarding process, See you inside!
        </Text>
      </View>
      <View style={{flex: 1, alignSelf: 'center', justifyContent: 'center'}}>
        <Image source={require('../../../assets/images/amico.png')} alt="img" />
      </View>
      <View>
        <CustomButton
          onPress={() => {
            navigation.navigate('LoadingScreen');
          }}>
          Done
        </CustomButton>
      </View>
    </View>
  );
};

export default CompleteProfileScreen;
const styles = StyleSheet.create({
  image: {
    width: horizontalScale(313),
    height: verticalScale(345),
  },
});
