import React, {useState, useEffect} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import ChallengeCard from '../../components/daily-challenges/ChallengeCard';
import RemindersCard from '../../components/daily-challenges/RemindersCard';
import GoalCard from '../../components/daily-challenges/GoalCard';
import NotifyCard from '../../components/daily-state/NotifyCard';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import CustomButton from '../../components/shared-components/CustomButton';
import {Modal} from 'react-native';
import {Image} from 'react-native';
import {COLORS} from '../../constants/colors';
import {BlurView} from '@react-native-community/blur';
import {Challenge, StartedChallenge} from '../../interface/types';
import {ApiService} from '../../utils/ApiService';
import Navigation from '../../utils/appNavigation';
import {useAppSelector} from '../../redux/app/hooks';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Toast from 'react-native-root-toast';

const ChallengeDetails = ({route}: {route: any}) => {
  const [switchValue, setSwitchValue] = useState<boolean>();
  const [challengeDonePopup, setChallengeDonePopup] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [heDid, setHeDid] = useState<boolean>(false);
  const [cLoading, setCLoading] = useState(false);
  const [beNotified, setBeNotified] = useState<boolean>(false);
  const [startedChallenge, setStartedChallenge] = useState<
    StartedChallenge | undefined
  >(route.params?.startedChallenge);
  const navigation = useNavigation();

  const challengeData: Challenge = route.params?.data;

  const challengeStartDate = new Date(startedChallenge?.createdAt!);
  const challengeEndDate = new Date();

  // Add one day (24 hours) to the current date
  challengeEndDate.setHours(
    challengeEndDate.getHours() + challengeData.duration,
  );

  const challengeExpiryDate = new Date(
    startedChallenge?.expireOn ? startedChallenge?.expireOn : challengeEndDate,
  );

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const currentDate = new Date();
      const timeDifference =
        challengeExpiryDate.valueOf() - currentDate.valueOf();

      if (timeDifference <= 0) {
        // Challenge has expired
        setTimeLeft('0:00');
        timerExpired();
      } else {
        // Calculate days, hours, minutes, and seconds left
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor(
          (timeDifference % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        setTimeLeft(
          `${addLeadingZero(days)}d:${addLeadingZero(hours)}h:${addLeadingZero(
            minutes,
          )}m:${addLeadingZero(seconds)}s`,
        );
      }
    };

    // Calculate time left immediately and update it every second
    calculateTimeLeft();
    const intervalId = setInterval(calculateTimeLeft, 1000);

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const {tokens, data: user} = useAppSelector(state => state.user);
  const nextChallengeId: string | null = route.params?.nextChallengeId;
  const isFocused = useIsFocused();

  const closePopup = () => {
    setChallengeDonePopup(false);
    Navigation.back();
  };

  const openPopup = () => {
    setChallengeDonePopup(true);
    setTimeout(() => {
      closePopup();
    }, 3000);
  };

  const startNextChallenge = async (challengeID = nextChallengeId) => {
    return;
    if (!challengeID) return;
    console.log('Starting challenge...');

    try {
      const reqObj = {
        user: user._id,
        challenge: challengeID,
      };
      const startChallengeReq = new ApiService(
        'challenge/start',
        tokens.accessToken,
        false,
      );
      const startChallengeRes = await startChallengeReq.Post(reqObj);

      if (startChallengeRes.status !== 200)
        console.log('Error starting challenge: ', startChallengeRes?.message);
    } catch (error) {}
  };

  const handleSetBeNotified = (setting: boolean) => {
    setBeNotified(setting);
  };

  const handleBeNotified = () =>
    Navigation.navigate('JournalEntry', {
      fromChallenges: true,
      handleSetBeNotified: handleSetBeNotified,
      id: challengeData._id,
      startedChallenge: startedChallenge,
    });

  const completeChallenge = async () => {
    // if (isExpired) {
    //   openPopup();
    //   return;
    // }
    setCLoading(true);

    setHeDid(true);
    console.log('Completing challenge');

    try {
      const completeChallengeReq = new ApiService(
        `challenge/complete/${challengeData?._id}`,
        tokens.accessToken,
        false,
      );
      const completeChallengeRes = await completeChallengeReq.Put({});
      console.log("~ completeChallengeRes:", completeChallengeRes)
      if (completeChallengeRes.status === 200) {
        startNextChallenge();
        openPopup();
      }
      setCLoading(false);
    } catch (error) {
      console.log('completeChallenge ~ error:', error);
      setCLoading(false);
    }
  };

  const skipChallenge = async (showPopUp = true) => {
    setCLoading(true);
    if (showPopUp) setHeDid(false);
    console.log('skiping challenge');

    try {
      const skipChallengeReq = new ApiService(
        `challenge/skip/${challengeData?._id}`,
        tokens.accessToken,
        false,
      );
      const skipChallengeRes = await skipChallengeReq.Put({});
      console.log('~ skipChallengeRes:', skipChallengeRes);
      if (skipChallengeRes.status === 200) {
        startNextChallenge();
        setCLoading(false);
        if (showPopUp) {
          setHeDid(false);
          openPopup();
        } else {
          Navigation.back();
        }
      }
    } catch (error) {
      console.log('~ skipChallenge ~ error:', error);
      setCLoading(false);
    }
  };

  const timerExpired = () => {
    console.log('Timer has expired!');
    setIsExpired(true);
    // Perform any action you want when the timer expires
  };

  function addLeadingZero(number: number) {
    return number < 10 ? `0${Math.floor(number)}` : `${Math.floor(number)}`;
  }

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours < 0 ? addLeadingZero(0) : addLeadingZero(hours)}h:${
      minutes < 0 ? addLeadingZero(0) : addLeadingZero(minutes)
    }m:${seconds < 0 ? addLeadingZero(0) : addLeadingZero(seconds)}s`;
  };

  const getUserTotalPoints = async () => {
    try {
      const points = new ApiService(
        `challenge/points/?userId=${user._id}`,
        tokens.accessToken,
      );
      const pointsRes = await points.Get();
      if (pointsRes.status === 200)
        navigation.setParams({
          ...route.params,
          totalPoints: pointsRes.data.totalPoints,
        });
    } catch (error) {}
  };

  useEffect(() => {
    getUserTotalPoints();
  }, []);

  useEffect(() => {
    if (route.params?.startedChallenge)
      setStartedChallenge(route.params?.startedChallenge);
  }, []);

  const getLastChallenge = async () => {
    try {
      const lastChallenge = new ApiService(
        'challenge/last',
        tokens.accessToken,
        false,
      );
      const lastChallengeRes = await lastChallenge.Get();

      if (lastChallengeRes.status === 200 || lastChallengeRes.status === 404)
        if (!lastChallengeRes?.data) {
          console.log('No Last Challenge: ', lastChallengeRes?.data);
          setStartedChallenge(undefined);
        } else {
          const lastChallengeData: StartedChallenge | undefined =
            lastChallengeRes?.data;
          console.log('Last Challenge Found: ', lastChallengeData);
          setStartedChallenge(lastChallengeData);

          const isAddress =
            lastChallengeData?.address === 'null'
              ? false
              : lastChallengeData?.address;

          const anyReminder = lastChallengeData?.reminders?.find(
            r => r.isActive === true,
          );

          if (
            isAddress ||
            anyReminder ||
            lastChallengeData?.customReminder?.isActive
          )
            handleSetBeNotified(true);
        }
    } catch (error) {}
  };

  useEffect(() => {
    if (isFocused) {
      setTimeout(() => {
        setCLoading(false);
      }, 200);
      getLastChallenge();
    }
  }, [isFocused]);

  const loader = (): any => (
    <View
      style={{
        backgroundColor: 'transparent',
        opacity: 1,
      }}>
      <ActivityIndicator color="#fff" size={30} />
    </View>
  );

  return (
    <View
      style={[STYLES.dev1__homeContainer, {paddingBottom: 0, paddingTop: 0}]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Toast
          visible={cLoading}
          position={Toast.positions.TOP}
          shadow={false}
          animation={true}
          // hideOnPress={true}
          delay={0}
          opacity={1}
          backgroundColor="transparent">
          {loader()}
        </Toast>
        <View style={{height: 10}} />
        <ChallengeCard
          challenge={challengeData?.name}
          level={challengeData?.challenge}
          instruction={challengeData?.instructions}
        />
        <RemindersCard points={challengeData.points} time={timeLeft} />
        <GoalCard goal={challengeData?.goal} />
        <View style={[styles.container]}>
          <NotifyCard
            onPress={handleBeNotified}
            switchValue={beNotified}
            setSwitchValue={handleBeNotified}
            content={'Be Notified'}
            iconName="notifications-outline"
          />
        </View>
        <View style={{marginTop: verticalScale(20)}}>
          <Text
            style={[
              STYLES.dev1__text13,
              {
                fontWeight: '500',
                fontFamily: 'GeneralSans-Medium',
                color: 'rgba(123, 141, 149, 1)',
              },
            ]}>
            Were you able to complete the challenge?
          </Text>
        </View>
        <View style={{flexDirection: 'row', gap: 10}}>
          <CustomButton
            extraStyles={{
              width: horizontalScale(160),
              backgroundColor: !isExpired ? '#e7eaeb' : 'rgba(253, 0, 58, 1)',
              marginTop: verticalScale(20),
            }}
            buttonTextStyle={{color: !isExpired ? '#BDBDBD' : 'white'}}
            disabledTxtOpacity={1}
            isDisabled={!isExpired}
            onPress={skipChallenge}>
            No, I Did Not
          </CustomButton>
          <CustomButton
            isDisabled={!isExpired}
            extraStyles={{
              width: horizontalScale(160),
              marginTop: verticalScale(20),
            }}
            onPress={completeChallenge}
            buttonTextStyle={{color: !isExpired ? '#BDBDBD' : '#134555'}}
            disabledTxtOpacity={1}>
            Yes, I Did
          </CustomButton>
        </View>
        <TouchableOpacity
          style={{marginVertical: verticalScale(20), alignItems: 'center'}}
          onPress={() => skipChallenge(false)}>
          <Text
            style={[
              STYLES.dev1__text13,
              {
                fontWeight: '500',
                fontFamily: 'GeneralSans-Medium',
                color: 'rgba(123, 141, 149, 1)',
                textDecorationLine: 'underline',
              },
            ]}>
            Skip Challenge
          </Text>
        </TouchableOpacity>
        {challengeDonePopup && (
          <BlurView
            style={styles.absolute}
            blurType="light"
            blurAmount={1}
            reducedTransparencyFallbackColor="white"
          />
        )}
        <Modal
          visible={challengeDonePopup}
          transparent
          animationType="fade"
          onRequestClose={closePopup}>
          <View style={styles.modalContainer}>
            <View style={styles.modalInnerContainer}>
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Image
                  source={
                    heDid
                      ? require('../../../assets/images/passchange.png')
                      : require('../../../assets/images/warning1.png')
                  }
                  alt="img"
                />
                {!heDid ? (
                  <Text
                    style={[
                      STYLES.dev1__text18,
                      {
                        color: COLORS.primary500,
                        textAlign: 'center',
                        marginTop: verticalScale(24),
                      },
                    ]}>
                    Times up!
                  </Text>
                ) : (
                  <Text
                    style={[
                      STYLES.dev1__text18,
                      {
                        color: COLORS.primary500,
                        textAlign: 'center',
                        marginTop: verticalScale(24),
                      },
                    ]}>
                    You’ve gained{' '}
                    <Text style={{fontWeight: '900'}}>
                      {challengeData.points} point
                    </Text>{' '}
                    for successfully accomplishing Challenge {challengeData?.challenge}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

export default ChallengeDetails;

const styles = StyleSheet.create({
  container: {
    marginTop: verticalScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
    borderRadius: 16,
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalInnerContainer: {
    // marginHorizontal: horizontalScale(16),
    position: 'absolute',
    bottom: verticalScale(55),
    backgroundColor: '#ffffff',
    width: horizontalScale(343),
    // height: verticalScale(270),
    borderRadius: moderateScale(16),
    paddingHorizontal: 40,
    paddingVertical: 20,
    justifyContent: 'center',
    textAlign: 'center',
  },
});
