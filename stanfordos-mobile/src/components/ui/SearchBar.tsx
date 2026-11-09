import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Brand } from "../../constants/brand";

interface Props extends Omit<TextInputProps, "style"> {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = "Search…",
  ...rest
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>⌕</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Brand.textMuted}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        {...rest}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => {
            onChangeText("");
            onClear?.();
          }}
          hitSlop={8}
          style={styles.clear}
        >
          <Text style={styles.clearText}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 14,
  },
  icon: {
    fontSize: 18,
    color: Brand.textMuted,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Brand.text,
    paddingVertical: 0,
  },
  clear: {
    padding: 4,
  },
  clearText: {
    color: Brand.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
});
