import type {
  ExamOption,
  MarksClassOption,
  MarksEntryRow,
  MarksEntrySheet,
  SubjectOption,
} from "./types";

const EXAMS: ExamOption[] = [
  { id: "ex-1", name: "Mid-Term Exam", termName: "Term 2 2026", examDate: "2026-11-15" },
  { id: "ex-2", name: "End of Term", termName: "Term 2 2026", examDate: "2026-12-05" },
  { id: "ex-3", name: "CAT 3", termName: "Term 2 2026", examDate: "2026-11-01" },
];

const SUBJECTS: SubjectOption[] = [
  { id: "sub-math", name: "Mathematics" },
  { id: "sub-phy", name: "Physics" },
  { id: "sub-hist", name: "History" },
];

const CLASSES: MarksClassOption[] = [
  { id: "cs-1", name: "Form 1A", gradeLevelName: "Form 1", subjectId: "sub-math", subjectName: "Mathematics" },
  { id: "cs-2", name: "Form 2B", gradeLevelName: "Form 2", subjectId: "sub-math", subjectName: "Mathematics" },
  { id: "cs-3", name: "Form 3 Science", gradeLevelName: "Form 3", subjectId: "sub-phy", subjectName: "Physics" },
  { id: "cs-4", name: "Form 4 Arts", gradeLevelName: "Form 4", subjectId: "sub-hist", subjectName: "History" },
];

const NAMES = [
  "Amina Okello", "Brian Wanjiku", "Cynthia Otieno", "Daniel Kamau",
  "Esther Njeri", "Felix Ouma", "Grace Achieng", "Hassan Mwangi",
  "Irene Chebet", "James Kiprop", "Karen Mutiso", "Leo Barasa",
  "Mary Atieno", "Nathan Kiplagat", "Olivia Wambui", "Peter Ochieng",
  "Queenie Moraa", "Ryan Kimani", "Sarah Naliaka", "Timothy Odhiambo",
  "Ursula Akinyi", "Victor Cheruiyot", "Winnie Nyambura", "Xavier Mutua",
  "Yvonne Jepchirchir", "Zuri Adhiambo", "Alex Maina", "Brenda Cherono",
  "Collins Onyango", "Diana Wairimu", "Edwin Kiprotich", "Faith Nekesa",
];

const sheets = new Map<string, MarksEntrySheet>();

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function key(examId: string, subjectId: string, classSectionId: string) {
  return `${examId}:${subjectId}:${classSectionId}`;
}

function defaultRows(count: number, maxScore: number): MarksEntryRow[] {
  return NAMES.slice(0, count).map((fullName, i) => ({
    studentId: `s-${i + 1}`,
    admissionNumber: `ADM${String(i + 1).padStart(4, "0")}`,
    fullName,
    score: "",
    maxScore,
  }));
}

export const mockMarksService = {
  async listExams(): Promise<ExamOption[]> {
    await delay(300);
    return EXAMS.map((e) => ({ ...e }));
  },

  async listMyClasses(): Promise<MarksClassOption[]> {
    await delay(300);
    return CLASSES.map((c) => ({ ...c }));
  },

  async listSubjects(): Promise<SubjectOption[]> {
    await delay(200);
    return SUBJECTS.map((s) => ({ ...s }));
  },

  async getEntrySheet(params: {
    examId: string;
    subjectId: string;
    classSectionId: string;
  }): Promise<MarksEntrySheet> {
    await delay(500);
    const k = key(params.examId, params.subjectId, params.classSectionId);
    const existing = sheets.get(k);
    if (existing) {
      return {
        ...existing,
        rows: existing.rows.map((r) => ({ ...r })),
      };
    }

    const exam = EXAMS.find((e) => e.id === params.examId);
    const cls = CLASSES.find((c) => c.id === params.classSectionId);
    const subject = SUBJECTS.find((s) => s.id === params.subjectId);
    if (!exam || !cls || !subject) {
      throw new Error("Invalid exam, class or subject selection.");
    }

    const maxScore = 100;
    const sheet: MarksEntrySheet = {
      examId: exam.id,
      examName: exam.name,
      subjectId: subject.id,
      subjectName: subject.name,
      classSectionId: cls.id,
      classSectionName: cls.name,
      maxScore,
      rows: defaultRows(cls.name.includes("1") ? 32 : cls.name.includes("2") ? 28 : 24, maxScore),
    };
    sheets.set(k, sheet);
    return { ...sheet, rows: sheet.rows.map((r) => ({ ...r })) };
  },

  /**
   * Online-only. Validates scores client-side before "saving".
   * Real API must still enforce ownership (MOB-BE-02) before production.
   */
  async saveEntrySheet(sheet: MarksEntrySheet): Promise<void> {
    await delay(700);
    for (const row of sheet.rows) {
      if (row.score.trim() === "") continue;
      const n = Number(row.score);
      if (Number.isNaN(n) || n < 0 || n > sheet.maxScore) {
        throw new Error(
          `Invalid score for ${row.fullName}. Use 0–${sheet.maxScore}.`
        );
      }
    }
    const k = key(sheet.examId, sheet.subjectId, sheet.classSectionId);
    sheets.set(k, {
      ...sheet,
      rows: sheet.rows.map((r) => ({ ...r })),
    });
  },
};
