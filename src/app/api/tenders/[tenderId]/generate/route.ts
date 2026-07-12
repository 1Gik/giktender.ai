import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { renderGeneratedDocumentContent } from "@/lib/requirement-engine";
import { storeJsonArtifact } from "@/lib/storage";
import { generateDocumentSchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: Promise<{ tenderId: string }> }) {
  const session = await requireAuth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenderId } = await params;
  const body = await request.json();
  const parsed = generateDocumentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const tender = await prisma.tender.findFirst({
    where: {
      id: tenderId,
      company: {
        ownerId: session.userId,
      },
    },
    include: {
      company: true,
    },
  });

  if (!tender) {
    return NextResponse.json({ error: "Tender not found" }, { status: 404 });
  }

  const requirement = await prisma.tenderRequirement.findFirst({
    where: {
      id: parsed.data.requirementId,
      tenderId,
    },
  });

  if (!requirement) {
    return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
  }

  if (requirement.status !== "AUTO_GENERATABLE") {
    return NextResponse.json({ error: "Requirement cannot be auto-generated" }, { status: 400 });
  }

  const content = renderGeneratedDocumentContent({
    companyName: tender.company.name,
    legalForm: tender.company.legalForm,
    directorName: tender.company.directorName,
    requirementTitle: requirement.title,
    requirementDetails: requirement.details,
  });

  const stored = await storeJsonArtifact({
    namespace: "generated",
    entityId: tenderId,
    fileName: `${requirement.key}.json`,
    content,
  });

  const generated = await prisma.generatedDocument.create({
    data: {
      companyId: tender.companyId,
      tenderId,
      requirementId: requirement.id,
      title: `Довідка: ${requirement.title}`,
      type: requirement.requirementType === "FORM" ? "FORM" : "CERTIFICATE",
      templateKey: requirement.requirementType === "FORM" ? "form-standard" : "certificate-standard",
      sourceRequirementText: requirement.details ?? requirement.title,
      contentJson: content,
      storageProvider: stored.storageProvider,
      storageKey: stored.storageKey,
      mimeType: stored.mimeType,
      generatedByUserId: session.userId,
    },
  });

  await prisma.usageRecord.create({
    data: {
      userId: session.userId,
      tenderId,
      action: "DOCUMENT_GENERATED",
      meta: {
        requirementId: requirement.id,
        generatedDocumentId: generated.id,
      },
    },
  });

  return NextResponse.json(generated, { status: 201 });
}
