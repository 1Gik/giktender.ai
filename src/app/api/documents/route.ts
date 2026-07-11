import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const session = await requireAuth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await prisma.companyDocument.findMany({
    where: {
      company: {
        ownerId: session.userId,
      },
    },
    select: {
      id: true,
      title: true,
      category: true,
      fileName: true,
      status: true,
      validUntil: true,
      createdAt: true,
      company: {
        select: {
          id: true,
          name: true,
          legalForm: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}
