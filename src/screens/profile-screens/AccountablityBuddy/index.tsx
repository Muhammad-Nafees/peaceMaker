import React from 'react';
import {
  Image,
  Text,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import ToggleSwitch from '../../../components/profile/IOSToggle';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../../utils/metrics';
import DailyState from '../../../components/home/DailyState';
import CustomButton from '../../../components/shared-components/CustomButton';
import Navigation from '../../../utils/appNavigation';
import {User, UserNotif} from '../../../interface/types';
// import Toast from 'react-native-toast-message';
import {ApiService} from '../../../utils/ApiService';
import {useAppDispatch, useAppSelector} from '../../../redux/app/hooks';
import ProfilePicture from '../../../components/shared-components/ProfilePic';
import {setUserData} from '../../../redux/features/user/userSlice';
import Toast from 'react-native-root-toast';
import {COLORS} from '../../../constants/colors';

export default function AccountablityBuddy({route}: any) {
  const [switchValue, setSwitchValue] = React.useState(false);
  const [switchValue1, setSwitchValue1] = React.useState(false);
  const [switchValue2, setSwitchValue2] = React.useState(false);
  const [loading, setLoading] = React.useState(false);


  const buddyId = route.params?.id;

  const goodProgress = React.useRef(switchValue);
  goodProgress.current = switchValue;

  const badProgress = React.useRef(switchValue1);
  badProgress.current = switchValue1;

  const beNotified = React.useRef(switchValue2);
  beNotified.current = switchValue2;

  const notifData: UserNotif | undefined = route.params?.notifData;

  const {tokens, data: user} = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();

  const updateBuddyStatus = async () => {
    try {
      const buddyStatusReq = new ApiService(
        'user/update-buddy',
        tokens.accessToken,
      );
      const buddyStatusRes = await buddyStatusReq.Put({
        buddy: buddyId,
        goodProgress: goodProgress.current,
        badProgress: badProgress.current,
        beNotified: beNotified.current,
      });
      console.log(' ~ updateBuddyStatus ~ buddyStatusRes:', buddyStatusRes);
      handleToggle(
        goodProgress.current,
        badProgress.current,
        beNotified.current,
      );
    } catch (error) {
      console.log(
        '🚀 ~ file: index.tsx:59 ~ updateBuddyStatus ~ error:',
        error,
      );
    }
  };

  const handleToggle = (
    toggle1?: boolean,
    toggle2?: boolean,
    toggle3?: boolean,
  ) => {
    const userData = {...user};

    const userBuddy = userData.buddies.findIndex(b => b._id === buddyId);

    if (toggle1 !== undefined)
      userData.buddies[userBuddy].goodProgress = toggle1;
    if (toggle2 !== undefined)
      userData.buddies[userBuddy].badProgress = toggle2;
    if (toggle3 !== undefined) userData.buddies[userBuddy].beNotified = toggle3;

    dispatch(setUserData({...userData, userType: user.userType}));
  };

  const getNotifData = async () => {
    try {
      setLoading(true);
      const req = new ApiService('user', '');
      const res = await req.GetByBody(user._id);
      console.log('userDataGet2', res);

      if (res?.status === 200 && res?.data) {
        const userData = res?.data;
        const userBuddy: User = userData?.buddies.find(
          (b: User) => b.buddy._id === route.params?.id,
        );
        setSwitchValue(userBuddy.goodProgress);
        setSwitchValue1(userBuddy.badProgress);
        setSwitchValue2(userBuddy.beNotified);
      }
      setLoading(false);
    } catch (error) {
      console.log('~ getUserData ~ error:', error);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getNotifData();
    if (notifData) {
      setSwitchValue(notifData.goodProgress);
      setSwitchValue1(notifData.badProgress);
      setSwitchValue2(notifData.beNotified);
    }
    return () => {
      updateBuddyStatus();
    };
  }, []);

  const loader = (): any => (
    <View
      style={{
        backgroundColor: 'transparent',
        opacity: 1,
        paddingTop: 15,
      }}>
      <ActivityIndicator color={COLORS.mainGreen} size={30} />
    </View>
  );
  return (
    <ScrollView style={{flex: 1, backgroundColor: '#F9FAFA'}}>
      {loading && (
        <Toast
          visible={loading}
          position={Toast.positions.TOP}
          shadow={false}
          animation={true}
          // hideOnPress={true}
          delay={0}
          opacity={1}
          backgroundColor="transparent">
          {loader()}
        </Toast>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 20,
        }}>
        <ProfilePicture
          firstName={route.params?.fname}
          lastName={route.params?.lname}
          photo={route.params?.photo}
          size={43}
        />
        {/* <Image
          style={{width: 47, height: 47, borderRadius: 50}}
          source={{
            uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80',
          }}
        /> */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: '#15141F',
            marginLeft: 8,
          }}>
          {route.params.name}
        </Text>
      </View>

      <View style={{height: 24}} />

      <View style={styles.notificationsettingcontainer}>
        <Text style={styles.notificationsettingtxt}>
          Notify me when there is good progress
        </Text>

        <ToggleSwitch
          isOn={switchValue}
          onColor="#8eb26f"
          offColor="#e7eaeb"
          size="medium"
          onToggle={(isOn: boolean) => {
            setSwitchValue(isOn);
            // handleToggle(isOn, undefined, undefined);
          }}
        />
      </View>
      <View style={styles.notificationsettingcontainer}>
        <Text style={styles.notificationsettingtxt}>
          Notify me when there is bad progress
        </Text>

        <ToggleSwitch
          isOn={switchValue1}
          onColor="#8eb26f"
          offColor="#e7eaeb"
          size="medium"
          onToggle={(isOn: boolean) => {
            setSwitchValue1(isOn);
            // handleToggle(undefined, isOn, undefined);
          }}
        />
      </View>
      <View style={styles.notificationsettingcontainer}>
        <Text style={styles.notificationsettingtxt}>Be Notified</Text>

        <ToggleSwitch
          isOn={switchValue2}
          onColor="#8eb26f"
          offColor="#e7eaeb"
          size="medium"
          onToggle={(isOn: boolean) => {
            setSwitchValue2(isOn);
            // handleToggle(undefined, undefined, isOn);
          }}
        />
      </View>

      <View style={styles.dailyStateContainer}>
        <DailyState userID={route.params.id} />
      </View>

      <CustomButton
        extraStyles={{
          marginTop: verticalScale(32),
          marginBottom: verticalScale(66),
          marginHorizontal: 16,
        }}
        onPress={() =>
          Navigation.navigate('WeeklySummary', {
            userid: buddyId,
            name: route.params.name,
          })
        }
        // isDisabled={loginLoading}
      >
        Weekly Summary
      </CustomButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  notificationsettingcontainer: {
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 16,
    paddingHorizontal: 17,
    marginBottom: 10,
    paddingVertical: 5,
  },
  notificationsettingtxt: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.5,
    color: '#7B8D95',
    flex: 1,
    paddingRight: 5,
  },
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
    marginHorizontal: 16,
  },
});
