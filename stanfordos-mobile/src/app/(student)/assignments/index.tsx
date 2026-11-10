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
import { studentAssignmentsService } from "../../../features/student/student-assignments.service";
import type { StudentAssignment } from "../../../features/student/mock-student";
const STATUS = {
  OPEN: { bg: Brand.primarySoft, text: Brand.primary },
  SUBMITTED: { bg: Brand.warningSoft, text: Brand.warning },
  GRADED: { bg: Brand.successSoft, text: Brand.success },
  OVERDUE: { bg: Brand.dangerSoft, text: Brand.danger },
} as const;

export default function StudentAssignmentsScreen() {
  const [items, setItems] = useState<StudentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setItems(await studentAssignmentsService.listAssignments());
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
        <Text style={styles.subtitle}>Work due, submitted and graded.</Text>
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState title="No assignments" />
      ) : (
        <View style={styles.list}>
          {items.map((item) => {
            const colors = STATUS[item.status];
            return (
              <Card
                key={item.id}
                onPress={() =>
                  router.push(`/(student)/assignments/${item.id}` as never)
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
                  {item.subjectName} · Due {item.dueDate}
                </Text>
                {item.status === "GRADED" && item.myScore != null ? (
                  <Text style={styles.score}>
                    Score {item.myScore}/{item.maxScore}
                  </Text>
                ) : null}
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
  score: { marginTop: 8, fontSize: 13, fontWeight: "700", color: Brand.success },
});
