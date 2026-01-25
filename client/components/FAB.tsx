import React from "react";
import { StyleSheet, Pressable, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Shadows } from "@/constants/theme";

interface FABProps {
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FAB({ onPress, icon = "plus", style }: FABProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.fab,
        { backgroundColor: theme.accent },
        Shadows.fab,
        animatedStyle,
        style,
      ]}
      testID="fab-button"
    >
      <Feather name={icon} size={24} color="#FFFFFF" />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
