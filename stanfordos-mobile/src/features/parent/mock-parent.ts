/**
 * Parent-facing mock data.
 * Child selection is session-scoped in memory for the demo.
 * Parent marks/report cards stay clearly marked as demo until backend support exists.
 */

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface ParentChild {
  id: string;
  fullName: string;
  admissionNumber: string;
  classSectionName: string;
  gradeLevelName: string;
  gender?: string;
}

export interface ParentAttendanceDay {
  date: string;
  status: AttendanceStatus;
  note?: string | null;
}

export interface ParentSubjectResult {
  subjectName: string;
  score: number;
  maxScore: number;
  grade: string;
}

export interface ParentExamResult {
  id: string;
  examName: string;
  termName: string;
  examDate: string;
  average: number;
  rank?: string | null;
  rows: ParentSubjectResult[];
}

export interface ParentFeeInvoice {
  id: string;
  title: string;
  termName: string;
  amount: number;
  paid: number;
  balance: number;
  dueDate: string;
  status: "PAID" | "PARTIAL" | "DUE" | "OVERDUE";
}

export interface ParentFeePayment {
  id: string;
  invoiceId: string;
  amount: number;
  paidAt: string;
  method: string;
  receiptNo: string;
}

export interface ParentNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  category: "SCHOOL" | "CLASS" | "FEE" | "ACADEMIC";
}

const CHILDREN: ParentChild[] = [
  {
    id: "child-1",
    fullName: "Sam Student",
    admissionNumber: "ADM0001",
    classSectionName: "Form 1A",
    gradeLevelName: "Form 1",
    gender: "M",
  },
  {
    id: "child-2",
    fullName: "Amina Okello",
    admissionNumber: "ADM0014",
    classSectionName: "Form 3 Science",
    gradeLevelName: "Form 3",
    gender: "F",
  },
];

let selectedChildId: string | null = CHILDREN[0]?.id ?? null;

const ATTENDANCE: Record<string, ParentAttendanceDay[]> = {
  "child-1": [
    { date: "2026-11-09", status: "PRESENT" },
    { date: "2026-11-08", status: "PRESENT" },
    { date: "2026-11-07", status: "LATE", note: "Arrived 08:15" },
    { date: "2026-11-06", status: "PRESENT" },
    { date: "2026-11-05", status: "ABSENT", note: "Sick leave" },
    { date: "2026-11-04", status: "PRESENT" },
    { date: "2026-11-03", status: "PRESENT" },
  ],
  "child-2": [
    { date: "2026-11-09", status: "PRESENT" },
    { date: "2026-11-08", status: "PRESENT" },
    { date: "2026-11-07", status: "PRESENT" },
    { date: "2026-11-06", status: "EXCUSED", note: "Medical appointment" },
    { date: "2026-11-05", status: "PRESENT" },
    { date: "2026-11-04", status: "PRESENT" },
    { date: "2026-11-03", status: "LATE" },
  ],
};

const RESULTS: Record<string, ParentExamResult[]> = {
  "child-1": [
    {
      id: "pr-1",
      examName: "CAT 3",
      termName: "Term 2 2026",
      examDate: "2026-11-01",
      average: 78,
      rank: "12 / 32",
      rows: [
        { subjectName: "Mathematics", score: 72, maxScore: 100, grade: "B" },
        { subjectName: "English", score: 81, maxScore: 100, grade: "A-" },
        { subjectName: "Science", score: 85, maxScore: 100, grade: "A" },
        { subjectName: "History", score: 74, maxScore: 100, grade: "B+" },
      ],
    },
  ],
  "child-2": [
    {
      id: "pr-2",
      examName: "CAT 3",
      termName: "Term 2 2026",
      examDate: "2026-11-01",
      average: 84,
      rank: "5 / 24",
      rows: [
        { subjectName: "Physics", score: 88, maxScore: 100, grade: "A" },
        { subjectName: "Chemistry", score: 82, maxScore: 100, grade: "A-" },
        { subjectName: "Mathematics", score: 80, maxScore: 100, grade: "A-" },
        { subjectName: "English", score: 86, maxScore: 100, grade: "A" },
      ],
    },
  ],
};

const INVOICES: Record<string, ParentFeeInvoice[]> = {
  "child-1": [
    {
      id: "pinv-1",
      title: "Tuition — Term 2",
      termName: "Term 2 2026",
      amount: 45000,
      paid: 45000,
      balance: 0,
      dueDate: "2026-09-15",
      status: "PAID",
    },
    {
      id: "pinv-2",
      title: "Activity fee",
      termName: "Term 2 2026",
      amount: 3500,
      paid: 0,
      balance: 3500,
      dueDate: "2026-11-01",
      status: "OVERDUE",
    },
  ],
  "child-2": [
    {
      id: "pinv-3",
      title: "Tuition — Term 2",
      termName: "Term 2 2026",
      amount: 48000,
      paid: 30000,
      balance: 18000,
      dueDate: "2026-09-15",
      status: "PARTIAL",
    },
  ],
};

const PAYMENTS: Record<string, ParentFeePayment[]> = {
  "child-1": [
    {
      id: "ppay-1",
      invoiceId: "pinv-1",
      amount: 45000,
      paidAt: "2026-09-10",
      method: "Bank transfer",
      receiptNo: "RCPT-10021",
    },
  ],
  "child-2": [
    {
      id: "ppay-2",
      invoiceId: "pinv-3",
      amount: 30000,
      paidAt: "2026-09-12",
      method: "M-Pesa",
      receiptNo: "RCPT-10055",
    },
  ],
};

let NOTIFICATIONS: ParentNotification[] = [
  {
    id: "pn-1",
    title: "Activity fee overdue",
    body: "Sam Student still has an outstanding activity fee of KSh 3,500.",
    createdAt: "2026-11-08T09:00:00Z",
    read: false,
    category: "FEE",
  },
  {
    id: "pn-2",
    title: "CAT 3 results published",
    body: "Results for CAT 3 are available for your children.",
    createdAt: "2026-11-07T14:00:00Z",
    read: false,
    category: "ACADEMIC",
  },
  {
    id: "pn-3",
    title: "Mid-term timetable",
    body: "The mid-term exam timetable has been released by the school.",
    createdAt: "2026-11-06T10:30:00Z",
    read: true,
    category: "SCHOOL",
  },
  {
    id: "pn-4",
    title: "Form 1A homework reminder",
    body: "Mathematics worksheet is due on Wednesday for Form 1A.",
    createdAt: "2026-11-05T16:00:00Z",
    read: true,
    category: "CLASS",
  },
];

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function requireChildId(childId?: string | null) {
  const id = childId ?? selectedChildId;
  if (!id) throw new Error("Select a child first.");
  return id;
}

export const mockParentService = {
  async listChildren(): Promise<ParentChild[]> {
    await delay(300);
    return CHILDREN.map((c) => ({ ...c }));
  },

  getSelectedChildId(): string | null {
    return selectedChildId;
  },

  async selectChild(childId: string): Promise<ParentChild> {
    await delay(150);
    const child = CHILDREN.find((c) => c.id === childId);
    if (!child) throw new Error("Child not found.");
    selectedChildId = childId;
    return { ...child };
  },

  async getSelectedChild(): Promise<ParentChild | null> {
    await delay(100);
    if (!selectedChildId) return null;
    const child = CHILDREN.find((c) => c.id === selectedChildId);
    return child ? { ...child } : null;
  },

  async listAttendance(childId?: string): Promise<ParentAttendanceDay[]> {
    await delay(350);
    const id = requireChildId(childId);
    return (ATTENDANCE[id] ?? []).map((d) => ({ ...d }));
  },

  async listResults(childId?: string): Promise<ParentExamResult[]> {
    await delay(400);
    const id = requireChildId(childId);
    return (RESULTS[id] ?? []).map((r) => ({
      ...r,
      rows: r.rows.map((row) => ({ ...row })),
    }));
  },

  async getResult(resultId: string, childId?: string): Promise<ParentExamResult> {
    await delay(300);
    const id = requireChildId(childId);
    const found = (RESULTS[id] ?? []).find((r) => r.id === resultId);
    if (!found) throw new Error("Result not found.");
    return { ...found, rows: found.rows.map((row) => ({ ...row })) };
  },

  async listInvoices(childId?: string): Promise<ParentFeeInvoice[]> {
    await delay(350);
    const id = requireChildId(childId);
    return (INVOICES[id] ?? []).map((i) => ({ ...i }));
  },

  async listPayments(childId?: string): Promise<ParentFeePayment[]> {
    await delay(300);
    const id = requireChildId(childId);
    return (PAYMENTS[id] ?? []).map((p) => ({ ...p }));
  },

  async listNotifications(): Promise<ParentNotification[]> {
    await delay(300);
    return NOTIFICATIONS.map((n) => ({ ...n })).sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1
    );
  },

  async markNotificationRead(id: string): Promise<void> {
    await delay(200);
    NOTIFICATIONS = NOTIFICATIONS.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
  },

  async markAllNotificationsRead(): Promise<void> {
    await delay(250);
    NOTIFICATIONS = NOTIFICATIONS.map((n) => ({ ...n, read: true }));
  },
};
