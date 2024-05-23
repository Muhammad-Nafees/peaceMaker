import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {COLORS} from '../constants/colors';
import SOSNotifyScreen from '../screens/home-screens/SOSNotifyScreen';

const Stack = createNativeStackNavigator();

const HomeStackNavigator = () => {
  return (
    <Stack.Screen
      name="SOSNotifyScreen"
      component={SOSNotifyScreen}
      options={{
        title: 'Notify'
      }}
    
    />
  );
};

export default HomeStackNavigator;