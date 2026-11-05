/**
 * Keep API paths in one place.
 *
 * Add exact paths from the Spring Boot backend.
 * Do not guess endpoint names.
 */

export const API_ENDPOINTS = {
  AUTH: {
    // Populate using the verified backend authentication routes.
  },

  ATTENDANCE: {
    // Populate after auditing the backend attendance routes.
  },

  ACADEMICS: {
    // Populate after auditing marks and examination routes.
  },

  FINANCE: {
    // Populate after auditing fees and receipt routes.
  },

  NOTIFICATIONS: {
    // Populate after auditing notification routes.
  },
} as const;

