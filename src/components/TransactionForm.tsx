"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Pencil, X } from "lucide-react";
import type { Transaction, TransactionInput, TransactionType } from "@/types";

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

function toDateInputValue(value: string) {
  const d = new Date(value);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function TransactionForm({
  editingTransaction,
  onSubmit,
  onUpdate,
  onCancelEdit,
}: {
  editingTransaction: Transaction | null;
  onSubmit: (input: TransactionInput) => Promise<void>;
  onUpdate: (id: string, input: TransactionInput) => Promise<void>;
  onCancelEdit: () => void;
}) {
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayInputValue());
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(editingTransaction);

  // Populate the form when an entry is selected for editing, and reset it
  // back to a blank "add" state once editing ends (saved or cancelled).
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description || "");
      setDate(toDateInputValue(editingTransaction.date));
    } else {
      setType("EXPENSE");
      setAmount("");
      setCategory("");
      setDescription("");
      setDate(todayInputValue());
    }
  }, [editingTransaction]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!amount || !category) return;
    setSubmitting(true);
    try {
      const input: TransactionInput = {
        type,
        amount: Number(amount),
        category,
        description: description || undefined,
        date: new Date(date).toISOString(),
      };

      if (editingTransaction) {
        await onUpdate(editingTransaction.id, input);
        // onCancelEdit() is called by the parent once the update succeeds,
        // which clears editingTransaction and resets this form via the effect above.
      } else {
        await onSubmit(input);
        setAmount("");
        setCategory("");
        setDescription("");
        setDate(todayInputValue());
      }
    } finally {
      setSubmitting(false);
    }
  }

  const accent = type === "INCOME" ? "gain" : "loss";

  return (
    <div
      className={`rounded-lg border bg-paper-raised p-5 shadow-card transition-colors ${
        isEditing ? "border-brass" : "border-line"
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg">
          {isEditing ? "Edit entry" : "Add an entry"}
        </h2>
      </div>

      <div
        className={`mt-4 grid grid-cols-2 gap-1 rounded-md bg-paper p-1 ${isEditing ? `disabled pointer-events-none` : ``}`}
      >
        {(["EXPENSE", "INCOME"] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t);
              if (!isEditing) setCategory("");
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
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a short note"
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 outline-none focus:border-brass"
          ></textarea>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60 ${
              accent === "gain" ? "bg-gain" : "bg-loss"
            }`}
          >
            {isEditing ? (
              <Pencil className="h-4 w-4" strokeWidth={2} />
            ) : (
              <Plus className="h-4 w-4" strokeWidth={2} />
            )}
            {submitting
              ? "Saving…"
              : isEditing
                ? `Update ${type === "INCOME" ? "income" : "expense"}`
                : `Add ${type === "INCOME" ? "income" : "expense"}`}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-md border border-line px-4 py-2.5 text-sm font-medium text-ink-soft hover:text-ink"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
