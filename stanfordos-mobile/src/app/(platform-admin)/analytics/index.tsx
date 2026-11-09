import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import {
  Screen,
  Card,
  Badge,
  EmptyState,
  ErrorBanner,
} from "../../../components/ui";
import { Brand } from "../../../constants/brand";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const load = useCallback(async () => {
    setError(null); setLoading(true);
    try {
      const { mockPlatformService } = await import("../../../features/platform/mock-platform");
      setSummary(await mockPlatformService.getAnalytics());
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load."); }
    finally { setLoading(false); }
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
        <Text style={styles.title}>Platform analytics</Text>
        <Text style={styles.subtitle}>Usage and growth snapshot.</Text>
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : (
        <>
          {!summary ? <EmptyState title="No data" /> : (
            <View style={styles.statGrid}>
              <View style={styles.statCard}><Text style={styles.statValue}>{summary.schools}</Text><Text style={styles.statLabel}>Schools</Text></View>
              <View style={styles.statCard}><Text style={styles.statValue}>{(summary.activeUsers/1000).toFixed(1)}k</Text><Text style={styles.statLabel}>Active users</Text></View>
              <View style={styles.statCard}><Text style={styles.statValue}>{summary.trials}</Text><Text style={styles.statLabel}>Trials</Text></View>
              <View style={styles.statCard}><Text style={styles.statValue}>{summary.openTickets}</Text><Text style={styles.statLabel}>Open tickets</Text></View>
              <View style={styles.statCard}><Text style={styles.statValue}>{summary.monthlyActiveSchools}</Text><Text style={styles.statLabel}>Active schools / mo</Text></View>
              <View style={styles.statCard}><Text style={styles.statValue}>{summary.collectionRate}</Text><Text style={styles.statLabel}>Collection rate</Text></View>
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 18 },
  back: { color: Brand.primary, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "800", color: Brand.text },
  subtitle: { marginTop: 6, fontSize: 14, color: Brand.textSecondary, lineHeight: 20 },
  center: { paddingVertical: 48, alignItems: "center" },
  list: { gap: 8 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  name: { fontSize: 15, fontWeight: "700", color: Brand.text },
  meta: { marginTop: 3, fontSize: 12, color: Brand.textSecondary },
  search: {
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: "#FFF",
    fontSize: 15,
    color: Brand.text,
  },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  statCard: {
    width: "47%",
    flexGrow: 1,
    backgroundColor: Brand.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 12,
  },
  statValue: { fontSize: 18, fontWeight: "800", color: Brand.text },
  statLabel: { marginTop: 4, fontSize: 12, color: Brand.textSecondary },
});
