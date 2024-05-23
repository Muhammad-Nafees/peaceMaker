import React from 'react';
import {
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Text,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {COLORS} from '../../../constants/colors';
import Navigation from '../../../utils/appNavigation';

const {width, height} = Dimensions.get('window');

export default function ImagePreview({route}) {
  const [message, setMessage] = React.useState('');
  return (
    <KeyboardAvoidingView
      behavior="position"
      // style={{ flex: 1}}
      // contentContainerStyle={{ flex: 1}}
      keyboardVerticalOffset={0}>
      <View style={{width: width, height: height, backgroundColor: 'black'}}>
        <Image
          style={{width: '100%', height: '100%'}}
          resizeMode="contain"
          source={{uri: route.params.img}}
        />
        <View
          style={{
            position: 'absolute',
            top: 5,
            left: 10,
          }}>
          <TouchableOpacity
            onPress={() => {
              // Navigation.navigate('ChatMessagesScreen', {
              //   ...route.params.recentParams,
              // });
              Navigation.back();
            }}>
            <Icon name="close-outline" size={30} color="white" />
          </TouchableOpacity>
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: 60,
          }}>
          <View
            style={{
              width: Dimensions.get('screen').width,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              alignItems: 'center',
              alignSelf: 'center',
              marginBottom: 10,
            }}>
            <TextInput
              onChangeText={setMessage}
              value={message}
              placeholder="Add a caption..."
              placeholderTextColor="white"
              style={{
                height: 45,
                backgroundColor: '#1f2c33',
                flex: 1,
                borderRadius: 50,
                padding: 5,
                paddingLeft: 15,
                color: 'white',
              }}
            />
          </View>
          <View
            style={{
              width: Dimensions.get('screen').width,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              alignItems: 'center',
              alignSelf: 'center',
            }}>
            <View
              style={{
                backgroundColor: '#1f2c33',
                height: 35,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 10,
                borderRadius: 25,
                minWidth: 70,
              }}>
              <Text style={{color: 'white', fontSize: 16, fontWeight: '400'}}>
                {route.params.recentParams.title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                Navigation.navigate(
                  route.params.goto ? route.params.goto : 'ChatMessagesScreen',
                  {
                    ...route.params.recentParams,
                    imgageUri: route.params.img,
                    caption: message,
                    fromPreview: true,
                    imageType: route.params?.imageType
                  },
                );
              }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 50,
                backgroundColor: COLORS.mainGreen,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon name="ios-send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
