import { prisma } from "@/lib/prisma";

export async function hasActiveSubscription(userId: string) {
  const now = new Date();

  const active = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
    orderBy: { createdAt: "desc" },
  });

  return Boolean(active);
}

export async function getTenderUsageCount(userId: string) {
  return prisma.usageRecord.count({
    where: {
      userId,
      action: "TENDER_CREATED",
    },
  });
}

export async function canCreateTender(userId: string) {
  const usageCount = await getTenderUsageCount(userId);

  if (usageCount === 0) {
    return { allowed: true, isFree: true };
  }

  const subscribed = await hasActiveSubscription(userId);

  return { allowed: subscribed, isFree: false };
}
