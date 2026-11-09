function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export interface BookTitle {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  copiesTotal: number;
  copiesAvailable: number;
  category: string;
}

export interface LoanRecord {
  id: string;
  bookTitle: string;
  studentName: string;
  admissionNumber: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string | null;
  status: "ON_LOAN" | "OVERDUE" | "RETURNED";
}

export interface InventoryCopy {
  id: string;
  bookTitle: string;
  copyCode: string;
  status: "AVAILABLE" | "ON_LOAN" | "DAMAGED" | "LOST";
}

const BOOKS: BookTitle[] = [
  { id: "bk-1", title: "Things Fall Apart", author: "Chinua Achebe", isbn: "978-0385474542", copiesTotal: 12, copiesAvailable: 4, category: "Literature" },
  { id: "bk-2", title: "Secondary Mathematics Form 1", author: "KLB", isbn: "978-9966-01", copiesTotal: 40, copiesAvailable: 18, category: "Textbook" },
  { id: "bk-3", title: "The River Between", author: "Ngũgĩ wa Thiong'o", copiesTotal: 8, copiesAvailable: 1, category: "Literature" },
  { id: "bk-4", title: "Physics for Secondary", author: "Longhorn", copiesTotal: 25, copiesAvailable: 9, category: "Textbook" },
];

const LOANS: LoanRecord[] = [
  { id: "ln-1", bookTitle: "Things Fall Apart", studentName: "Sam Student", admissionNumber: "ADM0001", borrowedAt: "2026-10-20", dueDate: "2026-11-10", status: "ON_LOAN" },
  { id: "ln-2", bookTitle: "Secondary Mathematics Form 1", studentName: "Amina Okello", admissionNumber: "ADM0014", borrowedAt: "2026-10-01", dueDate: "2026-10-25", status: "OVERDUE" },
  { id: "ln-3", bookTitle: "The River Between", studentName: "Brian Wanjiku", admissionNumber: "ADM0008", borrowedAt: "2026-09-01", dueDate: "2026-09-20", returnedAt: "2026-09-18", status: "RETURNED" },
  { id: "ln-4", bookTitle: "Physics for Secondary", studentName: "Cynthia Otieno", admissionNumber: "ADM0022", borrowedAt: "2026-11-05", dueDate: "2026-11-25", status: "ON_LOAN" },
];

const COPIES: InventoryCopy[] = [
  { id: "cp-1", bookTitle: "Things Fall Apart", copyCode: "LIT-TFA-01", status: "AVAILABLE" },
  { id: "cp-2", bookTitle: "Things Fall Apart", copyCode: "LIT-TFA-02", status: "ON_LOAN" },
  { id: "cp-3", bookTitle: "Secondary Mathematics Form 1", copyCode: "TB-MATH1-07", status: "ON_LOAN" },
  { id: "cp-4", bookTitle: "The River Between", copyCode: "LIT-TRB-03", status: "DAMAGED" },
  { id: "cp-5", bookTitle: "Physics for Secondary", copyCode: "TB-PHY-11", status: "AVAILABLE" },
];

export const mockLibrarianService = {
  async listCatalogue(query?: string): Promise<BookTitle[]> {
    await delay(350);
    const q = (query ?? "").trim().toLowerCase();
    return BOOKS.filter(
      (b) =>
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
    ).map((b) => ({ ...b }));
  },
  async listActiveLoans(): Promise<LoanRecord[]> {
    await delay(300);
    return LOANS.filter((l) => l.status !== "RETURNED").map((l) => ({ ...l }));
  },
  async listReturnsDue(): Promise<LoanRecord[]> {
    await delay(300);
    return LOANS.filter((l) => l.status === "ON_LOAN" || l.status === "OVERDUE").map((l) => ({ ...l }));
  },
  async listInventory(): Promise<InventoryCopy[]> {
    await delay(300);
    return COPIES.map((c) => ({ ...c }));
  },
  async listHistory(): Promise<LoanRecord[]> {
    await delay(300);
    return LOANS.map((l) => ({ ...l }));
  },
  async getReportSummary() {
    await delay(250);
    return {
      titles: BOOKS.length,
      onLoan: LOANS.filter((l) => l.status === "ON_LOAN").length,
      overdue: LOANS.filter((l) => l.status === "OVERDUE").length,
      availableCopies: COPIES.filter((c) => c.status === "AVAILABLE").length,
    };
  },
};
