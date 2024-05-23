import React, {useEffect, useRef, useState} from 'react';
import {View, Image, Animated} from 'react-native';
import {useDispatch} from 'react-redux';
import {setAuthenticated} from '../../redux/features/user/userSlice';

interface Props {
  navigation: any;
}

const LoadingScreen = ({navigation}: Props) => {
  const [logoIndex, setLogoIndex] = useState(0);
  const opacityValue = useRef(new Animated.Value(0)).current;

  const dispatch = useDispatch();

  useEffect(() => {
    startAnimation();
    navigateToHomeScreen();
  }, []);

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start(() => {
      setLogoIndex(logoIndex + 1);
    });
  };

  const navigateToHomeScreen = () => {
    setTimeout(() => {
      dispatch(setAuthenticated(true));
      navigation.navigate('DashboardScreen');
    }, 5000);
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Animated.Image
        source={require('../../../assets/images/logo.png')}
        resizeMode={'contain'}
        style={{
          overflow: 'hidden',
          opacity: opacityValue,
          ...{
            width: "80%",
            height: 220,
          },
        }}
      />
    </View>
  );
};

export default LoadingScreen;
