export interface TeacherClassSummary {
  id: string;
  name: string;
  gradeLevelName: string;
  subjectName: string;
  studentCount: number;
  room?: string | null;
  scheduleHint?: string | null;
}

export interface TeacherClassStudent {
  studentId: string;
  admissionNumber: string;
  fullName: string;
  gender?: string;
}
