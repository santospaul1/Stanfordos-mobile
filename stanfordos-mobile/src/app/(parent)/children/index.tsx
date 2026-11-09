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
  mockParentService,
  type ParentChild,
} from "../../../features/parent/mock-parent";

export default function ParentChildrenScreen() {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await mockParentService.listChildren();
      setChildren(list);
      setSelectedId(mockParentService.getSelectedChildId());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load children.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleSelect(childId: string) {
    setError(null);
    try {
      await mockParentService.selectChild(childId);
      setSelectedId(childId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not select child.");
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>My children</Text>
        <Text style={styles.subtitle}>
          Select a child. Attendance, academics and fees use the selected
          profile.
        </Text>
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : children.length === 0 ? (
        <EmptyState
          title="No linked children"
          description="Ask the school admin to link your account to a student."
        />
      ) : (
        <View style={styles.list}>
          {children.map((child) => {
            const active = child.id === selectedId;
            return (
              <Card
                key={child.id}
                onPress={() => handleSelect(child.id)}
                style={active ? styles.activeCard : undefined}
              >
                <View style={styles.row}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {child.fullName.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{child.fullName}</Text>
                    <Text style={styles.meta}>
                      {child.admissionNumber} · {child.classSectionName}
                    </Text>
                    <Text style={styles.meta}>{child.gradeLevelName}</Text>
                  </View>
                  {active ? (
                    <Badge
                      label="Selected"
                      backgroundColor={Brand.primarySoft}
                      textColor={Brand.primary}
                    />
                  ) : null}
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
  subtitle: { marginTop: 6, fontSize: 14, color: Brand.textSecondary, lineHeight: 20 },
  center: { paddingVertical: 48, alignItems: "center" },
  list: { gap: 10 },
  activeCard: { borderColor: Brand.primary, backgroundColor: "#EFF6FF" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Brand.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "800", color: Brand.primary },
  name: { fontSize: 16, fontWeight: "700", color: Brand.text },
  meta: { marginTop: 2, fontSize: 12, color: Brand.textSecondary },
});
