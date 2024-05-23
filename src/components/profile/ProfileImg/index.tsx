import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import {COLORS} from '../../../constants/colors';
import {moderateScale} from '../../../utils/metrics';
import {useAppSelector} from '../../../redux/app/hooks';
import FastImage from 'react-native-fast-image';

export default function ProfileImg({
  size = 58,
  txtSize = moderateScale(22),
  smallBoxSize = 22,
  iconSize = 9,
  handleCameraLaunch,
  handleImageDelete,
  isImg,
  imgUri = '',
}: {
  size?: number;
  isImg?: boolean;
  txtSize?: number;
  smallBoxSize?: number;
  imgUri?: string | null;
  iconSize?: number;
  handleCameraLaunch?: () => Promise<void>;
  handleImageDelete?: () => Promise<void>;
}) {
  const [isLoading, setIsLoading] = React.useState(true);
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const user = useAppSelector((state: any) => state.user.data);
  return (
    <View style={[styles.box1NameBox, {width: size, height: size}]}>
      {!imgUri ? (
        <Text style={[styles.box1NameBoxTxt, {fontSize: txtSize}]}>
          {user.firstName?.slice(0, 1).toUpperCase()}
          {user.lastName?.slice(0, 1).toUpperCase()}
        </Text>
      ) : (
        <>
          {isLoading && imgUri.includes('peacemakers3.s3.us-east-2') ? (
            <View
              style={{
                width: size,
                height: size,
                borderRadius: 50,
                backgroundColor: "#EAF3E2",
              }}
            />
          ) : null}
          <Image
            onLoad={handleImageLoad}
            style={{
              width: isLoading && imgUri.includes('http') ? 0 : size,
              height: isLoading && imgUri.includes('http') ? 0 : size,
              borderRadius: 50,
            }}
            source={{
              uri: imgUri,
            }}
          />
        </>
      )}
      {/* // <Image
        //   resizeMode='cover'
        //   style={{width: size, height: size, borderRadius: 50}}
        //   source={{
        //     uri: imgUri,
        //     // priority: FastImage.priority.high,
        //   }}
        // /> */}
      <TouchableOpacity
        onPress={isImg ? handleImageDelete : handleCameraLaunch}
        style={{
          width: smallBoxSize,
          height: smallBoxSize,
          borderRadius: 50,
          backgroundColor: isImg ? 'red' : COLORS.mainGreen,
          borderWidth: 2,
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: 'white',
          position: 'absolute',
          bottom: -6,
          right: 3,
        }}>
        <Icon
          size={isImg ? iconSize + 3 : iconSize}
          name={isImg ? 'trash' : 'camera'}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  box1NameBox: {
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
