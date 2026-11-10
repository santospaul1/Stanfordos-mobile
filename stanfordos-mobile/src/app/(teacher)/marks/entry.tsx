import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import {
  Screen,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
} from "../../../components/ui";
import { Brand } from "../../../constants/brand";
import { marksService } from "../../../features/marks/marks.service";
import type { MarksEntrySheet } from "../../../features/marks/types";
import { useOnline } from "../../../hooks/use-online";

export default function MarksEntryScreen() {
  const params = useLocalSearchParams<{
    examId: string;
    subjectId: string;
    classSectionId: string;
  }>();
  const { online, requireOnline } = useOnline();

  const [sheet, setSheet] = useState<MarksEntrySheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!params.examId || !params.subjectId || !params.classSectionId) return;
    setError(null);
    setSavedMessage(null);
    setLoading(true);
    try {
      const data = await marksService.getEntrySheet({
        examId: params.examId,
        subjectId: params.subjectId,
        classSectionId: params.classSectionId,
      });
      setSheet(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load marks sheet.");
    } finally {
      setLoading(false);
    }
  }, [params.examId, params.subjectId, params.classSectionId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const enteredCount = useMemo(() => {
    if (!sheet) return 0;
    return sheet.rows.filter((r) => r.score.trim() !== "").length;
  }, [sheet]);

  function setScore(studentId: string, score: string) {
    // allow only numbers and one decimal point
    const cleaned = score.replace(/[^0-9.]/g, "");
    setSheet((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rows: prev.rows.map((r) =>
          r.studentId === studentId ? { ...r, score: cleaned } : r
        ),
      };
    });
    setSavedMessage(null);
  }

  async function handleSave() {
    if (!sheet) return;
    setError(null);
    setSavedMessage(null);
    setSaving(true);
    try {
      requireOnline();
      await marksService.saveEntrySheet(sheet);
      setSavedMessage("Marks saved successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save marks.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Setup</Text>
        </Pressable>
        <Text style={styles.title}>{sheet?.classSectionName ?? "Marks"}</Text>
        {sheet ? (
          <Text style={styles.subtitle}>
            {sheet.examName} · {sheet.subjectName} · max {sheet.maxScore}
          </Text>
        ) : null}
        {!online ? (
          <View style={styles.offlinePill}>
            <Text style={styles.offlineText}>Offline — save disabled</Text>
          </View>
        ) : null}
      </View>

      {error ? <ErrorBanner message={error} /> : null}
      {savedMessage ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{savedMessage}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : !sheet ? (
        <EmptyState title="Sheet unavailable" />
      ) : (
        <>
          <Text style={styles.progress}>
            {enteredCount} / {sheet.rows.length} scores entered
          </Text>

          <View style={styles.list}>
            {sheet.rows.map((row) => (
              <Card key={row.studentId} style={styles.row}>
                <View style={styles.meta}>
                  <Text style={styles.name}>{row.fullName}</Text>
                  <Text style={styles.adm}>{row.admissionNumber}</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={row.score}
                  onChangeText={(t) => setScore(row.studentId, t)}
                  keyboardType="decimal-pad"
                  placeholder="—"
                  maxLength={6}
                />
              </Card>
            ))}
          </View>

          <View style={styles.footer}>
            <Button
              title={online ? "Save marks" : "Connect to save"}
              onPress={handleSave}
              loading={saving}
              disabled={!online || saving}
            />
            <Text style={styles.note}>
              Online-only. Do not ship student/parent marks reads until MOB-BE-02
              ownership checks are fixed on the backend.
            </Text>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 16 },
  back: { color: Brand.primary, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "800", color: Brand.text },
  subtitle: { marginTop: 4, fontSize: 14, color: Brand.textSecondary },
  offlinePill: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: Brand.warningSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  offlineText: { color: Brand.warning, fontSize: 12, fontWeight: "700" },
  successBox: {
    backgroundColor: Brand.successSoft,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  successText: { color: Brand.success, fontSize: 13, fontWeight: "600" },
  center: { paddingVertical: 48, alignItems: "center" },
  progress: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.textSecondary,
    marginBottom: 12,
  },
  list: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  meta: { flex: 1, paddingRight: 12 },
  name: { fontSize: 15, fontWeight: "700", color: Brand.text },
  adm: { marginTop: 2, fontSize: 12, color: Brand.textSecondary },
  input: {
    width: 72,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: Brand.text,
    backgroundColor: "#FFFFFF",
  },
  footer: { marginTop: 22, marginBottom: 12 },
  note: {
    marginTop: 10,
    fontSize: 11,
    color: Brand.textMuted,
    textAlign: "center",
    lineHeight: 16,
  },
});
