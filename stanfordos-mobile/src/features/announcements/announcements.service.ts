import { ENV } from "../../config/env";
import { assignmentsService } from "../assignments/assignments.service";
import { mockAnnouncementsService } from "./mock-announcements";
import { announcementsApiService } from "./announcements.api";

interface CreateAnnouncementInput {
  title: string;
  body: string;
  courseId: string;
  courseTitle: string;
}

export const announcementsService = {
  listForTeacher: () =>
    ENV.USE_MOCK_DATA
      ? mockAnnouncementsService.listForTeacher()
      : announcementsApiService.listForTeacher(),

  async create(input: CreateAnnouncementInput) {
    if (ENV.USE_MOCK_DATA) {
      return mockAnnouncementsService.create({
        title: input.title,
        body: input.body,
        audience: "CLASS",
        classSectionName: input.courseTitle,
      });
    }

    return announcementsApiService.create({
      title: input.title,
      body: input.body,
      courseId: input.courseId,
    });
  },

  listMyCourses: () => assignmentsService.listMyCourses(),
};
