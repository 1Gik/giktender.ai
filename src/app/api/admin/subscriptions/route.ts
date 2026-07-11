import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/api-auth";
import { adminSubscriptionSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const admin = await requireAdminUser();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = adminSubscriptionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data;

  const subscription = await prisma.subscription.create({
    data: {
      userId: data.userId,
      status: data.status,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      activatedByAdminId: admin.id,
      notes: data.notes,
    },
  });

  await prisma.adminAction.create({
    data: {
      adminUserId: admin.id,
      targetUserId: data.userId,
      action: "SUBSCRIPTION_UPDATED",
      details: {
        status: data.status,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
      },
    },
  });

  return NextResponse.json(subscription, { status: 201 });
}
