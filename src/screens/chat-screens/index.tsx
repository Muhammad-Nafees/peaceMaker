import React, {useState, useEffect} from 'react';
import {View, FlatList, Animated, ActivityIndicator, Text} from 'react-native';
import {format} from 'date-fns';
import {useDispatch} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';

import SegmentedControl from '../../components/SegmentedControl';
import {COLORS} from '../../constants/colors';
import ChatItem from '../../components/Chat/ChatItem';
import DeleteAction from '../../components/Chat/ChatDeleteAction';
import DeleteModal from '../../components/shared-components/CustomModal';
import navigation from '../../utils/appNavigation';
import socketServcies from '../../utils/socketServices';
import {Chat, Message, Participant} from '../../interface/types';
import {useAppSelector} from '../../redux/app/hooks';
import {changeGroupName} from '../../redux/features/extra/extraSlice';

interface ReceivedBy {
  userId: string;
  status: string;
  deleted: boolean;
  _id: string;
  createdAt: string;
}

const ChatScreen = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [deleteChatID, setDeleteChatID] = useState<string | null>();
  const [isGroupChatDelete, setIsGroupChatDelete] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [animation] = useState(new Animated.Value(0));

  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const user = useAppSelector((state: any) => state.user.data);
  const userID = user._id;
  let row: Array<any> = [];
  let prevOpenedRow: any;

  const closeRow = (index: number) => {
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  };

  const toggleDeleteModal = (id?: string, group?: boolean) => {
    if (group) setIsGroupChatDelete(true);
    else setIsGroupChatDelete(false);
    setDeleteChatID(id ? id : null);
    setDeleteModalVisible(prevModalState => !prevModalState);
  };

  const deleteChat = () => {
    if (!deleteChatID) return;

    socketServcies.emit('deleteMessages', {
      userId: userID,
      chatId: deleteChatID,
    });
    
    const deletedChatIndex = chats.findIndex(c => c._id === deleteChatID);
    closeRow(deletedChatIndex);

    if (isGroupChatDelete) {
      toggleDeleteModal();
      requestChats();
      return;
    }

    const filteredChats = chats.filter(c => c._id !== deleteChatID);

    toggleDeleteModal();
    setChats(filteredChats);
  };

  const navigateToMessages = (
    group = 0,
    title = 'Stephen Carl',
    provider = 0,
    chatID?: string,
    participants?: Participant[],
    messages?: Message[],
    picture?: string | null,
    isChatMuted: boolean = false,
  ) => {
    if (isLoading) return;
    // let isParticipant: Participant | undefined;
    let isLefted = false;
    if (group) {
      dispatch(changeGroupName(title));
      const isParticipant = participants?.find(
        participant => participant._id === user._id,
      );

      if (!isParticipant) isLefted = true;
    }
    navigation.navigate('ChatMessagesScreen', {
      group: group,
      title: title,
      provider: provider,
      chatId: chatID,
      participants,
      messages,
      left: isLefted,
      profilePic: picture,
      isChatMuted,
    });
  };

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };

  const requestChats = () => {
    socketServcies.emit('request', {
      userId: userID,
      page: 1,
    });
  };

  useEffect(() => {
    if (isFocused) {
      setIsLoading(true);
      // Request chats
      requestChats();
    }
  }, [isFocused]);

  const onGetChats = (data: Chat[]) => {
    console.log('--------------------------------');
    console.log('recieving chats');

    // .filter(i => i.messages.length > 0)
    const filteredData = data.sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt).valueOf() -
        new Date(a.lastMessage.createdAt).valueOf(),
    );
    setChats(filteredData);
    setIsLoading(false);
  };

  useEffect(() => {
    // Receiving chats
    socketServcies.on(`getChats/${userID}`, onGetChats);

    return () => {
      socketServcies.removeListener(`getChats/${userID}`, onGetChats);
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading]);

  const showLoader = () => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const hideLoader = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [-100, 5], // Adjust this value to change the starting and ending position of the loader
        }),
      },
    ],
  };

  return (
    <View style={{backgroundColor: 'white', flex: 1}}>
      <SegmentedControl
        tabs={['Accountablity', 'Providers']}
        currentIndex={tabIndex}
        onChange={handleTabsChange}
        segmentedControlBackgroundColor={COLORS.neutral200}
        activeSegmentBackgroundColor={COLORS.mainGreen}
        activeTextColor="white"
        textColor={COLORS.neutral700}
        paddingVertical={10}
      />
      <View style={{flex: 1, overflow: 'hidden'}}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              alignSelf: 'center',
              zIndex: 1,
            },
            animatedStyle,
          ]}>
          <ActivityIndicator color="#8eb26f" size={30} />
        </Animated.View>

        {!isLoading && !chats.length ? (
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{color: 'grey'}}>Your conversation shows here</Text>
          </View>
        ) : null}

        {
          tabIndex === 0 ? (
            <>
              <FlatList
                data={chats}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({item, index}) => {
                  const isMuted = item.participants.find(
                    p => p._id == userID,
                  )?.isMuted;

                  const otherUser = item.participants.find(
                    p => p._id != userID,
                  );

                  if (!otherUser?.firstName || !otherUser?.firstName) return null;

                  let chatName =
                    otherUser?.firstName + ' ' + otherUser?.lastName;

                  if (item.groupName) {
                    chatName = item.groupName;
                  }

                  const message = item.lastMessage;

                  const isUserLeftMessage = message.sentBy === null;
                  let sentByOther: ReceivedBy | undefined | boolean =
                    message.receivedBy?.find(
                      message => message.userId === user._id,
                    );
                  if (isUserLeftMessage && message.removedUsers[0] === userID) {
                    sentByOther = false;
                    if (item.groupName && message?.groupName)
                      chatName = message.groupName;
                  }

                  const messageBody = !isUserLeftMessage
                    ? message.body
                    : `${
                        sentByOther
                          ? message.body?.split(',')[0].split(' ')[0]
                          : 'You'
                      } left`;

                  const unreadBadge =
                    isUserLeftMessage && !sentByOther
                      ? false
                      : item.unReadCount > 0;

                  const isGroup = item.chatType !== 'one-to-one';
                  return (
                    <ChatItem
                      fName={otherUser?.firstName}
                      lName={otherUser?.lastName}
                      photo={
                        !otherUser?.photo
                          ? otherUser?.photoUrl
                          : otherUser?.photo
                      }
                      closeRow={closeRow}
                      index={index}
                      row={row}
                      itemkey={item._id}
                      group={isGroup}
                      onPress={() =>
                        navigateToMessages(
                          isGroup ? 1 : 0,
                          chatName,
                          undefined,
                          item._id,
                          item.participants,
                          item?.messages,
                          isGroup
                            ? null
                            : !otherUser?.photo
                            ? otherUser?.photoUrl
                            : otherUser?.photo,
                          isMuted,
                        )
                      }
                      isActive={unreadBadge}
                      title={chatName}
                      isImg={item.lastMessage?.mediaUrls?.length ? true : false}
                      time={
                        item?.messages?.length
                          ? format(
                              new Date(item.lastMessage.createdAt),
                              'h:mm a',
                            )
                          : ''
                      }
                      text={messageBody}
                      renderRightActions={() => (
                        <DeleteAction
                          onPress={() => toggleDeleteModal(item._id, isGroup)}
                        />
                      )}
                    />
                  );
                }}
              />
            </>
          ) : null
          // <ChatItem
          //   onPress={() => navigateToMessages(undefined, 'Thomas Edison', 1)}
          //   isActive
          //   title="Thomas edison"
          //   time="9:36 AM"
          //   text="Nice. I dont know why people get all worked up about hawaiian
          // pizza. I know why people"
          //   renderRightActions={() => (
          //     <DeleteAction onPress={toggleDeleteModal} />
          //   )}
          // />
        }
      </View>

      <DeleteModal
        onConfirm={deleteChat}
        visible={deleteModalVisible}
        close={toggleDeleteModal}
        title="Delete?"
        description="Are you sure you want to
 delete this conversation?"
        icon="x"
        color="#FD003A"
        btnBgColor="#FD003A"
      />
    </View>
  );
};

export default ChatScreen;
