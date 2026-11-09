import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";

import {
  Screen,
  Button,
  Card,
  Badge,
  EmptyState,
  ErrorBanner,
} from "../../../components/ui";
import { Brand, AttendanceStatusColors } from "../../../constants/brand";
import {
  cycleStatus,
  mockAttendanceService,
  todayIso,
} from "../../../features/attendance/mock-attendance";
import type {
  AttendanceEntrySheet,
  AttendanceStatus,
} from "../../../features/attendance/types";
import { useOnline } from "../../../hooks/use-online";

export default function AttendanceEntryScreen() {
  const { classSectionId } = useLocalSearchParams<{
    classSectionId: string;
  }>();
  const { online, requireOnline } = useOnline();

  const [sheet, setSheet] = useState<AttendanceEntrySheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const date = todayIso();

  const load = useCallback(async () => {
    if (!classSectionId) return;
    setError(null);
    setSavedMessage(null);
    setLoading(true);
    try {
      const data = await mockAttendanceService.getEntrySheet(
        classSectionId,
        date
      );
      setSheet(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load entry sheet.");
    } finally {
      setLoading(false);
    }
  }, [classSectionId, date]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const summary = useMemo(() => {
    if (!sheet) return null;
    const counts: Record<AttendanceStatus, number> = {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      EXCUSED: 0,
    };
    for (const row of sheet.rows) {
      counts[row.status] += 1;
    }
    return counts;
  }, [sheet]);

  function setStatus(studentId: string, status: AttendanceStatus) {
    setSheet((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rows: prev.rows.map((r) =>
          r.studentId === studentId ? { ...r, status } : r
        ),
      };
    });
    setSavedMessage(null);
  }

  function toggleStatus(studentId: string, current: AttendanceStatus) {
    setStatus(studentId, cycleStatus(current));
  }

  function markAllPresent() {
    setSheet((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rows: prev.rows.map((r) => ({ ...r, status: "PRESENT" as const })),
      };
    });
    setSavedMessage(null);
  }

  async function handleSave() {
    if (!sheet) return;
    setError(null);
    setSavedMessage(null);
    setSaving(true);
    try {
      requireOnline();
      await mockAttendanceService.saveEntrySheet(sheet);
      setSavedMessage("Attendance saved successfully.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not save attendance."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Classes</Text>
        </Pressable>
        <Text style={styles.title}>
          {sheet?.classSectionName ?? "Attendance"}
        </Text>
        <Text style={styles.subtitle}>Date · {date}</Text>
        {!online ? (
          <View style={styles.offlinePill}>
            <Text style={styles.offlineText}>Offline — save disabled</Text>
          </View>
        ) : null}
      </View>

      {error ? <ErrorBanner message={error} /> : null}
      {savedMessage ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{savedMessage}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : !sheet ? (
        <EmptyState
          title="Entry sheet unavailable"
          description="Could not load students for this class."
        />
      ) : (
        <>
          {summary ? (
            <View style={styles.summaryRow}>
              {(Object.keys(summary) as AttendanceStatus[]).map((key) => {
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

          <View style={styles.actions}>
            <Button
              title="Mark all present"
              variant="secondary"
              onPress={markAllPresent}
              style={styles.actionBtn}
            />
          </View>

          <Text style={styles.hint}>
            Tap a student to cycle Present → Late → Absent → Excused.
          </Text>

          <View style={styles.list}>
            {sheet.rows.map((row) => {
              const colors = AttendanceStatusColors[row.status];
              return (
                <Card
                  key={row.studentId}
                  onPress={() => toggleStatus(row.studentId, row.status)}
                  style={styles.rowCard}
                >
                  <View style={styles.row}>
                    <View style={styles.studentMeta}>
                      <Text style={styles.studentName}>{row.fullName}</Text>
                      <Text style={styles.admission}>
                        {row.admissionNumber}
                      </Text>
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

          <View style={styles.footer}>
            <Button
              title={online ? "Save attendance" : "Connect to save"}
              onPress={handleSave}
              loading={saving}
              disabled={!online || saving}
            />
            <Text style={styles.footerNote}>
              Saves require a live connection. Offline writes are not queued.
            </Text>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  back: {
    color: Brand.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Brand.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: Brand.textSecondary,
  },
  offlinePill: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: Brand.warningSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  offlineText: {
    color: Brand.warning,
    fontSize: 12,
    fontWeight: "700",
  },
  successBox: {
    backgroundColor: Brand.successSoft,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  successText: {
    color: Brand.success,
    fontSize: 13,
    fontWeight: "600",
  },
  center: {
    paddingVertical: 48,
    alignItems: "center",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: Brand.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    paddingVertical: 10,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Brand.text,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  actions: {
    marginBottom: 8,
  },
  actionBtn: {
    height: 44,
  },
  hint: {
    fontSize: 12,
    color: Brand.textMuted,
    marginBottom: 12,
  },
  list: {
    gap: 8,
  },
  rowCard: {
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  studentMeta: {
    flex: 1,
    paddingRight: 12,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "700",
    color: Brand.text,
  },
  admission: {
    marginTop: 2,
    fontSize: 12,
    color: Brand.textSecondary,
  },
  footer: {
    marginTop: 22,
    marginBottom: 12,
  },
  footerNote: {
    marginTop: 10,
    fontSize: 11,
    color: Brand.textMuted,
    textAlign: "center",
    lineHeight: 16,
  },
});
