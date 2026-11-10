import React, { useCallback, useEffect, useState } from "react";
import { classesService } from "../classes/classes.service";
import type { TeacherClassSummary } from "../classes/types";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";

import { useAuth } from "../auth/AuthContext";
import type { UserRole } from "../../constants/roles";
import { ROLE_LABELS } from "../../constants/roles";

/** Known module routes implemented so far. Others stay placeholders. */
const MODULE_ROUTES: Partial<Record<UserRole, Record<string, string>>> = {
  TEACHER: {
    classes: "/(teacher)/classes",
    attendance: "/(teacher)/attendance",
    marks: "/(teacher)/marks",
    assignments: "/(teacher)/assignments",
    timetable: "/(teacher)/timetable",
    announcements: "/(teacher)/announcements",
  },
  STUDENT: {
    timetable: "/(student)/timetable",
    assignments: "/(student)/assignments",
    results: "/(student)/results",
    attendance: "/(student)/attendance",
    fees: "/(student)/fees",
    library: "/(student)/library",
  },
  PARENT: {
    children: "/(parent)/children",
    attendance: "/(parent)/attendance",
    academics: "/(parent)/academics",
    fees: "/(parent)/fees",
    notifications: "/(parent)/notifications",
    messages: "/(parent)/messages",
  },
  ACCOUNTANT: {
    invoices: "/(accountant)/invoices",
    payments: "/(accountant)/payments",
    balances: "/(accountant)/balances",
    receipts: "/(accountant)/receipts",
    items: "/(accountant)/items",
    reports: "/(accountant)/reports",
  },
  LIBRARIAN: {
    catalogue: "/(librarian)/catalogue",
    borrowing: "/(librarian)/borrowing",
    returns: "/(librarian)/returns",
    inventory: "/(librarian)/inventory",
    history: "/(librarian)/history",
    reports: "/(librarian)/reports",
  },
  ADMIN: {
    students: "/(admin)/students",
    teachers: "/(admin)/teachers",
    classes: "/(admin)/classes",
    attendance: "/(admin)/attendance",
    fees: "/(admin)/fees",
    reports: "/(admin)/reports",
  },
  PLATFORM_ADMIN: {
    schools: "/(platform-admin)/schools",
    users: "/(platform-admin)/users",
    subscriptions: "/(platform-admin)/subscriptions",
    analytics: "/(platform-admin)/analytics",
    system: "/(platform-admin)/system",
    support: "/(platform-admin)/support",
  },
};

interface ModuleItem {
  id: string;
  title: string;
  description: string;
  badge?: string;
}

interface DashboardConfig {
  heading: string;
  description: string;
  stats: { label: string; value: string }[];
  modules: ModuleItem[];
}

const DASHBOARD_CONTENT: Record<UserRole, DashboardConfig> = {
  ADMIN: {
    heading: "School overview",
    description: "Manage operations across your school.",
    stats: [
      { label: "Students", value: "1,248" },
      { label: "Teachers", value: "86" },
      { label: "Classes", value: "42" },
      { label: "Attendance today", value: "94%" },
    ],
    modules: [
      {
        id: "students",
        title: "Students",
        description: "Profiles, enrollment and records",
      },
      {
        id: "teachers",
        title: "Teachers",
        description: "Staff directory and assignments",
      },
      {
        id: "classes",
        title: "Classes & sections",
        description: "Streams, subjects and terms",
      },
      {
        id: "attendance",
        title: "Attendance",
        description: "Daily tracking and reports",
      },
      {
        id: "fees",
        title: "Fees",
        description: "Invoices, balances and payments",
      },
      {
        id: "reports",
        title: "Reports",
        description: "Academic and operational insights",
      },
    ],
  },
  TEACHER: {
    heading: "Teaching overview",
    description: "Your classes, attendance and academic work.",
    stats: [
      { label: "My classes", value: "4" },
      { label: "Students", value: "128" },
      { label: "Pending marks", value: "2" },
      { label: "Assignments due", value: "5" },
    ],
    modules: [
      { id: "classes", title: "My classes", description: "Sections you teach" },
      {
        id: "attendance",
        title: "Attendance",
        description: "Take and review attendance",
      },
      {
        id: "marks",
        title: "Marks entry",
        description: "Record exam and continuous scores",
      },
      {
        id: "assignments",
        title: "Assignments",
        description: "Create, grade and feedback",
      },
      {
        id: "timetable",
        title: "Timetable",
        description: "Your weekly schedule",
      },
      {
        id: "announcements",
        title: "Announcements",
        description: "Post to your classes",
      },
    ],
  },
  STUDENT: {
    heading: "My learning",
    description: "Your timetable, results and assignments.",
    stats: [
      { label: "Attendance", value: "96%" },
      { label: "Open tasks", value: "3" },
      { label: "Next exam", value: "Fri" },
      { label: "Fee balance", value: "KSh 0" },
    ],
    modules: [
      {
        id: "timetable",
        title: "Timetable",
        description: "This week's classes",
      },
      {
        id: "assignments",
        title: "Assignments",
        description: "Submit and track work",
      },
      {
        id: "results",
        title: "Results",
        description: "Marks and report cards",
      },
      {
        id: "attendance",
        title: "Attendance",
        description: "Your attendance history",
      },
      {
        id: "fees",
        title: "Fees",
        description: "Invoices and payment history",
      },
      {
        id: "library",
        title: "Library",
        description: "Borrowed books and due dates",
      },
    ],
  },
  PARENT: {
    heading: "Parent overview",
    description: "Stay up to date with your children.",
    stats: [
      { label: "Children", value: "2" },
      { label: "Avg attendance", value: "95%" },
      { label: "Open fees", value: "1" },
      { label: "New notices", value: "3" },
    ],
    modules: [
      {
        id: "children",
        title: "My children",
        description: "Switch and view profiles",
      },
      {
        id: "attendance",
        title: "Attendance",
        description: "Daily and term summaries",
      },
      {
        id: "academics",
        title: "Academic performance",
        description: "Marks and report cards",
      },
      { id: "fees", title: "Fees", description: "Balances and receipts" },
      {
        id: "notifications",
        title: "Notifications",
        description: "School and class updates",
      },
      {
        id: "messages",
        title: "Messages",
        description: "Contact teachers (coming soon)",
      },
    ],
  },
  LIBRARIAN: {
    heading: "Library overview",
    description: "Catalogue, loans and returns.",
    stats: [
      { label: "Titles", value: "4,120" },
      { label: "On loan", value: "318" },
      { label: "Overdue", value: "27" },
      { label: "Returns today", value: "14" },
    ],
    modules: [
      {
        id: "catalogue",
        title: "Book catalogue",
        description: "Search and manage titles",
      },
      {
        id: "borrowing",
        title: "Borrowing",
        description: "Issue books to students",
      },
      {
        id: "returns",
        title: "Returns",
        description: "Check-in and clear loans",
      },
      {
        id: "inventory",
        title: "Inventory",
        description: "Copies and stock levels",
      },
      {
        id: "history",
        title: "Loan history",
        description: "By student or title",
      },
      {
        id: "reports",
        title: "Library reports",
        description: "Usage and overdue lists",
      },
    ],
  },
  ACCOUNTANT: {
    heading: "Finance overview",
    description: "Fees, payments and receipts.",
    stats: [
      { label: "Collected (term)", value: "KSh 12.4M" },
      { label: "Outstanding", value: "KSh 1.8M" },
      { label: "Invoices", value: "1,102" },
      { label: "Payments today", value: "38" },
    ],
    modules: [
      {
        id: "invoices",
        title: "Fee invoices",
        description: "Generate and manage invoices",
      },
      {
        id: "payments",
        title: "Payments",
        description: "Record and reconcile payments",
      },
      {
        id: "balances",
        title: "Outstanding balances",
        description: "Follow up on arrears",
      },
      {
        id: "receipts",
        title: "Receipts",
        description: "Download and share receipts",
      },
      {
        id: "items",
        title: "Fee items",
        description: "Configure fee structure",
      },
      {
        id: "reports",
        title: "Financial reports",
        description: "Term and year summaries",
      },
    ],
  },
  PLATFORM_ADMIN: {
    heading: "Platform overview",
    description: "Schools, subscriptions and system health.",
    stats: [
      { label: "Schools", value: "24" },
      { label: "Active users", value: "18.2k" },
      { label: "Trials", value: "5" },
      { label: "Open tickets", value: "7" },
    ],
    modules: [
      {
        id: "schools",
        title: "Schools",
        description: "Onboard and manage tenants",
      },
      {
        id: "users",
        title: "Platform users",
        description: "Cross-tenant administrators",
      },
      {
        id: "subscriptions",
        title: "Subscriptions",
        description: "Plans and billing status",
      },
      {
        id: "analytics",
        title: "Platform analytics",
        description: "Usage and growth",
      },
      {
        id: "system",
        title: "System admin",
        description: "Health, jobs and config",
      },
      {
        id: "support",
        title: "Support",
        description: "Tickets and announcements",
      },
    ],
  },
};

interface Props {
  role: UserRole;
}

export function RoleDashboard({ role }: Props) {
  const { session, signOut, isMockAuth } = useAuth();
  const insets = useSafeAreaInsets();
  const content = DASHBOARD_CONTENT[role];
  const [teacherClasses, setTeacherClasses] = useState<TeacherClassSummary[]>(
    [],
  );
  const [teacherClassesLoading, setTeacherClassesLoading] = useState(false);
  const [teacherClassesError, setTeacherClassesError] = useState<string | null>(
    null,
  );

  const loadTeacherClasses = useCallback(async () => {
    setTeacherClassesLoading(true);
    setTeacherClassesError(null);

    try {
      const result = await classesService.listMyClasses();
      setTeacherClasses(result);
    } catch (error) {
      setTeacherClassesError(
        error instanceof Error
          ? error.message
          : "Unable to load your teaching assignments.",
      );
    } finally {
      setTeacherClassesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === "TEACHER") {
      void loadTeacherClasses();
    }
  }, [role, loadTeacherClasses]);

  // Each class is grouped by section in classesService.
  // Count distinct subjects rather than counting each subject assignment as a class.
  const teacherSubjectCount = new Set(
    teacherClasses.flatMap((item) =>
      item.subjectName
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean),
    ),
  ).size;

  const teacherStudentCount = teacherClasses.reduce(
    (total, item) => total + item.studentCount,
    0,
  );

  const displayedStats =
    role === "TEACHER"
      ? [
          {
            label: "My classes",
            value: teacherClassesLoading ? "—" : String(teacherClasses.length),
          },
          {
            label: "Subjects",
            value: teacherClassesLoading ? "—" : String(teacherSubjectCount),
          },
          {
            label: "Students across classes",
            value: teacherClassesLoading ? "—" : String(teacherStudentCount),
          },
          {
            label: "Data source",
            value: isMockAuth ? "Demo" : "School",
          },
        ]
      : content.stats;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 16) + 12, paddingBottom: 40 },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.brand}>Stanfordos</Text>
          <Text style={styles.role}>{ROLE_LABELS[role]}</Text>
          {session?.tenant?.name ? (
            <Text style={styles.tenant}>{session.tenant.name}</Text>
          ) : null}
        </View>

        <Pressable style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.welcome}>
        <Text style={styles.greeting}>
          Hello, {session?.user.name ?? "User"}
        </Text>
        <Text style={styles.heading}>{content.heading}</Text>
        <Text style={styles.description}>{content.description}</Text>
      </View>

      <View style={styles.statsGrid}>
        {displayedStats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
      {role === "TEACHER" && (
        <View style={styles.teacherClassesSection}>
          <View style={styles.teacherClassesHeader}>
            <Text style={styles.sectionTitle}>Your teaching assignments</Text>

            <Pressable
              onPress={() => router.push("/(teacher)/classes" as Href)}
              accessibilityRole="button"
            >
              <Text style={styles.viewAllText}>View all</Text>
            </Pressable>
          </View>

          {teacherClassesLoading ? (
            <Text style={styles.dashboardHint}>Loading your classes...</Text>
          ) : teacherClassesError ? (
            <View style={styles.dashboardError}>
              <Text style={styles.dashboardErrorText}>
                {teacherClassesError}
              </Text>

              <Pressable onPress={() => void loadTeacherClasses()}>
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            </View>
          ) : teacherClasses.length === 0 ? (
            <Text style={styles.dashboardHint}>
              No teaching assignments were returned for this account.
            </Text>
          ) : (
            <View style={styles.teacherClassList}>
              {teacherClasses.slice(0, 4).map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.teacherClassCard}
                  onPress={() =>
                    router.push(`/(teacher)/classes/${item.id}` as Href)
                  }
                >
                  <View style={styles.teacherClassInfo}>
                    <Text style={styles.teacherClassName}>{item.name}</Text>
                    <Text style={styles.teacherClassSubjects}>
                      {item.subjectName || "Subject not specified"}
                    </Text>
                    <Text style={styles.teacherClassMeta}>
                      {item.gradeLevelName || "Class section"}
                    </Text>
                  </View>

                  <View style={styles.teacherClassCount}>
                    <Text style={styles.teacherClassCountValue}>
                      {item.studentCount}
                    </Text>
                    <Text style={styles.teacherClassCountLabel}>Students</Text>
                  </View>

                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}
      <Text style={styles.sectionTitle}>Modules</Text>

      <View style={styles.moduleList}>
        {content.modules.map((module) => (
          <Pressable
            key={module.id}
            style={({ pressed }) => [
              styles.moduleCard,
              pressed && styles.moduleCardPressed,
            ]}
            onPress={() => {
              const route = MODULE_ROUTES[role]?.[module.id];
              if (route) {
                router.push(route as Href);
              }
            }}
          >
            <View style={styles.moduleIcon}>
              <Text style={styles.moduleInitial}>{module.title.charAt(0)}</Text>
            </View>
            <View style={styles.moduleTextContainer}>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              <Text style={styles.moduleDescription}>{module.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>

      {isMockAuth ? (
        <Text style={styles.notice}>
          Demo mode — stats are sample data. Module screens and live API data
          will connect after backend integration.
        </Text>
      ) : (
        <Text style={styles.notice}>
          Module navigation and live school data are being connected.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  brand: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  role: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "600",
  },
  tenant: {
    fontSize: 12,
    color: "#1D4ED8",
    marginTop: 2,
    fontWeight: "600",
  },
  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
  },
  logoutText: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "700",
  },
  welcome: {
    marginTop: 28,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: "#64748B",
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 6,
  },
  description: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    width: "47%",
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  moduleList: {
    gap: 10,
  },
  moduleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
  },
  moduleCardPressed: {
    backgroundColor: "#F1F5F9",
  },
  moduleIcon: {
    height: 44,
    width: 44,
    borderRadius: 13,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  moduleInitial: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1D4ED8",
  },
  moduleTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  moduleDescription: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 3,
  },
  chevron: {
    fontSize: 22,
    color: "#CBD5E1",
    fontWeight: "300",
  },
  notice: {
    marginTop: 24,
    color: "#64748B",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  teacherClassesSection: {
    marginBottom: 28,
  },

  teacherClassesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  viewAllText: {
    color: "#1D4ED8",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
  },

  teacherClassList: {
    gap: 10,
  },

  teacherClassCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
  },

  teacherClassInfo: {
    flex: 1,
    paddingRight: 8,
  },

  teacherClassName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  teacherClassSubjects: {
    fontSize: 13,
    color: "#475569",
    marginTop: 4,
  },

  teacherClassMeta: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 3,
  },

  teacherClassCount: {
    alignItems: "center",
    marginRight: 12,
  },

  teacherClassCountValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  teacherClassCountLabel: {
    fontSize: 10,
    color: "#64748B",
  },

  dashboardHint: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
  },

  dashboardError: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 14,
  },

  dashboardErrorText: {
    color: "#B91C1C",
    fontSize: 13,
    lineHeight: 19,
  },

  retryText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 13,
    marginTop: 10,
  },
});
