import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import WelcomeScreen from "@/screens/WelcomeScreen";
import RoleSelectionScreen from "@/screens/RoleSelectionScreen";
import BookDetailScreen from "@/screens/BookDetailScreen";
import ListBookScreen from "@/screens/ListBookScreen";
import EditProfileScreen from "@/screens/EditProfileScreen";
import ChatScreen from "@/screens/ChatScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export type RootStackParamList = {
  Welcome: undefined;
  RoleSelection: undefined;
  Main: undefined;
  BookDetail: { bookId: string };
  ListBook: undefined;
  EditProfile: undefined;
  Chat: { conversationId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.backgroundRoot }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const needsRoleSelection = isAuthenticated && user && !user.role;

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!isAuthenticated ? (
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
      ) : needsRoleSelection ? (
        <Stack.Screen
          name="RoleSelection"
          component={RoleSelectionScreen}
          options={{
            headerTitle: "Choose Your Role",
            headerBackVisible: false,
          }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BookDetail"
            component={BookDetailScreen}
            options={{
              headerTitle: "Book Details",
              presentation: "card",
            }}
          />
          <Stack.Screen
            name="ListBook"
            component={ListBookScreen}
            options={{
              headerTitle: "List a Book",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{
              headerTitle: "Edit Profile",
              presentation: "card",
            }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{
              headerTitle: "Chat with Admin",
              presentation: "card",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
