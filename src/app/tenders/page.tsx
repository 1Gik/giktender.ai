"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { MainNav } from "@/components/main-nav";

type Company = { id: string; name: string; legalForm: string };

type Tender = {
  id: string;
  title: string;
  company: { id: string; name: string; legalForm: string };
  parseStatus: string;
  checklist: { available: number; autoGeneratable: number; missing: number; blocked: number };
  isFreeTender: boolean;
};

type Requirement = {
  id: string;
  key: string;
  title: string;
  details?: string;
  status: "AVAILABLE" | "AUTO_GENERATABLE" | "MISSING" | "BLOCKED";
  reasoning?: string;
  generatedDocument?: { id: string; title: string } | null;
};

type ChecklistPayload = {
  tender: { id: string; title: string; parseStatus: string };
  checklist: { available: number; autoGeneratable: number; missing: number; blocked: number; total: number };
  requirements: Requirement[];
};

const statusBadge: Record<Requirement["status"], string> = {
  AVAILABLE: "✅ Available",
  AUTO_GENERATABLE: "🤖 Auto-generate",
  MISSING: "⚠ Missing",
  BLOCKED: "❌ Blocked",
};

export default function TendersPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [checklist, setChecklist] = useState<ChecklistPayload | null>(null);
  const [selectedTenderId, setSelectedTenderId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");

  const selectedTender = useMemo(() => tenders.find((tender) => tender.id === selectedTenderId) ?? null, [tenders, selectedTenderId]);

  const fetchCompanies = async () => {
    const response = await fetch("/api/companies", { cache: "no-store" });
    if (!response.ok) {
      setError("Failed to load companies.");
      return;
    }
    const data = (await response.json()) as Company[];
    setCompanies(data);
    if (!companyId && data[0]) {
      setCompanyId(data[0].id);
    }
  };

  const fetchTenders = async () => {
    const response = await fetch("/api/tenders", { cache: "no-store" });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "Failed to load tenders.");
      return;
    }
    const data = (await response.json()) as Tender[];
    setTenders(data);
    if (!selectedTenderId && data[0]) {
      setSelectedTenderId(data[0].id);
    }
  };

  const fetchChecklist = async (tenderId: string, nextFilter = filter) => {
    if (!tenderId) return;
    const response = await fetch(`/api/tenders/${tenderId}/checklist?status=${nextFilter}`, { cache: "no-store" });
    if (!response.ok) {
      setChecklist(null);
      return;
    }
    setChecklist((await response.json()) as ChecklistPayload);
  };

  useEffect(() => {
    void fetchCompanies();
    void fetchTenders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void fetchChecklist(selectedTenderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTenderId]);

  const onCreateTender = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/tenders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        title,
        sourceType: "TEXT",
        sourceText: rawText,
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "Failed to create tender.");
      return;
    }

    const created = (await response.json()) as { id: string };
    setTitle("");
    await fetchTenders();
    setSelectedTenderId(created.id);
  };

  const onParse = async () => {
    if (!selectedTenderId) return;
    const response = await fetch(`/api/tenders/${selectedTenderId}/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText }),
    });

    if (!response.ok) {
      setError("Failed to parse tender requirements.");
      return;
    }

    await fetchTenders();
    await fetchChecklist(selectedTenderId);
  };

  const onGenerate = async (requirementId: string) => {
    if (!selectedTenderId) return;
    const response = await fetch(`/api/tenders/${selectedTenderId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requirementId }),
    });

    if (!response.ok) {
      setError("Failed to generate document.");
      return;
    }

    await fetchChecklist(selectedTenderId);
    await fetchTenders();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 space-y-4">
        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h1 className="text-2xl font-semibold">Tender workspace</h1>
            <p className="mt-2 text-sm text-gray-600">Upload/parse tender text, map requirements, and generate certificates.</p>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

            <ul className="mt-4 space-y-2">
              {tenders.map((tender) => (
                <li key={tender.id} className="rounded border border-gray-200 p-3">
                  <button type="button" className="w-full text-left" onClick={() => setSelectedTenderId(tender.id)}>
                    <p className="font-medium">{tender.title}</p>
                    <p className="text-xs text-gray-500">
                      {tender.company.name} · {tender.parseStatus} · free: {tender.isFreeTender ? "yes" : "no"}
                    </p>
                    <p className="text-xs text-gray-500">
                      ✅ {tender.checklist.available} · 🤖 {tender.checklist.autoGeneratable} · ⚠ {tender.checklist.missing} · ❌ {tender.checklist.blocked}
                    </p>
                  </button>
                </li>
              ))}
              {!tenders.length ? <li className="text-sm text-gray-500">No tenders yet.</li> : null}
            </ul>
          </div>

          <aside className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-lg font-semibold">Create tender</h2>
            <form className="mt-4 space-y-3" onSubmit={onCreateTender}>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={companyId}
                onChange={(event) => setCompanyId(event.target.value)}
                required
              >
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.legalForm} {company.name}
                  </option>
                ))}
              </select>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Tender title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
              <textarea
                className="min-h-28 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Paste tender requirement text or extracted text from PDF"
                value={rawText}
                onChange={(event) => setRawText(event.target.value)}
              />
              <button type="submit" className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">
                Create tender
              </button>
              <button
                type="button"
                onClick={onParse}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
                disabled={!selectedTenderId}
              >
                Parse selected tender
              </button>
            </form>
          </aside>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Requirements checklist</h2>
            <div className="flex gap-2">
              <select
                className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                value={filter}
                onChange={async (event) => {
                  const nextFilter = event.target.value;
                  setFilter(nextFilter);
                  await fetchChecklist(selectedTenderId, nextFilter);
                }}
              >
                <option value="ALL">All</option>
                <option value="AVAILABLE">Available</option>
                <option value="AUTO_GENERATABLE">Auto-generatable</option>
                <option value="MISSING">Missing</option>
                <option value="BLOCKED">Blocked</option>
              </select>
              {selectedTender ? (
                <a
                  href={`/api/tenders/${selectedTender.id}/export?format=bundle`}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
                >
                  Export package
                </a>
              ) : null}
            </div>
          </div>

          {checklist ? (
            <p className="mt-2 text-sm text-gray-600">
              Total: {checklist.checklist.total} · ✅ {checklist.checklist.available} · 🤖 {checklist.checklist.autoGeneratable} · ⚠ {checklist.checklist.missing} · ❌ {checklist.checklist.blocked}
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">Select and parse a tender to see checklist.</p>
          )}

          <ul className="mt-4 space-y-2">
            {checklist?.requirements.map((requirement) => (
              <li key={requirement.id} className="rounded border border-gray-200 p-3">
                <p className="font-medium text-gray-900">{requirement.title}</p>
                <p className="text-sm text-gray-600">{statusBadge[requirement.status]}</p>
                {requirement.reasoning ? <p className="text-xs text-gray-500 mt-1">{requirement.reasoning}</p> : null}
                {requirement.generatedDocument ? (
                  <p className="text-xs text-green-700 mt-1">Generated: {requirement.generatedDocument.title}</p>
                ) : null}
                {requirement.status === "AUTO_GENERATABLE" && !requirement.generatedDocument ? (
                  <button
                    type="button"
                    className="mt-2 rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white hover:bg-gray-700"
                    onClick={() => onGenerate(requirement.id)}
                  >
                    Generate certificate
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
