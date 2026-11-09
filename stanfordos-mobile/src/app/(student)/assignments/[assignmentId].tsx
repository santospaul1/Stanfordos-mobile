import { useCallback, useState } from "react";
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
  Card,
  Button,
  Badge,
  EmptyState,
  ErrorBanner,
} from "../../../components/ui";
import { Brand } from "../../../constants/brand";
import {
  mockStudentService,
  type StudentAssignment,
} from "../../../features/student/mock-student";
import { useOnline } from "../../../hooks/use-online";

const STATUS = {
  OPEN: { bg: Brand.primarySoft, text: Brand.primary },
  SUBMITTED: { bg: Brand.warningSoft, text: Brand.warning },
  GRADED: { bg: Brand.successSoft, text: Brand.success },
  OVERDUE: { bg: Brand.dangerSoft, text: Brand.danger },
} as const;

export default function StudentAssignmentDetailScreen() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const { online, requireOnline } = useOnline();
  const [item, setItem] = useState<StudentAssignment | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!assignmentId) return;
    setError(null);
    setLoading(true);
    try {
      const data = await mockStudentService.getAssignment(assignmentId);
      setItem(data);
      setText(data.mySubmissionText ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load assignment.");
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleSubmit() {
    if (!assignmentId) return;
    setError(null);
    setSavedMessage(null);
    setSaving(true);
    try {
      requireOnline();
      const updated = await mockStudentService.submitAssignment(
        assignmentId,
        text
      );
      setItem(updated);
      setSavedMessage("Submission saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit.");
    } finally {
      setSaving(false);
    }
  }

  const canSubmit =
    item &&
    (item.status === "OPEN" || item.status === "OVERDUE" || item.status === "SUBMITTED") &&
    item.status !== "GRADED";

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Assignments</Text>
        </Pressable>
        {loading ? (
          <ActivityIndicator color={Brand.primary} />
        ) : item ? (
          <>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{item.title}</Text>
              <Badge
                label={item.status}
                backgroundColor={STATUS[item.status].bg}
                textColor={STATUS[item.status].text}
              />
            </View>
            <Text style={styles.subtitle}>
              {item.subjectName} · Due {item.dueDate} · max {item.maxScore}
            </Text>
            <Text style={styles.body}>{item.description}</Text>
          </>
        ) : (
          <EmptyState title="Not found" />
        )}
      </View>

      {error ? <ErrorBanner message={error} /> : null}
      {savedMessage ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{savedMessage}</Text>
        </View>
      ) : null}

      {!loading && item ? (
        <Card>
          <Text style={styles.label}>Your response</Text>
          {item.status === "GRADED" ? (
            <>
              <Text style={styles.submission}>{item.mySubmissionText}</Text>
              <Text style={styles.score}>
                Score {item.myScore}/{item.maxScore}
              </Text>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="Type your submission"
                multiline
                textAlignVertical="top"
                editable={!!canSubmit && !saving}
              />
              {!online ? (
                <Text style={styles.offline}>
                  Offline — submission disabled
                </Text>
              ) : null}
              {canSubmit ? (
                <Button
                  title={online ? "Submit assignment" : "Connect to submit"}
                  onPress={handleSubmit}
                  loading={saving}
                  disabled={!online || saving}
                  style={{ marginTop: 12 }}
                />
              ) : null}
            </>
          )}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 16 },
  back: { color: Brand.primary, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  title: { flex: 1, fontSize: 22, fontWeight: "800", color: Brand.text },
  subtitle: { marginTop: 6, fontSize: 13, color: Brand.textSecondary },
  body: { marginTop: 12, fontSize: 14, color: Brand.text, lineHeight: 21 },
  successBox: {
    backgroundColor: Brand.successSoft,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  successText: { color: Brand.success, fontSize: 13, fontWeight: "600" },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.textSecondary,
    marginBottom: 8,
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: Brand.text,
    backgroundColor: "#FFF",
  },
  submission: { fontSize: 14, color: Brand.text, lineHeight: 20 },
  score: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "800",
    color: Brand.success,
  },
  offline: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: Brand.warning,
  },
});
