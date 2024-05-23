import {Image, Text, View, TouchableWithoutFeedback} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import navigation from '../../../utils/appNavigation';
import {COLORS} from '../../../constants/colors';
import placeholderImg from '../../../constants/extras';
import ProfilePicture from '../../shared-components/ProfilePic';
import { useNavigation } from '@react-navigation/native';

export const chatHeaderTitle = (
  route: any,
  groupName: string,
) => {
  if (route.params?.group == 1) {
    return (
      <TouchableWithoutFeedback
        onPress={() =>
          navigation.navigate('GroupInfo', {
            title: route.params?.title,
            isMuted: isMuted,
            participants: route.params?.participants,
            recentParams: route.params,
          })
        }>
        <View style={{alignItems: 'center'}}>
          <View style={{position: 'relative', width: 45, height: 45}}>
            <Image
              style={{
                width: 30,
                height: 30,
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
                width: 30,
                height: 30,
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
          <Text
            style={{
              fontSize: 12,
              fontWeight: '500',
              lineHeight: 21,
              color: 'black',
              textTransform: 'capitalize',
            }}>
            {groupName}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  const name = route.params?.title?.split(' ');
  const firstName = name[0];
  const lastName = name[1];
  const Navigation = useNavigation();

  const isMuted = route.params?.isChatMuted;

  const updateParams = (params: any) =>
    Navigation.setParams({
      ...route.params,
      ...params,
    });

  return (
    <TouchableWithoutFeedback
      onPress={() =>
        navigation.navigate(
          route.params?.provider === 1 ? 'ProviderInfo' : 'ChatInfo',
          {
            title: route.params?.title,
            isMuted: isMuted,
            recentParams: route.params,
            updateParams: updateParams,
          },
        )
      }>
      <View style={{alignItems: 'center'}}>
        <ProfilePicture
          photo={route.params?.profilePic}
          firstName={firstName}
          lastName={lastName}
          size={43}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            marginBottom: 5,
          }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '500',
              lineHeight: 21,
              color: 'black',
              textTransform: 'capitalize',
            }}>
            {route.params?.title}
          </Text>
          {route.params?.provider === 1 ? (
            <View
              style={{
                width: 18,
                height: 18,
                backgroundColor: COLORS.mainGreen,
                borderRadius: 50,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icon name="check" size={12} color="#fff" />
            </View>
          ) : null}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
