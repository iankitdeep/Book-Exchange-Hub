import React from "react";
import { View, StyleSheet, Pressable, Image, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ConditionBadge } from "@/components/ConditionBadge";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

type BookCondition = "like_new" | "good" | "fair" | "poor";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  price: string;
  condition: BookCondition;
  coverImageUrl?: string;
  onPress: () => void;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BookCard({
  title,
  author,
  price,
  condition,
  coverImageUrl,
  onPress,
}: BookCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        animatedStyle,
      ]}
      testID={`book-card-${title}`}
    >
      <View style={[styles.imageContainer, { backgroundColor: theme.backgroundSecondary }]}>
        {coverImageUrl ? (
          <Image source={{ uri: coverImageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <ThemedText style={[styles.placeholderText, { color: theme.textSecondary }]}>
              No Cover
            </ThemedText>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <ThemedText type="h4" numberOfLines={2} style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText type="small" style={[styles.author, { color: theme.textSecondary }]} numberOfLines={1}>
          {author}
        </ThemedText>
        <View style={styles.footer}>
          <ThemedText type="h3" style={[styles.price, { color: theme.primary }]}>
            ₹{price}
          </ThemedText>
          <ConditionBadge condition={condition} />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  imageContainer: {
    width: "100%",
    height: CARD_WIDTH * 1.2,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 12,
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  author: {
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  price: {
    fontWeight: "700",
  },
});
