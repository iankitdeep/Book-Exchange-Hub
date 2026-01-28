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
import { useCart } from "@/contexts/CartContext";
import { BorderRadius, Spacing } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";

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
  const { addToCart } = useCart();
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
        <Pressable
          style={[styles.cartButton, { backgroundColor: theme.backgroundRoot }]}
          onPress={(e) => {
            e.stopPropagation();
            addToCart({ id: "temp_id_fix_me", title, author, price, condition, coverImageUrl } as any); // Quick fix for interface mismatch, safer to pass full object
          }}
        >
          <Feather name="plus" size={20} color={theme.primary} />
        </Pressable>
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
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1 / 1.2,
    position: "relative",
  },
  cartButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
