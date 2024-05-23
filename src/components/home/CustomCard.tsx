import {ImageSourcePropType, StyleSheet, View, Text} from 'react-native';
import FastImage, {Source} from 'react-native-fast-image';

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {STYLES} from '../../styles/globalStyles';
import {COLORS} from '../../constants/colors';


interface Props {
  imageUrl: number | Source;
  content: string;
};
   

const CustomCard = ({imageUrl, content}: Props) => {
  return (
    <View style={styles.card}>
      <FastImage
        source={imageUrl}
        resizeMode="contain"
        style={{width: horizontalScale(24), height: verticalScale(21)}}
      />

      <Text style={(STYLES.dev1__text14, {color: COLORS.green,fontFamily: 'GeneralSans-Semibold'})}>
        {content}
      </Text>
    </View>
  );
};

export default CustomCard;

const styles = StyleSheet.create({
  card: {
    width: horizontalScale(165),
    height: verticalScale(57),
    backgroundColor: '#FDFDFD',
    borderWidth: horizontalScale(1),
    borderColor: '#F4F4F4',
    borderRadius: moderateScale(10),
    paddingHorizontal: horizontalScale(16),
    alignItems: 'center',
    flexDirection: 'row',
    gap: horizontalScale(4),
    flex: 1,
    overflow: 'hidden'
  },
});
