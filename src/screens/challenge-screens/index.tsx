import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {STYLES} from '../../styles/globalStyles';
import {COLORS} from '../../constants/colors';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import Icon from 'react-native-vector-icons/Ionicons';
import {useEffect} from 'react';
import {ApiService} from '../../utils/ApiService';
import {Challenge, StartedChallenge} from '../../interface/types';
import {useIsFocused} from '@react-navigation/native';
import {useAppSelector} from '../../redux/app/hooks';
import {
  c1Styles,
  c2Styles,
  c3Styles,
  c4Styles,
  c5Styles,
  c6Styles,
  c7Styles,
} from './styles';
import {
  flower,
  flowerBranch,
  flowerSm,
  flowerXSm,
  levelImages,
  lockImage,
  lockWChallengeTxt,
  paths,
  starImg,
} from './Images';
import Toast from 'react-native-root-toast';
import {Toast as ToastMessage} from 'react-native-toast-message/lib/src/Toast';

// const MAX_CHALLENGES = 7;
// const FINITE_CHALLENGES = [
//   1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8,
//   3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8,
// ];

const ChallengeScreen = ({navigation}: any) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentChallenge, setCurrentChallenge] = useState(1);

  const [userChallenges, setUserChallenges] = useState<Challenge[] | null>(
    null,
  );

  const [startedChallenge, setStartedChallenge] =
    useState<StartedChallenge | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<
    StartedChallenge[] | null
  >(null);
  const [imgLoading, setImageLoading] = useState(false);
  const [allChallengeCompleted, setAllChallengeCompleted] = useState(false);

  const [loading, setLoading] = useState(false);

  const scrollViewRef: React.LegacyRef<ScrollView> | undefined = useRef(null);

  const {data, tokens} = useAppSelector(state => state.user);
  const user = data;
  const isFocused = useIsFocused();

  function findClosestGreaterNumber(arr: any, num: number) {
    let closestNumber = null;
    let closestDifference = Infinity;

    for (let i = 0; i < arr.length; i++) {
      const difference = arr[i].challenge - num;

      if (difference > 0 && difference < closestDifference) {
        closestNumber = arr[i].challenge;
        closestDifference = difference;
      }
    }

    return closestNumber;
  }

  //
  const startChallenge = async (challengeID: string | undefined) => {
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

      return startChallengeRes?.data;
    } catch (error) {}
  };

  const handleChallengePress = async (challengePressed: number) => {
    if (allChallengeCompleted)
      return ToastMessage.show({
        type: 'info',
        text1: "You've completed all challenges.",
      });
    if (challengePressed !== currentChallenge) return;
    if (imgLoading) return;
    setImageLoading(true);
    if (startedChallenge?._id) {
      if (!startedChallenge?.challenge) return setImageLoading(false);

      const nextChallengeId = userChallenges?.find(
        elem => elem.challenge === startedChallenge?.challenge.challenge + 1,
      )?._id;
      if (startedChallenge.status !== 'expired')
        startChallenge(startedChallenge?.challenge?._id);
      setImageLoading(false);
      navigation.navigate('ChallengeDetails', {
        data: startedChallenge?.challenge,
        startedChallenge,
        nextChallengeId,
      });
    } else {
      const curChallenge = userChallenges?.find(
        uc => uc.challenge === currentChallenge,
      );
      if (!curChallenge) {
        setImageLoading(false);
        ToastMessage.show({
          type: 'info',
          text1: 'Challenge not found.',
        });
        return;
      }
      const startedChallengeres = await startChallenge(curChallenge?._id);
      setImageLoading(false);
      startedChallengeres['challenge'] = curChallenge;
      navigation.navigate('ChallengeDetails', {
        data: curChallenge,
        startedChallenge: startedChallengeres,
      });
    }
  };

  const getUserChallenges = async (level: number) => {
    console.log('called---------------------------------' + level);

    const challengeReq = new ApiService(
      `challenge/level/${level}`,
      tokens.accessToken,
    );
    const challengeRes = await challengeReq.Get();

    const challengeResData: Challenge[] = challengeRes?.data;

    if (challengeRes.status !== 200 || !challengeResData?.length)
      return setLoading(false);

    let arr: Challenge[] = [];
    challengeResData.forEach((el, i) => {
      let styleNum: number = i + 1;

      if (styleNum > 8) styleNum = arr[i - 1].abc + 1;
      if ((styleNum - 1) % 7 === 0 && i > 0) styleNum = 2;

      arr.push({...el, abc: styleNum});
    });

    setUserChallenges([...arr]);
    setCurrentChallenge(arr[arr.length - 1].challenge);

    setAllChallengeCompleted(true);
    setCurrentLevel(level);
    setLoading(false);
  };

  const setAllChallengesByLevel2 = async (level = 0) => {
    try {
      const challenge = new ApiService(
        `challenge/level/${level}`,
        tokens.accessToken,
      );
      const challengeRes = await challenge.Get();

      const challengeResData: Challenge[] = challengeRes?.data;

      if (challengeRes.status !== 200 || !challengeResData.length)
        return setLoading(false);

      let arr: Challenge[] = [];
      challengeResData.forEach((el, i) => {
        let styleNum: number = i + 1;

        if (styleNum > 8) styleNum = arr[i - 1].abc + 1;
        if ((styleNum - 1) % 7 === 0 && i > 0) styleNum = 2;

        arr.push({...el, abc: styleNum});
      });

      setUserChallenges([...arr]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  //
  const getAllChallengesByLevel = async (
    lastChallengeStatus = '',
    lastLevel = 0,
    lastChallenge = 0,
  ) => {
    try {
      // const levelForCurrentChallengeFetch = lastLevel
      //   ? lastChallenge >=
      //     (lastChallengeStatus === 'completed'
      //       ? MAX_CHALLENGES
      //       : MAX_CHALLENGES + 1)
      //     ? lastLevel + 1
      //     : lastLevel
      //   : 1;
      const levelForCurrentChallengeFetch = lastLevel ? lastLevel : 1;
      const challenge = new ApiService(
        `challenge/level/${levelForCurrentChallengeFetch}`,
        tokens.accessToken,
        false,
      );
      const challengeRes = await challenge.Get();

      const challengeResData: Challenge[] = challengeRes?.data;

      if (challengeResData == null) return getUserChallenges(lastLevel - 1);

      if (challengeRes.status === 200 && challengeResData.length) {
        // checking if there are any more challenges to do in this level
        // const moreChallenges = challengeResData?.filter(
        //   dc =>
        //     dc.challenge >
        //     (lastChallenge >= MAX_CHALLENGES ? 1 : lastChallenge),
        // );
        const moreChallenges = challengeResData?.filter(
          dc => dc.challenge > lastChallenge,
        );
        // if not then moving to the next level
        if (!moreChallenges.length) {
          // log
          setCurrentLevel(lastLevel + 1);
          setCurrentChallenge(1);
          getAllChallengesByLevel('', lastLevel + 1);
          setLoading(false);
          return;
        }

        if (lastLevel && lastChallenge) {
          const cChallenge =
            lastChallenge === 0
              ? 1
              : // : lastChallengeStatus === 'completed' ||lastChallengeStatus === 'skipped'
                findClosestGreaterNumber(challengeResData, lastChallenge);
          // : lastChallenge;

          setCurrentLevel(levelForCurrentChallengeFetch);
          setCurrentChallenge(cChallenge ? cChallenge : 1);
        } else {
          setCurrentChallenge(moreChallenges[0].challenge);
        }

        let arr: Challenge[] = [];
        challengeResData.forEach((el, i) => {
          let styleNum: number = i + 1;

          if (styleNum > 8) styleNum = arr[i - 1].abc + 1;
          if ((styleNum - 1) % 7 === 0 && i > 0) styleNum = 2;

          arr.push({...el, abc: styleNum});
        });

        setUserChallenges([...arr]);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  //
  // const getLastChallenge = async () => {
  //   try {
  //     const lastChallenge = new ApiService(
  //       'challenge/last',
  //       tokens.accessToken,
  //       false,
  //     );
  //     const lastChallengeRes = await lastChallenge.Get();

  //     if (lastChallengeRes.status === 200 || lastChallengeRes.status === 404)
  //       if (!lastChallengeRes?.data) {
  //         console.log('No Last Challenge: ', lastChallengeRes?.data);

  //         setCurrentLevel(1);
  //         setCurrentChallenge(1);
  //         getAllChallengesByLevel();
  //       } else {
  //         console.log('Last Challenge Found: ', lastChallengeRes?.data);
  //         const lastChallengeStatus = lastChallengeRes?.data?.status;

  //         const {level, challenge} = lastChallengeRes?.data?.challenge;
  //         const isStarted = lastChallengeStatus === 'started';
  //         // || lastChallengeStatus === 'expired';
  //         const lastLevel = isStarted ? level - 1 : level;
  //         const lastchallenge = isStarted ? challenge - 1 : challenge;

  //         if (lastLevel === 0) setCurrentLevel(1);

  //         if (lastchallenge === 0) setCurrentChallenge(1);

  //         if (isStarted) setStartedChallenge(lastChallengeRes?.data);
  //         else setStartedChallenge(null);

  //         // if (
  //         //   lastLevel === 0 &&
  //         //   lastChallenge !== 0 &&
  //         //   isStarted
  //         // )
  //         if (lastchallenge !== 0 && isStarted) setCurrentChallenge(challenge);

  //         getAllChallengesByLevel(
  //           lastChallengeStatus,
  //           lastLevel,
  //           lastchallenge,
  //         );
  //         // getAllChallengesByLevel(lastChallengeStatus, 9, 105);
  //       }
  //   } catch (error) {}
  // };
  const getLastChallenge = async (lastChallengeRes: any) => {
    console.log('getting last challenge -------------------------------------');

    const lastChallengeStatus = lastChallengeRes?.data?.status;

    const {level, challenge} = lastChallengeRes?.data?.challenge;
    const isStarted = lastChallengeStatus === 'started';
    // || lastChallengeStatus === 'expired';
    const lastLevel = isStarted ? level - 1 : level;
    const lastchallenge = isStarted ? challenge - 1 : challenge;

    if (lastLevel === 0) setCurrentLevel(1);

    if (lastchallenge === 0) setCurrentChallenge(1);

    if (isStarted) setStartedChallenge(lastChallengeRes?.data);
    else setStartedChallenge(null);

    // if (
    //   lastLevel === 0 &&
    //   lastChallenge !== 0 &&
    //   isStarted
    // )
    if (lastchallenge !== 0 && isStarted) setCurrentChallenge(challenge);

    getAllChallengesByLevel(lastChallengeStatus, lastLevel, lastchallenge);
  };

  const getUserCompletedChallenges = async () => {
    try {
      const completedChallngesReq = new ApiService(
        `challenge/completed?userId=${user._id}`,
        tokens.accessToken,
      );
      const completedChallngesRes = await completedChallngesReq.Get();

      if (completedChallngesRes.status === 200)
        setCompletedChallenges(completedChallngesRes?.data?.dailyChallenges);
    } catch (error) {}
  };

  const getUserSchedules = async () => {
    try {
      const userSchedules = new ApiService(
        'challenge/upcoming',
        tokens.accessToken,
      );
      return await userSchedules.Get();
    } catch (error) {
    }
  };

  const handleDailyChallenges = async () => {
    try {
      const lastChallenge = new ApiService(
        'challenge/last',
        tokens.accessToken,
      );
      const lastChallengeRes = await lastChallenge.Get();

      if (lastChallengeRes.status !== 200 && lastChallengeRes.status !== 404)
        return ToastMessage.show({
          type: 'info',
          text1: 'Something went wrong.',
          text2: 'Please try again later',
        });

      if (!lastChallengeRes?.data) {
        console.log('No Last Challenge: ', lastChallengeRes?.data);

        setCurrentLevel(1);
        setCurrentChallenge(1);
        getAllChallengesByLevel();
      } else {
        console.log(
          'Last Challenge Found: ',
          lastChallengeRes?.data?.challenge?._id,
        );
        const lastChallengeStatus = lastChallengeRes?.data?.status;

        const {level, challenge} = lastChallengeRes?.data?.challenge;

        const isCompleted =
          lastChallengeStatus === 'completed' ||
          lastChallengeStatus === 'skipped';

        const isStarted = lastChallengeStatus === 'started';

        if (isStarted) {
          setCurrentLevel(level);
          setCurrentChallenge(challenge);
          setStartedChallenge(lastChallengeRes?.data);
          setAllChallengesByLevel2(level);
          return;
        }
        if (!isCompleted) return getLastChallenge(lastChallengeRes);

        const isAllLevelsDone = !(await getUserSchedules())?.data?.length;
        if (isAllLevelsDone) getUserChallenges(level);
        else getLastChallenge(lastChallengeRes);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    if (isFocused) {
      setAllChallengeCompleted(false);
      setLoading(true);
      getUserCompletedChallenges();
      // getLastChallenge();

      handleDailyChallenges();
    }
    if (!isFocused) setImageLoading(false);
  }, [isFocused]);

  useEffect(() => {
    navigation.setOptions({tabBarStyle: {display: 'none'}});
  }, []);

  const isChallengeOpen = (n: number) =>
    currentChallenge === n || currentChallenge > n;

  const isChallengeCompleted = (challenge: number) =>
    completedChallenges?.find(elem => elem?.challenge?.challenge === challenge);

  const challengeStyles = {
    1: c1Styles,
    2: c2Styles,
    3: c3Styles,
    4: c4Styles,
    5: c5Styles,
    6: c6Styles,
    7: c7Styles,
    8: c7Styles,
  };

  const challengeAvailable = (c: number) =>
    userChallenges?.find(e => e.challenge === c);

  const loader = (): any => (
    <View
      style={{
        backgroundColor: 'transparent',
        opacity: 1,
      }}>
      <ActivityIndicator color="#8eb26f" size={30} />
    </View>
  );

  const renderChallenge = (elem: Challenge, index: number) => {
    // if (elem.challenge > 14) return;
    // if (!challengeAvailable(Number(l))) return;

    // ? FINITE_CHALLENGES[elem.challenge - 1 - 6] - (index + 1)

    // if (elem.challenge !== 7 && elem.challenge % 7 === 0)
    //   userChallenges[index].abc = 2;
    const l: any = elem.abc;

    const challengeStyle = challengeStyles[l as keyof typeof challengeStyles];
    const secondPath = paths.find(p => p === `${l}.1`);
    return (
      <View
        style={[challengeStyle.challengeContainer, {zIndex: -elem.challenge}]}
        key={index}>
        <Image
          source={levelImages.path[l as keyof typeof levelImages.path]}
          resizeMode="stretch"
          style={challengeStyle.pathImg}
        />
        <Image
          source={levelImages.grass[l as keyof typeof levelImages.grass]}
          resizeMode="stretch"
          style={styles.container100}
        />
        <View style={challengeStyle.mainLeafContainer}>
          <View style={styles.container100}>
            {userChallenges &&
            secondPath &&
            userChallenges[userChallenges.length - 1].challenge !==
              elem.challenge ? (
              <Image
                source={levelImages.path[secondPath]}
                resizeMode="stretch"
                style={challengeStyle.secondPath}
              />
            ) : null}
            <Image
              source={levelImages.leaf[l as keyof typeof levelImages.leaf]}
              resizeMode="stretch"
              style={[styles.container100, l == 2 ? {} : styles.zIndexMinus1]}
            />
            {elem.challenge == currentChallenge &&
            currentChallenge === startedChallenge?.challenge.challenge &&
            !allChallengeCompleted ? (
              <Image
                source={flowerBranch}
                resizeMode="stretch"
                style={[challengeStyle.flower, {height: 40}]}
              />
            ) : Number(l) < currentChallenge ? (
              !isChallengeCompleted(Number(elem.challenge)) ? null : (
                <Image
                  source={
                    flower
                  }
                  resizeMode="stretch"
                  style={[challengeStyle.flower, {width: 40,
                    height: 80,}]}
                />
              )
            ) : null}
            <View style={challengeStyle.rockContainer}>
              <TouchableOpacity
                onPress={() => handleChallengePress(Number(elem.challenge))}
                style={[challengeStyle.alignCenter, {zIndex: 100000000}]}>
                <>
                  {isChallengeOpen(Number(elem.challenge)) ? (
                    <View style={challengeStyle.challengeNameContainer}>
                      <Image
                        source={starImg}
                        resizeMode="contain"
                        style={
                          challengeStyles[l as keyof typeof challengeStyles]
                            .starimg
                        }
                      />
                      <Text
                        onPress={() =>
                          handleChallengePress(Number(elem.challenge))
                        }
                        style={styles.challengeTxt}>
                        Challenge {elem.challenge}
                      </Text>
                    </View>
                  ) : (
                    <Image
                      source={
                        elem.challenge == 2 ? lockWChallengeTxt : lockImage
                      }
                      resizeMode="contain"
                      style={challengeStyle.lockImg}
                    />
                  )}
                </>
              </TouchableOpacity>
              <Image
                source={levelImages.rock[l as keyof typeof levelImages.rock]}
                resizeMode="stretch"
                style={challengeStyle.rockImg}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <View
        style={{
          height: verticalScale(60),
          flexDirection: 'row',
          paddingHorizontal: horizontalScale(20),
          alignItems: 'center',
          backgroundColor: 'white',
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={24} color={COLORS.primary400} />
        </TouchableOpacity>
        <Text
          style={[
            STYLES.dev1__text16,
            {
              color: COLORS.neutral900,
              fontFamily: 'GeneraLSans-Regular',
              paddingLeft: horizontalScale(80),
            },
          ]}>
          Daily Challenges{' '}
        </Text>
      </View>
      {imgLoading ? (
        <Toast
          visible={imgLoading}
          position={Toast.positions.TOP}
          shadow={false}
          animation={true}
          hideOnPress={true}
          delay={0}
          opacity={1}
          backgroundColor="transparent">
          {loader()}
        </Toast>
      ) : null}
      {loading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: Dimensions.get('screen').height,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}>
          <ActivityIndicator color={'lightgrey'} size="large" />
        </View>
      )}
      {/* <View
        style={[
          styles.container,
          {flex: 1, backgroundColor: 'red', paddingTop: 20},
        ]}>
        <FlatList
          inverted
          data={userChallenges}
          keyExtractor={e => e._id}
          renderItem={({item, index}) => renderChallenge(item, index)}
        />
      </View> */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-end',
          flexDirection: 'column',
        }}
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({animated: true})
        }
        style={{flex: 1, backgroundColor: 'white'}}>
        <View
          style={[
            styles.container,
            {flex: 1, backgroundColor: 'white', paddingTop: 80},
          ]}>
          {userChallenges
            // ?.slice(0, 7)
            ?.map((elem, index) => renderChallenge(elem, index))}
        </View>
      </ScrollView>
      <View style={{height: 15, backgroundColor: '#8e4b48', width: '100%'}} />
      <View
        style={{
          // height: verticalScale(140),
          // flex: 1,
          backgroundColor: 'rgba(39, 145, 181, 1)',
          // justifyContent: 'center',
          paddingHorizontal: horizontalScale(20),
          gap: 10,
          paddingVertical: 15,
        }}>
        <Text
          style={[
            STYLES.dev1__text28,
            {fontFamily: 'Satoshi-Bold', color: 'white'},
          ]}>
          Level{' '}
          {/* {!userChallenges || !userChallenges?.length
            ? currentLevel - 1
            : currentLevel} */}
          {currentLevel}
        </Text>
        <Text
          style={[
            STYLES.dev1__text13,
            {
              fontWeight: '400',
              fontFamily: 'GeneralSans-Extralight',
              color: 'rgba(140, 214, 239, 1)',
              fontStyle: 'italic',
            },
          ]}>
          “
          {
            userChallenges?.find(cc => cc.level === currentLevel)
              ?.scriptureOrQuote
          }
          ”
        </Text>
      </View>
    </>
  );
};

export default ChallengeScreen;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'column-reverse',
    width: '100%',
    // bottom: 0
    // marginTop: 100,
  },
  container100: {
    width: '100%',
    height: '100%',
  },
  zIndexMinus1: {
    zIndex: -1,
  },
  challengeTxt: {
    fontWeight: '400',
    fontSize: 13,
    marginTop: 10,
    color: 'white',
  },
});
