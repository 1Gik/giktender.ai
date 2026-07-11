import { guessRequirementType, normalizeCategory } from "@/lib/domain";

type ParsedRequirement = {
  key: string;
  title: string;
  details?: string;
  requirementType: "DOCUMENT" | "CERTIFICATE" | "FORM" | "OTHER";
  expectedDocumentCategory?: string;
  canAutoGenerate: boolean;
};

function buildRequirement(line: string, index: number): ParsedRequirement {
  const normalized = line.replace(/^[-•\d.)\s]+/, "").trim();
  const category = normalizeCategory(normalized);
  const type = guessRequirementType(normalized);
  const canAutoGenerate = type === "CERTIFICATE" || category === "certificate";

  return {
    key: `req-${index + 1}`,
    title: normalized.slice(0, 160),
    details: normalized,
    requirementType: type,
    expectedDocumentCategory: category === "other" ? undefined : category,
    canAutoGenerate,
  };
}

function parseWithHeuristics(text: string) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 8);

  const scoped = lines.slice(0, 25).map((line, index) => buildRequirement(line, index));

  return scoped.length
    ? scoped
    : [
        buildRequirement("Надати установчі документи компанії", 0),
        buildRequirement("Довідка про відсутність підстав для відмови", 1),
      ];
}

async function parseWithOpenAI(text: string): Promise<ParsedRequirement[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const authHeader = ["Bearer", apiKey].join(" ");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Extract tender requirements into strict JSON. Return {requirements:[{key,title,details,requirementType,expectedDocumentCategory,canAutoGenerate}]}. Use requirementType in DOCUMENT|CERTIFICATE|FORM|OTHER.",
        },
        {
          role: "user",
          content: text.slice(0, 12000),
        },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    return null;
  }

  try {
    const parsed = JSON.parse(content) as { requirements?: ParsedRequirement[] };
    if (!Array.isArray(parsed.requirements) || parsed.requirements.length === 0) {
      return null;
    }

    return parsed.requirements
      .map((req, index) => ({
        key: req.key || `req-${index + 1}`,
        title: req.title || req.details || `Requirement ${index + 1}`,
        details: req.details,
        requirementType: req.requirementType ?? guessRequirementType(req.title || req.details || ""),
        expectedDocumentCategory: req.expectedDocumentCategory
          ? normalizeCategory(req.expectedDocumentCategory)
          : normalizeCategory(req.title || req.details || ""),
        canAutoGenerate: Boolean(req.canAutoGenerate),
      }))
      .slice(0, 100);
  } catch {
    return null;
  }
}

export async function parseTenderRequirements(text: string) {
  const trimmed = text.trim();

  if (!trimmed) {
    return parseWithHeuristics("Пустий тендерний документ");
  }

  const fromAi = await parseWithOpenAI(trimmed);

  if (fromAi?.length) {
    return fromAi;
  }

  return parseWithHeuristics(trimmed);
}
