export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface ClassSectionSummary {
  id: string;
  name: string;
  gradeLevelName: string;
  studentCount: number;
  lastTakenAt?: string | null;
}

export interface AttendanceStudentRow {
  studentId: string;
  admissionNumber: string;
  fullName: string;
  status: AttendanceStatus;
}

export interface AttendanceEntrySheet {
  classSectionId: string;
  classSectionName: string;
  date: string; // YYYY-MM-DD
  rows: AttendanceStudentRow[];
}
