import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, StyleSheet, Platform} from 'react-native';
import {Toast} from 'react-native-toast-message/lib/src/Toast';

import {STYLES} from '../../../../styles/globalStyles';
import {COLORS} from '../../../../constants/colors';
import CustomButton from '../../../../components/shared-components/CustomButton';
import Navigation from '../../../../utils/appNavigation';
import {useAppSelector} from '../../../../redux/app/hooks';
import {ApiService} from '../../../../utils/ApiService';
import socketServcies from '../../../../utils/socketServices';
import AppKeyboardAvoidingView from '../../../../components/shared-components/KeyboardAvoidingView';
import {ScrollView} from 'react-native-gesture-handler';

export default function ChatWithUs() {
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('');
  const [openTicket, setOpenTicket] = useState<{
    id: string;
    count: number;
  } | null>(null);

  const messageRef = React.useRef(message);
  messageRef.current = message;

  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {data: user, tokens} = useAppSelector(state => state.user);

  const navigateToMessages = (
    group = 0,
    title = 'Stephen Carl',
    provider = 0,
    chatId = '',
    count = 1,
  ) =>
    Navigation.replace('SupportChat', {
      group: group,
      title: title + count,
      provider: provider,
      chatId: chatId,
      count,
      // messages: [
      //   {
      //     sentBy: user._id,
      //     mediaUrls: null,
      //     body: messageRef.current,
      //   },
      // ],
    });

  const handleStartChat = async () => {
    if (!message.trim()) {
      setIsError(true);
      return;
    }
    if (isError) setIsError(false);

    setIsLoading(true);

    if (openTicket)
      return onSupportCreate({
        data: {_id: openTicket.id, chatSupportCount: openTicket.count},
        message: message,
      });

    socketServcies.emit('createChatSupport', {
      userId: user._id,
      topic: 'new ticket',
    });
  };

  const closeSupportChat = (chatID: string) => {
    socketServcies.emit('closeChatSupportTicket', {
      userId: user._id,
      chatId: chatID,
      topic: 'new ticket',
    });
    socketServcies.on(`closeChatSupportTicket/${user._id}`, () => {
      console.log('closeChatSupportTicket');
    });
  };

  const onSupportCreate = (data: {
    data: {_id: string; chatSupportCount: number};
    message: string;
  }) => {
    console.log('🚀 ~ file: index.tsx:68 ~ useEffect ~ data:', data);
    console.log('createChatSupport');
    setIsLoading(false);
    if (data.data?._id) {
      socketServcies.emit('sendMessage', {
        userId: user?._id,
        chatId: data.data?._id,
        messageBody: messageRef.current,
        name: user.firstName + ' ' + user.lastName,
      });
      navigateToMessages(
        undefined,
        'Support ',
        undefined,
        data.data?._id,
        data.data?.chatSupportCount ? data.data?.chatSupportCount : 1,
      );
    } else
      Toast.show({
        type: 'info',
        text1: data.message,
      });
  };

  const getPreviousTickets = async () => {
    try {
      const url = `chats?userId=${user._id}&chatSupport=true`;
      const chatReq = new ApiService(url, tokens.accessToken);
      const chatRes = await chatReq.Get();

      if (chatRes.status !== 200 || !chatRes?.data || !chatRes?.data?.length) return;

      const openedTicket = chatRes?.data.find((c: any) => !c.isTicketClosed);
      console.log("🚀 ~ file: index.tsx:122 ~ getPreviousTickets ~ openedTicket:", openedTicket)
      if (openedTicket)
        setOpenTicket({
          id: openedTicket._id,
          count: openedTicket.chatSupportCount,
        });

      // return chatRes?.data[0];
    } catch (err) {
      console.log('🚀 getChatData ~ err:', err);
    }
  };

  useEffect(() => {
    getPreviousTickets();

    socketServcies.on(`createChatSupport/${user._id}`, onSupportCreate);

    return () => {
      socketServcies.removeListener(
        `createChatSupport/${user._id}`,
        onSupportCreate,
      );
    };
  }, []);

  useEffect(() => {
    if (chatId) {
      navigateToMessages(undefined, 'Thomas Edison', undefined, chatId);
      setMessage('');
    }
  }, [chatId]);
  return (
    <AppKeyboardAvoidingView>
      <ScrollView style={{backgroundColor: '#F9FAFA'}}>
        <View
          style={{flex: 1, backgroundColor: '#F9FAFA', paddingHorizontal: 16}}>
          <View>
            <Text style={{fontSize: 28, fontWeight: '800', color: '#15141F'}}>
              Let’s take care of this
            </Text>
            <Text
              style={[
                STYLES.dev1__text13,
                {
                  fontWeight: '500',
                  color: COLORS.neutral700,
                  fontFamily: 'GeneralSans-Medium',
                },
              ]}>
              Tell us as much as you can about the problem, and we’ll make sure
              to get you to the right person.
            </Text>
            <Text
              style={{
                fontSize: 21,
                fontWeight: '800',
                color: '#004852',
                marginTop: 24,
              }}>
              Message
            </Text>
            <TextInput
              onChangeText={setMessage}
              multiline={true}
              placeholder="Hi, I need some help with..."
              // numberOfLines={15}
              placeholderTextColor={
                isError && !message.trim().length ? '#FF170A' : '#94A5AB'
              }
              numberOfLines={Platform.OS === 'ios' ? 1 : 15}
              style={{
                padding: 14,
                backgroundColor: 'white',
                borderRadius: 8,
                borderWidth: 1,
                borderColor:
                  isError && !message.trim().length ? '#FF170A' : '#CECECE',
                fontSize: 14,
                fontWeight: '500',
                marginTop: 8,
                textAlignVertical: 'top',
                height: Platform.OS === 'ios' ? 20 * 15 : null,
                color: 'black',
              }}
            />
          </View>

          <CustomButton
            isLoading={isLoading}
            onPress={handleStartChat}
            extraStyles={[
              styles.btnStyle,
              !message.trim().length ? styles.disabledBtnStyle : {},
            ]}>
            Start Chat
          </CustomButton>
        </View>
      </ScrollView>
    </AppKeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  btnStyle: {
    marginTop: 10,
    marginBottom: 40,
  },
  disabledBtnStyle: {
    backgroundColor: '#e7eaeb',
  },
});
