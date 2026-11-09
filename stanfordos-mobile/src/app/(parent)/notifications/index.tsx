import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import {
  Screen,
  Card,
  Button,
  EmptyState,
  ErrorBanner,
} from "../../../components/ui";
import { Brand } from "../../../constants/brand";
import {
  mockParentService,
  type ParentNotification,
} from "../../../features/parent/mock-parent";

export default function ParentNotificationsScreen() {
  const [items, setItems] = useState<ParentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setItems(await mockParentService.listNotifications());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function markOne(id: string) {
    await mockParentService.markNotificationRead(id);
    await load();
  }

  async function markAll() {
    await mockParentService.markAllNotificationsRead();
    await load();
  }

  const unread = items.filter((i) => !i.read).length;

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Notifications</Text>
          {unread > 0 ? (
            <Pressable onPress={markAll}>
              <Text style={styles.link}>Mark all read</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.subtitle}>
          School, class, fee and academic updates.
        </Text>
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState title="No notifications" />
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <Card
              key={item.id}
              onPress={() => {
                if (!item.read) markOne(item.id);
              }}
              style={!item.read ? styles.unread : undefined}
            >
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.title}</Text>
                  <Text style={styles.meta}>
                    {item.category} · {new Date(item.createdAt).toLocaleString()}
                  </Text>
                  <Text style={styles.body}>{item.body}</Text>
                </View>
                {!item.read ? <View style={styles.dot} /> : null}
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 18 },
  back: { color: Brand.primary, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 26, fontWeight: "800", color: Brand.text },
  link: { color: Brand.primary, fontSize: 14, fontWeight: "700" },
  subtitle: { marginTop: 6, fontSize: 14, color: Brand.textSecondary },
  center: { paddingVertical: 48, alignItems: "center" },
  list: { gap: 10 },
  unread: { borderColor: Brand.primary, backgroundColor: "#F8FAFF" },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  name: { fontSize: 15, fontWeight: "700", color: Brand.text },
  meta: { marginTop: 3, fontSize: 11, color: Brand.textMuted },
  body: { marginTop: 8, fontSize: 14, color: Brand.text, lineHeight: 20 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Brand.primary,
    marginTop: 4,
  },
});
