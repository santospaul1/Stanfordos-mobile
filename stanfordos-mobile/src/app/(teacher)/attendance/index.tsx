import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import { Screen, Card, EmptyState, ErrorBanner, SearchBar } from "../../../components/ui";
import { Brand } from "../../../constants/brand";
import { attendanceService } from "../../../features/attendance/attendance.service";
import type { ClassSectionSummary } from "../../../features/attendance/types";

export default function TeacherAttendanceClassesScreen() {
  const [classes, setClasses] = useState<ClassSectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await attendanceService.listMyClasses();
      setClasses(data);
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
        <Text style={styles.title}>Attendance</Text>
        <Text style={styles.subtitle}>
          Select a class to take or review attendance.
        </Text>
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : classes.length === 0 ? (
        <EmptyState
          title="No classes assigned"
          description="When classes are assigned to you, they will appear here."
          icon="📚"
        />
      ) : (
        <>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search class…"
        />
        <View style={styles.list}>
          {classes
            .filter((cls) => {
              const q = query.trim().toLowerCase();
              if (!q) return true;
              return (
                cls.name.toLowerCase().includes(q) ||
                cls.gradeLevelName.toLowerCase().includes(q)
              );
            })
            .map((cls) => (
            <Card
              key={cls.id}
              onPress={() =>
                router.push(`/(teacher)/attendance/${cls.id}` as never)
              }
              style={styles.card}
            >
              <View style={styles.row}>
                <View style={styles.icon}>
                  <Text style={styles.iconText}>
                    {cls.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.meta}>
                  <Text style={styles.name}>{cls.name}</Text>
                  <Text style={styles.detail}>
                    {cls.gradeLevelName} · {cls.studentCount} students
                  </Text>
                  <Text style={styles.detail}>
                    {cls.lastTakenAt
                      ? `Last taken ${cls.lastTakenAt}`
                      : "Not taken yet"}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            </Card>
          ))}
        </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  back: {
    color: Brand.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Brand.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: Brand.textSecondary,
    lineHeight: 20,
  },
  center: {
    paddingVertical: 48,
    alignItems: "center",
  },
  list: {
    gap: 10,
  },
  card: {
    paddingVertical: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: Brand.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 18,
    fontWeight: "800",
    color: Brand.primary,
  },
  meta: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: Brand.text,
  },
  detail: {
    marginTop: 2,
    fontSize: 12,
    color: Brand.textSecondary,
  },
  chevron: {
    fontSize: 22,
    color: Brand.borderStrong,
    marginLeft: 8,
  },
});
