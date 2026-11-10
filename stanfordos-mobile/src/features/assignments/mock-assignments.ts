import type {
  AssignmentDetail,
  AssignmentSubmission,
  AssignmentSummary,
} from "./types";

const ASSIGNMENTS: AssignmentDetail[] = [
  {
    id: "asg-1",
    title: "Quadratic equations worksheet",
    courseName: "Mathematics",
    classSectionName: "Form 1A",
    dueDate: "2026-11-12",
    maxScore: 20,
    status: "PUBLISHED",
    submissionCount: 18,
    studentCount: 32,
    description:
      "Complete questions 1–15. Show working for full marks. Submit before the due date.",
    createdAt: "2026-11-05",
  },
  {
    id: "asg-2",
    title: "Lab report — refraction",
    courseName: "Physics",
    classSectionName: "Form 3 Science",
    dueDate: "2026-11-14",
    maxScore: 30,
    status: "PUBLISHED",
    submissionCount: 10,
    studentCount: 24,
    description:
      "Write up the refraction experiment from Lab 2. Include diagram, results table and conclusion.",
    createdAt: "2026-11-06",
  },
  {
    id: "asg-3",
    title: "Essay — colonial economy",
    courseName: "History",
    classSectionName: "Form 4 Arts",
    dueDate: "2026-11-20",
    maxScore: 25,
    status: "PUBLISHED",
    submissionCount: 5,
    studentCount: 26,
    description: "800–1000 words on the impact of colonial economic policies.",
    createdAt: "2026-11-07",
  },
  {
    id: "asg-4",
    title: "Revision quiz (draft)",
    courseName: "Mathematics",
    classSectionName: "Form 2B",
    dueDate: "2026-11-18",
    maxScore: 15,
    status: "DRAFT",
    submissionCount: 0,
    studentCount: 28,
    description: "Short quiz covering chapters 4–6. Not published yet.",
    createdAt: "2026-11-08",
  },
];

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const NAMES = [
  "Amina Okello", "Brian Wanjiku", "Cynthia Otieno", "Daniel Kamau",
  "Esther Njeri", "Felix Ouma", "Grace Achieng", "Hassan Mwangi",
  "Irene Chebet", "James Kiprop", "Karen Mutiso", "Leo Barasa",
];

const GRADE_OVERRIDES = new Map<string, { score: number; feedback: string }>();

export const mockAssignmentsService = {
  async listMine(): Promise<AssignmentSummary[]> {
    await delay(400);
    return ASSIGNMENTS.map(({ description, createdAt, ...rest }) => rest);
  },

  async gradeSubmission(
    submissionId: string,
    grade: number,
    feedback: string,
  ): Promise<AssignmentSubmission> {
    await delay(250);

    const match = submissionId.match(/^sub-(.+)-(\d+)$/);

    if (!match) {
      throw new Error("Invalid submission.");
    }

    const [, assignmentId, studentNumber] = match;
    const assignment = ASSIGNMENTS.find((item) => item.id === assignmentId);

    if (!assignment) {
      throw new Error("Assignment not found.");
    }

    GRADE_OVERRIDES.set(submissionId, { score: grade, feedback });

    const submissions = await this.listSubmissions(assignmentId);
    const result = submissions.find((item) => item.id === submissionId);

    if (!result) {
      throw new Error("Submission not found.");
    }

    return result;
  },

  async listMyCourses() {
    await delay(200);

    return [
      { id: "mock-course-mathematics", title: "Mathematics" },
      { id: "mock-course-physics", title: "Physics" },
      { id: "mock-course-history", title: "History" },
    ];
  },

  async create(
    courseId: string,
    input: {
      title: string;
      description: string;
      dueDate: string | null;
      maxScore: number;
    },
  ): Promise<AssignmentDetail> {
    await delay(300);

    const courses = await this.listMyCourses();
    const course = courses.find((item) => item.id === courseId);

    if (!course) {
      throw new Error("Please select a valid course.");
    }

    const created: AssignmentDetail = {
      id: `mock-asg-${Date.now()}`,
      courseId,
      title: input.title,
      description: input.description,
      courseName: course.title,
      dueDate: input.dueDate,
      maxScore: input.maxScore,
      status: "PUBLISHED",
      submissionCount: 0,
      studentCount: 0,
      createdAt: new Date().toISOString(),
    };

    ASSIGNMENTS.unshift(created);
    return { ...created };
  },

  async listMyCourses() {
    await delay(200);

    return [
      { id: "course-math", title: "Mathematics", description: "" },
      { id: "course-physics", title: "Physics", description: "" },
      { id: "course-history", title: "History", description: "" },
    ];
  },

  async create(input: {
    courseId: string;
    title: string;
    description: string;
    dueDate: string;
    maxScore: number;
  }) {
    await delay(250);

    const course = (await this.listMyCourses()).find(
      (item) => item.id === input.courseId,
    );

    if (!course) throw new Error("Select a valid course.");

    const created = {
      id: `asg-${Date.now()}`,
      courseId: input.courseId,
      title: input.title.trim(),
      courseName: course.title,
      dueDate: input.dueDate || "No due date",
      maxScore: input.maxScore,
      status: "PUBLISHED" as const,
      submissionCount: 0,
      studentCount: 0,
      description: input.description.trim(),
      createdAt: new Date().toISOString(),
    };

    ASSIGNMENTS.unshift(created);
    return { ...created };
  },

  async gradeSubmission(submissionId: string, grade: number, feedback: string) {
    await delay(250);

    if (!Number.isInteger(grade) || grade < 0) {
      throw new Error("Enter a valid grade.");
    }

    return {
      id: submissionId,
      studentId: "",
      studentName: "Mock student",
      submittedAt: new Date().toISOString(),
      score: grade,
      status: "GRADED" as const,
      feedback,
    };
  },
  async getById(id: string): Promise<AssignmentDetail> {
    await delay(350);
    const found = ASSIGNMENTS.find((a) => a.id === id);
    if (!found) throw new Error("Assignment not found.");
    return { ...found };
  },

  async listSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    await delay(450);
    const assignment = ASSIGNMENTS.find((a) => a.id === assignmentId);
    if (!assignment) throw new Error("Assignment not found.");

    return NAMES.slice(0, Math.min(12, assignment.studentCount)).map(
      (studentName, i) => {
        const submitted = i < assignment.submissionCount;
        const graded = submitted && i % 3 === 0;
        return {
          id: `sub-${assignmentId}-${i + 1}`,
          studentId: `s-${i + 1}`,
          studentName,
          admissionNumber: `ADM${String(i + 1).padStart(4, "0")}`,
          submittedAt: submitted ? "2026-11-09T10:00:00Z" : null,
          score: graded ? 12 + (i % 8) : null,
          status: graded
            ? ("GRADED" as const)
            : submitted
              ? ("SUBMITTED" as const)
              : ("NOT_SUBMITTED" as const),
          textContent: submitted ? "Student submission text (mock)." : null,
        };
      },
    );
  },
};
