import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

type BookCondition = "like_new" | "good" | "fair" | "poor";

interface ConditionBadgeProps {
  condition: BookCondition;
}

const conditionLabels: Record<BookCondition, string> = {
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

export function ConditionBadge({ condition }: ConditionBadgeProps) {
  const { theme } = useTheme();

  const getConditionColor = () => {
    switch (condition) {
      case "like_new":
        return theme.success;
      case "good":
        return theme.link;
      case "fair":
        return theme.accent;
      case "poor":
        return theme.textSecondary;
      default:
        return theme.textSecondary;
    }
  };

  const color = getConditionColor();

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <ThemedText style={[styles.text, { color }]}>
        {conditionLabels[condition]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
