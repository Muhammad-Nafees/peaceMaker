import React, {
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';

import {Card} from './Card';

export const Tarot = ({
  tips = [],
  onLastCardSwipe,
  style,
  addShadow,
  setTip
}: {
  onLastCardSwipe: any;
  tips: string[];
  style?: React.StyleProp<React.ViewStyle>;
  addShadow?: boolean;
  setTip: (tip: string) => void;
}) => {
  const shuffleBack = useSharedValue(false);

  return (
    <TouchableWithoutFeedback onPress={onLastCardSwipe}>
      <View style={[styles.container, style]}>
        {tips.map((cardTitle, index) => (
          <Card
            setTip={setTip}
            addShadow={addShadow}
            onLastCardSwipe={onLastCardSwipe}
            title={cardTitle}
            key={index}
            index={index}
            shuffleBack={shuffleBack}
          />
        ))}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'absolute',
    top: 0,
    zIndex: 9999,
  },
});
