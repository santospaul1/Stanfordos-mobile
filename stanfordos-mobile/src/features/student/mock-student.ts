/**
 * Student-facing mock data and services.
 * Read-heavy; assignment submission is the main mutation (online-only).
 */

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
export type Weekday = "MON" | "TUE" | "WED" | "THU" | "FRI";

export interface StudentTimetableSlot {
  id: string;
  day: Weekday;
  startTime: string;
  endTime: string;
  subjectName: string;
  teacherName: string;
  room?: string | null;
}


export interface StudentSubmissionAttachment {
  uri: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
}

export interface StudentSubmissionAttempt {
  id: string;
  submittedAt: string;
  textContent: string;
  attachment?: StudentSubmissionAttachment | null;
}

export interface StudentAssignment {
  id: string;
  title: string;
  subjectName: string;
  dueDate: string;
  maxScore: number;
  status: "OPEN" | "SUBMITTED" | "GRADED" | "OVERDUE";
  description: string;
  myScore?: number | null;
  mySubmissionText?: string | null;
  submittedAt?: string | null;
  myAttachment?: StudentSubmissionAttachment | null;
  teacherFeedback?: string | null;
  submissionHistory?: StudentSubmissionAttempt[];
}

export interface StudentResultRow {
  subjectName: string;
  score: number;
  maxScore: number;
  grade: string;
}

export interface StudentExamResult {
  id: string;
  examName: string;
  termName: string;
  examDate: string;
  totalScore: number;
  maxTotal: number;
  average: number;
  rank?: string | null;
  rows: StudentResultRow[];
}

export interface StudentAttendanceDay {
  date: string;
  status: AttendanceStatus;
  note?: string | null;
}

export interface StudentFeeInvoice {
  id: string;
  title: string;
  termName: string;
  amount: number;
  paid: number;
  balance: number;
  dueDate: string;
  status: "PAID" | "PARTIAL" | "DUE" | "OVERDUE";
}

export interface StudentFeePayment {
  id: string;
  invoiceId: string;
  amount: number;
  paidAt: string;
  method: string;
  receiptNo: string;
}

export interface StudentLibraryLoan {
  id: string;
  title: string;
  author: string;
  borrowedAt: string;
  dueDate: string;
  status: "ON_LOAN" | "OVERDUE" | "RETURNED";
}

const WEEKDAYS: { key: Weekday; label: string }[] = [
  { key: "MON", label: "Mon" },
  { key: "TUE", label: "Tue" },
  { key: "WED", label: "Wed" },
  { key: "THU", label: "Thu" },
  { key: "FRI", label: "Fri" },
];

const TIMETABLE: StudentTimetableSlot[] = [
  { id: "st1", day: "MON", startTime: "08:00", endTime: "08:40", subjectName: "Mathematics", teacherName: "Tom Teacher", room: "A12" },
  { id: "st2", day: "MON", startTime: "09:00", endTime: "09:40", subjectName: "English", teacherName: "E. Wanjiru", room: "A08" },
  { id: "st3", day: "TUE", startTime: "08:00", endTime: "08:40", subjectName: "Science", teacherName: "P. Otieno", room: "Lab 1" },
  { id: "st4", day: "TUE", startTime: "10:00", endTime: "10:40", subjectName: "Mathematics", teacherName: "Tom Teacher", room: "A12" },
  { id: "st5", day: "WED", startTime: "08:00", endTime: "08:40", subjectName: "Mathematics", teacherName: "Tom Teacher", room: "A12" },
  { id: "st6", day: "WED", startTime: "11:00", endTime: "11:40", subjectName: "History", teacherName: "K. Achieng", room: "B03" },
  { id: "st7", day: "THU", startTime: "09:00", endTime: "09:40", subjectName: "English", teacherName: "E. Wanjiru", room: "A08" },
  { id: "st8", day: "FRI", startTime: "08:00", endTime: "08:40", subjectName: "Science", teacherName: "P. Otieno", room: "Lab 1" },
  { id: "st9", day: "FRI", startTime: "10:00", endTime: "10:40", subjectName: "PE", teacherName: "Coach M", room: "Field" },
];

let ASSIGNMENTS: StudentAssignment[] = [
  {
    id: "sa-1",
    title: "Quadratic equations worksheet",
    subjectName: "Mathematics",
    dueDate: "2026-11-12",
    maxScore: 20,
    status: "OPEN",
    description: "Complete questions 1–15. Show working for full marks.",
  },
  {
    id: "sa-2",
    title: "Comprehension exercise 4",
    subjectName: "English",
    dueDate: "2026-11-10",
    maxScore: 15,
    status: "SUBMITTED",
    description: "Read the passage and answer questions A–E.",
    mySubmissionText: "My answers for the comprehension (mock).",
    submittedAt: "2026-11-09T16:20:00Z",
  },
  {
    id: "sa-3",
    title: "Lab notes — states of matter",
    subjectName: "Science",
    dueDate: "2026-11-05",
    maxScore: 25,
    status: "GRADED",
    description: "Write up the classroom demonstration.",
    mySubmissionText: "Lab notes submitted.",
    submittedAt: "2026-11-04T18:00:00Z",
    myScore: 21,
    teacherFeedback:
      "Good explanation of the experiment. Improve the conclusion by relating your observations to particle movement.",
    submissionHistory: [
      {
        id: "attempt-sa-3-1",
        submittedAt: "2026-11-04T18:00:00Z",
        textContent: "Lab notes submitted.",
        attachment: null,
      },
    ],
  },
  
  {
    id: "sa-4",
    title: "Map work sheet",
    subjectName: "History",
    dueDate: "2026-11-01",
    maxScore: 10,
    status: "OVERDUE",
    description: "Label the colonial trade routes map.",
  },
];



const RESULTS: StudentExamResult[] = [
  {
    id: "er-1",
    examName: "CAT 3",
    termName: "Term 2 2026",
    examDate: "2026-11-01",
    totalScore: 312,
    maxTotal: 400,
    average: 78,
    rank: "12 / 32",
    rows: [
      { subjectName: "Mathematics", score: 72, maxScore: 100, grade: "B" },
      { subjectName: "English", score: 81, maxScore: 100, grade: "A-" },
      { subjectName: "Science", score: 85, maxScore: 100, grade: "A" },
      { subjectName: "History", score: 74, maxScore: 100, grade: "B+" },
    ],
  },
  {
    id: "er-2",
    examName: "Mid-Term Exam",
    termName: "Term 2 2026",
    examDate: "2026-11-15",
    totalScore: 0,
    maxTotal: 400,
    average: 0,
    rank: null,
    rows: [
      { subjectName: "Mathematics", score: 0, maxScore: 100, grade: "—" },
      { subjectName: "English", score: 0, maxScore: 100, grade: "—" },
      { subjectName: "Science", score: 0, maxScore: 100, grade: "—" },
      { subjectName: "History", score: 0, maxScore: 100, grade: "—" },
    ],
  },
];

const ATTENDANCE: StudentAttendanceDay[] = [
  { date: "2026-11-09", status: "PRESENT" },
  { date: "2026-11-08", status: "PRESENT" },
  { date: "2026-11-07", status: "LATE", note: "Arrived 08:15" },
  { date: "2026-11-06", status: "PRESENT" },
  { date: "2026-11-05", status: "ABSENT", note: "Sick leave" },
  { date: "2026-11-04", status: "PRESENT" },
  { date: "2026-11-03", status: "PRESENT" },
  { date: "2026-10-31", status: "EXCUSED", note: "Family event" },
  { date: "2026-10-30", status: "PRESENT" },
  { date: "2026-10-29", status: "PRESENT" },
];

const INVOICES: StudentFeeInvoice[] = [
  {
    id: "inv-1",
    title: "Tuition — Term 2",
    termName: "Term 2 2026",
    amount: 45000,
    paid: 45000,
    balance: 0,
    dueDate: "2026-09-15",
    status: "PAID",
  },
  {
    id: "inv-2",
    title: "Boarding — Term 2",
    termName: "Term 2 2026",
    amount: 28000,
    paid: 15000,
    balance: 13000,
    dueDate: "2026-10-01",
    status: "PARTIAL",
  },
  {
    id: "inv-3",
    title: "Activity fee",
    termName: "Term 2 2026",
    amount: 3500,
    paid: 0,
    balance: 3500,
    dueDate: "2026-11-01",
    status: "OVERDUE",
  },
];

const PAYMENTS: StudentFeePayment[] = [
  {
    id: "pay-1",
    invoiceId: "inv-1",
    amount: 45000,
    paidAt: "2026-09-10",
    method: "Bank transfer",
    receiptNo: "RCPT-10021",
  },
  {
    id: "pay-2",
    invoiceId: "inv-2",
    amount: 15000,
    paidAt: "2026-09-28",
    method: "M-Pesa",
    receiptNo: "RCPT-10088",
  },
];

const LOANS: StudentLibraryLoan[] = [
  {
    id: "loan-1",
    title: "Things Fall Apart",
    author: "Chinua Achebe",
    borrowedAt: "2026-10-20",
    dueDate: "2026-11-10",
    status: "ON_LOAN",
  },
  {
    id: "loan-2",
    title: "Secondary Mathematics Form 1",
    author: "KLB",
    borrowedAt: "2026-10-01",
    dueDate: "2026-10-25",
    status: "OVERDUE",
  },
  {
    id: "loan-3",
    title: "The River Between",
    author: "Ngũgĩ wa Thiong'o",
    borrowedAt: "2026-09-01",
    dueDate: "2026-09-20",
    status: "RETURNED",
  },
];

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const studentWeekdays = WEEKDAYS;

export const mockStudentService = {
  async getTimetable(): Promise<StudentTimetableSlot[]> {
    await delay(350);
    return TIMETABLE.map((s) => ({ ...s }));
  },


  async listAssignments(): Promise<StudentAssignment[]> {
    await delay(400);
    return ASSIGNMENTS.map((assignment) => ({
      ...assignment,
      myAttachment: assignment.myAttachment
        ? { ...assignment.myAttachment }
        : null,
      submissionHistory: (assignment.submissionHistory ?? []).map(
        (attempt) => ({
          ...attempt,
          attachment: attempt.attachment ? { ...attempt.attachment } : null,
        }),
      ),
    }));
  },

  async getAssignment(id: string): Promise<StudentAssignment> {
    await delay(300);

    const found = ASSIGNMENTS.find((assignment) => assignment.id === id);
    if (!found) {
      throw new Error("Assignment not found.");
    }

    return {
      ...found,
      myAttachment: found.myAttachment ? { ...found.myAttachment } : null,
      submissionHistory: (found.submissionHistory ?? []).map((attempt) => ({
        ...attempt,
        attachment: attempt.attachment ? { ...attempt.attachment } : null,
      })),
    };
  },

  /** Online-only mock submission. No offline queue or real upload. */
  async submitAssignment(
    id: string,
    textContent: string,
    attachment?: StudentSubmissionAttachment,
  ): Promise<StudentAssignment> {
    await delay(600);

    if (!textContent.trim() && !attachment) {
      throw new Error("Write a response or attach a file before submitting.");
    }

    const idx = ASSIGNMENTS.findIndex((assignment) => assignment.id === id);
    if (idx < 0) {
      throw new Error("Assignment not found.");
    }

    const current = ASSIGNMENTS[idx];

    if (current.status === "GRADED") {
      throw new Error("This assignment is already graded.");
    }

    const submittedAt = new Date().toISOString();

    const attempt: StudentSubmissionAttempt = {
      id: `attempt-${id}-${Date.now()}`,
      submittedAt,
      textContent: textContent.trim(),
      attachment: attachment ? { ...attachment } : null,
    };

    const updated: StudentAssignment = {
      ...current,
      status: "SUBMITTED",
      mySubmissionText: textContent.trim() || null,
      myAttachment: attachment
        ? { ...attachment }
        : (current.myAttachment ?? null),
      submittedAt,
      submissionHistory: [...(current.submissionHistory ?? []), attempt],
    };

    ASSIGNMENTS = [
      ...ASSIGNMENTS.slice(0, idx),
      updated,
      ...ASSIGNMENTS.slice(idx + 1),
    ];

    return {
      ...updated,
      myAttachment: updated.myAttachment ? { ...updated.myAttachment } : null,
      submissionHistory: (updated.submissionHistory ?? []).map((entry) => ({
        ...entry,
        attachment: entry.attachment ? { ...entry.attachment } : null,
      })),
    };
  },

  async listResults(): Promise<StudentExamResult[]> {
    await delay(400);
    // Mid-term with zeros represents "not published yet" for demo
    return RESULTS.filter((r) => r.average > 0 || r.id === "er-1").map((r) => ({
      ...r,
      rows: r.rows.map((row) => ({ ...row })),
    }));
  },

  async getResult(id: string): Promise<StudentExamResult> {
    await delay(300);
    const found = RESULTS.find((r) => r.id === id);
    if (!found) throw new Error("Result not found.");
    return { ...found, rows: found.rows.map((row) => ({ ...row })) };
  },

  async listAttendance(): Promise<StudentAttendanceDay[]> {
    await delay(350);
    return ATTENDANCE.map((a) => ({ ...a }));
  },

  async listInvoices(): Promise<StudentFeeInvoice[]> {
    await delay(350);
    return INVOICES.map((i) => ({ ...i }));
  },

  async listPayments(): Promise<StudentFeePayment[]> {
    await delay(300);
    return PAYMENTS.map((p) => ({ ...p }));
  },

  async listLibraryLoans(): Promise<StudentLibraryLoan[]> {
    await delay(350);
    return LOANS.map((l) => ({ ...l }));
  },
};
