import React, { useState, useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { BookCard } from "@/components/BookCard";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips } from "@/components/FilterChips";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useQuery } from "@tanstack/react-query";

const { width } = Dimensions.get("window");

type BookCondition = "like_new" | "good" | "fair" | "poor";

interface Book {
  id: string;
  title: string;
  author: string;
  price: string;
  condition: BookCondition;
  coverImageUrl?: string;
  genre: string;
}

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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: books = [], isLoading, refetch } = useQuery<Book[]>({
    queryKey: ["/api/books"],
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
      <View style={index % 2 === 0 ? styles.leftItem : styles.rightItem}>
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
      keyExtractor={(item) => item.id}
      numColumns={2}
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
  leftItem: {
    marginRight: Spacing.lg / 2,
  },
  rightItem: {
    marginLeft: Spacing.lg / 2,
  },
});
