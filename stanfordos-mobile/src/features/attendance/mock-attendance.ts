import type {
  AttendanceEntrySheet,
  AttendanceStatus,
  AttendanceStudentRow,
  ClassSectionSummary,
} from "./types";

const CLASSES: ClassSectionSummary[] = [
  {
    id: "cs-1",
    name: "Form 1A",
    gradeLevelName: "Form 1",
    studentCount: 32,
    lastTakenAt: "2026-11-08",
  },
  {
    id: "cs-2",
    name: "Form 2B",
    gradeLevelName: "Form 2",
    studentCount: 28,
    lastTakenAt: "2026-11-09",
  },
  {
    id: "cs-3",
    name: "Form 3 Science",
    gradeLevelName: "Form 3",
    studentCount: 24,
    lastTakenAt: null,
  },
  {
    id: "cs-4",
    name: "Form 4 Arts",
    gradeLevelName: "Form 4",
    studentCount: 26,
    lastTakenAt: "2026-11-07",
  },
];

const NAMES = [
  "Amina Okello",
  "Brian Wanjiku",
  "Cynthia Otieno",
  "Daniel Kamau",
  "Esther Njeri",
  "Felix Ouma",
  "Grace Achieng",
  "Hassan Mwangi",
  "Irene Chebet",
  "James Kiprop",
  "Karen Mutiso",
  "Leo Barasa",
  "Mary Atieno",
  "Nathan Kiplagat",
  "Olivia Wambui",
  "Peter Ochieng",
  "Queenie Moraa",
  "Ryan Kimani",
  "Sarah Naliaka",
  "Timothy Odhiambo",
  "Ursula Akinyi",
  "Victor Cheruiyot",
  "Winnie Nyambura",
  "Xavier Mutua",
  "Yvonne Jepchirchir",
  "Zuri Adhiambo",
  "Alex Maina",
  "Brenda Cherono",
  "Collins Onyango",
  "Diana Wairimu",
  "Edwin Kiprotich",
  "Faith Nekesa",
];

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function buildRows(classSectionId: string): AttendanceStudentRow[] {
  const cls = CLASSES.find((c) => c.id === classSectionId);
  const count = cls?.studentCount ?? 20;
  return NAMES.slice(0, count).map((fullName, index) => ({
    studentId: `${classSectionId}-s-${index + 1}`,
    admissionNumber: `ADM${String(index + 1).padStart(4, "0")}`,
    fullName,
    status: "PRESENT" as AttendanceStatus,
  }));
}

/** In-memory store so save persists during the app session */
const sheets = new Map<string, AttendanceEntrySheet>();

function sheetKey(classSectionId: string, date: string) {
  return `${classSectionId}:${date}`;
}

export const mockAttendanceService = {
  async listMyClasses(): Promise<ClassSectionSummary[]> {
    await delay(450);
    return CLASSES;
  },

  async getEntrySheet(
    classSectionId: string,
    date: string = todayIso()
  ): Promise<AttendanceEntrySheet> {
    await delay(500);
    const key = sheetKey(classSectionId, date);
    const existing = sheets.get(key);
    if (existing) {
      return {
        ...existing,
        rows: existing.rows.map((r) => ({ ...r })),
      };
    }

    const cls = CLASSES.find((c) => c.id === classSectionId);
    if (!cls) {
      throw new Error("Class section not found.");
    }

    const sheet: AttendanceEntrySheet = {
      classSectionId,
      classSectionName: cls.name,
      date,
      rows: buildRows(classSectionId),
    };
    sheets.set(key, sheet);
    return {
      ...sheet,
      rows: sheet.rows.map((r) => ({ ...r })),
    };
  },

  /**
   * Online-only save. Callers must ensure connectivity before invoking.
   * No offline write queue — matches product rule.
   */
  async saveEntrySheet(sheet: AttendanceEntrySheet): Promise<void> {
    await delay(650);
    const key = sheetKey(sheet.classSectionId, sheet.date);
    sheets.set(key, {
      ...sheet,
      rows: sheet.rows.map((r) => ({ ...r })),
    });

    const cls = CLASSES.find((c) => c.id === sheet.classSectionId);
    if (cls) {
      cls.lastTakenAt = sheet.date;
    }
  },
};

export function cycleStatus(current: AttendanceStatus): AttendanceStatus {
  const order: AttendanceStatus[] = ["PRESENT", "LATE", "ABSENT", "EXCUSED"];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}

export { todayIso };
