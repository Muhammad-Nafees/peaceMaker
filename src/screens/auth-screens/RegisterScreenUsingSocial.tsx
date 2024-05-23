import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import ScreenTitle from '../../components/shared-components/ScreenTitle';
import RegisterForm from '../../components/Register/RegisterForm';
import RegisterFormSocial from '../../components/Register/RegisterFormSocial';

interface Props {
  route: any;
  navigation: any;
}

function RegisterScreenUsingSocial({route, navigation}: Props) {
  const {location} = route.params ?? {location: null};

  return (
    <ScrollView
      style={styles.registerContainer}
      keyboardShouldPersistTaps={'always'}>
      <ScreenTitle
        title="Tell us about yourself"
        description="We need this information to create your account."
        extraStyles={{paddingVertical: verticalScale(8)}}
      />
      <View style={styles.formContainer}>
        <RegisterFormSocial route={route} navigation={navigation} userLocation={location} />
      </View>
    </ScrollView>
  );
}

export default RegisterScreenUsingSocial;

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
