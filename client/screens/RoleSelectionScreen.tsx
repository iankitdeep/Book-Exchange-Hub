import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { InputField } from "@/components/InputField";
import { useTheme } from "@/hooks/useTheme";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { BorderRadius, Spacing } from "@/constants/theme";

interface RoleOption {
  id: UserRole;
  label: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
}

const roleOptions: RoleOption[] = [
  {
    id: "buyer",
    label: "Buyer",
    description: "Browse and purchase pre-loved books",
    icon: "shopping-bag",
  },
  {
    id: "seller",
    label: "Seller",
    description: "List your books for sale to others",
    icon: "tag",
  },
  {
    id: "admin",
    label: "Admin",
    description: "Manage the marketplace (requires code)",
    icon: "shield",
  },
];

export default function RoleSelectionScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { updateRole } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [adminCode, setAdminCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleContinue() {
    if (!selectedRole) return;

    if (selectedRole === "admin" && adminCode !== "BOOKADMIN2024") {
      setError("Invalid admin code");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    try {
      await updateRole(selectedRole);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setError("Failed to update role. Please try again.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectRole(role: UserRole) {
    setSelectedRole(role);
    setError("");
    Haptics.selectionAsync();
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.header}>
        <ThemedText type="h1" style={styles.title}>
          Choose Your Role
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Select how you want to use Swaply
        </ThemedText>
      </View>

      <View style={styles.options}>
        {roleOptions.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => handleSelectRole(option.id)}
            style={[
              styles.option,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: selectedRole === option.id ? theme.primary : theme.border,
                borderWidth: selectedRole === option.id ? 2 : 1,
              },
            ]}
            testID={`role-option-${option.id}`}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.primary + "15" },
              ]}
            >
              <Feather name={option.icon} size={24} color={theme.primary} />
            </View>
            <View style={styles.optionContent}>
              <ThemedText type="h3">{option.label}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {option.description}
              </ThemedText>
            </View>
            <View
              style={[
                styles.radio,
                {
                  borderColor: selectedRole === option.id ? theme.primary : theme.border,
                  backgroundColor: selectedRole === option.id ? theme.primary : "transparent",
                },
              ]}
            >
              {selectedRole === option.id ? (
                <Feather name="check" size={14} color="#FFFFFF" />
              ) : null}
            </View>
          </Pressable>
        ))}
      </View>

      {selectedRole === "admin" ? (
        <View style={styles.adminSection}>
          <InputField
            label="Admin Code"
            placeholder="Enter admin code"
            value={adminCode}
            onChangeText={(text) => {
              setAdminCode(text);
              setError("");
            }}
            secureTextEntry
            error={error}
          />
        </View>
      ) : null}

      <View style={styles.footer}>
        <Button
          onPress={handleContinue}
          disabled={!selectedRole || isLoading}
          style={styles.button}
        >
          {isLoading ? "Setting up..." : "Continue"}
        </Button>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  header: {
    marginBottom: Spacing["3xl"],
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {},
  options: {
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  adminSection: {
    marginBottom: Spacing.lg,
  },
  footer: {
    marginTop: "auto",
    paddingTop: Spacing.lg,
  },
  button: {
    width: "100%",
  },
});
