import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createCompanySchema = z.object({
  name: z.string().min(2),
  legalForm: z.string().min(2),
  taxId: z.string().optional(),
  registrationCode: z.string().optional(),
  address: z.string().optional(),
  bankDetails: z.string().optional(),
  directorName: z.string().optional(),
  directorPosition: z.string().optional(),
});

export const createTenderSchema = z.object({
  companyId: z.string().min(1),
  title: z.string().min(2),
  sourceType: z.enum(["PDF", "TEXT"]),
  sourceText: z.string().optional(),
});

export const parseTenderSchema = z.object({
  rawText: z.string().min(10).optional(),
});

export const requirementFilterSchema = z.object({
  status: z.enum(["AVAILABLE", "AUTO_GENERATABLE", "MISSING", "BLOCKED", "ALL"]).optional(),
});

export const generateDocumentSchema = z.object({
  requirementId: z.string().min(1),
});

export const adminSubscriptionSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
});
