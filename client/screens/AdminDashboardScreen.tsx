import React, { useState, useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl, Pressable } from "react-native";
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
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useQuery } from "@tanstack/react-query";

interface AdminConversation {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  bookId?: string;
  bookTitle?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AdminMessageCard({
  conversation,
  onPress,
}: {
  conversation: AdminConversation;
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
        styles.card,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        animatedStyle,
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: theme.primary + "20" }]}>
        <Feather name="user" size={20} color={theme.primary} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <ThemedText type="h4" numberOfLines={1}>
              {conversation.userName}
            </ThemedText>
            <View style={[styles.roleBadge, { backgroundColor: theme.accent + "20" }]}>
              <ThemedText style={[styles.roleText, { color: theme.accent }]}>
                {conversation.userRole}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {conversation.timestamp}
          </ThemedText>
        </View>
        {conversation.bookTitle ? (
          <View style={styles.bookInfo}>
            <Feather name="book" size={12} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>
              {conversation.bookTitle}
            </ThemedText>
          </View>
        ) : null}
        <ThemedText type="small" numberOfLines={2} style={{ color: theme.textSecondary }}>
          {conversation.lastMessage}
        </ThemedText>
      </View>
      {conversation.unreadCount > 0 ? (
        <View style={[styles.badge, { backgroundColor: theme.accent }]}>
          <ThemedText style={styles.badgeText}>{conversation.unreadCount}</ThemedText>
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);

  const { data: conversations = [], refetch } = useQuery<AdminConversation[]>({
    queryKey: ["/api/admin/conversations"],
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
        <AdminMessageCard
          conversation={item}
          onPress={() => handleConversationPress(item.id)}
        />
      )}
      keyExtractor={(item) => item.id}
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.listContent,
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
          description="User inquiries will appear here"
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
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyContent: {
    flexGrow: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  bookInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
