import { ENV } from "../../config/env";
import { mockTimetableService } from "./mock-timetable";
import { timetableApiService } from "./timetable.api";

export const timetableService = {
  getMyWeek() {
    if (ENV.USE_MOCK_DATA) {
      return mockTimetableService.getMyWeek();
    }

    return timetableApiService.getMyWeek();
  },
};
