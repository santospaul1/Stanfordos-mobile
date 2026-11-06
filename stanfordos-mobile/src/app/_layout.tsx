import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { QueryProvider } from "../providers/QueryProvider";
import { AuthProvider } from "../features/auth/AuthContext";

export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthProvider>
        <StatusBar style="dark" />

        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
            contentStyle: {
              backgroundColor: "#F8FAFC",
            },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="(teacher)" />
          <Stack.Screen name="(student)" />
          <Stack.Screen name="(parent)" />
          <Stack.Screen name="(librarian)" />
          <Stack.Screen name="(accountant)" />
          <Stack.Screen name="(platform-admin)" />
        </Stack>
      </AuthProvider>
    </QueryProvider>
  );
}