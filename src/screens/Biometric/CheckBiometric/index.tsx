import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useAppSelector} from '../../../redux/app/hooks';

export default function CheckBiometric({route, navigation}: any) {
  const {biometric} = useAppSelector(state => state.extra);

  useEffect(() => {
    if (biometric?.isEnabled) {
      navigation.replace('Biometric', {...route.params});
    } else {
      navigation.replace(route.params?.handleNotificationClickGoto, {
        ...route.params,
      });
    }
  }, [route?.params]);

  return <View style={{flex: 1, backgroundColor: 'white'}}></View>;
}
