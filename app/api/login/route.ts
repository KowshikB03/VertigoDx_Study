import { NextRequest, NextResponse } from "next/server";
import { findUser } from "@/lib/users";
import { setSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { id, password } = await req.json();
  const user = findUser(String(id || "").trim(), String(password || ""));

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Invalid ID or password." },
      { status: 401 }
    );
  }

  await setSession(user.id);
  return NextResponse.json({
    ok: true,
    role: user.role,
    redirect: user.role === "admin" ? "/admin" : "/study",
  });
}
