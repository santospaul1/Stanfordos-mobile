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
import { announcementsService } from "../../../features/announcements/announcements.service";
import type { AnnouncementItem } from "../../../features/announcements/types";
import type { TeacherCourse } from "../../../features/assignments/types";
import { useOnline } from "../../../hooks/use-online";

export default function TeacherAnnouncementsScreen() {
  const { online, requireOnline } = useOnline();

  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [courseId, setCourseId] = useState("");

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showComposer, setShowComposer] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const [announcements, teacherCourses] = await Promise.all([
        announcementsService.listForTeacher(),
        announcementsService.listMyCourses(),
      ]);

      setItems(announcements);
      setCourses(teacherCourses);

      if (
        teacherCourses.length > 0 &&
        !teacherCourses.some((course) => course.id === courseId)
      ) {
        setCourseId(teacherCourses[0].id);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load announcements.",
      );
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handlePost() {
    setError(null);

    try {
      requireOnline();

      if (!title.trim() || !body.trim()) {
        throw new Error("Enter both a title and a message.");
      }

      const selectedCourse = courses.find((course) => course.id === courseId);

      if (!selectedCourse) {
        throw new Error("Select one of your courses.");
      }

      setPosting(true);

      const created = await announcementsService.create({
        title,
        body,
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
      });

      setItems((current) => [created, ...current]);
      setTitle("");
      setBody("");
      setShowComposer(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not post announcement.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>

        <View style={styles.titleRow}>
          <Text style={styles.title}>Announcements</Text>

          <Pressable onPress={() => setShowComposer((value) => !value)}>
            <Text style={styles.link}>{showComposer ? "Cancel" : "New"}</Text>
          </Pressable>
        </View>

        <Text style={styles.subtitle}>
          Share updates with students enrolled in your courses.
        </Text>
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {!online ? (
        <ErrorBanner message="You are offline. Announcements can only be posted while connected." />
      ) : null}

      {showComposer ? (
        <Card style={styles.composer}>
          <Text style={styles.label}>Post to course</Text>

          {courses.length === 0 ? (
            <Text style={styles.emptyCourse}>
              You do not have any courses available for announcements.
            </Text>
          ) : (
            <View style={styles.courseList}>
              {courses.map((course) => {
                const selected = course.id === courseId;

                return (
                  <Pressable
                    key={course.id}
                    onPress={() => setCourseId(course.id)}
                  >
                    <View
                      style={[
                        styles.courseOption,
                        selected && styles.courseSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.courseText,
                          selected && styles.courseTextSelected,
                        ]}
                      >
                        {course.title}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Announcement title"
            maxLength={150}
          />

          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={body}
            onChangeText={setBody}
            placeholder="Write your message"
            multiline
            textAlignVertical="top"
          />

          <Button
            title="Post announcement"
            onPress={handlePost}
            loading={posting}
            disabled={!online || posting || courses.length === 0}
          />
        </Card>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          title="No announcements"
          description="Course and school notices will appear here."
          actionLabel="Create announcement"
          onAction={() => setShowComposer(true)}
        />
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <Card key={item.id}>
              <Text style={styles.itemTitle}>{item.title}</Text>

              <Text style={styles.itemMeta}>
                {item.authorName}
                {" · "}
                {item.courseTitle ??
                  item.classSectionName ??
                  item.audience ??
                  "Announcement"}
              </Text>

              <Text style={styles.itemBody}>{item.body}</Text>

              <Text style={styles.itemDate}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 18 },
  back: {
    color: Brand.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Brand.text,
  },
  link: {
    color: Brand.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: Brand.textSecondary,
    lineHeight: 20,
  },
  composer: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: Brand.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: Brand.text,
    marginBottom: 12,
    backgroundColor: Brand.surface,
  },
  textarea: { minHeight: 100 },
  courseList: { gap: 8 },
  courseOption: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.surface,
  },
  courseSelected: {
    borderColor: Brand.primary,
    backgroundColor: Brand.primarySoft,
  },
  courseText: {
    color: Brand.text,
    fontSize: 13,
    fontWeight: "600",
  },
  courseTextSelected: { color: Brand.primary },
  emptyCourse: {
    color: Brand.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  center: { paddingVertical: 48, alignItems: "center" },
  list: { gap: 10 },
  itemTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Brand.text,
  },
  itemMeta: {
    marginTop: 5,
    fontSize: 12,
    color: Brand.textSecondary,
  },
  itemBody: {
    marginTop: 10,
    fontSize: 14,
    color: Brand.text,
    lineHeight: 21,
  },
  itemDate: {
    marginTop: 10,
    fontSize: 11,
    color: Brand.textMuted,
  },
});
