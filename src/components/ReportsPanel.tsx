"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Period, ReportResponse } from "@/types";
import { formatCurrency, formatSignedCurrency } from "@/lib/format";

const PERIODS: { value: Period; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
];

type ViewFilter = "BOTH" | "INCOME" | "EXPENSE";

export function ReportsPanel() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [view, setView] = useState<ViewFilter>("BOTH");
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/reports?period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  const showIncome = view !== "EXPENSE";
  const showExpense = view !== "INCOME";

  return (
    <section className="rounded-lg border border-line bg-paper-raised p-5 shadow-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg">Reports</h2>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden gap-2 rounded-md bg-paper p-1 text-sm md:flex">
            {(["BOTH", "INCOME", "EXPENSE"] as ViewFilter[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded px-2.5 py-1 transition-colors ${
                  view === v
                    ? "bg-paper-raised text-ink shadow-sm"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {v === "BOTH" ? "Both" : v === "INCOME" ? "Income" : "Expenses"}
              </button>
            ))}
          </div>

          <div className="block w-full gap-2 rounded-md bg-paper p-1 text-sm md:hidden">
            <select
              className="w-full rounded px-2.5 py-1 transition-colors bg-paper text-ink-soft hover:text-ink focus:outline-none"
              onChange={(e) => setView(e.target.value as ViewFilter)}
            >
              {(["BOTH", "INCOME", "EXPENSE"] as ViewFilter[]).map((v) => (
                <option
                  key={v}
                  value={v}
                  className={`rounded px-2.5 py-1 transition-colors ${
                    view === v
                      ? "bg-paper-raised text-ink shadow-sm"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {v === "BOTH"
                    ? "Both"
                    : v === "INCOME"
                      ? "Income"
                      : "Expenses"}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden gap-2 rounded-md bg-paper p-1 text-sm md:flex">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`rounded px-2.5 py-1 transition-colors ${
                  period === p.value
                    ? "bg-brass text-white"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="block w-full gap-2 rounded-md bg-paper p-1 text-sm md:hidden">
            <select
              className="w-full rounded px-2.5 py-1 transition-colors bg-paper text-ink-soft hover:text-ink focus:outline-none"
              onChange={(e) => setPeriod(e.target.value as Period)}
            >
              {PERIODS.map((p) => (
                <option
                  key={p.value}
                  value={p.value}
                  className={`rounded px-2.5 py-1 transition-colors ${
                    period === p.value
                      ? "bg-brass text-white"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading || !report ? (
        <div className="flex h-64 items-center justify-center text-sm text-ink-soft">
          Loading report…
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-line pb-5">
            <Stat
              label="This period · income"
              value={report.totals.income}
              tone="gain"
            />
            <Stat
              label="This period · expenses"
              value={report.totals.expense}
              tone="loss"
            />
            <Stat
              label="This period · net"
              value={report.totals.net}
              tone={report.totals.net >= 0 ? "ink" : "loss"}
            />
          </div>

          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.buckets} barGap={2}>
                <CartesianGrid vertical={false} stroke="#DEDAD0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#4B564E" }}
                  axisLine={{ stroke: "#DEDAD0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#4B564E" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatCurrency(v).replace(".00", "")}
                  width={70}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: 8,
                    borderColor: "#DEDAD0",
                    fontSize: 13,
                  }}
                />
                {showIncome && (
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#2F6B4F"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={28}
                  />
                )}
                {showExpense && (
                  <Bar
                    dataKey="expense"
                    name="Expense"
                    fill="#A6402A"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={28}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {showIncome && (
              <CategoryBreakdown
                title="Income by category"
                tone="gain"
                items={report.categories.income}
              />
            )}
            {showExpense && (
              <CategoryBreakdown
                title="Expenses by category"
                tone="loss"
                items={report.categories.expense}
              />
            )}
          </div>
        </>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "gain" | "loss" | "ink";
}) {
  const color =
    tone === "gain" ? "text-gain" : tone === "loss" ? "text-loss" : "text-ink";
  return (
    <div>
      <p className="text-sm text-ink-soft">{label}</p>
      <p className={`mt-1 font-mono text-xl tabular ${color}`}>
        {formatSignedCurrency(value)}
      </p>
    </div>
  );
}

function CategoryBreakdown({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "gain" | "loss";
  items: { category: string; total: number; count: number }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.total));
  const barColor = tone === "gain" ? "bg-gain" : "bg-loss";

  return (
    <div>
      <h3 className="text-sm font-medium text-ink-soft">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-ink-faint">
          Nothing recorded this period.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li key={item.category}>
              <div className="flex items-center justify-between text-sm">
                <span>{item.category}</span>
                <span className="font-mono tabular text-ink-soft">
                  {formatCurrency(item.total)}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-paper">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${(item.total / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
