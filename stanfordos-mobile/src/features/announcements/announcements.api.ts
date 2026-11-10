import { apiGet, apiPost } from "../../api/client";
import { API_ENDPOINTS } from "../../api/endpoints";
import { assignmentsApiService } from "../assignments/assignments.api";
import type { AnnouncementItem } from "./types";

interface AnnouncementDto {
  id: number;
  title: string;
  content: string;
  courseId: number | null;
  courseTitle: string | null;
  teacherName: string;
  postedAt: string;
  audience: AnnouncementItem["audience"];
}

function mapAnnouncement(dto: AnnouncementDto): AnnouncementItem {
  return {
    id: String(dto.id),
    title: dto.title,
    body: dto.content,
    audience: dto.audience,
    courseId: dto.courseId == null ? null : String(dto.courseId),
    courseTitle: dto.courseTitle,
    createdAt: dto.postedAt,
    authorName: dto.teacherName,
  };
}

export const announcementsApiService = {
  async listForTeacher(): Promise<AnnouncementItem[]> {
    const courses = await assignmentsApiService.listMyCourses();

    const [schoolWide, courseAnnouncements] = await Promise.all([
      apiGet<AnnouncementDto[]>(API_ENDPOINTS.ANNOUNCEMENTS.SCHOOL_WIDE_FOR_ME),
      Promise.all(
        courses.map((course) =>
          apiGet<AnnouncementDto[]>(
            API_ENDPOINTS.ANNOUNCEMENTS.BY_COURSE(course.id),
          ),
        ),
      ),
    ]);

    const all = [...schoolWide, ...courseAnnouncements.flat()];

    const unique = new Map(
      all.map((announcement) => [
        announcement.id,
        mapAnnouncement(announcement),
      ]),
    );

    return [...unique.values()].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async create(input: {
    title: string;
    body: string;
    courseId: string;
  }): Promise<AnnouncementItem> {
    if (!input.title.trim() || !input.body.trim()) {
      throw new Error("Title and message are required.");
    }

    if (!input.courseId) {
      throw new Error("Select a course for this announcement.");
    }

    const created = await apiPost<AnnouncementDto>(
      API_ENDPOINTS.ANNOUNCEMENTS.CREATE,
      {
        title: input.title.trim(),
        content: input.body.trim(),
        courseId: Number(input.courseId),
      },
    );

    return mapAnnouncement(created);
  },
};
