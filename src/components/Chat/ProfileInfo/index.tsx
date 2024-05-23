import React from 'react';
import {Image, Text} from 'react-native';
import {View} from 'react-native';
import {COLORS} from '../../../constants/colors';
import Feather from 'react-native-vector-icons/Feather';
import placeholderImg from '../../../constants/extras';
import ProfilePicture from '../../shared-components/ProfilePic';

interface Props {
  group: boolean;
  provider: boolean;
  title: string;
  img?: string | undefined;
  firstName?: string;
  lastName?: string;
}

export default function ProfileInfo({
  group,
  title,
  provider,
  img,
  firstName,
  lastName,
}: Props) {
  return (
    <View style={{alignItems: 'center', paddingTop: 10}}>
      {group ? (
        <View style={{position: 'relative', width: 65, height: 65}}>
          <Image
            style={{
              width: 43,
              height: 43,
              borderRadius: 50,
              borderWidth: 1,
              borderColor: '#f9fafa',
              position: 'absolute',
              top: 2,
              left: 0,
            }}
            source={placeholderImg}
          />
          <Image
            style={{
              width: 43,
              height: 43,
              borderRadius: 50,
              borderWidth: 1,
              borderColor: '#f9fafa',
              position: 'absolute',
              bottom: 2,
              right: 0,
            }}
            source={placeholderImg}
          />
        </View>
      ) : (
        <ProfilePicture
          photo={img}
          firstName={firstName}
          lastName={lastName}
          size={50}
        />
      )}
      {/* // <Image
        //   source={placeholderImg}
        //   style={{width: 50, height: 50, borderRadius: 50}}
        // /> */}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
          paddingVertical: 5,
        }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '500',
            color: 'black',
            textTransform: 'capitalize',
          }}>
          {title}
        </Text>
        {provider ? (
          <View
            style={{
              width: 20,
              height: 20,
              backgroundColor: COLORS.mainGreen,
              borderRadius: 50,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Feather name="check" size={12} color="#fff" />
          </View>
        ) : null}
      </View>
    </View>
  );
}
