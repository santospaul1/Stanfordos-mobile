import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import { Screen, Card, EmptyState, ErrorBanner } from "../../../components/ui";
import { Brand } from "../../../constants/brand";
import { classesService } from "../../../features/classes/classes.service";
import type { TeacherClassSummary } from "../../../features/classes/types";

export default function TeacherClassesScreen() {
  const [classes, setClasses] = useState<TeacherClassSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setClasses(await mockClassesService.listMyClasses());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load classes.");
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
        <Text style={styles.title}>My classes</Text>
        <Text style={styles.subtitle}>
          Classes and subjects assigned to you.
        </Text>
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : classes.length === 0 ? (
        <EmptyState title="No classes" description="No classes are assigned yet." />
      ) : (
        <View style={styles.list}>
          {classes.map((cls) => (
            <Card
              key={cls.id}
              onPress={() =>
                router.push(`/(teacher)/classes/${cls.id}` as never)
              }
            >
              <Text style={styles.name}>{cls.name}</Text>
              <Text style={styles.meta}>
                {cls.subjectName} · {cls.gradeLevelName}
              </Text>
              <Text style={styles.meta}>
                {cls.studentCount} students
                {cls.room ? ` · ${cls.room}` : ""}
              </Text>
              {cls.scheduleHint ? (
                <Text style={styles.schedule}>{cls.scheduleHint}</Text>
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
  title: { fontSize: 26, fontWeight: "800", color: Brand.text },
  subtitle: { marginTop: 6, fontSize: 14, color: Brand.textSecondary },
  center: { paddingVertical: 48, alignItems: "center" },
  list: { gap: 10 },
  name: { fontSize: 16, fontWeight: "700", color: Brand.text },
  meta: { marginTop: 4, fontSize: 13, color: Brand.textSecondary },
  schedule: { marginTop: 8, fontSize: 12, fontWeight: "600", color: Brand.primary },
});
