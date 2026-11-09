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
import {
  mockParentService,
  type ParentExamResult,
} from "../../../features/parent/mock-parent";

export default function ParentResultDetailScreen() {
  const { resultId } = useLocalSearchParams<{ resultId: string }>();
  const [item, setItem] = useState<ParentExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!resultId) return;
    setError(null);
    setLoading(true);
    try {
      setItem(await mockParentService.getResult(resultId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load result.");
    } finally {
      setLoading(false);
    }
  }, [resultId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Academics</Text>
        </Pressable>
        {loading ? (
          <ActivityIndicator color={Brand.primary} />
        ) : item ? (
          <>
            <Text style={styles.title}>{item.examName}</Text>
            <Text style={styles.subtitle}>
              {item.termName} · {item.examDate}
            </Text>
            <View style={styles.summary}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{item.average}%</Text>
                <Text style={styles.statLabel}>Average</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{item.rank ?? "—"}</Text>
                <Text style={styles.statLabel}>Rank</Text>
              </View>
            </View>
          </>
        ) : (
          <EmptyState title="Not found" />
        )}
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {!loading && item ? (
        <View style={styles.list}>
          {item.rows.map((row) => (
            <Card key={row.subjectName}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subject}>{row.subjectName}</Text>
                  <Text style={styles.meta}>
                    {row.score}/{row.maxScore}
                  </Text>
                </View>
                <Text style={styles.grade}>{row.grade}</Text>
              </View>
            </Card>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 18 },
  back: { color: Brand.primary, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "800", color: Brand.text },
  subtitle: { marginTop: 4, fontSize: 13, color: Brand.textSecondary },
  summary: { flexDirection: "row", gap: 8, marginTop: 16 },
  stat: {
    flex: 1,
    backgroundColor: Brand.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    paddingVertical: 12,
    alignItems: "center",
  },
  statValue: { fontSize: 16, fontWeight: "800", color: Brand.text },
  statLabel: { marginTop: 2, fontSize: 11, color: Brand.textSecondary },
  list: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center" },
  subject: { fontSize: 15, fontWeight: "700", color: Brand.text },
  meta: { marginTop: 2, fontSize: 12, color: Brand.textSecondary },
  grade: { fontSize: 18, fontWeight: "800", color: Brand.primary },
});
