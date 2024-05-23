import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput, Platform} from 'react-native';
import {STYLES} from '../../../../styles/globalStyles';
import {COLORS} from '../../../../constants/colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../../../../components/shared-components/CustomButton';
import {ApiService} from '../../../../utils/ApiService';
import {useAppSelector} from '../../../../redux/app/hooks';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import Navigation from '../../../../utils/appNavigation';
import AppKeyboardAvoidingView from '../../../../components/shared-components/KeyboardAvoidingView';

export default function MailUs() {
  const [mail, setMail] = useState('');
  const [isError, setIsError] = useState(false);
  const accessToken = useAppSelector(state => state.user.tokens.accessToken);

  const handleEmailSent = async () => {
    if (!mail.trim()) {
      setIsError(true);
      return;
    }
    if (isError) setIsError(false);

    try {
      const email = new ApiService(`user/email-us`, accessToken);
      const emailRes = await email.Post({
        message: mail,
      });
      console.log(
        '🚀 ~ file: AccountabilityPartner.tsx:168 ~ updateAccountabilityPartner ~ userUpdateRes:',
        emailRes,
      );

      if (emailRes.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Email sent successfully!',
        });
        Navigation.back();
      }
    } catch (error) {
      Toast.show({type: 'error', text1: 'Failed to sent email!'});
    }
  };
  return (
    <AppKeyboardAvoidingView>
      <View
        style={{flex: 1, backgroundColor: '#F9FAFA', paddingHorizontal: 16}}>
        <View style={{flex: 1}}>
          <Text style={{fontSize: 28, fontWeight: '800', color: '#15141F'}}>
            Let’s take care of this
          </Text>
          <Text
            style={[
              STYLES.dev1__text13,
              {
                fontWeight: '500',
                color: COLORS.neutral700,
                fontFamily: 'GeneralSans-Medium',
              },
            ]}>
            Tell us as much as you can about the problem, and we’ll be in touch
            soon.
          </Text>
          <Text
            style={{
              fontSize: 21,
              fontWeight: '800',
              color: '#004852',
              marginTop: 24,
            }}>
            Message
          </Text>
          <TextInput
            onChangeText={setMail}
            multiline={true}
            placeholder="Hi, I need some help with..."
            numberOfLines={Platform.OS === 'ios' ? 1 : 15}
            placeholderTextColor={
              isError && !mail.trim().length ? '#FF170A' : '#94A5AB'
            }
            style={{
              padding: 14,
              backgroundColor: 'white',
              borderRadius: 8,
              borderWidth: 1,
              borderColor:
                isError && !mail.trim().length ? '#FF170A' : '#CECECE',
              fontSize: 14,
              fontWeight: '500',
              marginTop: 8,
              textAlignVertical: 'top',
              color: 'black',
              height: Platform.OS === 'ios' ? 20 * 15 : null,
            }}
          />
        </View>

        <CustomButton
          onPress={handleEmailSent}
          extraStyles={[
            {
              marginTop: 0,
              marginBottom: 40,
            },
            !mail.trim().length ? {backgroundColor: '#e7eaeb'} : {},
          ]}>
          Send Message
        </CustomButton>
      </View>
    </AppKeyboardAvoidingView>
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
    marginTop: 8,
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
