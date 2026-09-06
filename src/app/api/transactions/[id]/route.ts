import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// DELETE /api/transactions/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    // Scoping the delete to userId ensures a user can only ever delete their own entries.
    const { count } = await prisma.transaction.deleteMany({
      where: { id, userId: user.id },
    });
    if (count === 0) {
      return NextResponse.json(
        { error: "Entry not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not delete transaction." },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Scoping the update to userId ensures a user can only ever edit their own entries.
    const { count } = await prisma.transaction.updateMany({
      where: { id, userId: user.id },
      data: {
        ...(type && { type }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(category && { category: category.trim() }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
        ...(date && { date: new Date(date) }),
      },
    });

    if (count === 0) {
      return NextResponse.json(
        { error: "Entry not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.transaction.findUnique({ where: { id } });
    return NextResponse.json({
      ...updated,
      amount: updated ? Number(updated.amount) : null,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not update transaction." },
      { status: 500 }
    );
  }
}
