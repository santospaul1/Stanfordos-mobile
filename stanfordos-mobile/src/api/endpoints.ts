/**
 * Paths verified against the Spring Boot audit.
 * Do not invent routes — add only after inspecting controllers.
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",
    CHANGE_PASSWORD: "/api/auth/change-password",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    VERIFY_EMAIL: "/api/auth/verify-email",
    RESEND_VERIFICATION: "/api/auth/resend-verification",
    SESSIONS: "/api/auth/sessions",
  },
  DASHBOARD: {
    SUMMARY: "/api/dashboard/summary",
    ATTENDANCE_TREND: "/api/dashboard/attendance-trend",
  },
  ATTENDANCE: {
    ENTRY_SHEET: (classSectionId: string | number) =>
      `/api/class-sections/${classSectionId}/attendance/entry-sheet`,
    SAVE: (classSectionId: string | number) =>
      `/api/class-sections/${classSectionId}/attendance`,
    SESSIONS: (classSectionId: string | number) =>
      `/api/class-sections/${classSectionId}/attendance/sessions`,
    STUDENT: (studentId: string | number) =>
      `/api/students/${studentId}/class-attendance`,
  },
  PARENT: {
    MY_CHILDREN: "/api/parents/my-children",
  },
  MARKS: {
    ENTRY_SHEET: "/api/marks/entry-sheet",
    SAVE: "/api/marks",
    STUDENT_EXAM: (studentId: string | number, examId: string | number) =>
      `/api/marks/student/${studentId}/exam/${examId}`,
  },
  FEES: {
    STUDENT_INVOICES: (studentId: string | number) =>
      `/api/fee-invoices/student/${studentId}`,
    INVOICE_PAYMENTS: (invoiceId: string | number) =>
      `/api/fee-invoices/${invoiceId}/payments`,
    RECEIPT: (invoiceId: string | number, paymentId: string | number) =>
      `/api/fee-invoices/${invoiceId}/payments/${paymentId}/receipt`,
  },
  NOTIFICATIONS: {
    LIST: "/api/notifications",
    MARK_READ: (id: string | number) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: "/api/notifications/mark-all-read",
  },
  LMS: {
    COURSES: "/api/courses",
    COURSE: (id: string | number) => `/api/courses/${id}`,
    ASSIGNMENTS: (courseId: string | number) =>
      `/api/courses/${courseId}/assignments`,
    ASSIGNMENT: (id: string | number) => `/api/assignments/${id}`,
    SUBMISSIONS: (assignmentId: string | number) =>
      `/api/assignments/${assignmentId}/submissions`,
    MY_SUBMISSION: (assignmentId: string | number) =>
      `/api/assignments/${assignmentId}/submissions/me`,
  },
} as const;
