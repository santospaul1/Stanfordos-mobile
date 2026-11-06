import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../auth/AuthContext";
import type { UserRole } from "../../constants/roles";
import { ROLE_LABELS } from "../../constants/roles";
import { OfflineBanner } from "../../components/feedback/OfflineBanner";
interface Props {
  role: UserRole;
}

const DASHBOARD_CONTENT: Record<
  UserRole,
  {
    heading: string;
    description: string;
    modules: string[];
  }
> = {
  ADMIN: {
    heading: "School overview",
    description: "Manage your school operations.",
    modules: ["Students", "Teachers", "Classes", "Attendance"],
  },
  TEACHER: {
    heading: "Teaching overview",
    description: "Manage your classes and academic activities.",
    modules: ["My classes", "Attendance", "Examinations", "Assignments"],
  },
  STUDENT: {
    heading: "My learning",
    description: "View your academic information and learning activities.",
    modules: ["My timetable", "Attendance", "Results", "Assignments"],
  },
  PARENT: {
    heading: "Parent overview",
    description: "Keep track of your children's school activities.",
    modules: ["My children", "Attendance", "Academic results", "Fees"],
  },
  LIBRARIAN: {
    heading: "Library overview",
    description: "Manage library operations and resources.",
    modules: ["Book catalogue", "Borrowing", "Returns", "Library records"],
  },
  ACCOUNTANT: {
    heading: "Finance overview",
    description: "Manage school financial operations.",
    modules: ["Fee records", "Payments", "Outstanding balances", "Receipts"],
  },
  PLATFORM_ADMIN: {
    heading: "Platform overview",
    description: "Manage the Stanfordos platform.",
    modules: ["Schools", "Platform users", "Subscriptions", "Platform reports"],
  },
};

export function RoleDashboard({ role }: Props) {
  const { session, signOut } = useAuth();
  const content = DASHBOARD_CONTENT[role];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
         <OfflineBanner />
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>Stanfordos</Text>
          <Text style={styles.role}>{ROLE_LABELS[role]}</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={signOut}
        >
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.welcome}>
        <Text style={styles.greeting}>
          Hello, {session?.user.name ?? "User"}
        </Text>

        <Text style={styles.heading}>{content.heading}</Text>

        <Text style={styles.description}>
          {content.description}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Your modules</Text>

      <View style={styles.moduleList}>
        {content.modules.map((module) => (
          <View key={module} style={styles.moduleCard}>
            <View style={styles.moduleIcon}>
              <Text style={styles.moduleInitial}>
                {module.charAt(0)}
              </Text>
            </View>

            <View style={styles.moduleTextContainer}>
              <Text style={styles.moduleTitle}>{module}</Text>
              <Text style={styles.moduleDescription}>
                Module setup pending
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.notice}>
        Dashboard preview. Live school data and module navigation
        will be connected after the backend API audit.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 22,
    paddingTop: 56,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    marginTop: 36,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 14,
    color: "#64748B",
  },
  heading: {
    fontSize: 27,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 8,
  },
  description: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 21,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 14,
  },
  moduleList: {
    gap: 12,
  },
  moduleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
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
    marginLeft: 14,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  moduleDescription: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
  },
  notice: {
    marginTop: 26,
    color: "#64748B",
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
  },
});