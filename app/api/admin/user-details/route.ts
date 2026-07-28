import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { saveUserDetail } from "@/lib/db";
import { getUser } from "@/lib/users";

export async function POST(req: NextRequest) {
  const me = await currentUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const body = await req.json();
  const userId = String(body.userId || "").trim();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Missing userId." }, { status: 400 });
  }
  // Only allow editing real accounts, and never the admin(s).
  const target = getUser(userId);
  if (!target || target.role === "admin") {
    return NextResponse.json({ ok: false, error: "Invalid user." }, { status: 400 });
  }
  const firstName = String(body.firstName || "").trim().slice(0, 100);
  const lastName = String(body.lastName || "").trim().slice(0, 100);
  const email = String(body.email || "").trim().slice(0, 200);
  await saveUserDetail({ userId, firstName, lastName, email });
  return NextResponse.json({ ok: true });
}