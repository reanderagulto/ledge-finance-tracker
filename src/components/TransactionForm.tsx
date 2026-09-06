"use client";

import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import type { TransactionInput, TransactionType } from "@/types";

const CATEGORY_SUGGESTIONS: Record<TransactionType, string[]> = {
  INCOME: ["Salary", "Freelance", "Investments", "Gift", "Other"],
  EXPENSE: [
    "Housing",
    "Groceries",
    "Transport",
    "Utilities",
    "Dining",
    "Health",
    "Entertainment",
    "Other",
  ],
};

function todayInputValue() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function TransactionForm({
  onSubmit,
}: {
  onSubmit: (input: TransactionInput) => Promise<void>;
}) {
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayInputValue());
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!amount || !category) return;
    setSubmitting(true);
    try {
      await onSubmit({
        type,
        amount: Number(amount),
        category,
        description: description || undefined,
        date: new Date(date).toISOString(),
      });
      setAmount("");
      setCategory("");
      setDescription("");
      setDate(todayInputValue());
    } finally {
      setSubmitting(false);
    }
  }

  const accent = type === "INCOME" ? "gain" : "loss";

  return (
    <div className="rounded-lg border border-line bg-paper-raised p-5 shadow-card">
      <h2 className="font-display text-lg">Add an entry</h2>

      <div className="mt-4 grid grid-cols-2 gap-1 rounded-md bg-paper p-1">
        {(["EXPENSE", "INCOME"] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t);
              setCategory("");
            }}
            className={`rounded py-1.5 text-sm font-medium transition-colors ${
              type === t
                ? t === "INCOME"
                  ? "bg-gain text-white"
                  : "bg-loss text-white"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {t === "INCOME" ? "Income" : "Expense"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm text-ink-soft" htmlFor="amount">
            Amount
          </label>
          <div className="mt-1 flex items-center rounded-md border border-line bg-paper focus-within:border-brass">
            <span className="pl-3 text-ink-faint">₱</span>
            <input
              id="amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent px-2 py-2 font-mono tabular outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-ink-soft" htmlFor="category">
            Category
          </label>
          <input
            id="category"
            list="category-suggestions"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={type === "INCOME" ? "e.g. Salary" : "e.g. Groceries"}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 outline-none focus:border-brass"
          />
          <datalist id="category-suggestions">
            {CATEGORY_SUGGESTIONS[type].map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm text-ink-soft" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 outline-none focus:border-brass"
          />
        </div>

        <div>
          <label className="block text-sm text-ink-soft" htmlFor="description">
            Note <span className="text-ink-faint">(optional)</span>
          </label>
          <input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a short note"
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 outline-none focus:border-brass"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`flex w-full items-center justify-center gap-1.5 rounded-md py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60 ${
            accent === "gain" ? "bg-gain" : "bg-loss"
          }`}
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          {submitting
            ? "Saving…"
            : `Add ${type === "INCOME" ? "income" : "expense"}`}
        </button>
      </form>
    </div>
  );
}
