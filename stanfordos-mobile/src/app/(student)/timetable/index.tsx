import { useCallback, useMemo, useState } from "react";
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
import {
  mockStudentService,
  studentWeekdays,
  type StudentTimetableSlot,
  type Weekday,
} from "../../../features/student/mock-student";

function todayKey(): Weekday {
  const map: Weekday[] = ["MON", "TUE", "WED", "THU", "FRI"];
  const d = new Date().getDay();
  if (d === 0 || d === 6) return "MON";
  return map[d - 1];
}

export default function StudentTimetableScreen() {
  const [slots, setSlots] = useState<StudentTimetableSlot[]>([]);
  const [day, setDay] = useState<Weekday>(todayKey());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setSlots(await mockStudentService.getTimetable());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load timetable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const daySlots = useMemo(
    () =>
      slots
        .filter((s) => s.day === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [slots, day]
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Timetable</Text>
        <Text style={styles.subtitle}>Your weekly class schedule.</Text>
      </View>

      <View style={styles.days}>
        {studentWeekdays.map((d) => {
          const active = d.key === day;
          return (
            <Pressable
              key={d.key}
              onPress={() => setDay(d.key)}
              style={[styles.dayChip, active && styles.dayChipActive]}
            >
              <Text style={[styles.dayText, active && styles.dayTextActive]}>
                {d.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : daySlots.length === 0 ? (
        <EmptyState title="No lessons" description="Nothing scheduled for this day." />
      ) : (
        <View style={styles.list}>
          {daySlots.map((slot) => (
            <Card key={slot.id}>
              <Text style={styles.time}>
                {slot.startTime} – {slot.endTime}
              </Text>
              <Text style={styles.name}>{slot.subjectName}</Text>
              <Text style={styles.meta}>
                {slot.teacherName}
                {slot.room ? ` · ${slot.room}` : ""}
              </Text>
            </Card>
          ))}
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
  days: { flexDirection: "row", gap: 8, marginBottom: 18 },
  dayChip: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  dayChipActive: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  dayText: { fontSize: 13, fontWeight: "700", color: Brand.textSecondary },
  dayTextActive: { color: "#FFFFFF" },
  center: { paddingVertical: 48, alignItems: "center" },
  list: { gap: 10 },
  time: { fontSize: 13, fontWeight: "700", color: Brand.primary },
  name: { marginTop: 4, fontSize: 15, fontWeight: "700", color: Brand.text },
  meta: { marginTop: 4, fontSize: 12, color: Brand.textSecondary },
});
