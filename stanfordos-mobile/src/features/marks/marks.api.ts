import { apiGet, apiPost } from "../../api/client";
import { API_ENDPOINTS } from "../../api/endpoints";
import type {
  ExamOption,
  MarksClassOption,
  MarksEntrySheet,
  SubjectOption,
} from "./types";

interface ExamDto {
  id: number;
  name: string;
  termId: number;
  termName: string;
}

interface TeachingAssignmentDto {
  id: number;
  subjectId: number;
  subjectName: string;
  classSectionId: number;
  classSectionName: string;
}

interface MarkSheetRowDto {
  studentId: number;
  studentName: string;
  markId: number | null;
  score: number | null;
  maxScore: number;
  grade: string | null;
}

interface StudentDto {
  id: number;
  firstName: string;
  lastName: string;
  admissionNumber?: string | null;
}

const numericId = (value: string) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid exam, subject, class or student ID.");
  }
  return id;
};

async function getTeachingAssignments() {
  return apiGet<TeachingAssignmentDto[]>(API_ENDPOINTS.TEACHER.MY_ASSIGNMENTS);
}

export const marksApiService = {
  async listExams(): Promise<ExamOption[]> {
    const exams = await apiGet<ExamDto[]>(API_ENDPOINTS.EXAMS.LIST);

    return exams.map((exam) => ({
      id: String(exam.id),
      name: exam.name,
      termName: exam.termName ?? "",
    }));
  },

  async listMyClasses(): Promise<MarksClassOption[]> {
    const [assignments, sections] = await Promise.all([
      getTeachingAssignments(),
      apiGet<
        {
          id: number;
          name: string;
          gradeLevelName?: string | null;
        }[]
      >(API_ENDPOINTS.CLASS_SECTIONS.LIST),
    ]);

    const sectionById = new Map(sections.map((s) => [s.id, s]));

    // One selectable item per class + subject pair.
    const unique = new Map<string, MarksClassOption>();

    for (const assignment of assignments) {
      const key = `${assignment.classSectionId}:${assignment.subjectId}`;
      if (unique.has(key)) continue;

      const section = sectionById.get(assignment.classSectionId);

      unique.set(key, {
        id: String(assignment.classSectionId),
        name: assignment.classSectionName || section?.name || "Class",
        gradeLevelName: section?.gradeLevelName ?? "",
        subjectId: String(assignment.subjectId),
        subjectName: assignment.subjectName,
      });
    }

    return [...unique.values()];
  },

  async listSubjects(): Promise<SubjectOption[]> {
    const assignments = await getTeachingAssignments();
    const subjects = new Map<number, string>();

    for (const assignment of assignments) {
      subjects.set(assignment.subjectId, assignment.subjectName);
    }

    return [...subjects.entries()].map(([id, name]) => ({
      id: String(id),
      name,
    }));
  },

  async getEntrySheet(params: {
    examId: string;
    subjectId: string;
    classSectionId: string;
  }): Promise<MarksEntrySheet> {
    const examId = numericId(params.examId);
    const subjectId = numericId(params.subjectId);
    const classSectionId = numericId(params.classSectionId);

    const assignments = await getTeachingAssignments();
    const isAssigned = assignments.some(
      (assignment) =>
        assignment.classSectionId === classSectionId &&
        assignment.subjectId === subjectId,
    );

    if (!isAssigned) {
      throw new Error(
        "You are not assigned to teach this subject in this class.",
      );
    }

    const [exams, classes, rows, students] = await Promise.all([
      apiGet<ExamDto[]>(API_ENDPOINTS.EXAMS.LIST),
      this.listMyClasses(),
      apiGet<MarkSheetRowDto[]>(API_ENDPOINTS.MARKS.ENTRY_SHEET, {
        examId,
        subjectId,
        classSectionId,
      }),
      apiGet<StudentDto[]>(API_ENDPOINTS.STUDENTS.LIST, {
        classSectionId,
      }),
    ]);

    const exam = exams.find((item) => item.id === examId);
    const selectedClass = classes.find(
      (item) =>
        item.id === String(classSectionId) &&
        item.subjectId === String(subjectId),
    );

    if (!exam || !selectedClass) {
      throw new Error("The selected exam, class or subject is unavailable.");
    }

    const studentsById = new Map(students.map((s) => [s.id, s]));

    const mappedRows = rows.map((row) => {
      const student = studentsById.get(row.studentId);

      return {
        studentId: String(row.studentId),
        admissionNumber: student?.admissionNumber ?? "",
        fullName:
          row.studentName ||
          `${student?.firstName ?? ""} ${student?.lastName ?? ""}`.trim(),
        score: row.score == null ? "" : String(row.score),
        maxScore: row.maxScore ?? 100,
      };
    });

    return {
      examId: String(exam.id),
      examName: exam.name,
      subjectId: String(subjectId),
      subjectName: selectedClass.subjectName,
      classSectionId: String(classSectionId),
      classSectionName: selectedClass.name,
      maxScore: mappedRows[0]?.maxScore ?? 100,
      rows: mappedRows,
    };
  },

  async saveEntrySheet(sheet: MarksEntrySheet): Promise<void> {
    const entries = sheet.rows
      .filter((row) => row.score.trim() !== "")
      .map((row) => {
        const score = Number(row.score);

        if (!Number.isFinite(score) || score < 0 || score > row.maxScore) {
          throw new Error(
            `Invalid score for ${row.fullName}. Use 0–${row.maxScore}.`,
          );
        }

        return {
          studentId: numericId(row.studentId),
          score,
          maxScore: row.maxScore,
        };
      });

    if (entries.length === 0) {
      throw new Error("Enter at least one score before saving.");
    }

    await apiPost(API_ENDPOINTS.MARKS.SAVE, {
      examId: numericId(sheet.examId),
      subjectId: numericId(sheet.subjectId),
      classSectionId: numericId(sheet.classSectionId),
      entries,
    });
  },
};
