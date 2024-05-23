import {apple, facebook, google} from '../../constants/images';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import FastImage from 'react-native-fast-image';

interface Props {
  extraStyles?: any;
  onGoogleLogin: () => void;
  onFacebookLogin: () => void;
  onAppleLogin?: () => void;
}

const SocialIcons = ({
  extraStyles,
  onGoogleLogin,
  onFacebookLogin,
  onAppleLogin,
}: Props) => {
  return (
    <View style={[styles.iconsTray, extraStyles]}>
      {Platform.OS === 'android' && (
        <TouchableOpacity
          onPress={onGoogleLogin}
          style={{
            padding: 10,
            borderRadius: 50,
            borderColor: '#6D6D6D',
            borderWidth: 0.5,
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 5,
          }}>
          <FastImage
            source={{uri: 'https://i.ibb.co/34VRk5W/Google-icon.png'}}
            style={{width: 25, height: 25}}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={onFacebookLogin}
        style={{
          padding: 10,
          borderRadius: 50,
          borderColor: '#6D6D6D',
          borderWidth: 0.5,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#3B5998',
          marginHorizontal: 5,
        }}>
        <FastImage
          source={{uri: 'https://i.ibb.co/JF1XC4Z/Vector.png'}}
          style={{width: 25, height: 25}}
          resizeMode="contain"
        />
      </TouchableOpacity>
      {Platform.OS === 'ios' && (
        <TouchableOpacity
          onPress={onAppleLogin}
          style={{
            padding: 10,
            borderRadius: 50,
            borderColor: '#6D6D6D',
            borderWidth: 0.5,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#000',
            marginHorizontal: 5,
          }}>
          <FastImage
            source={{uri: 'https://i.ibb.co/SrmFNWP/Group.png'}}
            style={{width: 25, height: 25}}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SocialIcons;

const styles = StyleSheet.create({
  iconsTray: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: verticalScale(24),
    justifyContent: 'center',
  },

  iconsContainer: {
    // paddingHorizontal: horizontalScale(1),
  },
});
