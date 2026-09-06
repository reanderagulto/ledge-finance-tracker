"use client";

import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import type { Transaction, TransactionInput } from "@/types";
import { SummaryCards } from "@/components/SummaryCards";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { ReportsPanel } from "@/components/ReportsPanel";
import { LogoutButton } from "@/components/LogoutButton";

export function Dashboard({
  initialTransactions,
  userEmail,
}: {
  initialTransactions: Transaction[];
  userEmail: string;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>(
    initialTransactions
  );
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((s, t) => s + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [transactions]);

  async function handleCreate(input: TransactionInput) {
    setError(null);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Something went wrong. Please try again.");
      return;
    }
    const created: Transaction = await res.json();
    setTransactions((prev) =>
      [created, ...prev].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  }

  async function handleDelete(id: string) {
    const prev = transactions;
    setTransactions((t) => t.filter((tx) => tx.id !== id));
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setTransactions(prev);
      setError("Could not delete that entry. Please try again.");
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-paper-raised">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-brass" strokeWidth={1.75} />
            <span className="font-display text-xl tracking-tight">Ledger</span>
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-ink-soft sm:block">
              {new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              }).format(new Date())}
            </p>
            <span className="hidden text-sm text-ink-faint sm:block">·</span>
            <p className="hidden text-sm text-ink-soft sm:block">{userEmail}</p>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {error && (
          <div className="rounded-lg border border-loss/30 bg-loss-soft px-4 py-3 text-sm text-loss">
            {error}
          </div>
        )}

        <SummaryCards
          income={totals.income}
          expense={totals.expense}
          net={totals.net}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <TransactionForm onSubmit={handleCreate} />
          </div>
          <div className="lg:col-span-3">
            <TransactionList transactions={transactions} onDelete={handleDelete} />
          </div>
        </div>

        <ReportsPanel />
      </main>
    </div>
  );
}
