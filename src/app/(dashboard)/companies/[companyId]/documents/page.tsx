"use client";

import { FormEvent, useEffect, useState } from "react";
import { MainNav } from "@/components/main-nav";

type DocumentItem = {
  id: string;
  title: string;
  category: string;
  fileName: string;
  status: "ACTIVE" | "EXPIRING" | "EXPIRED";
  validUntil?: string | null;
};

function statusLabel(status: DocumentItem["status"]) {
  if (status === "ACTIVE") return "✅ найден";
  if (status === "EXPIRING") return "⚠ срок истекает";
  return "❌ срок истек";
}

export default function CompanyDocumentsPage({ params }: { params: Promise<{ companyId: string }> }) {
  const [companyId, setCompanyId] = useState("");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("other");
  const [file, setFile] = useState<File | null>(null);
  const [validUntil, setValidUntil] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ companyId: paramCompanyId }) => {
      setCompanyId(paramCompanyId);
    });
  }, [params]);

  const fetchDocuments = async (targetCompanyId: string) => {
    if (!targetCompanyId) {
      return;
    }

    const response = await fetch(`/api/companies/${targetCompanyId}/documents`, { cache: "no-store" });

    if (!response.ok) {
      setError("Не удалось загрузить документы компании.");
      return;
    }

    const data = (await response.json()) as DocumentItem[];
    setDocuments(data);
  };

  useEffect(() => {
    void fetchDocuments(companyId);
  }, [companyId]);

  const onUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file || !companyId) {
      setError("Выберите файл для загрузки.");
      return;
    }

    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("file", file);

    if (validUntil) {
      formData.append("validUntil", validUntil);
    }

    const response = await fetch(`/api/companies/${companyId}/documents`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setError("Не удалось загрузить документ.");
      return;
    }

    setTitle("");
    setFile(null);
    setValidUntil("");
    (event.currentTarget.elements.namedItem("file") as HTMLInputElement).value = "";
    await fetchDocuments(companyId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Документы компании</h1>
            <p className="mt-2 text-sm text-gray-600">
              База знаний компании: устав, лицензии, сертификаты, реквизиты и другие файлы.
            </p>

            <ul className="mt-4 space-y-3">
              {documents.map((document) => (
                <li key={document.id} className="rounded-lg border border-gray-200 p-4">
                  <p className="font-medium text-gray-900">{document.title}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {document.category} • {document.fileName}
                  </p>
                  <p className="mt-2 text-sm">{statusLabel(document.status)}</p>
                </li>
              ))}
              {!documents.length ? (
                <li className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600">
                  Пока нет загруженных документов.
                </li>
              ) : null}
            </ul>
          </div>

          <aside className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Загрузить документ</h2>
            <form onSubmit={onUpload} className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Название</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Категория</label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="charter">Устав</option>
                  <option value="extract">Выписка</option>
                  <option value="license">Лицензия</option>
                  <option value="certificate">Сертификат</option>
                  <option value="bank-details">Банковские реквизиты</option>
                  <option value="staff">Сотрудники</option>
                  <option value="other">Другое</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Срок действия (опционально)</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  value={validUntil}
                  onChange={(event) => setValidUntil(event.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Файл</label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  required
                />
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <button
                type="submit"
                className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                Загрузить
              </button>
            </form>
          </aside>
        </section>
      </main>
    </div>
  );
}
