export type AssignmentStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export interface AssignmentSummary {
  id: string;
  title: string;
  courseName: string;
  classSectionName: string;
  dueDate: string;
  maxScore: number;
  status: AssignmentStatus;
  submissionCount: number;
  studentCount: number;
}

export interface AssignmentDetail extends AssignmentSummary {
  description: string;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  submittedAt: string | null;
  score: number | null;
  status: "NOT_SUBMITTED" | "SUBMITTED" | "GRADED";
  textContent?: string | null;
}
