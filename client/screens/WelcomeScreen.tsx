import React, { useState } from "react";
import { View, StyleSheet, Image, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "bookbazaar",
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ["openid", "profile", "email"],
      redirectUri,
    },
    {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
    }
  );

  React.useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleSignIn(authentication.accessToken);
      }
    }
  }, [response]);

  async function handleSignIn(accessToken: string) {
    setIsLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signIn(accessToken);
    } catch (error) {
      console.error("Sign in error:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    if (Platform.OS === "web") {
      const authUrl = `${getApiUrl()}api/auth/google/redirect`;
      window.location.href = authUrl;
      return;
    }
    await promptAsync();
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
            BookBazaar
          </ThemedText>
          <ThemedText type="body" style={[styles.tagline, { color: theme.textSecondary }]}>
            Your trusted marketplace for pre-loved books
          </ThemedText>
        </View>
      </View>
      <View style={styles.footer}>
        <Button
          onPress={handleGoogleSignIn}
          disabled={isLoading || (!request && Platform.OS !== "web")}
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
