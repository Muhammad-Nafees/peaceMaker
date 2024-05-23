import React from 'react';
import {
  FlatList,
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import Navigation from '../../../utils/appNavigation';

const {width, height} = Dimensions.get('screen');
const IMG_SIZE = 80;
const SPACING = 10;

export default function ChatMediaImg({route}) {
  const images = route.params.state;

  const topRef = React.useRef<FlatList>();
  const thumbRef = React.useRef<FlatList>();
  const [activeIndex, setActiveIndex] = React.useState(0);

  const scollToIndex = (index: number) => {
    setActiveIndex(index);

    topRef?.current?.scrollToOffset({
      offset: index * width,
      animated: true,
    });

    if (index * (IMG_SIZE + SPACING) - IMG_SIZE / 2 > width / 2) {
      thumbRef.current?.scrollToOffset({
        offset: index * (IMG_SIZE + SPACING) - width / 2 + IMG_SIZE / 2,
        animated: true,
      });
    } else {
      thumbRef.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }
  };

  React.useEffect(() => {
    scollToIndex(route.params.currentIndex)
  },[])

  return (
    <View style={{flex: 1, backgroundColor: '#000'}}>
      <TouchableOpacity
        onPress={() => Navigation.back()}
        style={{
          position: 'absolute',
          left: 10,
          top: (StatusBar.currentHeight || 25) + 20,
          zIndex: 999,
        }}>
        <Icon
          name="arrow-back"
          size={20}
          color="white"
          style={{opacity: 0.8}}
        />
      </TouchableOpacity>
      <FlatList
        ref={topRef}
        data={images}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={ev => {
          scollToIndex(Math.round(ev.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({item}) => (
          <View style={{width, height}}>
            <Image
              style={[StyleSheet.absoluteFillObject]}
              source={{uri: item}}
            />
          </View>
        )}
      />
      <FlatList
        ref={thumbRef}
        data={images}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{position: 'absolute', bottom: IMG_SIZE / 2}}
        contentContainerStyle={{padding: SPACING}}
        renderItem={({item, index}) => (
          <TouchableOpacity onPress={() => scollToIndex(index)}>
            <Image
              style={{
                width: IMG_SIZE,
                height: IMG_SIZE,
                borderRadius: 12,
                marginRight: SPACING,
                borderWidth: 2,
                borderColor: activeIndex === index ? '#FFF' : 'transparent',
              }}
              source={{uri: item}}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
