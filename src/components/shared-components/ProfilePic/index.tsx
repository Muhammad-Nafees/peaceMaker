import React from 'react';
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {moderateScale} from '../../../utils/metrics';
import FastImage from 'react-native-fast-image';

interface Props {
  firstName: string | null;
  lastName: string | null;
  size?: number;
  photo?: string | null | undefined;
  s3Img?: boolean;
  style?: StyleProp<ViewStyle>;
}

function isS3String(s: string): boolean {
  return !s.includes('https://');
}

export default function ProfilePicture({
  firstName = 'p',
  lastName = 'p',
  size = 55,
  photo = '',
  style,
}: Props) {
  return (
    <View style={[styles.box1NameBox, {width: size, height: size}, style]}>
      {photo ? (
        <FastImage
          resizeMode="cover"
          style={styles.chatPic}
          source={{
            uri: isS3String(photo)
              ? `https://peacemakers3.s3.us-east-2.amazonaws.com/${photo}`
              : photo,
          }}
        />
      ) : (
        <Text style={[styles.box1NameBoxTxt, {fontSize: size / 3}]}>
          {firstName?.slice(0, 1).toUpperCase()}
          {lastName?.slice(0, 1).toUpperCase()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chatPic: {
    width: '100%',
    height: '100%',
  },
  box1NameBox: {
    overflow: 'hidden',
    borderRadius: 50,
    backgroundColor: '#EAF3E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box1NameBoxTxt: {
    fontWeight: '700',
    color: '#15141F',
  },
});
