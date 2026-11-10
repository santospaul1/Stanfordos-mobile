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

const SUB_COLORS = {
  NOT_SUBMITTED: { bg: "#F1F5F9", text: "#64748B" },
  SUBMITTED: { bg: Brand.warningSoft, text: Brand.warning },
  GRADED: { bg: Brand.successSoft, text: Brand.success },
} as const;

export default function AssignmentDetailScreen() {
  const params = useLocalSearchParams<{ assignmentId: string }>();
  const [gradeDrafts, setGradeDrafts] = useState<Record<string, string>>({});
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>(
    {},
  );
  const [savingGradeId, setSavingGradeId] = useState<string | null>(null);
  const assignmentId = Array.isArray(params.assignmentId)
    ? params.assignmentId[0]
    : params.assignmentId;

  const { online, requireOnline } = useOnline();

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [subs, setSubs] = useState<AssignmentSubmission[]>([]);
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!assignmentId) return;

    setError(null);
    setLoading(true);

    try {
      const [detail, submissions] = await Promise.all([
        assignmentsService.getById(assignmentId),
        assignmentsService.listSubmissions(assignmentId),
      ]);

      setAssignment(detail);
      setSubs(submissions);

      const nextGrades: Record<string, string> = {};
      const nextFeedback: Record<string, string> = {};

      submissions.forEach((submission) => {
        nextGrades[submission.id] =
          submission.score == null ? "" : String(submission.score);

        nextFeedback[submission.id] = submission.feedback ?? "";
      });

      setGrades(nextGrades);
      setFeedback(nextFeedback);
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

  const grade = async (submission: AssignmentSubmission) => {
    if (!assignment) return;

    setError(null);
    setSuccess(null);

    try {
      requireOnline();

      const scoreText = grades[submission.id] ?? "";
      const score = Number(scoreText);

      if (scoreText.trim() === "" || !Number.isInteger(score)) {
        throw new Error("Enter a whole-number grade.");
      }

      if (score < 0 || score > assignment.maxScore) {
        throw new Error(`Grade must be between 0 and ${assignment.maxScore}.`);
      }

      setSavingId(submission.id);

      const updated = await assignmentsService.gradeSubmission(
        submission.id,
        score,
        feedback[submission.id] ?? "",
      );

      setSubs((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );

      setSuccess(`Saved grade for ${submission.studentName}.`);
      {
        s.status !== "NOT_SUBMITTED" ? (
          <View style={styles.grading}>
            <Text style={styles.gradeLabel}>
              Grade (out of {assignment?.maxScore})
            </Text>

            <TextInput
              value={
                gradeDrafts[s.id] ?? (s.score !== null ? String(s.score) : "")
              }
              onChangeText={(value) =>
                setGradeDrafts((current) => ({
                  ...current,
                  [s.id]: value,
                }))
              }
              keyboardType="number-pad"
              placeholder="Enter score"
              style={styles.gradeInput}
            />

            <TextInput
              value={feedbackDrafts[s.id] ?? s.feedback ?? ""}
              onChangeText={(value) =>
                setFeedbackDrafts((current) => ({
                  ...current,
                  [s.id]: value,
                }))
              }
              placeholder="Feedback for student (optional)"
              multiline
              style={[styles.gradeInput, { minHeight: 70 }]}
            />

            <Button
              title={s.status === "GRADED" ? "Update grade" : "Save grade"}
              onPress={() => saveGrade(s)}
              loading={savingGradeId === s.id}
              disabled={savingGradeId !== null && savingGradeId !== s.id}
            />
          </View>
        ) : null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save grade.");
    } finally {
      setSavingId(null);
    }
  };

  async function saveGrade(submission: AssignmentSubmission) {
    if (!assignment) return;

    const rawGrade =
      gradeDrafts[submission.id] ??
      (submission.score !== null ? String(submission.score) : "");

    const grade = Number(rawGrade);

    if (
      rawGrade.trim() === "" ||
      !Number.isInteger(grade) ||
      grade < 0 ||
      grade > assignment.maxScore
    ) {
      setError(
        `Enter a whole-number grade between 0 and ${assignment.maxScore}.`,
      );
      return;
    }

    setError(null);
    setSavingGradeId(submission.id);

    try {
      const updated = await assignmentsService.gradeSubmission(
        submission.id,
        grade,
        feedbackDrafts[submission.id] ?? submission.feedback ?? "",
      );

      setSubs((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the grade.");
    } finally {
      setSavingGradeId(null);
    }
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} hitSlop={10}>
        <Text style={styles.back}>‹ Assignments</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator color={Brand.primary} />
      ) : assignment ? (
        <Card style={styles.assignmentCard}>
          <Text style={styles.title}>{assignment.title}</Text>
          <Text style={styles.subtitle}>{assignment.courseName}</Text>

          <View style={styles.metadata}>
            <Text style={styles.subtitle}>
              {assignment.courseName}
              {assignment.classSectionName
                ? ` · ${assignment.classSectionName}`
                : ""}
            </Text>

            <Text style={styles.subtitle}>
              {assignment.dueDate
                ? `Due ${new Date(assignment.dueDate).toLocaleDateString()}`
                : "No due date"}
              {" · "}
              Maximum score: {assignment.maxScore}
            </Text>

            <Text style={styles.body}>
              {assignment.description || "No description provided."}
            </Text>
          </View>

          {assignment.description ? (
            <Text style={styles.description}>{assignment.description}</Text>
          ) : null}

          <Text style={styles.meta}>{subs.length} submitted</Text>
        </Card>
      ) : null}

      {error ? <ErrorBanner message={error} /> : null}

      {success ? <Text style={styles.success}>{success}</Text> : null}

      {!online ? (
        <ErrorBanner message="You are offline. Viewing is available, but grading requires an internet connection." />
      ) : null}

      <Text style={styles.section}>Student submissions</Text>

      {s.textContent ? (
        <Text style={styles.meta}>Submission: {s.textContent}</Text>
      ) : null}

      {s.fileUrl ? (
        <Pressable
          onPress={() => {
            import("react-native").then(({ Linking }) =>
              Linking.openURL(s.fileUrl!),
            );
          }}
        >
          <Text style={{ color: Brand.primary, marginTop: 8 }}>
            View submitted file
          </Text>
        </Pressable>
      ) : null}

      {s.feedback ? (
        <Text style={styles.meta}>Feedback: {s.feedback}</Text>
      ) : null}

      {!loading && subs.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          description="Submitted work will appear here."
        />
      ) : (
        <View style={styles.list}>
          {subs.map((submission) => {
            const colors = SUB_COLORS[submission.status];

            return (
              <Card key={submission.id} style={styles.submissionCard}>
                <View style={styles.studentHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>
                      {submission.studentName}
                    </Text>
                    {s.admissionNumber ? (
                      <Text style={styles.meta}>{s.admissionNumber}</Text>
                    ) : null}
                    {submission.submittedAt ? (
                      <Text style={styles.meta}>
                        Submitted:{" "}
                        {new Date(submission.submittedAt).toLocaleString()}
                      </Text>
                    ) : null}
                  </View>

                  <Badge
                    label={
                      submission.status === "GRADED" && submission.score != null
                        ? `${submission.score}/${assignment?.maxScore ?? ""}`
                        : submission.status.replace("_", " ")
                    }
                    backgroundColor={colors.bg}
                    textColor={colors.text}
                  />
                </View>

                {submission.textContent ? (
                  <View style={styles.submissionContent}>
                    <Text style={styles.contentLabel}>Student response</Text>
                    <Text style={styles.contentText}>
                      {submission.textContent}
                    </Text>
                  </View>
                ) : null}

                {submission.fileUrl ? (
                  <Pressable
                    onPress={() => Linking.openURL(submission.fileUrl!)}
                    style={styles.fileLink}
                  >
                    <Text style={styles.fileLinkText}>
                      Open submitted attachment ↗
                    </Text>
                  </Pressable>
                ) : null}

                {submission.status !== "NOT_SUBMITTED" ? (
                  <View style={styles.grading}>
                    <Text style={styles.inputLabel}>
                      Grade (out of {assignment?.maxScore ?? 100})
                    </Text>

                    <TextInput
                      value={grades[submission.id] ?? ""}
                      onChangeText={(value) =>
                        setGrades((current) => ({
                          ...current,
                          [submission.id]: value,
                        }))
                      }
                      placeholder="Enter score"
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
                      placeholder="Feedback for the student..."
                      multiline
                      textAlignVertical="top"
                      style={[styles.input, styles.feedbackInput]}
                    />

                    {submission.feedback ? (
                      <Text style={styles.previousFeedback}>
                        Previously saved feedback: {submission.feedback}
                      </Text>
                    ) : null}

                    <Button
                      title={
                        submission.status === "GRADED"
                          ? "Update grade"
                          : "Save grade"
                      }
                      onPress={() => grade(submission)}
                      loading={savingId === submission.id}
                      disabled={!online || savingId !== null}
                    />
                  </View>
                ) : null}
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    color: Brand.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  assignmentCard: { marginBottom: 20 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Brand.text,
  },
  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: Brand.textSecondary,
  },
  metadata: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 12,
  },
  meta: {
    marginTop: 5,
    fontSize: 12,
    color: Brand.textSecondary,
  },
  description: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 21,
    color: Brand.text,
  },
  section: {
    fontSize: 18,
    fontWeight: "800",
    color: Brand.text,
    marginBottom: 12,
  },
  list: { gap: 12 },
  submissionCard: { gap: 8 },
  studentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "800",
    color: Brand.text,
  },
  submissionContent: {
    backgroundColor: Brand.background,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  contentLabel: {
    color: Brand.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
  },
  contentText: {
    color: Brand.text,
    fontSize: 13,
    lineHeight: 20,
  },
  fileLink: { paddingVertical: 8 },
  fileLinkText: {
    color: Brand.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  grading: {
    borderTopWidth: 1,
    borderTopColor: Brand.border,
    paddingTop: 14,
    marginTop: 8,
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Brand.textSecondary,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: Brand.text,
    backgroundColor: Brand.surface,
  },
  feedbackInput: {
    minHeight: 90,
    paddingTop: 12,
  },
  previousFeedback: {
    fontSize: 12,
    color: Brand.textSecondary,
    lineHeight: 18,
  },
  success: {
    color: Brand.success,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
  },

  grading: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
    gap: 9,
  },
  gradeLabel: {
    color: Brand.text,
    fontSize: 13,
    fontWeight: "700",
  },
  gradeInput: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Brand.text,
    backgroundColor: Brand.surface,
  },
});
