import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import BrowseStackNavigator from "@/navigation/BrowseStackNavigator";
import MyBooksStackNavigator from "@/navigation/MyBooksStackNavigator";
import MessagesStackNavigator from "@/navigation/MessagesStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import AdminStackNavigator from "@/navigation/AdminStackNavigator";
import CartScreen from "@/screens/CartScreen";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { WebSidebar } from "@/components/WebSidebar";

export type MainTabParamList = {
  BrowseTab: undefined;
  MyBooksTab: undefined;
  MessagesTab: undefined;
  ProfileTab: undefined;
  AdminTab: undefined;
  CartTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;

  const isAdmin = user?.role === "admin";
  const isSeller = user?.role === "seller";

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      {isDesktop && <WebSidebar />}
      <View style={{ flex: 1, maxWidth: isDesktop ? "100%" : undefined }}>
        {/* On Desktop, we might want to center the content or limit max width,
            but for now let it stretch with the sidebar next to it. */}
        <Tab.Navigator
          initialRouteName="BrowseTab"
          screenOptions={{
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.tabIconDefault,
            tabBarStyle: {
              position: "absolute",
              display: isDesktop ? "none" : "flex", // Hide on Desktop
              backgroundColor: Platform.select({
                ios: "transparent",
                android: theme.backgroundRoot,
              }),
              borderTopWidth: 0,
              elevation: 0,
            },
            tabBarBackground: () =>
              Platform.OS === "ios" && !isDesktop ? (
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
            name="CartTab"
            component={CartScreen}
            options={{
              title: "Cart",
              tabBarIcon: ({ color, size }) => (
                <Feather name="shopping-cart" size={size} color={color} />
              ),
            }}
          />
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
      </View>
    </View>
  );
}
