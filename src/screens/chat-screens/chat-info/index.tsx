import React, {useEffect, useState} from 'react';
import {Image, Text, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Navigation from '../../../utils/appNavigation';
import MediaItem from '../../../components/Chat/MediaItem';
import ProfileInfo from '../../../components/Chat/ProfileInfo';
import {useAppSelector} from '../../../redux/app/hooks';
import socketServcies from '../../../utils/socketServices';
import {ApiService} from '../../../utils/ApiService';
import Toast from 'react-native-toast-message';

export default function ChatInfo({route}: any) {
  const [isChatMuted, setIsChatMuted] = useState(route.params?.isMuted ? true : false);
  const [mediaCount, setMediaCount] = useState(0);
  const {data: user, tokens} = useAppSelector(state => state.user);

  const chatId = route.params.recentParams.chatId;
  const name = route.params?.title?.split(' ');
  const firstName = name[0];
  const lastName = name[1];
  console.log('chatId ', chatId);
  console.log(
    'Participant ID',
    route.params.recentParams.participants.find(
      (p: any) => p.userId !== user._id,
    )._id,
  );
  console.log('User ID', user._id);

  const errMessage = () =>
    Toast.show({
      type: 'error',
      text1: 'Something went wrong',
    });

  const muteUnmuteConvo = async () => {
    try {
      const reqObj = {
        userId: user._id,
        isMuted: !isChatMuted,
        chatId,
      };
      const req = new ApiService('chats/mute', tokens.accessToken);
      const res = await req.Post(reqObj);

      console.log(res);
      if (res?.status !== 200) return errMessage();

      Toast.show({
        type: 'success',
        text1: `Conversation ${isChatMuted ? 'Unmuted' : 'Muted'}`,
      });
      route.params?.updateParams({isChatMuted: !isChatMuted})
      setIsChatMuted(prevState => !prevState);
    } catch (err) {
      console.log('muteUnmuteConvo ~ err:', err);
      errMessage();
    }
  };

  const getMediaCount = async () => {
    try {
      const endpoint = `chats/media-count?userId=${user._id}&chatId=${chatId}`;
      const req = new ApiService(endpoint, tokens.accessToken);

      const response = await req.Get();
      if (response.status !== 200) return;

      setMediaCount(response?.data[0].mediaCount);
    } catch (err) {
      console.log('~ getMediaCount ~ err:', err);
    }
  };

  useEffect(() => {
    getMediaCount();
  }, []);

  return (
    <View style={{paddingTop: 15, flex: 1, backgroundColor: '#f9fafa'}}>
      <ProfileInfo
        group={false}
        provider={false}
        title={route.params?.title ? route.params?.title : 'Stephen Carl'}
        img={route.params?.recentParams?.profilePic}
        firstName={firstName}
        lastName={lastName}
      />

      <MediaItem
        onPress={() =>
          Navigation.navigate('ChatMedias', {
            chatId: route.params.recentParams.chatId,
            userId: user._id,
          })
        }
        title={`Media ${mediaCount ? `(${mediaCount})` : ""} `}
        icon
      />
      <MediaItem
        onPress={muteUnmuteConvo}
        title={`${!isChatMuted ? 'Mute' : 'Unmute'} Conversation`}
      />
      <MediaItem
        onPress={() => {
          socketServcies.emit('deleteMessages', {
            userId: user._id,
            chatId: route.params.recentParams.chatId,
          });

          Navigation.navigate('Messages');
        }}
        title="Delete"
        color="#FD003A"
      />
    </View>
  );
}
