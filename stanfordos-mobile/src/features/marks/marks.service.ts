import { ENV } from "../../config/env";
import { mockMarksService } from "./mock-marks";
import { marksApiService } from "./marks.api";

export const marksService = ENV.USE_MOCK_DATA
  ? mockMarksService
  : marksApiService;
