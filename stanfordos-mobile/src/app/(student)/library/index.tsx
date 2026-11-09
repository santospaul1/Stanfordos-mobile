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
} from "../../../components/ui";
import { Brand } from "../../../constants/brand";
import {
  mockStudentService,
  type StudentLibraryLoan,
} from "../../../features/student/mock-student";

const LOAN_STATUS = {
  ON_LOAN: { bg: Brand.primarySoft, text: Brand.primary },
  OVERDUE: { bg: Brand.dangerSoft, text: Brand.danger },
  RETURNED: { bg: Brand.successSoft, text: Brand.success },
} as const;

export default function StudentLibraryScreen() {
  const [loans, setLoans] = useState<StudentLibraryLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setLoans(await mockStudentService.listLibraryLoans());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load library loans.");
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
        <Text style={styles.title}>Library</Text>
        <Text style={styles.subtitle}>
          Books you have borrowed and due dates.
        </Text>
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : loans.length === 0 ? (
        <EmptyState title="No loans" description="You have no library history yet." />
      ) : (
        <View style={styles.list}>
          {loans.map((loan) => {
            const colors = LOAN_STATUS[loan.status];
            return (
              <Card key={loan.id}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{loan.title}</Text>
                    <Text style={styles.meta}>{loan.author}</Text>
                    <Text style={styles.meta}>
                      Borrowed {loan.borrowedAt} · Due {loan.dueDate}
                    </Text>
                  </View>
                  <Badge
                    label={loan.status.replace("_", " ")}
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
  header: { marginBottom: 20 },
  back: { color: Brand.primary, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "800", color: Brand.text },
  subtitle: { marginTop: 6, fontSize: 14, color: Brand.textSecondary },
  center: { paddingVertical: 48, alignItems: "center" },
  list: { gap: 10 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  name: { fontSize: 15, fontWeight: "700", color: Brand.text },
  meta: { marginTop: 3, fontSize: 12, color: Brand.textSecondary },
});
