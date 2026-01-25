import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

type UserRole = "buyer" | "seller" | "admin";

interface RoleBadgeProps {
  role: UserRole;
}

const roleConfig: Record<UserRole, { label: string; icon: keyof typeof Feather.glyphMap }> = {
  buyer: { label: "Buyer", icon: "shopping-bag" },
  seller: { label: "Seller", icon: "tag" },
  admin: { label: "Admin", icon: "shield" },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const { theme } = useTheme();
  const config = roleConfig[role];

  return (
    <View style={[styles.badge, { backgroundColor: theme.primary + "20" }]}>
      <Feather name={config.icon} size={14} color={theme.primary} />
      <ThemedText style={[styles.text, { color: theme.primary }]}>
        {config.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
  },
});
