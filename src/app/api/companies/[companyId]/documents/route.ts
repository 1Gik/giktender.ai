import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

function getDocumentStatus(validUntil: Date | null) {
  if (!validUntil) {
    return "ACTIVE" as const;
  }

  const now = new Date();
  const warningDate = new Date();
  warningDate.setDate(now.getDate() + 30);

  if (validUntil < now) {
    return "EXPIRED" as const;
  }

  if (validUntil <= warningDate) {
    return "EXPIRING" as const;
  }

  return "ACTIVE" as const;
}

export async function GET(_: Request, { params }: { params: Promise<{ companyId: string }> }) {
  const session = await requireAuth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { companyId } = await params;

  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
      ownerId: session.userId,
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const documents = await prisma.companyDocument.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}

export async function POST(request: Request, { params }: { params: Promise<{ companyId: string }> }) {
  const session = await requireAuth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { companyId } = await params;

  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
      ownerId: session.userId,
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const title = String(formData.get("title") ?? "");
  const category = String(formData.get("category") ?? "other");
  const validUntilRaw = String(formData.get("validUntil") ?? "");

  if (!(file instanceof File) || !title.trim()) {
    return NextResponse.json({ error: "title and file are required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const targetDir = join("/tmp", "giktender-uploads", companyId);
  const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const storageKey = join(targetDir, safeFilename);

  await mkdir(targetDir, { recursive: true });
  await writeFile(storageKey, buffer);

  const validUntil = validUntilRaw ? new Date(validUntilRaw) : null;
  const status = getDocumentStatus(validUntil);

  const document = await prisma.companyDocument.create({
    data: {
      companyId,
      title: title.trim(),
      category,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      storageProvider: "local_tmp",
      storageKey,
      validUntil,
      status,
    },
  });

  return NextResponse.json(document, { status: 201 });
}
