import React, {useEffect, useState} from 'react';
import {
  Image,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
  View,
} from 'react-native';

import Navigation from '../../../utils/appNavigation';
import {ApiService} from '../../../utils/ApiService';
import {Text} from 'react-native';

export default function ChatMedias({route}) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getMedia = async () => {
      try {
        setLoading(true);
        const register = new ApiService(
          `chats/media?userId=${route.params.userId}&chatId=${route.params.chatId}`,
          '',
        );
        const {data} = await register.Get();
        console.log('~ getMedia ~ data:', data[0].mediaUrls);

        let arr: string[] = [];

        data[0].mediaUrls.forEach((media: string) =>
          arr.push('https://peacemakers3.s3.us-east-2.amazonaws.com/' + media),
        );
        console.log('🚀 ~ file: index.tsx:28 ~ getMedia ~ arr:', arr);

        setImages(arr);
        setLoading(false);
        // setImages(data[0].mediaUrls);
      } catch (error) {
        console.log('🚀  ~ error:', error);
        setLoading(false);
      }
    };

    getMedia();
  }, []);
  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: 15,
        flex: 1,
        backgroundColor: '#f9fafa',
        flexDirection: 'row',
        flexWrap: 'wrap',
        // justifyContent: 'flex-start',
        paddingHorizontal: 10,
        // alignContent: "center"
        // borderWidth: 1,
      }}>
      {loading ? (
        [1, 2, 3, 4, 5, 6].map((_, index) => (
          <View
            key={index}
            style={[styles.img, {backgroundColor: '#d9d9d9'}]}
          />
        ))
      ) : !images.length ? (
        <View style={{width: '100%', alignItems: 'center'}}>
          <Text style={{color: 'grey'}}>No Media Found</Text>
        </View>
      ) : (
        images?.map((image, index) => (
          <TouchableWithoutFeedback
            key={index}
            onPress={() =>
              Navigation.navigate('ChatMediaImg', {
                state: images,
                currentIndex: index,
              })
            }>
            <Image
              style={styles.img}
              source={{
                uri: image,
              }}
            />
          </TouchableWithoutFeedback>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  img: {
    width: '30%',
    height: 117,
    // margin: 5.2,
    margin: 5,
  },
});
