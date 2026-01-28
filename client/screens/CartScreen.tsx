import React from "react";
import { View, FlatList, StyleSheet, Alert, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/useTheme";
import { useCart } from "@/contexts/CartContext";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { BookCard } from "@/components/BookCard";
import { EmptyState } from "@/components/EmptyState";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function CartScreen() {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const { cartItems, removeFromCart, clearCart, getTotalPrice } = useCart();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { width } = useWindowDimensions();

    const numColumns = width > 1024 ? 4 : width > 768 ? 3 : 2;

    const handleCheckout = () => {
        Alert.alert("Checkout", "Proceed to payment?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Pay Now",
                onPress: () => {
                    clearCart();
                    Alert.alert("Success", "Order placed successfully!");
                },
            },
        ]);
    };

    const handleBookPress = (bookId: string) => {
        navigation.navigate("BookDetail", { bookId });
    };

    if (cartItems.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: insets.top }]}>
                <EmptyState
                    image={require("../../assets/images/empty-purchases.png")}
                    title="Your Cart is Empty"
                    description="Browse books and add them to your cart!"
                    actionLabel="Browse Books"
                    onAction={() => navigation.navigate("Main")}
                />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: insets.top }]}>
            <View style={styles.header}>
                <ThemedText type="h1">My Cart</ThemedText>
                <ThemedText type="body" style={{ color: theme.textSecondary }}>
                    {cartItems.length} items
                </ThemedText>
            </View>

            <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id}
                key={numColumns}
                numColumns={numColumns}
                columnWrapperStyle={styles.columnWrapper}
                renderItem={({ item }) => (
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
                        <Button
                            variant="outline"
                            style={styles.removeButton}
                            onPress={() => removeFromCart(item.id)}
                        >
                            Remove
                        </Button>
                    </View>
                )}
                contentContainerStyle={[styles.listContent, { paddingBottom: 180 + insets.bottom }]} // Increase padding to avoid overlap
                showsVerticalScrollIndicator={false}
            />

            <View
                style={[
                    styles.footer,
                    {
                        backgroundColor: theme.backgroundRoot,
                        borderTopColor: theme.border,
                        paddingBottom: insets.bottom + Spacing.lg
                    },
                ]}
            >
                <View style={styles.totalRow}>
                    <ThemedText type="h2" style={{ fontWeight: "bold" }}>Total</ThemedText>
                    <ThemedText type="h1" style={{ color: theme.primary }}>
                        ₹{getTotalPrice().toFixed(2)}
                    </ThemedText>
                </View>
                <Button onPress={handleCheckout} style={styles.checkoutButton}>
                    Checkout
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: Spacing.lg,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
    },
    columnWrapper: {
        gap: Spacing.lg,
    },
    gridItem: {
        flex: 1,
        marginBottom: Spacing.lg,
        maxWidth: "100%",
    },
    removeButton: {
        marginTop: Spacing.sm,
        borderColor: "#FF3B30",
        height: 36,
    },
    footer: {
        padding: Spacing.lg,
        borderTopWidth: 1,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        ...Shadows.card, // Add shadow to separate footer
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Spacing.lg,
    },
    checkoutButton: {
        width: "100%",
        height: 50, // Larger button
    },
});
const insets = useSafeAreaInsets();
const { theme } = useTheme();
const { cartItems, removeFromCart, clearCart, getTotalPrice } = useCart();

const handleCheckout = () => {
    Alert.alert("Checkout", "Proceed to payment?", [
        { text: "Cancel", style: "cancel" },
        {
            text: "Pay Now",
            onPress: () => {
                clearCart();
                Alert.alert("Success", "Order placed successfully!");
            },
        },
    ]);
};

if (cartItems.length === 0) {
    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: insets.top }]}>
            <EmptyState
                image={require("../../assets/images/empty-purchases.png")}
                title="Your Cart is Empty"
                description="Browse books and add them to your cart!"
            />
        </View>
    );
}

return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: insets.top }]}>
        <View style={styles.header}>
            <ThemedText type="h1">My Cart</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
                {cartItems.length} items
            </ThemedText>
        </View>

        <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.cartItem}>
                    <View style={styles.bookCardContainer}>
                        <BookCard
                            id={item.id}
                            title={item.title}
                            author={item.author}
                            price={item.price}
                            condition={item.condition}
                            coverImageUrl={item.coverImageUrl}
                            onPress={() => { }} // Navigate to detail?
                        />
                    </View>
                    <Button
                        variant="outline"
                        style={styles.removeButton}
                        onPress={() => removeFromCart(item.id)}
                    >
                        Remove
                    </Button>
                </View>
            )}
            contentContainerStyle={styles.listContent}
        />

        <View
            style={[
                styles.footer,
                { backgroundColor: theme.backgroundDefault, borderTopColor: theme.border },
            ]}
        >
            <View style={styles.totalRow}>
                <ThemedText type="h3">Total</ThemedText>
                <ThemedText type="h2" style={{ color: theme.primary }}>
                    ₹{getTotalPrice().toFixed(2)}
                </ThemedText>
            </View>
            <Button onPress={handleCheckout} style={styles.checkoutButton}>
                Checkout
            </Button>
        </View>
    </View>
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: Spacing.lg,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 100,
    },
    cartItem: {
        marginBottom: Spacing.xl,
    },
    bookCardContainer: {
        height: 280, // Approximate height for BookCard
        marginBottom: Spacing.sm
    },
    removeButton: {
        borderColor: "#FF3B30",
    },
    footer: {
        padding: Spacing.lg,
        borderTopWidth: 1,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Spacing.lg,
    },
    checkoutButton: {
        width: "100%",
    },
});
