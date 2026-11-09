import type { TeacherClassStudent, TeacherClassSummary } from "./types";

const CLASSES: TeacherClassSummary[] = [
  {
    id: "cs-1",
    name: "Form 1A",
    gradeLevelName: "Form 1",
    subjectName: "Mathematics",
    studentCount: 32,
    room: "Block A · 12",
    scheduleHint: "Mon / Wed 08:00",
  },
  {
    id: "cs-2",
    name: "Form 2B",
    gradeLevelName: "Form 2",
    subjectName: "Mathematics",
    studentCount: 28,
    room: "Block B · 04",
    scheduleHint: "Tue / Thu 10:00",
  },
  {
    id: "cs-3",
    name: "Form 3 Science",
    gradeLevelName: "Form 3",
    subjectName: "Physics",
    studentCount: 24,
    room: "Lab 2",
    scheduleHint: "Fri 09:00",
  },
  {
    id: "cs-4",
    name: "Form 4 Arts",
    gradeLevelName: "Form 4",
    subjectName: "History",
    studentCount: 26,
    room: "Block C · 07",
    scheduleHint: "Wed 14:00",
  },
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

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const mockClassesService = {
  async listMyClasses(): Promise<TeacherClassSummary[]> {
    await delay(400);
    return CLASSES.map((c) => ({ ...c }));
  },

  async getClassStudents(classSectionId: string): Promise<TeacherClassStudent[]> {
    await delay(450);
    const cls = CLASSES.find((c) => c.id === classSectionId);
    if (!cls) throw new Error("Class not found.");
    return NAMES.slice(0, cls.studentCount).map((fullName, i) => ({
      studentId: `${classSectionId}-s-${i + 1}`,
      admissionNumber: `ADM${String(i + 1).padStart(4, "0")}`,
      fullName,
      gender: i % 2 === 0 ? "F" : "M",
    }));
  },

  getClass(classSectionId: string): TeacherClassSummary | undefined {
    return CLASSES.find((c) => c.id === classSectionId);
  },
};
