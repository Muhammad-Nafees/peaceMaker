import {NavigationContainer} from '@react-navigation/native';
import {useEffect, useRef, useState} from 'react';
import {requestPermissions} from './src/utils/permissions';
import AuthStackNavigator from './src/navigators/AuthStackNavigator';
import StackNavigator from './src/navigators/StackNavigator';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import MainTabNavigator from './src/navigators/MainTabNavigator';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Navigation from './src/utils/appNavigation';
import HomeStackNavigator from './src/navigators/HomeStackNavigator';
import React from 'react';
import {Provider} from 'react-redux';
import store from './src/redux/app/store';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import 'react-native-gesture-handler';
import {RootSiblingParent} from 'react-native-root-siblings';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import RNCallKeep, {IOptions} from 'react-native-callkeep';
import {AppRegistry, Platform, SafeAreaView} from 'react-native';
import * as OverlayPermissionModule from 'videosdk-rn-android-overlay-permission';
import {getChatData} from './src/utils/chat';
import {User} from './src/interface/types';
import Mapbox from '@rnmapbox/maps';
import {Settings} from 'react-native-fbsdk-next';

Mapbox.setAccessToken(
  'sk.eyJ1IjoidXNtYW43NzciLCJhIjoiY2xvMGQ5MzQ1MTh4MjJ3bjByYnQ3ODZlNiJ9.CjbL2MyTL8IU8EE2jqko_w',
);

let persistor = persistStore(store);

const App = () => {
  useEffect(() => {
    // Settings.setAppID('253076394397593');
    Settings.initializeSDK();

    () => {
      return;
    };
  }, []);

  useEffect(() => {
    // RNCallKeep.setAvailable(true);

    if (Platform.OS === 'android') {
      OverlayPermissionModule.requestOverlayPermission();
    }
  }, []);

  // const Tab = createBottomTabNavigator();

  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RootSiblingParent>
            <GestureHandlerRootView style={{flex: 1}}>
              <NavigationContainer
                ref={Navigation.navigationRef}
                onStateChange={state => {
                  // const previousRouteName = Navigation.routeNameRef.current;
                  const currentRouteName = Navigation.getActiveRouteName(state);
                  // if (previousRouteName !== currentRouteName) {
                  // 	setCurrentScreen(currentRouteName);
                  // }
                  Navigation.routeNameRef.current = currentRouteName;
                }}>
                <SafeAreaView style={{backgroundColor: 'transparent', flex: 1}}>
                  <StackNavigator />
                </SafeAreaView>
              </NavigationContainer>
            </GestureHandlerRootView>
          </RootSiblingParent>
        </PersistGate>

        <Toast />
      </Provider>
    </>
  );
};

export default App;
