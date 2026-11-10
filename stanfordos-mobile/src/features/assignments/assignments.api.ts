import { API_ENDPOINTS } from "../../api/endpoints";
import { apiGet, apiPost, apiPut } from "../../api/client";

import type {
  AssignmentDetail,
  AssignmentSubmission,
  AssignmentSummary,
  CreateAssignmentInput,
  TeacherCourseOption,
} from "./types";

interface TeachingAssignmentDto {
  id: number;
  teacherId: number;
  teacherName: string;
  subjectId: number;
  subjectName: string;
  classSectionId: number;
  classSectionName: string;
}

interface CourseDto {
  id: number;
  title: string;
  description?: string | null;
  teacherId: number;
  teacherName?: string | null;
}

interface AssignmentDto {
  id: number;
  courseId: number;
  courseTitle: string;
  title: string;
  description?: string | null;
  dueDate: string | null;
  maxScore: number;
  createdAt: string;
}

interface SubmissionDto {
  id: number;
  assignmentId: number;
  studentId: number;
  studentName: string;
  textContent: string | null;
  fileUrl: string | null;
  submittedAt: string | null;
  grade: number | null;
  feedback: string | null;
  gradedAt: string | null;
}

function mapSummary(dto: AssignmentDto): AssignmentSummary {
  return {
    id: String(dto.id),
    title: dto.title,
    courseName: dto.courseTitle,
    dueDate: dto.dueDate,
    maxScore: dto.maxScore,
    status: "UNSPECIFIED",
  };
}

function mapDetail(dto: AssignmentDto): AssignmentDetail {
  return {
    ...mapSummary(dto),
    description: dto.description ?? "",
    createdAt: dto.createdAt,
  };
}

function mapSubmission(dto: SubmissionDto): AssignmentSubmission {
  return {
    id: String(dto.id),
    studentId: String(dto.studentId),
    studentName: dto.studentName,
    submittedAt: dto.submittedAt,
    score: dto.grade,
    status: dto.grade !== null ? "GRADED" : "SUBMITTED",
    textContent: dto.textContent,
    fileUrl: dto.fileUrl,
    feedback: dto.feedback,
    gradedAt: dto.gradedAt,
  };
}

export const assignmentsApiService = {
  async listMine(): Promise<AssignmentSummary[]> {
    const [teachingAssignments, courses] = await Promise.all([
      apiGet<TeachingAssignmentDto[]>(API_ENDPOINTS.TEACHER.MY_ASSIGNMENTS),
      apiGet<CourseDto[]>(API_ENDPOINTS.LMS.COURSES),
    ]);

    const teacherIds = new Set(
      teachingAssignments.map((item) => item.teacherId),
    );

    // Course ownership is used to identify this teacher's courses.
    const myCourses = courses.filter((course) =>
      teacherIds.has(course.teacherId),
    );

    const results = await Promise.all(
      myCourses.map(async (course) => {
        const assignments = await apiGet<AssignmentDto[]>(
          API_ENDPOINTS.LMS.ASSIGNMENTS(course.id),
        );

        return assignments.map(mapSummary);
      }),
    );

    return results.flat().sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  },

  async getById(id: string): Promise<AssignmentDetail> {
    const dto = await apiGet<AssignmentDto>(API_ENDPOINTS.LMS.ASSIGNMENT(id));

    return mapDetail(dto);
  },

  async listMyCourses(): Promise<TeacherCourseOption[]> {
    const [teachingAssignments, courses] = await Promise.all([
      apiGet<TeachingAssignmentDto[]>(API_ENDPOINTS.TEACHER.MY_ASSIGNMENTS),
      apiGet<CourseDto[]>(API_ENDPOINTS.LMS.COURSES),
    ]);

    const teacherIds = new Set(
      teachingAssignments.map((item) => item.teacherId),
    );

    return courses
      .filter((course) => teacherIds.has(course.teacherId))
      .map((course) => ({
        id: String(course.id),
        title: course.title,
      }));
  },

  async create(
    courseId: string,
    input: CreateAssignmentInput,
  ): Promise<AssignmentDetail> {
    const dto = await apiPost<AssignmentDto>(
      API_ENDPOINTS.LMS.ASSIGNMENTS(courseId),
      input,
    );

    return mapDetail(dto);
  },

  async gradeSubmission(
    submissionId: string,
    grade: number,
    feedback: string,
  ): Promise<AssignmentSubmission> {
    const dto = await apiPut<SubmissionDto>(
      API_ENDPOINTS.LMS.GRADE_SUBMISSION(submissionId),
      { grade, feedback },
    );

    return mapSubmission(dto);
  },

  async listSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    const submissions = await apiGet<SubmissionDto[]>(
      API_ENDPOINTS.LMS.SUBMISSIONS(assignmentId),
    );

    return submissions.map(mapSubmission);
  },
};
