import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../shared-components/CustomButton';
import { STYLES } from '../../styles/globalStyles';
import { COLORS } from '../../constants/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../interface/types';
import { horizontalScale } from '../../utils/metrics';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'AccountabilityPartner'
>;

const NoBuddies = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.buddiesContainer}>
        <View style={{ width: horizontalScale(200) }}>
          <Text
            style={[
              STYLES.dev1__text16,
              { color: COLORS.neutral700, textAlign: 'center',fontFamily: 'GeneralSans-Medium' },
              
            ]}
          >
            No accountability buddies to add yet.
          </Text>
          <CustomButton onPress={() => navigation.navigate('CompleteProfile')}>
            Skip
          </CustomButton>
        </View>
      </View>
    </ScrollView>
  );
};

export default NoBuddies;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buddiesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
});
