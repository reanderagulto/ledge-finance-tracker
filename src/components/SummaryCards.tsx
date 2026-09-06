import { ArrowDownRight, ArrowUpRight, Scale } from "lucide-react";
import { formatSignedCurrency } from "@/lib/format";

export function SummaryCards({
  income,
  expense,
  net,
}: {
  income: number;
  expense: number;
  net: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-line bg-paper-raised p-5 shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-soft">All-time income</span>
          <ArrowUpRight className="h-4 w-4 text-gain" strokeWidth={1.75} />
        </div>
        <p className="mt-2 font-mono text-2xl tabular text-gain">
          {formatSignedCurrency(income)}
        </p>
      </div>

      <div className="rounded-lg border border-line bg-paper-raised p-5 shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-soft">All-time expenses</span>
          <ArrowDownRight className="h-4 w-4 text-loss" strokeWidth={1.75} />
        </div>
        <p className="mt-2 font-mono text-2xl tabular text-loss">
          {formatSignedCurrency(expense)}
        </p>
      </div>

      <div className="rounded-lg border border-line bg-paper-raised p-5 shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-soft">Net balance</span>
          <Scale className="h-4 w-4 text-brass" strokeWidth={1.75} />
        </div>
        <p
          className={`mt-2 font-mono text-2xl tabular ${
            net >= 0 ? "text-ink" : "text-loss"
          }`}
        >
          {formatSignedCurrency(net)}
        </p>
      </div>
    </div>
  );
}
