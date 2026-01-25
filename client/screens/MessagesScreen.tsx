import React, { useState, useCallback } from "react";
import { FlatList, StyleSheet, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { MessageCard } from "@/components/MessageCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useQuery } from "@tanstack/react-query";

interface Conversation {
  id: string;
  bookTitle?: string;
  bookCoverUrl?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);

  const { data: conversations = [], refetch } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleConversationPress = (conversationId: string) => {
    navigation.navigate("Chat", { conversationId });
  };

  return (
    <FlatList
      data={conversations}
      renderItem={({ item }) => (
        <MessageCard
          id={item.id}
          bookTitle={item.bookTitle}
          bookCoverUrl={item.bookCoverUrl}
          lastMessage={item.lastMessage}
          timestamp={item.timestamp}
          unreadCount={item.unreadCount}
          onPress={() => handleConversationPress(item.id)}
        />
      )}
      keyExtractor={(item) => item.id}
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
        conversations.length === 0 && styles.emptyContent,
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      ListEmptyComponent={
        <EmptyState
          image={require("../../assets/images/empty-messages.png")}
          title="No Messages Yet"
          description="Contact admin about a book to start a conversation"
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
});
