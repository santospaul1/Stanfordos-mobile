export type AnnouncementAudience =
  | "ALL"
  | "TEACHERS"
  | "STUDENTS"
  | "PARENTS"
  | "CLASS";

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience | null;
  courseId?: string | null;
  courseTitle?: string | null;
  classSectionName?: string | null;
  createdAt: string;
  authorName: string;
}
