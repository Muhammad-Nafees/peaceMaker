import React from 'react';
import {View, Text, StyleSheet, Image, Linking, TouchableWithoutFeedback} from 'react-native';
import {STYLES} from '../../../../styles/globalStyles';
import {COLORS} from '../../../../constants/colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function CallUs() {
  return (
    <View style={{flex: 1, backgroundColor: '#F9FAFA', paddingHorizontal: 16}}>
      <Text style={{fontSize: 28, fontWeight: '800', color: '#15141F'}}>
        Talk to our team
      </Text>
      <Text
        style={[
          STYLES.dev1__text13,
          {
            fontWeight: '500',
            color: COLORS.neutral700,
            fontFamily: 'GeneralSans-Medium',
            marginTop: 24,
          },
        ]}>
        Personal accounts
      </Text>
      <View style={styles.supportItemContainer}>
        <TouchableWithoutFeedback onPress={()=>{
          Linking.openURL(`tel:+1 123 4342 123`)
        }}>
          <View style={styles.supportItemTxtContainer}>
            <Text style={styles.supportItemTxt1}>+1 123 4342 123</Text>
            <Text style={styles.supportItemTxt2}>Mon - Fri 08:00 - 16:00 USA</Text>
          </View>
        </TouchableWithoutFeedback>

        <MaterialIcons name="arrow-forward-ios" size={20} color="#2791B5" />
      </View>
      <Text
        style={[
          STYLES.dev1__text13,
          {
            fontWeight: '500',
            color: COLORS.neutral700,
            fontFamily: 'GeneralSans-Medium',
            marginTop: 24,
          },
        ]}>
        Business accounts
      </Text>
      <TouchableWithoutFeedback onPress={()=>{
          Linking.openURL(`tel:+1 123 4342 123`)
        }}>
        <View style={styles.supportItemContainer}>
          <View style={styles.supportItemTxtContainer}>
            <Text style={styles.supportItemTxt1}>+1 123 4342 123</Text>
            <Text style={styles.supportItemTxt2}>Mon - Fri 08:00 - 16:00 USA</Text>
          </View>
          <MaterialIcons name="arrow-forward-ios" size={20} color="#2791B5" />
        </View>
      </TouchableWithoutFeedback>
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
    marginTop: 8
  },
  supportItemTxtContainer: {marginLeft: 0, flex: 1},
  supportItemTxt1: {fontSize: 16, fontWeight: '500', color: '#1f2c37'},
  supportItemTxt2: {
    fontSize: 13,
    fontWeight: '500',
    color: '#576B74',
    lineHeight: 18,
  },
});
