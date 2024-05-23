import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import navigation from '../../../../utils/appNavigation';
import Toast from 'react-native-toast-message';

export const chatHeaderRight = (route: any) => {
  return (
    <TouchableOpacity
      onPress={() => {
        if (route.params?.left) {
          Toast.show({
            type: 'info',
            text1: "You can't call because you are not in this group.",
          });
          return;
        }

        if (route.params?.participants?.length < 2) {
          Toast.show({
            type: 'info',
            text1: 'No group members to call.',
          });
          return;
        }

        navigation.navigate('CallingScreen', {
          isGroup: route.params?.group,
          recentparams: route.params,
          photo: route.params?.group ? null : route.params?.profilePic,
        });
      }}>
      <Icon name="video" size={21} color="#2791B5" />
    </TouchableOpacity>
  );
};
