import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
  Image,
  Keyboard,
  Alert,
  Text,
  Dimensions,
  ScrollView,
  FlatList,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  CameraRoll,
  PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';
import {useIsFocused} from '@react-navigation/native';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';

import Navigation from '../../../utils/appNavigation';
import placeholderImg from '../../../constants/extras';
import {useIsKeyboardShowing} from '../../../utils/Hooks/useIsKeyboard';
import socketServcies from '../../../utils/socketServices';
// import {dummyUserId} from '../../../utils/helpers';
import {useAppSelector} from '../../../redux/app/hooks';
import {
  GestureHandlerRootView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import {horizontalScale, verticalScale} from '../../../utils/metrics';
import {STYLES} from '../../../styles/globalStyles';
import {useDispatch} from 'react-redux';
import {changeGroupName} from '../../../redux/features/extra/extraSlice';
import {COLORS} from '../../../constants/colors';
import {ChatData, Participant, User} from '../../../interface/types';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';
import ProfilePicture from '../../../components/shared-components/ProfilePic';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Props {
  route: any;
}

interface ChatCreatedData {
  data: {participants?: Participant[]; _id?: string};
}

type buddy = {
  name: string;
  firstName: string | null;
  lastName: string | null;
  id: string;
  image: string | null;
};

export default function NewMessage({route}: Props) {
  const user = useAppSelector((state: any) => state.user.data);
  const dummyUserId = user._id;
  let buddiesTemp: buddy[] = [];
  user.buddies.forEach((buddy: User) => {
    if (!buddy._id || !buddy.firstName || !buddy.lastName) return;
    buddiesTemp.push({
      name: buddy?.firstName + ' ' + buddy?.lastName,
      firstName: buddy?.firstName,
      lastName: buddy?.lastName,
      id: buddy?._id,
      image: buddy.photo ? buddy.photo : buddy.photoUrl ? buddy.photoUrl : null,
    });
  });

  const [galleryImages, setGalleryImages] = React.useState<PhotoIdentifier[]>(
    [],
  );
  const [showImages, setShowImages] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [currentSheetIndex, setCurrentSheetIndex] = React.useState(0);
  const [toTxt, setToTxt] = React.useState('');
  const [prevToTxt, setPrevToTxt] = React.useState('');
  const [buddies, setBuddies] = React.useState<buddy[]>(buddiesTemp);
  console.log("🚀 ~ file: index.tsx:88 ~ NewMessage ~ buddies:", buddies)
  const [toTags, setToTags] = React.useState<buddy[]>(buddiesTemp);
  const [isChatCreated, setIsChatCreated] = React.useState(false);
  const [createdChatData, setCreatedChatData] = React.useState<ChatCreatedData>(
    {data: {}},
  );
  // user.partner.primary,
  const [snapPoints, setSnapPoints] = React.useState<string[]>([
    `${Math.floor((46 / SCREEN_HEIGHT) * 100 + 8)}%`,
    '50%',
    '80%',
  ]);
  console.log('🚀 ~ file: index.tsx:97 ~ NewMessage ~ snapPoints:', snapPoints);

  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const inputRef = React.useRef();

  const isKeyboard = useIsKeyboardShowing();

  // console.log("🚀 ~ file: index.tsx:109 ~ React.useEffect ~ Dimensions.get('screen').height:", Dimensions.get('screen').height)
  React.useEffect(() => {
    const tempSnapPoints = [
      `${Math.floor((46 / SCREEN_HEIGHT) * 100 + (isKeyboard ? 8 : 4))}%`,
      '50%',
      '80%',
    ];
    setSnapPoints(tempSnapPoints);
  }, [isKeyboard]);

  const handleSheetChange = React.useCallback((index: number) => {
    setCurrentSheetIndex(index);
    index === 0 ? setShowImages(false) : null;
  }, []);

  async function hasAndroidPermission() {
    const permission =
      Platform.Version >= '33'
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  }

  async function hasIosPermission() {
    const permission = PERMISSIONS.IOS.PHOTO_LIBRARY;

    const permissionStatus = await check(permission);

    if (permissionStatus === RESULTS.GRANTED) {
      return true;
    }

    const requestStatus = await request(permission);

    return requestStatus === RESULTS.GRANTED;
  }

  const handleShowMedia = async () => {
    if (!toTags.length) if (toTxt == '') return;

    if (showImages) return;
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      Alert.alert('Permission denied', 'Allow permission to access images');
      return;
    } else if (Platform.OS === 'ios' && !(await hasIosPermission())) {
      Alert.alert('Permission denied', 'Allow permission to access images');
      return;
    }
    Keyboard.dismiss();

    CameraRoll.getPhotos({
      first: 20,
      assetType: 'Photos',
    })
      .then(r => {
        setGalleryImages(r.edges);
      })
      .catch(err => {
        console.error(err);
      });

    setShowImages(!showImages);
    // showImagesWithAnimation();
  };

  const createChat = () => {
    // if (!message || !toTags.length) if (toTxt == '' || !message) return;
    if (!message || !toTags.length) return;

    const isGroup = toTags.length > 1 ? true : false;
    const chatTitle = isGroup
      ? `${toTags[0].name.split(' ')[0]} and ${toTags[1].name.split(' ')[0]}`
      : `${toTags[0].name}`;

    let participants: string[] = [];
    toTags.forEach(t => participants.push(t.id));
    console.log('--------------------------------------------');
    console.log('🚀 createChat ~ participants:', participants);

    const chatData: ChatData = {
      chatType: 'one-to-one',
      groupImageUrl: 'def.jpg',
      userId: dummyUserId,
      participantIds: [...participants, dummyUserId],
    };
    if (isGroup) {
      chatData['chatType'] = 'group';
      chatData['groupName'] = chatTitle;
    }
    socketServcies.emit('createChat', chatData);
  };

  function removeDuplicatesById(arr: buddy[], idProperty: string) {
    const uniqueMap = new Map();

    for (const item of arr) {
      const itemId = item[idProperty];

      if (!uniqueMap.has(itemId) && !toTags.find(t => t.id === itemId)) {
        uniqueMap.set(itemId, item);
      }
    }

    const uniqueArray = [...uniqueMap.values()];

    return uniqueArray;
  }

  function searchList(keyword: string, list: buddy[]) {
    if (!keyword.trim()) return;
    const lowerCaseKeyword = keyword.toLowerCase();

    const matchedItems = list.filter(item =>
      item?.name?.toLowerCase().includes(lowerCaseKeyword),
    );

    const unmatchedItems = list.filter(
      item => !item?.name?.toLowerCase().includes(lowerCaseKeyword),
    );

    const searchResults = matchedItems.concat(unmatchedItems);

    return removeDuplicatesById(searchResults, 'id');
  }

  function isS3String(s: string): boolean {
    if (typeof s !== 'string') return false;
    return !s.includes('https://');
  }

  const handleCreateChat = () => {
    const isGroup =
      createdChatData.data.participants &&
      createdChatData.data.participants.length > 2
        ? true
        : false;
    const chatTitle = isGroup
      ? `${toTags[0].name.split(' ')[0]} and ${toTags[1].name.split(' ')[0]}`
      : `${toTags[0].name}`;

    let participantPhoto;
    if (!isGroup)
      participantPhoto = createdChatData.data.participants?.find(
        p => p._id !== user._id,
      )?.photo;

    console.log('🚀 handleCreateChat ~ data:', createdChatData);
    console.log('🚀 handleCreateChat ~ message:', message);
    console.log('🚀 handleCreateChat ~ chatTitle:', chatTitle);

    socketServcies.emit('sendMessage', {
      userId: dummyUserId,
      chatId: createdChatData.data._id,
      messageBody: message,
      name: user.firstName + ' ' + user.lastName,
    });

    if (isGroup) dispatch(changeGroupName(chatTitle));

    Navigation.replace('ChatMessagesScreen', {
      group: isGroup ? 1 : 0,
      title: chatTitle,
      provider: 0,
      chatId: createdChatData.data._id,
      participants: createdChatData.data.participants,
      messages: undefined,
      profilePic: participantPhoto,
    });
  };

  const listenToChatCreation = () => {
    socketServcies.on(`createChat/${dummyUserId}`, (data: ChatCreatedData) => {
      setCreatedChatData(data);
      setIsChatCreated(isCreated => !isCreated);
    });
  };

  React.useEffect(() => {
    listenToChatCreation();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, []);

  React.useEffect(() => {
    if (isChatCreated) {
      handleCreateChat();
    }
  }, [isChatCreated]);

  React.useEffect(() => {
    if (!isFocused) {
      setShowImages(false);
      setCurrentSheetIndex(0);
    }
  }, [isFocused]);

  return (
    <View style={{flex: 1, backgroundColor: '#f9fafa'}}>
      <View style={{flex: 1}}>
        <View
          style={{
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: '#EAEAEA',
            flexDirection: 'row',
            marginTop: 10,
            alignItems: 'center',
            paddingVertical: 5,
            paddingRight: 5,
            maxWidth: '100%',
            flexWrap: 'wrap',
            rowGap: 5,
          }}>
          <Text
            style={{
              marginLeft: 19,
              fontSize: 16,
              fontWeight: '400',
              color: '#9C9C9C',
            }}>
            To:
          </Text>
          {toTags.map((t, i) => (
            <View key={i}>
              <View
                style={{
                  backgroundColor: 'rgba(142, 178, 111, 0.3)',
                  borderRadius: 50,
                  borderWidth: 1,
                  borderColor: '#8EB26F',
                  flexDirection: 'row',
                  padding: 4,
                  alignItems: 'center',
                  paddingHorizontal: 7,
                  marginLeft: 7,
                }}>
                {t.firstName && t.lastName ? (
                  <ProfilePicture
                    firstName={t.firstName}
                    lastName={t.lastName}
                    photo={t.image}
                    size={22}
                  />
                ) : (
                  <Image
                    style={{width: 22, height: 22, borderRadius: 50}}
                    source={placeholderImg}
                  />
                )}
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '400',
                    color: 'black',
                    marginLeft: 8,
                  }}>
                  {t?.name}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    const filteredTags = toTags.filter(tt => tt.id !== t.id);
                    setToTags(filteredTags);
                    // let arr = [...buddies, t];

                    // const removedBuddy = arr.find(el => el.id === t.id);
                    // if (!removedBuddy) setBuddies(arr);
                  }}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 50,
                    backgroundColor: COLORS.mainGreen,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 8,
                  }}>
                  <Ionicons name="close" color="#d9e4d0" size={14} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TextInput
            ref={inputRef}
            editable={true}
            style={{
              marginLeft: 6,
              color: 'black',
              //   height: '100%',
              flex: 1,
              padding: 0,
              paddingLeft: 3,
              // backgroundColor: "black",
              minWidth: 60,
            }}
            value={toTxt}
            onChangeText={val => {
              setToTxt(prevState => {

                setPrevToTxt(prevState);

                return val;
              });
            }}
            onKeyPress={e => {
              
              if (!toTags[toTags.length - 1]) return;
              setPrevToTxt((prevState) => prevState.length === 1 ? '':prevState);
              if (
                e.nativeEvent.key === 'Backspace' &&
                !prevToTxt
                // .length === 1 &&
                // !toTxt
              ) {
                // let arr = [...buddies, toTags[toTags.length - 1]];
                // const removedBuddy = arr.find(
                //   el => el.id === toTags[toTags.length - 1].id,
                // );
                // if (!removedBuddy) setBuddies(arr);

                // setBuddies(arr);
                // const filteredTags = toTags.filter(
                //   tt => tt.id !== toTags[toTags.length - 1].id,
                // );
                // setToTags(filteredTags);

                toTags.pop();
                setToTags([...toTags]);
              }
            }}
          />
        </View>

        {toTxt.length ? (
          <View
            style={{
              backgroundColor: '#ffffff',
              // elevation: 3,
              borderRadius: 4,
              // paddingVertical: 12,
              marginTop: verticalScale(1),
              borderColor: '#EAEAEA',
              marginHorizontal: horizontalScale(5),
              borderWidth: 1,
              borderBottomWidth: 0,
              // marginBottom: isKeyboard ? 0 : 200,
            }}>
            <FlatList
              data={searchList(toTxt, buddiesTemp)}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({item}) =>
                !item?.name ? null : (
                  <TouchableWithoutFeedback
                    onPress={() => {
                      console.log('~ NewMessage ~ item:', item);
                      toTags.push(item);
                      setToTags([...toTags]);
                      setToTxt('');
                      // let arr = buddies.filter(elem => elem?.id !== item?.id);
                      // setBuddies(arr);
                    }}>
                    <View
                      style={{
                        flexDirection: 'column',
                        position: 'relative',
                        paddingVertical: verticalScale(2),
                        borderColor: '#EAEAEA',
                        paddingHorizontal: 12,
                        marginTop: verticalScale(4),
                        borderBottomWidth: 1,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <ProfilePicture
                          firstName={item.firstName}
                          lastName={item.lastName}
                          photo={
                            !isS3String(item.image)
                              ? item.image
                              : `https://peacemakers3.s3.us-east-2.amazonaws.com/${item.image}`
                          }
                          size={22}
                        />
                        {/* <Image
                          style={{width: 22, height: 22, borderRadius: 50}}
                          source={
                            !item.image
                              ? placeholderImg
                              : {
                                  uri: !isS3String(item.image)
                                    ? item.image
                                    : `https://peacemakers3.s3.us-east-2.amazonaws.com/${item.image}`,
                                }
                          }
                        /> */}
                        <Text
                          style={[
                            STYLES.dev1__text16,
                            {
                              fontWeight: '400',
                              color: '#000000',
                              paddingVertical: verticalScale(8),
                              width: '90%',
                              fontFamily: 'GeneralSans-Medium',
                              marginHorizontal: horizontalScale(5),
                              textTransform: 'capitalize',
                            },
                          ]}>
                          {item?.name}
                        </Text>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                )
              }
            />
          </View>
        ) : null}
      </View>

      <BottomSheet
        onChange={handleSheetChange}
        snapPoints={snapPoints}
        enableContentPanningGesture={!showImages ? false : true}
        handleIndicatorStyle={{display: 'none'}}
        ref={bottomSheetRef}
        handleStyle={{display: 'none'}}
        index={!showImages ? 0 : 1}
        style={{borderWidth: 0}}>
        <View style={styles.contentContainer}>
          <View
            style={{
              backgroundColor: 'white',
              flexDirection: 'row',
              paddingHorizontal: 17,
              alignItems: 'center',
              height: 46,
            }}>
            <TouchableOpacity onPress={handleShowMedia}>
              <FontAwesome
                style={{marginRight: 16}}
                name="camera"
                color="#8b8b8b"
                size={26}
              />
            </TouchableOpacity>
            <View
              style={{
                flexDirection: 'row',
                flex: 1,
                borderColor: '#c8c8cc',
                borderWidth: 1,
                borderRadius: 16,
                height: 33,
                alignItems: 'center',
                paddingRight: 12,
                paddingLeft: 5,
              }}>
              <TextInput
                onPressIn={() => {
                  if (showImages) {
                    setShowImages(false);
                    setCurrentSheetIndex(0);
                  }
                }}
                value={message}
                onChangeText={setMessage}
                style={styles.input}
                placeholder="Type here.."
                placeholderTextColor=" rgba(60, 60, 67, 0.3)"
              />
              <TouchableOpacity onPress={createChat}>
                <Feather name="send" color="#C8C8CC" size={20} />
              </TouchableOpacity>
            </View>
          </View>
          {showImages ? (
            <>
              <View
                style={{
                  backgroundColor: '#BEBEC0',
                  width: 34,
                  height: 5,
                  borderRadius: 2.4,
                  alignSelf: 'center',
                  marginTop: 6,
                  marginBottom: 8,
                }}
              />
              <BottomSheetScrollView>
                <View
                  style={{
                    backgroundColor: '#fefffe',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    paddingHorizontal: 0,
                    // paddingTop: 20
                  }}>
                  {galleryImages?.map(image => (
                    <TouchableOpacity
                      key={image.node.timestamp}
                      onPress={() => {
                        Navigation.navigate('ImagePreview', {
                          img: image.node.image.uri,
                          recentParams: {
                            group: toTags.length > 1 ? 1 : 0,
                            title:
                              toTags.length > 1
                                ? `${toTags[0].firstName} and ${toTags[1].firstName}`
                                : `${toTags[0].firstName}`,
                            provider: 0,
                          },
                          imageType: image.node.type,
                        });
                      }}
                      style={styles.imgCont}>
                      <Image
                        style={styles.img}
                        resizeMode="cover"
                        source={{
                          uri: image.node.image.uri,
                        }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </BottomSheetScrollView>
            </>
          ) : null}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  imgCont: {
    width: '32%',
    height: 117,
    marginBottom: 8,
  },
  img: {
    width: '100%',
    height: '100%',
    // margin: 5.2,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 17,
    paddingTop: 0,
    marginTop: Platform.OS === 'ios' ? 0 : 10,
    color: 'black',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
});
