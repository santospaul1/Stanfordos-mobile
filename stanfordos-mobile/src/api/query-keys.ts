export function createQueryKeys(
  schoolId: string | number,
  userId: string | number
) {
  const scope = [
    "school",
    String(schoolId),
    "user",
    String(userId),
  ] as const;

  return {
    all: scope,

    dashboard: [...scope, "dashboard"] as const,

    attendance: {
      all: [...scope, "attendance"] as const,
      lists: () => [...scope, "attendance", "list"] as const,
      detail: (id: string | number) =>
        [...scope, "attendance", "detail", String(id)] as const,
    },

    academics: {
      all: [...scope, "academics"] as const,
      results: () => [...scope, "academics", "results"] as const,
      exams: () => [...scope, "academics", "exams"] as const,
    },

    finance: {
      all: [...scope, "finance"] as const,
      fees: () => [...scope, "finance", "fees"] as const,
      receipts: () => [...scope, "finance", "receipts"] as const,
    },

    notifications: [...scope, "notifications"] as const,
  };
}