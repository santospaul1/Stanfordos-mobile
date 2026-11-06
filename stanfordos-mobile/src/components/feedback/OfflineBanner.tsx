import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useNetwork } from "../../providers/NetworkProvider";

export function OfflineBanner() {
  const { isOnline } = useNetwork();

  if (isOnline) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        You're offline
      </Text>

      <Text style={styles.description}>
        Showing previously loaded information where available.
        Changes cannot be submitted.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FEF3C7",
    borderBottomWidth: 1,
    borderBottomColor: "#FDE68A",
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  title: {
    color: "#92400E",
    fontSize: 13,
    fontWeight: "800",
  },
  description: {
    color: "#92400E",
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },
});