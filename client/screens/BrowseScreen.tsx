import React, { useState, useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInLeft, FadeInDown } from "react-native-reanimated";

import { BookCard } from "@/components/BookCard";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips } from "@/components/FilterChips";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useQuery } from "@tanstack/react-query";
import { mockDb, Book } from "@/lib/mock-db";

type BookCondition = "like_new" | "good" | "fair" | "poor";

const genres = [
  { id: "fiction", label: "Fiction" },
  { id: "non-fiction", label: "Non-Fiction" },
  { id: "mystery", label: "Mystery" },
  { id: "romance", label: "Romance" },
  { id: "sci-fi", label: "Sci-Fi" },
  { id: "biography", label: "Biography" },
];

export default function BrowseScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();

  // Responsive columns
  const numColumns = width > 1024 ? 4 : width > 768 ? 3 : 2;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: books = [], isLoading, refetch } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    queryFn: mockDb.getBooks,
  });

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = !selectedGenre || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleBookPress = (bookId: string) => {
    navigation.navigate("BookDetail", { bookId });
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Book; index: number }) => (
      <Animated.View
        style={styles.gridItem}
        entering={FadeInDown.delay(index * 50).springify()}
      >
        <BookCard
          id={item.id}
          title={item.title}
          author={item.author}
          price={item.price}
          condition={item.condition}
          coverImageUrl={item.coverImageUrl}
          onPress={() => handleBookPress(item.id)}
        />
      </Animated.View>
    ),
    []
  );

  const ListHeaderComponent = useCallback(
    () => (
      <View style={styles.header}>
        <Animated.View entering={FadeInLeft.duration(600)}>
          <ThemedText type="h1" style={[styles.appTitle, { marginBottom: Spacing.md }]}>
            Swaply
          </ThemedText>
        </Animated.View>
        <Animated.View entering={FadeInLeft.delay(100).duration(600)}>
          <ThemedText type="h2" style={styles.sectionTitle}>
            A Library That's Always Open.
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
            You may access the best collection with over +30 genres
          </ThemedText>
        </Animated.View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search Books, Authors Or Topics"
        />
        <View style={styles.filtersContainer}>
          <FilterChips
            chips={genres}
            selectedId={selectedGenre}
            onSelect={setSelectedGenre}
          />
        </View>

        <Animated.View entering={FadeInLeft.delay(200).duration(600)} style={{ marginTop: Spacing.xl }}>
          <ThemedText type="h2" style={styles.sectionTitle}>
            Nouveautés
          </ThemedText>
        </Animated.View>
      </View>
    ),
    [searchQuery, selectedGenre, theme]
  );

  const ListEmptyComponent = useCallback(
    () =>
      isLoading ? (
        <LoadingState />
      ) : (
        <EmptyState
          image={require("../../assets/images/empty-browse.png")}
          title="No Books Found"
          description={
            searchQuery
              ? "Try adjusting your search or filters"
              : "Be the first to list a book!"
          }
        />
      ),
    [isLoading, searchQuery]
  );

  return (
    <FlatList
      data={filteredBooks}
      renderItem={renderItem}
      key={numColumns} // Force re-render on column change
      numColumns={numColumns}
      columnWrapperStyle={styles.columnWrapper}
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Spacing.xl, // Removed headerHeight to manually handle "Swaply"
          paddingBottom: tabBarHeight + Spacing.xl,
        },
        filteredBooks.length === 0 && !isLoading && styles.emptyContent,
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
      }
      showsVerticalScrollIndicator={false}
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
  header: {
    marginBottom: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  appTitle: {
    fontWeight: "900", // Extra bold
    fontSize: 32,
    marginLeft: Spacing.xs, // Slight margin
  },
  sectionTitle: {
    fontWeight: "800",
    fontSize: 24,
    marginBottom: Spacing.sm,
  },
  filtersContainer: {
    marginTop: Spacing.md,
    marginHorizontal: -Spacing.lg,
  },
  columnWrapper: {
    gap: Spacing.lg,
  },
  gridItem: {
    flex: 1,
    maxWidth: "100%", // Prevent item overflow
  },
});



type BookCondition = "like_new" | "good" | "fair" | "poor";



const genres = [
  { id: "fiction", label: "Fiction" },
  { id: "non-fiction", label: "Non-Fiction" },
  { id: "mystery", label: "Mystery" },
  { id: "romance", label: "Romance" },
  { id: "sci-fi", label: "Sci-Fi" },
  { id: "biography", label: "Biography" },
];

export default function BrowseScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();

  // Responsive columns
  const numColumns = width > 1024 ? 4 : width > 768 ? 3 : 2;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: books = [], isLoading, refetch } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    queryFn: mockDb.getBooks,
  });

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = !selectedGenre || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleBookPress = (bookId: string) => {
    navigation.navigate("BookDetail", { bookId });
  };

  const renderItem = useCallback(
    ({ item }: { item: Book }) => (
      <View style={styles.gridItem}>
        <BookCard
          id={item.id}
          title={item.title}
          author={item.author}
          price={item.price}
          condition={item.condition}
          coverImageUrl={item.coverImageUrl}
          onPress={() => handleBookPress(item.id)}
        />
      </View>
    ),
    []
  );

  const ListHeaderComponent = useCallback(
    () => (
      <View style={styles.header}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search books..."
        />
        <View style={styles.filtersContainer}>
          <FilterChips
            chips={genres}
            selectedId={selectedGenre}
            onSelect={setSelectedGenre}
          />
        </View>
      </View>
    ),
    [searchQuery, selectedGenre]
  );

  const ListEmptyComponent = useCallback(
    () =>
      isLoading ? (
        <LoadingState />
      ) : (
        <EmptyState
          image={require("../../assets/images/empty-browse.png")}
          title="No Books Found"
          description={
            searchQuery
              ? "Try adjusting your search or filters"
              : "Be the first to list a book!"
          }
        />
      ),
    [isLoading, searchQuery]
  );

  return (
    <FlatList
      data={filteredBooks}
      renderItem={renderItem}
      key={numColumns} // Force re-render on column change
      numColumns={numColumns}
      columnWrapperStyle={styles.columnWrapper}
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
        filteredBooks.length === 0 && !isLoading && styles.emptyContent,
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
      }
      showsVerticalScrollIndicator={false}
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
  header: {
    marginBottom: Spacing.lg,
  },
  filtersContainer: {
    marginTop: Spacing.md,
    marginHorizontal: -Spacing.lg,
  },
  columnWrapper: {
    gap: Spacing.lg,
  },
  gridItem: {
    flex: 1,
    maxWidth: "100%", // Prevent item overflow
  },
});
