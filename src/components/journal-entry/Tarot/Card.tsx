import React, {useEffect} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {snapPoint} from 'react-native-redash';
import {tipCardStyle} from './style';
import {Text} from 'react-native';
import {horizontalScale, verticalScale} from '../../../utils/metrics';

const {width: wWidth} = Dimensions.get('window');
const headImg = require('../../../../assets/images/journal-entry-images/question-mark.png');

const SNAP_POINTS = [-wWidth, 0, wWidth];
const CARD_WIDTH = wWidth - 128;
const CARD_HEIGHT = 150;
const DURATION = 250;

interface CardProps {
  title: string;
  shuffleBack: Animated.SharedValue<boolean>;
  index: number;
  onLastCardSwipe: (val: boolean) => void;
  addShadow?: boolean;
  setTip: (tip: string) => void;
}

export const Card = ({
  title,
  shuffleBack,
  index,
  onLastCardSwipe,
  addShadow,
  setTip
}: CardProps) => {
  const offset = useSharedValue({x: 0, y: 0});
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotateZ = useSharedValue(0);
  const delay = index * DURATION;
  const theta = -10 + Math.random() * 20;


  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(0, {duration: DURATION, easing: Easing.inOut(Easing.ease)}),
    );
    rotateZ.value = withDelay(delay, withSpring(theta));
  }, [delay, index, rotateZ, theta, translateY]);
  useAnimatedReaction(
    () => shuffleBack.value,
    v => {
      if (v) {
        const duration = 150 * index;
        translateX.value = withDelay(
          duration,
          withSpring(0, {}, () => {
            shuffleBack.value = false;
          }),
        );
        rotateZ.value = withDelay(duration, withSpring(theta));
      }
    },
  );
  const gesture = Gesture.Pan()
    .onBegin(() => {
      offset.value = {x: translateX.value, y: translateY.value};
      rotateZ.value = withTiming(0);
      scale.value = withTiming(1.1);
    })
    .onUpdate(({translationX, translationY}) => {
      translateX.value = offset.value.x + translationX;
      translateY.value = offset.value.y + translationY;
    })
    .onEnd(({velocityX, velocityY}) => {
      const dest = snapPoint(translateX.value, velocityX, SNAP_POINTS);
      translateX.value = withSpring(dest, {velocity: velocityX});
      translateY.value = withSpring(0, {velocity: velocityY});
      scale.value = withTiming(1, {}, () => {
        const isLast = index === 0;
        const isSwipedLeftOrRight = dest !== 0;
        if (isLast && isSwipedLeftOrRight) {
          // shuffleBack.value = true;
          runOnJS(onLastCardSwipe)(true);
        }
      });
    });

  let style;

  if (addShadow) {
    style = useAnimatedStyle(() => ({
      transform: [
        {perspective: 3000},
        {rotateX: '10deg'},
        {translateX: translateX.value},
        {translateY: translateY.value},
        {rotateY: `${rotateZ.value / 10}deg`},
        {rotateZ: `${rotateZ.value}deg`},
        {scale: scale.value},
      ],
    }));
  } else {
    style = useAnimatedStyle(() => ({
      transform: [
        // {perspective: 3000},
        // {rotateX: '10deg'},
        {translateX: translateX.value},
        {translateY: translateY.value},
        {rotateY: `${rotateZ.value / 10}deg`},
        {rotateZ: `${rotateZ.value}deg`},
        {scale: scale.value},
      ],
    }));
  }


  return (
    <TouchableWithoutFeedback onPress={() => setTip && setTip(title)}>
      <View style={styles.container} pointerEvents="box-none">
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.card, style]}>
            <View style={tipCardStyle.modalView}>
              <View style={tipCardStyle.modalWarnCont}>
                <Image
                  resizeMode="contain"
                  style={{
                    width: horizontalScale(42),
                    height: verticalScale(42),
                  }}
                  source={headImg}
                />
              </View>
              {/* <TouchableWithoutFeedback onPress={() => null}>
                <View style={tipCardStyle.closeModalCont}>
                  <Icon name="x" color="#7D7D7D99" size={18} />
                </View>
              </TouchableWithoutFeedback> */}
              <Text style={[tipCardStyle.modalText, {color: '#2791B5'}]}>
                {title}
              </Text>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    // ...StyleSheet.absoluteFillObject,
    // minHeight: CARD_HEIGHT,
    // maxHeight: CARD_HEIGHT,
    // ...StyleSheet.absoluteFillObject,
    // minHeight: CARD_HEIGHT,
    // maxHeight: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: "red",
    position: "absolute",
    left: 0,
    top: '50%',
    width: "100%",   // Adjust the width as needed
    minHeight: CARD_HEIGHT,  // Adjust the height as needed
    // marginLeft: -CARD_WIDTH, // Half of the width
    marginTop: -CARD_HEIGHT,  // Half of the height
    // backgroundColor: "red",
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: CARD_WIDTH,
    // minHeight: CARD_HEIGHT,
    // flexGrow: 0,
    // height: "50%",
    // justifyContent: 'center',
    // alignItems: 'center',
    // minHeight: CARD_HEIGHT,
    // flexGrow: 0,
    // height: "50%",
    // justifyContent: 'center',
    // alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
