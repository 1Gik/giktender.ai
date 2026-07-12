import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/api-auth";

export async function GET() {
  const admin = await requireAdminUser();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [tenderCreated, parsed, generated, recentActions] = await Promise.all([
    prisma.usageRecord.count({ where: { action: "TENDER_CREATED" } }),
    prisma.usageRecord.count({ where: { action: "TENDER_PARSED" } }),
    prisma.usageRecord.count({ where: { action: "DOCUMENT_GENERATED" } }),
    prisma.adminAction.findMany({
      include: {
        adminUser: { select: { email: true, fullName: true } },
        targetUser: { select: { email: true, fullName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return NextResponse.json({
    metrics: {
      tenderCreated,
      parsed,
      generated,
    },
    recentActions,
  });
}
