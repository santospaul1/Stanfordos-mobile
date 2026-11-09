import { apiGet, apiPatch, apiPost } from "../../api/client";

import { API_ENDPOINTS } from "../../api/endpoints";

import type { ParentNotification } from "./mock-parent";

interface BackendNotification {
  id: number | string;
  type: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

function mapCategory(type: string): ParentNotification["category"] {
  const value = type.toUpperCase();

  if (value.includes("FEE") || value.includes("PAYMENT")) {
    return "FEE";
  }

  if (
    value.includes("MARK") ||
    value.includes("EXAM") ||
    value.includes("RESULT") ||
    value.includes("ACADEMIC")
  ) {
    return "ACADEMIC";
  }

  if (value.includes("CLASS") || value.includes("ASSIGNMENT")) {
    return "CLASS";
  }

  return "SCHOOL";
}

function formatTitle(type: string): string {
  return type
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function mapNotification(item: BackendNotification): ParentNotification {
  return {
    id: String(item.id),
    title: formatTitle(item.type),
    body: item.message,
    createdAt: item.createdAt,
    read: item.read,
    category: mapCategory(item.type),
  };
}

export const notificationApiService = {
  async list(): Promise<ParentNotification[]> {
    const response = await apiGet<BackendNotification[]>(
      API_ENDPOINTS.NOTIFICATIONS.LIST,
    );

    return response
      .map(mapNotification)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async markRead(id: string): Promise<void> {
    await apiPatch<void>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },

  async markAllRead(): Promise<void> {
    await apiPost<void>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },
};
