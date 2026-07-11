import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { requirementFilterSchema } from "@/lib/validators";

export async function GET(request: Request, { params }: { params: Promise<{ tenderId: string }> }) {
  const session = await requireAuth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenderId } = await params;
  const { searchParams } = new URL(request.url);
  const parsedFilter = requirementFilterSchema.safeParse({ status: searchParams.get("status") ?? undefined });

  if (!parsedFilter.success) {
    return NextResponse.json({ error: "Invalid filter" }, { status: 400 });
  }

  const tender = await prisma.tender.findFirst({
    where: {
      id: tenderId,
      company: {
        ownerId: session.userId,
      },
    },
    include: {
      company: {
        select: { id: true, name: true, legalForm: true },
      },
      requirements: {
        include: {
          matchedCompanyDocument: {
            select: { id: true, title: true, category: true, status: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      generatedDocs: {
        select: { id: true, title: true, requirementId: true, createdAt: true },
      },
    },
  });

  if (!tender) {
    return NextResponse.json({ error: "Tender not found" }, { status: 404 });
  }

  const filter = parsedFilter.data.status;
  const requirements =
    filter && filter !== "ALL" ? tender.requirements.filter((requirement) => requirement.status === filter) : tender.requirements;

  return NextResponse.json({
    tender: {
      id: tender.id,
      title: tender.title,
      parseStatus: tender.parseStatus,
      company: tender.company,
      createdAt: tender.createdAt,
    },
    checklist: {
      available: tender.requirements.filter((item) => item.status === "AVAILABLE").length,
      autoGeneratable: tender.requirements.filter((item) => item.status === "AUTO_GENERATABLE").length,
      missing: tender.requirements.filter((item) => item.status === "MISSING").length,
      blocked: tender.requirements.filter((item) => item.status === "BLOCKED").length,
      total: tender.requirements.length,
    },
    requirements: requirements.map((requirement) => ({
      id: requirement.id,
      key: requirement.key,
      title: requirement.title,
      details: requirement.details,
      requirementType: requirement.requirementType,
      expectedDocumentCategory: requirement.expectedDocumentCategory,
      status: requirement.status,
      reasoning: requirement.reasoning,
      canAutoGenerate: requirement.canAutoGenerate,
      matchedCompanyDocument: requirement.matchedCompanyDocument,
      generatedDocument: tender.generatedDocs.find((doc) => doc.requirementId === requirement.id) ?? null,
    })),
  });
}
