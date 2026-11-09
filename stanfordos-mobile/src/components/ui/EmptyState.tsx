import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Brand } from "../../constants/brand";

interface Props {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Brand.text,
    textAlign: "center",
  },
  description: {
    marginTop: 8,
    fontSize: 13,
    color: Brand.textSecondary,
    textAlign: "center",
    lineHeight: 19,
  },
});
