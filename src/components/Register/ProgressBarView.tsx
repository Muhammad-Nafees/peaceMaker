import {ProgressBar, MD3Colors} from 'react-native-paper';
import {StyleSheet} from 'react-native';
import { horizontalScale } from '../../utils/metrics';

interface Props {
  progress: number;
}

const ProgressBarView = ({progress}: Props) => {
  return <ProgressBar progress={progress} color={'#2791B5'} style={styles.progressBarBack} />;
};

export default ProgressBarView;

const styles = StyleSheet.create({
  progressBarBack: {
    display:'flex',
    backgroundColor: '#D6DADB',
    width: horizontalScale(175),
  },
});