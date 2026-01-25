import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import BrowseStackNavigator from "@/navigation/BrowseStackNavigator";
import MyBooksStackNavigator from "@/navigation/MyBooksStackNavigator";
import MessagesStackNavigator from "@/navigation/MessagesStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import AdminStackNavigator from "@/navigation/AdminStackNavigator";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";

export type MainTabParamList = {
  BrowseTab: undefined;
  MyBooksTab: undefined;
  MessagesTab: undefined;
  ProfileTab: undefined;
  AdminTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const isSeller = user?.role === "seller";

  return (
    <Tab.Navigator
      initialRouteName="BrowseTab"
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="BrowseTab"
        component={BrowseStackNavigator}
        options={{
          title: "Browse",
          tabBarIcon: ({ color, size }) => (
            <Feather name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyBooksTab"
        component={MyBooksStackNavigator}
        options={{
          title: isSeller || isAdmin ? "My Listings" : "My Purchases",
          tabBarIcon: ({ color, size }) => (
            <Feather name="book" size={size} color={color} />
          ),
        }}
      />
      {isAdmin ? (
        <Tab.Screen
          name="AdminTab"
          component={AdminStackNavigator}
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => (
              <Feather name="grid" size={size} color={color} />
            ),
          }}
        />
      ) : (
        <Tab.Screen
          name="MessagesTab"
          component={MessagesStackNavigator}
          options={{
            title: "Messages",
            tabBarIcon: ({ color, size }) => (
              <Feather name="message-square" size={size} color={color} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
