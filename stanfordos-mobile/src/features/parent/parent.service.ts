import { ENV } from "../../config/env";

import { mockParentService } from "./mock-parent";
import { parentApiService } from "./parent.api";
import { notificationApiService } from "./notifications.api";

const realParentService = {
  ...parentApiService,

  listNotifications: notificationApiService.list,
  markNotificationRead: notificationApiService.markRead,
  markAllNotificationsRead: notificationApiService.markAllRead,
};

/**
 * Existing parent screens can keep the same service method calls.
 * Only their import path changes.
 */
export const parentService = ENV.USE_MOCK_DATA
  ? mockParentService
  : realParentService;
