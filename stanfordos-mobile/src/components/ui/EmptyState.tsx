import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Brand } from "../../constants/brand";
import { Button } from "./Button";

interface Props {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = "📭",
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="secondary"
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 48,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Brand.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: Brand.text,
    textAlign: "center",
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: Brand.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  action: {
    marginTop: 18,
    minWidth: 160,
  },
});
