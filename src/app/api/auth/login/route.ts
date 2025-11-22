import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { comparePassword } from "@/lib/hash";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const valid = await comparePassword(password, user.password);
    if (!valid) return NextResponse.json({ error: "Invalid password" }, { status: 401 });

    const token = signToken({ id: user.id, role: user.role });

    const res = NextResponse.json({ message: "Logged in" });
    res.cookies.set("session", token, { httpOnly: true, path: "/" });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
