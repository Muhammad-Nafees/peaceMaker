import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home-screens';
import ChallengeScreen from '../screens/challenge-screens';
import JournalScreen from '../screens/journal-screens';
import DailyStateScreen from '../screens/dailystate-screens';
import ProfileScreen from '../screens/profile-screens/ProfileScreen';
import {verticalScale} from '../utils/metrics';
import Icon from 'react-native-vector-icons/Ionicons';
import FeatherIcon from 'react-native-vector-icons/Feather';

import {COLORS} from '../constants/colors';
import {View, Text, Image} from 'react-native';
import {useAppDispatch, useAppSelector} from '../redux/app/hooks';
import {useEffect} from 'react';
import {ApiService} from '../utils/ApiService';
import {setUserData} from '../redux/features/user/userSlice';
import socketServcies from '../utils/socketServices';

const Tab = createBottomTabNavigator();

type IconComponent = {
  [key: string]: React.ComponentType<any>;
};

// const NoScreen = () => <></>;
const iconComponents: IconComponent = {
  icon: Icon,
  feather: FeatherIcon,
};

type FocusedImages = {
  [key: string]: any;
};

const tabBarImagesFocused: FocusedImages = {
  Home: require('../../assets/icons/Home.png'),
};

const tabBarImagesUnfocused: FocusedImages = {
  Home: require('../../assets/icons/unfocusedHome.png'),
};

const MainTabNavigator = () => {
  const user = useAppSelector(state => state.user.data);

  const fullName = user.firstName
    ? user?.firstName?.slice(0, 1).toUpperCase() +
      user?.lastName?.slice(0, 1).toUpperCase()
    : '';

  const dispatch = useAppDispatch();

  const tabBarIcon = (
    iconLib: string | undefined,
    focused: boolean,
    iconname?: string,
    focusedIconname?: string,
    image?: string,
  ) => {
    const IconName = iconComponents[iconLib || 'icon'];
    return (
      <View
        style={{
          width: '100%',
          height: '100%', 
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 5,
          borderTopColor: COLORS.mainGreen,
          borderTopWidth: focused ? 4 : 0,
        }}>
        {iconname ? (
          <IconName
            name={focused ? iconname : focusedIconname ?? iconname}
            size={18}
            color={focused ? COLORS.mainGreen : COLORS.inActive}
            style={{marginTop: -verticalScale(12)}}
          />
        ) : image ? (
          <Image
            resizeMode="contain"
            style={{
              width: 18,
              height: 18,
              tintColor: !focused ? COLORS.inActive : COLORS.mainGreen,
            }}
            source={
              focused
                ? tabBarImagesFocused[image]
                : tabBarImagesUnfocused[image]
            }
          />
        ) : (
          <View
            style={{
              width: 21,
              height: 21,
              borderRadius: 50,
              backgroundColor: focused ? COLORS.mainGreen : COLORS.inActive,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -verticalScale(12),
            }}>
            <Text
              style={{
                fontSize: 9,
                fontWeight: '600',
                color: 'white',
              }}>
              {fullName}
            </Text>
          </View>
        )}
      </View>
    );
  };

  useEffect(() => {

    const getUserData = async () => {
      console.log('userID:' + user._id);

      try {
        const register = new ApiService('user', '');
        const response = await register.GetByBody(user._id);
        console.log('userDataGet1', response);

        if (response?.status === 200 && response?.data) {
          const userData = response?.data;
          const userBuddies = response?.data?.buddies?.map((b: any) => ({
            ...b?.buddy,
            goodProgress: b.goodProgress,
            badProgress: b.badProgress,
            beNotified: b.beNotified,
          }));
          userData.buddies = userBuddies;
          dispatch(setUserData({...userData, userType: user.userType}));
        }
      } catch (error) {
        console.log(
          '🚀 ~ file: MainTabNavigator.tsx:56 ~ getUserData ~ error:',
          error,
        );
      }
    };

    getUserData();
  }, []);

  return (
    <Tab.Navigator
      backBehavior={'history'}
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        tabBarActiveTintColor: COLORS.primary500,
        tabBarInactiveTintColor: COLORS.inActive,
        tabBarStyle: {
          backgroundColor: '#F1F1F1',
          minHeight: 80,
          // paddingTop: 20,
          paddingBottom: 20,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabelPosition: 'below-icon',
          tabBarIcon: ({focused}) =>
            tabBarIcon(undefined, focused, undefined, 'home-outline', 'Home'),
        }}
      />
      <Tab.Screen
        name="Challenge"
        // component={NoScreen}
        component={ChallengeScreen}
        options={{
          tabBarLabelPosition: 'below-icon',
          tabBarIcon: ({focused}) =>
            tabBarIcon(undefined, focused, 'flash', 'flash-outline'),
        }}
      />
      <Tab.Screen
        name="Journal"
        // component={NoScreen}
        component={JournalScreen}
        options={{
          tabBarLabelPosition: 'below-icon',
          tabBarIcon: ({focused}) => tabBarIcon('feather', focused, 'edit-3'),
        }}
      />
      <Tab.Screen
        name="DailyStateScreen"
        component={DailyStateScreen}
        // component={NoScreen}
        options={() => {
          return {
            tabBarLabelPosition: 'below-icon',
            title: 'Daily State',
            tabBarIcon: ({focused}) =>
              tabBarIcon('feather', focused, 'calendar'),
          };
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        // component={Tarot}
        // component={NoScreen}
        options={{
          tabBarLabelPosition: 'below-icon',
          tabBarIcon: ({focused}) => tabBarIcon(undefined, focused),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;