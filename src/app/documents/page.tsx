"use client";

import { useEffect, useState } from "react";
import { MainNav } from "@/components/main-nav";

type DocumentItem = {
  id: string;
  title: string;
  category: string;
  fileName: string;
  status: "ACTIVE" | "EXPIRING" | "EXPIRED";
  validUntil?: string | null;
  createdAt: string;
  company: { id: string; name: string; legalForm: string };
};

const statusLabel: Record<DocumentItem["status"], string> = {
  ACTIVE: "Актуальний",
  EXPIRING: "Потребує оновлення",
  EXPIRED: "Прострочений",
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/documents", { cache: "no-store" });
      if (!response.ok) {
        setError("Не вдалося завантажити документи.");
        return;
      }
      setDocuments((await response.json()) as DocumentItem[]);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      <main className="mx-auto w-full max-w-6xl space-y-4 px-4 pb-8 pt-24 lg:pl-72 lg:pr-8">
        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h1 className="text-3xl font-bold text-gray-900">Документи</h1>
          <p className="mt-2 text-sm text-gray-600">Єдиний список документів усіх компаній з контролем актуальності.</p>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <ul className="space-y-3">
            {documents.map((document) => (
              <li key={document.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold text-gray-900">{document.title}</p>
                    <p className="text-sm text-gray-600">
                      {document.company.legalForm} {document.company.name} • {document.category}
                    </p>
                  </div>
                  <span className="rounded-xl border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700">{statusLabel[document.status]}</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {document.fileName}
                  {document.validUntil ? ` • чинний до ${new Date(document.validUntil).toLocaleDateString("uk-UA")}` : ""}
                </p>
              </li>
            ))}
            {!documents.length ? <li className="rounded-2xl border border-dashed border-gray-300 p-5 text-sm text-gray-600">Документів поки немає.</li> : null}
          </ul>
        </section>
      </main>
    </div>
  );
}
