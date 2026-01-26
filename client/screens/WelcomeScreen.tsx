import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing } from "@/constants/theme";

WebBrowser.maybeCompleteAuthSession();

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const hasGoogleConfig = !!(
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
  );

  const [request, response, promptAsync] = Google.useAuthRequest(
    hasGoogleConfig
      ? {
          webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
          iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
          androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        }
      : {}
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleSignIn(authentication.accessToken);
      }
    } else if (response?.type === "error") {
      Alert.alert("Authentication Error", "Failed to sign in with Google. Please try again.");
    }
  }, [response]);

  async function handleSignIn(accessToken: string) {
    setIsLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signIn(accessToken);
    } catch (error) {
      console.error("Sign in error:", error);
      Alert.alert("Sign In Error", "Failed to sign in. Please try again.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    if (!hasGoogleConfig || !request) {
      Alert.alert(
        "Configuration Required",
        "Google Sign-In is not configured. Please set up Google OAuth credentials to enable authentication.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error("Google sign in error:", error);
      Alert.alert("Error", "Failed to initiate Google Sign-In");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.content}>
        <Image
          source={require("../../assets/images/welcome-books.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <ThemedText type="h1" style={styles.title}>
            Swaply
          </ThemedText>
          <ThemedText type="body" style={[styles.tagline, { color: theme.textSecondary }]}>
            Your trusted marketplace for pre-loved books
          </ThemedText>
        </View>
      </View>
      <View style={styles.footer}>
        <Button
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          style={[styles.googleButton, { backgroundColor: theme.primary }]}
        >
          <View style={styles.buttonContent}>
            <Feather name="log-in" size={20} color="#FFFFFF" />
            <ThemedText style={styles.buttonText}>
              {isLoading ? "Signing in..." : "Continue with Google"}
            </ThemedText>
          </View>
        </Button>
        <ThemedText type="small" style={[styles.terms, { color: theme.textSecondary }]}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing["2xl"],
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  illustration: {
    width: 280,
    height: 220,
    marginBottom: Spacing["3xl"],
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  tagline: {
    textAlign: "center",
    maxWidth: 280,
  },
  footer: {
    alignItems: "center",
    paddingBottom: Spacing.xl,
  },
  googleButton: {
    width: "100%",
    marginBottom: Spacing.lg,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  terms: {
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
});
