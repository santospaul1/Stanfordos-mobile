import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { Screen, Card, EmptyState, ErrorBanner } from "../../../components/ui";
import { Brand } from "../../../constants/brand";
import { mockClassesService } from "../../../features/classes/mock-classes";
import type {
  TeacherClassStudent,
  TeacherClassSummary,
} from "../../../features/classes/types";

export default function TeacherClassDetailScreen() {
  const { classSectionId } = useLocalSearchParams<{ classSectionId: string }>();
  const [cls, setCls] = useState<TeacherClassSummary | null>(null);
  const [students, setStudents] = useState<TeacherClassStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!classSectionId) return;
    setError(null);
    setLoading(true);
    try {
      const summary = mockClassesService.getClass(classSectionId) ?? null;
      setCls(summary);
      setStudents(await mockClassesService.getClassStudents(classSectionId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load class.");
    } finally {
      setLoading(false);
    }
  }, [classSectionId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Classes</Text>
        </Pressable>
        <Text style={styles.title}>{cls?.name ?? "Class"}</Text>
        {cls ? (
          <Text style={styles.subtitle}>
            {cls.subjectName} · {cls.studentCount} students
          </Text>
        ) : null}
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : students.length === 0 ? (
        <EmptyState title="No students" />
      ) : (
        <View style={styles.list}>
          {students.map((s) => (
            <Card key={s.studentId} style={styles.row}>
              <View>
                <Text style={styles.name}>{s.fullName}</Text>
                <Text style={styles.meta}>{s.admissionNumber}</Text>
              </View>
              {s.gender ? (
                <Text style={styles.gender}>{s.gender}</Text>
              ) : null}
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 20 },
  back: { color: Brand.primary, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "800", color: Brand.text },
  subtitle: { marginTop: 4, fontSize: 14, color: Brand.textSecondary },
  center: { paddingVertical: 48, alignItems: "center" },
  list: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: { fontSize: 15, fontWeight: "700", color: Brand.text },
  meta: { marginTop: 2, fontSize: 12, color: Brand.textSecondary },
  gender: { fontSize: 12, fontWeight: "700", color: Brand.textMuted },
});
