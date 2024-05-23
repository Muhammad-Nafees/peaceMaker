import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import NoBuddies from '../../components/accountability/NoBuddies';
import {STYLES} from '../../styles/globalStyles';
import ScreenTitle from '../../components/shared-components/ScreenTitle';
import BuddiesList from '../../components/accountability/BuddiesList';
import {LIST} from '../../constants/AccountabilityUserData';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {useEffect, useState, useCallback} from 'react';
import Toast from 'react-native-toast-message';
import {ApiService} from '../../utils/ApiService';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '../../constants/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList, User} from '../../interface/types';
import {refreshMyToken} from '../../utils/helpers';
import {useAppDispatch, useAppSelector} from '../../redux/app/hooks';
import {
  setAccessToken,
  setRefreshToken,
} from '../../redux/features/user/userSlice';
import {useIsKeyboardShowing} from '../../utils/Hooks/useIsKeyboard';
import Icon from 'react-native-vector-icons/Ionicons';
import Voice, {
  SpeechErrorEvent,
  SpeechRecognizedEvent,
} from '@react-native-voice/voice';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const AccountabilityBuddies2 = ({setMinDataSelected}: any) => {
  const navgation = useNavigation<NavigationProp>();
  const [buddies, setBuddies] = useState<any[]>([]);
  const accessToken = useAppSelector(state => state.user.tokens.accessToken);
  const refreshToken = useAppSelector(state => state.user.tokens.refreshToken);
  const [lastQuery, setLastQuery] = useState('');
  const [currQuery, setCurrQuery] = useState('');
  const [searchTxt, setsearchtxt] = useState('');
  const [users, setUsersState] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const setUsers = (e: User[], query = false) => {
    if (query) return setUsersState(e);
    if (e.length > 1) setUsersState(e);
    else setUsersState([]);
  };

  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [pageNum, setPageNum] = useState<number>(1);
  const user = useAppSelector((state: any) => state.user.data);

  const dispatch = useAppDispatch();
  const isKeyboard = useIsKeyboardShowing();

  const [speaking, setSpeaking] = useState(false);

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
    setSpeaking(false);
    console.log('Voice Ended: ' + e);
  };
  const onSpeechResultsHandler = async (e: any) => {
    setSpeaking(false);
    console.log('Voice Result: ' + e.value);
    setsearchtxt(prevSearch => prevSearch + ' ' + e.value[0]);
    getUsers(e.value[0], true);
    await Voice.stop();
  };

  function removeDuplicatesById(arr: User[]) {
    const idMap = {};

    const uniqueArray = arr.filter(item => {
      if (!idMap[item._id]) {
        idMap[item._id] = true;
        return true;
      }
      return false;
    });

    return uniqueArray;
  }

  const handleDataPress = (user: any) => {
    console.log(user);

    let tempArr: {id: string}[] = buddies;
    if (buddies.some(buddy => buddy._id === user._id)) {
      // setBuddies(() =>
      //   buddies.filter((existingUser: any) => existingUser.id != user.id),
      // );
      tempArr = tempArr.filter(
        (existingUser: any) => existingUser._id != user._id,
      );
    } else if (buddies.length < 4) {
      tempArr = [...buddies];
      tempArr.push(user);
      // setBuddies(arr);
    } else {
      Toast.show({
        type: 'info',
        text1: 'Unable To Add',
        text2: 'Maximum 4 Allowed!',
      });
    }
    setBuddies(tempArr);
  };

  const buddyList = (user: any) => {
    const isBuddy = buddies?.some(
      existingBuddies => existingBuddies._id == user.item._id,
    );

    return (
      <BuddiesList
        User={user.item}
        handleDataPress={handleDataPress}
        isBuddy={isBuddy}
      />
    );
  };

  const updateBuddies = async () => {
    if (!buddies?.length) return;
    navgation.navigate('AccountabilityPartner', {
      buddies,
    });
  };

  const getUsers = async (query = '', isQuery = false) => {
    console.log('page number:', pageNum);

    if (!query && isQuery && pageNum == null) {
      setPageNum(1);
    }

    if (query) setLastQuery(query);
    setCurrQuery(query);

    console.log('getting users...');

    if (pageNum !== 1 && pageNum != null) setLoadMoreLoading(true);

    try {
      const url = `user/search?${query ? `q=${query}` : ''}${
        !isQuery ? `${query ? '&' : ''}page=${pageNum}` : ''
      }`;
      console.log('🚀 getUsers ~ url:', url);
      const userSearch = new ApiService(url, accessToken);
      let userSearchRes = await userSearch.Get();

      if (userSearchRes?.status == 200) {
        if (userSearchRes?.data === null) return setLoading(false);
        if (isQuery) setUsers(userSearchRes.data.users, true);
        else {
          let arr = [...users, ...userSearchRes.data.users];
          arr = removeDuplicatesById(arr);
          setUsers(arr);
          console.log(
            '🚀 ~ getUsers ~ pagination:',
            userSearchRes.data.pagination,
          );
          setPageNum(userSearchRes.data.pagination.nextPage);
          // setPageNum(prevPgNum => prevPgNum + 1);
        }
        setLoadMoreLoading(false);
      } else if (userSearchRes?.status == 401) {
        const newTokens = await refreshMyToken(refreshToken);

        if (newTokens.status == 200) {
          dispatch(setAccessToken(newTokens?.data.accessToken));
          dispatch(setRefreshToken(newTokens?.data.refreshToken));
          getUsers('');
        }
      } else {
        if (loadMoreLoading) setLoadMoreLoading(false);
      }
      setLoading(false);
    } catch (error) {
      console.log('🚀 ~ file: index.tsx:61 ~ getUsers ~ error:', error);
      Toast.show({type: 'error', text1: 'Process Failed!'});
    }
  };

  const renderFooter = useCallback(() => {
    return (
      <View style={{alignItems: 'center', margin: 10}}>
        {loadMoreLoading && (
          <ActivityIndicator color={COLORS.mainGreen} size="large" />
        )}
      </View>
    );
  }, [loadMoreLoading]);

  useEffect(() => {
    if (buddies.length >= 2) {
      setMinDataSelected(true);
    } else {
      setMinDataSelected(false);
    }
  }, [buddies, users]);

  useEffect(() => {
    navgation.setOptions({
      headerRight: () => (
        <>
          {users && users?.length > 1 ? (
            <TouchableOpacity
              onPress={() => (buddies?.length >= 2 ? updateBuddies() : null)}>
              <Text
                style={{
                  color:
                    buddies?.length < 2 ? COLORS.neutral200 : COLORS.mainGreen,
                }}>
                Done
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navgation.navigate('CompleteProfile')}>
              <Text
                style={{
                  color: COLORS.mainGreen,
                }}>
                Skip
              </Text>
            </TouchableOpacity>
          )}
        </>
      ),
    });
  }, [buddies, users]);

  useEffect(() => {
    if (!isKeyboard && lastQuery.length === 1 && !currQuery.length) {
      setPageNum(2);
      getUsers();
    }
  }, [isKeyboard]);

  useEffect(() => {
    setLoading(true);
    getUsers();
  }, []);

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

  return (
    <View style={[STYLES.dev1__container, {paddingBottom: 0}]}>
      <ScreenTitle
        title="Connect with your accountability buddies"
        description="Choose at least two to continue.."
      />
      <View
        style={{
          borderRadius: moderateScale(12),
          paddingTop: 0,
          zIndex: 1,
          backgroundColor: 'rgba(118, 118, 128, 0.12);',
          flexDirection: 'row',
          alignItems: 'center',
          height: 40,
          marginTop: 20,
        }}>
        <Icon
          name="search"
          color="#818286"
          size={20}
          style={{paddingLeft: 10}}
        />
        <TextInput
          placeholder="Search"
          style={styles.input}
          placeholderTextColor={'rgba(60, 60, 67, 0.6);'}
          value={searchTxt}
          onChangeText={q => {
            setsearchtxt(q);
            getUsers(q, true);
          }}
        />
        <TouchableOpacity onPress={speak} style={{paddingRight: 10}}>
          <Icon
            name="mic"
            color={speaking ? COLORS.mainGreen : '#818286'}
            size={22}
          />
        </TouchableOpacity>
      </View>
      {/* <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search"
          style={styles.input}
          placeholderTextColor={'rgba(60, 60, 67, 0.6);'}
          //   onChangeText={data => searchUsers(data)}
          onChangeText={q => getUsers(q, true)}
          // onPressIn={() => setIsSearch(true)}
        />
        <Image
          source={require('../../../assets/icons/magnifyingglass.png')}
          alt="icon"
          style={styles.searchIcon}
        />
        <TouchableOpacity style={styles.micIcon}>
          <Image
            source={require('../../../assets/icons/microphone.png')}
            alt="icon"
            // style={styles.micIcon}
          />
        </TouchableOpacity>
      </View> */}
      {users && !loading ? (
        <>
          {users?.length > 0 ? (
            <FlatList
              data={users}
              renderItem={userData =>
                userData.item._id === user._id ? null : buddyList(userData)
              }
              onEndReachedThreshold={0}
              onEndReached={() => getUsers()}
              ListFooterComponent={renderFooter}
              keyExtractor={(_, index) => index.toString()}
            />
          ) : (
            <NoBuddies />
          )}
        </>
      ) : (
        <View style={{ marginTop: 10}}>
        <ActivityIndicator color={COLORS.mainGreen} size={'large'} />
        </View>
      )}
    </View>
  );
};

export default AccountabilityBuddies2;

const styles = StyleSheet.create({
  searchContainer: {
    marginTop: verticalScale(28),
    paddingHorizontal: horizontalScale(33),
    borderRadius: moderateScale(10),

    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    position: 'relative',
    marginBottom: horizontalScale(8),
  },
  input: {
    color: 'black',
    fontSize: moderateScale(15),

    height: '100%',
    // paddingTop: verticalScale(13),
    borderColor: COLORS.inActive,
    backgroundColor: 'transparent',
    // paddingLeft: horizontalScale(36),
    // borderRightColor: 'red',
    marginTop: -1,
    flex: 1,
  },
  searchIcon: {
    // width: horizontalScale(16),
    position: 'absolute',
    top: verticalScale(18),
    left: horizontalScale(10),
  },
  micIcon: {
    // width: horizontalScale(12),
    position: 'absolute',
    top: verticalScale(16),
    right: horizontalScale(10),
  },
});
