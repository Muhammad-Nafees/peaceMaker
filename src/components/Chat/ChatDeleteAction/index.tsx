import React from 'react';
import {View, StyleSheet, TouchableWithoutFeedback, Text} from 'react-native';

function DeleteAction({onPress}: any) {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.container}>
        <Text style={styles.text}>Delete</Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'red',
    width: 90,
    // paddingLeft: 10,
    // justifyContent: 'center',
    alignItems: 'center',
    right: -15,
    flexDirection: 'row',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: 'white',
    // paddingLeft: 10,
    textAlign: 'center',
    flex: 1,
  },
});

export default DeleteAction;
