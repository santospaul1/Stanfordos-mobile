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
  mockParentService,
  type ParentChild,
  type ParentFeeInvoice,
  type ParentFeePayment,
} from "../../../features/parent/mock-parent";

const INV_STATUS = {
  PAID: { bg: Brand.successSoft, text: Brand.success },
  PARTIAL: { bg: Brand.warningSoft, text: Brand.warning },
  DUE: { bg: Brand.primarySoft, text: Brand.primary },
  OVERDUE: { bg: Brand.dangerSoft, text: Brand.danger },
} as const;

function money(n: number) {
  return `KSh ${n.toLocaleString()}`;
}

export default function ParentFeesScreen() {
  const [child, setChild] = useState<ParentChild | null>(null);
  const [invoices, setInvoices] = useState<ParentFeeInvoice[]>([]);
  const [payments, setPayments] = useState<ParentFeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const selected = await mockParentService.getSelectedChild();
      setChild(selected);
      if (!selected) {
        setInvoices([]);
        setPayments([]);
        return;
      }
      const [inv, pay] = await Promise.all([
        mockParentService.listInvoices(selected.id),
        mockParentService.listPayments(selected.id),
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
          {child
            ? `${child.fullName} · invoices and payments`
            : "Select a child first"}
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
      ) : (
        <>
          <Card style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Outstanding balance</Text>
            <Text style={styles.balanceValue}>{money(outstanding)}</Text>
          </Card>

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
  center: { paddingVertical: 48, alignItems: "center" },
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
