import {
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
  Platform,
} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import ScreenTitle from '../../components/shared-components/ScreenTitle';
import {COLORS} from '../../constants/colors';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import LinearGradient from 'react-native-linear-gradient';
import {useAppSelector} from '../../redux/app/hooks';
import {useState, useEffect} from 'react';
import {ApiService} from '../../utils/ApiService';
import Toast from 'react-native-toast-message';

const SOSNotifyScreen = () => {
  const [fullName, setFullName] = useState<string>('');
  const {data: user, tokens} = useAppSelector(state => state.user);

  // const user = useAppSelector((state: any) => state.user.data);
  useEffect(() => {
    setFullName(
      (user?.partner?.primary?.firstName
        ? user?.partner?.primary?.firstName
        : '') +
        ' ' +
        (user?.partner?.primary?.lastName
          ? user?.partner?.primary?.lastName
          : null),
    );

    return () => {};
  }, []);

  const handleSos = async (all = false) => {
    try {
      Toast.show({
        type: 'info',
        text1: 'Sending...',
        autoHide: true,
        visibilityTime: 800,
      });
      const sosReq = new ApiService(
        `user/sos?sendTo=${all ? 'all' : 'primary'}`,
        tokens.accessToken,
      );
      const sosRes = await sosReq.Post({});

      if (sosRes.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'SOS successful.',
        });
      }
      console.log('handleSos ~ sosRes:', sosRes);
    } catch (err) {
      console.log('~ handleSos ~ err:', err);
    }
  };

  return (
    <View style={[STYLES.dev1__container, {alignItems: 'center'}]}>
      <Text
        style={[
          STYLES.dev1__text28,
          {
            color: COLORS.neutral900,
            alignItems: 'center',
            textAlign: 'center',
            fontFamily: 'Satoshi-Bold',
          },
        ]}>
        Select Accountability Network To Notify
      </Text>
      <TouchableWithoutFeedback onPress={() => handleSos()}>
        <LinearGradient
          colors={['#99C077', '#73A34B']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.circleContainer}>
          <Text
            style={[
              STYLES.dev1__text48,
              {color: '#ffffff', fontFamily: 'GeneralSans-Semibold'},
            ]}>
            SOS
          </Text>
          <Text
            style={[
              STYLES.dev1__text15,
              {
                color: '#B6E58E',
                fontWeight: '100',
                fontFamily: 'GeneralSans-Bold',
              },
            ]}>
            {user?.partner?.primary?.firstName &&
            user?.partner?.primary?.lastName
              ? fullName
              : 'No primay partner'}
          </Text>
        </LinearGradient>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback onPress={() => handleSos(true)}>
        <LinearGradient
          colors={['#2791B5', '#7BEAFC']}
          start={{x: 0.5, y: 0}}
          end={{x: 0.5, y: 1}}
          locations={[0, Platform.OS === 'android' ? 1.4107 : 1]}
          angle={180}
          style={[
            styles.circleContainer,
            {borderColor: '#3CA7CA', marginTop: verticalScale(24)},
          ]}>
          <Text
            style={[
              STYLES.dev1__text48,
              {color: '#ffffff', fontFamily: 'GeneralSans-Semibold'},
            ]}>
            SOS
          </Text>
          <Text
            style={[
              STYLES.dev1__text15,
              {
                color: '#3CA7CA',
                fontWeight: '100',
                fontFamily: 'GeneralSans-Bold',
              },
            ]}>
            YOUR NETWORK
          </Text>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default SOSNotifyScreen;

const styles = StyleSheet.create({
  circleContainer: {
    marginTop: verticalScale(28),
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    borderRadius: 100,
    borderWidth: horizontalScale(10),
    borderColor: '#A4D17D',
  },
});
