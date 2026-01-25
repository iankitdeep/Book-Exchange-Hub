import React from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search books...",
  onFilterPress,
}: SearchBarProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
        <Feather name="search" size={20} color={theme.textSecondary} style={styles.icon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }]}
          testID="search-input"
        />
        {value.length > 0 ? (
          <Pressable onPress={() => onChangeText("")} hitSlop={8}>
            <Feather name="x" size={18} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      {onFilterPress ? (
        <Pressable
          onPress={onFilterPress}
          style={[styles.filterButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          testID="filter-button"
        >
          <Feather name="sliders" size={20} color={theme.text} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  filterButton: {
    width: Spacing.inputHeight,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
