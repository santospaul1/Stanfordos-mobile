function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export interface AdminStudent {
  id: string;
  fullName: string;
  admissionNumber: string;
  classSectionName: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface AdminTeacher {
  id: string;
  fullName: string;
  email: string;
  subjects: string;
  classesCount: number;
}

export interface AdminClass {
  id: string;
  name: string;
  gradeLevelName: string;
  studentCount: number;
  classTeacher?: string | null;
}

export interface AdminAttendanceSummary {
  classSectionName: string;
  date: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export interface AdminFeeSnapshot {
  label: string;
  amount: number;
  trend: string;
}

const STUDENTS: AdminStudent[] = [
  { id: "as-1", fullName: "Sam Student", admissionNumber: "ADM0001", classSectionName: "Form 1A", status: "ACTIVE" },
  { id: "as-2", fullName: "Amina Okello", admissionNumber: "ADM0014", classSectionName: "Form 3 Science", status: "ACTIVE" },
  { id: "as-3", fullName: "Brian Wanjiku", admissionNumber: "ADM0008", classSectionName: "Form 2B", status: "ACTIVE" },
  { id: "as-4", fullName: "Cynthia Otieno", admissionNumber: "ADM0022", classSectionName: "Form 4 Arts", status: "INACTIVE" },
];

const TEACHERS: AdminTeacher[] = [
  { id: "at-1", fullName: "Tom Teacher", email: "teacher@demo.com", subjects: "Mathematics, Physics", classesCount: 4 },
  { id: "at-2", fullName: "E. Wanjiru", email: "ewanjiru@school.com", subjects: "English", classesCount: 3 },
  { id: "at-3", fullName: "P. Otieno", email: "potieno@school.com", subjects: "Science", classesCount: 2 },
];

const CLASSES: AdminClass[] = [
  { id: "ac-1", name: "Form 1A", gradeLevelName: "Form 1", studentCount: 32, classTeacher: "Tom Teacher" },
  { id: "ac-2", name: "Form 2B", gradeLevelName: "Form 2", studentCount: 28, classTeacher: "E. Wanjiru" },
  { id: "ac-3", name: "Form 3 Science", gradeLevelName: "Form 3", studentCount: 24, classTeacher: "P. Otieno" },
  { id: "ac-4", name: "Form 4 Arts", gradeLevelName: "Form 4", studentCount: 26, classTeacher: "K. Achieng" },
];

export const mockAdminService = {
  async listStudents(query?: string): Promise<AdminStudent[]> {
    await delay(350);
    const q = (query ?? "").trim().toLowerCase();
    return STUDENTS.filter(
      (s) =>
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q)
    ).map((s) => ({ ...s }));
  },
  async listTeachers(): Promise<AdminTeacher[]> {
    await delay(300);
    return TEACHERS.map((t) => ({ ...t }));
  },
  async listClasses(): Promise<AdminClass[]> {
    await delay(300);
    return CLASSES.map((c) => ({ ...c }));
  },
  async listAttendanceToday(): Promise<AdminAttendanceSummary[]> {
    await delay(350);
    return [
      { classSectionName: "Form 1A", date: "2026-11-09", present: 30, absent: 1, late: 1, excused: 0 },
      { classSectionName: "Form 2B", date: "2026-11-09", present: 26, absent: 0, late: 2, excused: 0 },
      { classSectionName: "Form 3 Science", date: "2026-11-09", present: 22, absent: 1, late: 0, excused: 1 },
      { classSectionName: "Form 4 Arts", date: "2026-11-09", present: 24, absent: 2, late: 0, excused: 0 },
    ];
  },
  async getFeeSnapshot(): Promise<AdminFeeSnapshot[]> {
    await delay(300);
    return [
      { label: "Collected this term", amount: 12400000, trend: "+8%" },
      { label: "Outstanding", amount: 1800000, trend: "-3%" },
      { label: "Overdue invoices", amount: 420000, trend: "+12%" },
    ];
  },
  async getReportCards() {
    await delay(300);
    return [
      { id: "r1", title: "Enrollment summary", value: "1,248 students" },
      { id: "r2", title: "Teacher load", value: "86 teachers · avg 3.2 classes" },
      { id: "r3", title: "Attendance (today)", value: "94%" },
      { id: "r4", title: "Fee collection rate", value: "87%" },
    ];
  },
};
