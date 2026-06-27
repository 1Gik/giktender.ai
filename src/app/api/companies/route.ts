import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { createCompanySchema } from "@/lib/validators";

export async function GET() {
  const session = await requireAuth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companies = await prisma.company.findMany({
    where: { ownerId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      documents: {
        select: { id: true },
      },
    },
  });

  return NextResponse.json(
    companies.map((company) => ({
      id: company.id,
      name: company.name,
      legalForm: company.legalForm,
      taxId: company.taxId,
      directorName: company.directorName,
      documentsCount: company.documents.length,
      createdAt: company.createdAt,
    })),
  );
}

export async function POST(request: Request) {
  const session = await requireAuth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createCompanySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid company payload" }, { status: 400 });
  }

  const company = await prisma.company.create({
    data: {
      ownerId: session.userId,
      ...parsed.data,
    },
  });

  return NextResponse.json(company, { status: 201 });
}
