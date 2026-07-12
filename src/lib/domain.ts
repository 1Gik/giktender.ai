export const AUTO_GENERATABLE_CATEGORIES = new Set(["certificate", "staff", "bank-details"]);

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  charter: ["устав", "статут"],
  extract: ["витяг", "выписка", "єдр", "егр"],
  license: ["ліценз", "лиценз"],
  certificate: ["довід", "справк", "сертиф"],
  "bank-details": ["банків", "реквизит", "iban"],
  staff: ["працівн", "сотрудник", "персонал"],
};

export function normalizeCategory(input: string) {
  const value = input.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => value.includes(keyword))) {
      return category;
    }
  }

  return "other";
}

export function guessRequirementType(input: string) {
  const value = input.toLowerCase();

  if (value.includes("довід") || value.includes("справк") || value.includes("сертиф")) {
    return "CERTIFICATE" as const;
  }

  if (value.includes("форма") || value.includes("таблиц") || value.includes("додат")) {
    return "FORM" as const;
  }

  if (value.includes("документ") || value.includes("копі") || value.includes("копи")) {
    return "DOCUMENT" as const;
  }

  return "OTHER" as const;
}
