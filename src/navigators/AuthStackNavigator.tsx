
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import {
  TouchableOpacity,
  Text,
  View,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';

import {COLORS} from '../constants/colors';
import WelcomeScreen from '../screens/WelcomeScreen';

import { useNavigation } from '@react-navigation/native';
import ChatScreen from '../screens/chat-screens';
import Icon from 'react-native-vector-icons/Feather';
import CloseIcon from 'react-native-vector-icons/Ionicons';
import ChatMessagesScreen from '../screens/chat-screens/chat-view';
import ChatInfo from '../screens/chat-screens/chat-info';
import ChatMedias from '../screens/chat-screens/chat-media';
import GroupInfo from '../screens/chat-screens/chat-info/group';
import ProviderInfo from '../screens/chat-screens/chat-info/provider';
import {chatHeaderTitle} from '../components/Chat/HeaderTitle';
// import CallingScreen from '../screens/call-screens';
import React, {useEffect} from 'react';
import {AuthStackParamList, User} from '../interface/types';
import MainTabNavigator from './MainTabNavigator';
import SOSNotifyScreen from '../screens/home-screens/SOSNotifyScreen';
import MyScheduleScreen from '../screens/home-screens/MyScheduleScreen';
import {moderateScale} from '../utils/metrics';
import {useAppSelector} from '../redux/app/hooks';
import {chatHeaderRight} from '../components/Chat/HeaderTitle/HeaderRight';
import AccountablityNetwork from '../screens/profile-screens/AccountablityNetwork';
import AccountablityBuddy from '../screens/profile-screens/AccountablityBuddy';
import WeeklySummary from '../screens/profile-screens/WeeklySummary';
import StateDetailsScreen from '../screens/dailystate-screens/StateDetailsScreen';
import BeNotifiedScreen from '../screens/dailystate-screens/BeNotifiedScreen';
import ProfileSettings from '../screens/profile-screens/ProfileSettings';
import ChatMediaImg from '../screens/chat-screens/media-view';
import ImagePreview from '../screens/chat-screens/image-preview';
import DailyStateMap from '../screens/dailystate-screens/DailyStateMap';
import PainChartScreen from '../screens/dailystate-screens/PainChartScreen';
import SummaryScreen from '../screens/dailystate-screens/SummaryScreen';
import AccountSettings from '../screens/profile-screens/AccountSettings';
import ChangePassword from '../screens/profile-screens/ChangePassword';
import PrivacyPolicy from '../screens/profile-screens/PrivacyPolicy';
import TermAndConditions from '../screens/profile-screens/TermsAndConditions';
import Support from '../screens/profile-screens/Support';
import CallUs from '../screens/profile-screens/Support/CallUs';
import MailUs from '../screens/profile-screens/Support/MailUs';
import ChatWithUs from '../screens/profile-screens/Support/ChatWithUs';
import SupportChat from '../screens/chat-screens/support-chat';
import NewMessage from '../screens/chat-screens/create-chat';
import CallingScreen from '../screens/call-screens';
import JournalSubEntry from '../screens/journal-screens/JournalSubEntry';
import JournalEntryRecords from '../screens/journal-screens/JournalEntryRecords';
import JournalEntryDescription from '../screens/journal-screens/JournalEntryDescription';
import ViewSummaryScreen from '../screens/journal-screens/ViewSummaryScreen';
import ChallengeDetails from '../screens/challenge-screens/ChallengeDetails';
import {STYLES} from '../styles/globalStyles';
import ConversationStarters from '../screens/challenge-screens/ConversationStarters';
import ConversationStarterTriggers from '../screens/challenge-screens/ConversationStarterTriggers';
import Notification from '../screens/notifications';
import AccountabilityPartners from '../screens/auth-screens/AccountabilityPartner';
import ChallengeScreen from '../screens/challenge-screens';
import JournalScreen from '../screens/journal-screens';
import Biometrics from '../screens/Biometric';
import socketServcies from '../utils/socketServices';
import {getChatData} from '../utils/chat';
import messaging from '@react-native-firebase/messaging';

import Navigation from '../utils/appNavigation';
import CheckBiometric from '../screens/Biometric/CheckBiometric';

const Stack = createNativeStackNavigator();

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;
    
  
const AuthStackNavigator = () => {
   
  const navigation = useNavigation<NavigationProp>();
  const user = useAppSelector(state => state.user.data);
  const {biometric, groupName} = useAppSelector(state => state.extra);

  // const isAuthenticated = useAppSelector(
  //   (state: any) => state.user.isAuthenticated,
  // );
  // console.log('🚀 ~ AuthStackNavigator ~ isAuthenticated:', isAuthenticated);

  useEffect(() => {
    const handleNotificationClick = async (remoteMessage: any) => {
      if (!remoteMessage) return;
      console.log(
        'Notification caused app to open from background/quit state:',
        remoteMessage,
      );
      const chat = remoteMessage.data?.chatId ? true : null;
      const accountabilityUpdate =
        remoteMessage.notification.title === 'Accountability Update';
      console.log('Chat data: ' + chat);

      const isLowFeelingNotif = remoteMessage.data?.value < 25;
      const isDSBenotifiedNotif =
        remoteMessage.notification?.body?.includes('How is your day');
      const isIntervenNotif =
        remoteMessage.notification?.body?.includes('intervention');

      if (accountabilityUpdate && (isLowFeelingNotif || isIntervenNotif)) {
        Navigation.navigate(!biometric?.isEnabled ? 'Home' : 'Biometric', {
          accountabilityUpdate,
          userId: remoteMessage.data?.userId,
          title: `${remoteMessage.data?.name} ${
            isLowFeelingNotif ? 'is feeling sad today' : 'needs an intervention'
          }`,
          isIntervenNotif,
          handleNotificationClickGoto: 'Home',
        });
      } else if (isDSBenotifiedNotif)
        Navigation.navigate(!biometric?.isEnabled ? 'Home' : 'Biometric', {
          accountabilityUpdate: true,
          isDSBenotifiedNotif,
          userId: remoteMessage.data?.userId,
          title: 'Daily State',
          handleNotificationClickGoto: 'Home',

          // isIntervenNotif,
        });
      else if (chat) {
        const chatData = await getChatData(
          remoteMessage.data?.chatId,
          remoteMessage.data?.userId,
        );

        if (!chatData) return;

        const participant: User = chatData.participants?.find(
          (p: User) => p._id !== remoteMessage.data?.userId,
        );

        const isGroup = chatData.chatType !== 'one-to-one';

        Navigation.navigate(
          !biometric?.isEnabled ? 'ChatMessagesScreen' : 'Biometric',
          {
            group: !isGroup ? 0 : 1,
            title: !isGroup
              ? participant.firstName + ' ' + participant.lastName
              : chatData.groupName,
            provider: 0,
            chatId: remoteMessage?.data?.chatId,
            participants: chatData.participants,
            messages: undefined,
            left: false,
            noTitle: true,
            profilePic: participant?.photo
              ? participant?.photo
              : participant?.photoUrl,
            handleNotificationClickGoto: 'ChatMessagesScreen',
          },
        );
      } else
        Navigation.navigate(
          !biometric?.isEnabled ? 'NotificationScreen' : 'Biometric',
          {
            reloadNotifications: true,
            handleNotificationClickGoto: 'NotificationScreen',
          },
        );
    };

    messaging().onNotificationOpenedApp(handleNotificationClick);

    // Check whether an initial notification is available
    messaging().getInitialNotification().then(handleNotificationClick);

    socketServcies.initializeSocket(user._id);
  }, []);

   

  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        animationDuration: 5000,
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerTintColor: COLORS.primary400,
        headerStyle: {
          backgroundColor: '#F9FAFA',
        },
        statusBarStyle: 'dark',
        statusBarColor: 'white',
        headerBackTitleVisible: false,
      }}
      initialRouteName={!biometric?.isEnabled ? 'DashboardScreen' : 'Biometric'}
      // initialRouteName="DashboardScreen"
      // initialRouteName="Biometric"
      // initialRouteName="WelcomeScreen"
      // initialRouteName="AccountabilityBuddies"
    >
      <Stack.Screen
        name="DashboardScreen"
        component={MainTabNavigator}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Biometric"
        component={Biometrics}
        options={{headerShown: false}}
      />
      
      <Stack.Screen
        name="CheckBiometric"
        component={CheckBiometric}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="AccountablityNetwork"
        component={AccountablityNetwork}
        options={{
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#f9fafa',
          },
          headerTitle: 'Accountability Network',
          statusBarColor: '#f9fafa',
        }}
      />

      <Stack.Screen
        name="AuthAccountabilityPartner"
        component={AccountabilityPartners}
        options={{
          headerTitle: '',
          headerStyle: {backgroundColor: '#F9FAFA'},
          headerLeft: () => (
            <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
              <CloseIcon
                name="ios-arrow-back-sharp"
                size={24}
                color="#2791B5"
              />
            </TouchableWithoutFeedback>
          ),
        }}
      />

      <Stack.Screen
        name="AccountablityBuddy"
        component={AccountablityBuddy}
        options={{
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#f9fafa',
          },
          headerTitle: 'Your Friend',
          statusBarColor: '#f9fafa',
        }}
      />
      <Stack.Screen
        name="WeeklySummary"
        component={WeeklySummary}
        options={({route}) => {
          const headerTitle = 'Daily State of ' + route.params?.name;
          return {
            header: () => null,

            headerTitleStyle: {
              color: 'black',
              // maxWidth: 50,
              // marginRight: 'auto',
              // marginLeft: 'auto',
            },
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#f9fafa',
            },
            headerTitle:
              headerTitle.length * 5 > Dimensions.get('window').width - 200
                ? headerTitle.slice(0, 24) + '...'
                : headerTitle,
            statusBarColor: '#f9fafa',
            headerRight: () => (
              <Icon name="calendar" size={24} color="#2791B5" />
            ),
            headerLeft: () => (
              <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
                <CloseIcon
                  name="ios-arrow-back-sharp"
                  size={24}
                  color="#2791B5"
                />
              </TouchableWithoutFeedback>
            ),
          };
        }}
      />
      <Stack.Screen
        name="ProfileDSDetailedView"
        component={WeeklySummary}
        options={{
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#f9fafa',
          },
          headerTitle: 'Daily State',
          statusBarColor: '#f9fafa',
          // headerRight: () => <Icon name="calendar" size={24} color="#2791B5" />,
        }}
      />
      <Stack.Screen
        name="ProfileSettings"
        component={ProfileSettings}
        options={{
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#f9fafa',
          },
          headerTitle: ' ',
          statusBarColor: '#f9fafa',
        }}
      />
      <Stack.Screen
        name="AccountDetails"
        component={AccountSettings}
        options={{
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#f9fafa',
          },
          headerTitle: 'Account Details',
          statusBarColor: '#f9fafa',
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#f9fafa',
          },
          headerTitle: 'Change Password',
          statusBarColor: '#f9fafa',
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={{
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#f9fafa',
          },
          headerTitle: '',
          statusBarColor: '#f9fafa',
        }}
      />
      <Stack.Screen
        name="TermAndConditions"
        component={TermAndConditions}
        options={{
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#f9fafa',
          },
          headerTitle: '',
          statusBarColor: '#f9fafa',
        }}
      />
      <Stack.Screen
        name="Support"
        component={Support}
        options={{
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#f9fafa',
          },
          headerTitle: '',
          statusBarColor: '#f9fafa',
        }}
      />
      <Stack.Screen
        name="CallUs"
        component={CallUs}
        options={{
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#f9fafa',
          },
          headerTitle: '',
          statusBarColor: '#f9fafa',
        }}
      />
      <Stack.Screen
        name="MailUs"
        component={MailUs}
        options={{
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#f9fafa',
          },
          headerTitle: '',
          statusBarColor: '#f9fafa',
        }}
      />
      <Stack.Screen
        name="ChatWithUs"
        component={ChatWithUs}
        options={{
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#f9fafa',
          },
          headerTitle: '',
          statusBarColor: '#f9fafa',
        }}
      />

      <Stack.Screen
        name="Messages"
        component={ChatScreen}
        options={{
          animation: 'none',
          headerShown: true,
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: 'white',
          },
          headerRight: () => (
            <TouchableWithoutFeedback
              onPress={() => navigation.navigate('NewMessage')}>
              <View
                style={{
                  backgroundColor: COLORS.mainGreen,
                  width: 35,
                  height: 35,
                  borderRadius: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon name="edit" size={17.5} color="#fff" />
              </View>
            </TouchableWithoutFeedback>
          ),
        }}
      />

      <Stack.Screen
        name="NewMessage"
        component={NewMessage}
        options={{
          headerShown: true,
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#f9fafa',
          },
          headerTitle: 'New Message',
          statusBarColor: '#f9fafa',
          // navigationBarColor: '#f9fafa',
        }}
      />

      <Stack.Screen
        name="ChatMessagesScreen"
        component={ChatMessagesScreen}
        options={({route, navigation}) => ({
          headerShown: true,
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: 'white',
          },
          header: () => (
            <View
              style={{
                backgroundColor: '#F9FAFA',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 10,
                paddingTop: 5,
              }}>
              <TouchableWithoutFeedback
                onPress={() =>
                  route.params?.goBack
                    ? navigation.goBack()
                    : navigation.navigate('Messages')
                }>
                <CloseIcon
                  name="ios-arrow-back-sharp"
                  size={24}
                  color="#2791B5"
                />
              </TouchableWithoutFeedback>
              {chatHeaderTitle(route, groupName)}
              {chatHeaderRight(route)}
            </View>
          ),
          headerBackVisible: false,
          // statusBarColor: 'transparent',
          // headerRight: () => chatHeaderRight(route),
          // headerTitle: () => chatHeaderTitle(route, groupName),
          // headerLeft: () => (
          //   <TouchableWithoutFeedback
          //     onPress={() =>
          //       route.params?.goBack
          //         ? navigation.goBack()
          //         : navigation.navigate('Messages')
          //     }>
          //     <CloseIcon
          //       name="ios-arrow-back-sharp"
          //       size={24}
          //       color="#2791B5"
          //     />
          //   </TouchableWithoutFeedback>
          // ),
        })}
      />

      <Stack.Screen
        name="SupportChat"
        component={SupportChat}
        options={({route}) => ({
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#f9fafa',
          },
          headerTitle: 'Support ' + route.params?.count,
          statusBarColor: '#f9fafa',
        })}
      />

      <Stack.Screen
        name="ChatInfo"
        component={ChatInfo}
        options={{
          headerShown: true,
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#f9fafa',
          },
          headerTitle: 'Chat Information',
          statusBarColor: '#f9fafa',
          // navigationBarColor: '#f9fafa',
        }}
      />

      <Stack.Screen
        name="GroupInfo"
        component={GroupInfo}
        options={{
          headerShown: true,
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#f9fafa',
          },
          headerTitle: 'Group Information',
          statusBarColor: '#f9fafa',
          // navigationBarColor: '#f9fafa',
        }}
      />

      <Stack.Screen
        name="ProviderInfo"
        component={ProviderInfo}
        options={{
          headerShown: true,
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#f9fafa',
          },
          headerTitle: 'Provider Information',
          statusBarColor: '#f9fafa',
          // navigationBarColor: '#f9fafa',
        }}
      />

      <Stack.Screen
        name="ChatMedias"
        component={ChatMedias}
        options={{
          headerShown: true,
          headerTitleStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#f9fafa',
          },
          headerTitle: 'Media',
          statusBarColor: '#f9fafa',
          // navigationBarColor: '#f9fafa',
        }}
      />

      <Stack.Screen
        name="ChatMediaImg"
        component={ChatMediaImg}
        options={{
          headerShown: false,
          statusBarTranslucent: true,
          statusBarColor: 'transparent',
          animation: 'default',
        }}
      />

      <Stack.Screen
        name="ImagePreview"
        component={ImagePreview}
        options={{
          headerShown: false,
          statusBarColor: 'black',
          statusBarStyle: 'light',
          animation: 'default',
        }}
      />

      <Stack.Screen
        name="CallingScreen"
        // component={CallingScreen}
        component={CallingScreen}
        options={{
          headerShown: false,
          statusBarTranslucent: true,
          statusBarColor: 'transparent',
          statusBarStyle: 'light',
          // navigationBarColor: "transparent",
        }}
      />

      <Stack.Screen
        name="SOSNotifyScreen"
        component={SOSNotifyScreen}
        options={{
          headerTintColor: COLORS.primary400,
          title: 'Notify',
          headerTitleStyle: {
            color: COLORS.neutral900,
            fontSize: moderateScale(16),
          },
          headerRight: () => (
            <Text
              style={{color: COLORS.primary400}}
              onPress={() => navigation.goBack()}>
              cancel
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="MyScheduleScreen"
        component={MyScheduleScreen}
        options={{
          headerTintColor: COLORS.primary400,
          title: 'My Schedule',
          headerTitleStyle: {
            color: COLORS.neutral900,
            fontSize: moderateScale(16),
          },
        }}
      />
      <Stack.Screen
        name="StateDetailsScreen"
        component={StateDetailsScreen}
        options={({route}) => {
          const name = route.params?.name;
          const formattedName = name
            ? name?.charAt(0).toUpperCase() + name?.slice(1).toLowerCase()
            : '';
          return {
            headerTintColor: COLORS.primary400,
            headerTitle: formattedName,
            headerTitleStyle: {
              color: COLORS.neutral900,
              fontSize: moderateScale(16),
            },
          };
        }}
      />

      <Stack.Screen
        name="BeNotifiedScreen"
        component={BeNotifiedScreen}
        options={{
          headerTintColor: COLORS.primary400,
          title: '',
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text
                style={{
                  color: COLORS.mainGreen,
                }}>
                Save
              </Text>
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <CloseIcon name="close-outline" size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="DailyStateMap"
        component={DailyStateMap}
        options={({route, navigation}) => ({
          header: () => null,
          headerTintColor: COLORS.primary400,
          title: '',
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text
                style={{
                  color: COLORS.mainGreen,
                }}>
                Select
              </Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="PainChartScreen"
        component={PainChartScreen}
        options={({route, navigation}) => ({
          headerTintColor: COLORS.primary400,
          headerTitle: 'Pain Chart',
          headerTitleStyle: {
            color: COLORS.neutral900,
            fontSize: moderateScale(16),
          },
        })}
      />
      <Stack.Screen
        name="SummaryScreen"
        component={SummaryScreen}
        options={({route}) => ({
          headerTintColor: COLORS.primary400,
          headerTitle: 'Summary',
          headerTitleStyle: {
            color: COLORS.neutral900,
            fontSize: moderateScale(16),
          },
        })}
      />
      <Stack.Screen
        name="WelcomeScreen2"
        component={WelcomeScreen}
        options={{
          headerShown: false,
          animation: 'default',
        }}
      />

      {/* // journal entry screens */}

      <Stack.Screen
        name="JournalEntryScreen"
        component={JournalScreen}
        options={{
          headerShown: false,
          title: 'Daily Challenges',
          headerTitleStyle: {
            color: COLORS.neutral900,
            fontSize: moderateScale(16),
          },
        }}
      />

      <Stack.Screen
        name="JournalEntry"
        component={BeNotifiedScreen}
        options={{
          title: 'Journal Entry',
          headerTitleStyle: {
            color: COLORS.neutral900,
            fontSize: moderateScale(16),
          },
        }}
      />
      <Stack.Screen
        name="JournalSubEntry"
        component={JournalSubEntry}
        options={{headerShown: false, headerShadowVisible: false}}
      />
      <Stack.Screen
        name="JournalEntryDescription"
        component={JournalEntryDescription}
        options={{headerShown: false, headerShadowVisible: false}}
      />
      <Stack.Screen
        name="JournalEntryRecords"
        component={JournalEntryRecords}
        options={{
          headerTintColor: COLORS.primary400,
          title: 'Records',
          headerTitleStyle: {
            color: COLORS.neutral900,
            fontSize: moderateScale(16),
          },
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('Journal')}>
              <Text
                style={{
                  color: COLORS.mainGreen,
                }}>
                Add
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="JournalEntrySummary"
        component={SummaryScreen}
        options={({route}) => ({
          headerTintColor: COLORS.primary400,
          headerTitle: 'Summary',
          headerTitleStyle: {
            color: COLORS.neutral900,
            fontSize: moderateScale(16),
          },
        })}
      />
      <Stack.Screen
        name="ViewSummaryScreen"
        component={ViewSummaryScreen}
        options={({route}) => ({
          headerTintColor: COLORS.primary400,
          headerTitle: 'Summary',
          headerTitleStyle: {
            color: COLORS.neutral900,
            fontSize: moderateScale(16),
          },
        })}
      />

      {/* // daily challenges entry screens */}

      <Stack.Screen
        name="DailyChallenges"
        component={ChallengeScreen}
        options={{
          headerShown: false,
          title: 'Daily Challenges',
          headerTitleStyle: {
            color: COLORS.neutral900,
            fontSize: moderateScale(16),
          },
        }}
      />

      <Stack.Screen
        name="ChallengeDetails"
        component={ChallengeDetails}
        options={({route}) => ({
          title: '',
          headerTintColor: 'white',
          headerStyle: {
            backgroundColor: 'rgba(39, 145, 181, 1)',
          },
          headerRight: () => {
            return (
              <Text style={[STYLES.dev1__text14, {color: 'white'}]}>
                {route?.params?.totalPoints ?? '0'} pts
              </Text>
            );
          },
        })}
      />
      <Stack.Screen
        name="ConversationStarters"
        component={ConversationStarters}
        options={{
          headerTintColor: COLORS.primary400,
          headerTitle: 'Conversation Starters',
          headerShadowVisible: false,
          headerTitleStyle: {
            color: COLORS.neutral900,
            fontSize: moderateScale(16),
          },
        }}
      />
      <Stack.Screen
        name="ConversationStarterTiggers"
        component={ConversationStarterTriggers}
        options={{
          headerTintColor: COLORS.primary400,
          headerTitle: ' Conversation Starter Trigger',
          headerShadowVisible: false,
          headerTitleStyle: {
            color: COLORS.neutral900,
            fontSize: moderateScale(16),
          },
        }}
      />

      <Stack.Screen
        name="ConversationStarterTirggersMap"
        component={DailyStateMap}
        options={({route, navigation}) => ({
          header: () => null,
          headerTintColor: COLORS.primary400,
          headerTitle: 'Conversation Starter Trigger',
          headerShadowVisible: false,
          // animation: 'fade_from_bottom',
          headerTitleStyle: {
            color: COLORS.neutral900,
            fontSize: moderateScale(16),
          },
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text
                style={{
                  color: COLORS.mainGreen,
                }}>
                Save
              </Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="NotificationScreen"
        component={Notification}
        options={{
          animation: 'none',
          headerTintColor: COLORS.primary400,
          headerTitle: 'Notifications',
          headerShadowVisible: false,
          headerTitleStyle: {
            color: COLORS.neutral900,
            fontSize: moderateScale(16),
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStackNavigator;
