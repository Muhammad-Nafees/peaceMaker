import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {TouchableOpacity, Text} from 'react-native';
import {COLORS} from '../constants/colors';
import AccountabilityPartners from '../screens/auth-screens/AccountabilityPartner';
import WelcomeScreen from '../screens/WelcomeScreen';
import CompleteProfileScreen from '../screens/auth-screens/CompleteProfile';
import RegisterScreen from '../screens/auth-screens/RegisterScreen';
import LoginScreen from '../screens/auth-screens/LoginScreen';
import ForgetPassword from '../screens/auth-screens/ForgetPassword';
import VerifyScreen from '../screens/auth-screens/VerifyScreen';
import CreateNewPassword from '../screens/auth-screens/CreateNewPassword';
import LoadingScreen from '../screens/auth-screens/LoadingScreen';

import {useNavigation} from '@react-navigation/native';

import {useState} from 'react';
import {AuthStackParamList} from '../interface/types';
import {useAppSelector} from '../redux/app/hooks';
import MapScreen from '../screens/auth-screens/MapScreen';
import AccountabilityBuddies2 from '../screens/auth-screens/AccountabilityBuddies2';
import AuthStackNavigator from './AuthStackNavigator';
import DailyStateMap from '../screens/dailystate-screens/DailyStateMap';
import ProgressBarView from '../components/Register/ProgressBarView';
import RegisterScreenUsingSocial from '../screens/auth-screens/RegisterScreenUsingSocial';
import PrivacyPolicy from '../screens/profile-screens/PrivacyPolicy';
import TermAndConditions from '../screens/profile-screens/TermsAndConditions';

const Stack = createNativeStackNavigator();

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const StackNavigator = () => {
  const isAuthenticated = useAppSelector(
    (state: any) => state.user.isAuthenticated,
  );

  const navigation = useNavigation<NavigationProp>();
  console.log('🚀 ~ AuthStackNavigator ~ isAuthenticated:', isAuthenticated);

  const [minDataSelected, setMinDataSelected] = useState(false);
  
  if (isAuthenticated) {
    return <AuthStackNavigator />;
  };

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
        headerBackTitleVisible: false
      }}
      // initialRouteName="DashboardScreen"
      initialRouteName="WelcomeScreen"
      // initialRouteName="AccountabilityBuddies"
    >
      <Stack.Screen
        name="WelcomeScreen"
        component={WelcomeScreen}
        options={{
          headerShown: false,
          animation: 'default',
        }}
      />

      <Stack.Screen
        name="RegisterScreen"
        component={RegisterScreen}
        options={{
          headerTitle: () => <ProgressBarView progress={0.25} />,
          headerStyle: {backgroundColor: '#F9FAFA'},
        }}
      />

      <Stack.Screen
        name="RegisterScreenUsingSocial"
        component={RegisterScreenUsingSocial}
        options={{
          headerTitle: () => <ProgressBarView progress={0.25} />,
          headerStyle: {backgroundColor: '#F9FAFA'},
        }}
      />

      <Stack.Screen
        name="DailyStateAuthMap"
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
        name="LoginScreen"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ForgetPassword"
        component={ForgetPassword}
        options={{
          headerShown: true,
          title: '',
          headerTintColor: COLORS.primary400,
        }}
      />
      <Stack.Screen
        name="VerifyScreen"
        component={VerifyScreen}
        options={{
          headerShown: true,
          title: '',
        }}
      />
      <Stack.Screen
        name="CreateNewPassword"
        component={CreateNewPassword}
        options={{
          headerShown: true,
          title: '',
          headerTintColor: COLORS.primary400,
        }}
      />

      <Stack.Screen
        name="AccountabilityBuddies"
        // component={}
        children={() => (
          <AccountabilityBuddies2 setMinDataSelected={setMinDataSelected} />
        )}
        options={{
          headerTitle: () => <ProgressBarView progress={0.5} />,
          headerStyle: {backgroundColor: '#F9FAFA'},
          headerRight: () => {
            return (
              minDataSelected && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('AccountabilityPartner')}>
                  <Text style={{color: 'black'}}>Done</Text>
                </TouchableOpacity>
              )
            );
          },
        }}
      />

      <Stack.Screen
        name="AccountabilityPartner"
        component={AccountabilityPartners}
        options={{
          headerTitle: () => <ProgressBarView progress={0.7} />,
          headerStyle: {backgroundColor: '#F9FAFA'},
        }}
      />

      <Stack.Screen
        name="CompleteProfile"
        component={CompleteProfileScreen}
        options={{
          headerTitle: () => <ProgressBarView progress={1} />,
          headerStyle: {backgroundColor: '#F9FAFA'},
        }}
      />

      <Stack.Screen
        name="MapScreen"
        component={MapScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="LoadingScreen"
        component={LoadingScreen}
        options={{headerShown: false}}
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
    </Stack.Navigator>
  );
};

export default StackNavigator;
