import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { apiRequest } from "@/lib/query-client";

export type UserRole = "buyer" | "seller" | "admin";

export interface User {
  id: string;
  email?: string;
  displayName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (token?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
  updateProfile: (data: { displayName?: string; phoneNumber?: string; email?: string }) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";

async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function setStoredToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

async function removeStoredToken(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      const token = await getStoredToken();
      if (token) {
        const response = await apiRequest("GET", "/api/auth/me");
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      await removeStoredToken();
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(token?: string) {
    try {
      if (token === "mock_token_for_prototype") {
        const mockUser: User = {
          id: "mock_user_" + Date.now(),
          email: "user@example.com",
          displayName: "Demo User",
          phoneNumber: "",
          role: "buyer",
        };
        await setStoredToken(token);
        setUser(mockUser);
        return;
      }

      const response = await apiRequest("POST", "/api/auth/anonymous");
      const data = await response.json();
      await setStoredToken(data.token);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  }

  async function signOut() {
    await removeStoredToken();
    setUser(null);
  }

  async function updateRole(role: UserRole) {
    try {
      const response = await apiRequest("PUT", "/api/auth/role", { role });
      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  }

  async function updateProfile(data: { displayName?: string; phoneNumber?: string; email?: string }) {
    try {
      const response = await apiRequest("PUT", "/api/auth/profile", data);
      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  }

  async function updateUser(data: Partial<User>) {
    // In production, call API: PUT /api/auth/profile
    if (user) {
      setUser({ ...user, ...data });
    }
  }

  async function refreshUser() {
    try {
      const response = await apiRequest("GET", "/api/auth/me");
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      await signOut();
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        updateRole,
        updateProfile,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
