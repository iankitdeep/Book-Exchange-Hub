import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Alert, Image, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { RoleBadge } from "@/components/RoleBadge";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { BorderRadius, Spacing } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface EditableFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
  optional?: boolean;
}

function EditableField({ label, value, onChangeText, placeholder, keyboardType = "default", optional }: EditableFieldProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.fieldContainer}>
      <ThemedText type="small" style={[styles.fieldLabel, { color: theme.textSecondary }]}>
        {label}{optional ? " (Optional)" : ""}
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundSecondary,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        keyboardType={keyboardType}
      />
    </View>
  );
}

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
  const { user, signOut, updateProfile } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const [name, setName] = useState(user?.displayName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setPhoneNumber(user.phoneNumber || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    const changed =
      name !== (user?.displayName || "") ||
      phoneNumber !== (user?.phoneNumber || "") ||
      email !== (user?.email || "");
    setHasChanges(changed);
  }, [name, phoneNumber, email, user]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    setIsSaving(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateProfile({
        displayName: name.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        email: email.trim() || undefined,
      });
      Alert.alert("Success", "Profile updated successfully");
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "Failed to update profile");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePostBook = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("ListBook");
  };

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
        {user?.role ? (
          <View style={styles.roleContainer}>
            <RoleBadge role={user.role} />
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          PROFILE DETAILS
        </ThemedText>
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <EditableField
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <EditableField
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <EditableField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            optional
          />
        </View>
        {hasChanges ? (
          <Button
            onPress={handleSaveProfile}
            disabled={isSaving}
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
          >
            <ThemedText style={styles.saveButtonText}>
              {isSaving ? "Saving..." : "Save Changes"}
            </ThemedText>
          </Button>
        ) : null}
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          SELL BOOKS
        </ThemedText>
        <Button
          onPress={handlePostBook}
          style={[styles.postBookButton, { backgroundColor: theme.success }]}
        >
          <View style={styles.postBookContent}>
            <Feather name="plus-circle" size={20} color="#FFFFFF" />
            <ThemedText style={styles.postBookText}>Post a Book</ThemedText>
          </View>
        </Button>
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
            icon="help-circle"
            label="Help & Support"
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
  formCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  fieldContainer: {
    padding: Spacing.md,
  },
  fieldLabel: {
    marginBottom: Spacing.xs,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  input: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    fontSize: 16,
    borderWidth: 1,
  },
  saveButton: {
    marginTop: Spacing.md,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  postBookButton: {
    width: "100%",
  },
  postBookContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  postBookText: {
    color: "#FFFFFF",
    fontSize: 16,
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
    marginLeft: Spacing.md,
  },
  version: {
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});
