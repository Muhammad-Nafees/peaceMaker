import React from 'react';
import { Text, View,} from 'react-native';

import Navigation from '../../../utils/appNavigation';
import MediaItem from '../../../components/Chat/MediaItem';
import ProfileInfo from '../../../components/Chat/ProfileInfo';
import placeholderImg from '../../../constants/extras';

export default function ProviderInfo() {
  return (
    <View style={{paddingTop: 15, flex: 1, backgroundColor: '#f9fafa'}}>
      <ProfileInfo group={false} provider title='Thomas Edison' />

      <MediaItem onPress={() => Navigation.navigate('ChatMedias')} title="Medias (10)" icon />

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
        <View
          style={{
            height: 40,
            width: '100%',
            backgroundColor: 'white',
            alignItems: 'center',
            // justifyContent: 'center',
            flexDirection: 'row',
            paddingLeft: 21,
          }}>
          <Text
            style={{
              fontSize: 16.5,
              fontWeight: '500',
              letterSpacing: -0.08,
              color: '#7B8D95',
              marginHorizontal: 2,
              flex: 1,
            }}>
            Challenges
          </Text>
        </View>

        <MediaItem
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
        />
      </View>

      <MediaItem view title="Mute Conversation" />

      <MediaItem title="Block Provider" color="#FD003A" fontWeight='500' />
      <MediaItem title="Delete" color="#FD003A" fontWeight='500' />

    </View>
  );
}
