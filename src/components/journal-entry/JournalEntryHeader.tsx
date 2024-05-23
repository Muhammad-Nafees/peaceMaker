import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import Icon from 'react-native-vector-icons/Ionicons';
import {STYLES} from '../../styles/globalStyles';
import {useNavigation} from '@react-navigation/native';
import {AuthStackParamList} from '../../interface/types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

interface Props {
  children: React.ReactNode;
  headerRight?: string;
}

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'JournalEntryRecords',
  'JournalEntryDescription'
>;

const JournalEntryHeader = ({children, headerRight}: Props) => {
  const navigation = useNavigation<NavigationProp>();
  return (
    <View>
      <ScrollView keyboardShouldPersistTaps="always">
        <View style={{position: 'relative'}}>
          <View
            style={{
              position: 'absolute',
              zIndex: 3,
              width: '100%',
              top: verticalScale(20),
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
              }}>
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack();
                }}>
                <Icon name="arrow-back-outline" color="white" size={24} />
              </TouchableOpacity>
              <Text
                style={[
                  STYLES.dev1__text15,
                  {
                    color: 'white',
                    paddingLeft: horizontalScale(30),
                  },
                ]}>
                Journal Entry
              </Text>
              <TouchableOpacity
                onPress={() => {
                  headerRight == 'Records' &&
                    navigation.navigate('JournalEntryRecords');
                }}>
                <Text
                  style={[
                    STYLES.dev1__text15,
                    {
                      color: 'white',
                      paddingRight: headerRight ? 0 : horizontalScale(55),
                    },
                  ]}>
                  {headerRight ? headerRight : ''}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{position: 'absolute', top: verticalScale(100)}}>
              <Text
                style={[
                  STYLES.dev1__text34,
                  {
                    color: 'white',
                    paddingLeft: horizontalScale(16),
                    fontFamily: 'GeneralSans-Semibold',
                  },
                ]}>
                Journal Entry
              </Text>
            </View>
          </View>
          <Image
            style={{width: '100%'}}
            source={require('../../../assets/images/journal-entry-images/journal-bg.png')}
            alt="img"
          />
          <Image
            source={require('../../../assets/images/journal-entry-images/Union.png')}
            alt="img"
            style={{
              position: 'absolute',
              bottom: -verticalScale(80),
              width: '100%',
              tintColor: "#f2f2f2"
            }}
            resizeMode="stretch"
          />
        </View>
        <View
          style={{
            paddingHorizontal: horizontalScale(16),
            position: 'relative',
            bottom: verticalScale(16),
          }}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
};

export default JournalEntryHeader;

const styles = StyleSheet.create({});
