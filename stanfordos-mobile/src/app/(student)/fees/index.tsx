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
  EmptyState,
  ErrorBanner,
} from "../../../components/ui";
import { Brand } from "../../../constants/brand";
import {
  mockStudentService,
  type StudentFeeInvoice,
  type StudentFeePayment,
} from "../../../features/student/mock-student";

const INV_STATUS = {
  PAID: { bg: Brand.successSoft, text: Brand.success },
  PARTIAL: { bg: Brand.warningSoft, text: Brand.warning },
  DUE: { bg: Brand.primarySoft, text: Brand.primary },
  OVERDUE: { bg: Brand.dangerSoft, text: Brand.danger },
} as const;

function money(n: number) {
  return `KSh ${n.toLocaleString()}`;
}

export default function StudentFeesScreen() {
  const [invoices, setInvoices] = useState<StudentFeeInvoice[]>([]);
  const [payments, setPayments] = useState<StudentFeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [inv, pay] = await Promise.all([
        mockStudentService.listInvoices(),
        mockStudentService.listPayments(),
      ]);
      setInvoices(inv);
      setPayments(pay);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load fees.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const outstanding = useMemo(
    () => invoices.reduce((sum, i) => sum + i.balance, 0),
    [invoices]
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Fees</Text>
        <Text style={styles.subtitle}>
          Invoices, balances and payment history.
        </Text>
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {!loading ? (
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Outstanding balance</Text>
          <Text style={styles.balanceValue}>{money(outstanding)}</Text>
        </Card>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : (
        <>
          <Text style={styles.section}>Invoices</Text>
          {invoices.length === 0 ? (
            <EmptyState title="No invoices" />
          ) : (
            <View style={styles.list}>
              {invoices.map((inv) => {
                const colors = INV_STATUS[inv.status];
                return (
                  <Card key={inv.id}>
                    <View style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.name}>{inv.title}</Text>
                        <Text style={styles.meta}>
                          {inv.termName} · Due {inv.dueDate}
                        </Text>
                        <Text style={styles.meta}>
                          {money(inv.paid)} paid · {money(inv.balance)} due
                        </Text>
                      </View>
                      <Badge
                        label={inv.status}
                        backgroundColor={colors.bg}
                        textColor={colors.text}
                      />
                    </View>
                  </Card>
                );
              })}
            </View>
          )}

          <Text style={[styles.section, { marginTop: 22 }]}>Payments</Text>
          {payments.length === 0 ? (
            <EmptyState title="No payments" />
          ) : (
            <View style={styles.list}>
              {payments.map((p) => (
                <Card key={p.id}>
                  <Text style={styles.name}>{money(p.amount)}</Text>
                  <Text style={styles.meta}>
                    {p.method} · {p.paidAt}
                  </Text>
                  <Text style={styles.meta}>Receipt {p.receiptNo}</Text>
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
  header: { marginBottom: 16 },
  back: { color: Brand.primary, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "800", color: Brand.text },
  subtitle: { marginTop: 6, fontSize: 14, color: Brand.textSecondary },
  balanceCard: {
    marginBottom: 18,
    backgroundColor: "#EFF6FF",
    borderColor: Brand.primarySoft,
  },
  balanceLabel: { fontSize: 13, color: Brand.textSecondary, fontWeight: "600" },
  balanceValue: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: "800",
    color: Brand.primary,
  },
  center: { paddingVertical: 48, alignItems: "center" },
  section: {
    fontSize: 15,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 10,
  },
  list: { gap: 8 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  name: { fontSize: 15, fontWeight: "700", color: Brand.text },
  meta: { marginTop: 3, fontSize: 12, color: Brand.textSecondary },
});
