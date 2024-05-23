import React, {useCallback} from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  PermissionsAndroid,
  Dimensions,
  TouchableOpacity,
  Image,
  Keyboard,
  Animated,
  Alert,
  Text,
  KeyboardEventListener,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import {
  CameraRoll,
  PhotoIdentifier,
  useCameraRoll,
} from '@react-native-camera-roll/camera-roll';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
// import RNFS from 'react-native-fs';
import {Image as ImageCompress} from 'react-native-compressor';

import ChatBubble from '../../../components/Chat/ChatBubble';
import ChatImg from '../../../components/Chat/ChatImg';
import Navigation from '../../../utils/appNavigation';
import {useIsKeyboardShowing} from '../../../utils/Hooks/useIsKeyboard';
import socketServcies from '../../../utils/socketServices';
import {useAppSelector} from '../../../redux/app/hooks';
import {ApiService, baseUrl} from '../../../utils/ApiService';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import {Participant, User} from '../../../interface/types';
import {changeGroupName} from '../../../redux/features/extra/extraSlice';
import {useDispatch} from 'react-redux';
import {useGallery} from '../../../utils/Hooks/useGallery';
import {COLORS} from '../../../constants/colors';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import { hasAndroidPermission, hasIosPermission } from '../../../utils/permissions';
import { EventRegister } from 'react-native-event-listeners';
// import {dummyUserId} from '../../../utils/helpers';

interface Props {
  route: any;
}

type chatData = {
  isImg?: boolean;
  imgUri?: string;
  text?: string;
  messageSent: boolean;
  captions?: string;
  sender: string;
  isLeftMessage?: boolean;
};

interface ReceivedBy {
  userId: string;
  status: string;
  deleted: boolean;
  _id: string;
  createdAt: string;
}
interface MessageBackend {
  body: string;
  mediaUrls: string[] | null;
  sentBy: string;
  receivedBy: ReceivedBy[];
  deleted: boolean;
  _id: string;
  createdAt: string;
  senderId: string;
  firstName: string;
  lastName: string;
  removedUsers: [string];
}
interface dataBackend {
  messages: MessageBackend[];
}

type NewMessage = {
  body: string;
  mediaUrls: string[];
  sentBy: string;
  removedUsers: string[];
  name?: string;
  receivedBy: {
    status: string;
    userId: {
      _id: string;
      firstName: string;
      lastName: string;
      photo: string;
    };
  }[];
};

export default function ChatMessagesScreen({route}: Props) {
  const [chat_log, setChat_log] = React.useState<chatData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [galleryImages, setGalleryImages] = React.useState<PhotoIdentifier[]>(
    [],
  );
  const {
    photos,
    loadNextPagePictures,
    isImageLoading,
    isLoadingNextPage,
    isReloading,
    hasNextPage,
  } = useGallery({pageSize: 15});
  const [showImages, setShowImages] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [currentSheetIndex, setCurrentSheetIndex] = React.useState(0);

  const {group} = route?.params;
  const isFocused = useIsFocused();
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const [snapPoints, setSnapPoints] = React.useState<string[]>([
    `${Math.floor((46 / Dimensions.get('screen').height) * 100 + 8)}%`,
    '50%',
    '80%',
  ]);
  const isKeyboard = useIsKeyboardShowing();
  const user: User = useAppSelector((state: any) => state.user.data);
  const groupName = useAppSelector(state => state.extra.groupName);
  const dummyUserId = user._id;
  const accessToken = useAppSelector(state => state.user.tokens.accessToken);
  const navigationActions = useNavigation();
  const chatid = route.params?.chatId;

  const renderFooter = useCallback(() => {
    return (
      <View style={{alignItems: 'center', margin: 10}}>
        {isLoadingNextPage && (
          <ActivityIndicator color={COLORS.mainGreen} size="large" />
        )}
      </View>
    );
  }, [isLoadingNextPage]);

  React.useEffect(() => {
    const tempSnapPoints = [
      `${Math.floor(
        (50 / Dimensions.get('screen').height) * 100 + (isKeyboard ? 8 : 4),
      )}%`,
      '50%',
      '80%',
    ];
    setSnapPoints(tempSnapPoints);
  }, [isKeyboard]);
  const dispatch = useDispatch();

  const handleSheetChange = React.useCallback((index: number) => {
    setCurrentSheetIndex(index);
    index === 0 ? setShowImages(false) : null;
  }, []);

  

  const handleShowMedia = async () => {
    if (showImages) return;
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      Alert.alert('Permission denied', 'Allow permission to access images');
      return;
    } else if (Platform.OS === 'ios' && !(await hasIosPermission())) {
      Alert.alert('Permission denied', 'Allow permission to access images');
      return;
    }
    Keyboard.dismiss();

    // CameraRoll.getPhotos({
    //   first: 200,
    //   assetType: 'Photos',
    // })
    //   .then(r => {
    //     setGalleryImages(r.edges);
    //   })
    //   .catch(err => {
    //     console.error(err);
    //   });

    setShowImages(!showImages);
  };

  const sendImage = async () => {
    console.log('posting image');
    const imageUri: string = route.params.imgageUri;

    try {
      let formdata = new FormData();
      const imagename =
        Platform.OS === 'android'
          ? imageUri.substring(imageUri.lastIndexOf('/') + 1)
          : imageUri
              .substring(imageUri.lastIndexOf('/') + 1)
              .replace('file://', '');
      console.log('🚀 ~ imagename:', imagename);
      const imgdata: any = {
        uri: imageUri,
        type: route.params.imageType,
        name: imagename ? imagename : 'abc.jpeg',
      };
      formdata.append('images', imgdata);

      const response = await fetch(baseUrl + 'upload-media', {
        method: 'POST',
        headers: {
          accessToken: accessToken,
        },
        body: formdata,
      });
      console.log('🚀 ~ sendImage ~ response:', response);
      if (response.status == 401) EventRegister.emit('Logout', 'it works!!!');

      const {data} = await response.json();
      chat_log.unshift({
        messageSent: true,
        isImg: true,
        imgUri: route.params.imgageUri,
        captions: route.params.caption,
        sender: '',
      });
      setChat_log([...chat_log]);

      interface ImgData {
        messageBody?: string;
        userId: string | null;
        chatId: string;
        mediaUrls: any;
        name: string | null;
      }
      const imgData: ImgData = {
        userId: dummyUserId,
        chatId: route.params?.chatId,
        mediaUrls: data,
        name: user.firstName + ' ' + user.lastName,
      };
      if (route.params?.caption) {
        imgData['messageBody'] = route.params?.caption;
      }
      socketServcies.emit('sendMessage', imgData);
    } catch (error) {
      console.log('🚀 ~ file: index.tsx:173 ~ sendImage ~ error:', error);
    }
  };

  const readAllMessages = (id: string) => {
    socketServcies.emit('readMessages', {
      userId: dummyUserId,
      chatId: id,
    });
  };

  const storeMessages = (data: dataBackend) => {
    let temp: chatData[] = [];
    console.log('storing messages');
    setIsLoading(true);

    data?.messages.forEach(message => {
      console.log(
        '🚀 ~ file: index.tsx:279 ~ storeMessages ~ message:',
        message,
      );
      const isUserLeftMessage = message.sentBy === null;
      if (!message.firstName || !message.lastName) {
        message['firstName'] = '';
        message['lastName'] = '';
      }
      let sentByOther: ReceivedBy | undefined | boolean =
        message.receivedBy.find(message => message.userId === dummyUserId);
      if (isUserLeftMessage && message.removedUsers[0] === dummyUserId)
        sentByOther = false;
      // const sentByMe = message.senderId === dummyUserId;
      const messageBody = !isUserLeftMessage
        ? message.body
        : `${
            sentByOther ? message.body?.split(',')[0].split(' ')[0] : 'You'
          } left`;

      temp.push({
        messageSent: sentByOther ? false : true,
        isImg: message.mediaUrls && message.mediaUrls?.length ? true : false,
        imgUri:
          message.mediaUrls && message.mediaUrls?.length
            ? 'https://peacemakers3.s3.us-east-2.amazonaws.com/' +
              message.mediaUrls[0]
            : '',
        captions: messageBody,
        text: messageBody,
        sender: message?.firstName + ' ' + message?.lastName,
        isLeftMessage: isUserLeftMessage,
      });
    });
    setIsLoading(false);

    setChat_log([...temp]);
  };

  const fetchChatMessagesSocket = () => {
    socketServcies.emit('getChatMessages', {
      userId: dummyUserId,
      chatId: chatid,
      page: 1,
    });

    socketServcies.on(`getChatMessages/${dummyUserId}`, (data: dataBackend) =>
      storeMessages(data),
    );
  };

  const fetchChatMessagesApi = async () => {
    try {
      const url = `chats/messages?userId=${dummyUserId}&chatId=${chatid}&pageNumber=1`;
      const messagesReq = new ApiService(url, accessToken);
      const messagesRes = await messagesReq.Get();

      if (!messagesRes?.data?.messages?.length) {
        fetchChatMessagesApi();
        return;
      }

      storeMessages(messagesRes.data);
    } catch (error) {
      console.log('🚀  fetchChatMessagesApi ~ error:', error);
      Toast.show({
        type: 'error',
        text1: 'Unable To Get Messages.',
        text2: 'Please Try Again Later.',
      });
    }
  };

  const handleOnRecieveMessage = useCallback((data: NewMessage) => {
    console.log('🚀 ~ message arrived', data);
    const isUserLeftMessage = data?.sentBy === null;
    if (isUserLeftMessage) {
      const temp = data.receivedBy?.filter(
        p => p.userId._id !== data?.removedUsers[0],
      );

      let newParticipants: any = [];
      temp.forEach(element => {
        newParticipants.push(element.userId);
      });

      navigationActions.setParams({
        ...route.params,
        participants: newParticipants,
      });
    }
    const messageBody = !isUserLeftMessage
      ? data.body
      : `${data.body?.split(',')[0].split(' ')[0]} left`;

    // const senderInfo = route.params?.participants?.find(
    //   (p: Participant) => p._id === data?.sentBy,
    // );

    const senderFName = data.name?.split(' ')[0];
    const senderLName = data.name?.split(' ')[1];

    const message: chatData = {
      messageSent: false,
      text: messageBody,
      sender: senderFName + ' ' + senderLName,
      isLeftMessage: isUserLeftMessage,
    };
    if (data.mediaUrls) {
      message['isImg'] = data.mediaUrls ? true : false;
      message['imgUri'] =
        'https://peacemakers3.s3.us-east-2.amazonaws.com/' + data.mediaUrls[0];
      message['captions'] = data.body;
    }

    // let arr = [...chat_log];
    // arr.unshift(message);
    // setChat_log([...arr]);
    setChat_log(prevMessages => [message, ...prevMessages]);
    readAllMessages(chatid);
  }, []);

  const compressAndPreviewImage = async (param: PhotoIdentifier) => {
    const result = await ImageCompress.compress(param.node.image.uri, {
      maxWidth: 1000,
      quality: 0.8,
    });

    Navigation.navigate('ImagePreview', {
      img: result,
      recentParams: route.params,
      imageType: param.node.type,
    });
  };

  React.useEffect(() => {
    if (!route.params?.fromPreview) {
      if (!route.params.messages) {
        fetchChatMessagesApi();
      } else {
        storeMessages(route.params);
      }

      console.log('User ID: ' + dummyUserId);
      console.log('Listening to messages of chat: ' + chatid);
      readAllMessages(chatid);
    }
  }, []);

  React.useEffect(() => {
    // for closing images bottom sheet
    if (!isFocused) {
      setShowImages(false);
      setCurrentSheetIndex(0);
    }

    // for sending image when user comes from image preview
    if (isFocused && route.params?.fromPreview) {
      route.params.fromPreview = false;

      sendImage();
    }
  }, [isFocused]);

  React.useEffect(() => {
    // for checking if group name is changed
    if (isFocused && !route.params?.fromPreview && group) {
      if (route.params.title !== groupName) {
        console.log('changing group title');
        route.params.title = groupName;
      }
    }
  }, [isFocused, groupName]);

  React.useEffect(() => {
    if (route.params?.noTitle) {
      dispatch(changeGroupName(route.params?.title));
    }
    socketServcies.on(`updateChat/${route.params?.chatId}`, (data: any) => {
      console.log('updated chat');
      dispatch(changeGroupName(data.groupName));
      console.log(
        'You have successfully changed the group name to: ' + data.groupName,
      );
    });

    socketServcies.on(
      `newMessage/${chatid}/${dummyUserId}`,
      (data: NewMessage) => handleOnRecieveMessage(data),
    );

    return () => {
      setChat_log([]);
    };
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={{flex: 1, backgroundColor: '#f9fafa'}}>
        <View style={{flex: 1}}>
          {!isLoading ? (
            <FlatList
              showsVerticalScrollIndicator={false}
              inverted
              style={{flexGrow: 0}}
              data={chat_log}
              renderItem={({item, index}) =>
                item.isLeftMessage ? (
                  item.messageSent ? null : (
                    <View style={styles.groupLeftBox}>
                      <Text style={styles.groupLeftTxt}>{item.text}</Text>
                    </View>
                  )
                ) : item.isImg ? (
                  <ChatImg
                    group={group}
                    index={index}
                    imgUri={item.imgUri || ''}
                    byMe={item.messageSent}
                    caption={item.captions}
                    participantName={item.sender}
                  />
                ) : (
                  <ChatBubble
                    participantName={item.sender}
                    group={group}
                    index={index}
                    text={item.text || ''}
                    byMe={item.messageSent}
                  />
                )
              }
              keyExtractor={(item, index) => index.toString()}
            />
          ) : (
            <ActivityIndicator size="large" style={{marginTop: 20}} />
          )}
        </View>

        <View
          style={{
            height: !route.params?.left ? snapPoints[currentSheetIndex] : 50,
          }}
        />

        {!route.params?.left ? (
          <BottomSheet
            onChange={handleSheetChange}
            enableContentPanningGesture={!showImages ? false : true}
            handleIndicatorStyle={{display: 'none'}}
            ref={bottomSheetRef}
            handleStyle={{display: 'none'}}
            index={!showImages ? 0 : 1}
            style={{borderWidth: 0}}
            snapPoints={snapPoints}>
            <View style={styles.contentContainer}>
              <View
                style={{
                  backgroundColor: 'white',
                  flexDirection: 'row',
                  paddingHorizontal: 17,
                  alignItems: 'center',
                  height: 50,
                  // marginTop: -8,
                }}>
                <TouchableOpacity
                  onPress={handleShowMedia}>
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
                    placeholderTextColor="rgba(60, 60, 67, 0.3)"
                  />
                  <TouchableOpacity
                    onPress={() => {
                      if (!message) return;

                      console.log('sending message');
                      let arr1 = [...chat_log];

                      arr1.unshift({
                        messageSent: true,
                        text: message,
                        sender: '',
                      });

                      // chat_log.unshift({
                      //   messageSent: true,
                      //   text: message,
                      // });
                      setChat_log([...arr1]);

                      socketServcies.emit('sendMessage', {
                        userId: dummyUserId,
                        chatId: route.params?.chatId,
                        messageBody: message,
                        name: user.firstName + ' ' + user.lastName,
                      });

                      setMessage('');
                    }}>
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
                        paddingHorizontal: 10,
                        // paddingTop: 20
                      }}>
                      <FlatList
                        data={photos}
                        numColumns={3}
                        columnWrapperStyle={{
                          justifyContent: 'space-around',
                          flexWrap: 'wrap',
                        }}
                        onEndReachedThreshold={0}
                        onEndReached={() => loadNextPagePictures()}
                        ListFooterComponent={renderFooter}
                        keyExtractor={(_, i) => i.toString()}
                        renderItem={({item: image, index: i}) => {
                          return (
                            <TouchableOpacity
                              onPress={() => compressAndPreviewImage(image)}
                              style={styles.imgCont}
                              key={i}>
                              <Image
                                style={styles.img}
                                resizeMode="cover"
                                source={{
                                  uri: image.node.image.uri,
                                }}
                              />
                            </TouchableOpacity>
                          );
                        }}
                      />
                    </View>
                  </BottomSheetScrollView>
                </>
              ) : null}
            </View>
          </BottomSheet>
        ) : (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              backgroundColor: '#fff',
              alignItems: 'center',
              height: 50,
              paddingHorizontal: 20,
              paddingVertical: 5,
            }}>
            <Text style={{color: '#7d8286', fontSize: 15, textAlign: 'center'}}>
              You can't send messages to this group because you're no longer a
              participant.
            </Text>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
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
    height: 33,
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
  groupLeftBox: {
    backgroundColor: 'white',
    borderColor: 'lightgray',
    borderRadius: 8,
    borderWidth: 0.5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  groupLeftTxt: {
    fontSize: 14,
    color: '#687277',
    padding: 5,
    paddingHorizontal: 10,
  },
});
