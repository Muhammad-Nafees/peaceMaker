import React, {useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Dimensions,
  PanResponder,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AnimatedMarginView from './AnimatedMarginView';
import {BlurView, VibrancyView} from '@react-native-community/blur';

const {height} = Dimensions.get('window');

const CallActionBox = ({
  onHangupPress = () => null,
  onVideo,
  onLayout,
  mute,
  isMuted,
  switchCamera,
  isMyVid,
  changeSpeakerInput,
  isSpeakerAudio,
  setActionBoxHeight,
  endCallBtn,
  audioMuteBtn,
  flipBtn,
  videoMuteBtn,
  speakerSwitch,
}: {
  onHangupPress?: any;
  onVideo?: any;
  onLayout?: any;
  mute: any;
  isMuted: any;
  switchCamera: any;
  isMyVid: any;
  changeSpeakerInput: any;
  isSpeakerAudio: any;
  setActionBoxHeight?: any;
  endCallBtn?: any;
  audioMuteBtn?: any;
  flipBtn?: any;
  videoMuteBtn?: any;
  speakerSwitch?: any;
}) => {
  const [mb, setMb] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const {dy} = gestureState;
        if (dy < -50) {
          // Swipe up
          console.log('Swipe up');
          setMb(0);
        } else if (dy > 50) {
          // Swipe down
          console.log('Swipe down');
          setMb(100);
          // setMb(0);
        }
      },
    }),
  ).current;

  return (
    <AnimatedMarginView style={{width: '100%', height: 233}} marginBottom={-mb}>
      <View
        style={[
          styles.mainContainer,
          {height: '100%', width: '100%', overflow: 'hidden'},
        ]}
        onLayout={onLayout}
        {...panResponder.panHandlers}>
        <BlurView
          // overlayColor="transparent"
          blurAmount={2}
          blurRadius={1}
          blurType="dark"
          style={{
            position: 'absolute',
            width: Dimensions.get('window').width,
            height: 233,
            left: 0,
            top: 0,
            right: 0,
          }}
        />

        <View
          style={{
            backgroundColor: '#BEBEC0',
            width: 34,
            height: 5,
            borderRadius: 2.4,
            alignSelf: 'center',
            marginTop: 8,
            marginBottom: 29,
          }}
        />
        <View style={styles.buttonsContainer}>
          <View style={styles.btnContainer}>
            {audioMuteBtn()}
            <Text style={styles.subText}>{isMuted ? 'unmute' : 'mute'}</Text>
          </View>
          <View style={styles.btnContainer}>
            {flipBtn()}
            <Text style={styles.subText}>flip</Text>
          </View>
          <View style={styles.btnContainer}>
            {endCallBtn()}
            <Text style={styles.subText}>end</Text>
          </View>
        </View>
        <View style={styles.buttonsContainer}>
          {videoMuteBtn()}
          {speakerSwitch()}
          {/* <Pressable onPress={changeSpeakerInput} style={styles.iconButtonB}>
            <Ionicons name="ios-volume-high" size={20} color={'white'} />
            <Text style={{fontSize: 13, fontWeight: '500', color: 'white'}}>
              {!isSpeakerAudio ? 'Phone' : 'Speaker'}
            </Text>
          </Pressable> */}
        </View>
      </View>
    </AnimatedMarginView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backgroundColor: 'rgba(0,0,0, 0.5)',
    // backgroundColor: '#162132',
    // backgroundColor: '#1E1E1E80',
    // opacity: 0.5,
    // backgroundColor: 'red',
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    flex: 1,
    borderWidth: 0,
  },
  buttonsContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-around',
    justifyContent: 'center',
    marginTop: 'auto',
    gap: 35,
  },
  iconButton: {
    backgroundColor: '#3b4653',
    padding: 12,
    borderRadius: 50,
  },
  subText: {
    fontSize: 13,
    fontWeight: '400',
    color: 'white',
    marginTop: 5,
  },
  btnContainer: {
    alignItems: 'center',
  },
  iconButtonB: {
    width: 150,
    backgroundColor: '#3b4553',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
    marginBottom: 10,
  },
});

export default CallActionBox;
