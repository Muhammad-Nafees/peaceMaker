import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';
import {useLayoutEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {STYLES} from '../../styles/globalStyles';
import {COLORS} from '../../constants/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import {moderateScale} from '../../utils/metrics';
import ProfilePicture from '../shared-components/ProfilePic';

interface Props {
  User: any;
  handleDataPress: any;
  isBuddy: any;
}
const BuddiesList = ({User, handleDataPress, isBuddy}: Props) => {
  const navigation = useNavigation();

  // const handleAddBuddies = (item: any) => {
  // if (buddiesList.includes(item)) {
  //   addedBuddies = addedBuddies.filter((existingUser: any) => {
  //     return existingUser != item;
  //   });
  // } else {
  //   setBuddiesList(item);
  // }

  // console.log(addedBuddies);

  // setBuddiesList(addedBuddies);
  // };

  // const checkItem = (prevItem: any, item: any) => {
  //   console.log(...prevItem);

  //   if(!prevItem.includes(item)){
  //     return [...prevItem,item]
  //   }
  //   return prevItem.filter((pastItems:any) => {return pastItems!=item})
  // };
  return (
    <Pressable
      style={({pressed}) => pressed && styles.pressed}
      onPress={() => handleDataPress(User)}>
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          <ProfilePicture
            firstName={User?.firstName}
            lastName={User?.lastName}
            photo={!User.photo ? User.photoUrl : User.photo}
            size={43}
          />
          {/* <Image
            source={require('../../../assets/images/Bitmap.jpg')}
            resizeMode="cover"
            alt="avatarImg"
            style={styles.image}
          /> */}
          <Text
            style={[
              STYLES.dev1__text16,
              {
                fontWeight: '400',
                color: 'black',
                fontFamily: 'GeneralSans-Medium',
              },
            ]}>
            {User?.firstName}
          </Text>
        </View>
        {isBuddy ? (
          <Icon name="check" color={'#8EB26F'} size={moderateScale(20)} />
        ) : null}
      </View>
    </Pressable>
  );
};

export default BuddiesList;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
  },
  innerContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  image: {
    borderRadius: 48,
    width: 43,
    height: 43,
  },
  pressed: {
    opacity: 0.75,
  },
});
