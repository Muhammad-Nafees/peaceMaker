import React, {useEffect, useCallback, useState} from 'react';
import {View, FlatList, ActivityIndicator} from 'react-native';
import Toast from 'react-native-toast-message';
import {useDispatch} from 'react-redux';

import SegmentedControl from '../../../components/SegmentedControl';
import {COLORS} from '../../../constants/colors';
import SearchProfile from '../../../components/profile/Search';
import AccountabilityList from '../../../components/profile/AccList';
import {ApiService} from '../../../utils/ApiService';
import {useAppSelector} from '../../../redux/app/hooks';
import {getUpdatedUserData, refreshMyToken} from '../../../utils/helpers';
import {
  setAccessToken,
  setRefreshToken,
  setUserData,
} from '../../../redux/features/user/userSlice';
import {User} from '../../../interface/types';
import {useIsKeyboardShowing} from '../../../utils/Hooks/useIsKeyboard';
import Navigation from '../../../utils/appNavigation';
import {useIsFocused} from '@react-navigation/native';

export default function AccountablityNetwork() {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [users, setUsers] = useState<User[]>([]);
  const [myBuddies, setMyBuddies] = useState<User[]>([]);
  const user: User = useAppSelector((state: any) => state.user.data);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [pageNum, setPageNum] = useState<number>(1);
  const [lastQuery, setLastQuery] = useState('');
  const [currQuery, setCurrQuery] = useState('');
  const [txtInputVal, setTxtInputVal] = useState('');

  const dispatch = useDispatch();

  const accessToken = useAppSelector(
    (state: any) => state.user.tokens.accessToken,
  );
  const refreshToken = useAppSelector(
    (state: any) => state.user.tokens.refreshToken,
  );
  const isKeyboard = useIsKeyboardShowing();
  const isFocused = useIsFocused();

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
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

  const myBuddiesSearch = (txt: string) => {
    const filteredData = user.buddies.filter(data => {
      const name = data?.firstName + ' ' + data?.lastName;
      return name?.toLowerCase().includes(txt.toLowerCase());
    });
    setMyBuddies(filteredData);
  };

  const updateUserData = async () => {
    const updatedUserData = await getUpdatedUserData(user._id);
    console.log('🚀 ~ updatedUserData:', updatedUserData);

    setMyBuddies(updatedUserData.buddies);

    if (updatedUserData)
      dispatch(setUserData({...updatedUserData, userType: user.userType}));
  };

  const getUsers = async (query = '', isQuery = false) => {
    console.log('page number:', pageNum);

    // alert(txtInputVal.length);
    if (txtInputVal.length && !isQuery) return setLoadMoreLoading(false);
    // alert('working');

    if (!query && isQuery && pageNum == null) {
      setPageNum(1);
    }

    if (query) setLastQuery(query);
    setCurrQuery(query);

    console.log('getting users...');

    if (pageNum !== 1 && pageNum != null) setLoadMoreLoading(true);

    try {
      const url = `user/search?q=${query}${!isQuery ? `&page=${pageNum}` : ''}`;
      console.log('🚀 getUsers ~ url:', url);
      const userSearch = new ApiService(url, accessToken);
      const userSearchRes = await userSearch.Get();

      if (userSearchRes?.status == 200) {
        if (userSearchRes?.data === null) {
          return;
        }
        if (isQuery) setUsers(userSearchRes.data.users);
        else {
          let arr = [...users, ...userSearchRes.data.users];
          arr = removeDuplicatesById(arr);
          setUsers(arr);
          setPageNum(userSearchRes.data.pagination.nextPage);
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
    if (!isKeyboard && lastQuery.length === 1 && !currQuery.length) {
      setPageNum(2);
      getUsers();
    }
  }, [isKeyboard]);

  const handlePressAdd = async (buddyId: string) => {
    console.log('🚀 ~ handlePressAdd ~ buddyId:', buddyId);
    if (!buddyId) return;
    try {
      const buddyAdd = new ApiService('user/add-buddy', accessToken);
      const buddyAddRes = await buddyAdd.Post({
        buddy: buddyId,
      });
      console.log(
        '🚀 ~ file: index.tsx:134 ~ handlePressAdd ~ buddyAddRes:',
        buddyAddRes,
      );

      if (buddyAddRes?.data) {
        // let arr: User = {...user};
        // arr.buddies = [...arr.buddies, buddyAddRes.data];

        let tempUsers = [...users];
        const filteredArr = tempUsers.filter(u => u?._id !== buddyId);
        setUsers(filteredArr);

        updateUserData();
        Toast.show({
          type: 'success',
          text1: 'Buddy Added successfully!',
        });
      } else if (buddyAddRes?.message) {
        Toast.show({
          type: 'error',
          text1: buddyAddRes?.message,
        });
      }
    } catch (error) {
      console.log('🚀 ~ file: index.tsx:149 ~ handlePressAdd ~ error:', error);
      Toast.show({type: 'error', text1: 'Failed to add buddy.'});
    }
  };

  const handlePressRemove = async (buddyId: string, isPartner: boolean) => {
    console.log('🚀 handlePressAdd ~ buddyId:', buddyId);
    if (!buddyId) return;

    if (myBuddies.length <= 1 || isPartner) {
      Toast.show({type: 'info', text1: 'You cannot remove your partner.'});
      return;
    }

    try {
      const buddyAdd = new ApiService('user/remove-buddy', accessToken);
      const buddyAddRes = await buddyAdd.Post({
        buddy: buddyId,
      });

      if (buddyAddRes?.data) {
        // let arr: User = {...user};
        // arr.buddies = [...arr.buddies, buddyAddRes.data];

        let tempUsers = [...myBuddies];
        const buddyData = myBuddies.find(({_id}) => _id === buddyId);
        // console.log("🚀 ~ file: index.tsx:210 ~ handlePressRemove ~ buddyData:", buddyData)
        const filteredArr = tempUsers.filter(u => u?._id !== buddyId);

        setMyBuddies(filteredArr);

        updateUserData();
        if (buddyData) setUsers(prevUsers => [buddyData, ...prevUsers]);
        // getUsers();
        // dispatch(setUserData(updatedUserData));
        Toast.show({
          type: 'success',
          text1: 'Buddy Removed successfully!',
        });
      } else if (buddyAddRes?.message) {
        Toast.show({
          type: 'error',
          text1: buddyAddRes?.message,
        });
      }
    } catch (error) {
      console.log('🚀 ~ file: index.tsx:149 ~ handlePressAdd ~ error:', error);
      Toast.show({type: 'error', text1: 'Failed to remove buddy.'});
    }
  };

  const handleChangePartner = (data: User) => {
    Navigation.navigate('AuthAccountabilityPartner', {
      buddies: myBuddies,
      prevBuddy: data,
    });
    // AuthAccountabilityPartner
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    if (isFocused) updateUserData();
  }, [isFocused]);

  useEffect(() => {
    if (tabIndex === 1) setMyBuddies(user.buddies);
    setTxtInputVal('');
  }, [tabIndex]);

  return (
    <View style={{backgroundColor: '#F9FAFA', flex: 1}}>
      <SegmentedControl
        tabs={['Find Accountability', 'My Accountability']}
        currentIndex={tabIndex}
        onChange={handleTabsChange}
        segmentedControlBackgroundColor={COLORS.neutral200}
        activeSegmentBackgroundColor={COLORS.mainGreen}
        activeTextColor="white"
        textColor={COLORS.neutral700}
        paddingVertical={10}
      />

      <SearchProfile
        val={txtInputVal}
        onChange={q => {
          setTxtInputVal(q);
          if (!tabIndex) getUsers(q, true);
          else myBuddiesSearch(q);
        }}
      />

      <View style={{height: 16}} />

      <FlatList
        data={tabIndex ? myBuddies : users}
        renderItem={({item}) =>
          !tabIndex && item.isBuddy ? null : !item._id ? null : (
            <AccountabilityList
              notifData={{
                goodProgress: item.goodProgress,
                badProgress: item.badProgress,
                beNotified: item.beNotified,
              }}
              id={item._id!}
              onPressPeacemaker={() => handleChangePartner(item)}
              onPressAdd={() => handlePressAdd(item?._id!)}
              onPressRemove={() =>
                handlePressRemove(
                  item?._id!,
                  item._id === user?.partner?.primary?._id,
                )
              }
              fname={item.firstName!}
              lname={item.lastName!}
              photo={!item.photo ? item.photoUrl : item.photo}
              name={item.firstName + ' ' + item.lastName}
              peaceBox={
                tabIndex ? item._id === user?.partner?.primary?._id : false
              }
              btnTxt={tabIndex ? 'Remove' : 'Add'}
            />
          )
        }
        onEndReachedThreshold={0}
        onEndReached={() => {
          if (!tabIndex) getUsers();
        }}
        ListFooterComponent={!tabIndex ? renderFooter : null}
        keyExtractor={(_, index) => index.toString()}
      />
    </View>
  );
}
