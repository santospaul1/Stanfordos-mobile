export const USER_ROLES = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  PARENT: "PARENT",
  LIBRARIAN: "LIBRARIAN",
  ACCOUNTANT: "ACCOUNTANT",
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "School Administrator",
  TEACHER: "Teacher",
  STUDENT: "Student",
  PARENT: "Parent",
  LIBRARIAN: "Librarian",
  ACCOUNTANT: "Accountant",
  PLATFORM_ADMIN: "Platform Administrator",
};

export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  ADMIN: "/(admin)",
  TEACHER: "/(teacher)",
  STUDENT: "/(student)",
  PARENT: "/(parent)",
  LIBRARIAN: "/(librarian)",
  ACCOUNTANT: "/(accountant)",
  PLATFORM_ADMIN: "/(platform-admin)",
};
