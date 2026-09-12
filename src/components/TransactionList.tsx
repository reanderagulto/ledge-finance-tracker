"use client";

import { useState } from "react";
import { Trash2, Pencil, Inbox } from "lucide-react";
import type { Transaction } from "@/types";
import { formatDate, formatSignedCurrency } from "@/lib/format";

export function TransactionList({
  transactions,
  editingId,
  onEdit,
  onDelete,
}: {
  transactions: Transaction[];
  editingId?: string | null;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

  const filtered = transactions.filter(
    (t) => filter === "ALL" || t.type === filter,
  );

  return (
    <div className="flex h-full flex-col rounded-lg border border-line bg-paper-raised shadow-card">
      <div className="flex items-start sm:items-center justify-between border-b border-line px-5 py-4 flex-col sm:flex-row">
        <h2 className="font-display text-lg">Recent activity</h2>
        <div className="flex gap-1 rounded-md bg-paper p-1 text-sm">
          {(["ALL", "INCOME", "EXPENSE"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-2.5 py-1 transition-colors ${
                filter === f
                  ? "bg-paper-raised text-ink shadow-sm"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {f === "ALL" ? "All" : f === "INCOME" ? "Income" : "Expenses"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-16 text-center">
          <Inbox className="h-6 w-6 text-ink-faint" strokeWidth={1.5} />
          <p className="text-sm text-ink-soft">
            No entries yet. Add your first one to start the ledger.
          </p>
        </div>
      ) : (
        <ul className="max-h-[520px] divide-y divide-line overflow-y-auto scrollbar-thin">
          {filtered.map((t) => {
            const isEditing = t.id === editingId;
            return (
              <li
                key={t.id}
                className={`group flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors ${
                  isEditing ? "bg-brass-soft" : ""
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        t.type === "INCOME" ? "bg-gain" : "bg-loss"
                      }`}
                    />
                    <p className="truncate font-medium">{t.category}</p>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-ink-soft">
                    {formatDate(t.date)}
                    {t.description ? ` · ${t.description}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`font-mono tabular ${
                      t.type === "INCOME" ? "text-gain" : "text-loss"
                    }`}
                  >
                    {t.type === "INCOME" ? "+" : "-"}
                    {formatSignedCurrency(t.amount)}
                  </span>
                  <div className={`flex items-center gap-1`}>
                    <button
                      onClick={() => onEdit(t)}
                      aria-label={`Edit ${t.category} entry`}
                      className={`rounded p-1 hover:bg-brass-soft hover:text-brass ${
                        isEditing ? "text-brass" : "text-ink-faint"
                      }`}
                    >
                      <Pencil className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                    <button
                      onClick={() => onDelete(t.id)}
                      aria-label={`Delete ${t.category} entry`}
                      className="rounded p-1 text-ink-faint hover:bg-loss-soft hover:text-loss"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
