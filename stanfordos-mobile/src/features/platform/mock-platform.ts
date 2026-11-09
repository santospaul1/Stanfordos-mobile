function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export interface PlatformSchool {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "TRIAL" | "SUSPENDED";
  students: number;
  plan: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolName?: string | null;
}

export interface SubscriptionRow {
  id: string;
  schoolName: string;
  plan: string;
  status: "ACTIVE" | "TRIAL" | "PAST_DUE" | "CANCELLED";
  renewsOn: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  schoolName: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  updatedAt: string;
}

const SCHOOLS: PlatformSchool[] = [
  { id: "sch-1", name: "Stanford Demo Academy", slug: "demo", status: "ACTIVE", students: 1248, plan: "Growth" },
  { id: "sch-2", name: "Lakeview Secondary", slug: "lakeview", status: "ACTIVE", students: 860, plan: "Starter" },
  { id: "sch-3", name: "Greenfield Primary", slug: "greenfield", status: "TRIAL", students: 210, plan: "Trial" },
  { id: "sch-4", name: "Ridge High", slug: "ridge", status: "SUSPENDED", students: 540, plan: "Growth" },
];

const USERS: PlatformUser[] = [
  { id: "pu-1", name: "Perry Platform", email: "platform@demo.com", role: "PLATFORM_ADMIN" },
  { id: "pu-2", name: "Ada Admin", email: "admin@demo.com", role: "ADMIN", schoolName: "Stanford Demo Academy" },
  { id: "pu-3", name: "Lakeview Admin", email: "admin@lakeview.sch", role: "ADMIN", schoolName: "Lakeview Secondary" },
];

const SUBS: SubscriptionRow[] = [
  { id: "sub-1", schoolName: "Stanford Demo Academy", plan: "Growth", status: "ACTIVE", renewsOn: "2027-01-01" },
  { id: "sub-2", schoolName: "Lakeview Secondary", plan: "Starter", status: "ACTIVE", renewsOn: "2026-12-15" },
  { id: "sub-3", schoolName: "Greenfield Primary", plan: "Trial", status: "TRIAL", renewsOn: "2026-11-20" },
  { id: "sub-4", schoolName: "Ridge High", plan: "Growth", status: "PAST_DUE", renewsOn: "2026-10-01" },
];

const TICKETS: SupportTicket[] = [
  { id: "tk-1", subject: "Cannot export report cards", schoolName: "Lakeview Secondary", priority: "HIGH", status: "OPEN", updatedAt: "2026-11-09" },
  { id: "tk-2", subject: "Add second campus", schoolName: "Stanford Demo Academy", priority: "MEDIUM", status: "IN_PROGRESS", updatedAt: "2026-11-08" },
  { id: "tk-3", subject: "Billing invoice question", schoolName: "Ridge High", priority: "LOW", status: "RESOLVED", updatedAt: "2026-11-05" },
];

export const mockPlatformService = {
  async listSchools(): Promise<PlatformSchool[]> {
    await delay(350);
    return SCHOOLS.map((s) => ({ ...s }));
  },
  async listUsers(): Promise<PlatformUser[]> {
    await delay(300);
    return USERS.map((u) => ({ ...u }));
  },
  async listSubscriptions(): Promise<SubscriptionRow[]> {
    await delay(300);
    return SUBS.map((s) => ({ ...s }));
  },
  async getAnalytics() {
    await delay(300);
    return {
      schools: SCHOOLS.length,
      activeUsers: 18200,
      trials: SCHOOLS.filter((s) => s.status === "TRIAL").length,
      openTickets: TICKETS.filter((t) => t.status !== "RESOLVED").length,
      monthlyActiveSchools: 19,
      collectionRate: "91%",
    };
  },
  async getSystemHealth() {
    await delay(250);
    return [
      { name: "API", status: "Healthy", detail: "p99 180ms" },
      { name: "Database", status: "Healthy", detail: "Connections 42/100" },
      { name: "Email", status: "Degraded", detail: "Queue lag 2m" },
      { name: "Storage", status: "Healthy", detail: "68% used" },
    ];
  },
  async listTickets(): Promise<SupportTicket[]> {
    await delay(300);
    return TICKETS.map((t) => ({ ...t }));
  },
};
