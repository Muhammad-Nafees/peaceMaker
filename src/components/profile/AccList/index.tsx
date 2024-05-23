import React, {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';

import Navigation from '../../../utils/appNavigation';
import {COLORS} from '../../../constants/colors';
import {UserNotif} from '../../../interface/types';
import ProfilePicture from '../../shared-components/ProfilePic';

export default function AccountabilityList({
  btnTxt,
  peaceBox,
  name,
  onPressAdd,
  onPressRemove,
  onPressPeacemaker,
  id,
  notifData,
  fname,
  lname,
  photo
}: {
  btnTxt: 'Add' | 'Remove';
  peaceBox: boolean;
  name: string;
  onPressAdd: (param: string) => Promise<void> | void;
  onPressRemove: () => void;
  onPressPeacemaker: () => void;
  id: string;
  notifData: UserNotif;
  fname: string;
  lname: string;
  photo: string | null;
}) {
  const myPeaceMakerScreen = btnTxt === 'Add' ? false : true;

  return (
    <TouchableWithoutFeedback
      onPress={() =>
        myPeaceMakerScreen &&
        Navigation.navigate('AccountablityBuddy', {
          name: name,
          id: id,
          notifData,
          photo,
          fname,
          lname
        })
      }>
      <View style={styles.container}>
        <ProfilePicture firstName={fname} lastName={lname} photo={photo} size={43} />
        {/* <Image
          style={styles.img}
          source={{
            uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80',
          }}
        /> */}
        <View style={styles.titlePeaceContainer}>
          <Text style={styles.title}>{name}</Text>
          {myPeaceMakerScreen && (
            <TouchableOpacity
              style={{flexDirection: 'row'}}
              onPress={onPressPeacemaker}>
              <View
                style={[
                  styles.untickBox,
                  {
                    backgroundColor: peaceBox ? COLORS.mainGreen : '#f9fafa',
                    borderWidth: !peaceBox ? 1 : 0,
                  },
                ]}>
                {peaceBox && <Icon name="check" color="#FFF" size={18 / 2} />}
              </View>
              <Text style={styles.peacemakerTxt}>Peace Maker</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={!myPeaceMakerScreen ? onPressAdd : onPressRemove}
          style={styles.button}>
          <Text style={styles.btnTxt}>{btnTxt}</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  peacemakerTxt: {
    marginLeft: 8,
    fontWeight: '500',
    fontSize: 13,
    color: '#DADADA',
  },
  untickBox: {
    width: 18,
    height: 18,
    borderColor: '#D6D6D6',
    // borderWidth: 1,
    borderRadius: 50,
    // backgroundColor: COLORS.mainGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    // height: 50,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 6,
  },
  img: {width: 43, height: 43, borderRadius: 50},
  titlePeaceContainer: {
    // flexDirection: 'row',
    marginHorizontal: 8,
    flex: 1,
    alignItems: 'flex-start',
    // flexWrap: 'wrap',
    justifyContent: 'space-between',
    // backgroundColor: "red",
    gap: 2,
  },
  peacebox: {
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(142, 178, 111, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  peaceboxTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8EB26F',
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '400',
    color: 'black',
    marginRight: 8,
  },
  button: {
    width: 75,
    // minHeight: 32,
    borderRadius: 20,
    backgroundColor: '#D6D6D6',
    padding: 8,
  },
  btnTxt: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    color: 'white',
  },
});
