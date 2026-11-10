import { ENV } from "../../config/env";
import { mockAttendanceService } from "./mock-attendance";
import { attendanceApiService } from "./attendance.api";

export const attendanceService = ENV.USE_MOCK_DATA
  ? mockAttendanceService
  : attendanceApiService;
