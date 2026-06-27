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
