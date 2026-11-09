function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export type InvoiceStatus = "PAID" | "PARTIAL" | "DUE" | "OVERDUE";

export interface FeeInvoice {
  id: string;
  studentName: string;
  admissionNumber: string;
  title: string;
  termName: string;
  amount: number;
  paid: number;
  balance: number;
  dueDate: string;
  status: InvoiceStatus;
}

export interface FeePayment {
  id: string;
  studentName: string;
  amount: number;
  paidAt: string;
  method: string;
  receiptNo: string;
  invoiceId: string;
}

export interface FeeItem {
  id: string;
  name: string;
  defaultAmount: number;
  category: string;
  active: boolean;
}

export interface BalanceRow {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classSectionName: string;
  balance: number;
}

const INVOICES: FeeInvoice[] = [
  { id: "ai-1", studentName: "Sam Student", admissionNumber: "ADM0001", title: "Tuition — Term 2", termName: "Term 2 2026", amount: 45000, paid: 45000, balance: 0, dueDate: "2026-09-15", status: "PAID" },
  { id: "ai-2", studentName: "Amina Okello", admissionNumber: "ADM0014", title: "Tuition — Term 2", termName: "Term 2 2026", amount: 48000, paid: 30000, balance: 18000, dueDate: "2026-09-15", status: "PARTIAL" },
  { id: "ai-3", studentName: "Brian Wanjiku", admissionNumber: "ADM0008", title: "Activity fee", termName: "Term 2 2026", amount: 3500, paid: 0, balance: 3500, dueDate: "2026-11-01", status: "OVERDUE" },
  { id: "ai-4", studentName: "Cynthia Otieno", admissionNumber: "ADM0022", title: "Boarding — Term 2", termName: "Term 2 2026", amount: 28000, paid: 0, balance: 28000, dueDate: "2026-10-01", status: "DUE" },
];

const PAYMENTS: FeePayment[] = [
  { id: "ap-1", studentName: "Sam Student", amount: 45000, paidAt: "2026-09-10", method: "Bank transfer", receiptNo: "RCPT-10021", invoiceId: "ai-1" },
  { id: "ap-2", studentName: "Amina Okello", amount: 30000, paidAt: "2026-09-12", method: "M-Pesa", receiptNo: "RCPT-10055", invoiceId: "ai-2" },
  { id: "ap-3", studentName: "Daniel Kamau", amount: 12000, paidAt: "2026-11-09", method: "Cash", receiptNo: "RCPT-10102", invoiceId: "ai-x" },
];

const ITEMS: FeeItem[] = [
  { id: "fi-1", name: "Tuition", defaultAmount: 45000, category: "Academic", active: true },
  { id: "fi-2", name: "Boarding", defaultAmount: 28000, category: "Boarding", active: true },
  { id: "fi-3", name: "Activity fee", defaultAmount: 3500, category: "Extra", active: true },
  { id: "fi-4", name: "Transport", defaultAmount: 8000, category: "Transport", active: false },
];

export const mockAccountantService = {
  async listInvoices(): Promise<FeeInvoice[]> {
    await delay(350);
    return INVOICES.map((i) => ({ ...i }));
  },
  async listPayments(): Promise<FeePayment[]> {
    await delay(300);
    return PAYMENTS.map((p) => ({ ...p }));
  },
  async listBalances(): Promise<BalanceRow[]> {
    await delay(350);
    return INVOICES.filter((i) => i.balance > 0).map((i) => ({
      studentId: i.id,
      studentName: i.studentName,
      admissionNumber: i.admissionNumber,
      classSectionName: "—",
      balance: i.balance,
    }));
  },
  async listReceipts(): Promise<FeePayment[]> {
    await delay(300);
    return PAYMENTS.map((p) => ({ ...p }));
  },
  async listFeeItems(): Promise<FeeItem[]> {
    await delay(300);
    return ITEMS.map((i) => ({ ...i }));
  },
  async getReportSummary() {
    await delay(300);
    const collected = PAYMENTS.reduce((s, p) => s + p.amount, 0);
    const outstanding = INVOICES.reduce((s, i) => s + i.balance, 0);
    return {
      collected,
      outstanding,
      invoiceCount: INVOICES.length,
      paymentCount: PAYMENTS.length,
      overdueCount: INVOICES.filter((i) => i.status === "OVERDUE").length,
    };
  },
};
