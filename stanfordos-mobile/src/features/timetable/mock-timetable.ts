import type { TimetableSlot, Weekday } from "./types";

const SLOTS: TimetableSlot[] = [
  { id: "t1", day: "MON", startTime: "08:00", endTime: "08:40", classSectionName: "Form 1A", subjectName: "Mathematics", room: "A12" },
  { id: "t2", day: "MON", startTime: "10:00", endTime: "10:40", classSectionName: "Form 2B", subjectName: "Mathematics", room: "B04" },
  { id: "t3", day: "TUE", startTime: "09:00", endTime: "09:40", classSectionName: "Form 3 Science", subjectName: "Physics", room: "Lab 2" },
  { id: "t4", day: "TUE", startTime: "11:00", endTime: "11:40", classSectionName: "Form 1A", subjectName: "Mathematics", room: "A12" },
  { id: "t5", day: "WED", startTime: "08:00", endTime: "08:40", classSectionName: "Form 1A", subjectName: "Mathematics", room: "A12" },
  { id: "t6", day: "WED", startTime: "14:00", endTime: "14:40", classSectionName: "Form 4 Arts", subjectName: "History", room: "C07" },
  { id: "t7", day: "THU", startTime: "10:00", endTime: "10:40", classSectionName: "Form 2B", subjectName: "Mathematics", room: "B04" },
  { id: "t8", day: "FRI", startTime: "09:00", endTime: "09:40", classSectionName: "Form 3 Science", subjectName: "Physics", room: "Lab 2" },
  { id: "t9", day: "FRI", startTime: "11:00", endTime: "11:40", classSectionName: "Form 4 Arts", subjectName: "History", room: "C07" },
];

export const WEEKDAYS: { key: Weekday; label: string }[] = [
  { key: "MON", label: "Mon" },
  { key: "TUE", label: "Tue" },
  { key: "WED", label: "Wed" },
  { key: "THU", label: "Thu" },
  { key: "FRI", label: "Fri" },
];

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const mockTimetableService = {
  async getMyWeek(): Promise<TimetableSlot[]> {
    await delay(350);
    return SLOTS.map((s) => ({ ...s }));
  },
};
