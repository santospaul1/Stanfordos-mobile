import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { Screen, EmptyState } from "../../../components/ui";
import { Brand } from "../../../constants/brand";

export default function ParentMessagesScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>
          Direct messaging with teachers is planned for a later release.
        </Text>
      </View>

      <EmptyState
        title="Coming soon"
        description="There is no messaging API in the current backend audit. This screen is a placeholder so navigation stays complete."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 20 },
  back: { color: Brand.primary, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "800", color: Brand.text },
  subtitle: { marginTop: 6, fontSize: 14, color: Brand.textSecondary, lineHeight: 20 },
});
