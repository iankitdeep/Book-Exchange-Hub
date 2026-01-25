import React from "react";
import { ScrollView, StyleSheet, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface FilterChip {
  id: string;
  label: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Chip({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? theme.primary : theme.backgroundDefault,
          borderColor: isSelected ? theme.primary : theme.border,
        },
        animatedStyle,
      ]}
    >
      <ThemedText
        type="small"
        style={[
          styles.chipText,
          { color: isSelected ? "#FFFFFF" : theme.text },
        ]}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

export function FilterChips({ chips, selectedId, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Chip
        label="All"
        isSelected={selectedId === null}
        onPress={() => onSelect(null)}
      />
      {chips.map((chip) => (
        <Chip
          key={chip.id}
          label={chip.label}
          isSelected={selectedId === chip.id}
          onPress={() => onSelect(chip.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontWeight: "500",
  },
});
