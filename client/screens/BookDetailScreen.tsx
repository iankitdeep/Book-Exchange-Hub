import React from "react";
import { View, StyleSheet, Image, ScrollView, Pressable, Alert, Linking, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ConditionBadge } from "@/components/ConditionBadge";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/query-client";
import { mockDb } from "@/lib/mock-db";

type BookCondition = "like_new" | "good" | "fair" | "poor";

interface BookDetail {
  id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  condition: BookCondition;
  price: string;
  coverImageUrl?: string;
  sellerId: string;
  sellerName: string;
  sellerPhoneNumber?: string;
  createdAt: string;
}

const { width } = Dimensions.get("window");

type RouteType = RouteProp<RootStackParamList, "BookDetail">;

export default function BookDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user } = useAuth();
  const route = useRoute<RouteType>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { bookId } = route.params;

  const { data: book, isLoading } = useQuery({
    queryKey: ["/api/books", bookId],
    queryFn: () => mockDb.getBookById(bookId),
  });

  const contactMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/conversations", {
        bookId,
        message: `I'm interested in buying "${book?.title}"`,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      navigation.navigate("Chat", { conversationId: data.id });
    },
  });

  const handleBuyNow = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Contact Seller",
      `How would you like to contact ${book.sellerName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Message (In-App)",
          onPress: () => contactMutation.mutate(),
        },
        {
          text: "Call",
          onPress: () => {
            if (book.sellerPhoneNumber) {
              Linking.openURL(`tel:${book.sellerPhoneNumber}`);
            } else {
              Alert.alert("Error", "No phone number available for this seller.");
            }
          },
        },
      ]
    );
  };

  const isDesktop = width > 768;

  if (isLoading || !book) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.loadingImage, { backgroundColor: theme.backgroundSecondary }]} />
      </View>
    );
  }

  const isOwnBook = user?.id === book?.sellerId;

  if (isDesktop) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot, flexDirection: "row" }]}>
        {/* Left Panel: Image */}
        <View style={{ flex: 1, padding: Spacing.xl, maxWidth: 500, justifyContent: "center" }}>
          <View style={[styles.imageContainer, { height: 600, backgroundColor: theme.backgroundSecondary }]}>
            {book.coverImageUrl ? (
              <Image source={{ uri: book.coverImageUrl }} style={[styles.image, { height: "100%" }]} resizeMode="contain" />
            ) : (
              <View style={styles.placeholderImage}>
                <Feather name="book" size={64} color={theme.textSecondary} />
              </View>
            )}
          </View>
        </View>

        {/* Right Panel: Details */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <ThemedText type="h1" style={[styles.title, { fontSize: 32 }]}>
                {book.title}
              </ThemedText>
              <ThemedText type="h3" style={{ color: theme.textSecondary }}>
                by {book.author}
              </ThemedText>
            </View>
            <ThemedText type="h1" style={[styles.price, { color: theme.primary, fontSize: 32 }]}>
              ₹{book.price}
            </ThemedText>
          </View>

          <View style={styles.badges}>
            <ConditionBadge condition={book.condition} />
            <View style={[styles.genreBadge, { backgroundColor: theme.backgroundSecondary }]}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {book.genre}
              </ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Description
            </ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary, lineHeight: 28 }}>
              {book.description || "No description provided."}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Seller Information
            </ThemedText>
            <View style={[styles.sellerCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <View style={[styles.sellerAvatar, { backgroundColor: theme.primary + "20" }]}>
                <Feather name="user" size={24} color={theme.primary} />
              </View>
              <View style={styles.sellerInfo}>
                <ThemedText type="h4">{book.sellerName}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Listed on {new Date(book.createdAt).toLocaleDateString()}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Desktop Buttons inline - Showing for everyone for testing */}
          {user?.role !== "admin" ? (
            <View style={{ flexDirection: "row", gap: Spacing.md, marginTop: Spacing.xl }}>
              <Button
                variant="outline"
                style={{ flex: 1 }}
                onPress={() => {
                  Alert.alert("Message", "Open chat with seller?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Open Chat", onPress: () => contactMutation.mutate() }
                  ]);
                }}
              >
                <Feather name="message-square" size={20} color={theme.text} style={{ marginRight: 8 }} />
                Message
              </Button>
              <Button
                variant="primary"
                style={{ flex: 1 }}
                onPress={() => {
                  if (book.sellerPhoneNumber) {
                    Linking.openURL(`tel:${book.sellerPhoneNumber}`);
                  } else {
                    Alert.alert("Error", "No phone number available.");
                  }
                }}
              >
                <Feather name="phone" size={20} color={theme.buttonText} style={{ marginRight: 8 }} />
                Call
              </Button>
            </View>
          ) : null}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.xl, paddingBottom: 120 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.imageContainer, { backgroundColor: theme.backgroundSecondary }]}>
          {book.coverImageUrl ? (
            <Image source={{ uri: book.coverImageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderImage}>
              <Feather name="book" size={64} color={theme.textSecondary} />
            </View>
          )}
        </View>

        <View style={styles.details}>
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <ThemedText type="h1" style={styles.title}>
                {book.title}
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                by {book.author}
              </ThemedText>
            </View>
            <ThemedText type="h1" style={[styles.price, { color: theme.primary }]}>
              ₹{book.price}
            </ThemedText>
          </View>

          <View style={styles.badges}>
            <ConditionBadge condition={book.condition} />
            <View style={[styles.genreBadge, { backgroundColor: theme.backgroundSecondary }]}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {book.genre}
              </ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Description
            </ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {book.description || "No description provided."}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Seller Information
            </ThemedText>
            <View style={[styles.sellerCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <View style={[styles.sellerAvatar, { backgroundColor: theme.primary + "20" }]}>
                <Feather name="user" size={20} color={theme.primary} />
              </View>
              <View style={styles.sellerInfo}>
                <ThemedText type="h4">{book.sellerName}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Listed on {new Date(book.createdAt).toLocaleDateString()}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Persistent Bottom Bar - Showing for everyone for testing */}
      {user?.role !== "admin" ? (
        <View style={[styles.bottomBar, { backgroundColor: theme.backgroundRoot, borderTopColor: theme.border, paddingBottom: insets.bottom + Spacing.lg }]}>
          <Button
            variant="outline"
            style={styles.actionButton}
            onPress={() => {
              Alert.alert("Message", "Open chat with seller?", [
                { text: "Cancel", style: "cancel" },
                { text: "Open Chat", onPress: () => contactMutation.mutate() }
              ]);
            }}
          >
            <Feather name="message-square" size={20} color={theme.text} style={{ marginRight: 8 }} />
            Message
          </Button>
          <Button
            variant="primary"
            style={styles.actionButton}
            onPress={() => {
              if (book.sellerPhoneNumber) {
                Linking.openURL(`tel:${book.sellerPhoneNumber}`);
              } else {
                Alert.alert("Error", "No phone number available.");
              }
            }}
          >
            <Feather name="phone" size={20} color={theme.buttonText} style={{ marginRight: 8 }} />
            Call
          </Button>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120, // Add padding for bottom bar
  },
  loadingImage: {
    width: "100%",
    height: 300,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing["5xl"],
  },
  imageContainer: {
    width: "100%",
    height: 300,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  image: {
    width: "100%",
    height: width * 1.2, // Clean aspect ratio
    maxHeight: 500,
  },
  placeholderImage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  titleSection: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  price: {
    fontWeight: "700",
  },
  badges: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  genreBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  sellerInfo: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    ...Shadows.card,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: Spacing.lg,
    borderTopWidth: 1,
    ...Shadows.card,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  contactButton: {
    width: "100%",
  },
});
