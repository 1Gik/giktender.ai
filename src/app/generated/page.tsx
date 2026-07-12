"use client";

import { useEffect, useState } from "react";
import { MainNav } from "@/components/main-nav";

type GeneratedDoc = {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  storageKey: string;
  company: { name: string; legalForm: string };
  tender: { id: string; title: string };
  requirement?: { title: string } | null;
};

export default function GeneratedPage() {
  const [docs, setDocs] = useState<GeneratedDoc[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/generated", { cache: "no-store" });
      if (!response.ok) {
        setError("Failed to load generated documents.");
        return;
      }
      setDocs((await response.json()) as GeneratedDoc[]);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h1 className="text-2xl font-semibold">Generated documents</h1>
          <p className="mt-2 text-sm text-gray-600">Auto-generated dovidky/forms mapped to tender requirements.</p>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

          <ul className="mt-4 space-y-3">
            {docs.map((doc) => (
              <li key={doc.id} className="rounded-lg border border-gray-200 p-4">
                <p className="font-medium">{doc.title}</p>
                <p className="text-sm text-gray-600">
                  {doc.company.legalForm} {doc.company.name} · {doc.tender.title}
                </p>
                <p className="text-xs text-gray-500">
                  {doc.type} · {new Date(doc.createdAt).toLocaleString()} · {doc.storageKey}
                </p>
              </li>
            ))}
            {!docs.length ? <li className="text-sm text-gray-500">No generated documents yet.</li> : null}
          </ul>
        </section>
      </main>
    </div>
  );
}
