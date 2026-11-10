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
  Button,
  EmptyState,
  ErrorBanner,
} from "../../../components/ui";
import { Brand } from "../../../constants/brand";
import { studentAssignmentsService } from "../../../features/student/student-assignments.service";
import type { StudentAssignment } from "../../../features/student/mock-student";

type AssignmentFilter = "ALL" | "TO_DO" | "SUBMITTED" | "GRADED";

const FILTERS: { key: AssignmentFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "TO_DO", label: "To do" },
  { key: "SUBMITTED", label: "Submitted" },
  { key: "GRADED", label: "Graded" },
];

const STATUS = {
  OPEN: { bg: Brand.primarySoft, text: Brand.primary, label: "Open" },
  SUBMITTED: {
    bg: Brand.warningSoft,
    text: Brand.warning,
    label: "Submitted",
  },
  GRADED: {
    bg: Brand.successSoft,
    text: Brand.success,
    label: "Graded",
  },
  OVERDUE: {
    bg: Brand.dangerSoft,
    text: Brand.danger,
    label: "Overdue",
  },
} as const;

function dateKey(value: string): number | null {
  const parts = value.slice(0, 10).split("-").map(Number);

  if (
    parts.length !== 3 ||
    parts.some((part) => !Number.isFinite(part)) ||
    parts[0] < 1000 ||
    parts[1] < 1 ||
    parts[1] > 12 ||
    parts[2] < 1 ||
    parts[2] > 31
  ) {
    return null;
  }

  return Date.UTC(parts[0], parts[1] - 1, parts[2]);
}

function todayKey(): number {
  const now = new Date();
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

function getEffectiveStatus(item: StudentAssignment): keyof typeof STATUS {
  if (
    item.status === "OPEN" &&
    dateKey(item.dueDate) !== null &&
    dateKey(item.dueDate)! < todayKey()
  ) {
    return "OVERDUE";
  }

  return item.status;
}

function formatDueDate(value: string): string {
  const key = dateKey(value);
  if (key === null) return `Due ${value}`;

  const date = new Date(key);
  return `Due ${new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)}`;
}

function dueDescription(item: StudentAssignment): string {
  const status = getEffectiveStatus(item);

  if (status === "OVERDUE") return "Past the due date";
  if (status === "SUBMITTED") return "Your work has been submitted";
  if (status === "GRADED") return "Your work has been graded";

  const due = dateKey(item.dueDate);
  if (due === null) return formatDueDate(item.dueDate);

  const difference = Math.round((due - todayKey()) / 86_400_000);

  if (difference === 0) return "Due today";
  if (difference === 1) return "Due tomorrow";
  if (difference > 1 && difference <= 7) {
    return `Due in ${difference} days`;
  }

  return formatDueDate(item.dueDate);
}

function matchesFilter(
  item: StudentAssignment,
  filter: AssignmentFilter,
): boolean {
  const status = getEffectiveStatus(item);

  if (filter === "ALL") return true;
  if (filter === "TO_DO") {
    return status === "OPEN" || status === "OVERDUE";
  }

  return status === filter;
}

export default function StudentAssignmentsScreen() {
  const [items, setItems] = useState<StudentAssignment[]>([]);
  const [filter, setFilter] = useState<AssignmentFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const data = await studentAssignmentsService.listAssignments();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const counts = useMemo(() => {
    return {
      all: items.length,
      todo: items.filter((item) => {
        const status = getEffectiveStatus(item);
        return status === "OPEN" || status === "OVERDUE";
      }).length,
      submitted: items.filter(
        (item) => getEffectiveStatus(item) === "SUBMITTED",
      ).length,
      graded: items.filter((item) => getEffectiveStatus(item) === "GRADED")
        .length,
    };
  }, [items]);

  const visibleItems = useMemo(() => {
    return items
      .filter((item) => matchesFilter(item, filter))
      .sort((a, b) => {
        const aDue = dateKey(a.dueDate) ?? Number.MAX_SAFE_INTEGER;
        const bDue = dateKey(b.dueDate) ?? Number.MAX_SAFE_INTEGER;
        return aDue - bDue;
      });
  }, [items, filter]);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>

        <Text style={styles.title}>Assignments</Text>
        <Text style={styles.subtitle}>
          Keep track of work, deadlines and feedback.
        </Text>
      </View>

      {!loading && !error ? (
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{counts.todo}</Text>
            <Text style={styles.summaryLabel}>To do</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{counts.submitted}</Text>
            <Text style={styles.summaryLabel}>Submitted</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{counts.graded}</Text>
            <Text style={styles.summaryLabel}>Graded</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.filterRow}>
        {FILTERS.map((option) => {
          const active = filter === option.key;

          return (
            <Pressable
              key={option.key}
              onPress={() => setFilter(option.key)}
              style={[styles.filterButton, active && styles.filterButtonActive]}
            >
              <Text
                style={[styles.filterText, active && styles.filterTextActive]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <View style={styles.errorArea}>
          <ErrorBanner message={error} />
          <Button title="Try again" onPress={load} style={styles.retryButton} />
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
          <Text style={styles.loadingText}>Loading assignments...</Text>
        </View>
      ) : !error && items.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="Your teachers' assignments will appear here."
        />
      ) : !error && visibleItems.length === 0 ? (
        <EmptyState
          title="Nothing in this section"
          description="Try another filter to see your assignments."
        />
      ) : !error ? (
        <View style={styles.list}>
          <Text style={styles.resultCount}>
            {visibleItems.length} assignment
            {visibleItems.length === 1 ? "" : "s"}
          </Text>

          {visibleItems.map((item) => {
            const status = getEffectiveStatus(item);
            const colors = STATUS[status];
            const attempts = item.submissionHistory?.length ?? 0;

            return (
              <Card
                key={item.id}
                onPress={() =>
                  router.push(`/(student)/assignments/${item.id}` as never)
                }
                style={styles.assignmentCard}
              >
                <View style={styles.cardTop}>
                  <View style={styles.subjectPill}>
                    <Text style={styles.subjectText}>{item.subjectName}</Text>
                  </View>

                  <Badge
                    label={colors.label}
                    backgroundColor={colors.bg}
                    textColor={colors.text}
                  />
                </View>

                <Text style={styles.name}>{item.title}</Text>

                <View style={styles.dueRow}>
                  <Text
                    style={[
                      styles.dueText,
                      status === "OVERDUE" && styles.overdueText,
                    ]}
                  >
                    {dueDescription(item)}
                  </Text>

                  <Text style={styles.maxScore}>{item.maxScore} marks</Text>
                </View>

                {status === "GRADED" && item.myScore != null ? (
                  <View style={styles.resultLine}>
                    <Text style={styles.score}>
                      Score: {item.myScore}/{item.maxScore}
                    </Text>
                    {item.teacherFeedback ? (
                      <Text style={styles.feedbackAvailable}>
                        Feedback available
                      </Text>
                    ) : null}
                  </View>
                ) : null}

                {attempts > 0 ? (
                  <Text style={styles.attempts}>
                    {attempts} submission attempt
                    {attempts === 1 ? "" : "s"}
                  </Text>
                ) : null}

                <Text style={styles.openHint}>View assignment ›</Text>
              </Card>
            );
          })}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 18 },
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
  },
  summaryRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 13,
    padding: 12,
  },
  summaryNumber: {
    fontSize: 23,
    fontWeight: "800",
    color: Brand.text,
  },
  summaryLabel: {
    marginTop: 3,
    fontSize: 11,
    color: Brand.textSecondary,
  },
  filterRow: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.surface,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  filterText: {
    fontSize: 11,
    fontWeight: "700",
    color: Brand.textSecondary,
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  center: {
    paddingVertical: 48,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: Brand.textSecondary,
  },
  errorArea: { marginBottom: 14 },
  retryButton: { marginTop: 10 },
  list: { gap: 10 },
  resultCount: {
    fontSize: 12,
    color: Brand.textSecondary,
    marginBottom: 2,
  },
  assignmentCard: { padding: 15 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  subjectPill: {
    backgroundColor: Brand.background,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  subjectText: {
    fontSize: 11,
    fontWeight: "700",
    color: Brand.textSecondary,
  },
  name: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: Brand.text,
  },
  dueRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  dueText: {
    fontSize: 12,
    fontWeight: "700",
    color: Brand.primary,
  },
  overdueText: { color: Brand.danger },
  maxScore: {
    fontSize: 11,
    color: Brand.textSecondary,
  },
  resultLine: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  score: {
    fontSize: 13,
    fontWeight: "800",
    color: Brand.success,
  },
  feedbackAvailable: {
    fontSize: 11,
    fontWeight: "700",
    color: Brand.success,
  },
  attempts: {
    marginTop: 8,
    fontSize: 11,
    color: Brand.textSecondary,
  },
  openHint: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "700",
    color: Brand.primary,
  },
});
