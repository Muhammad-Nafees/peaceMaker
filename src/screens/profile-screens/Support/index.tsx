import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Navigation from '../../../utils/appNavigation';

export default function Support() {
  return (
    <View style={{flex: 1, backgroundColor: '#F9FAFA', paddingHorizontal: 16}}>
      <Text style={{fontSize: 28, fontWeight: '800', color: '#15141F'}}>
        Talk to our team
      </Text>

      <Image
        style={{width: 177, height: 180, alignSelf: 'center', marginTop: 25}}
        source={require('../../../../assets/images/Questions-amico.png')}
      />

      <View>
        <TouchableWithoutFeedback onPress={() => Navigation.navigate('ChatWithUs')}>
            <View style={styles.supportItemContainer}>
              <Image
                style={styles.supportItemImg}
                resizeMode='contain'
                source={require('../../../../assets/images/chatwUs.png')}
              />
              <View style={styles.supportItemTxtContainer}>
                <Text style={styles.supportItemTxt1}>Chat with us</Text>
                <Text style={styles.supportItemTxt2}>We'll reply in 2-5 mins</Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={20} color="#2791B5" />
            </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => Navigation.navigate('MailUs')}>
          <View style={styles.supportItemContainer}>
            <Image
            resizeMode='contain'
              style={styles.supportItemImg}
              source={require('../../../../assets/images/chatwUs.png')}
            />
            <View style={styles.supportItemTxtContainer}>
              <Text style={styles.supportItemTxt1}>Email us</Text>
              <Text style={styles.supportItemTxt2}>
                We'll reply in 1 working day
              </Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={20} color="#2791B5" />
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => Navigation.navigate('CallUs')}>
          <View style={styles.supportItemContainer}>
            <Image
            resizeMode='contain'
              style={styles.supportItemImg}
              source={require('../../../../assets/images/chatwUs.png')}
            />
            <View style={styles.supportItemTxtContainer}>
              <Text style={styles.supportItemTxt1}>Call us</Text>
              <Text style={styles.supportItemTxt2}>Available Mon-Fri</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={20} color="#2791B5" />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  supportItemContainer: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  supportItemImg: {width: 18, height: 18},
  supportItemTxtContainer: {marginLeft: 25, flex: 1},
  supportItemTxt1: {fontSize: 16, fontWeight: '500', color: '#1f2c37'},
  supportItemTxt2: {
    fontSize: 13,
    fontWeight: '500',
    color: '#576B74',
    lineHeight: 18,
  },
});
