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
  EmptyState,
  ErrorBanner,
  SearchBar,
} from "../../../components/ui";
import { Brand } from "../../../constants/brand";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const load = useCallback(async () => {
    setError(null); setLoading(true);
    try {
      const { mockLibrarianService } = await import("../../../features/librarian/mock-librarian");
      setItems(await mockLibrarianService.listCatalogue(query));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load."); }
    finally { setLoading(false); }
  }, [query]);

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
        <Text style={styles.title}>Book catalogue</Text>
        <Text style={styles.subtitle}>Search titles in the library catalogue.</Text>
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : (
        <>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search title or author"
            onSubmitEditing={load}
          />
          {items.length === 0 ? <EmptyState title="No books found" /> : (
            <View style={styles.list}>
              {items.map((b) => (
                <Card key={b.id}>
                  <Text style={styles.name}>{b.title}</Text>
                  <Text style={styles.meta}>{b.author} · {b.category}</Text>
                  <Text style={styles.meta}>{b.copiesAvailable}/{b.copiesTotal} available</Text>
                </Card>
              ))}
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
