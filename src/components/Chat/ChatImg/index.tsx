import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import {COLORS} from '../../../constants/colors';
import placeholderImg from '../../../constants/extras';
import Navigation from '../../../utils/appNavigation';
import ProfilePicture from '../../shared-components/ProfilePic';

interface Props {
  byMe: boolean;
  imgUri: string;
  index: number;
  group: number;
  caption?: string;
  participantName: string;
}

export default function ChatImg({
  byMe,
  index,
  imgUri,
  group,
  caption,
  participantName,
}: Props) {
  const [isLoading, setIsLoading] = React.useState(true);
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const username = participantName?.split(' ');
  const firstName = username[0];
  const lastName = username[1];
  return (
    <TouchableWithoutFeedback
    //   onPress={
    // () =>
    // Navigation.navigate('ChatMediaImg', {
    //   state: [imgUri],
    //   currentIndex: 0,
    // })
    //   }
    >
      <View
        style={
          byMe
            ? styles.rightMessage
            : [
                styles.leftMessage,
                {marginLeft: group === 1 ? 38 : 20, paddingTop: group ? 0 : 3},
              ]
        }
        key={index}>
        {group && !byMe ? (
          <Text
            style={{
              fontSize: 10,
              marginVertical: 2,
              // paddingLeft: 2,
              color: !byMe ? 'grey' : 'white',
              alignSelf: 'flex-start',
            }}>
            {byMe ? 'You' : participantName}
          </Text>
        ) : null}
        {isLoading && imgUri.includes('peacemakers3.s3.us-east-2') ? (
          <View
            style={{
              width: 250,
              height: 200,
              borderRadius: 5,
              backgroundColor: COLORS.neutral200,
            }}
          />
        ) : null}
        <Image
          onLoad={handleImageLoad}
          style={{
            width:
              isLoading && imgUri.includes('peacemakers3.s3.us-east-2')
                ? 0
                : 250,
            height:
              isLoading && imgUri.includes('peacemakers3.s3.us-east-2')
                ? 0
                : 200,
            borderRadius: 5,
          }}
          source={{
            uri: imgUri,
          }}
        />
        {caption ? (
          <Text
            style={{
              fontSize: 15,
              color: byMe ? '#fff' : '#000',
              fontWeight: '400',
              paddingTop: 2,
              paddingLeft: 2,
            }}>
            {caption}
          </Text>
        ) : null}
        {group === 1 && !byMe ? (
          <View style={styles.img}>
            <ProfilePicture
              photo={''}
              firstName={firstName}
              lastName={lastName}
              size={22}
            />
          </View>
        ) : null}
        {/* // <Image style={styles.img} source={placeholderImg} /> */}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  rightMessage: {
    backgroundColor: COLORS.mainGreen,
    padding: 3,
    // paddingTop: 0,
    borderRadius: 8,
    marginLeft: '45%',

    marginTop: 8,
    marginBottom: 8,
    marginRight: 20,
    maxWidth: '75%',
    alignSelf: 'flex-end',
  },

  leftMessage: {
    backgroundColor: '#e6e5eb',
    padding: 3,
    paddingTop: 0,
    borderRadius: 8,

    marginTop: 8,
    marginBottom: 8,
    maxWidth: '75%',
    alignSelf: 'flex-start',
    //maxWidth: 500,
    //padding: 14,

    //alignItems:"center",
    // borderRadius: 10,
  },

  img: {
    width: 22,
    height: 22,
    borderRadius: 50,
    position: 'absolute',
    bottom: 0,
    left: -27,
  },
});
