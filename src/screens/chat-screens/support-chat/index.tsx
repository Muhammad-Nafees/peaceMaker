import React, {useCallback} from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  TextInput,
  Platform,
  PermissionsAndroid,
  Dimensions,
  TouchableOpacity,
  Image,
  Keyboard,
  Alert,
  Text,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import {
  CameraRoll,
  PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';
import {useIsFocused} from '@react-navigation/native';
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
// import {dummyUserId} from '../../../utils/helpers';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';
import {COLORS} from '../../../constants/colors';
import {useGallery} from '../../../utils/Hooks/useGallery';
import Toast from 'react-native-toast-message';
import {Chat} from '../../../interface/types';
import { EventRegister } from 'react-native-event-listeners';

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
}
interface dataBackend {
  messages: MessageBackend[];
}

export default function ChatMessagesScreen({route}: Props) {
  const [chat_log, setChat_log] = React.useState<chatData[]>([]);
  const [galleryImages, setGalleryImages] = React.useState<PhotoIdentifier[]>(
    [],
  );
  const [showImages, setShowImages] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [currentSheetIndex, setCurrentSheetIndex] = React.useState(0);

  const isFocused = useIsFocused();
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const [snapPoints, setSnapPoints] = React.useState<string[]>([
    `${Math.floor((46 / Dimensions.get('screen').height) * 100 + 8)}%`,
    '50%',
    '80%',
  ]);
  const isKeyboard = useIsKeyboardShowing();
  const user = useAppSelector(state => state.user.data);
  const dummyUserId = user._id;
  const accessToken = useAppSelector(state => state.user.tokens.accessToken);
  const chatid = route.params?.chatId;

  const {
    photos,
    loadNextPagePictures,
    isImageLoading,
    isLoadingNextPage,
    isReloading,
    hasNextPage,
  } = useGallery({pageSize: 15});

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
    //   first: 20,
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
      if (!dummyUserId) return;
      if (isChatClosed()) {
        chat_log.unshift({
          messageSent: true,
          isImg: true,
          imgUri: route.params.imgageUri,
          captions: route.params.caption,
          sender: '',
        });
        setChat_log([...chat_log]);
        return;
      }
      let formdata = new FormData();
      const imagename =
        Platform.OS === 'android'
          ? imageUri.substring(imageUri.lastIndexOf('/') + 1)
          : imageUri
              .substring(imageUri.lastIndexOf('/') + 1)
              .replace('file://', '');

      const imageData: any = {
        uri: imageUri,
        type: route.params.imageType,
        name: imagename ? imagename : 'abc.jpeg',
      };
      formdata.append('images', imageData);

      const response = await fetch(baseUrl + 'upload-media', {
        method: 'POST',
        headers: {
          accessToken: accessToken,
        },
        body: formdata,
      });
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
        userId: string;
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
    } catch (error) {}
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

    data?.messages.forEach(message => {
      temp.push({
        messageSent: message.sentBy === dummyUserId ? true : false,
        isImg: message.mediaUrls && message.mediaUrls?.length ? true : false,
        imgUri: message.mediaUrls
          ? 'https://peacemakers3.s3.us-east-2.amazonaws.com/' +
            message.mediaUrls[0]
          : '',
        captions: message.body,
        text: message.body,
        sender: message?.firstName + ' ' + message?.lastName,
      });
    });
    setChat_log([...temp]);
  };

  const handleOnRecieveMessage = useCallback(
    (data: {body: string; mediaUrls: string[]; name?: string}) => {
      const senderFName = data.name?.split(' ')[0];
      const senderLName = data.name?.split(' ')[1];

      const message: chatData = {
        messageSent: false,
        text: data.body,
        sender: senderFName + ' ' + senderLName,
      };
      if (data.mediaUrls) {
        message['isImg'] =
          data.mediaUrls && data.mediaUrls?.length ? true : false;
        message['imgUri'] =
          'https://peacemakers3.s3.us-east-2.amazonaws.com/' +
          data.mediaUrls[0];
        message['captions'] = data.body;
      }

      // let arr = [...chat_log];
      // arr.unshift(message);
      // setChat_log([...arr]);
      setChat_log(prevMessages => [message, ...prevMessages]);
      readAllMessages(chatid);
    },
    [],
  );

  const compressAndPreviewImage = async (param: PhotoIdentifier) => {
    const result = await ImageCompress.compress(param.node.image.uri, {
      maxWidth: 1000,
      quality: 0.8,
    });

    Navigation.navigate('ImagePreview', {
      img: result,
      recentParams: route.params,
      imageType: param.node.type,
      goto: 'SupportChat',
    });
  };

  const closeSupportChat = () => {
    // socketServcies.emit('closeChatSupportTicket', {
    //   userId: user._id,
    //   chatId: route.params?.chatId,
    //   topic: 'new ticket',
    // });
    // socketServcies.on(`closeChatSupportTicket/${user._id}`, () => {
    //   console.log('closeChatSupportTicket');
    // });
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
      Toast.show({
        type: 'error',
        text1: 'Unable To Get Messages.',
        text2: 'Please Try Again Later.',
      });
    }
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

  const onChatClosed = (data: any) => {
    console.log('--------------------------------');
    console.log('chat closed: ' + data);


    setChat_log(prevChatLog => [
      {
        messageSent: true,
        text: 'End of conversation',
        sender: '',
      },
      ...prevChatLog,
    ]);
  };

  const isChatClosed = (): boolean => {
    return chat_log.find(
      e =>
        e.text?.trim().toLowerCase() ===
        'End of conversation'.toLowerCase().trim(),
    )
      ? true
      : false;
  };

  React.useEffect(() => {
    socketServcies.on(`closeChatSupportTicket/${user._id}`, onChatClosed);

    socketServcies.on(
      `newMessage/${chatid}/${dummyUserId}`,
      (data: {body: string; mediaUrls: string[]}) =>
        handleOnRecieveMessage(data),
    );

    return () => {
      socketServcies.removeListener(`getChats/${user._id}`, onChatClosed);
      closeSupportChat();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={{flex: 1, backgroundColor: '#f9fafa'}}>
        <View style={{flex: 1}}>
          {chat_log.length ? (
            <FlatList
              showsVerticalScrollIndicator={false}
              inverted
              style={{flexGrow: 0}}
              data={[...chat_log, chat_log[0]]}
              renderItem={({item, index}) =>
                index === chat_log.length ? (
                  <Text
                    style={{
                      textAlign: 'center',
                      marginVertical: 16,
                      color: '#656565',
                    }}>
                    You started a support
                  </Text>
                ) : item.text?.trim().toLowerCase() ===
                  'End of conversation'.toLowerCase().trim() ? (
                  <Text
                    style={{
                      textAlign: 'center',
                      marginVertical: 16,
                      color: '#656565',
                    }}>
                    {item.text}
                  </Text>
                ) : item.isImg ? (
                  <ChatImg
                    group={0}
                    index={index}
                    imgUri={item.imgUri || ''}
                    byMe={item.messageSent}
                    caption={item.captions}
                    participantName={item.sender}
                  />
                ) : (
                  <ChatBubble
                    participantName={item.sender}
                    group={0}
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
            height: snapPoints[currentSheetIndex],
          }}
        />

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

                    if (!isChatClosed()) {
                      socketServcies.emit('sendMessage', {
                        userId: dummyUserId,
                        chatId: route.params?.chatId,
                        messageBody: message,
                        name: user.firstName + ' ' + user.lastName,
                      });
                    }
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
});
