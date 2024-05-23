import React from 'react';
import {View, TextInput, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Fontisto';

export default function SearchProfile({
  onChange,
  val,
}: {
  onChange: (e: string) => void;
  val: any;
}) {
  return (
    <View style={styles.container}>
      <Icon name="search" size={18} color="rgba(60, 60, 67, 0.6)" />
      <TextInput
        value={val}
        onChangeText={onChange}
        placeholder="Search"
        placeholderTextColor="rgba(60, 60, 67, 0.6)"
        style={styles.inp}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    borderRadius: 10,
    marginHorizontal: 16,
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  inp: {
    fontSize: 17,
    flex: 1,
    height: '100%',
    padding: 0,
    fontWeight: '400',
    color: 'black',
  },
});
