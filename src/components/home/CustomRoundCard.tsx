import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import FastImage, {Source} from 'react-native-fast-image';

interface Props {
  imageUrl: number | Source;
  content: string;
  backgroundColor: string;
  extraStyles?: any;
  onPress?: any;
}

const CustomRoundCard = ({
  content,
  imageUrl,
  backgroundColor,
  extraStyles,
  onPress,
}: Props) => {
  return (
    <TouchableOpacity
      style={[
        styles.roundCardContainer,
        extraStyles,
        {backgroundColor: backgroundColor},
      ]}
      activeOpacity={onPress ? 0 : 1}
      onPress={onPress}>
      <View style={styles.roundCard}>
        <FastImage
          source={imageUrl}
          resizeMode="contain"
          style={{
            width: horizontalScale(38),
            height: verticalScale(38),
          }}
        />
        <Text
          style={{
            fontSize: moderateScale(8.5),
            color: '#ffffff',
            fontFamily: 'GeneralSans-Medium',
            textAlign: "center"
          }}>
          {content}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CustomRoundCard;

const styles = StyleSheet.create({
  roundCardContainer: {
    marginTop: verticalScale(16),
    width: 85,
    height: 85,
    borderRadius: 50,
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  roundCard: {
    // paddingTop: verticalScale(13),
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(2.6),
    padding: 5
  },
});
