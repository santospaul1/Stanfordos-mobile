import { useCallback, useMemo, useState } from "react";
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
import { Brand, AttendanceStatusColors } from "../../../constants/brand";
import {
  mockStudentService,
  type StudentAttendanceDay,
} from "../../../features/student/mock-student";

export default function StudentAttendanceScreen() {
  const [days, setDays] = useState<StudentAttendanceDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setDays(await mockStudentService.listAttendance());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const summary = useMemo(() => {
    const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
    for (const d of days) counts[d.status] += 1;
    return counts;
  }, [days]);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Attendance</Text>
        <Text style={styles.subtitle}>Your recent attendance history.</Text>
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {!loading && days.length > 0 ? (
        <View style={styles.summaryRow}>
          {(Object.keys(summary) as (keyof typeof summary)[]).map((key) => {
            const colors = AttendanceStatusColors[key];
            return (
              <View key={key} style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{summary[key]}</Text>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>
                  {colors.label}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : days.length === 0 ? (
        <EmptyState title="No records" />
      ) : (
        <View style={styles.list}>
          {days.map((day) => {
            const colors = AttendanceStatusColors[day.status];
            return (
              <Card key={day.date}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.date}>{day.date}</Text>
                    {day.note ? (
                      <Text style={styles.note}>{day.note}</Text>
                    ) : null}
                  </View>
                  <Badge
                    label={colors.label}
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
  header: { marginBottom: 16 },
  back: { color: Brand.primary, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "800", color: Brand.text },
  subtitle: { marginTop: 6, fontSize: 14, color: Brand.textSecondary },
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  summaryItem: {
    flex: 1,
    backgroundColor: Brand.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    paddingVertical: 10,
    alignItems: "center",
  },
  summaryValue: { fontSize: 18, fontWeight: "800", color: Brand.text },
  summaryLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  center: { paddingVertical: 48, alignItems: "center" },
  list: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center" },
  date: { fontSize: 15, fontWeight: "700", color: Brand.text },
  note: { marginTop: 3, fontSize: 12, color: Brand.textSecondary },
});
