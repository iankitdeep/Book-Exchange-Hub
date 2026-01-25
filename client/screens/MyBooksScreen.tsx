import React, { useState, useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl, Pressable, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { StatusBadge } from "@/components/StatusBadge";
import { ConditionBadge } from "@/components/ConditionBadge";
import { EmptyState } from "@/components/EmptyState";
import { FAB } from "@/components/FAB";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { BorderRadius, Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useQuery } from "@tanstack/react-query";

type BookCondition = "like_new" | "good" | "fair" | "poor";
type BookStatus = "active" | "pending" | "sold";

interface Book {
  id: string;
  title: string;
  author: string;
  price: string;
  condition: BookCondition;
  status: BookStatus;
  coverImageUrl?: string;
}

interface Purchase {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  price: string;
  purchaseDate: string;
  status: "processing" | "shipped" | "delivered";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function BookListingCard({
  book,
  onPress,
}: {
  book: Book;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.listingCard,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        animatedStyle,
      ]}
    >
      <View style={[styles.thumbnail, { backgroundColor: theme.backgroundSecondary }]}>
        {book.coverImageUrl ? (
          <Animated.Image
            source={{ uri: book.coverImageUrl }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        ) : (
          <Feather name="book" size={24} color={theme.textSecondary} />
        )}
      </View>
      <View style={styles.listingContent}>
        <View style={styles.listingHeader}>
          <ThemedText type="h4" numberOfLines={1} style={styles.listingTitle}>
            {book.title}
          </ThemedText>
          <StatusBadge status={book.status} />
        </View>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {book.author}
        </ThemedText>
        <View style={styles.listingFooter}>
          <ThemedText type="h3" style={{ color: theme.primary }}>
            ${book.price}
          </ThemedText>
          <ConditionBadge condition={book.condition} />
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </AnimatedPressable>
  );
}

function PurchaseCard({
  purchase,
  onPress,
}: {
  purchase: Purchase;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const getStatusColor = () => {
    switch (purchase.status) {
      case "processing":
        return theme.accent;
      case "shipped":
        return theme.link;
      case "delivered":
        return theme.success;
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.purchaseCard,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        animatedStyle,
      ]}
    >
      <View style={styles.purchaseHeader}>
        <ThemedText type="h4" numberOfLines={1} style={styles.listingTitle}>
          {purchase.bookTitle}
        </ThemedText>
        <ThemedText type="h4" style={{ color: theme.primary }}>
          ${purchase.price}
        </ThemedText>
      </View>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        by {purchase.bookAuthor}
      </ThemedText>
      <View style={styles.purchaseFooter}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {purchase.purchaseDate}
        </ThemedText>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor() + "20" },
          ]}
        >
          <ThemedText style={[styles.statusText, { color: getStatusColor() }]}>
            {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
          </ThemedText>
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default function MyBooksScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);

  const isSeller = user?.role === "seller" || user?.role === "admin";

  const { data: listings = [], refetch: refetchListings } = useQuery<Book[]>({
    queryKey: ["/api/books/my-listings"],
    enabled: isSeller,
  });

  const { data: purchases = [], refetch: refetchPurchases } = useQuery<Purchase[]>({
    queryKey: ["/api/purchases"],
    enabled: !isSeller,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isSeller) {
      await refetchListings();
    } else {
      await refetchPurchases();
    }
    setRefreshing(false);
  }, [isSeller, refetchListings, refetchPurchases]);

  const handleAddBook = () => {
    navigation.navigate("ListBook");
  };

  const handleBookPress = (bookId: string) => {
    navigation.navigate("BookDetail", { bookId });
  };

  if (isSeller) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <FlatList
          data={listings}
          renderItem={({ item }) => (
            <BookListingCard
              book={item}
              onPress={() => handleBookPress(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: headerHeight + Spacing.xl,
              paddingBottom: tabBarHeight + Spacing.xl + 80,
            },
            listings.length === 0 && styles.emptyContent,
          ]}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          ListEmptyComponent={
            <EmptyState
              image={require("../../assets/images/empty-listings.png")}
              title="No Listings Yet"
              description="Start selling by listing your first book"
              actionLabel="List a Book"
              onAction={handleAddBook}
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
        />
        <FAB
          onPress={handleAddBook}
          style={{ bottom: tabBarHeight + Spacing.lg, right: Spacing.lg }}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={purchases}
      renderItem={({ item }) => (
        <PurchaseCard purchase={item} onPress={() => {}} />
      )}
      keyExtractor={(item) => item.id}
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
        purchases.length === 0 && styles.emptyContent,
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      ListEmptyComponent={
        <EmptyState
          image={require("../../assets/images/empty-purchases.png")}
          title="No Purchases Yet"
          description="Browse our collection and find your next read"
          actionLabel="Browse Books"
          onAction={() => navigation.navigate("Main")}
        />
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  emptyContent: {
    flexGrow: 1,
  },
  listingCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  thumbnail: {
    width: 60,
    height: 80,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  listingContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  listingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  listingTitle: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  listingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  purchaseCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  purchaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  purchaseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  statusIndicator: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
