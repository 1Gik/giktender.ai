import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { storeUploadedFile } from "@/lib/storage";

export async function POST(request: Request, { params }: { params: Promise<{ tenderId: string }> }) {
  const session = await requireAuth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenderId } = await params;

  const tender = await prisma.tender.findFirst({
    where: {
      id: tenderId,
      company: {
        ownerId: session.userId,
      },
    },
  });

  if (!tender) {
    return NextResponse.json({ error: "Tender not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const stored = await storeUploadedFile({
    namespace: "tenders",
    entityId: tenderId,
    file,
  });

  const updated = await prisma.tender.update({
    where: { id: tenderId },
    data: {
      sourceType: "PDF",
      sourceFileName: stored.fileName,
      sourceStorageProvider: stored.storageProvider,
      sourceStorageKey: stored.storageKey,
      parseStatus: "PENDING",
    },
  });

  return NextResponse.json(updated);
}
