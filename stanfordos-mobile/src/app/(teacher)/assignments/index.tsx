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
  Button,
  EmptyState,
  ErrorBanner,
} from "../../../components/ui";
import { Brand } from "../../../constants/brand";
import { assignmentsService } from "../../../features/assignments/assignments.service";
import type { AssignmentSummary } from "../../../features/assignments/types";

const STATUS_COLORS = {
  DRAFT: { bg: "#F1F5F9", text: "#475569" },
  PUBLISHED: { bg: Brand.primarySoft, text: Brand.primary },
  CLOSED: { bg: Brand.warningSoft, text: Brand.warning },
  ACTIVE: { bg: Brand.successSoft, text: Brand.success },
} as const;

export default function TeacherAssignmentsScreen() {
  const [items, setItems] = useState<AssignmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      setItems(await assignmentsService.listMine());
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

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>

        <View style={styles.headingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Assignments</Text>
            <Text style={styles.subtitle}>
              <Button
                title="+ Create assignment"
                onPress={() =>
                  router.push("/(teacher)/assignments/create" as never)
                }
                style={styles.createButton}
              />
              Create class work and review student submissions.
            </Text>
          </View>
        </View>

        <Button
          title="+ Create assignment"
          onPress={() => router.push("/(teacher)/assignments/create" as never)}
          style={styles.createButton}
        />
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="Create an assignment for one of your courses."
          actionLabel="Create assignment"
          onAction={() => router.push("/(teacher)/assignments/create" as never)}
        />
      ) : (
        <View style={styles.list}>
          {items.map((item) => {
            const colors =
              item.status === "UNSPECIFIED" ? null : STATUS_COLORS[item.status];
            return (
              <Card
                key={item.id}
                onPress={() =>
                  router.push(`/(teacher)/assignments/${item.id}` as never)
                }
              >
                <View style={styles.top}>
                  <Text style={styles.name}>{item.title}</Text>

                  {colors ? (
                    <Badge
                      label={item.status}
                      backgroundColor={colors.bg}
                      textColor={colors.text}
                    />
                  ) : null}
                </View>

                <Text style={styles.meta}>
                  {item.courseName}
                  {item.classSectionName ? ` · ${item.classSectionName}` : ""}
                </Text>

                <Text style={styles.meta}>{item.courseName}</Text>
                <Text style={styles.meta}>
                  {item.dueDate
                    ? `Due ${new Date(item.dueDate).toLocaleDateString()}`
                    : "No due date"}
                  {" · "}
                  Maximum score: {item.maxScore}
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
  back: {
    color: Brand.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: { fontSize: 26, fontWeight: "800", color: Brand.text },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: Brand.textSecondary,
    lineHeight: 20,
  },
  createButton: { marginTop: 16 },
  center: { paddingVertical: 48, alignItems: "center" },
  list: { gap: 10 },
  top: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: Brand.text,
  },
  meta: {
    marginTop: 7,
    fontSize: 12,
    color: Brand.textSecondary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  submissions: {
    color: Brand.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  maxScore: {
    marginTop: 8,
    fontSize: 12,
    color: Brand.textMuted,
  },
});
