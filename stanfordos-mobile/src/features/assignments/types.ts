export type AssignmentStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "UNSPECIFIED";

export interface AssignmentSummary {
  id: string;
  title: string;
  courseName: string;
  classSectionName?: string | null;
  dueDate: string | null;
  maxScore: number;
  status: AssignmentStatus;
  submissionCount?: number;
  studentCount?: number;
}

export interface AssignmentDetail extends AssignmentSummary {
  description: string;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber?: string;
  submittedAt: string | null;
  score: number | null;
  status: "NOT_SUBMITTED" | "SUBMITTED" | "GRADED";
  textContent?: string | null;
  fileUrl?: string | null;
  feedback?: string | null;
  gradedAt?: string | null;
}

export interface TeacherCourseOption {
  id: string;
  title: string;
  description?: string | null;
}

export interface CreateAssignmentInput {
  title: string;
  description: string;
  dueDate: string | null;
  maxScore: number;
}