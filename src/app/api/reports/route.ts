import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import {
  Period,
  buildBuckets,
  currentRange,
  DEFAULT_BUCKET_COUNT,
} from "@/lib/reports";

const VALID_PERIODS: Period[] = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "annual",
];

// GET /api/reports?period=monthly&buckets=12&reference=ISO
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const periodParam = searchParams.get("period") as Period | null;
  const period: Period =
    periodParam && VALID_PERIODS.includes(periodParam) ? periodParam : "monthly";

  const referenceParam = searchParams.get("reference");
  const reference = referenceParam ? new Date(referenceParam) : new Date();

  const bucketCountParam = Number(searchParams.get("buckets"));
  const bucketCount =
    Number.isFinite(bucketCountParam) && bucketCountParam > 0
      ? Math.min(bucketCountParam, 36)
      : DEFAULT_BUCKET_COUNT[period];

  try {
    const buckets = buildBuckets(period, bucketCount, reference);
    const rangeStart = buckets[0].start;
    const rangeEnd = buckets[buckets.length - 1].end;

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id, date: { gte: rangeStart, lte: rangeEnd } },
      select: { type: true, amount: true, category: true, date: true },
    });

    const bucketResults = buckets.map((b) => {
      const inRange = transactions.filter(
        (t) => t.date >= b.start && t.date <= b.end
      );
      const income = inRange
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = inRange
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return {
        key: b.key,
        label: b.label,
        income,
        expense,
        net: income - expense,
      };
    });

    // Category breakdown + totals for the *current* period only
    const current = currentRange(period, reference);
    const currentTx = transactions.filter(
      (t) => t.date >= current.start && t.date <= current.end
    );

    const groupByCategory = (type: "INCOME" | "EXPENSE") => {
      const map = new Map<string, { total: number; count: number }>();
      currentTx
        .filter((t) => t.type === type)
        .forEach((t) => {
          const existing = map.get(t.category) || { total: 0, count: 0 };
          existing.total += Number(t.amount);
          existing.count += 1;
          map.set(t.category, existing);
        });
      return Array.from(map.entries())
        .map(([category, v]) => ({ category, ...v }))
        .sort((a, b) => b.total - a.total);
    };

    const totals = {
      income: currentTx
        .filter((t) => t.type === "INCOME")
        .reduce((s, t) => s + Number(t.amount), 0),
      expense: currentTx
        .filter((t) => t.type === "EXPENSE")
        .reduce((s, t) => s + Number(t.amount), 0),
      net: 0,
    };
    totals.net = totals.income - totals.expense;

    return NextResponse.json({
      period,
      range: { start: current.start.toISOString(), end: current.end.toISOString() },
      totals,
      buckets: bucketResults,
      categories: {
        income: groupByCategory("INCOME"),
        expense: groupByCategory("EXPENSE"),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not build report." },
      { status: 500 }
    );
  }
}
