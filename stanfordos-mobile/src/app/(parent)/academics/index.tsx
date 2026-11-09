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
  mockParentService,
  type ParentChild,
  type ParentExamResult,
} from "../../../features/parent/mock-parent";

export default function ParentAcademicsScreen() {
  const [child, setChild] = useState<ParentChild | null>(null);
  const [results, setResults] = useState<ParentExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const selected = await mockParentService.getSelectedChild();
      setChild(selected);
      if (!selected) {
        setResults([]);
        return;
      }
      setResults(await mockParentService.listResults(selected.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load academics.");
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
        <Text style={styles.title}>Academic performance</Text>
        <Text style={styles.subtitle}>
          {child
            ? `${child.fullName} · demo results only`
            : "Select a child first"}
        </Text>
        <Text style={styles.note}>
          Parent marks/report cards need explicit backend authorization before
          production (MOB-BE-03/04).
        </Text>
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : !child ? (
        <EmptyState
          title="No child selected"
          description="Open My children and select a profile."
        />
      ) : results.length === 0 ? (
        <EmptyState title="No published results" />
      ) : (
        <View style={styles.list}>
          {results.map((item) => (
            <Card
              key={item.id}
              onPress={() =>
                router.push(`/(parent)/academics/${item.id}` as never)
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
  header: { marginBottom: 18 },
  back: { color: Brand.primary, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "800", color: Brand.text },
  subtitle: { marginTop: 6, fontSize: 14, color: Brand.textSecondary },
  note: {
    marginTop: 10,
    fontSize: 12,
    color: Brand.warning,
    lineHeight: 18,
  },
  center: { paddingVertical: 48, alignItems: "center" },
  list: { gap: 10 },
  name: { fontSize: 16, fontWeight: "700", color: Brand.text },
  meta: { marginTop: 4, fontSize: 12, color: Brand.textSecondary },
  score: { marginTop: 10, fontSize: 14, fontWeight: "700", color: Brand.primary },
});
