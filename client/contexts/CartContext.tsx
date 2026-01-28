import React, { createContext, useContext, useState, ReactNode } from "react";
import { Book } from "@/lib/mock-db";
import * as Haptics from "expo-haptics";
import { Alert } from "react-native";

interface CartContextType {
    cartItems: Book[];
    addToCart: (book: Book) => void;
    removeFromCart: (bookId: string) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<Book[]>([]);

    const addToCart = (book: Book) => {
        if (cartItems.some((item) => item.id === book.id)) {
            Alert.alert("Already in Cart", "This book is already in your cart.");
            return;
        }
        setCartItems((prev) => [...prev, book]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const removeFromCart = (bookId: string) => {
        setCartItems((prev) => prev.filter((item) => item.id !== bookId));
        Haptics.selectionAsync();
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.price);
            return total + (isNaN(price) ? 0 : price);
        }, 0);
    };

    return (
        <CartContext.Provider
            value={{ cartItems, addToCart, removeFromCart, clearCart, getTotalPrice }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
