import { apiGet } from "../../api/client";
import { API_ENDPOINTS } from "../../api/endpoints";
import type { TeacherClassStudent, TeacherClassSummary } from "./types";

interface TeachingAssignmentDto {
  id: number;
  teacherId: number;
  teacherName: string;
  subjectId: number;
  subjectName: string;
  classSectionId: number;
  classSectionName: string;
}

interface ClassSectionDto {
  id: number;
  name: string;
  gradeLevelId: number;
  gradeLevelName: string;
}

interface StudentDto {
  id: number;
  firstName: string;
  lastName: string;
  admissionNumber?: string | null;
  gender?: string | null;
}

const numberId = (id: string | number) => Number(id);

export const classesApiService = {
  async listMyClasses(): Promise<TeacherClassSummary[]> {
    const [assignments, sections] = await Promise.all([
      apiGet<TeachingAssignmentDto[]>(API_ENDPOINTS.TEACHER.MY_ASSIGNMENTS),
      apiGet<ClassSectionDto[]>(API_ENDPOINTS.CLASS_SECTIONS.LIST),
    ]);

    const sectionById = new Map(
      sections.map((section) => [section.id, section]),
    );

    // Group subject assignments under one class card.
    const grouped = new Map<
      number,
      {
        section: ClassSectionDto | undefined;
        subjects: Set<string>;
      }
    >();

    for (const assignment of assignments) {
      const existing = grouped.get(assignment.classSectionId);

      if (existing) {
        existing.subjects.add(assignment.subjectName);
      } else {
        grouped.set(assignment.classSectionId, {
          section: sectionById.get(assignment.classSectionId),
          subjects: new Set([assignment.subjectName]),
        });
      }
    }

    const classIds = [...grouped.keys()];

    const counts = await Promise.all(
      classIds.map(async (classSectionId) => {
        const students = await apiGet<StudentDto[]>(
          API_ENDPOINTS.STUDENTS.LIST,
          { classSectionId },
        );
        return [classSectionId, students.length] as const;
      }),
    );

    const countByClass = new Map(counts);

    return classIds.map((classSectionId) => {
      const item = grouped.get(classSectionId)!;
      const section = item.section;

      return {
        id: String(classSectionId),
        name: section?.name ?? `Class ${classSectionId}`,
        gradeLevelName: section?.gradeLevelName ?? "",
        subjectName: [...item.subjects].join(", "),
        studentCount: countByClass.get(classSectionId) ?? 0,
      };
    });
  },

  async getClass(
    classSectionId: string,
  ): Promise<TeacherClassSummary | undefined> {
    const classes = await this.listMyClasses();
    return classes.find((item) => item.id === classSectionId);
  },

  async getClassStudents(
    classSectionId: string,
  ): Promise<TeacherClassStudent[]> {
    const students = await apiGet<StudentDto[]>(API_ENDPOINTS.STUDENTS.LIST, {
      classSectionId: numberId(classSectionId),
    });

    return students.map((student) => ({
      studentId: String(student.id),
      admissionNumber: student.admissionNumber ?? "",
      fullName: `${student.firstName} ${student.lastName}`.trim(),
      gender: student.gender ?? undefined,
    }));
  },
};
