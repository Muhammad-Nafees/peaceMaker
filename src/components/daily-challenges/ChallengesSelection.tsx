import {TouchableOpacity, Text} from 'react-native';
import StarIcon from '../../../assets/icons/StartIcon';
import LockIcon from '../../../assets/icons/LockIcon';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import {STYLES} from '../../styles/globalStyles';

interface Props {
  containerStyles: any;
  textStyle: any;
  iconName: string;
  text: string;
  isDisabled: boolean;
  onPress: () => void;
}

const ChallengesSelection = ({
  containerStyles,
  textStyle,
  iconName,
  text,
  isDisabled,
  onPress,
}: Props) => {
  return (
    <TouchableOpacity
      style={[{position: 'absolute'}, containerStyles]}
      disabled={isDisabled}
      onPress={onPress}>
      {iconName == 'star' ? <StarIcon /> : <LockIcon />}
      <Text
        style={[
          STYLES.dev1__text13,
          {
            fontFamily: 'GeneralSans-Medium',
            position: 'relative',
            color: isDisabled ? 'rgba(103, 203, 186, 1)' : 'white',
          },
          textStyle,
        ]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default ChallengesSelection;
