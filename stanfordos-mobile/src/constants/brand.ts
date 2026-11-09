/**
 * Stanfordos brand tokens used across shared UI and feature screens.
 * Keep in sync with dashboard / login styling.
 */
export const Brand = {
  primary: "#1D4ED8",
  primaryDark: "#1E40AF",
  primarySoft: "#DBEAFE",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  text: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  danger: "#B91C1C",
  dangerSoft: "#FEE2E2",
  success: "#15803D",
  successSoft: "#DCFCE7",
  warning: "#B45309",
  warningSoft: "#FEF3C7",
} as const;

export const AttendanceStatusColors = {
  PRESENT: { bg: "#DCFCE7", text: "#15803D", label: "Present" },
  ABSENT: { bg: "#FEE2E2", text: "#B91C1C", label: "Absent" },
  LATE: { bg: "#FEF3C7", text: "#B45309", label: "Late" },
  EXCUSED: { bg: "#E0E7FF", text: "#3730A3", label: "Excused" },
} as const;
