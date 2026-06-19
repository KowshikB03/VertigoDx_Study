import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  const me = await currentUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const { userId } = await req.json();
  const target = String(userId || "").trim();
  if (!target) {
    return NextResponse.json({ ok: false, error: "Missing userId." }, { status: 400 });
  }
  const info = await db.execute({
    sql: "DELETE FROM answers WHERE user_id = ?",
    args: [target],
  });
  return NextResponse.json({ ok: true, deleted: info.rowsAffected ?? 0 });
}