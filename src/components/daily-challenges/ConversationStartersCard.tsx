import React, {
  View,
  StyleSheet,
  Image,
  Text,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import CustomModal from '../shared-components/CustomModal';
import {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {AuthStackParamList} from '../../interface/types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
const imageUrl = require('../../../assets/images/daily-state-images/reception-bell.png');

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ConversationStarterTiggers'
>;

interface Props {
  text: string;
  image: ImageSourcePropType;
  backgroundColor: string;
  handlePress: () => void;
}

const ConversationStartersCard = ({
  text,
  image,
  backgroundColor,
  handlePress,
}: Props) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp>();
  // const handlePress = () => {
  //   setIsModalVisible(true);
  // };
  return (
    <>
      <TouchableOpacity
        style={[styles.container, {backgroundColor: backgroundColor}]}
        activeOpacity={0.5}
        onPress={handlePress}>
        <Image resizeMode='contain' source={image} style={{ width: 45, height: 45}} alt="img" />
        <Text
          style={{fontSize: 20, color: 'white', fontFamily: 'Satoshi-Bold'}}>
          {text}
        </Text>
      </TouchableOpacity>
      <CustomModal
        visible={isModalVisible}
        close={() => setIsModalVisible(!setIsModalVisible)}
        title="HEY!"
        description="You are now entering Olive Garden,
        do you want to initiate a Conversation Starter?"
        color="rgba(142, 178, 111, 1)"
        icon="x"
        btnBgColor="#8EB26F"
        onConfirm={() => {
          setIsModalVisible(!setIsModalVisible),
            navigation.navigate('ConversationStarterTiggers');
        }}
        rightButton="No"
        leftButton="Yes"
        imageUrl={imageUrl}
      />
    </>
  );
};

export default ConversationStartersCard;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: verticalScale(120),
    flexDirection: 'row',
    gap: 10,
    // justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingLeft: horizontalScale(30),
    paddingRight: horizontalScale(80),
  },
});
