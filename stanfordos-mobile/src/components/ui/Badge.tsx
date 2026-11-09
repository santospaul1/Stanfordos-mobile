import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  label: string;
  backgroundColor: string;
  textColor: string;
}

export function Badge({ label, backgroundColor, textColor }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
});
