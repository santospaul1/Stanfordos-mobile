import type { AnnouncementItem } from "./types";

let items: AnnouncementItem[] = [
  {
    id: "an-1",
    title: "Mid-term timetable released",
    body: "Please review the mid-term exam timetable posted on the notice board and share with your classes.",
    audience: "TEACHERS",
    createdAt: "2026-11-08T09:00:00Z",
    authorName: "Ada Admin",
  },
  {
    id: "an-2",
    title: "Form 1A — homework reminder",
    body: "Mathematics worksheet is due on Wednesday. Collect remaining scripts after assembly.",
    audience: "CLASS",
    classSectionName: "Form 1A",
    createdAt: "2026-11-07T14:20:00Z",
    authorName: "Tom Teacher",
  },
  {
    id: "an-3",
    title: "Staff briefing Friday",
    body: "Short briefing in the staff room at 15:30 on assessment moderation.",
    audience: "TEACHERS",
    createdAt: "2026-11-06T11:00:00Z",
    authorName: "Ada Admin",
  },
];

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const mockAnnouncementsService = {
  async listForTeacher(): Promise<AnnouncementItem[]> {
    await delay(350);
    return items
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((i) => ({ ...i }));
  },

  async create(input: {
    title: string;
    body: string;
    audience: AnnouncementItem["audience"];
    classSectionName?: string;
  }): Promise<AnnouncementItem> {
    await delay(500);
    if (!input.title.trim() || !input.body.trim()) {
      throw new Error("Title and message are required.");
    }
    const item: AnnouncementItem = {
      id: `an-${Date.now()}`,
      title: input.title.trim(),
      body: input.body.trim(),
      audience: input.audience,
      classSectionName: input.classSectionName ?? null,
      createdAt: new Date().toISOString(),
      authorName: "Tom Teacher",
    };
    items = [item, ...items];
    return { ...item };
  },
};
