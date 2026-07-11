import { AUTO_GENERATABLE_CATEGORIES, normalizeCategory } from "@/lib/domain";

type RequirementInput = {
  requirementType: "DOCUMENT" | "CERTIFICATE" | "FORM" | "OTHER";
  expectedDocumentCategory?: string | null;
  title: string;
  canAutoGenerate: boolean;
};

type CompanyDocumentInput = {
  id: string;
  title: string;
  category: string;
  status: "ACTIVE" | "EXPIRING" | "EXPIRED";
};

export function evaluateRequirement(requirement: RequirementInput, documents: CompanyDocumentInput[]) {
  const expectedCategory = requirement.expectedDocumentCategory
    ? normalizeCategory(requirement.expectedDocumentCategory)
    : normalizeCategory(requirement.title);

  const byCategory = documents.filter((document) => normalizeCategory(document.category) === expectedCategory);
  const activeByCategory = byCategory.find((document) => document.status === "ACTIVE");
  const expiringByCategory = byCategory.find((document) => document.status === "EXPIRING");

  if (activeByCategory) {
    return {
      status: "AVAILABLE" as const,
      matchType: "CATEGORY" as const,
      matchedCompanyDocumentId: activeByCategory.id,
      reasoning: `Знайдено активний документ категорії ${expectedCategory}.`,
    };
  }

  if (expiringByCategory) {
    return {
      status: "MISSING" as const,
      matchType: "CATEGORY" as const,
      matchedCompanyDocumentId: expiringByCategory.id,
      reasoning: "Документ знайдено, але строк дії скоро закінчується.",
    };
  }

  const canGenerate =
    requirement.canAutoGenerate ||
    requirement.requirementType === "CERTIFICATE" ||
    AUTO_GENERATABLE_CATEGORIES.has(expectedCategory);

  if (canGenerate) {
    return {
      status: "AUTO_GENERATABLE" as const,
      matchType: "GENERATED" as const,
      matchedCompanyDocumentId: null,
      reasoning: "Вимогу можна закрити автогенерацією довідки за шаблоном.",
    };
  }

  return {
    status: "BLOCKED" as const,
    matchType: "NONE" as const,
    matchedCompanyDocumentId: null,
    reasoning: "Потрібен ручний документ або додаткові дані компанії.",
  };
}

export function renderGeneratedDocumentContent(input: {
  companyName: string;
  legalForm: string;
  directorName?: string | null;
  requirementTitle: string;
  requirementDetails?: string | null;
}) {
  return {
    header: "ДОВІДКА",
    company: `${input.legalForm} ${input.companyName}`,
    director: input.directorName ?? "Не вказано",
    basis: input.requirementTitle,
    details: input.requirementDetails ?? "Без додаткових деталей",
    generatedAt: new Date().toISOString(),
    note: "Сформовано автоматично на основі вимоги тендера та даних профілю компанії.",
  };
}
