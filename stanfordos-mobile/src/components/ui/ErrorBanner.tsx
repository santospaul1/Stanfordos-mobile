import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Brand } from "../../constants/brand";

interface Props {
  message: string;
}

export function ErrorBanner({ message }: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: Brand.dangerSoft,
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  text: {
    color: Brand.danger,
    fontSize: 13,
    fontWeight: "600",
  },
});
