import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface MessageCardProps {
  id: string;
  bookTitle?: string;
  bookCoverUrl?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MessageCard({
  bookTitle,
  bookCoverUrl,
  lastMessage,
  timestamp,
  unreadCount,
  onPress,
}: MessageCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
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
      testID="message-card"
    >
      <View style={[styles.thumbnail, { backgroundColor: theme.backgroundSecondary }]}>
        {bookCoverUrl ? (
          <Image source={{ uri: bookCoverUrl }} style={styles.thumbnailImage} resizeMode="cover" />
        ) : (
          <Feather name="book" size={24} color={theme.textSecondary} />
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="h4" numberOfLines={1} style={styles.title}>
            {bookTitle || "Admin Support"}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {timestamp}
          </ThemedText>
        </View>
        <ThemedText type="small" numberOfLines={2} style={{ color: theme.textSecondary }}>
          {lastMessage}
        </ThemedText>
      </View>
      {unreadCount > 0 ? (
        <View style={[styles.badge, { backgroundColor: theme.accent }]}>
          <ThemedText style={styles.badgeText}>{unreadCount}</ThemedText>
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  thumbnail: {
    width: 56,
    height: 72,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  title: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
