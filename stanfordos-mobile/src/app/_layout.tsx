import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { QueryProvider } from "../providers/QueryProvider";
import { NetworkProvider } from "../providers/NetworkProvider";
import { AuthProvider } from "../features/auth/AuthContext";

export default function RootLayout() {
  return (
    <QueryProvider>
      <NetworkProvider>
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
          />
        </AuthProvider>
      </NetworkProvider>
    </QueryProvider>
  );
}