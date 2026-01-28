import React from "react";
import { View, StyleSheet, Pressable, Image as RNImage } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, useNavigationState } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

export function WebSidebar() {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const navigation = useNavigation<any>();
    const { user } = useAuth();

    // Get the current route name from the navigation state to highlight active tab
    const currentRouteName = useNavigationState(state => {
        if (!state) return undefined;
        // We need to find the "Main" route in the root stack
        const mainRoute = state.routes.find(r => r.name === "Main");

        if (mainRoute?.state) {
            // If Main has state (it's a navigator that has been initialized)
            const activeIndex = mainRoute.state.index;
            return mainRoute.state.routes[activeIndex || 0].name;
        }

        // If we really are just on Main but state isn't populated yet, 
        // it means we are at the initial screen of Main, which is BrowseTab.
        if (mainRoute) return "BrowseTab";

        return undefined;
    });

    const isAdmin = user?.role === "admin";
    const isSeller = user?.role === "seller";

    const MenuItem = ({ label, icon, route }: { label: string; icon: any; route: string }) => {
        const isActive = currentRouteName === route;

        return (
            <Pressable
                onPress={() => {
                    // Navigate to the tab using nested navigation pattern
                    navigation.navigate("Main", { screen: route });
                }}
                style={({ pressed }) => [
                    styles.menuItem,
                    (isActive || pressed) && { backgroundColor: theme.primary + "20" }
                ]}
            >
                <Feather name={icon} size={24} color={isActive ? theme.primary : theme.textSecondary} />
                <ThemedText
                    style={[
                        styles.menuLabel,
                        {
                            color: isActive ? theme.primary : theme.textSecondary,
                            fontWeight: isActive ? "bold" : "600"
                        }
                    ]}
                >
                    {label}
                </ThemedText>
            </Pressable>
        );
    };

    return (
        <View style={[styles.sidebar, { backgroundColor: theme.backgroundRoot, borderRightColor: theme.border, paddingTop: insets.top + Spacing.xl }]}>
            <View style={styles.logoContainer}>
                <RNImage
                    source={require("../assets/images/app-logo.jpg")}
                    style={{ width: 40, height: 40, borderRadius: 8 }}
                    resizeMode="contain"
                />
                <ThemedText type="h1" style={{ color: theme.primary, fontWeight: "900", fontSize: 28, fontFamily: "System" }}>
                    Swaply
                </ThemedText>
            </View>

            <View style={styles.menu}>
                <MenuItem label="Browse" icon="search" route="BrowseTab" />
                <MenuItem label={isSeller || isAdmin ? "My Listings" : "My Purchases"} icon="book" route="MyBooksTab" />
                <MenuItem label="Cart" icon="shopping-cart" route="CartTab" />
                {!isAdmin && <MenuItem label="Messages" icon="message-square" route="MessagesTab" />}
                {isAdmin && <MenuItem label="Dashboard" icon="grid" route="AdminTab" />}
                <MenuItem label="Profile" icon="user" route="ProfileTab" />
            </View>

            <View style={styles.footer}>
                {/* Settings or Logout could go here */}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sidebar: {
        width: 250,
        height: "100%",
        borderRightWidth: 1,
        paddingHorizontal: Spacing.lg,
    },
    logoContainer: {
        marginBottom: Spacing["4xl"],
        paddingLeft: Spacing.sm,
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
    },
    menu: {
        gap: Spacing.xl,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    menuLabel: {
        marginLeft: Spacing.md,
        fontSize: 16,
        fontWeight: "600",
    },
    footer: {
        marginTop: "auto",
        paddingBottom: Spacing.xl,
    }
});
