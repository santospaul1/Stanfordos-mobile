export interface ExamOption {
  id: string;
  name: string;
  termName: string;
  examDate?: string | null;
}

export interface SubjectOption {
  id: string;
  name: string;
}

export interface MarksClassOption {
  id: string;
  name: string;
  gradeLevelName: string;
  subjectId: string;
  subjectName: string;
}

export interface MarksEntryRow {
  studentId: string;
  admissionNumber: string;
  fullName: string;
  score: string; // keep as string while editing
  maxScore: number;
  remark?: string;
}

export interface MarksEntrySheet {
  examId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  classSectionId: string;
  classSectionName: string;
  maxScore: number;
  rows: MarksEntryRow[];
}
