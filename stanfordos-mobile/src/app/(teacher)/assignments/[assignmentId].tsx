import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import {
  Screen,
  Card,
  Badge,
  EmptyState,
  ErrorBanner,
} from "../../../components/ui";
import { Brand } from "../../../constants/brand";
import { mockAssignmentsService } from "../../../features/assignments/mock-assignments";
import type {
  AssignmentDetail,
  AssignmentSubmission,
} from "../../../features/assignments/types";

const SUB_COLORS = {
  NOT_SUBMITTED: { bg: "#F1F5F9", text: "#64748B" },
  SUBMITTED: { bg: Brand.warningSoft, text: Brand.warning },
  GRADED: { bg: Brand.successSoft, text: Brand.success },
} as const;

export default function AssignmentDetailScreen() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [subs, setSubs] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!assignmentId) return;
    setError(null);
    setLoading(true);
    try {
      const [a, s] = await Promise.all([
        mockAssignmentsService.getById(assignmentId),
        mockAssignmentsService.listSubmissions(assignmentId),
      ]);
      setAssignment(a);
      setSubs(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load assignment.");
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Assignments</Text>
        </Pressable>
        {loading ? (
          <ActivityIndicator color={Brand.primary} />
        ) : assignment ? (
          <>
            <Text style={styles.title}>{assignment.title}</Text>
            <Text style={styles.subtitle}>
              {assignment.courseName} · {assignment.classSectionName}
            </Text>
            <Text style={styles.subtitle}>
              Due {assignment.dueDate} · max {assignment.maxScore}
            </Text>
            <Text style={styles.body}>{assignment.description}</Text>
          </>
        ) : null}
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      <Text style={styles.section}>Submissions</Text>

      {loading ? null : subs.length === 0 ? (
        <EmptyState title="No students" />
      ) : (
        <View style={styles.list}>
          {subs.map((s) => {
            const colors = SUB_COLORS[s.status];
            return (
              <Card key={s.id}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{s.studentName}</Text>
                    <Text style={styles.meta}>{s.admissionNumber}</Text>
                  </View>
                  <Badge
                    label={
                      s.status === "GRADED" && s.score != null
                        ? `${s.score}`
                        : s.status.replace("_", " ")
                    }
                    backgroundColor={colors.bg}
                    textColor={colors.text}
                  />
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 18 },
  back: { color: Brand.primary, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "800", color: Brand.text },
  subtitle: { marginTop: 4, fontSize: 13, color: Brand.textSecondary },
  body: {
    marginTop: 12,
    fontSize: 14,
    color: Brand.text,
    lineHeight: 21,
  },
  section: {
    fontSize: 15,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 10,
  },
  list: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  name: { fontSize: 15, fontWeight: "700", color: Brand.text },
  meta: { marginTop: 2, fontSize: 12, color: Brand.textSecondary },
});
