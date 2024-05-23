import React, {useState} from 'react';
import {Image, ScrollView, Text, View} from 'react-native';

import Navigation from '../../../utils/appNavigation';
import MediaItem from '../../../components/Chat/MediaItem';
import ProfileInfo from '../../../components/Chat/ProfileInfo';
import placeholderImg from '../../../constants/extras';
import {Participant} from '../../../interface/types';
import {useAppSelector} from '../../../redux/app/hooks';
import socketServcies from '../../../utils/socketServices';
import {useDispatch} from 'react-redux';
import {changeGroupName} from '../../../redux/features/extra/extraSlice';
import {ApiService} from '../../../utils/ApiService';

export default function GroupInfo({route}) {
  const [mediaCount, setMediaCount] = useState(0);
  const [groupname, setGroupname] = useState(route.params.title);
  const {data: user, tokens} = useAppSelector(state => state.user);
  const participants: Participant[] = route.params?.participants;
  console.log(
    '🚀 ~ file: group.tsx:20 ~ GroupInfo ~ participants:',
    participants,
  );
  const chatId = route.params.recentParams.chatId;

  // useRef to keep track of the latest name value
  const nameRef = React.useRef(groupname);
  nameRef.current = groupname;

  const dispatch = useDispatch();

  const handleChangeGroupName = () => {
    const txt = nameRef.current;
    if (txt.length < 1) return;

    socketServcies.emit('updateChat', {
      chatId: chatId,
      groupName: txt,
    });
  };

  const handleGroupLeave = () => {
    socketServcies.emit('removeParticipants', {
      chatId: chatId,
      userId: user._id,
      participantIds: [user._id],
    });

    socketServcies.on(`removeParticipants/${chatId}`, (data: any) => {
      console.log('removed Participants');
      console.log(data);
      Navigation.navigate('Messages');
    });
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

  React.useEffect(() => {
    getMediaCount();

    socketServcies.on(`updateChat/${chatId}`, (data: any) => {
      console.log('updated chat');
      dispatch(changeGroupName(data.groupName));
      console.log(
        'You have successfully changed the group name to: ' + data.groupName,
      );
    });

    return () => {
      handleChangeGroupName();
    };
  }, []);

  return (
    <View
      style={{
        paddingTop: 15,
        flex: 1,
        backgroundColor: '#f9fafa',
        paddingBottom: 20,
      }}>
      <ProfileInfo
        group
        provider={false}
        title={route.params?.title ? route.params?.title : 'Kyle and Aaron'}
      />

      <ScrollView>
        <MediaItem
          notDisabled={route.params.recentParams?.left ? false : true}
          editable
          value={groupname}
          // onChangeText={handleChangeGroupName}
          onChangeText={setGroupname}
          view
          title="Group Name"
          color="#000"
        />
        <MediaItem
          onPress={() =>
            Navigation.navigate('ChatMedias', {
              chatId: route.params.recentParams.chatId,
              userId: user._id,
            })
          }
          title={`Media ${mediaCount ? `(${mediaCount})` : ''} `}
          icon
        />
        <View
          style={{
            alignItems: 'center',
            marginTop: 16,
            borderRadius: 10,
            overflow: 'hidden',
            backgroundColor: 'white',
            width: '90%',
            alignSelf: 'center',
          }}>
          {participants.map((participant, index) => (
            <MediaItem
              fName={participant.firstName}
              lName={participant.lastName}
              key={index}
              view
              title={participant.firstName + ' ' + participant.lastName}
              img={participant.photo}
              fontWeight="500"
            />
          ))}
          {/* <MediaItem
            view
            title="Akiza Kei"
            img={placeholderImg}
            fontWeight="500"
          />
          <MediaItem
            view
            title="Aaron Vlademir"
            img={placeholderImg}
            fontWeight="500"
          />
          <MediaItem
            view
            title="Kyle Smith"
            img={placeholderImg}
            fontWeight="500"
          /> */}
        </View>
        {!route.params.recentParams?.left ? (
          <MediaItem
            onPress={handleGroupLeave}
            title="Exit Group Chat"
            color="#FD003A"
            fontWeight="500"
          />
        ) : null}
      </ScrollView>
    </View>
  );
}
