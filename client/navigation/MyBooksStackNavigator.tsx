import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MyBooksScreen from "@/screens/MyBooksScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/contexts/AuthContext";

export type MyBooksStackParamList = {
  MyBooks: undefined;
};

const Stack = createNativeStackNavigator<MyBooksStackParamList>();

export default function MyBooksStackNavigator() {
  const screenOptions = useScreenOptions();
  const { user } = useAuth();
  const isSeller = user?.role === "seller" || user?.role === "admin";

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="MyBooks"
        component={MyBooksScreen}
        options={{
          headerTitle: isSeller ? "My Listings" : "My Purchases",
        }}
      />
    </Stack.Navigator>
  );
}
