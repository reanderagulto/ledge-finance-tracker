import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Prisma } from "@prisma/client";

// GET /api/transactions?type=INCOME|EXPENSE&from=ISO&to=ISO
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Prisma.TransactionWhereInput = { userId: user.id };
  if (type === "INCOME" || type === "EXPENSE") where.type = type;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
    });

    const serialized = transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));

    return NextResponse.json(serialized);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not load transactions." },
      { status: 500 },
    );
  }
}

// POST /api/transactions
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, amount, category, description, date } = body;

    if (type !== "INCOME" && type !== "EXPENSE") {
      return NextResponse.json(
        { error: "Type must be INCOME or EXPENSE." },
        { status: 400 },
      );
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number." },
        { status: 400 },
      );
    }
    if (!category || typeof category !== "string") {
      return NextResponse.json(
        { error: "Category is required." },
        { status: 400 },
      );
    }

    const created = await prisma.transaction.create({
      data: {
        userId: user.id,
        type,
        amount: numericAmount,
        category: category.trim(),
        description: description?.trim() || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(
      { ...created, amount: Number(created.amount) },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not create transaction." },
      { status: 500 },
    );
  }
}
