import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/api-auth";
import { hasActiveSubscription } from "@/lib/subscription";

export async function GET() {
  const user = await requireCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [companies, recentTenders, activeSubscription, usage, activeTendersCount, documentsCount, documentsNeedUpdateCount, recentActions] =
    await Promise.all([
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
        take: 8,
      }),
      hasActiveSubscription(user.id),
      prisma.usageRecord.count({
        where: {
          userId: user.id,
          action: "TENDER_CREATED",
        },
      }),
      prisma.tender.count({
        where: {
          company: { ownerId: user.id },
          parseStatus: {
            in: ["PENDING", "PROCESSED"],
          },
        },
      }),
      prisma.companyDocument.count({
        where: {
          company: { ownerId: user.id },
        },
      }),
      prisma.companyDocument.count({
        where: {
          company: { ownerId: user.id },
          status: {
            in: ["EXPIRING", "EXPIRED"],
          },
        },
      }),
      prisma.usageRecord.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          action: true,
          createdAt: true,
          tender: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  const hasCompany = companies.length > 0;
  const hasDocuments = documentsCount > 0;
  const hasTenders = usage > 0;
  const hasAnalysis = recentActions.some((item) => item.action === "TENDER_PARSED");

  return NextResponse.json({
    user,
    companies,
    recentTenders,
    recentActions,
    stats: {
      companiesCount: companies.length,
      activeTendersCount,
      documentsCount,
      documentsNeedUpdateCount,
    },
    onboarding: {
      hasCompany,
      hasDocuments,
      hasTenders,
      hasAnalysis,
      completed: hasCompany && hasDocuments && hasTenders && hasAnalysis,
    },
    subscription: {
      active: activeSubscription,
    },
    usage: {
      tendersCreated: usage,
      freeTenderRemaining: usage === 0,
    },
  });
}
