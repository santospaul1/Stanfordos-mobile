import React from "react";
import { StyleSheet, Text, Pressable, View } from "react-native";

interface Props {
  label: string;
  backgroundColor: string;
  textColor: string;
  onPress?: () => void;
  selected?: boolean;
}

export function StatusChip({
  label,
  backgroundColor,
  textColor,
  onPress,
  selected,
}: Props) {
  const content = (
    <View
      style={[
        styles.chip,
        { backgroundColor },
        selected && styles.selected,
      ]}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={4}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  selected: {
    borderWidth: 1.5,
    borderColor: "rgba(15,23,42,0.15)",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
});
