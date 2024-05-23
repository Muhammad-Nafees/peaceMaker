import React, {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Voice, {
  SpeechErrorEvent,
  SpeechRecognizedEvent,
} from '@react-native-voice/voice';
import JournalEntryHeader from '../../components/journal-entry/JournalEntryHeader';
import {STYLES} from '../../styles/globalStyles';
import {TextInput} from 'react-native';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import {COLORS} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomButton from '../../components/shared-components/CustomButton';
import CustomModal from '../../components/shared-components/CustomModal';
import {useEffect, useState} from 'react';
import {Tarot} from '../../components/journal-entry/Tarot';
import {Toast} from 'react-native-toast-message/lib/src/Toast';

const imageUrl = require('../../../assets/images/daily-state-images/reception-bell.png');

const JournalEntryDescription = ({navigation, route}: any) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isTipModalVisible, setIsTipModalVisible] = useState<boolean>(false);
  const [speaking, setSpeaking] = useState(false);
  const [description, setDescription] = useState('');
  const [tip, setTip] = useState('');

  const subcategory = Object.values(route.params.subCategory).length
    ? Object.values(route.params.subCategory)[0]
    : '';

  const tips = route.params.category.data.find(
    ({text}: any) => text === subcategory,
  )?.tips;

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStartHandler;
    Voice.onSpeechEnd = onSpeechEndHandler;
    Voice.onSpeechResults = onSpeechResultsHandler;

    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechRecognized = (e: SpeechRecognizedEvent) => {
    setSpeaking(false);
    console.log('onSpeechRecognized: ', e);
  };

  const onSpeechError = (e: SpeechErrorEvent) => {
    console.log('onSpeechError: ', JSON.stringify(e.error));
  };

  const onSpeechStartHandler = (e: any) => {
    console.log('Voice Started: ' + e);
  };

  const onSpeechEndHandler = (e: any) => {
    console.log('Voice Ended: ' + e);
  };
  const onSpeechResultsHandler = async (e: any) => {
    setSpeaking(false);
    console.log('Voice Result: ' + e.value);
    setDescription(prevDescription => prevDescription + ' ' + e.value[0]);
    await Voice.stop();
  };

  const handleShowTipModal = () => {
    setIsModalVisible(false);
    setIsTipModalVisible(true);
  };

  const speak = async () => {
    // const tts = new Tts();
    try {
      if (!speaking) {
        console.log('speaking');
        await Voice.start('en-US');
      } else {
        console.log('stop speaking');
        await Voice.stop();
      }
      setSpeaking(prevState => !prevState);
    } catch (e) {
      console.error(e);
    }
  };

  const onLastCardSwipe = (val: boolean) => {
    console.log('last card swipe');

    if (val) {
      setIsTipModalVisible(false);

      navigation.navigate('JournalEntrySummary', {
        ...route.params,
        description: description,
        tips: tips,
        tip: tip,
      });
    }
  };

  // useEffect(
  //   () =>
  //     navigation.addListener('beforeRemove', (e: any) => {
  //       if (isTipModalVisible) e.preventDefault();
  //     }),
  //   [navigation],
  // );
  return (
    <>
      <JournalEntryHeader>
        <ScrollView>
          <View style={{position: 'relative'}}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              style={styles.inputField}
            />
            <Text
              style={[
                STYLES.dev1__text14,
                {
                  position: 'absolute',
                  padding: 20,
                  color: COLORS.primary400,
                  fontFamily: 'GeneralSans-Medium',
                },
              ]}>
              Description of Journal Entry:
            </Text>
            <TouchableOpacity
              onPress={speak}
              style={{
                position: 'absolute',
                right: horizontalScale(10),
                top: verticalScale(90),
              }}>
              <Icon
                name="mic"
                color={speaking ? COLORS.mainGreen : '#818286'}
                size={22}
              />
            </TouchableOpacity>
          </View>
          <View style={{marginTop: verticalScale(170)}}>
            <CustomButton
              onPress={() => {
                if (!description) {
                  Toast.show({
                    type: 'info',
                    text1: 'Please write a description.',
                  });
                  return;
                }
                tips?.length ? setIsModalVisible(true) : onLastCardSwipe(true);
              }}>
              Next
            </CustomButton>
          </View>
          <CustomModal
            visible={isModalVisible}
            close={() => {
              setIsModalVisible(!isModalVisible);
            }}
            closeFn={() => {
              navigation.navigate('JournalEntrySummary', {
                ...route.params,
                description: description,
                tips: [],
                tip: tip,
              });
              setIsModalVisible(false);
            }}
            title="Entry Question"
            description={
              route.params?.tipQuestion
                ? route.params?.tipQuestion
                : `Would you like some tips on how you can improve your relationships with your ${subcategory}?`
            }
            color="#000"
            icon="x"
            btnBgColor="#8EB26F"
            leftButton="Yes"
            rightButton="No"
            onConfirm={handleShowTipModal}
            imageUrl={imageUrl}
          />
        </ScrollView>
      </JournalEntryHeader>
      {isTipModalVisible && (
        <Tarot
          tips={tips}
          setTip={(t: string) => setTip(t)}
          onLastCardSwipe={onLastCardSwipe}
        />
      )}
    </>
  );
};

export default JournalEntryDescription;

const styles = StyleSheet.create({
  inputField: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
    height: verticalScale(200),
    textAlignVertical: 'top',
    paddingTop: verticalScale(50),
    paddingHorizontal: 20,
    color: COLORS.neutral900,
    fontFamily: 'GeneralSans-Medium',
  },
  stat: {
    textAlign: 'center',
    color: '#B0171F',
    marginBottom: 1,
  },
});
