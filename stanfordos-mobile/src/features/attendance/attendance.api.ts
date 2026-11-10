import { apiGet, apiPost } from "../../api/client";
import { API_ENDPOINTS } from "../../api/endpoints";
import { classesApiService } from "../classes/classes.api";
import type {
  AttendanceEntrySheet,
  AttendanceStatus,
  ClassSectionSummary,
} from "./types";

interface AttendanceSheetRowDto {
  studentId: number;
  studentName: string;
  status: AttendanceStatus | null;
}

interface StudentDto {
  id: number;
  firstName: string;
  lastName: string;
  admissionNumber?: string | null;
}

const toNumberId = (id: string) => {
  const value = Number(id);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("Invalid class or student ID.");
  }
  return value;
};

export const attendanceApiService = {
  async listMyClasses(): Promise<ClassSectionSummary[]> {
    const classes = await classesApiService.listMyClasses();

    return classes.map((item) => ({
      id: item.id,
      name: item.name,
      gradeLevelName: item.gradeLevelName,
      studentCount: item.studentCount,
      // The current backend does not expose lastTakenAt in the
      // teacher's class assignment response.
      lastTakenAt: null,
    }));
  },

  async getEntrySheet(
    classSectionId: string,
    date: string,
  ): Promise<AttendanceEntrySheet> {
    const id = toNumberId(classSectionId);

    // Restrict the mobile UI to the teacher's assigned classes.
    // This is a client-side guard, NOT a replacement for backend
    // authorization on the attendance endpoints.
    const assignedClasses = await classesApiService.listMyClasses();
    const assignedClass = assignedClasses.find(
      (item) => item.id === classSectionId,
    );

    if (!assignedClass) {
      throw new Error("You are not assigned to teach this class.");
    }

    const [attendanceRows, students] = await Promise.all([
      apiGet<AttendanceSheetRowDto[]>(
        API_ENDPOINTS.ATTENDANCE.ENTRY_SHEET(id),
        { date },
      ),
      apiGet<StudentDto[]>(API_ENDPOINTS.STUDENTS.LIST, {
        classSectionId: id,
      }),
    ]);

    const studentsById = new Map(
      students.map((student) => [student.id, student]),
    );

    return {
      classSectionId,
      classSectionName: assignedClass.name,
      date,
      rows: attendanceRows.map((row) => {
        const student = studentsById.get(row.studentId);

        return {
          studentId: String(row.studentId),
          admissionNumber: student?.admissionNumber ?? "",
          fullName:
            row.studentName ||
            `${student?.firstName ?? ""} ${student?.lastName ?? ""}`.trim(),
          status: row.status,
        };
      }),
    };
  },

  async saveEntrySheet(sheet: AttendanceEntrySheet): Promise<void> {
    const classSectionId = toNumberId(sheet.classSectionId);

    const assignedClasses = await classesApiService.listMyClasses();
    const assignedClass = assignedClasses.find(
      (item) => item.id === sheet.classSectionId,
    );

    if (!assignedClass) {
      throw new Error("You are not assigned to teach this class.");
    }

    const unmarkedCount = sheet.rows.filter((row) => row.status == null).length;

    if (unmarkedCount > 0) {
      throw new Error(
        `Mark attendance for all students before saving. ${unmarkedCount} remain unmarked.`,
      );
    }

    await apiPost(
      `${API_ENDPOINTS.ATTENDANCE.SAVE(classSectionId)}?date=${encodeURIComponent(sheet.date)}`,
      {
        entries: sheet.rows.map((row) => ({
          studentId: toNumberId(row.studentId),
          status: row.status,
        })),
      },
    );
  },
};
