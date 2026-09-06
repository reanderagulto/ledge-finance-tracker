import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Dashboard } from "@/components/Dashboard";
import type { Transaction } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already guards this route, but redirect defensively in case
  // this page is ever reached without a session (e.g. direct server fetch).
  if (!user) {
    redirect("/login");
  }

  let initialTransactions: Transaction[] = [];

  try {
    const rows = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 500,
    });
    initialTransactions = rows.map((t) => ({
      ...t,
      amount: Number(t.amount),
      date: t.date.toISOString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));
  } catch (err) {
    // Database may not be configured yet — the UI still renders with an empty ledger.
    console.error("Failed to load transactions:", err);
  }

  return (
    <Dashboard initialTransactions={initialTransactions} userEmail={user.email ?? ""} />
  );
}
