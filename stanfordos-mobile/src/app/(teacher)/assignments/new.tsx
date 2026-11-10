import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

import { Screen, Card, Button, ErrorBanner } from "../../../components/ui";
import { Brand } from "../../../constants/brand";
import { assignmentsService } from "../../../features/assignments/assignments.service";
import type { TeacherCourseOption } from "../../../features/assignments/types";

export default function NewAssignmentScreen() {
  const [courses, setCourses] = useState<TeacherCourseOption[]>([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState("100");

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    assignmentsService
      .listMyCourses()
      .then((result) => {
        if (!active) return;
        setCourses(result);
        if (result.length > 0) setCourseId(result[0].id);
      })
      .catch((e) => {
        if (active) {
          setError(
            e instanceof Error ? e.message : "Could not load your courses.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingCourses(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function submit() {
    setError(null);

    const trimmedTitle = title.trim();
    const score = Number(maxScore);

    if (!courseId) {
      setError("Select a course.");
      return;
    }

    if (!trimmedTitle) {
      setError("Enter an assignment title.");
      return;
    }

    if (!Number.isInteger(score) || score <= 0) {
      setError("Maximum score must be a positive whole number.");
      return;
    }

    let dueDateIso: string | null = null;

    if (dueDate.trim()) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate.trim())) {
        setError("Enter the due date as YYYY-MM-DD.");
        return;
      }

      const parsed = new Date(`${dueDate.trim()}T23:59:00`);

      if (
        Number.isNaN(parsed.getTime()) ||
        parsed.toISOString().slice(0, 10) !== dueDate.trim()
      ) {
        setError("Enter a valid due date.");
        return;
      }

      dueDateIso = parsed.toISOString();
    }

    setSaving(true);

    try {
      const created = await assignmentsService.create(courseId, {
        title: trimmedTitle,
        description: description.trim(),
        dueDate: dueDateIso,
        maxScore: score,
      });

      router.replace(`/(teacher)/assignments/${created.id}` as never);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not create the assignment.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} hitSlop={10}>
        <Text style={styles.back}>‹ Assignments</Text>
      </Pressable>

      <Text style={styles.title}>Create assignment</Text>
      <Text style={styles.subtitle}>Add work for one of your courses.</Text>

      {error ? <ErrorBanner message={error} /> : null}

      <Text style={styles.label}>Course</Text>

      {loadingCourses ? (
        <ActivityIndicator color={Brand.primary} />
      ) : courses.length === 0 ? (
        <Card>
          <Text style={styles.help}>
            No courses are available for your teacher account.
          </Text>
        </Card>
      ) : (
        <View style={styles.courseList}>
          {courses.map((course) => {
            const selected = course.id === courseId;

            return (
              <Pressable key={course.id} onPress={() => setCourseId(course.id)}>
                <Card
                  style={{
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? Brand.primary : Brand.border,
                  }}
                >
                  <Text style={styles.courseName}>
                    {selected ? "✓  " : ""}
                    {course.title}
                  </Text>
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}

      <Text style={styles.label}>Assignment title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Algebra exercises"
        style={styles.input}
        maxLength={160}
      />

      <Text style={styles.label}>Instructions</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the work students should complete"
        style={[styles.input, styles.multiline]}
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.label}>Due date (optional)</Text>
      <TextInput
        value={dueDate}
        onChangeText={setDueDate}
        placeholder="YYYY-MM-DD"
        style={styles.input}
        keyboardType="numbers-and-punctuation"
      />

      <Text style={styles.label}>Maximum score</Text>
      <TextInput
        value={maxScore}
        onChangeText={setMaxScore}
        placeholder="100"
        style={styles.input}
        keyboardType="number-pad"
      />

      <Button
        title="Create assignment"
        onPress={submit}
        loading={saving}
        disabled={loadingCourses || courses.length === 0}
        style={styles.submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    color: Brand.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 18,
  },
  title: {
    color: Brand.text,
    fontSize: 25,
    fontWeight: "800",
  },
  subtitle: {
    color: Brand.textSecondary,
    marginTop: 6,
    marginBottom: 20,
  },
  label: {
    color: Brand.text,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: Brand.text,
    backgroundColor: Brand.surface,
  },
  multiline: {
    minHeight: 110,
    paddingTop: 12,
  },
  courseList: {
    gap: 8,
  },
  courseName: {
    color: Brand.text,
    fontWeight: "700",
  },
  help: {
    color: Brand.textSecondary,
  },
  submit: {
    marginTop: 24,
    marginBottom: 32,
  },
});
