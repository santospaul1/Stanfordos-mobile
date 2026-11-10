import { ENV } from "../../config/env";
import { mockAssignmentsService } from "./mock-assignments";
import { assignmentsApiService } from "./assignments.api";

export const assignmentsService = ENV.USE_MOCK_DATA
  ? mockAssignmentsService
  : assignmentsApiService;
