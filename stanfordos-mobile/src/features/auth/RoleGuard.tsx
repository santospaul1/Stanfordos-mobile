import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Redirect, type Href } from "expo-router";

import { useAuth } from "./AuthContext";
import type { UserRole } from "../../constants/roles";
import { ROLE_HOME_ROUTES } from "../../constants/roles";

interface Props {
  role: UserRole;
  children: React.ReactNode;
}

export function RoleGuard({ role, children }: Props) {
  const { session, status } = useAuth();

  if (status === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={styles.message}>Restoring your session...</Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (session.user.role !== role) {
    const destination = ROLE_HOME_ROUTES[session.user.role];

    return <Redirect href={destination as Href} />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  message: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 14,
  },
});