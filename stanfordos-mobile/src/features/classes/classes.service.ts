import { ENV } from "../../config/env";
import { mockClassesService } from "./mock-classes";
import { classesApiService } from "./classes.api";

export const classesService = ENV.USE_MOCK_DATA
  ? mockClassesService
  : classesApiService;
