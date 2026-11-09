import React from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { Brand } from "../../constants/brand";

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({ children, onPress, style }: Props) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Brand.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 14,
  },
  pressed: {
    backgroundColor: "#F1F5F9",
  },
});
