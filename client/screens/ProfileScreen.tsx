import React from "react";
import { View, StyleSheet, Pressable, Alert, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { RoleBadge } from "@/components/RoleBadge";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { BorderRadius, Spacing } from "@/constants/theme";

interface SettingsItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
}

function SettingsItem({ icon, label, onPress, isDestructive }: SettingsItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsItem,
        { backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundDefault },
      ]}
    >
      <View style={styles.settingsItemContent}>
        <Feather
          name={icon}
          size={20}
          color={isDestructive ? theme.error : theme.text}
        />
        <ThemedText
          style={[
            styles.settingsItemLabel,
            isDestructive && { color: theme.error },
          ]}
        >
          {label}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
    >
      <View style={[styles.profileCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.avatarContainer, { backgroundColor: theme.primary + "20" }]}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <Feather name="user" size={32} color={theme.primary} />
          )}
        </View>
        <View style={styles.profileInfo}>
          <ThemedText type="h2">{user?.displayName || "User"}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {user?.email}
          </ThemedText>
          {user?.role ? (
            <View style={styles.roleContainer}>
              <RoleBadge role={user.role} />
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          ACCOUNT
        </ThemedText>
        <View style={[styles.settingsGroup, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <SettingsItem
            icon="bell"
            label="Notifications"
            onPress={() => {}}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingsItem
            icon="lock"
            label="Privacy"
            onPress={() => {}}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingsItem
            icon="help-circle"
            label="Help & Support"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          LEGAL
        </ThemedText>
        <View style={[styles.settingsGroup, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <SettingsItem
            icon="file-text"
            label="Terms of Service"
            onPress={() => {}}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingsItem
            icon="shield"
            label="Privacy Policy"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.settingsGroup, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <SettingsItem
            icon="log-out"
            label="Sign Out"
            onPress={handleSignOut}
            isDestructive
          />
        </View>
      </View>

      <ThemedText type="small" style={[styles.version, { color: theme.textSecondary }]}>
        Swaply v1.0.0
      </ThemedText>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  profileCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  profileInfo: {
    alignItems: "center",
  },
  roleContainer: {
    marginTop: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  settingsGroup: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  settingsItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingsItemLabel: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginLeft: Spacing.lg + 20 + Spacing.md,
  },
  version: {
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});
