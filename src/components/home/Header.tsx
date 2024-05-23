import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {STYLES} from '../../styles/globalStyles';
import {COLORS} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Octicons';
import ChatIcon from 'react-native-vector-icons/Ionicons';

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../interface/types';
import {useAppSelector} from '../../redux/app/hooks';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'SOSNotifyScreen'
>;

const Header = () => {
  const navigation = useNavigation<NavigationProp>();
  const user = useAppSelector((state: any) => state.user.data);

  let firstInitial = JSON.stringify(user.firstName)?.charAt(1).toUpperCase();
  let secondInitial = JSON.stringify(user.lastName)?.charAt(1).toUpperCase();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.profileNameContainer}>
        <Text
          style={[
            {
              color: '#2791B5',
              fontFamily: 'GeneralSans-Medium',
              fontSize: 16,
              fontWeight: '500',
            },
          ]}>
          {firstInitial}
          {secondInitial}
        </Text>
      </View>
      <LinearGradient
        colors={['#2791B5', '#7BEAFC']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.SOSContainer}>
        <Text
          style={[
            STYLES.dev1__text15,
            {color: COLORS.primary300, fontFamily: 'Satoshi-Black'},
          ]}
          onPress={() => {
            navigation.navigate('SOSNotifyScreen'), console.log('d');
          }}>
          SOS
        </Text>
      </LinearGradient>
      <View
        style={{
          flexDirection: 'row',
          gap: verticalScale(20),
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Messages');
          }}>
          <ChatIcon
            name="chatbubble-ellipses"
            size={28}
            color={COLORS.primary300}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('NotificationScreen')}>
          <Icon name="bell-fill" size={24} color={COLORS.primary300} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  profileNameContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A4DAD2',
  },
  SOSContainer: {
    width: horizontalScale(71),
    height: verticalScale(31),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(100),
    borderWidth: horizontalScale(2),
    borderColor: '#4398B2',
    marginLeft: horizontalScale(20),
  },
});
