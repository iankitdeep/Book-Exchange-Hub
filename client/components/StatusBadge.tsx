import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

type BookStatus = "active" | "pending" | "sold";

interface StatusBadgeProps {
  status: BookStatus;
}

const statusLabels: Record<BookStatus, string> = {
  active: "Active",
  pending: "Pending",
  sold: "Sold",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { theme } = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case "active":
        return theme.success;
      case "pending":
        return theme.accent;
      case "sold":
        return theme.textSecondary;
      default:
        return theme.textSecondary;
    }
  };

  const color = getStatusColor();

  return (
    <View style={[styles.badge, { backgroundColor: color + "20" }]}>
      <ThemedText style={[styles.text, { color }]}>
        {statusLabels[status]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
