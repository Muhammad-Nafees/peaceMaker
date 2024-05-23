import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../../utils/metrics';
import Navigation from '../../../utils/appNavigation';

export default function ProfileHeader() {
  return (
    <View style={styles.container}>
      <View />
      <Text style={styles.title}>Profile</Text>
      <TouchableOpacity onPress={() => Navigation.navigate('ProfileSettings')}>
        <Image
          style={styles.img}
          resizeMode="cover"
          source={require('../../../../assets/images/gear.png')}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: verticalScale(50),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {fontSize: moderateScale(18), color: 'black', fontWeight: '500'},
  img: {
    width: 30,
    height: 30,
    marginRight: horizontalScale(5),
  },
});
