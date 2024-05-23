import React, {useContext, useState} from 'react';
import RtcContext, {DispatchType} from '../../RtcContext';
import styles from '../../Style';
import {Pressable, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

function SwitchSpeaker() {
  const [isMainSpeaker, setIsMainSpeaker] = useState(true);
  const {dispatch} = useContext(RtcContext);

  return (
    <Pressable
      onPress={() => {
        (dispatch as DispatchType<'AudioRouteChanged'>)({
          type: 'AudioRouteChanged',
          value: [!isMainSpeaker],
        });
        setIsMainSpeaker(prevState => !prevState);
      }}
      style={styles.iconButtonB}>
      <Ionicons name="ios-volume-high" size={20} color={'white'} />
      <Text style={{fontSize: 13, fontWeight: '500', color: 'white'}}>
        {!isMainSpeaker ? 'Phone' : 'Speaker'}
      </Text>
    </Pressable>
  );
}

export default SwitchSpeaker;
