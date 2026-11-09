export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  audience: "ALL" | "TEACHERS" | "STUDENTS" | "CLASS";
  classSectionName?: string | null;
  createdAt: string;
  authorName: string;
}
