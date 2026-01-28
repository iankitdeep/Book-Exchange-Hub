import React, { useState } from "react";
import { View, StyleSheet, Pressable, Image, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { InputField } from "@/components/InputField";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { BorderRadius, Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { mockDb } from "@/lib/mock-db";

export type BookCondition = "like_new" | "good" | "fair" | "poor";

const conditions: { id: BookCondition; label: string }[] = [
  { id: "like_new", label: "Like New" },
  { id: "good", label: "Good" },
  { id: "fair", label: "Fair" },
  { id: "poor", label: "Poor" },
];

const genres = [
  "Fiction",
  "Non-Fiction",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Biography",
  "Self-Help",
  "History",
  "Other",
];

interface SelectOptionProps {
  options: { id: string; label: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  label: string;
}

function SelectOption({ options, selectedId, onSelect, label }: SelectOptionProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.selectContainer}>
      <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </ThemedText>
      <View style={styles.optionsRow}>
        {options.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => {
              onSelect(option.id);
              Haptics.selectionAsync();
            }}
            style={[
              styles.option,
              {
                backgroundColor:
                  selectedId === option.id ? theme.primary : theme.backgroundDefault,
                borderColor: selectedId === option.id ? theme.primary : theme.border,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{
                color: selectedId === option.id ? "#FFFFFF" : theme.text,
                fontWeight: "500",
              }}
            >
              {option.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function ListBookScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [condition, setCondition] = useState<BookCondition | null>(null);
  const [price, setPrice] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [imageConfirmed, setImageConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createBookMutation = useMutation({
    mutationFn: async (bookData: {
      title: string;
      author: string;
      description: string;
      genre: string;
      condition: string;
      price: string;
      coverImageUrl?: string;
      sellerId: string;
      sellerPhoneNumber: string;
    }) => {
      return await mockDb.addBook({
        ...bookData,
        condition: bookData.condition as BookCondition, // Explicit cast
        sellerName: user?.displayName || "User",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books/my-listings"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Book Posted Successfully!");
      navigation.goBack();
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to list book. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  async function handlePickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCoverImage(result.assets[0].uri);
      setImageConfirmed(false);
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!author.trim()) newErrors.author = "Author is required";
    if (!genre) newErrors.genre = "Please select a genre";
    if (!condition) newErrors.condition = "Please select condition";
    if (!price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      newErrors.price = "Please enter a valid price";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required (private)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    createBookMutation.mutate({
      title: title.trim(),
      author: author.trim(),
      description: description.trim(),
      genre: genre!,
      condition: condition!,
      price: parseFloat(price).toFixed(2),
      coverImageUrl: coverImage || undefined,
      sellerId: user!.id,
      sellerPhoneNumber: phoneNumber,
    });
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
      <Pressable
        onPress={handlePickImage}
        style={[
          styles.imageUpload,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
        {coverImage ? (
          <Image source={{ uri: coverImage }} style={styles.coverImage} resizeMode="cover" />
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Feather name="camera" size={32} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
              Add Cover Photo
            </ThemedText>
          </View>
        )}
      </Pressable>

      {coverImage && !imageConfirmed && (
        <Button
          onPress={() => {
            setImageConfirmed(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
          style={styles.confirmButton}
        >
          OK
        </Button>
      )}

      <InputField
        label="Book Title"
        placeholder="Enter book title"
        value={title}
        onChangeText={setTitle}
        error={errors.title}
      />

      <InputField
        label="Author"
        placeholder="Enter author name"
        value={author}
        onChangeText={setAuthor}
        error={errors.author}
      />

      <View style={styles.selectContainer}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          Genre
        </ThemedText>
        <View style={styles.genreGrid}>
          {genres.map((g) => (
            <Pressable
              key={g}
              onPress={() => {
                setGenre(g.toLowerCase().replace(" ", "-"));
                Haptics.selectionAsync();
              }}
              style={[
                styles.genreOption,
                {
                  backgroundColor:
                    genre === g.toLowerCase().replace(" ", "-")
                      ? theme.primary
                      : theme.backgroundDefault,
                  borderColor:
                    genre === g.toLowerCase().replace(" ", "-")
                      ? theme.primary
                      : theme.border,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color:
                    genre === g.toLowerCase().replace(" ", "-")
                      ? "#FFFFFF"
                      : theme.text,
                }}
              >
                {g}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        {errors.genre ? (
          <ThemedText type="small" style={[styles.error, { color: theme.error }]}>
            {errors.genre}
          </ThemedText>
        ) : null}
      </View>

      <SelectOption
        label="Condition"
        options={conditions}
        selectedId={condition}
        onSelect={(id) => setCondition(id as BookCondition)}
      />
      {errors.condition ? (
        <ThemedText type="small" style={[styles.error, { color: theme.error, marginTop: -Spacing.md }]}>
          {errors.condition}
        </ThemedText>
      ) : null}

      <InputField
        label="Price (₹)"
        placeholder="0.00"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        error={errors.price}
      />

      <InputField
        label="Contact Phone (Private)"
        placeholder="Phone number for buyers to call/msg"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        error={errors.phoneNumber}
      />

      <InputField
        label="Description (Optional)"
        placeholder="Describe the book's condition, any highlights, etc."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={styles.textArea}
      />

      <Button
        onPress={handleSubmit}
        disabled={createBookMutation.isPending}
        style={styles.submitButton}
      >
        {createBookMutation.isPending ? "Listing..." : "List Book for Sale"}
      </Button>
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
  imageUpload: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: "dashed",
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  confirmButton: {
    marginBottom: Spacing.xl,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  uploadPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  selectContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  option: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  genreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  genreOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: Spacing.md,
  },
  error: {
    marginTop: Spacing.xs,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
});
