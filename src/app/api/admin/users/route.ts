import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/api-auth";

export async function GET() {
  const admin = await requireAdminUser();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true, startsAt: true, endsAt: true },
      },
      _count: {
        select: { usageRecords: true, companies: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
