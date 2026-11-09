export interface TimetableSlot {
  id: string;
  day: "MON" | "TUE" | "WED" | "THU" | "FRI";
  startTime: string; // HH:mm
  endTime: string;
  classSectionName: string;
  subjectName: string;
  room?: string | null;
}

export type Weekday = TimetableSlot["day"];
