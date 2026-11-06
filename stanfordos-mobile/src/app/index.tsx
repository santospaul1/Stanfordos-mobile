import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import { Redirect } from "expo-router";

import { useAuth } from "../features/auth/AuthContext";
import { ROLE_HOME_ROUTES } from "../constants/roles";
import type { Href } from "expo-router";

export default function Index() {
  const { session, status } = useAuth();

  if (status === "loading") {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  const destination = ROLE_HOME_ROUTES[session.user.role];

  return <Redirect href={destination as Href} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
});