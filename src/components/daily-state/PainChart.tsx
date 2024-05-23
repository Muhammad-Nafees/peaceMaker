import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

const PainChart = () => {
  const [selectedAreas, setSelectedAreas] = useState({});

  const handleAreaPress = (area) => {
    setSelectedAreas((prevSelectedAreas) => ({
      ...prevSelectedAreas,
      [area]: !prevSelectedAreas[area],
    }));
  };

  return (
    <View style={styles.container}>
      <Svg width="400" height="600">
        {/* Head */}
        <Circle
          cx="200"
          cy="80"
          r="30"
          fill={selectedAreas['head'] ? 'red' : 'green'}
          onPress={() => handleAreaPress('head')}
        />

        {/* Chest */}
        <Rect
          x="160"
          y="110"
          width="80"
          height="100"
          fill={selectedAreas['chest'] ? 'red' : 'green'}
          onPress={() => handleAreaPress('chest')}
        />

        {/* Abdomen */}
        <Rect
          x="160"
          y="210"
          width="80"
          height="100"
          fill={selectedAreas['abdomen'] ? 'red' : 'green'}
          onPress={() => handleAreaPress('abdomen')}
        />

        {/* Add more body areas as needed */}
        {/* Example:
        <Rect
          x="160"
          y="310"
          width="80"
          height="80"
          fill={selectedAreas['pelvis'] ? 'red' : 'none'}
          onPress={() => handleAreaPress('pelvis')}
        />
        */}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PainChart;
