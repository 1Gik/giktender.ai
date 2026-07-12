import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const session = await requireAuth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await prisma.generatedDocument.findMany({
    where: {
      company: {
        ownerId: session.userId,
      },
    },
    include: {
      company: { select: { name: true, legalForm: true } },
      tender: { select: { id: true, title: true } },
      requirement: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}
