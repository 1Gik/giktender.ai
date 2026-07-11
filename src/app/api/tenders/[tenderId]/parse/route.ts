import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { parseTenderRequirements } from "@/lib/tender-parser";
import { evaluateRequirement } from "@/lib/requirement-engine";
import { parseTenderSchema } from "@/lib/validators";

async function getTenderText(input: { sourceText?: string | null; sourceStorageKey?: string | null; fallback?: string }) {
  if (input.fallback?.trim()) {
    return input.fallback.trim();
  }

  if (input.sourceText?.trim()) {
    return input.sourceText.trim();
  }

  if (input.sourceStorageKey) {
    try {
      const content = await readFile(input.sourceStorageKey, "utf8");
      return content;
    } catch {
      return "";
    }
  }

  return "";
}

export async function POST(request: Request, { params }: { params: Promise<{ tenderId: string }> }) {
  const session = await requireAuth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenderId } = await params;
  const body = await request.json().catch(() => ({}));
  const parsedPayload = parseTenderSchema.safeParse(body);

  if (!parsedPayload.success) {
    return NextResponse.json({ error: "Invalid parse payload" }, { status: 400 });
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
        include: {
          documents: true,
        },
      },
    },
  });

  if (!tender) {
    return NextResponse.json({ error: "Tender not found" }, { status: 404 });
  }

  const sourceText = await getTenderText({
    sourceText: tender.sourceText,
    sourceStorageKey: tender.sourceStorageKey,
    fallback: parsedPayload.data.rawText,
  });

  const parsedRequirements = await parseTenderRequirements(sourceText);

  await prisma.tenderRequirement.deleteMany({ where: { tenderId } });

  const created = await Promise.all(
    parsedRequirements.map((requirement) => {
      const evaluation = evaluateRequirement(requirement, tender.company.documents);

      return prisma.tenderRequirement.create({
        data: {
          tenderId,
          key: requirement.key,
          title: requirement.title,
          details: requirement.details,
          requirementType: requirement.requirementType,
          expectedDocumentCategory: requirement.expectedDocumentCategory,
          canAutoGenerate: requirement.canAutoGenerate,
          status: evaluation.status,
          matchType: evaluation.matchType,
          matchedCompanyDocumentId: evaluation.matchedCompanyDocumentId,
          reasoning: evaluation.reasoning,
        },
      });
    }),
  );

  await prisma.tender.update({
    where: { id: tenderId },
    data: {
      parseStatus: "PROCESSED",
      sourceText: sourceText || tender.sourceText,
    },
  });

  await prisma.usageRecord.create({
    data: {
      userId: session.userId,
      tenderId,
      action: "TENDER_PARSED",
      meta: {
        requirementsCount: created.length,
      },
    },
  });

  return NextResponse.json({ requirementsCount: created.length });
}
