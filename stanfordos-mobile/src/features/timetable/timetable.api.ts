import { apiGet } from "../../api/client";
import { API_ENDPOINTS } from "../../api/endpoints";
import type { TimetableSlot, Weekday } from "./types";

interface ApiTimetablePeriod {
  id: number;
  name: string;
  sortOrder: number;
  startTime: string;
  endTime: string;
  breakPeriod: boolean;
}

interface ApiTimetableSlot {
  id: number;
  dayOfWeek: number;
  periodId: number;
  teachingAssignmentId: number | null;
  subjectName: string | null;
  teacherName: string | null;
  room: string | null;
  classSectionName: string | null;
}

interface ApiMyTimetableResponse {
  classSectionId: number | null;
  classSectionName: string | null;
  periods: ApiTimetablePeriod[];
  slots: ApiTimetableSlot[];
}

const DAY_MAP: Record<number, Weekday> = {
  1: "MON",
  2: "TUE",
  3: "WED",
  4: "THU",
  5: "FRI",
};

function normalizeTime(value: string): string {
  // Spring LocalTime may serialize as HH:mm:ss.
  return value.slice(0, 5);
}

function mapTimetable(response: ApiMyTimetableResponse): TimetableSlot[] {
  const periods = new Map(
    response.periods.map((period) => [period.id, period]),
  );

  return response.slots
    .filter((slot) => {
      const period = periods.get(slot.periodId);

      // A teacher's personal timetable should contain actual lessons,
      // not breaks or empty timetable slots.
      return (
        period !== undefined &&
        !period.breakPeriod &&
        slot.teachingAssignmentId !== null &&
        slot.subjectName !== null &&
        slot.dayOfWeek >= 1 &&
        slot.dayOfWeek <= 5
      );
    })
    .map((slot) => {
      const period = periods.get(slot.periodId)!;

      return {
        id: String(slot.id),
        day: DAY_MAP[slot.dayOfWeek],
        startTime: normalizeTime(period.startTime),
        endTime: normalizeTime(period.endTime),
        classSectionName: slot.classSectionName ?? "Class",
        subjectName: slot.subjectName ?? "Subject",
        room: slot.room,
      };
    })
    .sort((a, b) => {
      const dayOrder = a.day.localeCompare(b.day);

      return dayOrder !== 0 ? dayOrder : a.startTime.localeCompare(b.startTime);
    });
}

export const timetableApiService = {
  async getMyWeek(): Promise<TimetableSlot[]> {
    const response = await apiGet<ApiMyTimetableResponse>(
      API_ENDPOINTS.TIMETABLE.MY,
    );

    return mapTimetable(response);
  },
};
