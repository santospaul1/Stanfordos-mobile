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
import * as DocumentPicker from "expo-document-picker";

import {
  Screen,
  Card,
  Button,
  Badge,
  EmptyState,
  ErrorBanner,
} from "../../../components/ui";
import { Brand } from "../../../constants/brand";
import type {
  StudentAssignment,
  StudentSubmissionAttachment,
} from "../../../features/student/mock-student";
import { studentAssignmentsService } from "../../../features/student/student-assignments.service";
import { useOnline } from "../../../hooks/use-online";

const STATUS = {
  OPEN: { bg: Brand.primarySoft, text: Brand.primary },
  SUBMITTED: { bg: Brand.warningSoft, text: Brand.warning },
  GRADED: { bg: Brand.successSoft, text: Brand.success },
  OVERDUE: { bg: Brand.dangerSoft, text: Brand.danger },
} as const;

function formatDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatFileSize(size?: number | null): string {
  if (size == null || !Number.isFinite(size)) return "Size unavailable";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StudentAssignmentDetailScreen() {
  const { assignmentId } = useLocalSearchParams<{
    assignmentId: string;
  }>();

  const { online, requireOnline } = useOnline();

  const [item, setItem] = useState<StudentAssignment | null>(null);
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickingFile, setPickingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!assignmentId) return;

    setError(null);
    setLoading(true);

    try {
      const data = await studentAssignmentsService.getAssignment(assignmentId);

      setItem(data);
      setText(data.mySubmissionText ?? "");
      setSelectedFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load assignment.");
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handlePickFile() {
    setError(null);

    try {
      setPickingFile(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      setSelectedFile(result.assets[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not select the file.");
    } finally {
      setPickingFile(false);
    }
  }

  async function handleSubmit() {
    if (!assignmentId) return;

    setError(null);
    setSavedMessage(null);

    if (!text.trim() && !selectedFile) {
      setError("Write a response or attach a file before submitting.");
      return;
    }

    setSaving(true);

    try {
      requireOnline();

      const attachment: StudentSubmissionAttachment | undefined = selectedFile
        ? {
            uri: selectedFile.uri,
            name: selectedFile.name,
            mimeType: selectedFile.mimeType,
            size: selectedFile.size,
          }
        : undefined;

      const updated = await studentAssignmentsService.submitAssignment(
        assignmentId,
        text,
        attachment,
      );

      setItem(updated);
      setSelectedFile(null);
      setSavedMessage("Your submission has been saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit assignment.");
    } finally {
      setSaving(false);
    }
  }

  const canSubmit =
    item !== null &&
    (item.status === "OPEN" ||
      item.status === "OVERDUE" ||
      item.status === "SUBMITTED");

  const history = item?.submissionHistory ?? [];

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
              {item.subjectName} · Due {formatDate(item.dueDate)}
            </Text>

            <View style={styles.scoreMeta}>
              <Text style={styles.metaText}>
                Maximum score: {item.maxScore}
              </Text>
              {item.status === "GRADED" && item.myScore != null ? (
                <Text style={styles.metaScore}>
                  {item.myScore}/{item.maxScore} marks
                </Text>
              ) : null}
            </View>

            <Text style={styles.body}>{item.description}</Text>
          </>
        ) : (
          <EmptyState title="Assignment not found" />
        )}
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {savedMessage ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{savedMessage}</Text>
        </View>
      ) : null}

      {!loading && item ? (
        <>
          <Card>
            <Text style={styles.sectionTitle}>Your submission</Text>

            {item.status === "GRADED" ? (
              <>
                <Text style={styles.label}>Submitted response</Text>
                <Text style={styles.submission}>
                  {item.mySubmissionText || "No written response."}
                </Text>

                {item.myAttachment ? (
                  <View style={styles.existingFile}>
                    <Text style={styles.fileName}>
                      {item.myAttachment.name}
                    </Text>
                    <Text style={styles.fileMeta}>
                      {formatFileSize(item.myAttachment.size)}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.feedbackBox}>
                  <Text style={styles.feedbackTitle}>Teacher feedback</Text>
                  <Text style={styles.feedbackText}>
                    {item.teacherFeedback || "No feedback has been added yet."}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.label}>Written response</Text>

                <TextInput
                  style={styles.input}
                  value={text}
                  onChangeText={setText}
                  placeholder="Type your answer or explain your work..."
                  multiline
                  textAlignVertical="top"
                  editable={!!canSubmit && !saving}
                />

                <Text style={styles.label}>File attachment</Text>

                {selectedFile ? (
                  <View style={styles.fileBox}>
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName}>{selectedFile.name}</Text>
                      <Text style={styles.fileMeta}>
                        {formatFileSize(selectedFile.size)}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => setSelectedFile(null)}
                      disabled={saving}
                      hitSlop={10}
                    >
                      <Text style={styles.removeFile}>Remove</Text>
                    </Pressable>
                  </View>
                ) : item.myAttachment ? (
                  <View style={styles.fileBox}>
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName}>
                        {item.myAttachment.name}
                      </Text>
                      <Text style={styles.fileMeta}>
                        Previously submitted attachment
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.noFile}>No file attached.</Text>
                )}

                <Button
                  title={
                    pickingFile
                      ? "Opening files..."
                      : selectedFile
                        ? "Choose a different file"
                        : "Attach a file"
                  }
                  onPress={handlePickFile}
                  loading={pickingFile}
                  disabled={pickingFile || saving || !canSubmit}
                  style={styles.attachButton}
                />

                {!online ? (
                  <Text style={styles.offline}>
                    Offline — submission is disabled until you reconnect.
                  </Text>
                ) : null}

                {canSubmit ? (
                  <Button
                    title={
                      item.status === "SUBMITTED"
                        ? "Update submission"
                        : "Submit assignment"
                    }
                    onPress={handleSubmit}
                    loading={saving}
                    disabled={!online || saving || pickingFile}
                    style={styles.submitButton}
                  />
                ) : null}

                <Text style={styles.disclaimer}>
                  Mock mode: the selected file is recorded locally in the demo
                  data. It is not uploaded to the school server.
                </Text>
              </>
            )}
          </Card>

          {history.length > 0 ? (
            <Card>
              <Text style={styles.sectionTitle}>Submission history</Text>

              {history.map((attempt, index) => (
                <View key={attempt.id} style={styles.historyItem}>
                  <View style={styles.historyTop}>
                    <Text style={styles.historyTitle}>Attempt {index + 1}</Text>
                    <Text style={styles.historyDate}>
                      {formatTimestamp(attempt.submittedAt)}
                    </Text>
                  </View>

                  {attempt.textContent ? (
                    <Text style={styles.historyText}>
                      {attempt.textContent}
                    </Text>
                  ) : null}

                  {attempt.attachment ? (
                    <Text style={styles.historyFile}>
                      Attachment: {attempt.attachment.name}
                    </Text>
                  ) : null}
                </View>
              ))}
            </Card>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 16 },
  back: {
    color: Brand.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: Brand.text,
  },
  subtitle: {
    marginTop: 7,
    fontSize: 13,
    color: Brand.textSecondary,
  },
  scoreMeta: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  metaText: { fontSize: 12, color: Brand.textSecondary },
  metaScore: {
    fontSize: 13,
    fontWeight: "800",
    color: Brand.success,
  },
  body: {
    marginTop: 12,
    fontSize: 14,
    color: Brand.text,
    lineHeight: 21,
  },
  successBox: {
    backgroundColor: Brand.successSoft,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  successText: {
    color: Brand.success,
    fontSize: 13,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Brand.text,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: Brand.textSecondary,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    minHeight: 130,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: Brand.text,
    backgroundColor: Brand.surface,
  },
  submission: {
    fontSize: 14,
    color: Brand.text,
    lineHeight: 21,
  },
  attachButton: { marginTop: 10 },
  submitButton: { marginTop: 14 },
  offline: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "600",
    color: Brand.warning,
  },
  disclaimer: {
    marginTop: 12,
    fontSize: 11,
    lineHeight: 16,
    color: Brand.textMuted,
  },
  fileBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
    backgroundColor: Brand.background,
  },
  existingFile: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: Brand.background,
  },
  fileInfo: { flex: 1 },
  fileName: {
    fontSize: 13,
    fontWeight: "700",
    color: Brand.text,
  },
  fileMeta: {
    marginTop: 4,
    fontSize: 11,
    color: Brand.textSecondary,
  },
  removeFile: {
    fontSize: 12,
    fontWeight: "700",
    color: Brand.danger,
  },
  noFile: {
    fontSize: 12,
    color: Brand.textMuted,
    paddingVertical: 8,
  },
  feedbackBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: Brand.successSoft,
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Brand.success,
    marginBottom: 6,
  },
  feedbackText: {
    fontSize: 13,
    lineHeight: 20,
    color: Brand.text,
  },
  historyItem: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
  },
  historyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Brand.text,
  },
  historyDate: {
    fontSize: 11,
    color: Brand.textSecondary,
  },
  historyText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: Brand.text,
  },
  historyFile: {
    marginTop: 6,
    fontSize: 12,
    color: Brand.primary,
    fontWeight: "600",
  },
});
