import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;

function SkeletonCard() {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
      ]}
    >
      <Animated.View
        style={[
          styles.imageSkeleton,
          { backgroundColor: theme.backgroundSecondary },
          animatedStyle,
        ]}
      />
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.titleSkeleton,
            { backgroundColor: theme.backgroundSecondary },
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.authorSkeleton,
            { backgroundColor: theme.backgroundSecondary },
            animatedStyle,
          ]}
        />
        <View style={styles.footer}>
          <Animated.View
            style={[
              styles.priceSkeleton,
              { backgroundColor: theme.backgroundSecondary },
              animatedStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.badgeSkeleton,
              { backgroundColor: theme.backgroundSecondary },
              animatedStyle,
            ]}
          />
        </View>
      </View>
    </View>
  );
}

export function LoadingState() {
  return (
    <View style={styles.container}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  imageSkeleton: {
    width: "100%",
    height: CARD_WIDTH * 1.2,
  },
  content: {
    padding: Spacing.md,
  },
  titleSkeleton: {
    height: 20,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },
  authorSkeleton: {
    height: 16,
    width: "60%",
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceSkeleton: {
    height: 24,
    width: 60,
    borderRadius: BorderRadius.xs,
  },
  badgeSkeleton: {
    height: 24,
    width: 50,
    borderRadius: BorderRadius.full,
  },
});
