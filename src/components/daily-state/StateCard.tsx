import React from 'react';
import {StyleSheet, View, Text, Pressable} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import {Image} from 'react-native';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../interface/types';

interface Props {
  name: string;
  imageurl: any;
  percentage?: number | undefined;
  lastUpdateTime?: string;
  bgColor: string;
}

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'StateDetailsScreen',
  'PainChartScreen'
>;

const StateCard = ({
  name,
  imageurl,
  percentage,
  lastUpdateTime,
  bgColor,
}: Props) => {
  const navigation = useNavigation<NavigationProp>();
  // const [opacity, setOpacity] = useState(0.7);

  // const [painChartModalVisible, setPainChartModalVisible] =
  //   useState<boolean>(false);

  // useEffect(() => {
  //   setOpacity(0.7);
  // }, []);

  // const handleClick = () => {

  //   if (percentage! > 25) {

  //     navigation.navigate('StateDetailsScreen', {
  //       name,
  //       imageurl,
  //       bgColor,
  //     });
  //   } else if (percentage == undefined) {

  //     return;
  //   } else {
  //     setPainChartModalVisible(true);
  //   }

  // };

  const handleClick = () => {
    console.log('🚀~ name:', name);
    console.log('🚀~ percentage:', percentage);
    navigation.navigate('StateDetailsScreen', {
      name,
      imageurl,
      bgColor,
      state: percentage,
    });

    // setTimeout(() => {
    //   navigation.setParams({showFinalThought: true});
    // }, 200);

    // if (percentage && percentage < 25 && name.toLowerCase() === 'physical')
    //   setPainChartModalVisible(true);
    // else {
    //   navigation.navigate('StateDetailsScreen', {
    //     name,
    //     imageurl,
    //     bgColor,
    //     state: percentage,
    //   });

    //   setTimeout(() => {
    //     navigation.setParams({showFinalThought: true});
    //   }, 200);
    // }
  };

  return (
    <Pressable
      style={({pressed}) => [
        percentage !== undefined && pressed && styles.pressed,
        styles.stateCardContainer,
        {backgroundColor: bgColor},
      ]}
      onPress={handleClick}>
      <Text
        style={[
          STYLES.dev1__text16,
          {fontFamily: 'Satoshi-Black', color: '#ffffff'},
        ]}>
        {name}
      </Text>
      <Image
        source={{uri: imageurl}}
        resizeMode="contain"
        style={{
          width: horizontalScale(95),
          height: verticalScale(95),
          marginTop: verticalScale(10),
        }}
      />
      {percentage != null && (
        <View
          style={{
            flex: 1,
            marginHorizontal: 20,
            paddingTop: verticalScale(15),
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingLeft: horizontalScale(10),
              gap: horizontalScale(3),
              // backgroundColor: 'lightblue',
            }}>
            <Text
              style={[
                STYLES.dev1__text18,
                {
                  fontWeight: '700',
                  fontFamily: 'GeneralSans-Bold',
                  color: '#FFFFFF',
                },
              ]}>
              {percentage}
            </Text>
            <Text
              style={[
                STYLES.dev1__text13,
                {
                  fontWeight: '400',
                  fontFamily: 'GeneralSans-Regular',
                  color: '#FFFFFF',
                  width: '100%',
                },
              ]}>
              %
            </Text>
          </View>

          <View
            style={{
              paddingLeft: horizontalScale(10),
              flexDirection: 'row',
              // backgroundColor: 'red',
              marginTop: 5,
            }}>
            <Text
              style={[
                STYLES.dev1__text13,
                {
                  opacity: 7,
                  color: '#ffffff',
                  fontFamily: 'GeneralSans-Regular',
                  lineHeight: moderateScale(12),
                  paddingTop: 1,
                },
              ]}>
              last update {lastUpdateTime}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default StateCard;
const styles = StyleSheet.create({
  stateCardContainer: {
    width: horizontalScale(166),
    // minHeight: verticalScale(230),
    borderRadius: moderateScale(16),
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(15),
  },
  pressed: {
    opacity: 0.75,
  },
});
