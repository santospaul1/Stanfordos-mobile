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
  Button,
  EmptyState,
  ErrorBanner,
} from "../../../components/ui";
import { Brand } from "../../../constants/brand";
import { marksService } from "../../../features/marks/marks.service";
import type { ExamOption, MarksClassOption } from "../../../features/marks/types";

export default function MarksSetupScreen() {
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [classes, setClasses] = useState<MarksClassOption[]>([]);
  const [examId, setExamId] = useState<string | null>(null);
  const [classSectionId, setClassSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [e, c] = await Promise.all([
        marksService.listExams(),
        marksService.listMyClasses(),
      ]);
      setExams(e);
      setClasses(c);
      if (!examId && e[0]) setExamId(e[0].id);
      if (!classSectionId && c[0]) setClassSectionId(c[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load options.");
    } finally {
      setLoading(false);
    }
  }, [examId, classSectionId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const selectedClass = classes.find((c) => c.id === classSectionId);

  function openSheet() {
    if (!examId || !classSectionId || !selectedClass) {
      setError("Select an exam and a class.");
      return;
    }
    router.push({
      pathname: "/(teacher)/marks/entry",
      params: {
        examId,
        classSectionId: selectedClass.classSectionId ?? selectedClass.id,
        subjectId: selectedClass.subjectId,
      },
    } as never);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Marks entry</Text>
        <Text style={styles.subtitle}>
          Choose exam and class, then enter scores. Production API must enforce
          ownership checks before live marks are exposed.
        </Text>
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : exams.length === 0 || classes.length === 0 ? (
        <EmptyState
          title="Nothing to enter"
          description="No exams or classes available for marks entry."
        />
      ) : (
        <>
          <Text style={styles.section}>Exam</Text>
          <View style={styles.list}>
            {exams.map((exam) => {
              const active = exam.id === examId;
              return (
                <Card
                  key={exam.id}
                  onPress={() => setExamId(exam.id)}
                  style={active ? styles.activeCard : undefined}
                >
                  <Text style={styles.itemTitle}>{exam.name}</Text>
                  <Text style={styles.itemMeta}>
                    {exam.termName}
                    {exam.examDate ? ` · ${exam.examDate}` : ""}
                  </Text>
                </Card>
              );
            })}
          </View>

          <Text style={[styles.section, { marginTop: 22 }]}>Class</Text>
          <View style={styles.list}>
            {classes.map((cls) => {
              const active = cls.id === classSectionId;
              return (
                <Card
                  key={cls.id}
                  onPress={() => setClassSectionId(cls.id)}
                  style={active ? styles.activeCard : undefined}
                >
                  <Text style={styles.itemTitle}>{cls.name}</Text>
                  <Text style={styles.itemMeta}>
                    {cls.subjectName} · {cls.gradeLevelName}
                  </Text>
                </Card>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Button title="Open entry sheet" onPress={openSheet} />
          </View>
        </>
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
  section: { fontSize: 15, fontWeight: "700", color: Brand.text, marginBottom: 10 },
  list: { gap: 8 },
  activeCard: { borderColor: Brand.primary, backgroundColor: "#EFF6FF" },
  itemTitle: { fontSize: 15, fontWeight: "700", color: Brand.text },
  itemMeta: { marginTop: 3, fontSize: 12, color: Brand.textSecondary },
  footer: { marginTop: 24, marginBottom: 12 },
});
