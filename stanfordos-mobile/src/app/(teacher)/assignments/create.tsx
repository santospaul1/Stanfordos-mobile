import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import {
  Screen,
  Card,
  Button,
  EmptyState,
  ErrorBanner,
} from "../../../components/ui";
import { Brand } from "../../../constants/brand";
import { assignmentsService } from "../../../features/assignments/assignments.service";
import type { TeacherCourse } from "../../../features/assignments/types";

export default function CreateAssignmentScreen() {
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState("100");

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    setLoadingCourses(true);
    setError(null);

    try {
      const data = await assignmentsService.listMyCourses();
      setCourses(data);

      if (data.length > 0 && !courseId) {
        setCourseId(data[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your courses.");
    } finally {
      setLoadingCourses(false);
    }
  }, [courseId]);

  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [loadCourses]),
  );

  const save = async () => {
    setError(null);

    const parsedMaxScore = Number(maxScore);

    if (!courseId) {
      setError("Select a course.");
      return;
    }

    if (!title.trim()) {
      setError("Enter an assignment title.");
      return;
    }

    if (!Number.isInteger(parsedMaxScore) || parsedMaxScore <= 0) {
      setError("Maximum score must be a positive whole number.");
      return;
    }

    if (dueDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate.trim())) {
      setError("Enter the due date as YYYY-MM-DD.");
      return;
    }

    setSaving(true);

    try {
      const created = await assignmentsService.create({
        courseId,
        title,
        description,
        dueDate: dueDate.trim(),
        maxScore: parsedMaxScore,
      });

      router.replace(`/(teacher)/assignments/${created.id}` as never);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create assignment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()} hitSlop={10}>
        <Text style={styles.back}>‹ Assignments</Text>
      </Pressable>

      <Text style={styles.title}>Create assignment</Text>
      <Text style={styles.subtitle}>
        Add an assignment to one of your courses.
      </Text>

      {error ? <ErrorBanner message={error} /> : null}

      <Text style={styles.label}>Course</Text>

      {loadingCourses ? (
        <ActivityIndicator color={Brand.primary} />
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses available"
          description="You need an existing course before creating an assignment."
        />
      ) : (
        <View style={styles.courseList}>
          {courses.map((course) => {
            const selected = course.id === courseId;

            return (
              <Pressable key={course.id} onPress={() => setCourseId(course.id)}>
                <Card
                  style={[styles.courseCard, selected && styles.selectedCourse]}
                >
                  <Text
                    style={[
                      styles.courseName,
                      selected && { color: Brand.primary },
                    ]}
                  >
                    {course.title}
                  </Text>
                  {course.description ? (
                    <Text style={styles.courseDescription}>
                      {course.description}
                    </Text>
                  ) : null}
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
        placeholder="e.g. Algebra worksheet"
        style={styles.input}
        maxLength={150}
      />

      <Text style={styles.label}>Instructions / description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Explain the work students should complete..."
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
        autoCapitalize="none"
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
        onPress={save}
        loading={saving}
        disabled={loadingCourses || courses.length === 0}
        style={styles.saveButton}
      />
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
  title: {
    color: Brand.text,
    fontSize: 25,
    fontWeight: "800",
  },
  subtitle: {
    color: Brand.textSecondary,
    marginTop: 6,
    marginBottom: 20,
    fontSize: 14,
  },
  label: {
    color: Brand.text,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    backgroundColor: Brand.surface,
    borderRadius: 12,
    minHeight: 50,
    paddingHorizontal: 14,
    color: Brand.text,
    fontSize: 14,
  },
  multiline: {
    minHeight: 110,
    paddingTop: 12,
  },
  courseList: { gap: 8 },
  courseCard: { borderWidth: 1 },
  selectedCourse: {
    borderColor: Brand.primary,
    backgroundColor: Brand.primarySoft,
  },
  courseName: {
    color: Brand.text,
    fontWeight: "700",
    fontSize: 14,
  },
  courseDescription: {
    color: Brand.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: { marginTop: 24, marginBottom: 30 },
});
