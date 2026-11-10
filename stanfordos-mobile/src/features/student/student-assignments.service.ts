import { ENV } from "../../config/env";
import {
  mockStudentService,
  type StudentAssignment,
  type StudentSubmissionAttachment,
} from "./mock-student";

/**
 * Student assignment service boundary.
 *
 * Do not call the existing teacher-owned assignment list/detail endpoints
 * from student screens. Student assignment APIs still need to be agreed
 * with the backend team.
 */
function liveAssignmentsUnavailable(): never {
  throw new Error(
    "Live student assignments are not available yet. Student assignment screens are currently mock-backed.",
  );
}

export const studentAssignmentsService = {
  async listAssignments(): Promise<StudentAssignment[]> {
    if (ENV.USE_MOCK_DATA) {
      return mockStudentService.listAssignments();
    }
    return liveAssignmentsUnavailable();
  },

  async getAssignment(id: string): Promise<StudentAssignment> {
    if (ENV.USE_MOCK_DATA) {
      return mockStudentService.getAssignment(id);
    }
    return liveAssignmentsUnavailable();
  },

  async submitAssignment(
    id: string,
    textContent: string,
    attachment?: StudentSubmissionAttachment,
  ): Promise<StudentAssignment> {
    if (ENV.USE_MOCK_DATA) {
      return mockStudentService.submitAssignment(id, textContent, attachment);
    }
    return liveAssignmentsUnavailable();
  },
};
