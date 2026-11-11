import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Linking,
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
  Badge,
  Button,
  EmptyState,
  ErrorBanner,
} from "../../../components/ui";
import { Brand } from "../../../constants/brand";
import { assignmentsService } from "../../../features/assignments/assignments.service";
import { useOnline } from "../../../hooks/use-online";
import type {
  AssignmentDetail,
  AssignmentSubmission,
} from "../../../features/assignments/types";

const SUBMISSION_COLORS = {
  NOT_SUBMITTED: {
    backgroundColor: "#F1F5F9",
    textColor: "#64748B",
  },
  SUBMITTED: {
    backgroundColor: Brand.warningSoft,
    textColor: Brand.warning,
  },
  GRADED: {
    backgroundColor: Brand.successSoft,
    textColor: Brand.success,
  },
} as const;

export default function AssignmentDetailScreen() {
  const params = useLocalSearchParams<{ assignmentId: string }>();
  const assignmentId = Array.isArray(params.assignmentId)
    ? params.assignmentId[0]
    : params.assignmentId;

  const { online, requireOnline } = useOnline();

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!assignmentId) {
      setError("Assignment ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [detail, rows] = await Promise.all([
        assignmentsService.getById(assignmentId),
        assignmentsService.listSubmissions(assignmentId),
      ]);

      setAssignment(detail);
      setSubmissions(rows);

      const nextGrades: Record<string, string> = {};
      const nextFeedback: Record<string, string> = {};

      rows.forEach((row) => {
        nextGrades[row.id] = row.score === null ? "" : String(row.score);
        nextFeedback[row.id] = row.feedback ?? "";
      });

      setGrades(nextGrades);
      setFeedback(nextFeedback);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not load this assignment.",
      );
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const saveGrade = async (submission: AssignmentSubmission) => {
    if (!assignment) return;

    setError(null);
    setSuccess(null);

    try {
      requireOnline();

      const rawGrade = grades[submission.id] ?? "";
      const grade = Number(rawGrade);

      if (
        rawGrade.trim() === "" ||
        !Number.isInteger(grade) ||
        grade < 0 ||
        grade > assignment.maxScore
      ) {
        throw new Error(
          `Enter a whole-number grade between 0 and ${assignment.maxScore}.`,
        );
      }

      setSavingId(submission.id);

      const updated = await assignmentsService.gradeSubmission(
        submission.id,
        grade,
        feedback[submission.id] ?? "",
      );

      setSubmissions((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );

      setGrades((current) => ({
        ...current,
        [updated.id]: updated.score === null ? "" : String(updated.score),
      }));

      setFeedback((current) => ({
        ...current,
        [updated.id]: updated.feedback ?? "",
      }));

      setSuccess(`Grade saved for ${submission.studentName}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the grade.");
    } finally {
      setSavingId(null);
    }
  };

  const openAttachment = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      setError("Could not open the submitted attachment.");
    }
  };

  return (
    <Screen>
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        style={styles.backButton}
      >
        <Text style={styles.back}>‹ Assignments</Text>
      </Pressable>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : assignment ? (
        <Card style={styles.assignmentCard}>
          <Text style={styles.title}>{assignment.title}</Text>

          <Text style={styles.course}>
            {assignment.courseName}
            {assignment.classSectionName
              ? ` · ${assignment.classSectionName}`
              : ""}
          </Text>

          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Due date</Text>
              <Text style={styles.metadataValue}>
                {assignment.dueDate
                  ? new Date(assignment.dueDate).toLocaleDateString()
                  : "Not set"}
              </Text>
            </View>

            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Maximum score</Text>
              <Text style={styles.metadataValue}>{assignment.maxScore}</Text>
            </View>

            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Submissions</Text>
              <Text style={styles.metadataValue}>
                {
                  submissions.filter((item) => item.status !== "NOT_SUBMITTED")
                    .length
                }
              </Text>
            </View>
          </View>

          <Text style={styles.description}>
            {assignment.description || "No instructions provided."}
          </Text>
        </Card>
      ) : (
        <EmptyState
          title="Assignment unavailable"
          description={error ?? "This assignment could not be found."}
          actionLabel="Retry"
          onAction={load}
        />
      )}

      {error ? <ErrorBanner message={error} /> : null}

      {success ? <Text style={styles.success}>{success}</Text> : null}

      {!online ? (
        <ErrorBanner message="You are offline. You can view submissions, but grading requires an internet connection." />
      ) : null}

      {assignment ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Student submissions</Text>
            <Text style={styles.sectionCount}>
              {submissions.length} records
            </Text>
          </View>

          {!loading && submissions.length === 0 ? (
            <EmptyState
              title="No submissions yet"
              description="Student submissions will appear here."
            />
          ) : (
            <View style={styles.list}>
              {submissions.map((submission) => {
                const colors = SUBMISSION_COLORS[submission.status];
                const isSaving = savingId === submission.id;
                const canGrade = submission.status !== "NOT_SUBMITTED";

                return (
                  <Card key={submission.id} style={styles.submissionCard}>
                    <View style={styles.studentHeader}>
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>
                          {submission.studentName}
                        </Text>

                        {submission.admissionNumber ? (
                          <Text style={styles.meta}>
                            {submission.admissionNumber}
                          </Text>
                        ) : null}

                        {submission.submittedAt ? (
                          <Text style={styles.meta}>
                            Submitted{" "}
                            {new Date(submission.submittedAt).toLocaleString()}
                          </Text>
                        ) : null}
                      </View>

                      <Badge
                        label={
                          submission.status === "GRADED" &&
                          submission.score !== null
                            ? `${submission.score}/${assignment.maxScore}`
                            : submission.status.replace("_", " ")
                        }
                        backgroundColor={colors.backgroundColor}
                        textColor={colors.textColor}
                      />
                    </View>

                    {submission.textContent ? (
                      <View style={styles.response}>
                        <Text style={styles.responseLabel}>
                          Student response
                        </Text>
                        <Text style={styles.responseText}>
                          {submission.textContent}
                        </Text>
                      </View>
                    ) : null}

                    {submission.fileUrl ? (
                      <Pressable
                        onPress={() => openAttachment(submission.fileUrl!)}
                        style={styles.attachment}
                      >
                        <Text style={styles.attachmentText}>
                          Open submitted attachment ↗
                        </Text>
                      </Pressable>
                    ) : null}

                    {submission.feedback ? (
                      <Text style={styles.previousFeedback}>
                        Previous feedback: {submission.feedback}
                      </Text>
                    ) : null}

                    {canGrade ? (
                      <View style={styles.grading}>
                        <Text style={styles.inputLabel}>
                          Grade out of {assignment.maxScore}
                        </Text>

                        <TextInput
                          value={grades[submission.id] ?? ""}
                          onChangeText={(value) =>
                            setGrades((current) => ({
                              ...current,
                              [submission.id]: value,
                            }))
                          }
                          placeholder="Enter grade"
                          keyboardType="number-pad"
                          style={styles.input}
                        />

                        <Text style={styles.inputLabel}>Feedback</Text>

                        <TextInput
                          value={feedback[submission.id] ?? ""}
                          onChangeText={(value) =>
                            setFeedback((current) => ({
                              ...current,
                              [submission.id]: value,
                            }))
                          }
                          placeholder="Write feedback for the student..."
                          multiline
                          textAlignVertical="top"
                          style={[styles.input, styles.feedbackInput]}
                        />

                        <Button
                          title={
                            submission.status === "GRADED"
                              ? "Update grade"
                              : "Save grade"
                          }
                          onPress={() => saveGrade(submission)}
                          loading={isSaving}
                          disabled={!online || savingId !== null}
                        />
                      </View>
                    ) : (
                      <Text style={styles.notSubmitted}>
                        This student has not submitted this assignment.
                      </Text>
                    )}
                  </Card>
                );
              })}
            </View>
          )}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginBottom: 16,
  },
  back: {
    color: Brand.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  loading: {
    paddingVertical: 48,
    alignItems: "center",
  },
  assignmentCard: {
    marginBottom: 22,
  },
  title: {
    color: Brand.text,
    fontSize: 22,
    fontWeight: "800",
  },
  course: {
    color: Brand.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
  metadata: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    marginTop: 20,
  },
  metadataItem: {
    minWidth: 85,
  },
  metadataLabel: {
    color: Brand.textMuted,
    fontSize: 11,
  },
  metadataValue: {
    color: Brand.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  description: {
    color: Brand.text,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: Brand.text,
    fontSize: 18,
    fontWeight: "800",
  },
  sectionCount: {
    color: Brand.textSecondary,
    fontSize: 12,
  },
  list: {
    gap: 12,
  },
  submissionCard: {
    gap: 10,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    color: Brand.text,
    fontSize: 15,
    fontWeight: "800",
  },
  meta: {
    color: Brand.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  response: {
    backgroundColor: Brand.background,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },
  responseLabel: {
    color: Brand.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
  },
  responseText: {
    color: Brand.text,
    fontSize: 13,
    lineHeight: 20,
  },
  attachment: {
    paddingVertical: 8,
  },
  attachmentText: {
    color: Brand.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  previousFeedback: {
    color: Brand.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  grading: {
    borderTopWidth: 1,
    borderTopColor: Brand.border,
    paddingTop: 14,
    marginTop: 6,
    gap: 9,
  },
  inputLabel: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Brand.text,
    backgroundColor: Brand.surface,
  },
  feedbackInput: {
    minHeight: 90,
  },
  notSubmitted: {
    color: Brand.textMuted,
    fontSize: 12,
    fontStyle: "italic",
  },
  success: {
    color: Brand.success,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
  },
});
