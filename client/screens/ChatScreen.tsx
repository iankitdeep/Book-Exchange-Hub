import React, { useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, RouteProp } from "@react-navigation/native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { BorderRadius, Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/query-client";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: number;
}

interface ConversationDetail {
  id: string;
  bookId?: string;
  bookTitle?: string;
  bookCoverUrl?: string;
  messages: Message[];
}

type RouteType = RouteProp<RootStackParamList, "Chat">;

function MessageBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.messageBubble,
        isOwn ? styles.ownMessage : styles.otherMessage,
        {
          backgroundColor: isOwn ? theme.primary : theme.backgroundDefault,
        },
      ]}
    >
      <ThemedText
        style={[
          styles.messageText,
          { color: isOwn ? "#FFFFFF" : theme.text },
        ]}
      >
        {message.content}
      </ThemedText>
      <ThemedText
        style={[
          styles.messageTime,
          { color: isOwn ? "rgba(255,255,255,0.7)" : theme.textSecondary },
        ]}
      >
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </ThemedText>
    </View>
  );
}

function EmptyChat() {
  const { theme } = useTheme();

  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.primary + "15" }]}>
        <Feather name="message-circle" size={48} color={theme.primary} />
      </View>
      <ThemedText type="h3" style={styles.emptyTitle}>
        Start the Conversation
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyDescription, { color: theme.textSecondary }]}>
        Send a message to the admin about this book
      </ThemedText>
    </View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user } = useAuth();
  const route = useRoute<RouteType>();
  const { conversationId } = route.params;
  const flatListRef = useRef<FlatList>(null);

  const [inputText, setInputText] = useState("");

  const { data: conversation, refetch } = useQuery<ConversationDetail>({
    queryKey: ["/api/conversations", conversationId],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, {
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setInputText("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    sendMessageMutation.mutate(inputText.trim());
  }, [inputText, sendMessageMutation]);

  const messages = conversation?.messages || [];

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble message={item} isOwn={item.senderId === user?.id} />
    ),
    [user?.id]
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <FlatList
        ref={flatListRef}
        data={[...messages].reverse()}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted={messages.length > 0}
        contentContainerStyle={[
          styles.messagesList,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: Spacing.lg,
          },
          messages.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={EmptyChat}
        showsVerticalScrollIndicator={false}
      />

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.backgroundRoot,
            borderTopColor: theme.border,
            paddingBottom: insets.bottom + Spacing.sm,
          },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text }]}
            multiline
            maxLength={500}
            testID="message-input"
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || sendMessageMutation.isPending}
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  inputText.trim() && !sendMessageMutation.isPending
                    ? theme.accent
                    : theme.backgroundSecondary,
              },
            ]}
            testID="send-button"
          >
            <Feather
              name="send"
              size={18}
              color={inputText.trim() ? "#FFFFFF" : theme.textSecondary}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: Spacing.lg,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    textAlign: "center",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  ownMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: Spacing.xs,
  },
  otherMessage: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: Spacing.xs,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    marginTop: Spacing.xs,
    alignSelf: "flex-end",
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: Spacing.xs,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
});
