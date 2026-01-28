import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
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

    // Safe check for current route might be complex outside of navigator, 
    // but we can just use navigation state or simple buttons.
    // For simplicity, we just navigate.

    const isAdmin = user?.role === "admin";
    const isSeller = user?.role === "seller";

    const MenuItem = ({ label, icon, route }: { label: string; icon: any; route: string }) => {
        // We would need navigation state to highlight active, but let's keep it simple for now
        const isActive = false;

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
                        { color: isActive ? theme.primary : theme.textSecondary }
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
                <ThemedText type="h1" style={{ color: theme.primary }}>Swaply</ThemedText>
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
