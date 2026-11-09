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
  Badge,
  EmptyState,
  ErrorBanner,
} from "../../../components/ui";
import { Brand } from "../../../constants/brand";
import { mockAssignmentsService } from "../../../features/assignments/mock-assignments";
import type { AssignmentSummary } from "../../../features/assignments/types";

const STATUS_COLORS = {
  DRAFT: { bg: "#F1F5F9", text: "#475569" },
  PUBLISHED: { bg: Brand.primarySoft, text: Brand.primary },
  CLOSED: { bg: Brand.warningSoft, text: Brand.warning },
} as const;

export default function TeacherAssignmentsScreen() {
  const [items, setItems] = useState<AssignmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setItems(await mockAssignmentsService.listMine());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Assignments</Text>
        <Text style={styles.subtitle}>
          Create, track and review class work.
        </Text>
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState title="No assignments" description="None created yet." />
      ) : (
        <View style={styles.list}>
          {items.map((item) => {
            const colors = STATUS_COLORS[item.status];
            return (
              <Card
                key={item.id}
                onPress={() =>
                  router.push(`/(teacher)/assignments/${item.id}` as never)
                }
              >
                <View style={styles.top}>
                  <Text style={styles.name}>{item.title}</Text>
                  <Badge
                    label={item.status}
                    backgroundColor={colors.bg}
                    textColor={colors.text}
                  />
                </View>
                <Text style={styles.meta}>
                  {item.courseName} · {item.classSectionName}
                </Text>
                <Text style={styles.meta}>
                  Due {item.dueDate} · {item.submissionCount}/{item.studentCount} submitted
                </Text>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 20 },
  back: { color: Brand.primary, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "800", color: Brand.text },
  subtitle: { marginTop: 6, fontSize: 14, color: Brand.textSecondary },
  center: { paddingVertical: 48, alignItems: "center" },
  list: { gap: 10 },
  top: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  name: { flex: 1, fontSize: 15, fontWeight: "700", color: Brand.text },
  meta: { marginTop: 4, fontSize: 12, color: Brand.textSecondary },
});
