import { StyleSheet, Switch, View } from "react-native";
import { useState } from "react";
import Body from "react-native-body-highlighter";

export default function BodyChart() {
  const [bodyPartSelected, setBodyPartSelected] = useState({
    slug: "biceps",
    intensity: 2,
  });
  const [isBackSideEnabled, setIsBackSideEnabled] = useState(false);
  const toggleSwitch = () =>
    setIsBackSideEnabled((previousState) => !previousState);

  return (
    <View style={styles.container}>
      <Body
        data={[
          { slug: "chest", intensity: 1 },
          { slug: "abs", intensity: 2 },
          { slug: "upper-back", intensity: 1 },
          { slug: "lower-back", intensity: 2 },
          bodyPartSelected,
        ]}
        onBodyPartPress={(e) =>
          setBodyPartSelected({ slug: e.slug, intensity: 2 })
        }
        side={isBackSideEnabled ? "back" : "front"}
        scale={1.7}
      />
      <Switch onValueChange={toggleSwitch} value={isBackSideEnabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});