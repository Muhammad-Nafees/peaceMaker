import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import ScreenTitle from '../../components/shared-components/ScreenTitle';
import RegisterForm from '../../components/Register/RegisterForm';
import AppKeyboardAvoidingView from '../../components/shared-components/KeyboardAvoidingView';

interface Props {
  route: any;
  navigation: any;
}

function RegisterScreen({route, navigation}: Props) {
  const {location} = route.params ?? {location: null};

  return (
    <AppKeyboardAvoidingView>
      <ScrollView
        style={styles.registerContainer}
        keyboardShouldPersistTaps={'always'}>
        <ScreenTitle
          title="Tell us about yourself"
          description="We need this information to create your account."
          extraStyles={{paddingVertical: verticalScale(8)}}
        />
        <View style={styles.formContainer}>
          <RegisterForm navigation={navigation} userLocation={location} />
        </View>
      </ScrollView>
    </AppKeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  registerContainer: {
    flex: 1,
    paddingHorizontal: horizontalScale(16),
    backgroundColor: '#F9FAFA',
  },
  formContainer: {
    flex: 1,
    marginTop: verticalScale(20),
  },
});
