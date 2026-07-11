import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/api-auth";
import { hasActiveSubscription } from "@/lib/subscription";

export async function GET() {
  const user = await requireCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [companies, recentTenders, activeSubscription, usage] = await Promise.all([
    prisma.company.findMany({
      where: { ownerId: user.id },
      select: {
        id: true,
        name: true,
        legalForm: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.tender.findMany({
      where: {
        company: { ownerId: user.id },
      },
      select: {
        id: true,
        title: true,
        parseStatus: true,
        createdAt: true,
        company: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    hasActiveSubscription(user.id),
    prisma.usageRecord.count({
      where: {
        userId: user.id,
        action: "TENDER_CREATED",
      },
    }),
  ]);

  return NextResponse.json({
    user,
    companies,
    recentTenders,
    subscription: {
      active: activeSubscription,
    },
    usage: {
      tendersCreated: usage,
      freeTenderRemaining: usage === 0,
    },
  });
}
