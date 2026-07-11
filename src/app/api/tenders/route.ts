import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canCreateTender } from "@/lib/subscription";
import { createTenderSchema } from "@/lib/validators";

export async function GET() {
  const session = await requireAuth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenders = await prisma.tender.findMany({
    where: {
      company: {
        ownerId: session.userId,
      },
    },
    include: {
      company: {
        select: { id: true, name: true, legalForm: true },
      },
      requirements: {
        select: { id: true, status: true },
      },
      generatedDocs: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    tenders.map((tender) => ({
      id: tender.id,
      title: tender.title,
      sourceType: tender.sourceType,
      sourceFileName: tender.sourceFileName,
      parseStatus: tender.parseStatus,
      createdAt: tender.createdAt,
      company: tender.company,
      isFreeTender: tender.isFreeTender,
      requirementsCount: tender.requirements.length,
      generatedCount: tender.generatedDocs.length,
      checklist: {
        available: tender.requirements.filter((item) => item.status === "AVAILABLE").length,
        autoGeneratable: tender.requirements.filter((item) => item.status === "AUTO_GENERATABLE").length,
        missing: tender.requirements.filter((item) => item.status === "MISSING").length,
        blocked: tender.requirements.filter((item) => item.status === "BLOCKED").length,
      },
    })),
  );
}

export async function POST(request: Request) {
  const session = await requireAuth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createTenderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid tender payload" }, { status: 400 });
  }

  const company = await prisma.company.findFirst({
    where: {
      id: parsed.data.companyId,
      ownerId: session.userId,
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const subscriptionCheck = await canCreateTender(session.userId);

  if (!subscriptionCheck.allowed) {
    return NextResponse.json(
      {
        error: "Subscription required after first free tender",
        code: "SUBSCRIPTION_REQUIRED",
      },
      { status: 402 },
    );
  }

  const tender = await prisma.tender.create({
    data: {
      companyId: company.id,
      createdByUserId: session.userId,
      title: parsed.data.title,
      sourceType: parsed.data.sourceType,
      sourceText: parsed.data.sourceType === "TEXT" ? parsed.data.sourceText ?? "" : null,
      isFreeTender: subscriptionCheck.isFree,
    },
  });

  await prisma.usageRecord.create({
    data: {
      userId: session.userId,
      tenderId: tender.id,
      action: "TENDER_CREATED",
      meta: {
        companyId: company.id,
        sourceType: parsed.data.sourceType,
        isFreeTender: subscriptionCheck.isFree,
      },
    },
  });

  return NextResponse.json(tender, { status: 201 });
}
