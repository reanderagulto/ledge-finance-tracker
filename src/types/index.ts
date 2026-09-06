export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
  date: string; // ISO string
  createdAt: string;
  updatedAt: string;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export type Period = "daily" | "weekly" | "monthly" | "quarterly" | "annual";

export interface ReportBucket {
  key: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
}

export interface ReportResponse {
  period: Period;
  range: { start: string; end: string };
  totals: { income: number; expense: number; net: number };
  buckets: ReportBucket[];
  categories: {
    income: CategoryBreakdown[];
    expense: CategoryBreakdown[];
  };
}
