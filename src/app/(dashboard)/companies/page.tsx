"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { MainNav } from "@/components/main-nav";

type Company = {
  id: string;
  name: string;
  legalForm: string;
  taxId?: string | null;
  directorName?: string | null;
  documentsCount: number;
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [legalForm, setLegalForm] = useState("ООО");

  const fetchCompanies = async () => {
    setLoading(true);
    setError("");

    const response = await fetch("/api/companies", { cache: "no-store" });

    if (!response.ok) {
      setError("Нужно авторизоваться для работы с компаниями.");
      setLoading(false);
      return;
    }

    const data = (await response.json()) as Company[];
    setCompanies(data);
    setLoading(false);
  };

  useEffect(() => {
    void fetchCompanies();
  }, []);

  const onCreateCompany = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, legalForm }),
    });

    if (!response.ok) {
      setError("Не удалось создать компанию.");
      return;
    }

    setName("");
    await fetchCompanies();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Компании</h1>
            <p className="mt-2 text-sm text-gray-600">Каждая компания имеет отдельный пакет документов и историю тендеров.</p>

            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

            {loading ? <p className="mt-6 text-sm text-gray-600">Загрузка...</p> : null}

            <ul className="mt-4 space-y-3">
              {companies.map((company) => (
                <li key={company.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-medium text-gray-900">
                        {company.legalForm} {company.name}
                      </h2>
                      <p className="text-sm text-gray-600">
                        Документов: {company.documentsCount}
                        {company.directorName ? ` • Директор: ${company.directorName}` : ""}
                      </p>
                    </div>
                    <Link
                      href={`/companies/${company.id}/documents`}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
                    >
                      Документы
                    </Link>
                  </div>
                </li>
              ))}
              {!loading && !companies.length ? (
                <li className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600">
                  Пока нет компаний. Создайте первую в форме справа.
                </li>
              ) : null}
            </ul>
          </div>

          <aside className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Новая компания</h2>
            <form onSubmit={onCreateCompany} className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Название</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Форма</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  value={legalForm}
                  onChange={(event) => setLegalForm(event.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                Создать
              </button>
            </form>
          </aside>
        </section>
      </main>
    </div>
  );
}
