import {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Text,
  Platform,
} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import JournalEntryHeader from '../../components/journal-entry/JournalEntryHeader';
import {verticalScale} from '../../utils/metrics';
import {COLORS} from '../../constants/colors';
import CustomButton from '../../components/shared-components/CustomButton';
import {useIsFocused} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AppKeyboardAvoidingView from '../../components/shared-components/KeyboardAvoidingView';

const JournalScreen = ({navigation, route}: any) => {
  const [journal, setJournal] = useState('');
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      if (route.params?.goToSpecific) {
        console.log('GOING TO SPECIFIC');

        setJournal('');
       
        if (Platform.OS === 'ios')
          setTimeout(() => {
            navigation.navigate(route.params?.goToSpecific);
          }, 0);
        else navigation.navigate(route.params?.goToSpecific);
        navigation.setParams({
          ...route.params,
          goToSpecific: undefined,
        });
      }
    }
  }, [isFocused]);

  return (
    <AppKeyboardAvoidingView verticalOffset={30} bg='#F9FAFA'>
    <View style={{flex: 1, backgroundColor: '#f9f9fa'}}>
      <JournalEntryHeader headerRight="Records">
        <View style={{position: 'relative'}}>
          <TextInput
            value={journal}
            onChangeText={setJournal}
            multiline
            style={styles.inputField}
          />
          <Text
            style={[
              STYLES.dev1__text14,
              {
                position: 'absolute',
                padding: 20,
                color: COLORS.primary400,
                fontFamily: 'GeneralSans-Medium',
              },
            ]}>
            Write a Journal Today:
          </Text>
        </View>
        <View>
          <CustomButton
            onPress={() => {
              if (!journal) {
                Toast.show({
                  type: 'info',
                  text1: 'Please write a journal.',
                });
                return;
              }
              navigation.navigate('JournalEntry', {journal: journal});
            }}>
            Continue
          </CustomButton>
        </View>
      </JournalEntryHeader>
    </View>
    </AppKeyboardAvoidingView>
  );
};

export default JournalScreen;

const styles = StyleSheet.create({
  inputField: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
    height: verticalScale(300),
    textAlignVertical: 'top',
    paddingTop: verticalScale(50),
    paddingHorizontal: 20,
    color: COLORS.neutral900,
    fontFamily: 'GeneralSans-Medium',
  },
});
