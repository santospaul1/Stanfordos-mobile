import { apiGet } from "../../api/client";
import { API_ENDPOINTS } from "../../api/endpoints";

import type {
  ParentChild,
  ParentAttendanceDay,
  ParentFeeInvoice,
  ParentFeePayment,
  ParentExamResult,
} from "./mock-parent";

import type { AttendanceStatus } from "./mock-parent";

interface BackendChild {
  id: number | string;
  firstName?: string | null;
  lastName?: string | null;
  rollNumber?: string | null;
  admissionNumber?: string | null;
  classSectionName?: string | null;
  gradeLevelName?: string | null;
  relationship?: string | null;
  isPrimary?: boolean;
}

interface BackendAttendanceRecord {
  id: number | string;
  classSessionId: number | string;
  sessionDate: string;
  studentId: number | string;
  studentName: string;
  status: string;
}

interface BackendFeeInvoice {
  id: number | string;
  studentId: number | string;
  studentName: string;
  termId: number | string;
  termName: string;
  lineItems?: Array<{
    feeItemId: number | string;
    feeItemName: string;
    amount: number | string;
  }>;
  totalBilled: number | string;
  totalPaid: number | string;
  balance: number | string;
  createdAt: string;
  dueDate: string | null;
  invoiceNumber: string;
  carriedForward: boolean;
}

interface BackendFeePayment {
  id: number | string;
  invoiceId: number | string;
  amount: number | string;
  method: string;
  paymentDate: string;
  reference?: string | null;
}

function amount(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function fullName(firstName?: string | null, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

function mapChild(child: BackendChild): ParentChild {
  return {
    id: String(child.id),
    fullName:
      fullName(child.firstName, child.lastName) ||
      child.admissionNumber ||
      "Student",
    admissionNumber:
      child.admissionNumber ?? child.rollNumber ?? "Not provided",
    classSectionName: child.classSectionName ?? "Unassigned",
    gradeLevelName: child.gradeLevelName ?? "Unassigned",
  };
}

function mapAttendanceStatus(value: string): AttendanceStatus {
  const normalized = value.toUpperCase();

  switch (normalized) {
    case "PRESENT":
    case "ABSENT":
    case "LATE":
    case "EXCUSED":
      return normalized;

    default:
      // Do not silently convert unknown backend values to PRESENT.
      throw new Error(
        `Unsupported attendance status received from server: ${value}`,
      );
  }
}

function mapAttendance(record: BackendAttendanceRecord): ParentAttendanceDay {
  return {
    date: record.sessionDate,
    status: mapAttendanceStatus(record.status),
    note: null,
  };
}

function mapInvoice(invoice: BackendFeeInvoice): ParentFeeInvoice {
  const billed = amount(invoice.totalBilled);
  const paid = amount(invoice.totalPaid);
  const balance = amount(invoice.balance);

  let status: ParentFeeInvoice["status"];

  if (balance <= 0) {
    status = "PAID";
  } else if (paid > 0) {
    status = "PARTIAL";
  } else if (
    invoice.dueDate &&
    invoice.dueDate < new Date().toISOString().slice(0, 10)
  ) {
    status = "OVERDUE";
  } else {
    status = "DUE";
  }

  const title =
    invoice.lineItems
      ?.map((item) => item.feeItemName)
      .filter(Boolean)
      .join(", ") ||
    invoice.invoiceNumber ||
    "School fees";

  return {
    id: String(invoice.id),
    title,
    termName: invoice.termName ?? "Current term",
    amount: billed,
    paid,
    balance,
    dueDate: invoice.dueDate ?? "Not specified",
    status,
  };
}

function mapPayment(payment: BackendFeePayment): ParentFeePayment {
  return {
    id: String(payment.id),
    invoiceId: String(payment.invoiceId),
    amount: amount(payment.amount),
    paidAt: payment.paymentDate,
    method: payment.method,
    receiptNo: payment.reference ?? String(payment.id),
  };
}

let cachedChildren: ParentChild[] = [];
let selectedChildId: string | null = null;

async function getChildren(): Promise<ParentChild[]> {
  const response = await apiGet<BackendChild[]>(
    API_ENDPOINTS.PARENT.MY_CHILDREN,
  );

  cachedChildren = response.map(mapChild);

  if (
    selectedChildId &&
    !cachedChildren.some((child) => child.id === selectedChildId)
  ) {
    selectedChildId = null;
  }

  if (!selectedChildId && cachedChildren.length > 0) {
    selectedChildId = cachedChildren[0].id;
  }

  return cachedChildren;
}

function requireChildId(childId?: string | null): string {
  const id = childId ?? selectedChildId;

  if (!id) {
    throw new Error("Select a child first.");
  }

  // The backend still validates that the authenticated parent
  // is linked to the requested child.
  return id;
}

async function getInvoices(childId: string): Promise<BackendFeeInvoice[]> {
  return apiGet<BackendFeeInvoice[]>(
    API_ENDPOINTS.FEES.STUDENT_INVOICES(childId),
  );
}

export const parentApiService = {
  async listChildren(): Promise<ParentChild[]> {
    return getChildren();
  },

  getSelectedChildId(): string | null {
    return selectedChildId;
  },

  async selectChild(childId: string): Promise<ParentChild> {
    let children = cachedChildren;

    if (children.length === 0) {
      children = await getChildren();
    }

    const child = children.find((item) => item.id === childId);

    if (!child) {
      throw new Error("This child is not linked to your account.");
    }

    selectedChildId = childId;

    return child;
  },

  async getSelectedChild(): Promise<ParentChild | null> {
    const children = await getChildren();

    if (!selectedChildId) {
      return null;
    }

    return children.find((child) => child.id === selectedChildId) ?? null;
  },

  async listAttendance(childId?: string): Promise<ParentAttendanceDay[]> {
    const id = requireChildId(childId);

    const records = await apiGet<BackendAttendanceRecord[]>(
      API_ENDPOINTS.ATTENDANCE.STUDENT(id),
    );

    return records
      .map(mapAttendance)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  async listInvoices(childId?: string): Promise<ParentFeeInvoice[]> {
    const id = requireChildId(childId);
    const invoices = await getInvoices(id);

    return invoices.map(mapInvoice);
  },

  async listPayments(childId?: string): Promise<ParentFeePayment[]> {
    const id = requireChildId(childId);
    const invoices = await getInvoices(id);

    const paymentLists = await Promise.all(
      invoices.map((invoice) =>
        apiGet<BackendFeePayment[]>(
          API_ENDPOINTS.FEES.INVOICE_PAYMENTS(invoice.id),
        ),
      ),
    );

    return paymentLists
      .flat()
      .map(mapPayment)
      .sort((a, b) => b.paidAt.localeCompare(a.paidAt));
  },

  async listResults(_childId?: string): Promise<ParentExamResult[]> {
    throw new Error(
      "Parent academic results are not enabled by the backend yet.",
    );
  },

  async getResult(
    _resultId: string,
    _childId?: string,
  ): Promise<ParentExamResult> {
    throw new Error(
      "Parent academic results are not enabled by the backend yet.",
    );
  },
};
