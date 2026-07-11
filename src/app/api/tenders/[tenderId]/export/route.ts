import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET(request: Request, { params }: { params: Promise<{ tenderId: string }> }) {
  const session = await requireAuth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenderId } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  const tender = await prisma.tender.findFirst({
    where: {
      id: tenderId,
      company: {
        ownerId: session.userId,
      },
    },
    include: {
      company: {
        select: { name: true, legalForm: true },
      },
      requirements: {
        select: { key: true, title: true, status: true },
      },
      generatedDocs: {
        select: { id: true, title: true, storageKey: true, createdAt: true },
      },
    },
  });

  if (!tender) {
    return NextResponse.json({ error: "Tender not found" }, { status: 404 });
  }

  if (format === "bundle") {
    const lines = [
      `Tender: ${tender.title}`,
      `Company: ${tender.company.legalForm} ${tender.company.name}`,
      "",
      "Checklist:",
      ...tender.requirements.map((item) => `- [${item.status}] ${item.title}`),
      "",
      "Generated documents:",
      ...tender.generatedDocs.map((item) => `- ${item.title} (${item.storageKey})`),
    ];

    return new Response(lines.join("\n"), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${tender.id}-bundle.txt"`,
      },
    });
  }

  return NextResponse.json({
    tenderId: tender.id,
    documents: tender.generatedDocs,
    checklistCount: tender.requirements.length,
    bundleDownloadUrl: `/api/tenders/${tender.id}/export?format=bundle`,
    zipStatus: "MVP bundle export is provided as a single downloadable package summary.",
  });
}
