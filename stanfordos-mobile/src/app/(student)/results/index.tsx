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
import {
  mockStudentService,
  type StudentExamResult,
} from "../../../features/student/mock-student";

export default function StudentResultsScreen() {
  const [items, setItems] = useState<StudentExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setItems(await mockStudentService.listResults());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load results.");
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
        <Text style={styles.title}>Results</Text>
        <Text style={styles.subtitle}>
          Your published exam results. Production access must verify you only
          see your own marks.
        </Text>
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          title="No results yet"
          description="Published exam results will appear here."
        />
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <Card
              key={item.id}
              onPress={() =>
                router.push(`/(student)/results/${item.id}` as never)
              }
            >
              <Text style={styles.name}>{item.examName}</Text>
              <Text style={styles.meta}>
                {item.termName} · {item.examDate}
              </Text>
              <Text style={styles.score}>
                Average {item.average}%
                {item.rank ? ` · Rank ${item.rank}` : ""}
              </Text>
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
  subtitle: { marginTop: 6, fontSize: 14, color: Brand.textSecondary, lineHeight: 20 },
  center: { paddingVertical: 48, alignItems: "center" },
  list: { gap: 10 },
  name: { fontSize: 16, fontWeight: "700", color: Brand.text },
  meta: { marginTop: 4, fontSize: 12, color: Brand.textSecondary },
  score: { marginTop: 10, fontSize: 14, fontWeight: "700", color: Brand.primary },
});
